/**
 * Authentication Service - خدمة المصادقة
 * PIN and Biometric authentication for Warid 3.0
 */

import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_STORAGE_KEY = '@warid_auth';
const PIN_STORAGE_KEY = '@warid_pin';

/**
 * Check if biometric authentication is available
 * @returns {Promise<Object>}
 */
export const checkBiometricAvailability = async () => {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedAuthenticationTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
    
    return {
      available: hasHardware && isEnrolled,
      hasHardware,
      isEnrolled,
      supportedTypes: supportedAuthenticationTypes
    };
  } catch (error) {
    console.error('Error checking biometric availability:', error);
    return {
      available: false,
      hasHardware: false,
      isEnrolled: false,
      supportedTypes: [],
      error
    };
  }
};

/**
 * Authenticate using biometrics
 * @param {string} promptMessage - Message to display in prompt
 * @returns {Promise<Object>}
 */
export const authenticateWithBiometrics = async (promptMessage = 'المصادقة للدخول') => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel: 'استخدام PIN',
      cancelLabel: 'إلغاء',
      disableDeviceFallback: true,
    });
    
    return {
      success: result.success,
      error: result.error
    };
  } catch (error) {
    console.error('Biometric authentication error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Set PIN code
 * @param {string} pin - 4-6 digit PIN
 * @returns {Promise<boolean>}
 */
export const setPin = async (pin) => {
  try {
    // Simple hash (in production, use proper hashing like bcrypt)
    const hashedPin = hashPin(pin);
    await AsyncStorage.setItem(PIN_STORAGE_KEY, hashedPin);
    return true;
  } catch (error) {
    console.error('Error setting PIN:', error);
    return false;
  }
};

/**
 * Verify PIN code
 * @param {string} pin - PIN to verify
 * @returns {Promise<boolean>}
 */
export const verifyPin = async (pin) => {
  try {
    const storedHash = await AsyncStorage.getItem(PIN_STORAGE_KEY);
    if (!storedHash) {
      return false;
    }
    const hashedPin = hashPin(pin);
    return storedHash === hashedPin;
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return false;
  }
};

/**
 * Check if PIN is set
 * @returns {Promise<boolean>}
 */
export const isPinSet = async () => {
  try {
    const pin = await AsyncStorage.getItem(PIN_STORAGE_KEY);
    return !!pin;
  } catch (error) {
    console.error('Error checking PIN:', error);
    return false;
  }
};

/**
 * Remove PIN
 * @returns {Promise<boolean>}
 */
export const removePin = async () => {
  try {
    await AsyncStorage.removeItem(PIN_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error removing PIN:', error);
    return false;
  }
};

/**
 * Save authentication settings
 * @param {Object} settings - Authentication settings
 * @returns {Promise<boolean>}
 */
export const saveAuthSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving auth settings:', error);
    return false;
  }
};

/**
 * Get authentication settings
 * @returns {Promise<Object>}
 */
export const getAuthSettings = async () => {
  try {
    const settings = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    return settings ? JSON.parse(settings) : {
      biometricEnabled: false,
      pinEnabled: false,
      requireAuthOnLaunch: false
    };
  } catch (error) {
    console.error('Error getting auth settings:', error);
    return {
      biometricEnabled: false,
      pinEnabled: false,
      requireAuthOnLaunch: false
    };
  }
};

/**
 * Enable/disable biometric authentication
 * @param {boolean} enabled - Enable or disable
 * @returns {Promise<boolean>}
 */
export const setBiometricEnabled = async (enabled) => {
  if (enabled) {
    const bioAvailability = await checkBiometricAvailability();
    if (!bioAvailability.available) {
      return false;
    }
  }
  
  const settings = await getAuthSettings();
  settings.biometricEnabled = enabled;
  return await saveAuthSettings(settings);
};

/**
 * Enable/disable PIN authentication
 * @param {boolean} enabled - Enable or disable
 * @returns {Promise<boolean>}
 */
export const setPinEnabled = async (enabled) => {
  const settings = await getAuthSettings();
  settings.pinEnabled = enabled;
  return await saveAuthSettings(settings);
};

/**
 * Authenticate user (biometric or PIN)
 * @returns {Promise<Object>}
 */
export const authenticateUser = async () => {
  const settings = await getAuthSettings();
  
  // If no authentication is required, grant access
  if (!settings.biometricEnabled && !settings.pinEnabled) {
    return { success: true, method: 'none' };
  }
  
  // Try biometric first if enabled
  if (settings.biometricEnabled) {
    const bioResult = await authenticateWithBiometrics();
    if (bioResult.success) {
      return { success: true, method: 'biometric' };
    }
  }
  
  // If biometric failed or not enabled, return false
  // (PIN entry will be handled by UI)
  return { success: false, method: null };
};

/**
 * Simple PIN hash function (NOT secure for production!)
 * In production, use a proper library like bcrypt or argon2
 * @param {string} pin - PIN to hash
 * @returns {string}
 */
const hashPin = (pin) => {
  // Simple hash for demo purposes
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `pin_${Math.abs(hash).toString(16)}`;
};

/**
 * Validate PIN format
 * @param {string} pin - PIN to validate
 * @returns {boolean}
 */
export const isValidPin = (pin) => {
  return /^\d{4,6}$/.test(pin);
};

/**
 * Clear all authentication data
 * @returns {Promise<boolean>}
 */
export const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove([AUTH_STORAGE_KEY, PIN_STORAGE_KEY]);
    return true;
  } catch (error) {
    console.error('Error clearing auth data:', error);
    return false;
  }
};

export default {
  checkBiometricAvailability,
  authenticateWithBiometrics,
  setPin,
  verifyPin,
  isPinSet,
  removePin,
  saveAuthSettings,
  getAuthSettings,
  setBiometricEnabled,
  setPinEnabled,
  authenticateUser,
  isValidPin,
  clearAuthData
};
