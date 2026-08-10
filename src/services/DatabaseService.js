/**
 * Database Service - خدمة قاعدة البيانات
 * SQLite database management for Warid 3.0
 */

import * as SQLite from 'expo-sqlite';
import { TransactionStatus, TransactionPriority } from '../models/Transaction';

const DB_NAME = 'warid.db';
let db = null;

/**
 * Initialize database connection
 * @returns {Promise<SQLite.SQLiteDatabase>}
 */
export const initDatabase = async () => {
  try {
    db = await SQLite.openDatabaseAsync(DB_NAME);
    await createTables();
    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

/**
 * Get database instance
 * @returns {SQLite.SQLiteDatabase}
 */
export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};

/**
 * Create database tables
 */
const createTables = async () => {
  const database = getDatabase();
  
  // Transactions table / جدول المعاملات
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      reference_number TEXT UNIQUE NOT NULL,
      subject TEXT NOT NULL,
      sender TEXT,
      recipient TEXT,
      date_received TEXT NOT NULL,
      status TEXT DEFAULT 'arrived',
      priority TEXT DEFAULT 'normal',
      due_date TEXT,
      description TEXT,
      attachments TEXT,
      assigned_to TEXT,
      history TEXT,
      notes TEXT,
      is_deleted INTEGER DEFAULT 0,
      deleted_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Transaction history table / جدول سجل المعاملات
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS transaction_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id TEXT NOT NULL,
      old_status TEXT,
      new_status TEXT NOT NULL,
      note TEXT,
      performed_by TEXT,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
    )
  `);

  // Users/Employees table / جدول المستخدمين/الموظفين
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      role TEXT DEFAULT 'user',
      department TEXT,
      pin_hash TEXT,
      biometric_enabled INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Departments table / جدول الأقسام
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS departments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      parent_id TEXT,
      manager_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Notifications table / جدول الإشعارات
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      transaction_id TEXT,
      is_read INTEGER DEFAULT 0,
      scheduled_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
    )
  `);

  // Deleted items (for trash bin) / العناصر المحذوفة
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS deleted_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_type TEXT NOT NULL,
      item_id TEXT NOT NULL,
      item_data TEXT NOT NULL,
      deleted_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    )
  `);

  // Create indexes / إنشاء الفهارس
  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_transactions_status 
    ON transactions(status)
  `);
  
  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_transactions_priority 
    ON transactions(priority)
  `);
  
  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_transactions_reference 
    ON transactions(reference_number)
  `);
  
  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_transactions_deleted 
    ON transactions(is_deleted)
  `);

  console.log('Database tables created successfully');
};

/**
 * Insert a new transaction
 * @param {Object} transaction - Transaction data
 * @returns {Promise<Object>}
 */
export const insertTransaction = async (transaction) => {
  const database = getDatabase();
  const attachments = JSON.stringify(transaction.attachments || []);
  const history = JSON.stringify(transaction.history || []);
  
  await database.runAsync(
    `INSERT INTO transactions (
      id, reference_number, subject, sender, recipient, 
      date_received, status, priority, due_date, description,
      attachments, assigned_to, history, notes, is_deleted, 
      deleted_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      transaction.id,
      transaction.referenceNumber,
      transaction.subject,
      transaction.sender,
      transaction.recipient,
      transaction.dateReceived,
      transaction.status,
      transaction.priority,
      transaction.dueDate,
      transaction.description,
      attachments,
      transaction.assignedTo,
      history,
      transaction.notes,
      transaction.isDeleted ? 1 : 0,
      transaction.deletedAt,
      transaction.createdAt,
      transaction.updatedAt
    ]
  );
  
  return transaction;
};

/**
 * Update a transaction
 * @param {string} id - Transaction ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateTransaction = async (id, updates) => {
  const database = getDatabase();
  const now = new Date().toISOString();
  
  const setClauses = [];
  const values = [];
  
  if (updates.referenceNumber !== undefined) {
    setClauses.push('reference_number = ?');
    values.push(updates.referenceNumber);
  }
  if (updates.subject !== undefined) {
    setClauses.push('subject = ?');
    values.push(updates.subject);
  }
  if (updates.sender !== undefined) {
    setClauses.push('sender = ?');
    values.push(updates.sender);
  }
  if (updates.recipient !== undefined) {
    setClauses.push('recipient = ?');
    values.push(updates.recipient);
  }
  if (updates.status !== undefined) {
    setClauses.push('status = ?');
    values.push(updates.status);
  }
  if (updates.priority !== undefined) {
    setClauses.push('priority = ?');
    values.push(updates.priority);
  }
  if (updates.dueDate !== undefined) {
    setClauses.push('due_date = ?');
    values.push(updates.dueDate);
  }
  if (updates.description !== undefined) {
    setClauses.push('description = ?');
    values.push(updates.description);
  }
  if (updates.attachments !== undefined) {
    setClauses.push('attachments = ?');
    values.push(JSON.stringify(updates.attachments));
  }
  if (updates.assignedTo !== undefined) {
    setClauses.push('assigned_to = ?');
    values.push(updates.assignedTo);
  }
  if (updates.history !== undefined) {
    setClauses.push('history = ?');
    values.push(JSON.stringify(updates.history));
  }
  if (updates.notes !== undefined) {
    setClauses.push('notes = ?');
    values.push(updates.notes);
  }
  if (updates.isDeleted !== undefined) {
    setClauses.push('is_deleted = ?');
    values.push(updates.isDeleted ? 1 : 0);
  }
  if (updates.deletedAt !== undefined) {
    setClauses.push('deleted_at = ?');
    values.push(updates.deletedAt);
  }
  
  setClauses.push('updated_at = ?');
  values.push(now);
  values.push(id);
  
  await database.runAsync(
    `UPDATE transactions SET ${setClauses.join(', ')} WHERE id = ?`,
    values
  );
};

/**
 * Get transaction by ID
 * @param {string} id - Transaction ID
 * @returns {Promise<Object|null>}
 */
export const getTransactionById = async (id) => {
  const database = getDatabase();
  const result = await database.getFirstAsync(
    'SELECT * FROM transactions WHERE id = ?',
    [id]
  );
  
  if (result) {
    return mapDbRowToTransaction(result);
  }
  return null;
};

/**
 * Get all transactions with filters
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>}
 */
export const getAllTransactions = async (filters = {}) => {
  const database = getDatabase();
  
  let query = 'SELECT * FROM transactions WHERE 1=1';
  const params = [];
  
  if (filters.status) {
    query += ' AND status = ?';
    params.push(filters.status);
  }
  
  if (filters.priority) {
    query += ' AND priority = ?';
    params.push(filters.priority);
  }
  
  if (filters.search) {
    query += ' AND (subject LIKE ? OR reference_number LIKE ? OR sender LIKE ?)';
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  if (filters.isDeleted !== undefined) {
    query += ' AND is_deleted = ?';
    params.push(filters.isDeleted ? 1 : 0);
  } else {
    query += ' AND is_deleted = 0';
  }
  
  if (filters.assignedTo) {
    query += ' AND assigned_to = ?';
    params.push(filters.assignedTo);
  }
  
  if (filters.dateFrom) {
    query += ' AND date_received >= ?';
    params.push(filters.dateFrom);
  }
  
  if (filters.dateTo) {
    query += ' AND date_received <= ?';
    params.push(filters.dateTo);
  }
  
  query += ' ORDER BY created_at DESC';
  
  if (filters.limit) {
    query += ' LIMIT ?';
    params.push(filters.limit);
  }
  
  const results = await database.getAllAsync(query, params);
  return results.map(mapDbRowToTransaction);
};

/**
 * Delete transaction (soft delete)
 * @param {string} id - Transaction ID
 * @returns {Promise<void>}
 */
export const deleteTransaction = async (id) => {
  const now = new Date().toISOString();
  await updateTransaction(id, {
    isDeleted: true,
    deletedAt: now
  });
  
  // Add to deleted_items for trash bin
  const transaction = await getTransactionById(id);
  if (transaction) {
    const database = getDatabase();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
    
    await database.runAsync(
      `INSERT INTO deleted_items (item_type, item_id, item_data, deleted_at, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      ['transaction', id, JSON.stringify(transaction), now, expiresAt]
    );
  }
};

/**
 * Restore deleted transaction
 * @param {string} id - Transaction ID
 * @returns {Promise<void>}
 */
export const restoreTransaction = async (id) => {
  await updateTransaction(id, {
    isDeleted: false,
    deletedAt: null
  });
  
  const database = getDatabase();
  await database.runAsync(
    'DELETE FROM deleted_items WHERE item_type = ? AND item_id = ?',
    ['transaction', id]
  );
};

/**
 * Permanently delete transaction
 * @param {string} id - Transaction ID
 * @returns {Promise<void>}
 */
export const permanentlyDeleteTransaction = async (id) => {
  const database = getDatabase();
  await database.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
  await database.runAsync(
    'DELETE FROM deleted_items WHERE item_type = ? AND item_id = ?',
    ['transaction', id]
  );
};

/**
 * Get statistics for dashboard
 * @returns {Promise<Object>}
 */
export const getStatistics = async () => {
  const database = getDatabase();
  
  const total = await database.getFirstAsync(
    'SELECT COUNT(*) as count FROM transactions WHERE is_deleted = 0'
  );
  
  const byStatus = await database.getAllAsync(
    `SELECT status, COUNT(*) as count 
     FROM transactions 
     WHERE is_deleted = 0 
     GROUP BY status`
  );
  
  const byPriority = await database.getAllAsync(
    `SELECT priority, COUNT(*) as count 
     FROM transactions 
     WHERE is_deleted = 0 
     GROUP BY priority`
  );
  
  const delayed = await database.getFirstAsync(
    `SELECT COUNT(*) as count 
     FROM transactions 
     WHERE is_deleted = 0 
     AND status NOT IN ('completed', 'archived')
     AND due_date < ?`,
    [new Date().toISOString()]
  );
  
  const urgent = await database.getFirstAsync(
    `SELECT COUNT(*) as count 
     FROM transactions 
     WHERE is_deleted = 0 
     AND priority IN ('urgent', 'very_urgent')
     AND status NOT IN ('completed', 'archived')`
  );
  
  const deletedCount = await database.getFirstAsync(
    'SELECT COUNT(*) as count FROM transactions WHERE is_deleted = 1'
  );
  
  return {
    total: total?.count || 0,
    byStatus: byStatus.reduce((acc, item) => {
      acc[item.status] = item.count;
      return acc;
    }, {}),
    byPriority: byPriority.reduce((acc, item) => {
      acc[item.priority] = item.count;
      return acc;
    }, {}),
    delayed: delayed?.count || 0,
    urgent: urgent?.count || 0,
    deletedCount: deletedCount?.count || 0
  };
};

/**
 * Helper function to map database row to transaction object
 * @param {Object} row - Database row
 * @returns {Object}
 */
const mapDbRowToTransaction = (row) => {
  return {
    id: row.id,
    referenceNumber: row.reference_number,
    subject: row.subject,
    sender: row.sender,
    recipient: row.recipient,
    dateReceived: row.date_received,
    status: row.status,
    priority: row.priority,
    dueDate: row.due_date,
    description: row.description,
    attachments: JSON.parse(row.attachments || '[]'),
    assignedTo: row.assigned_to,
    history: JSON.parse(row.history || '[]'),
    notes: row.notes,
    isDeleted: row.is_deleted === 1,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

/**
 * Clean up expired deleted items
 * @returns {Promise<number>} Number of items cleaned
 */
export const cleanupExpiredDeletedItems = async () => {
  const database = getDatabase();
  const now = new Date().toISOString();
  
  const result = await database.runAsync(
    'DELETE FROM deleted_items WHERE expires_at < ?',
    [now]
  );
  
  return result.changes || 0;
};

export default {
  initDatabase,
  getDatabase,
  insertTransaction,
  updateTransaction,
  getTransactionById,
  getAllTransactions,
  deleteTransaction,
  restoreTransaction,
  permanentlyDeleteTransaction,
  getStatistics,
  cleanupExpiredDeletedItems
};
