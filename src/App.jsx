import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Expenses from './components/Expenses';
import Categories from './components/Categories';
import Budgets from './components/Budgets';
import RecurringExpenses from './components/RecurringExpenses';
import SavingsGoals from './components/SavingsGoals';
import Reports from './components/Reports';
import Calculator from './components/Calculator';
import Settings from './components/Settings';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, logout, loading: authLoading, dbReady } = useAuth();

  if (authLoading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Initializing Expense Manager...</p>
      </div>
    );
  }

  if (!dbReady) {
    return (
      <div className="error-screen">
        <p>⚠️ Failed to initialize database. Please refresh the page.</p>
      </div>
    );
  }

  // Show auth screen if user is not logged in
  if (!user) {
    return <Auth />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'expenses':
        return <Expenses />;
      case 'categories':
        return <Categories />;
      case 'budgets':
        return <Budgets />;
      case 'recurring':
        return <RecurringExpenses />;
      case 'savings':
        return <SavingsGoals />;
      case 'reports':
        return <Reports />;
      case 'calculator':
        return <Calculator />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>💰 Expense Manager</h1>
        <div className="user-info">
          <span>Welcome, {user.name}!</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </header>

      <nav className="app-nav">
        <button
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={activeTab === 'expenses' ? 'active' : ''}
          onClick={() => setActiveTab('expenses')}
        >
          💸 Expenses
        </button>
        <button
          className={activeTab === 'categories' ? 'active' : ''}
          onClick={() => setActiveTab('categories')}
        >
          🏷️ Categories
        </button>
        <button
          className={activeTab === 'budgets' ? 'active' : ''}
          onClick={() => setActiveTab('budgets')}
        >
          📈 Budgets
        </button>
        <button
          className={activeTab === 'recurring' ? 'active' : ''}
          onClick={() => setActiveTab('recurring')}
        >
          🔄 Recurring
        </button>
        <button
          className={activeTab === 'savings' ? 'active' : ''}
          onClick={() => setActiveTab('savings')}
        >
          🎯 Savings
        </button>
        <button
          className={activeTab === 'reports' ? 'active' : ''}
          onClick={() => setActiveTab('reports')}
        >
          📑 Reports
        </button>
        <button
          className={activeTab === 'calculator' ? 'active' : ''}
          onClick={() => setActiveTab('calculator')}
        >
          🔢 Calculator
        </button>
        <button
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Settings
        </button>
      </nav>

      <main className="app-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
