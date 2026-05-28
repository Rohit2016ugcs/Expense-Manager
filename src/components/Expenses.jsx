import { useState, useEffect } from 'react';
import { getExpenses, addExpense, updateExpense, deleteExpense, getCategories } from '../utils/db';
import { useAuth } from '../context/AuthContext';

function Expenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    category_id: '',
    search: '',
    startDate: '',
    endDate: ''
  });

  const [formData, setFormData] = useState({
    amount: '',
    category_id: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    payment_method: 'cash',
    tags: ''
  });

  useEffect(() => {
    if (user && user.id) {
      loadData();
    }
  }, [filters, user]);

  const loadData = () => {
    if (!user || !user.id) return;
    
    const filterParams = {};
    if (filters.type) filterParams.type = filters.type;
    if (filters.category_id) filterParams.category_id = parseInt(filters.category_id);
    if (filters.search) filterParams.search = filters.search;
    if (filters.startDate) filterParams.startDate = filters.startDate;
    if (filters.endDate) filterParams.endDate = filters.endDate;

    const expensesList = getExpenses(user.id, filterParams);
    setExpenses(expensesList);

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
      category_id: parseInt(formData.category_id)
    };

    if (editingExpense) {
      updateExpense(editingExpense.id, expenseData);
    } else {
      addExpense(expenseData, user.id);
    }

    resetForm();
    loadData();
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      amount: expense.amount,
      category_id: expense.category_id,
      description: expense.description || '',
      date: expense.date,
      type: expense.type,
      payment_method: expense.payment_method || 'cash',
      tags: expense.tags || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteExpense(id);
      loadData();
    }
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      category_id: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      payment_method: 'cash',
      tags: ''
    });
    setEditingExpense(null);
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

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  return (
    <div className="expenses-page">
      <div className="page-header">
        <h2>💸 Transactions</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add Transaction
        </button>
      </div>

      <div className="filters-bar">
        <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
          <option value="">All Types</option>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>

        <select value={filters.category_id} onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}>
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />

        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          placeholder="Start Date"
        />

        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          placeholder="End Date"
        />

        <button className="btn-secondary" onClick={() => setFilters({ type: '', category_id: '', search: '', startDate: '', endDate: '' })}>
          Clear Filters
        </button>
      </div>

      <div className="expenses-list">
        {expenses.length > 0 ? (
          expenses.map(expense => (
            <div key={expense.id} className="expense-card">
              <div className="expense-icon" style={{ backgroundColor: expense.category_color }}>
                {expense.category_icon}
              </div>
              <div className="expense-info">
                <h4>{expense.description || expense.category_name}</h4>
                <p className="expense-meta">
                  {expense.category_name} • {new Date(expense.date).toLocaleDateString()} 
                  {expense.payment_method && ` • ${expense.payment_method}`}
                </p>
                {expense.tags && <p className="expense-tags">🏷️ {expense.tags}</p>}
              </div>
              <div className="expense-actions">
                <div className={`expense-amount ${expense.type}`}>
                  {expense.type === 'income' ? '+' : '-'}{formatCurrency(expense.amount)}
                </div>
                <div className="action-buttons">
                  <button className="btn-icon" onClick={() => handleEdit(expense)}>✏️</button>
                  <button className="btn-icon" onClick={() => handleDelete(expense.id)}>🗑️</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-data">No transactions found</div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingExpense ? 'Edit Transaction' : 'Add Transaction'}</h3>
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
                  placeholder="e.g., Lunch at restaurant"
                />
              </div>

              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
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

              <div className="form-group">
                <label>Tags</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g., work, personal"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingExpense ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Expenses;
