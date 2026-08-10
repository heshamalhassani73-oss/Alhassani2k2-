/**
 * Warid 3.0 - نظام إدارة وتتبع المعاملات
 * Main Application Entry Point
 */

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { initDatabase } from './src/services/DatabaseService';
import { requestPermissions as requestNotificationPermissions } from './src/services/NotificationService';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize database
      console.log('Initializing database...');
      await initDatabase();
      
      // Request notification permissions
      console.log('Requesting notification permissions...');
      await requestNotificationPermissions();
      
      setAppReady(true);
    } catch (err) {
      console.error('App initialization error:', err);
      setError(err.message);
    }
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>حدث خطأ في التطبيق</Text>
        <Text style={styles.errorMessage}>{error}</Text>
      </View>
    );
  }

  if (!appReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>جاري تحميل وارد 3.0...</Text>
      </View>
    );
  }

  return (
    <>
      <AppNavigator />
      <StatusBar style="light" />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#2c3e50',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});
