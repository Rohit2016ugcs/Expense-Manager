import { useState, useEffect } from 'react';
import { getCategories, addCategory, updateCategory, deleteCategory } from '../utils/db';
import { useAuth } from '../context/AuthContext';

function Categories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '📌',
    color: '#6366f1',
    type: 'expense',
    budget_limit: 0
  });

  const commonIcons = [
    '🍔', '🚗', '🛍️', '🎮', '⚡', '🏥', '📚', '💅', '✈️', '🏠',
    '💰', '💼', '📈', '🎁', '💵', '🎯', '🏋️', '🎵', '🎬', '☕',
    '🍕', '🚕', '👕', '💻', '📱', '🏖️', '🎨', '📌', '🔧', '🎓'
  ];

  useEffect(() => {
    if (user && user.id) {
      loadCategories();
    }
  }, [user]);

  const loadCategories = () => {
    if (!user || !user.id) return;
    const cats = getCategories(user.id);
    setCategories(cats);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name) {
      alert('Please enter category name');
      return;
    }

    if (!user || !user.id) return;

    const categoryData = {
      ...formData,
      budget_limit: parseFloat(formData.budget_limit) || 0
    };

    try {
      if (editingCategory) {
        updateCategory(editingCategory.id, categoryData);
      } else {
        addCategory(categoryData, user.id);
      }
      resetForm();
      loadCategories();
    } catch (error) {
      alert('Error: Category name already exists');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon,
      color: category.color,
      type: category.type,
      budget_limit: category.budget_limit || 0
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure? This will affect all related transactions.')) {
      deleteCategory(id);
      loadCategories();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      icon: '📌',
      color: '#6366f1',
      type: 'expense',
      budget_limit: 0
    });
    setEditingCategory(null);
    setShowModal(false);
  };

  const expenseCategories = categories.filter(cat => cat.type === 'expense');
  const incomeCategories = categories.filter(cat => cat.type === 'income');

  return (
    <div className="categories-page">
      <div className="page-header">
        <h2>🏷️ Categories</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add Category
        </button>
      </div>

      <div className="categories-section">
        <h3>💸 Expense Categories ({expenseCategories.length})</h3>
        <div className="categories-grid">
          {expenseCategories.map(cat => (
            <div key={cat.id} className="category-card" style={{ borderColor: cat.color }}>
              <div className="category-header">
                <div className="category-icon" style={{ backgroundColor: cat.color }}>
                  {cat.icon}
                </div>
                <div className="category-actions">
                  <button className="btn-icon" onClick={() => handleEdit(cat)}>✏️</button>
                  <button className="btn-icon" onClick={() => handleDelete(cat.id)}>🗑️</button>
                </div>
              </div>
              <h4>{cat.name}</h4>
              {cat.budget_limit > 0 && (
                <p className="budget-limit">Budget: ₹{cat.budget_limit}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="categories-section">
        <h3>💰 Income Categories ({incomeCategories.length})</h3>
        <div className="categories-grid">
          {incomeCategories.map(cat => (
            <div key={cat.id} className="category-card" style={{ borderColor: cat.color }}>
              <div className="category-header">
                <div className="category-icon" style={{ backgroundColor: cat.color }}>
                  {cat.icon}
                </div>
                <div className="category-actions">
                  <button className="btn-icon" onClick={() => handleEdit(cat)}>✏️</button>
                  <button className="btn-icon" onClick={() => handleDelete(cat.id)}>🗑️</button>
                </div>
              </div>
              <h4>{cat.name}</h4>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCategory ? 'Edit Category' : 'Add Category'}</h3>
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
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    />
                    Expense
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="income"
                      checked={formData.type === 'income'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    />
                    Income
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Groceries"
                />
              </div>

              <div className="form-group">
                <label>Icon *</label>
                <div className="icon-picker">
                  {commonIcons.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      className={`icon-option ${formData.icon === icon ? 'selected' : ''}`}
                      onClick={() => setFormData({ ...formData, icon })}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Color *</label>
                <div className="color-picker">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                  <span>{formData.color}</span>
                </div>
              </div>

              {formData.type === 'expense' && (
                <div className="form-group">
                  <label>Budget Limit (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.budget_limit}
                    onChange={(e) => setFormData({ ...formData, budget_limit: e.target.value })}
                    placeholder="0"
                  />
                </div>
              )}

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingCategory ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Categories;
