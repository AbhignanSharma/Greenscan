// Configuration file for AD Agri Mobile App

import { BACKEND_URL_DEV, BACKEND_URL_PROD, FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_DATABASE_URL, FIREBASE_PROJECT_ID, FIREBASE_STORAGE_BUCKET, FIREBASE_MESSAGING_SENDER_ID, FIREBASE_APP_ID, FIREBASE_MEASUREMENT_ID } from '@env';

// Backend Configuration
export const BACKEND_CONFIG = {
  // Development URL - Replace with your computer's IP address
  development: BACKEND_URL_DEV,
  
  // Production URL - Replace with your ngrok URL when deploying
  production: BACKEND_URL_PROD,
  
  // Get the appropriate URL based on environment
  getUrl: () => {
    return __DEV__ ? BACKEND_URL_DEV : BACKEND_URL_PROD;
  }
};

// Firebase Configuration
export const FIREBASE_CONFIG = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  databaseURL: FIREBASE_DATABASE_URL,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID
};

// App Configuration
export const APP_CONFIG = {
  appName: "GreenScan",
  version: "1.0.0",
  // Add other app-wide configuration here
}; 