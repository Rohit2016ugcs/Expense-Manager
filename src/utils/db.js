import initSqlJs from 'sql.js';

let db = null;
let SQL = null;

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
    } else {
      db = new SQL.Database();
      createTables();
      insertDefaultCategories();
    }

    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
};

const createTables = () => {
  // Expenses table
  db.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      category_id INTEGER NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      payment_method TEXT,
      tags TEXT,
      receipt_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  // Categories table
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      icon TEXT,
      color TEXT,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      budget_limit REAL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Budgets table
  db.run(`
    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER,
      amount REAL NOT NULL,
      period TEXT NOT NULL CHECK(period IN ('daily', 'weekly', 'monthly', 'yearly')),
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      alert_threshold REAL DEFAULT 80,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  // Recurring expenses table
  db.run(`
    CREATE TABLE IF NOT EXISTS recurring_expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  // Savings goals table
  db.run(`
    CREATE TABLE IF NOT EXISTS savings_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      target_amount REAL NOT NULL,
      current_amount REAL DEFAULT 0,
      deadline TEXT,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  saveDB();
};

const insertDefaultCategories = () => {
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

  const stmt = db.prepare('INSERT INTO categories (name, icon, color, type) VALUES (?, ?, ?, ?)');
  defaultCategories.forEach(cat => {
    stmt.run([cat.name, cat.icon, cat.color, cat.type]);
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
export const addExpense = (expense) => {
  const stmt = db.prepare(`
    INSERT INTO expenses (amount, category_id, description, date, type, payment_method, tags, receipt_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run([
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

export const getExpenses = (filters = {}) => {
  let query = `
    SELECT e.*, c.name as category_name, c.icon as category_icon, c.color as category_color
    FROM expenses e
    LEFT JOIN categories c ON e.category_id = c.id
    WHERE 1=1
  `;
  const params = [];

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
    amount: row[1],
    category_id: row[2],
    description: row[3],
    date: row[4],
    type: row[5],
    payment_method: row[6],
    tags: row[7],
    receipt_url: row[8],
    created_at: row[9],
    category_name: row[10],
    category_icon: row[11],
    category_color: row[12]
  }));
};

// Category operations
export const addCategory = (category) => {
  const stmt = db.prepare('INSERT INTO categories (name, icon, color, type, budget_limit) VALUES (?, ?, ?, ?, ?)');
  stmt.run([category.name, category.icon, category.color, category.type, category.budget_limit || 0]);
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

export const getCategories = (type = null) => {
  let query = 'SELECT * FROM categories';
  const params = [];
  
  if (type) {
    query += ' WHERE type = ?';
    params.push(type);
  }
  
  query += ' ORDER BY name';

  const result = db.exec(query, params);
  if (result.length === 0) return [];

  return result[0].values.map(row => ({
    id: row[0],
    name: row[1],
    icon: row[2],
    color: row[3],
    type: row[4],
    budget_limit: row[5],
    created_at: row[6]
  }));
};

// Budget operations
export const addBudget = (budget) => {
  const stmt = db.prepare(`
    INSERT INTO budgets (category_id, amount, period, start_date, end_date, alert_threshold)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run([
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

export const getBudgets = () => {
  const query = `
    SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color
    FROM budgets b
    LEFT JOIN categories c ON b.category_id = c.id
    ORDER BY b.created_at DESC
  `;

  const result = db.exec(query);
  if (result.length === 0) return [];

  return result[0].values.map(row => ({
    id: row[0],
    category_id: row[1],
    amount: row[2],
    period: row[3],
    start_date: row[4],
    end_date: row[5],
    alert_threshold: row[6],
    created_at: row[7],
    category_name: row[8],
    category_icon: row[9],
    category_color: row[10]
  }));
};

export const deleteBudget = (id) => {
  db.run('DELETE FROM budgets WHERE id = ?', [id]);
  saveDB();
};

// Recurring expense operations
export const addRecurringExpense = (expense) => {
  const stmt = db.prepare(`
    INSERT INTO recurring_expenses 
    (amount, category_id, description, frequency, start_date, end_date, next_occurrence, type, payment_method)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run([
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

export const getRecurringExpenses = () => {
  const query = `
    SELECT r.*, c.name as category_name, c.icon as category_icon, c.color as category_color
    FROM recurring_expenses r
    LEFT JOIN categories c ON r.category_id = c.id
    WHERE r.is_active = 1
    ORDER BY r.next_occurrence
  `;

  const result = db.exec(query);
  if (result.length === 0) return [];

  return result[0].values.map(row => ({
    id: row[0],
    amount: row[1],
    category_id: row[2],
    description: row[3],
    frequency: row[4],
    start_date: row[5],
    end_date: row[6],
    next_occurrence: row[7],
    is_active: row[8],
    type: row[9],
    payment_method: row[10],
    created_at: row[11],
    category_name: row[12],
    category_icon: row[13],
    category_color: row[14]
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
export const addSavingsGoal = (goal) => {
  const stmt = db.prepare(`
    INSERT INTO savings_goals (name, target_amount, current_amount, deadline, description)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run([goal.name, goal.target_amount, goal.current_amount || 0, goal.deadline || null, goal.description || null]);
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

export const getSavingsGoals = () => {
  const result = db.exec('SELECT * FROM savings_goals ORDER BY deadline');
  if (result.length === 0) return [];

  return result[0].values.map(row => ({
    id: row[0],
    name: row[1],
    target_amount: row[2],
    current_amount: row[3],
    deadline: row[4],
    description: row[5],
    created_at: row[6]
  }));
};

// Statistics
export const getStatistics = (startDate, endDate) => {
  const query = `
    SELECT 
      type,
      SUM(amount) as total,
      COUNT(*) as count
    FROM expenses
    WHERE date BETWEEN ? AND ?
    GROUP BY type
  `;

  const result = db.exec(query, [startDate, endDate]);
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

export const getCategoryStatistics = (startDate, endDate, type = 'expense') => {
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
    WHERE e.date BETWEEN ? AND ? AND e.type = ?
    GROUP BY c.id, c.name, c.icon, c.color
    ORDER BY total DESC
  `;

  const result = db.exec(query, [startDate, endDate, type]);
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

export const getDailyStatistics = (startDate, endDate) => {
  const query = `
    SELECT 
      date,
      type,
      SUM(amount) as total
    FROM expenses
    WHERE date BETWEEN ? AND ?
    GROUP BY date, type
    ORDER BY date
  `;

  const result = db.exec(query, [startDate, endDate]);
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
