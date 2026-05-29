// API Service Layer for Cloud Backend
const API_BASE_URL = import.meta.env.PROD 
  ? '/api'  // Production: Use relative path for Vercel
  : 'http://localhost:3000/api';  // Development: Use local dev server

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
}

// Authentication APIs
export const authAPI = {
  signup: async (name, email, password) => {
    return apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  login: async (email, password) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
};

// Expenses APIs
export const expensesAPI = {
  getAll: async (userId, filters = {}) => {
    const params = new URLSearchParams({ userId, ...filters });
    return apiCall(`/expenses?${params}`);
  },

  create: async (userId, expense) => {
    return apiCall(`/expenses?userId=${userId}`, {
      method: 'POST',
      body: JSON.stringify(expense),
    });
  },

  update: async (userId, expense) => {
    return apiCall(`/expenses?userId=${userId}`, {
      method: 'PUT',
      body: JSON.stringify(expense),
    });
  },

  delete: async (userId, expenseId) => {
    return apiCall(`/expenses?userId=${userId}&id=${expenseId}`, {
      method: 'DELETE',
    });
  },
};

// Categories APIs
export const categoriesAPI = {
  getAll: async (userId, type = null) => {
    const params = new URLSearchParams({ userId });
    if (type) params.append('type', type);
    return apiCall(`/categories?${params}`);
  },

  create: async (userId, category) => {
    return apiCall(`/categories?userId=${userId}`, {
      method: 'POST',
      body: JSON.stringify(category),
    });
  },

  update: async (userId, category) => {
    return apiCall(`/categories?userId=${userId}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    });
  },

  delete: async (userId, categoryId) => {
    return apiCall(`/categories?userId=${userId}&id=${categoryId}`, {
      method: 'DELETE',
    });
  },
};

// Budgets APIs
export const budgetsAPI = {
  getAll: async (userId) => {
    return apiCall(`/budgets?userId=${userId}`);
  },

  create: async (userId, budget) => {
    return apiCall(`/budgets?userId=${userId}`, {
      method: 'POST',
      body: JSON.stringify(budget),
    });
  },

  delete: async (userId, budgetId) => {
    return apiCall(`/budgets?userId=${userId}&id=${budgetId}`, {
      method: 'DELETE',
    });
  },
};

// Recurring Expenses APIs
export const recurringAPI = {
  getAll: async (userId) => {
    return apiCall(`/recurring?userId=${userId}`);
  },

  create: async (userId, recurring) => {
    return apiCall(`/recurring?userId=${userId}`, {
      method: 'POST',
      body: JSON.stringify(recurring),
    });
  },

  update: async (userId, recurring) => {
    return apiCall(`/recurring?userId=${userId}`, {
      method: 'PUT',
      body: JSON.stringify(recurring),
    });
  },

  delete: async (userId, recurringId) => {
    return apiCall(`/recurring?userId=${userId}&id=${recurringId}`, {
      method: 'DELETE',
    });
  },
};

// Savings Goals APIs
export const savingsAPI = {
  getAll: async (userId) => {
    return apiCall(`/savings?userId=${userId}`);
  },

  create: async (userId, goal) => {
    return apiCall(`/savings?userId=${userId}`, {
      method: 'POST',
      body: JSON.stringify(goal),
    });
  },

  update: async (userId, goal) => {
    return apiCall(`/savings?userId=${userId}`, {
      method: 'PUT',
      body: JSON.stringify(goal),
    });
  },

  delete: async (userId, goalId) => {
    return apiCall(`/savings?userId=${userId}&id=${goalId}`, {
      method: 'DELETE',
    });
  },
};

// Statistics APIs
export const statisticsAPI = {
  getSummary: async (userId, startDate, endDate) => {
    const params = new URLSearchParams({
      userId,
      startDate,
      endDate,
      type: 'summary',
    });
    return apiCall(`/statistics?${params}`);
  },

  getByCategory: async (userId, startDate, endDate, expenseType = 'expense') => {
    const params = new URLSearchParams({
      userId,
      startDate,
      endDate,
      type: 'category',
      expenseType,
    });
    return apiCall(`/statistics?${params}`);
  },

  getDaily: async (userId, startDate, endDate) => {
    const params = new URLSearchParams({
      userId,
      startDate,
      endDate,
      type: 'daily',
    });
    return apiCall(`/statistics?${params}`);
  },
};
