import initSqlJs from 'sql.js';

let db = null;
let SQL = null;

export const getDB = () => db;

export const initDB = async () => {
  try {
    // Initialize SQL.js with local WASM files from public folder
    SQL = await initSqlJs({
      locateFile: file => `/sql-wasm.wasm`
    });

    // Try to load existing database from localStorage
    const savedDb = localStorage.getItem('expenseDB');
    if (savedDb) {
      const uint8Array = new Uint8Array(JSON.parse(savedDb));
      db = new SQL.Database(uint8Array);
      
      // Check if users table exists, if not perform migration
      const tableCheck = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
      if (tableCheck.length === 0) {
        // Old database without authentication - need to migrate or reset
        console.warn('Old database detected. Clearing and creating new schema with authentication...');
        
        // Clear old database
        localStorage.removeItem('expenseDB');
        
        // Create new database with proper schema
        db = new SQL.Database();
        createTables();
      } else {
        // Check if user_id column exists in expenses table (to verify migration)
        try {
          db.exec("SELECT user_id FROM expenses LIMIT 1");
        } catch (e) {
          // user_id column doesn't exist - need full migration
          console.warn('Database schema mismatch. Clearing and creating new schema...');
          localStorage.removeItem('expenseDB');
          db = new SQL.Database();
          createTables();
        }
      }
    } else {
      db = new SQL.Database();
      createTables();
    }

    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
};

const createUserTable = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  saveDB();
};

const createTables = () => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Expenses table
  db.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      category_id INTEGER NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      payment_method TEXT,
      tags TEXT,
      receipt_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  // Categories table
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      icon TEXT,
      color TEXT,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      budget_limit REAL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Budgets table
  db.run(`
    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category_id INTEGER,
      amount REAL NOT NULL,
      period TEXT NOT NULL CHECK(period IN ('daily', 'weekly', 'monthly', 'yearly')),
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      alert_threshold REAL DEFAULT 80,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  // Recurring expenses table
  db.run(`
    CREATE TABLE IF NOT EXISTS recurring_expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      category_id INTEGER NOT NULL,
      description TEXT,
      frequency TEXT NOT NULL CHECK(frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
      start_date TEXT NOT NULL,
      end_date TEXT,
      next_occurrence TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      payment_method TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  // Savings goals table
  db.run(`
    CREATE TABLE IF NOT EXISTS savings_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      target_amount REAL NOT NULL,
      current_amount REAL DEFAULT 0,
      deadline TEXT,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  saveDB();
};

export const insertDefaultCategories = (userId) => {
  const defaultCategories = [
    // Expense categories
    { name: 'Food & Dining', icon: '🍔', color: '#ef4444', type: 'expense' },
    { name: 'Transportation', icon: '🚗', color: '#f97316', type: 'expense' },
    { name: 'Shopping', icon: '🛍️', color: '#ec4899', type: 'expense' },
    { name: 'Entertainment', icon: '🎮', color: '#a855f7', type: 'expense' },
    { name: 'Bills & Utilities', icon: '⚡', color: '#3b82f6', type: 'expense' },
    { name: 'Healthcare', icon: '🏥', color: '#06b6d4', type: 'expense' },
    { name: 'Education', icon: '📚', color: '#14b8a6', type: 'expense' },
    { name: 'Personal Care', icon: '💅', color: '#8b5cf6', type: 'expense' },
    { name: 'Travel', icon: '✈️', color: '#0ea5e9', type: 'expense' },
    { name: 'Home', icon: '🏠', color: '#84cc16', type: 'expense' },
    { name: 'Other', icon: '📌', color: '#6b7280', type: 'expense' },
    
    // Income categories
    { name: 'Salary', icon: '💰', color: '#22c55e', type: 'income' },
    { name: 'Freelance', icon: '💼', color: '#10b981', type: 'income' },
    { name: 'Investment', icon: '📈', color: '#059669', type: 'income' },
    { name: 'Gift', icon: '🎁', color: '#34d399', type: 'income' },
    { name: 'Other Income', icon: '💵', color: '#6ee7b7', type: 'income' }
  ];

  const stmt = db.prepare('INSERT INTO categories (user_id, name, icon, color, type) VALUES (?, ?, ?, ?, ?)');
  defaultCategories.forEach(cat => {
    stmt.run([userId, cat.name, cat.icon, cat.color, cat.type]);
  });
  stmt.free();
  saveDB();
};

export const saveDB = () => {
  if (db) {
    const data = db.export();
    localStorage.setItem('expenseDB', JSON.stringify(Array.from(data)));
  }
};

// Expense operations
export const addExpense = (expense, userId) => {
  const stmt = db.prepare(`
    INSERT INTO expenses (user_id, amount, category_id, description, date, type, payment_method, tags, receipt_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run([
    userId,
    expense.amount,
    expense.category_id,
    expense.description,
    expense.date,
    expense.type,
    expense.payment_method || null,
    expense.tags || null,
    expense.receipt_url || null
  ]);
  stmt.free();
  saveDB();
  return db.exec('SELECT last_insert_rowid()')[0].values[0][0];
};

export const updateExpense = (id, expense) => {
  const stmt = db.prepare(`
    UPDATE expenses 
    SET amount = ?, category_id = ?, description = ?, date = ?, type = ?, payment_method = ?, tags = ?, receipt_url = ?
    WHERE id = ?
  `);
  stmt.run([
    expense.amount,
    expense.category_id,
    expense.description,
    expense.date,
    expense.type,
    expense.payment_method || null,
    expense.tags || null,
    expense.receipt_url || null,
    id
  ]);
  stmt.free();
  saveDB();
};

export const deleteExpense = (id) => {
  db.run('DELETE FROM expenses WHERE id = ?', [id]);
  saveDB();
};

export const getExpenses = (userId, filters = {}) => {
  let query = `
    SELECT e.*, c.name as category_name, c.icon as category_icon, c.color as category_color
    FROM expenses e
    LEFT JOIN categories c ON e.category_id = c.id
    WHERE e.user_id = ?
  `;
  const params = [userId];

  if (filters.type) {
    query += ' AND e.type = ?';
    params.push(filters.type);
  }

  if (filters.category_id) {
    query += ' AND e.category_id = ?';
    params.push(filters.category_id);
  }

  if (filters.startDate) {
    query += ' AND e.date >= ?';
    params.push(filters.startDate);
  }

  if (filters.endDate) {
    query += ' AND e.date <= ?';
    params.push(filters.endDate);
  }

  if (filters.search) {
    query += ' AND (e.description LIKE ? OR c.name LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  query += ' ORDER BY e.date DESC, e.id DESC';

  if (filters.limit) {
    query += ' LIMIT ?';
    params.push(filters.limit);
  }

  const result = db.exec(query, params);
  if (result.length === 0) return [];

  return result[0].values.map(row => ({
    id: row[0],
    user_id: row[1],
    amount: row[2],
    category_id: row[3],
    description: row[4],
    date: row[5],
    type: row[6],
    payment_method: row[7],
    tags: row[8],
    receipt_url: row[9],
    created_at: row[10],
    category_name: row[11],
    category_icon: row[12],
    category_color: row[13]
  }));
};

// Category operations
export const addCategory = (category, userId) => {
  const stmt = db.prepare('INSERT INTO categories (user_id, name, icon, color, type, budget_limit) VALUES (?, ?, ?, ?, ?, ?)');
  stmt.run([userId, category.name, category.icon, category.color, category.type, category.budget_limit || 0]);
  stmt.free();
  saveDB();
};

export const updateCategory = (id, category) => {
  const stmt = db.prepare('UPDATE categories SET name = ?, icon = ?, color = ?, budget_limit = ? WHERE id = ?');
  stmt.run([category.name, category.icon, category.color, category.budget_limit || 0, id]);
  stmt.free();
  saveDB();
};

export const deleteCategory = (id) => {
  db.run('DELETE FROM categories WHERE id = ?', [id]);
  saveDB();
};

export const getCategories = (userId, type = null) => {
  let query = 'SELECT * FROM categories WHERE user_id = ?';
  const params = [userId];
  
  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }
  
  query += ' ORDER BY name';

  const result = db.exec(query, params);
  if (result.length === 0) return [];

  return result[0].values.map(row => ({
    id: row[0],
    user_id: row[1],
    name: row[2],
    icon: row[3],
    color: row[4],
    type: row[5],
    budget_limit: row[6],
    created_at: row[7]
  }));
};

// Budget operations
export const addBudget = (budget, userId) => {
  const stmt = db.prepare(`
    INSERT INTO budgets (user_id, category_id, amount, period, start_date, end_date, alert_threshold)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run([
    userId,
    budget.category_id || null,
    budget.amount,
    budget.period,
    budget.start_date,
    budget.end_date,
    budget.alert_threshold || 80
  ]);
  stmt.free();
  saveDB();
};

export const getBudgets = (userId) => {
  const query = `
    SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color
    FROM budgets b
    LEFT JOIN categories c ON b.category_id = c.id
    WHERE b.user_id = ?
    ORDER BY b.created_at DESC
  `;

  const result = db.exec(query, [userId]);
  if (result.length === 0) return [];

  return result[0].values.map(row => ({
    id: row[0],
    user_id: row[1],
    category_id: row[2],
    amount: row[3],
    period: row[4],
    start_date: row[5],
    end_date: row[6],
    alert_threshold: row[7],
    created_at: row[8],
    category_name: row[9],
    category_icon: row[10],
    category_color: row[11]
  }));
};

export const deleteBudget = (id) => {
  db.run('DELETE FROM budgets WHERE id = ?', [id]);
  saveDB();
};

// Recurring expense operations
export const addRecurringExpense = (expense, userId) => {
  const stmt = db.prepare(`
    INSERT INTO recurring_expenses 
    (user_id, amount, category_id, description, frequency, start_date, end_date, next_occurrence, type, payment_method)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run([
    userId,
    expense.amount,
    expense.category_id,
    expense.description,
    expense.frequency,
    expense.start_date,
    expense.end_date || null,
    expense.next_occurrence,
    expense.type,
    expense.payment_method || null
  ]);
  stmt.free();
  saveDB();
};

export const getRecurringExpenses = (userId) => {
  const query = `
    SELECT r.*, c.name as category_name, c.icon as category_icon, c.color as category_color
    FROM recurring_expenses r
    LEFT JOIN categories c ON r.category_id = c.id
    WHERE r.user_id = ? AND r.is_active = 1
    ORDER BY r.next_occurrence
  `;

  const result = db.exec(query, [userId]);
  if (result.length === 0) return [];

  return result[0].values.map(row => ({
    id: row[0],
    user_id: row[1],
    amount: row[2],
    category_id: row[3],
    description: row[4],
    frequency: row[5],
    start_date: row[6],
    end_date: row[7],
    next_occurrence: row[8],
    is_active: row[9],
    type: row[10],
    payment_method: row[11],
    created_at: row[12],
    category_name: row[13],
    category_icon: row[14],
    category_color: row[15]
  }));
};

export const deleteRecurringExpense = (id) => {
  db.run('UPDATE recurring_expenses SET is_active = 0 WHERE id = ?', [id]);
  saveDB();
};

export const updateRecurringExpenseNextOccurrence = (id, nextDate) => {
  db.run('UPDATE recurring_expenses SET next_occurrence = ? WHERE id = ?', [nextDate, id]);
  saveDB();
};

// Savings goals operations
export const addSavingsGoal = (goal, userId) => {
  const stmt = db.prepare(`
    INSERT INTO savings_goals (user_id, name, target_amount, current_amount, deadline, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run([userId, goal.name, goal.target_amount, goal.current_amount || 0, goal.deadline || null, goal.description || null]);
  stmt.free();
  saveDB();
};

export const updateSavingsGoal = (id, goal) => {
  const stmt = db.prepare(`
    UPDATE savings_goals 
    SET name = ?, target_amount = ?, current_amount = ?, deadline = ?, description = ?
    WHERE id = ?
  `);
  stmt.run([goal.name, goal.target_amount, goal.current_amount, goal.deadline || null, goal.description || null, id]);
  stmt.free();
  saveDB();
};

export const deleteSavingsGoal = (id) => {
  db.run('DELETE FROM savings_goals WHERE id = ?', [id]);
  saveDB();
};

export const getSavingsGoals = (userId) => {
  const result = db.exec('SELECT * FROM savings_goals WHERE user_id = ? ORDER BY deadline', [userId]);
  if (result.length === 0) return [];

  return result[0].values.map(row => ({
    id: row[0],
    user_id: row[1],
    name: row[2],
    target_amount: row[3],
    current_amount: row[4],
    deadline: row[5],
    description: row[6],
    created_at: row[7]
  }));
};

// Statistics
export const getStatistics = (userId, startDate, endDate) => {
  const query = `
    SELECT 
      type,
      SUM(amount) as total,
      COUNT(*) as count
    FROM expenses
    WHERE user_id = ? AND date BETWEEN ? AND ?
    GROUP BY type
  `;

  const result = db.exec(query, [userId, startDate, endDate]);
  const stats = { income: 0, expense: 0, income_count: 0, expense_count: 0 };

  if (result.length > 0) {
    result[0].values.forEach(row => {
      if (row[0] === 'income') {
        stats.income = row[1];
        stats.income_count = row[2];
      } else {
        stats.expense = row[1];
        stats.expense_count = row[2];
      }
    });
  }

  return stats;
};

export const getCategoryStatistics = (userId, startDate, endDate, type = 'expense') => {
  const query = `
    SELECT 
      c.id,
      c.name,
      c.icon,
      c.color,
      SUM(e.amount) as total,
      COUNT(e.id) as count
    FROM expenses e
    LEFT JOIN categories c ON e.category_id = c.id
    WHERE e.user_id = ? AND e.date BETWEEN ? AND ? AND e.type = ?
    GROUP BY c.id, c.name, c.icon, c.color
    ORDER BY total DESC
  `;

  const result = db.exec(query, [userId, startDate, endDate, type]);
  if (result.length === 0) return [];

  return result[0].values.map(row => ({
    id: row[0],
    name: row[1],
    icon: row[2],
    color: row[3],
    total: row[4],
    count: row[5]
  }));
};

export const getDailyStatistics = (userId, startDate, endDate) => {
  const query = `
    SELECT 
      date,
      type,
      SUM(amount) as total
    FROM expenses
    WHERE user_id = ? AND date BETWEEN ? AND ?
    GROUP BY date, type
    ORDER BY date
  `;

  const result = db.exec(query, [userId, startDate, endDate]);
  if (result.length === 0) return [];

  return result[0].values.map(row => ({
    date: row[0],
    type: row[1],
    total: row[2]
  }));
};

// Export/Import functions
export const exportData = () => {
  const data = db.export();
  return JSON.stringify(Array.from(data));
};

export const importData = (jsonData) => {
  try {
    const uint8Array = new Uint8Array(JSON.parse(jsonData));
    db = new SQL.Database(uint8Array);
    saveDB();
    return true;
  } catch (error) {
    console.error('Import error:', error);
    return false;
  }
};

export const clearAllData = () => {
  db.run('DELETE FROM expenses');
  db.run('DELETE FROM budgets');
  db.run('DELETE FROM recurring_expenses');
  db.run('DELETE FROM savings_goals');
  saveDB();
};
