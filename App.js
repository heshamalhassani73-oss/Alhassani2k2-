import React from 'react';
import { I18nManager } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import FileBrowser from './src/screens/FileBrowser';
import CleanerScreen from './src/screens/CleanerScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import i18n from './src/i18n';

const Stack = createNativeStackNavigator();

export default function App() {
  // enforce RTL when Arabic is active
  const isRTL = i18n.locale.startsWith('ar');
  I18nManager.allowRTL(isRTL);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: true }}>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: i18n.t('appName') }} />
        <Stack.Screen name="Browser" component={FileBrowser} options={{ title: i18n.t('files') }} />
        <Stack.Screen name="Cleaner" component={CleanerScreen} options={{ title: i18n.t('cleaner') }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: i18n.t('settings') }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
