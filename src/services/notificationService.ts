import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import axios from 'axios';
import { API_BASE_URL, USE_REAL_BACKEND } from '../config/apiConfig';
import { Notification } from '../types';
import { dummyNotifications } from '../data/dummyLeads';

// Configure Notification Handler to display alert banner even if app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  /**
   * Request push notification permissions and get Expo Push Token
   */
  static async requestFcmToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
      console.log('Web platform: Using mock push token');
      return 'ExpoPushToken[mock-web-token-12345]';
    }

    if (!Device.isDevice) {
      console.log('Simulator/Emulator: Using simulator mock push token');
      return 'ExpoPushToken[mock-simulator-token-12345]';
    }

    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notification: Permission not granted');
        return null;
      }

      // Read project ID from EAS config
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId || 'urban-cruise-lms-project';
      
      const pushToken = (
        await Notifications.getExpoPushTokenAsync({ projectId })
      ).data;

      console.log('Expo Push Token Generated successfully:', pushToken);
      return pushToken;
    } catch (error) {
      console.error('Error fetching Expo Push Token:', error);
      // Fallback for development ease
      return 'ExpoPushToken[mock-fallback-token-12345]';
    }
  }

  /**
   * Save Push token to the CRM backend
   */
  static async saveTokenToBackend(userId: string, token: string): Promise<boolean> {
    try {
      if (USE_REAL_BACKEND) {
        await axios.post(`${API_BASE_URL}/auth/push-token`, {
          userId,
          token,
        });
        console.log(`Push token registered on server for User ID: ${userId}`);
        return true;
      } else {
        console.log(`Mock registration: Push token registered on server for User ID: ${userId}`);
        return true;
      }
    } catch (error) {
      console.error('Failed to register push token to backend:', error);
      return false;
    }
  }

  /**
   * Fetch user notifications list
   */
  static async getNotifications(): Promise<Notification[]> {
    try {
      if (USE_REAL_BACKEND) {
        const response = await axios.get(`${API_BASE_URL}/notifications`);
        return response.data;
      }
      return dummyNotifications;
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
      return dummyNotifications;
    }
  }

  /**
   * Mark a notification as read on the backend
   */
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      if (USE_REAL_BACKEND) {
        await axios.put(`${API_BASE_URL}/notifications/${notificationId}/read`);
        return true;
      }
      console.log(`Notification ${notificationId} marked as read`);
      return true;
    } catch (e) {
      console.error('Failed to mark notification as read:', e);
      return false;
    }
  }

  /**
   * Delete a notification from the backend
   */
  static async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      if (USE_REAL_BACKEND) {
        await axios.delete(`${API_BASE_URL}/notifications/${notificationId}`);
        return true;
      }
      console.log(`Notification ${notificationId} deleted`);
      return true;
    } catch (e) {
      console.error('Failed to delete notification:', e);
      return false;
    }
  }

  /**
   * Show a local notification immediately on this device.
   * Works even without a push server / FCM, so the foreground (app-open)
   * case always shows a banner.
   */
  static async presentLocalNotification(
    title: string,
    body: string,
    data: Record<string, any> = {}
  ): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      await Notifications.scheduleNotificationAsync({
        content: { title, body, data, sound: 'default' },
        trigger: null, // fire right away
      });
    } catch (e) {
      console.warn('Local notification failed:', e);
    }
  }

  /**
   * Set up notification listeners (foreground and background interactions)
   */
  static setupNotificationsListeners(onNotificationReceived?: (notification: Notifications.Notification) => void) {
    if (Platform.OS === 'web') return () => {};

    // 1. Foreground listener: triggers when app is open and notification is received
    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received in foreground:', notification);
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    });

    // 2. Click response listener: triggers when user taps notification (foreground or background)
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification action response clicked:', response);
      // Can extract details like leadId: response.notification.request.content.data.leadId
    });

    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }

  /**
   * Trigger a simulated test push notification (Local Notification)
   */
  static triggerMockPushNotification(category: 'new_lead' | 'reminder' | 'converted'): Notification {
    const notificationsMap = {
      new_lead: {
        id: `mock-notif-${Date.now()}`,
        title: 'New Organic Lead Inbound',
        body: 'Vihaan Nair submitted an inquiry for Bali Romantic Getaway.',
        timestamp: new Date().toISOString(),
        read: false,
        category: 'new_lead' as const
      },
      reminder: {
        id: `mock-notif-${Date.now()}`,
        title: 'Immediate Follow-up Alert',
        body: 'Follow-up with Sunita Verma for Kashmir Scenic Tour is due now.',
        timestamp: new Date().toISOString(),
        read: false,
        category: 'reminder' as const
      },
      converted: {
        id: `mock-notif-${Date.now()}`,
        title: 'Lead Converted!',
        body: 'Executive Amit Singh converted lead Neha Gupta for Europe Tour.',
        timestamp: new Date().toISOString(),
        read: false,
        category: 'converted' as const
      }
    };

    return notificationsMap[category];
  }
}
