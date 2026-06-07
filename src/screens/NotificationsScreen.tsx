import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme, useAppSelector, useAppDispatch } from '../hooks';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { CustomButton } from '../components/CustomButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { markAsRead, markAllAsRead, deleteNotification, addNotification } from '../redux/slices/notificationsSlice';
import { Notification } from '../types';

export const NotificationsScreen: React.FC = () => {
  const { colors, typography, borderRadius } = useTheme();
  const dispatch = useAppDispatch();
  const { notifications, unreadCount } = useAppSelector(state => state.notifications);

  const [activeTab, setActiveTab] = useState<'All' | 'Unread' | 'Leads' | 'Reminders'>('All');

  // Filter logic
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notif => {
      if (activeTab === 'Unread') return !notif.read;
      if (activeTab === 'Leads') return notif.category === 'new_lead' || notif.category === 'converted';
      if (activeTab === 'Reminders') return notif.category === 'reminder';
      return true; // 'All'
    });
  }, [notifications, activeTab]);

  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(id));
  };

  const handleDelete = (id: string) => {
    dispatch(deleteNotification(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
    Alert.alert('Success', 'All notifications marked as read.');
  };

  const simulatePushNotification = () => {
    const scenarios = [
      {
        title: 'New Lead Inbound (Google Ads)',
        body: 'Sarah Connor submitted an inquiry for Europe Highlights Tour.',
        category: 'new_lead' as const
      },
      {
        title: 'Immediate Follow-up Due',
        body: 'Follow-up call with David Miller for Bali package is due now.',
        category: 'reminder' as const
      },
      {
        title: 'Lead Converted!',
        body: 'Priya Verma successfully closed lead Rajesh Gupta for Dubai Luxury Package.',
        category: 'converted' as const
      },
      {
        title: 'FCM Token Synced',
        body: 'Device registration token refreshed successfully with FCM servers.',
        category: 'general' as const
      }
    ];

    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    dispatch(addNotification(randomScenario));
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'new_lead':
        return { name: 'account-plus' as const, color: colors.primary };
      case 'reminder':
        return { name: 'calendar-clock' as const, color: colors.warning };
      case 'converted':
        return { name: 'trophy-outline' as const, color: colors.success };
      case 'summary':
        return { name: 'file-document-outline' as const, color: colors.info };
      default:
        return { name: 'bell-outline' as const, color: colors.textSecondary };
    }
  };

  const formatTimestamp = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return isoString;
    }
  };

  const renderNotifItem = ({ item }: { item: Notification }) => {
    const iconData = getIcon(item.category);

    return (
      <Card
        style={[
          styles.notifCard,
          { 
            backgroundColor: item.read ? colors.card : colors.primaryLight,
            borderLeftColor: iconData.color,
            borderLeftWidth: 4,
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.notifMainRow}
          onPress={() => handleMarkAsRead(item.id)}
          activeOpacity={0.8}
        >
          <View style={[styles.iconCircle, { backgroundColor: colors.background }]}>
            <MaterialCommunityIcons name={iconData.name} size={20} color={iconData.color} />
          </View>
          <View style={styles.notifContent}>
            <View style={styles.titleRow}>
              <Text style={[
                styles.notifTitle, 
                { 
                  color: colors.text, 
                  fontWeight: item.read ? '600' : 'bold',
                  fontSize: typography.fontSizes.sm 
                }
              ]}>
                {item.title}
              </Text>
              {!item.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
            </View>
            <Text style={[styles.notifBody, { color: colors.textSecondary, fontSize: typography.fontSizes.xs }]}>
              {item.body}
            </Text>
            <Text style={[styles.notifTime, { color: colors.textSecondary }]}>
              {formatTimestamp(item.timestamp)}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.actionsBar}>
          {!item.read && (
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleMarkAsRead(item.id)}>
              <MaterialCommunityIcons name="check" size={16} color={colors.primary} />
              <Text style={[styles.actionBtnText, { color: colors.primary, fontSize: 11 }]}>Mark Read</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.actionBtn, { marginLeft: 'auto' }]} onPress={() => handleDelete(item.id)}>
            <MaterialCommunityIcons name="delete-outline" size={16} color={colors.danger} />
            <Text style={[styles.actionBtnText, { color: colors.danger, fontSize: 11 }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text, fontSize: typography.fontSizes.md }]}>
            Notifications
          </Text>
          {unreadCount > 0 && (
            <Text style={[styles.unreadCountText, { color: colors.textSecondary, fontSize: typography.fontSizes.xs }]}>
              You have {unreadCount} unread messages
            </Text>
          )}
        </View>
        
        <View style={styles.headerActionRow}>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.headerBtn}>
              <MaterialCommunityIcons name="email-open-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={simulatePushNotification} style={[styles.simulateBtn, { borderColor: colors.primary }]}>
            <MaterialCommunityIcons name="cellphone-sound" size={18} color={colors.primary} />
            <Text style={[styles.simulateText, { color: colors.primary, fontSize: 11 }]}>Simulate</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {(['All', 'Unread', 'Leads', 'Reminders'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && { borderBottomColor: colors.primary, borderBottomWidth: 2 }
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[
              styles.tabText, 
              { 
                color: activeTab === tab ? colors.primary : colors.textSecondary,
                fontWeight: activeTab === tab ? 'bold' : '500'
              }
            ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredNotifications.length > 0 ? (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotifItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <EmptyState
          icon="bell-off-outline"
          title="No Notifications"
          description={`You don't have any notifications in the ${activeTab.toLowerCase()} category right now.`}
        />
      )}
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
  unreadCountText: {
    fontWeight: '500',
    marginTop: 2,
  },
  headerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerBtn: {
    padding: 6,
  },
  simulateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  simulateText: {
    fontWeight: 'bold',
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 44,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 12,
  },
  listContainer: {
    padding: 16,
  },
  notifCard: {
    marginVertical: 6,
    padding: 12,
  },
  notifMainRow: {
    flexDirection: 'row',
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  notifContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notifTitle: {
    flex: 1,
    paddingRight: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notifBody: {
    lineHeight: 18,
    marginBottom: 6,
  },
  notifTime: {
    fontSize: 9,
    fontWeight: '600',
    opacity: 0.7,
  },
  actionsBar: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.06)',
    paddingTop: 8,
    marginTop: 8,
    gap: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  actionBtnText: {
    fontWeight: 'bold',
  },
});
export default NotificationsScreen;
