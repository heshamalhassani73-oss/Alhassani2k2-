/**
 * Transaction Model - نموذج المعاملة
 * Defines the structure and states for transactions in Warid 3.0
 */

// Transaction States / حالات المعاملة
export const TransactionStatus = {
  ARRIVED: 'arrived',        // وصلت
  REGISTERING: 'registering', // قيد التسجيل
  ACTIVE: 'active',           // نشطة
  DIRECTED: 'directed',       // موجّهة
  PENDING_RESPONSE: 'pending_response', // منتظرة رد
  SUSPENDED: 'suspended',     // معلّقة
  DELAYED: 'delayed',         // متأخرة
  COMPLETED: 'completed',     // مكتملة
  ARCHIVED: 'archived'        // مؤرشفة
};

// Transaction Priority / أولوية المعاملة
export const TransactionPriority = {
  NORMAL: 'normal',     // عادي
  URGENT: 'urgent',     // عاجل
  VERY_URGENT: 'very_urgent' // عاجل جداً
};

/**
 * Transaction Type Definition
 * @typedef {Object} Transaction
 * @property {string} id - Unique identifier
 * @property {string} referenceNumber - Reference number (رقم المعاملة)
 * @property {string} subject - Subject/title (الموضوع)
 * @property {string} sender - Sender entity (الجهة المرسلة)
 * @property {string} recipient - Recipient entity (الجهة المستقبلة)
 * @property {string} dateReceived - Date received (تاريخ الاستلام)
 * @property {string} status - Current status from TransactionStatus
 * @property {string} priority - Priority level from TransactionPriority
 * @property {string} dueDate - Due date for completion (تاريخ الانتهاء)
 * @property {string} description - Detailed description (الوصف)
 * @property {Array<string>} attachments - Array of attachment file paths
 * @property {string} assignedTo - Assigned employee/department (المكلف بالمعاملة)
 * @property {Array<Object>} history - Transaction history log
 * @property {string} notes - Additional notes (ملاحظات)
 * @property {boolean} isDeleted - Soft delete flag
 * @property {string} deletedAt - Deletion timestamp
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 */

/**
 * Create a new transaction object
 * @param {Partial<Transaction>} data - Transaction data
 * @returns {Transaction}
 */
export const createTransaction = (data = {}) => {
  const now = new Date().toISOString();
  return {
    id: data.id || `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    referenceNumber: data.referenceNumber || '',
    subject: data.subject || '',
    sender: data.sender || '',
    recipient: data.recipient || '',
    dateReceived: data.dateReceived || now,
    status: data.status || TransactionStatus.ARRIVED,
    priority: data.priority || TransactionPriority.NORMAL,
    dueDate: data.dueDate || null,
    description: data.description || '',
    attachments: data.attachments || [],
    assignedTo: data.assignedTo || null,
    history: data.history || [{
      status: data.status || TransactionStatus.ARRIVED,
      timestamp: now,
      note: 'تم استلام المعاملة'
    }],
    notes: data.notes || '',
    isDeleted: false,
    deletedAt: null,
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now
  };
};

/**
 * Get status display name in Arabic
 * @param {string} status - Status key
 * @returns {string}
 */
export const getStatusName = (status) => {
  const statusNames = {
    [TransactionStatus.ARRIVED]: 'وصلت',
    [TransactionStatus.REGISTERING]: 'قيد التسجيل',
    [TransactionStatus.ACTIVE]: 'نشطة',
    [TransactionStatus.DIRECTED]: 'موجّهة',
    [TransactionStatus.PENDING_RESPONSE]: 'منتظرة رد',
    [TransactionStatus.SUSPENDED]: 'معلّقة',
    [TransactionStatus.DELAYED]: 'متأخرة',
    [TransactionStatus.COMPLETED]: 'مكتملة',
    [TransactionStatus.ARCHIVED]: 'مؤرشفة'
  };
  return statusNames[status] || status;
};

/**
 * Get status color for UI
 * @param {string} status - Status key
 * @returns {string}
 */
export const getStatusColor = (status) => {
  const statusColors = {
    [TransactionStatus.ARRIVED]: '#3498db',        // Blue
    [TransactionStatus.REGISTERING]: '#f39c12',    // Orange
    [TransactionStatus.ACTIVE]: '#2ecc71',         // Green
    [TransactionStatus.DIRECTED]: '#9b59b6',       // Purple
    [TransactionStatus.PENDING_RESPONSE]: '#e67e22', // Dark Orange
    [TransactionStatus.SUSPENDED]: '#95a5a6',      // Grey
    [TransactionStatus.DELAYED]: '#e74c3c',        // Red
    [TransactionStatus.COMPLETED]: '#27ae60',      // Dark Green
    [TransactionStatus.ARCHIVED]: '#7f8c8d'        // Dark Grey
  };
  return statusColors[status] || '#95a5a6';
};

/**
 * Get priority display name in Arabic
 * @param {string} priority - Priority key
 * @returns {string}
 */
export const getPriorityName = (priority) => {
  const priorityNames = {
    [TransactionPriority.NORMAL]: 'عادي',
    [TransactionPriority.URGENT]: 'عاجل',
    [TransactionPriority.VERY_URGENT]: 'عاجل جداً'
  };
  return priorityNames[priority] || priority;
};

/**
 * Get priority color for UI
 * @param {string} priority - Priority key
 * @returns {string}
 */
export const getPriorityColor = (priority) => {
  const priorityColors = {
    [TransactionPriority.NORMAL]: '#95a5a6',
    [TransactionPriority.URGENT]: '#f39c12',
    [TransactionPriority.VERY_URGENT]: '#e74c3c'
  };
  return priorityColors[priority] || '#95a5a6';
};

export default {
  TransactionStatus,
  TransactionPriority,
  createTransaction,
  getStatusName,
  getStatusColor,
  getPriorityName,
  getPriorityColor
};
