/**
 * Notification Service - خدمة الإشعارات
 * Smart notification system for Warid 3.0
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotificationReceivedAsync: async (notification) => {
    console.log('Notification received:', notification);
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
  handleNotificationResponseAsync: async (response) => {
    console.log('Notification response:', response);
    // Handle navigation based on notification data
    const data = response.notification.request.content.data;
    return data;
  },
});

/**
 * Request notification permissions
 * @returns {Promise<Object>}
 */
export const requestPermissions = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
      return { granted: false };
    }
    
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
      
      await Notifications.setNotificationChannelAsync('urgent', {
        name: 'urgent',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        showBadge: true,
      });
    }
    
    return { granted: true };
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return { granted: false, error };
  }
};

/**
 * Schedule a local notification
 * @param {Object} options - Notification options
 * @returns {Promise<string>} Notification ID
 */
export const scheduleNotification = async (options) => {
  const {
    title,
    message,
    data = {},
    trigger = null,
    channelId = 'default'
  } = options;
  
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body: message,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger,
    });
    
    console.log('Notification scheduled:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    throw error;
  }
};

/**
 * Send immediate notification
 * @param {Object} options - Notification options
 * @returns {Promise<string>} Notification ID
 */
export const sendNotification = async (options) => {
  return await scheduleNotification({
    ...options,
    trigger: null
  });
};

/**
 * Schedule deadline reminder notifications
 * @param {Object} transaction - Transaction data
 * @returns {Promise<Array>} Array of notification IDs
 */
export const scheduleDeadlineReminders = async (transaction) => {
  const notificationIds = [];
  
  if (!transaction.dueDate) {
    return notificationIds;
  }
  
  const dueDate = new Date(transaction.dueDate);
  const now = new Date();
  
  // 24 hours before deadline
  const oneDayBefore = new Date(dueDate.getTime() - 24 * 60 * 60 * 1000);
  if (oneDayBefore > now) {
    const id = await scheduleNotification({
      title: 'تذكير بانتهاء المهلة',
      message: `المعاملة "${transaction.subject}" تنتهي مهلتها خلال 24 ساعة`,
      data: { transactionId: transaction.id, type: 'deadline_24h' },
      trigger: { date: oneDayBefore },
      channelId: 'urgent'
    });
    notificationIds.push(id);
  }
  
  // 2 hours before deadline
  const twoHoursBefore = new Date(dueDate.getTime() - 2 * 60 * 60 * 1000);
  if (twoHoursBefore > now) {
    const id = await scheduleNotification({
      title: 'تنبيه عاجل - انتهاء المهلة',
      message: `المعاملة "${transaction.subject}" تنتهي مهلتها خلال ساعتين`,
      data: { transactionId: transaction.id, type: 'deadline_2h' },
      trigger: { date: twoHoursBefore },
      channelId: 'urgent'
    });
    notificationIds.push(id);
  }
  
  return notificationIds;
};

/**
 * Send transaction status update notification
 * @param {Object} transaction - Transaction data
 * @param {string} oldStatus - Previous status
 * @param {string} newStatus - New status
 * @returns {Promise<string>} Notification ID
 */
export const sendStatusUpdateNotification = async (transaction, oldStatus, newStatus) => {
  const statusNames = {
    arrived: 'وصلت',
    registering: 'قيد التسجيل',
    active: 'نشطة',
    directed: 'موجّهة',
    pending_response: 'منتظرة رد',
    suspended: 'معلّقة',
    delayed: 'متأخرة',
    completed: 'مكتملة',
    archived: 'مؤرشفة'
  };
  
  const title = 'تحديث حالة المعاملة';
  const message = `تم تغيير حالة المعاملة "${transaction.subject}" إلى: ${statusNames[newStatus] || newStatus}`;
  
  return await sendNotification({
    title,
    message,
    data: { 
      transactionId: transaction.id, 
      type: 'status_update',
      oldStatus,
      newStatus 
    }
  });
};

/**
 * Send urgent transaction notification
 * @param {Object} transaction - Transaction data
 * @returns {Promise<string>} Notification ID
 */
export const sendUrgentTransactionNotification = async (transaction) => {
  const priorityNames = {
    normal: 'عادي',
    urgent: 'عاجل',
    very_urgent: 'عاجل جداً'
  };
  
  const title = 'معاملة عاجلة جديدة';
  const message = `معاملة عاجلة (${priorityNames[transaction.priority]}): "${transaction.subject}"`;
  
  return await sendNotification({
    title,
    message,
    data: { transactionId: transaction.id, type: 'urgent_transaction' },
    channelId: 'urgent'
  });
};

/**
 * Cancel a scheduled notification
 * @param {string} notificationId - Notification ID
 * @returns {Promise<void>}
 */
export const cancelNotification = async (notificationId) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log('Notification cancelled:', notificationId);
  } catch (error) {
    console.error('Error cancelling notification:', error);
  }
};

/**
 * Cancel all scheduled notifications
 * @returns {Promise<void>}
 */
export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications cancelled');
  } catch (error) {
    console.error('Error cancelling all notifications:', error);
  }
};

/**
 * Get all scheduled notifications
 * @returns {Promise<Array>}
 */
export const getScheduledNotifications = async () => {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    return notifications;
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
};

/**
 * Check for overdue transactions and send notifications
 * @param {Array} transactions - Array of transactions to check
 * @returns {Promise<number>} Number of notifications sent
 */
export const checkOverdueTransactions = async (transactions) => {
  const now = new Date();
  let notificationsSent = 0;
  
  for (const transaction of transactions) {
    if (transaction.dueDate && !['completed', 'archived'].includes(transaction.status)) {
      const dueDate = new Date(transaction.dueDate);
      
      if (dueDate < now) {
        await sendNotification({
          title: 'معاملة متأخرة',
          message: `المعاملة "${transaction.subject}" تجاوزت موعد الانتهاء`,
          data: { transactionId: transaction.id, type: 'overdue' },
          channelId: 'urgent'
        });
        notificationsSent++;
      }
    }
  }
  
  return notificationsSent;
};

/**
 * Set badge count
 * @param {number} count - Badge count
 * @returns {Promise<void>}
 */
export const setBadgeCount = async (count) => {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.error('Error setting badge count:', error);
  }
};

/**
 * Get badge count
 * @returns {Promise<number>}
 */
export const getBadgeCount = async () => {
  try {
    const count = await Notifications.getBadgeCountAsync();
    return count;
  } catch (error) {
    console.error('Error getting badge count:', error);
    return 0;
  }
};

export default {
  requestPermissions,
  scheduleNotification,
  sendNotification,
  scheduleDeadlineReminders,
  sendStatusUpdateNotification,
  sendUrgentTransactionNotification,
  cancelNotification,
  cancelAllNotifications,
  getScheduledNotifications,
  checkOverdueTransactions,
  setBadgeCount,
  getBadgeCount
};
