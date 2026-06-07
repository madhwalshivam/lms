import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useTheme, useAppSelector } from '../hooks';
import { Card } from '../components/Card';
import { CustomButton } from '../components/CustomButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ReportService } from '../services/reportService';
import { SALES_EXECUTIVES } from '../constants';

export const AnalyticsScreen: React.FC = () => {
  const { colors, typography, borderRadius } = useTheme();
  const leads = useAppSelector(state => state.leads.leads);

  const [refreshing, setRefreshing] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Dynamic computations from the active Leads store
  const analyticsData = useMemo(() => {
    const total = leads.length;
    const converted = leads.filter(l => l.leadStatus === 'Converted').length;
    const conversionRate = total ? ((converted / total) * 100).toFixed(1) : '0';

    // 1. Source Breakdown
    const sources = {
      Website: leads.filter(l => l.leadSource === 'Website').length,
      Facebook: leads.filter(l => l.leadSource === 'Facebook Ads').length,
      Instagram: leads.filter(l => l.leadSource === 'Instagram Ads').length,
      Google: leads.filter(l => l.leadSource === 'Google Ads').length,
    };

    // Find top source
    let topSource = 'Website';
    let maxVal = 0;
    Object.entries(sources).forEach(([src, val]) => {
      if (val > maxVal) {
        maxVal = val;
        topSource = src;
      }
    });

    // 2. Executive Performance calculation
    const execPerformance = SALES_EXECUTIVES.map(exec => {
      const execLeads = leads.filter(l => l.assignedExecutive === exec);
      const execTotal = execLeads.length;
      const execConverted = execLeads.filter(l => l.leadStatus === 'Converted').length;
      const rate = execTotal ? Math.round((execConverted / execTotal) * 100) : 0;
      
      return {
        name: exec,
        total: execTotal,
        converted: execConverted,
        rate
      };
    }).sort((a, b) => b.rate - a.rate); // Sort by conversion rate descending

    // 3. Leads by Destination (Travel Demand)
    const destCounts: Record<string, number> = {};
    leads.forEach(l => {
      destCounts[l.destination] = (destCounts[l.destination] || 0) + 1;
    });
    const popularDestinations = Object.entries(destCounts)
      .map(([name, count]) => ({ name, count, pct: total ? Math.round((count / total) * 100) : 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    return {
      total,
      converted,
      conversionRate,
      topSource,
      sources,
      execPerformance,
      popularDestinations
    };
  }, [leads]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleExport = async (type: 'pdf' | 'excel') => {
    setExportLoading(true);
    try {
      if (type === 'excel') {
        const result = await ReportService.exportToExcel(leads);
        if (result.success) {
          Alert.alert('Success', `Excel file exported successfully: ${result.filename}`);
        }
      } else {
        const result = await ReportService.exportToPDF(leads);
        if (result.success) {
          Alert.alert('Success', `PDF file generated successfully: ${result.filename}`);
        }
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to generate report.');
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text, fontSize: typography.fontSizes.md }]}>
          CRM Analytics
        </Text>
        <TouchableOpacity
          style={[styles.exportTopBtn, { borderColor: colors.border }]}
          onPress={() => {
            Alert.alert(
              'Export Dataset',
              'Choose export layout format:',
              [
                { text: 'Excel (CSV)', onPress: () => handleExport('excel') },
                { text: 'PDF Document', onPress: () => handleExport('pdf') },
                { text: 'Cancel', style: 'cancel' }
              ]
            );
          }}
        >
          <MaterialCommunityIcons name="cloud-download-outline" size={20} color={colors.primary} />
          <Text style={[styles.exportTopText, { color: colors.primary, fontSize: typography.fontSizes.xs }]}>Export</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
        }
      >
        {/* KPI Panel */}
        <View style={styles.kpiGrid}>
          <Card style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <MaterialCommunityIcons name="account-group-outline" size={20} color={colors.primary} />
              <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Total Volume</Text>
            </View>
            <Text style={[styles.kpiValue, { color: colors.text }]}>{analyticsData.total}</Text>
          </Card>

          <Card style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <MaterialCommunityIcons name="percent-outline" size={20} color={colors.success} />
              <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Conv. Rate</Text>
            </View>
            <Text style={[styles.kpiValue, { color: colors.text }]}>{analyticsData.conversionRate}%</Text>
          </Card>

          <Card style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <MaterialCommunityIcons name="clock-fast" size={20} color={colors.info} />
              <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Response Time</Text>
            </View>
            <Text style={[styles.kpiValue, { color: colors.text }]}>1.8 hrs</Text>
          </Card>

          <Card style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <MaterialCommunityIcons name="bullseye-arrow" size={20} color={colors.warning} />
              <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Top Channel</Text>
            </View>
            <Text style={[styles.kpiValue, { color: colors.text, fontSize: 13, marginTop: 8 }]} numberOfLines={1}>
              {analyticsData.topSource}
            </Text>
          </Card>
        </View>

        {/* Lead Source Breakdown Chart */}
        <Card style={styles.chartCard}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Leads by Channel Source</Text>
          <View style={styles.sourceChart}>
            {[
              { name: 'Website', count: analyticsData.sources.Website, color: colors.primary },
              { name: 'Facebook Ads', count: analyticsData.sources.Facebook, color: '#1A73E8' },
              { name: 'Instagram Ads', count: analyticsData.sources.Instagram, color: '#D93025' },
              { name: 'Google Ads', count: analyticsData.sources.Google, color: '#137333' }
            ].map(src => {
              const maxCount = Math.max(
                analyticsData.sources.Website,
                analyticsData.sources.Facebook,
                analyticsData.sources.Instagram,
                analyticsData.sources.Google,
                1
              );
              const barHeight = Math.max(10, (src.count / maxCount) * 120);

              return (
                <View key={src.name} style={styles.chartCol}>
                  <View style={styles.barContainer}>
                    <Text style={[styles.barValueText, { color: colors.text }]}>{src.count}</Text>
                    <View style={[styles.barFill, { height: barHeight, backgroundColor: src.color, borderRadius: borderRadius.sm }]} />
                  </View>
                  <Text style={[styles.barLabelText, { color: colors.textSecondary }]} numberOfLines={1}>
                    {src.name.split(' ')[0]}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Top Destination Demand */}
        <Card style={styles.chartCard}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Top Travel Destinations</Text>
          <Text style={[styles.cardSubTitle, { color: colors.textSecondary }]}>Most inquired packages</Text>
          <View style={styles.destList}>
            {analyticsData.popularDestinations.map(dest => (
              <View key={dest.name} style={styles.destRow}>
                <View style={styles.destLabelCol}>
                  <Text style={[styles.destName, { color: colors.text }]}>{dest.name}</Text>
                  <Text style={[styles.destCount, { color: colors.textSecondary }]}>{dest.count} leads</Text>
                </View>
                <View style={styles.destProgressCol}>
                  <View style={[styles.destProgressBg, { backgroundColor: colors.border }]}>
                    <View style={[styles.destProgressFill, { width: `${dest.pct}%`, backgroundColor: colors.primary }]} />
                  </View>
                  <Text style={[styles.destPct, { color: colors.text }]}>{dest.pct}%</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Executive Leaderboard */}
        <Card style={styles.chartCard}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Agent Leaderboard</Text>
          <Text style={[styles.cardSubTitle, { color: colors.textSecondary }]}>Ranked by conversion rate success</Text>
          <View style={styles.leaderboard}>
            {analyticsData.execPerformance.map((exec, idx) => (
              <View key={exec.name} style={[styles.execRow, { borderBottomColor: colors.border }]}>
                <View style={styles.execRankBlock}>
                  <View style={[
                    styles.rankBadge,
                    { 
                      backgroundColor: idx === 0 ? colors.warningLight : idx === 1 ? colors.infoLight : colors.accent,
                    }
                  ]}>
                    <Text style={{ 
                      color: idx === 0 ? colors.warning : idx === 1 ? colors.info : colors.textSecondary,
                      fontWeight: 'bold',
                      fontSize: 12
                    }}>
                      #{idx + 1}
                    </Text>
                  </View>
                  <View>
                    <Text style={[styles.execNameText, { color: colors.text }]}>{exec.name}</Text>
                    <Text style={[styles.execVolumeText, { color: colors.textSecondary }]}>
                      {exec.converted} converted &bull; {exec.total} assigned
                    </Text>
                  </View>
                </View>
                <View style={styles.execRateBlock}>
                  <Text style={[styles.execRateVal, { color: colors.success }]}>{exec.rate}%</Text>
                  <Text style={[styles.execRateLbl, { color: colors.textSecondary }]}>Conv.</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  exportTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  exportTopText: {
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  kpiCard: {
    width: '48%',
    marginVertical: 0,
    padding: 12,
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  chartCard: {
    marginTop: 16,
    padding: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubTitle: {
    fontSize: 11,
    marginBottom: 16,
  },
  sourceChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 170,
    paddingTop: 20,
    paddingHorizontal: 8,
  },
  chartCol: {
    alignItems: 'center',
    width: '22%',
  },
  barContainer: {
    height: 140,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  barValueText: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  barFill: {
    width: 24,
    minHeight: 10,
  },
  barLabelText: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  destList: {
    gap: 12,
  },
  destRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  destLabelCol: {
    width: '35%',
  },
  destName: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  destCount: {
    fontSize: 10,
  },
  destProgressCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  destProgressBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  destProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  destPct: {
    fontSize: 11,
    fontWeight: 'bold',
    width: 32,
    textAlign: 'right',
  },
  leaderboard: {
    gap: 4,
  },
  execRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  execRankBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  execNameText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  execVolumeText: {
    fontSize: 10,
    marginTop: 2,
  },
  execRateBlock: {
    alignItems: 'flex-end',
  },
  execRateVal: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  execRateLbl: {
    fontSize: 9,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
});
export default AnalyticsScreen;
