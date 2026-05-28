import { useState, useEffect } from 'react';
import { getBudgets, addBudget, deleteBudget, getCategories, getExpenses } from '../utils/db';
import { useAuth } from '../context/AuthContext';

function Budgets() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    period: 'monthly',
    alert_threshold: 80
  });

  useEffect(() => {
    if (user && user.id) {
      loadData();
    }
  }, [user]);

  const loadData = () => {
    if (!user || !user.id) return;
    
    const budgetsList = getBudgets(user.id);
    const budgetsWithSpent = budgetsList.map(budget => {
      const spent = calculateSpent(budget);
      return { ...budget, spent };
    });
    setBudgets(budgetsWithSpent);

    const cats = getCategories(user.id, 'expense');
    setCategories(cats);
  };

  const calculateSpent = (budget) => {
    if (!user || !user.id) return 0;
    
    const { start_date, end_date, category_id } = budget;
    const filters = { startDate: start_date, endDate: end_date, type: 'expense' };
    if (category_id) filters.category_id = category_id;

    const expenses = getExpenses(user.id, filters);
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.amount) {
      alert('Please enter budget amount');
      return;
    }

    if (!user || !user.id) return;

    const { startDate, endDate } = getDateRange(formData.period);

    const budgetData = {
      category_id: formData.category_id ? parseInt(formData.category_id) : null,
      amount: parseFloat(formData.amount),
      period: formData.period,
      start_date: startDate,
      end_date: endDate,
      alert_threshold: parseFloat(formData.alert_threshold)
    };

    addBudget(budgetData, user.id);
    resetForm();
    loadData();
  };

  const getDateRange = (period) => {
    const today = new Date();
    const startDate = new Date(today);
    const endDate = new Date(today);

    switch (period) {
      case 'daily':
        break;
      case 'weekly':
        startDate.setDate(today.getDate() - today.getDay());
        endDate.setDate(startDate.getDate() + 6);
        break;
      case 'monthly':
        startDate.setDate(1);
        endDate.setMonth(today.getMonth() + 1);
        endDate.setDate(0);
        break;
      case 'yearly':
        startDate.setMonth(0);
        startDate.setDate(1);
        endDate.setMonth(11);
        endDate.setDate(31);
        break;
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      deleteBudget(id);
      loadData();
    }
  };

  const resetForm = () => {
    setFormData({
      category_id: '',
      amount: '',
      period: 'monthly',
      alert_threshold: 80
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

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return '#ef4444';
    if (percentage >= 80) return '#f97316';
    if (percentage >= 60) return '#eab308';
    return '#22c55e';
  };

  return (
    <div className="budgets-page">
      <div className="page-header">
        <h2>📈 Budgets</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add Budget
        </button>
      </div>

      <div className="budgets-grid">
        {budgets.length > 0 ? (
          budgets.map(budget => {
            const percentage = (budget.spent / budget.amount) * 100;
            const isOverBudget = percentage >= 100;
            const isNearLimit = percentage >= budget.alert_threshold;

            return (
              <div key={budget.id} className={`budget-card ${isOverBudget ? 'over-budget' : ''}`}>
                <div className="budget-header">
                  <div>
                    {budget.category_id ? (
                      <div className="budget-title">
                        <span style={{ fontSize: '24px' }}>{budget.category_icon}</span>
                        <h3>{budget.category_name}</h3>
                      </div>
                    ) : (
                      <h3>📊 Overall Budget</h3>
                    )}
                    <span className="budget-period">{budget.period}</span>
                  </div>
                  <button className="btn-icon" onClick={() => handleDelete(budget.id)}>
                    🗑️
                  </button>
                </div>

                <div className="budget-amounts">
                  <div className="spent">
                    <span className="label">Spent</span>
                    <span className="amount">{formatCurrency(budget.spent)}</span>
                  </div>
                  <div className="total">
                    <span className="label">Budget</span>
                    <span className="amount">{formatCurrency(budget.amount)}</span>
                  </div>
                </div>

                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: getProgressColor(percentage)
                    }}
                  />
                </div>

                <div className="budget-footer">
                  <span className={`percentage ${isOverBudget ? 'over' : isNearLimit ? 'warning' : ''}`}>
                    {percentage.toFixed(1)}% used
                  </span>
                  <span className="remaining">
                    {budget.amount - budget.spent > 0 
                      ? `${formatCurrency(budget.amount - budget.spent)} left`
                      : `${formatCurrency(Math.abs(budget.amount - budget.spent))} over`
                    }
                  </span>
                </div>

                {isNearLimit && !isOverBudget && (
                  <div className="alert-banner warning">
                    ⚠️ Approaching budget limit
                  </div>
                )}

                {isOverBudget && (
                  <div className="alert-banner danger">
                    🚨 Budget exceeded!
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="no-data">No budgets set. Create your first budget to track spending!</div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Budget</h3>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Category (Optional - leave empty for overall budget)</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                >
                  <option value="">Overall Budget</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  placeholder="Enter budget amount"
                />
              </div>

              <div className="form-group">
                <label>Period *</label>
                <select
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  required
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="form-group">
                <label>Alert Threshold (%) *</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.alert_threshold}
                  onChange={(e) => setFormData({ ...formData, alert_threshold: e.target.value })}
                  required
                />
                <small>You'll be alerted when spending reaches this percentage</small>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Budgets;
