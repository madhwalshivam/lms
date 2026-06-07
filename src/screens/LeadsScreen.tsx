import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Linking,
  Alert,
  Modal,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useTheme, useAppSelector, useAppDispatch } from '../hooks';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import { LeadsSkeleton } from '../components/LoadingSkeleton';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { setFilters, setSearchQuery, resetFilters, logLeadAction } from '../redux/slices/leadsSlice';
import { LEAD_SOURCES, LEAD_STATUSES, SALES_EXECUTIVES } from '../constants';
import { Lead, LeadStatus, LeadSource, SalesExecutive } from '../types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

interface LeadsScreenProps {
  navigation: StackNavigationProp<RootStackParamList, 'Main'>;
}

export const LeadsScreen: React.FC<LeadsScreenProps> = ({ navigation }) => {
  const { colors, typography, borderRadius } = useTheme();
  const dispatch = useAppDispatch();
  const { leads, filters, searchQuery } = useAppSelector(state => state.leads);

  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Pagination states (simulating infinite scroll)
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Filter & Search Logic (Memoized)
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // 1. Search Query Match
      const searchLower = searchQuery.toLowerCase().trim();
      const matchesSearch = !searchLower ||
        lead.name.toLowerCase().includes(searchLower) ||
        lead.phone.includes(searchLower) ||
        lead.email.toLowerCase().includes(searchLower) ||
        lead.destination.toLowerCase().includes(searchLower);

      // 2. Source Filter Match
      const matchesSource = filters.source === 'All' || lead.leadSource === filters.source;

      // 3. Status Filter Match
      const matchesStatus = filters.status === 'All' || lead.leadStatus === filters.status;

      // 4. Executive Filter Match
      const matchesExec = filters.assignedExecutive === 'All' || 
        (filters.assignedExecutive === 'Unassigned' && lead.assignedExecutive === 'Unassigned') ||
        lead.assignedExecutive === filters.assignedExecutive;

      // 5. Date Range Match
      let matchesDate = true;
      if (filters.dateRange !== 'All') {
        const today = new Date();
        const createdDate = new Date(lead.createdDate);
        const diffTime = Math.abs(today.getTime() - createdDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (filters.dateRange === 'Today' && diffDays > 1) matchesDate = false;
        else if (filters.dateRange === 'Yesterday' && (diffDays <= 1 || diffDays > 2)) matchesDate = false;
        else if (filters.dateRange === 'This Week' && diffDays > 7) matchesDate = false;
        else if (filters.dateRange === 'This Month' && diffDays > 30) matchesDate = false;
      }

      return matchesSearch && matchesSource && matchesStatus && matchesExec && matchesDate;
    });
  }, [leads, searchQuery, filters]);

  // Paginated leads list
  const paginatedLeads = useMemo(() => {
    return filteredLeads.slice(0, page * itemsPerPage);
  }, [filteredLeads, page]);

  const handleRefresh = () => {
    setRefreshing(true);
    setLoading(true);
    setTimeout(() => {
      setRefreshing(false);
      setLoading(false);
      setPage(1);
    }, 1000);
  };

  const loadMoreLeads = () => {
    if (page * itemsPerPage < filteredLeads.length) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const handleCall = (lead: Lead) => {
    const cleanPhone = lead.phone.replace(/[^+\d]/g, '');
    dispatch(logLeadAction({ leadId: lead.id, actionType: 'call', detail: lead.phone }));
    Linking.openURL(`tel:${cleanPhone}`).catch(() => {
      Alert.alert('Call Failed', `Cannot dial: ${lead.phone} on this device.`);
    });
  };

  const handleWhatsApp = (lead: Lead) => {
    const cleanPhone = lead.phone.replace(/[^+\d]/g, '');
    const message = `Hello ${lead.name}, this is Vikram from Urban Cruise Travel regarding your query for ${lead.destination}.`;
    dispatch(logLeadAction({ leadId: lead.id, actionType: 'whatsapp', detail: lead.phone }));
    Linking.openURL(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`).catch(() => {
      Alert.alert('WhatsApp Failed', 'WhatsApp is not installed on this device.');
    });
  };

  const handleEmail = (lead: Lead) => {
    const subject = `Inquiry response - ${lead.destination} - Urban Cruise Travel`;
    dispatch(logLeadAction({ leadId: lead.id, actionType: 'email', detail: lead.email }));
    Linking.openURL(`mailto:${lead.email}?subject=${encodeURIComponent(subject)}`).catch(() => {
      Alert.alert('Email Failed', 'No email client configured on this device.');
    });
  };

  const handleReset = () => {
    dispatch(resetFilters());
    setPage(1);
  };

  const renderLeadCard = ({ item }: { item: Lead }) => (
    <Card 
      style={styles.leadCard}
      onPress={() => navigation.navigate('LeadDetails', { leadId: item.id })}
    >
      {/* Header Info */}
      <View style={styles.cardHeader}>
        <View style={styles.nameBlock}>
          <Text style={[styles.leadName, { color: colors.text, fontSize: typography.fontSizes.md }]}>
            {item.name}
          </Text>
          <Text style={[styles.leadId, { color: colors.textSecondary, fontSize: typography.fontSizes.xs }]}>
            {item.id} &bull; {item.createdDate}
          </Text>
        </View>
        <Badge label={item.leadStatus} type="status" value={item.leadStatus} />
      </View>

      {/* Destination & Package Row */}
      <View style={[styles.infoRow, { backgroundColor: colors.accent }]}>
        <MaterialCommunityIcons name="compass-outline" size={16} color={colors.primary} />
        <Text style={[styles.infoText, { color: colors.text, fontSize: typography.fontSizes.xs }]}>
          {item.destination} &mdash; <Text style={{ fontWeight: '600' }}>{item.travelPackage}</Text>
        </Text>
      </View>

      {/* Details Meta Grid */}
      <View style={styles.detailsGrid}>
        <View style={styles.gridItem}>
          <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>Source</Text>
          <Text style={[styles.gridValue, { color: colors.text }]} numberOfLines={1}>
            {item.leadSource}
          </Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>Budget</Text>
          <Text style={[styles.gridValue, { color: colors.text }]} numberOfLines={1}>
            ₹{item.budget.toLocaleString('en-IN')}
          </Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>Executive</Text>
          <Text style={[styles.gridValue, { color: colors.text }]} numberOfLines={1}>
            {item.assignedExecutive}
          </Text>
        </View>
      </View>

      {/* Quick Action Button Bar */}
      <View style={[styles.cardActionBar, { borderTopColor: colors.border }]}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleCall(item)}>
          <MaterialCommunityIcons name="phone" size={18} color={colors.primary} />
          <Text style={[styles.actionButtonText, { color: colors.primary, fontSize: typography.fontSizes.xs }]}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => handleWhatsApp(item)}>
          <MaterialCommunityIcons name="whatsapp" size={18} color="#25D366" />
          <Text style={[styles.actionButtonText, { color: '#25D366', fontSize: typography.fontSizes.xs }]}>WhatsApp</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => handleEmail(item)}>
          <MaterialCommunityIcons name="email-outline" size={18} color={colors.info} />
          <Text style={[styles.actionButtonText, { color: colors.info, fontSize: typography.fontSizes.xs }]}>Email</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => navigation.navigate('LeadDetails', { leadId: item.id })}
        >
          <MaterialCommunityIcons name="eye-outline" size={18} color={colors.textSecondary} />
          <Text style={[styles.actionButtonText, { color: colors.textSecondary, fontSize: typography.fontSizes.xs }]}>View</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.source !== 'All') count++;
    if (filters.status !== 'All') count++;
    if (filters.assignedExecutive !== 'All') count++;
    if (filters.dateRange !== 'All') count++;
    return count;
  }, [filters]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar header */}
      <View style={[styles.searchHeader, { borderBottomColor: colors.border }]}>
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
          <MaterialCommunityIcons name="magnify" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search by name, phone, email, dest..."
            placeholderTextColor={colors.placeholder}
            value={searchQuery}
            onChangeText={(txt) => {
              dispatch(setSearchQuery(txt));
              setPage(1);
            }}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => dispatch(setSearchQuery(''))}>
              <MaterialCommunityIcons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.filterButton,
            { 
              backgroundColor: activeFiltersCount > 0 ? colors.primaryLight : colors.surface,
              borderColor: activeFiltersCount > 0 ? colors.primary : colors.border,
              borderRadius: borderRadius.md 
            }
          ]}
          onPress={() => setFilterModalVisible(true)}
        >
          <MaterialCommunityIcons 
            name="filter-variant" 
            size={22} 
            color={activeFiltersCount > 0 ? colors.primary : colors.text} 
          />
          {activeFiltersCount > 0 && (
            <View style={[styles.filterBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Filter modal view */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text, fontSize: typography.fontSizes.md }]}>
                Filter Leads
              </Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={[]}
              renderItem={null}
              ListHeaderComponent={
                <View style={styles.filtersScroll}>
                  {/* Lead Source */}
                  <Text style={[styles.filterLabel, { color: colors.text, fontSize: typography.fontSizes.xs }]}>
                    Lead Source
                  </Text>
                  <View style={styles.filterOptionsGroup}>
                    {['All', ...LEAD_SOURCES].map((src) => (
                      <TouchableOpacity
                        key={src}
                        style={[
                          styles.optionChip,
                          {
                            backgroundColor: filters.source === src ? colors.primaryLight : colors.surface,
                            borderColor: filters.source === src ? colors.primary : colors.border,
                          },
                        ]}
                        onPress={() => dispatch(setFilters({ source: src as any }))}
                      >
                        <Text style={{ color: filters.source === src ? colors.primary : colors.text, fontSize: 12, fontWeight: '500' }}>
                          {src}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Lead Status */}
                  <Text style={[styles.filterLabel, { color: colors.text, fontSize: typography.fontSizes.xs, marginTop: 16 }]}>
                    Lead Status
                  </Text>
                  <View style={styles.filterOptionsGroup}>
                    {['All', ...LEAD_STATUSES].map((stat) => (
                      <TouchableOpacity
                        key={stat}
                        style={[
                          styles.optionChip,
                          {
                            backgroundColor: filters.status === stat ? colors.primaryLight : colors.surface,
                            borderColor: filters.status === stat ? colors.primary : colors.border,
                          },
                        ]}
                        onPress={() => dispatch(setFilters({ status: stat as any }))}
                      >
                        <Text style={{ color: filters.status === stat ? colors.primary : colors.text, fontSize: 12, fontWeight: '500' }}>
                          {stat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Assigned Executive */}
                  <Text style={[styles.filterLabel, { color: colors.text, fontSize: typography.fontSizes.xs, marginTop: 16 }]}>
                    Assigned Agent
                  </Text>
                  <View style={styles.filterOptionsGroup}>
                    {['All', 'Unassigned', ...SALES_EXECUTIVES].map((exec) => (
                      <TouchableOpacity
                        key={exec}
                        style={[
                          styles.optionChip,
                          {
                            backgroundColor: filters.assignedExecutive === exec ? colors.primaryLight : colors.surface,
                            borderColor: filters.assignedExecutive === exec ? colors.primary : colors.border,
                          },
                        ]}
                        onPress={() => dispatch(setFilters({ assignedExecutive: exec as any }))}
                      >
                        <Text style={{ color: filters.assignedExecutive === exec ? colors.primary : colors.text, fontSize: 12, fontWeight: '500' }}>
                          {exec}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Date Range */}
                  <Text style={[styles.filterLabel, { color: colors.text, fontSize: typography.fontSizes.xs, marginTop: 16 }]}>
                    Time Period
                  </Text>
                  <View style={styles.filterOptionsGroup}>
                    {['All', 'Today', 'Yesterday', 'This Week', 'This Month'].map((period) => (
                      <TouchableOpacity
                        key={period}
                        style={[
                          styles.optionChip,
                          {
                            backgroundColor: filters.dateRange === period ? colors.primaryLight : colors.surface,
                            borderColor: filters.dateRange === period ? colors.primary : colors.border,
                          },
                        ]}
                        onPress={() => dispatch(setFilters({ dateRange: period as any }))}
                      >
                        <Text style={{ color: filters.dateRange === period ? colors.primary : colors.text, fontSize: 12, fontWeight: '500' }}>
                          {period}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              }
            />

            {/* Modal Bottom buttons */}
            <View style={[styles.modalActions, { borderTopColor: colors.border }]}>
              <TouchableOpacity style={[styles.modalBtnReset, { borderColor: colors.border }]} onPress={handleReset}>
                <Text style={{ color: colors.text, fontWeight: '600' }}>Reset Filters</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtnApply, { backgroundColor: colors.primary }]} 
                onPress={() => {
                  setPage(1);
                  setFilterModalVisible(false);
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Main leads content */}
      {loading ? (
        <LeadsSkeleton />
      ) : paginatedLeads.length > 0 ? (
        <FlatList
          data={paginatedLeads}
          renderItem={renderLeadCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
          }
          onEndReached={loadMoreLeads}
          onEndReachedThreshold={0.4}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
          }
        >
          <EmptyState
            icon="account-search-outline"
            title="No Leads Found"
            description="We couldn't find any leads matching your search query or filter selection."
          />
          {activeFiltersCount > 0 && (
            <TouchableOpacity style={[styles.clearBtn, { backgroundColor: colors.primaryLight }]} onPress={handleReset}>
              <Text style={{ color: colors.primary, fontWeight: '600' }}>Reset Filters</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    height: 44,
    paddingHorizontal: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  leadCard: {
    marginVertical: 8,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  nameBlock: {
    flex: 1,
  },
  leadName: {
    fontWeight: 'bold',
  },
  leadId: {
    opacity: 0.7,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    gap: 6,
    marginBottom: 12,
  },
  infoText: {
    flex: 1,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  gridItem: {
    flex: 1,
  },
  gridLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
    opacity: 0.7,
  },
  gridValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    paddingTop: 10,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionButtonText: {
    fontWeight: '600',
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: -8,
    marginBottom: 40,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    maxHeight: '80%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontWeight: 'bold',
  },
  filtersScroll: {
    padding: 20,
  },
  filterLabel: {
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  filterOptionsGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  modalBtnReset: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnApply: {
    flex: 1.5,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
export default LeadsScreen;
