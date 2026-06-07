import { Platform } from 'react-native';

/**
 * API Connection Configuration
 *
 * Toggle 'USE_REAL_BACKEND' to true to connect the React Native app
 * to the Node.js Express + MongoDB backend.
 */
export const USE_REAL_BACKEND = true;

/**
 * >>> AFTER YOU DEPLOY THE BACKEND TO RENDER, PASTE THE URL HERE. <<<
 *
 * It will look like:  https://urban-cruise-lms-backend.onrender.com
 * Do NOT add a trailing slash and do NOT add "/api" here — that is added below.
 */
export const PRODUCTION_API_HOST = 'https://urban-cruise-lms-backend.onrender.com';

export const API_BASE_URL = Platform.select({
  // The packaged APK / real device must use the public Render URL.
  android: `${PRODUCTION_API_HOST}/api`,
  ios: `${PRODUCTION_API_HOST}/api`,
  // Web during local development can talk straight to the local server.
  web: 'http://localhost:5000/api',
  default: `${PRODUCTION_API_HOST}/api`,
});
