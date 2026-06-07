import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage Utility for Persisting Session and Settings
 */
export const storage = {
  /**
   * Set string item in storage
   */
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting item in storage:', error);
    }
  },

  /**
   * Get string item from storage
   */
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item from storage:', error);
      return null;
    }
  },

  /**
   * Remove item from storage
   */
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item from storage:', error);
    }
  },

  /**
   * Save JSON object in storage
   */
  setObject: async (key: string, value: object): Promise<void> => {
    try {
      const jsonString = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonString);
    } catch (error) {
      console.error('Error saving object in storage:', error);
    }
  },

  /**
   * Retrieve JSON object from storage
   */
  getObject: async <T>(key: string): Promise<T | null> => {
    try {
      const jsonString = await AsyncStorage.getItem(key);
      return jsonString ? (JSON.parse(jsonString) as T) : null;
    } catch (error) {
      console.error('Error getting object from storage:', error);
      return null;
    }
  }
};
