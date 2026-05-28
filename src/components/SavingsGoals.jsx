import { useState, useEffect } from 'react';
import { getSavingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal } from '../utils/db';
import { useAuth } from '../context/AuthContext';

function SavingsGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    current_amount: 0,
    deadline: '',
    description: ''
  });

  useEffect(() => {
    if (user && user.id) {
      loadGoals();
    }
  }, [user]);

  const loadGoals = () => {
    if (!user || !user.id) return;
    const goalsList = getSavingsGoals(user.id);
    setGoals(goalsList);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.target_amount) {
      alert('Please fill in all required fields');
      return;
    }

    if (!user || !user.id) return;

    const goalData = {
      ...formData,
      target_amount: parseFloat(formData.target_amount),
      current_amount: parseFloat(formData.current_amount) || 0
    };

    if (editingGoal) {
      updateSavingsGoal(editingGoal.id, goalData);
    } else {
      addSavingsGoal(goalData, user.id);
    }

    resetForm();
    loadGoals();
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount,
      deadline: goal.deadline || '',
      description: goal.description || ''
    });
    setShowModal(true);
  };

  const handleAddAmount = (goal) => {
    const amount = prompt('Enter amount to add:');
    if (amount && !isNaN(amount)) {
      const updatedGoal = {
        ...goal,
        current_amount: goal.current_amount + parseFloat(amount)
      };
      updateSavingsGoal(goal.id, updatedGoal);
      loadGoals();
    }
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this savings goal?')) {
      deleteSavingsGoal(id);
      loadGoals();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      target_amount: '',
      current_amount: 0,
      deadline: '',
      description: ''
    });
    setEditingGoal(null);
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

  const getDaysRemaining = (deadline) => {
    if (!deadline) return null;
    const today = new Date();
    const target = new Date(deadline);
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="savings-page">
      <div className="page-header">
        <h2>🎯 Savings Goals</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add Goal
        </button>
      </div>

      <div className="goals-grid">
        {goals.length > 0 ? (
          goals.map(goal => {
            const percentage = (goal.current_amount / goal.target_amount) * 100;
            const isComplete = percentage >= 100;
            const daysRemaining = getDaysRemaining(goal.deadline);

            return (
              <div key={goal.id} className={`goal-card ${isComplete ? 'complete' : ''}`}>
                <div className="goal-header">
                  <div>
                    <h3>{goal.name}</h3>
                    {goal.description && <p className="goal-description">{goal.description}</p>}
                  </div>
                  <div className="goal-actions">
                    <button className="btn-icon" onClick={() => handleAddAmount(goal)} title="Add Amount">
                      ➕
                    </button>
                    <button className="btn-icon" onClick={() => handleEdit(goal)} title="Edit">
                      ✏️
                    </button>
                    <button className="btn-icon" onClick={() => handleDelete(goal.id)} title="Delete">
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="goal-amounts">
                  <div className="current">
                    <span className="label">Current</span>
                    <span className="amount">{formatCurrency(goal.current_amount)}</span>
                  </div>
                  <div className="target">
                    <span className="label">Target</span>
                    <span className="amount">{formatCurrency(goal.target_amount)}</span>
                  </div>
                </div>

                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: isComplete ? '#22c55e' : '#6366f1'
                    }}
                  />
                </div>

                <div className="goal-footer">
                  <span className="percentage">
                    {percentage.toFixed(1)}% {isComplete && '🎉'}
                  </span>
                  {daysRemaining !== null && (
                    <span className={`deadline ${daysRemaining < 0 ? 'overdue' : daysRemaining < 30 ? 'soon' : ''}`}>
                      {daysRemaining < 0 
                        ? `Overdue by ${Math.abs(daysRemaining)} days`
                        : `${daysRemaining} days left`
                      }
                    </span>
                  )}
                </div>

                {!isComplete && (
                  <div className="remaining-amount">
                    {formatCurrency(goal.target_amount - goal.current_amount)} to go
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="no-data">No savings goals. Set your first goal to start saving!</div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingGoal ? 'Edit Savings Goal' : 'Add Savings Goal'}</h3>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Goal Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., New Car, Vacation, Emergency Fund"
                />
              </div>

              <div className="form-group">
                <label>Target Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.target_amount}
                  onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                  required
                  placeholder="Enter target amount"
                />
              </div>

              <div className="form-group">
                <label>Current Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.current_amount}
                  onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label>Deadline (Optional)</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add notes about this goal..."
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingGoal ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SavingsGoals;
