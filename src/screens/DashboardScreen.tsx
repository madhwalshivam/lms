import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { useTheme, useAppSelector, useAppDispatch } from '../hooks';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList, MainTabParamList } from '../navigation/types';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ReportService } from '../services/reportService';
import { logLeadAction, setFilters, fetchLeads } from '../redux/slices/leadsSlice';

type DashboardNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Dashboard'>,
  StackNavigationProp<RootStackParamList>
>;

interface DashboardScreenProps {
  navigation: DashboardNavigationProp;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { colors, typography, borderRadius } = useTheme();
  const dispatch = useAppDispatch();
  const leads = useAppSelector(state => state.leads.leads);
  const user = useAppSelector(state => state.auth.user);
  // Calculate KPI values
  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.leadStatus === 'New').length;
  const contactedLeads = leads.filter(l => l.leadStatus === 'Contacted').length;
  const followUpLeads = leads.filter(l => l.leadStatus === 'Follow-Up').length;
  const convertedLeads = leads.filter(l => l.leadStatus === 'Converted').length;
  const rejectedLeads = leads.filter(l => l.leadStatus === 'Rejected').length;

  // Calculate Lead Sources
  const websiteCount = leads.filter(l => l.leadSource === 'Website').length;
  const facebookCount = leads.filter(l => l.leadSource === 'Facebook Ads').length;
  const instagramCount = leads.filter(l => l.leadSource === 'Instagram Ads').length;
  const googleCount = leads.filter(l => l.leadSource === 'Google Ads').length;
  const [refreshing, setRefreshing] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  React.useEffect(() => {
    dispatch(fetchLeads());
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchLeads());
    setRefreshing(false);
  };

  const handleExport = async (type: 'pdf' | 'excel') => {
    setExportLoading(true);
    try {
      if (type === 'excel') {
        const result = await ReportService.exportToExcel(leads);
        if (result.success) {
          Alert.alert('Export Success', `Excel report generated successfully: ${result.filename}`);
        } else {
          Alert.alert('Export Failed', 'Unable to export Excel report.');
        }
      } else {
        const result = await ReportService.exportToPDF(leads);
        if (result.success) {
          Alert.alert('Export Success', `PDF report print preview opened: ${result.filename}`);
        } else {
          Alert.alert('Export Failed', 'Unable to export PDF report.');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred during report generation.');
    } finally {
      setExportLoading(false);
    }
  };

  // Recent leads (limit to 3)
  const recentLeads = leads.slice(0, 3);

  // Conversion funnel ratios
  const funnelStages = [
    { name: 'Total Leads', count: totalLeads, color: colors.primary, pct: 100 },
    { name: 'Contacted', count: contactedLeads + followUpLeads + convertedLeads, color: colors.info, pct: totalLeads ? Math.round(((contactedLeads + followUpLeads + convertedLeads) / totalLeads) * 100) : 0 },
    { name: 'Follow-Ups', count: followUpLeads + convertedLeads, color: colors.warning, pct: totalLeads ? Math.round(((followUpLeads + convertedLeads) / totalLeads) * 100) : 0 },
    { name: 'Converted', count: convertedLeads, color: colors.success, pct: totalLeads ? Math.round((convertedLeads / totalLeads) * 100) : 0 }
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary, fontSize: typography.fontSizes.xs }]}>
            Welcome Back,
          </Text>
          <Text style={[styles.userName, { color: colors.text, fontSize: typography.fontSizes.lg }]}>
            {user?.name || 'Travel Agent'}
          </Text>
        </View>
        <View style={styles.headerRightActions}>
          <TouchableOpacity 
            style={[styles.notificationIcon, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleRefresh}
          >
            <MaterialCommunityIcons name="refresh" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.notificationIcon, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Main', { screen: 'Notifications' })}
          >
            <MaterialCommunityIcons name="bell-outline" size={22} color={colors.text} />
            {leads.filter(l => l.leadStatus === 'New').length > 0 && (
              <View style={[styles.badgeIndicator, { backgroundColor: colors.danger }]} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
        }
      >
        {/* KPI Panel */}
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.fontSizes.md }]}>
          Performance Overview
        </Text>
        <View style={styles.kpiGrid}>
          <Card style={[styles.kpiCard, { borderLeftColor: colors.primary, borderLeftWidth: 4 }]}>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Total Leads</Text>
            <Text style={[styles.kpiValue, { color: colors.text }]}>{totalLeads}</Text>
          </Card>
          <Card style={[styles.kpiCard, { borderLeftColor: colors.info, borderLeftWidth: 4 }]}>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>New Leads</Text>
            <Text style={[styles.kpiValue, { color: colors.info }]}>{newLeads}</Text>
          </Card>
          <Card style={[styles.kpiCard, { borderLeftColor: colors.warning, borderLeftWidth: 4 }]}>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Follow-Ups</Text>
            <Text style={[styles.kpiValue, { color: colors.warning }]}>{followUpLeads}</Text>
          </Card>
          <Card style={[styles.kpiCard, { borderLeftColor: colors.success, borderLeftWidth: 4 }]}>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Converted</Text>
            <Text style={[styles.kpiValue, { color: colors.success }]}>{convertedLeads}</Text>
          </Card>
        </View>

        {/* Quick Actions Grid */}
        <Card style={styles.quickActionsCard}>
          <Text style={[styles.cardTitle, { color: colors.text, fontSize: typography.fontSizes.sm + 1 }]}>
            LMS Services Hub
          </Text>
          <Text style={[styles.cardSub, { color: colors.textSecondary, fontSize: typography.fontSizes.xs, marginBottom: 12 }]}>
            One-tap filters & instant operations
          </Text>
          
          <View style={styles.actionsGrid}>
            {/* 1. Add Lead */}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate('AddLead')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: colors.primaryLight }]}>
                <MaterialCommunityIcons name="account-plus-outline" size={24} color={colors.primary} />
              </View>
              <Text style={[styles.actionText, { color: colors.text }]}>Add Lead</Text>
            </TouchableOpacity>

            {/* 2. Google Ads */}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => {
                dispatch(setFilters({ source: 'Google Ads', status: 'All', assignedExecutive: 'All', dateRange: 'All' }));
                navigation.navigate('Main', { screen: 'Leads' });
              }}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#FEF6E6' }]}>
                <MaterialCommunityIcons name="google" size={24} color="#F3A000" />
              </View>
              <Text style={[styles.actionText, { color: colors.text }]}>Google Ads</Text>
            </TouchableOpacity>

            {/* 3. Facebook Ads */}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => {
                dispatch(setFilters({ source: 'Facebook Ads', status: 'All', assignedExecutive: 'All', dateRange: 'All' }));
                navigation.navigate('Main', { screen: 'Leads' });
              }}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#E8F0FE' }]}>
                <MaterialCommunityIcons name="facebook" size={24} color="#1877F2" />
              </View>
              <Text style={[styles.actionText, { color: colors.text }]}>Meta Ads</Text>
            </TouchableOpacity>

            {/* 4. Instagram Ads */}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => {
                dispatch(setFilters({ source: 'Instagram Ads', status: 'All', assignedExecutive: 'All', dateRange: 'All' }));
                navigation.navigate('Main', { screen: 'Leads' });
              }}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#FCE8E6' }]}>
                <MaterialCommunityIcons name="instagram" size={24} color="#E1306C" />
              </View>
              <Text style={[styles.actionText, { color: colors.text }]}>Insta Ads</Text>
            </TouchableOpacity>

            {/* 5. Website */}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => {
                dispatch(setFilters({ source: 'Website', status: 'All', assignedExecutive: 'All', dateRange: 'All' }));
                navigation.navigate('Main', { screen: 'Leads' });
              }}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#E6F4EA' }]}>
                <MaterialCommunityIcons name="web" size={24} color="#137333" />
              </View>
              <Text style={[styles.actionText, { color: colors.text }]}>Web Leads</Text>
            </TouchableOpacity>

            {/* 6. Follow-ups */}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => {
                dispatch(setFilters({ source: 'All', status: 'Follow-Up', assignedExecutive: 'All', dateRange: 'All' }));
                navigation.navigate('Main', { screen: 'Leads' });
              }}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#F3E5F5' }]}>
                <MaterialCommunityIcons name="calendar-clock" size={24} color="#9C27B0" />
              </View>
              <Text style={[styles.actionText, { color: colors.text }]}>Follow-Ups</Text>
            </TouchableOpacity>

            {/* 7. Excel Report */}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleExport('excel')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#E2F0D9' }]}>
                <MaterialCommunityIcons name="file-excel-outline" size={24} color="#107C41" />
              </View>
              <Text style={[styles.actionText, { color: colors.text }]}>Excel</Text>
            </TouchableOpacity>

            {/* 8. PDF Report */}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleExport('pdf')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#FCE4D6' }]}>
                <MaterialCommunityIcons name="file-pdf-box" size={24} color="#C00000" />
              </View>
              <Text style={[styles.actionText, { color: colors.text }]}>PDF Report</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Funnel Graph Summary */}
        <Card style={styles.funnelCard}>
          <Text style={[styles.cardTitle, { color: colors.text, fontSize: typography.fontSizes.md }]}>
            Conversion Funnel Analysis
          </Text>
          <Text style={[styles.cardSub, { color: colors.textSecondary, fontSize: typography.fontSizes.xs }]}>
            Percentage of leads advancing through stages
          </Text>
          <View style={styles.funnelContainer}>
            {funnelStages.map((stage, idx) => (
              <View key={stage.name} style={styles.funnelRow}>
                <View style={styles.funnelLabelContainer}>
                  <Text style={[styles.funnelStageName, { color: colors.text }]}>{stage.name}</Text>
                  <Text style={[styles.funnelStageCount, { color: colors.textSecondary }]}>{stage.count} leads</Text>
                </View>
                <View style={styles.funnelBarContainer}>
                  <View style={[styles.funnelBarBg, { backgroundColor: colors.border }]}>
                    <View style={[styles.funnelBarFill, { width: `${stage.pct}%`, backgroundColor: stage.color }]} />
                  </View>
                  <Text style={[styles.funnelPct, { color: colors.text, fontWeight: 'bold' }]}>{stage.pct}%</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Lead Sources Overview */}
        <Card style={styles.sourcesCard}>
          <Text style={[styles.cardTitle, { color: colors.text, fontSize: typography.fontSizes.md }]}>
            Lead Acquisition Sources
          </Text>
          <View style={styles.sourcesList}>
            {[
              { name: 'Website', count: websiteCount, pct: totalLeads ? Math.round((websiteCount / totalLeads) * 100) : 0, color: colors.primary },
              { name: 'Facebook Ads', count: facebookCount, pct: totalLeads ? Math.round((facebookCount / totalLeads) * 100) : 0, color: '#1A73E8' },
              { name: 'Instagram Ads', count: instagramCount, pct: totalLeads ? Math.round((instagramCount / totalLeads) * 100) : 0, color: '#D93025' },
              { name: 'Google Ads', count: googleCount, pct: totalLeads ? Math.round((googleCount / totalLeads) * 100) : 0, color: '#137333' }
            ].map(source => (
              <View key={source.name} style={styles.sourceItem}>
                <View style={styles.sourceMeta}>
                  <View style={[styles.colorDot, { backgroundColor: source.color }]} />
                  <Text style={[styles.sourceName, { color: colors.text }]}>{source.name}</Text>
                </View>
                <Text style={[styles.sourceCount, { color: colors.text }]}>
                  {source.count} <Text style={[styles.sourcePct, { color: colors.textSecondary }]}>({source.pct}%)</Text>
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Recent Inbound Leads */}
        <View style={styles.recentHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.fontSizes.md, marginVertical: 0 }]}>
            Recent Leads
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Leads' })}>
            <Text style={[styles.viewAllLink, { color: colors.primary, fontSize: typography.fontSizes.sm }]}>
              View All
            </Text>
          </TouchableOpacity>
        </View>

        {recentLeads.map(lead => (
          <Card 
            key={lead.id} 
            style={styles.recentLeadCard}
            onPress={() => navigation.navigate('LeadDetails', { leadId: lead.id })}
          >
            <View style={styles.recentLeadHeader}>
              <View>
                <Text style={[styles.leadName, { color: colors.text, fontSize: typography.fontSizes.sm }]}>
                  {lead.name}
                </Text>
                <Text style={[styles.leadDest, { color: colors.textSecondary, fontSize: typography.fontSizes.xs }]}>
                  Interested in: <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{lead.destination}</Text>
                </Text>
              </View>
              <Badge label={lead.leadStatus} type="status" value={lead.leadStatus} />
            </View>
            <View style={styles.recentLeadFooter}>
              <Text style={[styles.leadDate, { color: colors.textSecondary, fontSize: typography.fontSizes.xs }]}>
                Created: {lead.createdDate}
              </Text>
              <Text style={[styles.leadBudget, { color: colors.text, fontSize: typography.fontSizes.xs, fontWeight: 'bold' }]}>
                Budget: ₹{lead.budget.toLocaleString('en-IN')}
              </Text>
            </View>
          </Card>
        ))}

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
  greeting: {
    fontWeight: '500',
  },
  userName: {
    fontWeight: 'bold',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  badgeIndicator: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginVertical: 12,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  kpiCard: {
    width: '48%',
    marginVertical: 0,
    padding: 12,
    borderWidth: 1,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  quickActionsCard: {
    marginTop: 16,
    padding: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginVertical: 4,
    rowGap: 16,
  },
  actionBtn: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionText: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  funnelCard: {
    marginTop: 20,
    padding: 16,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSub: {
    fontWeight: '400',
    marginBottom: 16,
  },
  funnelContainer: {
    gap: 12,
  },
  funnelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  funnelLabelContainer: {
    width: '35%',
  },
  funnelStageName: {
    fontSize: 12,
    fontWeight: '600',
  },
  funnelStageCount: {
    fontSize: 10,
  },
  funnelBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  funnelBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  funnelBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  funnelPct: {
    fontSize: 11,
    width: 35,
    textAlign: 'right',
  },
  sourcesCard: {
    marginTop: 16,
    padding: 16,
  },
  sourcesList: {
    gap: 12,
    marginTop: 8,
  },
  sourceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  sourceName: {
    fontSize: 12,
    fontWeight: '500',
  },
  sourceCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  sourcePct: {
    fontWeight: 'normal',
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  viewAllLink: {
    fontWeight: '600',
  },
  recentLeadCard: {
    marginVertical: 6,
    padding: 12,
  },
  recentLeadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  leadName: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  leadDest: {
    fontWeight: '500',
  },
  recentLeadFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
    marginTop: 4,
  },
  leadDate: {
    opacity: 0.7,
  },
  leadBudget: {
    opacity: 0.9,
  },
});
export default DashboardScreen;
