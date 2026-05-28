# Component Update Guide for Authentication

## Overview
The database functions have been updated to require a `userId` parameter for data isolation. All existing components need to be updated to pass this parameter.

## What Needs to be Updated

All components that use database functions need to:
1. Import the `useAuth` hook
2. Get the current user
3. Pass `user.id` to all database function calls

## Components That Need Updates

1. ✅ **App.jsx** - Already updated
2. ❌ **Dashboard.jsx** - Needs update
3. ❌ **Expenses.jsx** - Needs update
4. ❌ **Categories.jsx** - Needs update
5. ❌ **Budgets.jsx** - Needs update
6. ❌ **RecurringExpenses.jsx** - Needs update
7. ❌ **SavingsGoals.jsx** - Needs update
8. ❌ **Reports.jsx** - Needs update
9. ❌ **Settings.jsx** - Needs update (if using db functions)

## How to Update Each Component

### Step 1: Import useAuth
```javascript
import { useAuth } from '../context/AuthContext';
```

### Step 2: Get the user in component
```javascript
function YourComponent() {
  const { user } = useAuth();
  
  // ... rest of component
}
```

### Step 3: Update database function calls

**Before:**
```javascript
const expenses = getExpenses(filters);
const categories = getCategories();
const stats = getStatistics(startDate, endDate);
addExpense(expenseData);
```

**After:**
```javascript
const expenses = getExpenses(user.id, filters);
const categories = getCategories(user.id);
const stats = getStatistics(user.id, startDate, endDate);
addExpense(expenseData, user.id);
```

## Updated Function Signatures

### Expense Functions
- `getExpenses(userId, filters)` - userId is first parameter
- `addExpense(expense, userId)` - userId is second parameter
- `updateExpense(id, expense)` - unchanged
- `deleteExpense(id)` - unchanged

### Category Functions
- `getCategories(userId, type)` - userId is first parameter
- `addCategory(category, userId)` - userId is second parameter
- `updateCategory(id, category)` - unchanged
- `deleteCategory(id)` - unchanged

### Budget Functions
- `getBudgets(userId)` - userId is parameter
- `addBudget(budget, userId)` - userId is second parameter
- `deleteBudget(id)` - unchanged

### Recurring Expense Functions
- `getRecurringExpenses(userId)` - userId is parameter
- `addRecurringExpense(expense, userId)` - userId is second parameter
- `deleteRecurringExpense(id)` - unchanged
- `updateRecurringExpenseNextOccurrence(id, nextDate)` - unchanged

### Savings Goals Functions
- `getSavingsGoals(userId)` - userId is parameter
- `addSavingsGoal(goal, userId)` - userId is second parameter
- `updateSavingsGoal(id, goal)` - unchanged
- `deleteSavingsGoal(id)` - unchanged

### Statistics Functions
- `getStatistics(userId, startDate, endDate)` - userId is first parameter
- `getCategoryStatistics(userId, startDate, endDate, type)` - userId is first parameter
- `getDailyStatistics(userId, startDate, endDate)` - userId is first parameter

## Example: Updating Dashboard.jsx

**Before:**
```javascript
import { useState, useEffect } from 'react';
import { getStatistics, getExpenses, getCategoryStatistics } from '../utils/db';

function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadData = () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';
      const statistics = getStatistics(startDate, endDate);
      setStats(statistics);
    };
    loadData();
  }, []);

  // ... rest of component
}
```

**After:**
```javascript
import { useState, useEffect } from 'react';
import { getStatistics, getExpenses, getCategoryStatistics } from '../utils/db';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();  // Add this line
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadData = () => {
      if (!user) return;  // Add this check
      
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';
      const statistics = getStatistics(user.id, startDate, endDate);  // Pass user.id
      setStats(statistics);
    };
    loadData();
  }, [user]);  // Add user as dependency

  // ... rest of component
}
```

## Quick Fix for Testing

To quickly test the authentication without updating all components, you can:

1. **Comment out the problematic components** in App.jsx temporarily
2. **Only allow the Auth component** to work
3. **Update components one by one**

Or you can **revert to the login screen** by clearing localStorage:
```javascript
// In browser console
localStorage.clear();
location.reload();
```

Then create a new account and test the authentication flow.

## Next Steps

1. Update Dashboard.jsx first (most critical)
2. Update Expenses.jsx
3. Update Categories.jsx  
4. Update remaining components

Each update should follow the pattern above. Once all components are updated, the app will work perfectly with full user isolation!
