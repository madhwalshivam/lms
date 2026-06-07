import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
  Modal,
} from 'react-native';
import { useTheme, useAppSelector, useAppDispatch } from '../hooks';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { CustomButton } from '../components/CustomButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { updateLeadStatusAsync, addLeadNoteAsync, assignLeadAsync, logLeadActionAsync } from '../redux/slices/leadsSlice';
import { LEAD_STATUSES, SALES_EXECUTIVES } from '../constants';
import { LeadStatus, SalesExecutive } from '../types';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

type LeadDetailsRouteProp = RouteProp<RootStackParamList, 'LeadDetails'>;
type LeadDetailsNavigationProp = StackNavigationProp<RootStackParamList, 'LeadDetails'>;

interface LeadDetailsScreenProps {
  route: LeadDetailsRouteProp;
  navigation: LeadDetailsNavigationProp;
}

export const LeadDetailsScreen: React.FC<LeadDetailsScreenProps> = ({ route, navigation }) => {
  const { leadId } = route.params;
  const { colors, typography, borderRadius } = useTheme();
  const dispatch = useAppDispatch();

  // Active user details
  const user = useAppSelector(state => state.auth.user);

  // Retrieve lead dynamically from Redux store
  const lead = useAppSelector(state => 
    state.leads.leads.find(l => l.id === leadId)
  );

  // Notes and Action states
  const [newNote, setNewNote] = useState('');
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [tempNoteText, setTempNoteText] = useState('');

  if (!lead) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.danger} />
        <Text style={[styles.errorText, { color: colors.text, fontSize: typography.fontSizes.md }]}>
          Lead not found.
        </Text>
        <CustomButton title="Back to Leads" onPress={() => navigation.goBack()} style={{ marginTop: 16 }} />
      </View>
    );
  }

  const handleCall = () => {
    const cleanPhone = lead.phone.replace(/[^+\d]/g, '');
    dispatch(logLeadActionAsync({ leadId: lead.id, actionType: 'call', detail: lead.phone }));
    Linking.openURL(`tel:${cleanPhone}`).catch(() => {
      Alert.alert('Call Failed', 'Dialer could not be launched.');
    });
  };

  const handleWhatsApp = () => {
    const cleanPhone = lead.phone.replace(/[^+\d]/g, '');
    const message = `Hello ${lead.name}, this is ${user?.name || 'Vikram'} from Urban Cruise Travel regarding your travel inquiry for ${lead.destination}.`;
    dispatch(logLeadActionAsync({ leadId: lead.id, actionType: 'whatsapp', detail: lead.phone }));
    Linking.openURL(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`).catch(() => {
      Alert.alert('WhatsApp Failed', 'WhatsApp application not found.');
    });
  };

  const handleEmail = () => {
    const subject = `Travel Query response - ${lead.destination} - Urban Cruise Travel`;
    dispatch(logLeadActionAsync({ leadId: lead.id, actionType: 'email', detail: lead.email }));
    Linking.openURL(`mailto:${lead.email}?subject=${encodeURIComponent(subject)}`).catch(() => {
      Alert.alert('Email Failed', 'Email app could not be opened.');
    });
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    dispatch(addLeadNoteAsync({
      leadId: lead.id,
      noteText: newNote,
      author: user?.name || 'Sales Agent'
    }));
    setNewNote('');
  };

  const handleStatusChange = (status: LeadStatus) => {
    dispatch(updateLeadStatusAsync({
      leadId: lead.id,
      status,
      noteText: tempNoteText
    }));
    setTempNoteText('');
    setStatusModalVisible(false);
    Alert.alert('Status Updated', `Lead status changed to ${status}`);
  };

  const handleAssignExecutive = (exec: SalesExecutive | 'Unassigned') => {
    dispatch(assignLeadAsync({
      leadId: lead.id,
      executive: exec
    }));
    setAssignModalVisible(false);
    Alert.alert('Lead Assigned', `Lead has been assigned to ${exec}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Custom navigation Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text, fontSize: typography.fontSizes.md }]}>
          Lead Details
        </Text>
        <View style={{ width: 40 }} /> {/* Spacer */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card Summary */}
        <Card style={styles.profileSummaryCard}>
          <View style={styles.avatarRow}>
            <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.avatarText, { color: colors.primary }]}>
                {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileMain}>
              <Text style={[styles.clientName, { color: colors.text, fontSize: typography.fontSizes.lg }]}>
                {lead.name}
              </Text>
              <Text style={[styles.clientIdText, { color: colors.textSecondary, fontSize: typography.fontSizes.xs }]}>
                ID: {lead.id} &bull; Created: {lead.createdDate}
              </Text>
              <View style={styles.badgeRow}>
                <Badge label={lead.leadStatus} type="status" value={lead.leadStatus} />
                <Badge label={lead.leadSource} type="source" value={lead.leadSource} />
              </View>
            </View>
          </View>
        </Card>

        {/* Floating Quick Action Contacts Bar */}
        <View style={styles.contactBar}>
          <TouchableOpacity style={[styles.contactCircle, { backgroundColor: colors.primaryLight }]} onPress={handleCall}>
            <MaterialCommunityIcons name="phone" size={24} color={colors.primary} />
            <Text style={[styles.contactLabel, { color: colors.text }]}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.contactCircle, { backgroundColor: '#E8F5E9' }]} onPress={handleWhatsApp}>
            <MaterialCommunityIcons name="whatsapp" size={24} color="#25D366" />
            <Text style={[styles.contactLabel, { color: colors.text }]}>WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.contactCircle, { backgroundColor: colors.infoLight }]} onPress={handleEmail}>
            <MaterialCommunityIcons name="email-outline" size={24} color={colors.info} />
            <Text style={[styles.contactLabel, { color: colors.text }]}>Email</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.contactCircle, { backgroundColor: colors.accent }]} 
            onPress={() => setStatusModalVisible(true)}
          >
            <MaterialCommunityIcons name="list-status" size={24} color={colors.textSecondary} />
            <Text style={[styles.contactLabel, { color: colors.text }]}>Status</Text>
          </TouchableOpacity>
        </View>

        {/* Lead Details Grid */}
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.fontSizes.md }]}>
          Trip Details & Interest
        </Text>
        <Card style={styles.detailsCard}>
          <View style={styles.gridContainer}>
            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>Destination</Text>
                <Text style={[styles.gridValue, { color: colors.text }]}>{lead.destination}</Text>
              </View>
              <View style={styles.gridCol}>
                <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>Travel Package</Text>
                <Text style={[styles.gridValue, { color: colors.text }]}>{lead.travelPackage}</Text>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>Package Budget</Text>
                <Text style={[styles.gridValue, { color: colors.text, fontWeight: 'bold' }]}>
                  ₹{lead.budget.toLocaleString('en-IN')}
                </Text>
              </View>
              <View style={styles.gridCol}>
                <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>Travel Date</Text>
                <Text style={[styles.gridValue, { color: colors.text }]}>{lead.travelDate}</Text>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>Ad Campaign</Text>
                <Text style={[styles.gridValue, { color: colors.text }]}>{lead.campaignName || 'N/A (Organic)'}</Text>
              </View>
              <View style={styles.gridCol}>
                <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>Assigned Executive</Text>
                <TouchableOpacity 
                  style={styles.execChangeRow}
                  onPress={() => setAssignModalVisible(true)}
                >
                  <Text style={[styles.gridValue, { color: colors.primary, fontWeight: '600' }]}>
                    {lead.assignedExecutive}
                  </Text>
                  <MaterialCommunityIcons name="pencil" size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Card>

        {/* Customer contact Info details */}
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.fontSizes.md }]}>
          Contact Information
        </Text>
        <Card style={styles.detailsCard}>
          <View style={styles.contactInfoRow}>
            <MaterialCommunityIcons name="phone-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.contactInfoValue, { color: colors.text }]}>{lead.phone}</Text>
          </View>
          <View style={styles.contactInfoRow}>
            <MaterialCommunityIcons name="email-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.contactInfoValue, { color: colors.text }]}>{lead.email}</Text>
          </View>
        </Card>

        {/* Follow-up Reminders */}
        {lead.followUpHistory.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.fontSizes.md }]}>
              Follow-Up Tasks
            </Text>
            {lead.followUpHistory.map(fu => (
              <Card key={fu.id} style={styles.followUpCard}>
                <View style={styles.followUpHeader}>
                  <View style={styles.followUpTypeBlock}>
                    <MaterialCommunityIcons 
                      name={fu.type === 'Call' ? 'phone-clock' : fu.type === 'WhatsApp' ? 'whatsapp' : 'email-outline'} 
                      size={20} 
                      color={colors.primary} 
                    />
                    <Text style={[styles.followUpType, { color: colors.text }]}>{fu.type} Task</Text>
                  </View>
                  <Text style={[styles.followUpDate, { color: colors.textSecondary }]}>{fu.date}</Text>
                </View>
                <Text style={[styles.followUpText, { color: colors.text }]}>{fu.text}</Text>
              </Card>
            ))}
          </>
        )}

        {/* Notes Timeline Section */}
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.fontSizes.md }]}>
          Notes Timeline ({lead.notes.length})
        </Text>
        <Card style={styles.notesCard}>
          <View style={styles.addNoteForm}>
            <TextInput
              style={[styles.noteInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface, borderRadius: borderRadius.sm }]}
              placeholder="Type a new comment/update..."
              placeholderTextColor={colors.placeholder}
              multiline
              numberOfLines={2}
              value={newNote}
              onChangeText={setNewNote}
            />
            <CustomButton
              title="Add Note"
              onPress={handleAddNote}
              disabled={!newNote.trim()}
              icon="plus"
              style={styles.addNoteBtn}
            />
          </View>

          {lead.notes.length > 0 ? (
            <View style={styles.notesTimeline}>
              {lead.notes.map((note, index) => (
                <View key={note.id} style={styles.noteItem}>
                  <View style={styles.noteMetaRow}>
                    <Text style={[styles.noteAuthor, { color: colors.text }]}>{note.author}</Text>
                    <Text style={[styles.noteDate, { color: colors.textSecondary }]}>{note.date}</Text>
                  </View>
                  <Text style={[styles.noteTextDetail, { color: colors.text }]}>{note.text}</Text>
                  {index < lead.notes.length - 1 && <View style={[styles.noteDivider, { backgroundColor: colors.border }]} />}
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.noNotesText, { color: colors.textSecondary }]}>
              No comments added yet. Add a note to begin logs.
            </Text>
          )}
        </Card>

        {/* Visual Activity History Timeline */}
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.fontSizes.md }]}>
          Activity Log Timeline
        </Text>
        <Card style={styles.timelineCard}>
          <View style={styles.timelineList}>
            {lead.activityHistory.map((act, index) => {
              let iconName: keyof typeof MaterialCommunityIcons.glyphMap = 'circle';
              let iconColor = colors.textSecondary;

              switch (act.type) {
                case 'status_change':
                  iconName = 'swap-horizontal';
                  iconColor = colors.primary;
                  break;
                case 'assigned':
                  iconName = 'account-arrow-right';
                  iconColor = colors.info;
                  break;
                case 'call':
                  iconName = 'phone-outgoing';
                  iconColor = colors.success;
                  break;
                case 'whatsapp':
                  iconName = 'whatsapp';
                  iconColor = '#25D366';
                  break;
                case 'email':
                  iconName = 'email-outline';
                  iconColor = colors.info;
                  break;
                case 'note_added':
                  iconName = 'comment-text-outline';
                  iconColor = colors.warning;
                  break;
              }

              return (
                <View key={act.id} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={[styles.timelineIconCircle, { borderColor: iconColor }]}>
                      <MaterialCommunityIcons name={iconName} size={14} color={iconColor} />
                    </View>
                    {index < lead.activityHistory.length - 1 && (
                      <View style={[styles.timelineVerticalLine, { backgroundColor: colors.border }]} />
                    )}
                  </View>
                  <View style={styles.timelineRight}>
                    <Text style={[styles.timelineDateText, { color: colors.textSecondary }]}>{act.date}</Text>
                    <Text style={[styles.timelineDesc, { color: colors.text }]}>{act.text}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* UPDATE STATUS MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={statusModalVisible}
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text, fontSize: typography.fontSizes.md }]}>
                Update Lead Status
              </Text>
              <TouchableOpacity onPress={() => setStatusModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Select New Status</Text>
              <View style={styles.statusButtonsGrid}>
                {LEAD_STATUSES.map(stat => (
                  <TouchableOpacity
                    key={stat}
                    style={[
                      styles.statusSelectBtn,
                      {
                        backgroundColor: lead.leadStatus === stat ? colors.primaryLight : colors.surface,
                        borderColor: lead.leadStatus === stat ? colors.primary : colors.border,
                        borderRadius: borderRadius.sm
                      }
                    ]}
                    onPress={() => handleStatusChange(stat)}
                  >
                    <Text style={{ color: lead.leadStatus === stat ? colors.primary : colors.text, fontWeight: 'bold' }}>
                      {stat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.modalLabel, { color: colors.textSecondary, marginTop: 16 }]}>
                Transition Note (Optional)
              </Text>
              <TextInput
                style={[styles.noteInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface, borderRadius: borderRadius.sm }]}
                placeholder="Why is this lead status changing?"
                placeholderTextColor={colors.placeholder}
                value={tempNoteText}
                onChangeText={setTempNoteText}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* ASSIGN EXECUTIVE MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={assignModalVisible}
        onRequestClose={() => setAssignModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text, fontSize: typography.fontSizes.md }]}>
                Assign Lead Owner
              </Text>
              <TouchableOpacity onPress={() => setAssignModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Select Sales Representative</Text>
              <View style={styles.statusButtonsGrid}>
                {['Unassigned', ...SALES_EXECUTIVES].map(exec => (
                  <TouchableOpacity
                    key={exec}
                    style={[
                      styles.statusSelectBtn,
                      {
                        backgroundColor: lead.assignedExecutive === exec ? colors.primaryLight : colors.surface,
                        borderColor: lead.assignedExecutive === exec ? colors.primary : colors.border,
                        borderRadius: borderRadius.sm
                      }
                    ]}
                    onPress={() => handleAssignExecutive(exec as any)}
                  >
                    <Text style={{ color: lead.assignedExecutive === exec ? colors.primary : colors.text, fontWeight: 'bold' }}>
                      {exec}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  errorText: {
    fontWeight: 'bold',
    marginTop: 8,
  },
  scrollContent: {
    padding: 16,
  },
  profileSummaryCard: {
    marginVertical: 4,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  profileMain: {
    flex: 1,
  },
  clientName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  clientIdText: {
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  contactBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
    paddingHorizontal: 8,
  },
  contactCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 68,
    height: 68,
    borderRadius: 34,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contactLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  detailsCard: {
    marginVertical: 4,
    padding: 14,
  },
  gridContainer: {
    gap: 12,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridCol: {
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
    fontSize: 13,
    fontWeight: '500',
  },
  execChangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  contactInfoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  followUpCard: {
    marginVertical: 4,
    padding: 12,
  },
  followUpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  followUpTypeBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  followUpType: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  followUpDate: {
    fontSize: 10,
    fontWeight: '600',
  },
  followUpText: {
    fontSize: 12,
    lineHeight: 18,
  },
  notesCard: {
    marginVertical: 4,
    padding: 14,
  },
  addNoteForm: {
    marginBottom: 16,
  },
  noteInput: {
    borderWidth: 1,
    padding: 10,
    fontSize: 13,
    minHeight: 50,
    textAlignVertical: 'top',
  },
  addNoteBtn: {
    height: 36,
    marginTop: 8,
    alignSelf: 'flex-end',
    width: 120,
  },
  notesTimeline: {
    gap: 12,
  },
  noteItem: {
    gap: 4,
  },
  noteMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  noteAuthor: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  noteDate: {
    fontSize: 10,
  },
  noteTextDetail: {
    fontSize: 12,
    lineHeight: 18,
  },
  noteDivider: {
    height: 0.5,
    marginTop: 10,
  },
  noNotesText: {
    textAlign: 'center',
    fontSize: 12,
    paddingVertical: 12,
  },
  timelineCard: {
    marginVertical: 4,
    padding: 14,
  },
  timelineList: {
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 50,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 24,
  },
  timelineIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    zIndex: 2,
  },
  timelineVerticalLine: {
    width: 1.5,
    flex: 1,
    zIndex: 1,
  },
  timelineRight: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 16,
  },
  timelineDateText: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  timelineDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingBottom: 40,
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
  modalBody: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  statusButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusSelectBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '45%',
    flex: 1,
  },
});
export default LeadDetailsScreen;
