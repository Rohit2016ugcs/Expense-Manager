import { useState, useEffect } from 'react';
import { getStatistics, getCategoryStatistics, getDailyStatistics, getExpenses } from '../utils/db';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Dashboard() {
  const [period, setPeriod] = useState('month');
  const [stats, setStats] = useState({ income: 0, expense: 0, income_count: 0, expense_count: 0 });
  const [categoryStats, setCategoryStats] = useState([]);
  const [dailyStats, setDailyStats] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = () => {
    const { startDate, endDate } = getDateRange(period);
    
    const statistics = getStatistics(startDate, endDate);
    setStats(statistics);

    const catStats = getCategoryStatistics(startDate, endDate, 'expense');
    setCategoryStats(catStats);

    const daily = getDailyStatistics(startDate, endDate);
    setDailyStats(processDailyData(daily));

    const expenses = getExpenses({ limit: 5 });
    setRecentExpenses(expenses);
  };

  const getDateRange = (period) => {
    const today = new Date();
    let startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(today.getMonth() - 1);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    };
  };

  const processDailyData = (dailyData) => {
    const dataMap = {};
    
    dailyData.forEach(item => {
      if (!dataMap[item.date]) {
        dataMap[item.date] = { date: item.date, income: 0, expense: 0 };
      }
      dataMap[item.date][item.type] = item.total;
    });

    return Object.values(dataMap).sort((a, b) => a.date.localeCompare(b.date));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const balance = stats.income - stats.expense;
  const COLORS = categoryStats.map(cat => cat.color);

  return (
    <div className="dashboard">
      <div className="period-selector">
        <button className={period === 'week' ? 'active' : ''} onClick={() => setPeriod('week')}>
          Week
        </button>
        <button className={period === 'month' ? 'active' : ''} onClick={() => setPeriod('month')}>
          Month
        </button>
        <button className={period === 'year' ? 'active' : ''} onClick={() => setPeriod('year')}>
          Year
        </button>
      </div>

      <div className="stats-cards">
        <div className="stat-card income">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Income</h3>
            <p className="stat-amount">{formatCurrency(stats.income)}</p>
            <span className="stat-count">{stats.income_count} transactions</span>
          </div>
        </div>

        <div className="stat-card expense">
          <div className="stat-icon">💸</div>
          <div className="stat-content">
            <h3>Total Expense</h3>
            <p className="stat-amount">{formatCurrency(stats.expense)}</p>
            <span className="stat-count">{stats.expense_count} transactions</span>
          </div>
        </div>

        <div className={`stat-card balance ${balance >= 0 ? 'positive' : 'negative'}`}>
          <div className="stat-icon">{balance >= 0 ? '📈' : '📉'}</div>
          <div className="stat-content">
            <h3>Balance</h3>
            <p className="stat-amount">{formatCurrency(Math.abs(balance))}</p>
            <span className="stat-count">{balance >= 0 ? 'Surplus' : 'Deficit'}</span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Expense by Category</h3>
          {categoryStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total"
                >
                  {categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">No expense data available</div>
          )}
        </div>

        <div className="chart-card">
          <h3>Top Categories</h3>
          {categoryStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryStats.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="total" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">No category data available</div>
          )}
        </div>

        <div className="chart-card full-width">
          <h3>Income vs Expense Trend</h3>
          {dailyStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">No trend data available</div>
          )}
        </div>
      </div>

      <div className="recent-expenses">
        <h3>Recent Transactions</h3>
        {recentExpenses.length > 0 ? (
          <div className="expenses-list">
            {recentExpenses.map(expense => (
              <div key={expense.id} className="expense-item">
                <div className="expense-icon" style={{ backgroundColor: expense.category_color }}>
                  {expense.category_icon}
                </div>
                <div className="expense-details">
                  <div className="expense-name">{expense.description || expense.category_name}</div>
                  <div className="expense-meta">
                    {expense.category_name} • {new Date(expense.date).toLocaleDateString()}
                  </div>
                </div>
                <div className={`expense-amount ${expense.type}`}>
                  {expense.type === 'income' ? '+' : '-'}{formatCurrency(expense.amount)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">No transactions yet</div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
