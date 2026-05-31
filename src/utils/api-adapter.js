// API Adapter - Provides the same interface as db.js but uses cloud backend
import {
  expensesAPI,
  categoriesAPI,
  budgetsAPI,
  recurringAPI,
  savingsAPI,
  statisticsAPI,
} from '../services/api';

// Use cloud backend - toggle this to switch between local and cloud storage
export const USE_CLOUD_BACKEND = true;

// Note: When USE_CLOUD_BACKEND is true, these functions call the API
// Otherwise, they fall back to the local db.js functions

// Expense operations
export const addExpense = async (expense, userId) => {
  if (!USE_CLOUD_BACKEND) {
    // Import and use local db
    const { addExpense: localAdd } = await import('./db');
    return localAdd(expense, userId);
  }
  
  const result = await expensesAPI.create(userId, expense);
  return result.expense.id;
};

export const updateExpense = async (id, expense, userId) => {
  if (!USE_CLOUD_BACKEND) {
    const { updateExpense: localUpdate } = await import('./db');
    return localUpdate(id, expense);
  }
  
  await expensesAPI.update(userId, { id, ...expense });
};

export const deleteExpense = async (id, userId) => {
  if (!USE_CLOUD_BACKEND) {
    const { deleteExpense: localDelete } = await import('./db');
    return localDelete(id);
  }
  
  await expensesAPI.delete(userId, id);
};

export const getExpenses = async (userId, filters = {}) => {
  if (!USE_CLOUD_BACKEND) {
    const { getExpenses: localGet } = await import('./db');
    return localGet(userId, filters);
  }
  
  const result = await expensesAPI.getAll(userId, filters);
  return result.expenses || [];
};

// Category operations
export const addCategory = async (category, userId) => {
  if (!USE_CLOUD_BACKEND) {
    const { addCategory: localAdd } = await import('./db');
    return localAdd(category, userId);
  }
  
  await categoriesAPI.create(userId, category);
};

export const updateCategory = async (id, category, userId) => {
  if (!USE_CLOUD_BACKEND) {
    const { updateCategory: localUpdate } = await import('./db');
    return localUpdate(id, category);
  }
  
  await categoriesAPI.update(userId, { id, ...category });
};

export const deleteCategory = async (id, userId) => {
  if (!USE_CLOUD_BACKEND) {
    const { deleteCategory: localDelete } = await import('./db');
    return localDelete(id);
  }
  
  await categoriesAPI.delete(userId, id);
};

export const getCategories = async (userId, type = null) => {
  if (!USE_CLOUD_BACKEND) {
    const { getCategories: localGet } = await import('./db');
    return localGet(userId, type);
  }
  
  const result = await categoriesAPI.getAll(userId, type);
  return result.categories || [];
};

// Budget operations
export const addBudget = async (budget, userId) => {
  if (!USE_CLOUD_BACKEND) {
    const { addBudget: localAdd } = await import('./db');
    return localAdd(budget, userId);
  }
  
  await budgetsAPI.create(userId, budget);
};

export const getBudgets = async (userId) => {
  if (!USE_CLOUD_BACKEND) {
    const { getBudgets: localGet } = await import('./db');
    return localGet(userId);
  }
  
  const result = await budgetsAPI.getAll(userId);
  return result.budgets || [];
};

export const deleteBudget = async (id, userId) => {
  if (!USE_CLOUD_BACKEND) {
    const { deleteBudget: localDelete } = await import('./db');
    return localDelete(id);
  }
  
  await budgetsAPI.delete(userId, id);
};

// Recurring expense operations
export const addRecurringExpense = async (expense, userId) => {
  if (!USE_CLOUD_BACKEND) {
    const { addRecurringExpense: localAdd } = await import('./db');
    return localAdd(expense, userId);
  }
  
  await recurringAPI.create(userId, expense);
};

export const getRecurringExpenses = async (userId) => {
  if (!USE_CLOUD_BACKEND) {
    const { getRecurringExpenses: localGet } = await import('./db');
    return localGet(userId);
  }
  
  const result = await recurringAPI.getAll(userId);
  return result.recurring || [];
};

export const deleteRecurringExpense = async (id, userId) => {
  if (!USE_CLOUD_BACKEND) {
    const { deleteRecurringExpense: localDelete } = await import('./db');
    return localDelete(id);
  }
  
  await recurringAPI.delete(userId, id);
};

export const updateRecurringExpenseNextOccurrence = async (id, nextDate, userId) => {
  if (!USE_CLOUD_BACKEND) {
    const { updateRecurringExpenseNextOccurrence: localUpdate } = await import('./db');
    return localUpdate(id, nextDate);
  }
  
  await recurringAPI.update(userId, { id, next_occurrence: nextDate });
};

// Savings goals operations
export const addSavingsGoal = async (goal, userId) => {
  if (!USE_CLOUD_BACKEND) {
    const { addSavingsGoal: localAdd } = await import('./db');
    return localAdd(goal, userId);
  }
  
  await savingsAPI.create(userId, goal);
};

export const updateSavingsGoal = async (id, goal, userId) => {
  if (!USE_CLOUD_BACKEND) {
    const { updateSavingsGoal: localUpdate } = await import('./db');
    return localUpdate(id, goal);
  }
  
  await savingsAPI.update(userId, { id, ...goal });
};

export const deleteSavingsGoal = async (id, userId) => {
  if (!USE_CLOUD_BACKEND) {
    const { deleteSavingsGoal: localDelete } = await import('./db');
    return localDelete(id);
  }
  
  await savingsAPI.delete(userId, id);
};

export const getSavingsGoals = async (userId) => {
  if (!USE_CLOUD_BACKEND) {
    const { getSavingsGoals: localGet } = await import('./db');
    return localGet(userId);
  }
  
  const result = await savingsAPI.getAll(userId);
  return result.goals || [];
};

// Statistics
export const getStatistics = async (userId, startDate, endDate) => {
  if (!USE_CLOUD_BACKEND) {
    const { getStatistics: localGet } = await import('./db');
    return localGet(userId, startDate, endDate);
  }
  
  const result = await statisticsAPI.getSummary(userId, startDate, endDate);
  return result.stats || { income: 0, expense: 0, income_count: 0, expense_count: 0 };
};

export const getCategoryStatistics = async (userId, startDate, endDate, type = 'expense') => {
  if (!USE_CLOUD_BACKEND) {
    const { getCategoryStatistics: localGet } = await import('./db');
    return localGet(userId, startDate, endDate, type);
  }
  
  const result = await statisticsAPI.getByCategory(userId, startDate, endDate, type);
  return result.categories || [];
};

export const getDailyStatistics = async (userId, startDate, endDate) => {
  if (!USE_CLOUD_BACKEND) {
    const { getDailyStatistics: localGet } = await import('./db');
    return localGet(userId, startDate, endDate);
  }
  
  const result = await statisticsAPI.getDaily(userId, startDate, endDate);
  return result.daily || [];
};

// Database initialization (only needed for local mode)
export const initDB = async () => {
  if (!USE_CLOUD_BACKEND) {
    const { initDB: localInit } = await import('./db');
    return localInit();
  }
  return true; // Cloud backend doesn't need initialization
};

export const getDB = () => {
  if (!USE_CLOUD_BACKEND) {
    const { getDB: localGet } = require('./db');
    return localGet();
  }
  return null; // Cloud backend doesn't expose raw DB
};

export const saveDB = () => {
  if (!USE_CLOUD_BACKEND) {
    const { saveDB: localSave } = require('./db');
    return localSave();
  }
  // Cloud backend auto-saves
};

// Data export/import (for Settings page - uses local db functions)
export const exportData = async () => {
  const { exportData: localExport } = await import('./db');
  return localExport();
};

export const importData = async (data) => {
  const { importData: localImport } = await import('./db');
  return localImport(data);
};

export const clearAllData = async () => {
  const { clearAllData: localClear } = await import('./db');
  return localClear();
};
