import { useState, useEffect } from 'react';
import { getRecurringExpenses, addRecurringExpense, deleteRecurringExpense, updateRecurringExpenseNextOccurrence, getCategories, addExpense } from '../utils/db';
import { useAuth } from '../context/AuthContext';

function RecurringExpenses() {
  const { user } = useAuth();
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    category_id: '',
    description: '',
    frequency: 'monthly',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    type: 'expense',
    payment_method: 'cash'
  });

  useEffect(() => {
    if (user && user.id) {
      loadData();
    }
  }, [user]);

  const loadData = () => {
    if (!user || !user.id) return;
    
    const recurring = getRecurringExpenses(user.id);
    setRecurringExpenses(recurring);

    const cats = getCategories(user.id);
    setCategories(cats);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.amount || !formData.category_id) {
      alert('Please fill in all required fields');
      return;
    }

    if (!user || !user.id) return;

    const expenseData = {
      ...formData,
      amount: parseFloat(formData.amount),
      category_id: parseInt(formData.category_id),
      next_occurrence: formData.start_date
    };

    addRecurringExpense(expenseData, user.id);
    resetForm();
    loadData();
  };

  const handleProcess = (recurring) => {
    if (!user || !user.id) return;
    
    if (confirm('Create transaction from this recurring expense?')) {
      const expense = {
        amount: recurring.amount,
        category_id: recurring.category_id,
        description: recurring.description,
        date: recurring.next_occurrence,
        type: recurring.type,
        payment_method: recurring.payment_method,
        tags: 'recurring'
      };

      addExpense(expense, user.id);

      const nextDate = calculateNextOccurrence(recurring.next_occurrence, recurring.frequency);
      updateRecurringExpenseNextOccurrence(recurring.id, nextDate);

      alert('Transaction created successfully!');
      loadData();
    }
  };

  const calculateNextOccurrence = (currentDate, frequency) => {
    const date = new Date(currentDate);

    switch (frequency) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }

    return date.toISOString().split('T')[0];
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this recurring expense?')) {
      deleteRecurringExpense(id);
      loadData();
    }
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      category_id: '',
      description: '',
      frequency: 'monthly',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      type: 'expense',
      payment_method: 'cash'
    });
    setShowModal(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const isDue = (nextOccurrence) => {
    const today = new Date().toISOString().split('T')[0];
    return nextOccurrence <= today;
  };

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  return (
    <div className="recurring-page">
      <div className="page-header">
        <h2>🔄 Recurring Transactions</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add Recurring
        </button>
      </div>

      <div className="recurring-list">
        {recurringExpenses.length > 0 ? (
          recurringExpenses.map(recurring => (
            <div key={recurring.id} className={`recurring-card ${isDue(recurring.next_occurrence) ? 'due' : ''}`}>
              <div className="recurring-icon" style={{ backgroundColor: recurring.category_color }}>
                {recurring.category_icon}
              </div>
              <div className="recurring-info">
                <h4>{recurring.description || recurring.category_name}</h4>
                <p className="recurring-meta">
                  {recurring.category_name} • {recurring.frequency}
                </p>
                <p className="recurring-next">
                  Next: {new Date(recurring.next_occurrence).toLocaleDateString()}
                  {isDue(recurring.next_occurrence) && ' • ⏰ Due now!'}
                </p>
              </div>
              <div className="recurring-actions">
                <div className={`recurring-amount ${recurring.type}`}>
                  {recurring.type === 'income' ? '+' : '-'}{formatCurrency(recurring.amount)}
                </div>
                <div className="action-buttons">
                  {isDue(recurring.next_occurrence) && (
                    <button className="btn-icon" onClick={() => handleProcess(recurring)} title="Process">
                      ✅
                    </button>
                  )}
                  <button className="btn-icon" onClick={() => handleDelete(recurring.id)} title="Delete">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-data">No recurring transactions. Add one to automate your finances!</div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Recurring Transaction</h3>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Type *</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      value="expense"
                      checked={formData.type === 'expense'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value, category_id: '' })}
                    />
                    Expense
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="income"
                      checked={formData.type === 'income'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value, category_id: '' })}
                    />
                    Income
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  required
                >
                  <option value="">Select Category</option>
                  {filteredCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Netflix subscription"
                />
              </div>

              <div className="form-group">
                <label>Frequency *</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  required
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="form-group">
                <label>Start Date *</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>End Date (Optional)</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="netbanking">Net Banking</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecurringExpenses;
