/**
 * Navigation Configuration - إعدادات التنقل
 * Main navigation structure for Warid 3.0
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Screens
import DashboardScreen from './screens/DashboardScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Placeholder screens (to be implemented)
const PlaceholderScreen = ({ route }) => {
  const React = require('react');
  const { View, Text, StyleSheet } = require('react-native');
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>{route.name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 18,
    color: '#95a5a6',
  },
});

/**
 * Main Tab Navigator
 */
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'dashboard' : 'dashboard-outlined';
              break;
            case 'Transactions':
              iconName = focused ? 'folder' : 'folder-outlined';
              break;
            case 'Search':
              iconName = focused ? 'search' : 'search';
              break;
            case 'Reports':
              iconName = focused ? 'assessment' : 'assessment';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: '#95a5a6',
        tabBarStyle: {
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'الرئيسية' }}
      />
      <Tab.Screen 
        name="Transactions" 
        component={PlaceholderScreen}
        options={{ title: 'المعاملات' }}
      />
      <Tab.Screen 
        name="Search" 
        component={PlaceholderScreen}
        options={{ title: 'بحث' }}
      />
      <Tab.Screen 
        name="Reports" 
        component={PlaceholderScreen}
        options={{ title: 'التقارير' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={PlaceholderScreen}
        options={{ title: 'الإعدادات' }}
      />
    </Tab.Navigator>
  );
};

/**
 * Root Stack Navigator
 */
const RootStack = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#3498db',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TransactionDetails"
          component={PlaceholderScreen}
          options={{ title: 'تفاصيل المعاملة' }}
        />
        <Stack.Screen
          name="NewTransaction"
          component={PlaceholderScreen}
          options={{ title: 'معاملة جديدة' }}
        />
        <Stack.Screen
          name="Notifications"
          component={PlaceholderScreen}
          options={{ title: 'الإشعارات' }}
        />
        <Stack.Screen
          name="Trash"
          component={PlaceholderScreen}
          options={{ title: 'المحذوفات' }}
        />
        <Stack.Screen
          name="Auth"
          component={PlaceholderScreen}
          options={{ 
            title: 'المصادقة',
            presentation: 'modal'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootStack;
