import { useState, useEffect } from 'react';
import { getExpenses, getCategoryStatistics, getStatistics } from '../utils/api-adapter';
import { useAuth } from '../context/AuthContext';

function Reports() {
  const { user } = useAuth();
  const [reportType, setReportType] = useState('summary');
  const [period, setPeriod] = useState('month');
  const [stats, setStats] = useState(null);
  const [categoryStats, setCategoryStats] = useState({ expense: [], income: [] });
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    if (user && user.id) {
      loadReportData();
    }
  }, [reportType, period, user]);

  const loadReportData = async () => {
    if (!user || !user.id) return;

    const { startDate, endDate } = getDateRange(period);

    const statistics = await getStatistics(user.id, startDate, endDate);
    setStats(statistics);

    const catStatsExpense = await getCategoryStatistics(user.id, startDate, endDate, 'expense');
    const catStatsIncome = await getCategoryStatistics(user.id, startDate, endDate, 'income');
    setCategoryStats({ expense: catStatsExpense, income: catStatsIncome });

    const allExpenses = await getExpenses(user.id, { startDate, endDate });
    setExpenses(allExpenses);
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
      case 'quarter':
        startDate.setMonth(today.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date('2000-01-01');
        break;
      default:
        startDate.setMonth(today.getMonth() - 1);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Payment Method'];
    const rows = expenses.map(exp => [
      exp.date,
      exp.type,
      exp.category_name,
      exp.description || '',
      exp.amount,
      exp.payment_method || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const data = {
      report_date: new Date().toISOString(),
      period,
      statistics: stats,
      category_statistics: categoryStats,
      transactions: expenses
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <h2>📑 Reports</h2>
        <div className="report-actions">
          <button className="btn-secondary" onClick={exportToCSV}>📊 Export CSV</button>
          <button className="btn-secondary" onClick={exportToJSON}>📄 Export JSON</button>
          <button className="btn-secondary" onClick={printReport}>🖨️ Print</button>
        </div>
      </div>

      <div className="report-controls">
        <div className="control-group">
          <label>Report Type:</label>
          <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="summary">Summary</option>
            <option value="detailed">Detailed</option>
            <option value="category">By Category</option>
          </select>
        </div>

        <div className="control-group">
          <label>Period:</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {stats && (
        <div className="report-content">
          {reportType === 'summary' && (
            <div className="summary-report">
              <h3>Financial Summary</h3>
              <div className="summary-cards">
                <div className="summary-card income">
                  <h4>Total Income</h4>
                  <p className="amount">{formatCurrency(stats.income)}</p>
                  <span className="count">{stats.income_count} transactions</span>
                </div>

                <div className="summary-card expense">
                  <h4>Total Expense</h4>
                  <p className="amount">{formatCurrency(stats.expense)}</p>
                  <span className="count">{stats.expense_count} transactions</span>
                </div>

                <div className={`summary-card balance ${stats.income - stats.expense >= 0 ? 'positive' : 'negative'}`}>
                  <h4>Net Balance</h4>
                  <p className="amount">{formatCurrency(Math.abs(stats.income - stats.expense))}</p>
                  <span className="status">{stats.income - stats.expense >= 0 ? 'Surplus' : 'Deficit'}</span>
                </div>
              </div>

              <div className="category-breakdown">
                <div className="breakdown-section">
                  <h4>Expense Breakdown</h4>
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Transactions</th>
                        <th>Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryStats.expense.map(cat => (
                        <tr key={cat.id}>
                          <td>
                            <span style={{ marginRight: '8px' }}>{cat.icon}</span>
                            {cat.name}
                          </td>
                          <td>{formatCurrency(cat.total)}</td>
                          <td>{cat.count}</td>
                          <td>{((cat.total / stats.expense) * 100).toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="breakdown-section">
                  <h4>Income Breakdown</h4>
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Transactions</th>
                        <th>Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryStats.income.map(cat => (
                        <tr key={cat.id}>
                          <td>
                            <span style={{ marginRight: '8px' }}>{cat.icon}</span>
                            {cat.name}
                          </td>
                          <td>{formatCurrency(cat.total)}</td>
                          <td>{cat.count}</td>
                          <td>{((cat.total / stats.income) * 100).toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {reportType === 'detailed' && (
            <div className="detailed-report">
              <h3>Detailed Transaction Report</h3>
              <table className="report-table detailed">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Payment Method</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(exp => (
                    <tr key={exp.id}>
                      <td>{new Date(exp.date).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${exp.type}`}>
                          {exp.type === 'income' ? '💰' : '💸'} {exp.type}
                        </span>
                      </td>
                      <td>
                        <span style={{ marginRight: '8px' }}>{exp.category_icon}</span>
                        {exp.category_name}
                      </td>
                      <td>{exp.description || '-'}</td>
                      <td>{exp.payment_method || '-'}</td>
                      <td className={exp.type}>
                        {exp.type === 'income' ? '+' : '-'}{formatCurrency(exp.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {reportType === 'category' && (
            <div className="category-report">
              <h3>Category Analysis</h3>
              
              <div className="category-analysis">
                <h4>Top Expense Categories</h4>
                {categoryStats.expense.slice(0, 5).map((cat, index) => (
                  <div key={cat.id} className="category-bar">
                    <div className="category-info">
                      <span className="rank">#{index + 1}</span>
                      <span className="icon">{cat.icon}</span>
                      <span className="name">{cat.name}</span>
                    </div>
                    <div className="bar-container">
                      <div 
                        className="bar-fill" 
                        style={{ 
                          width: `${(cat.total / categoryStats.expense[0].total) * 100}%`,
                          backgroundColor: cat.color 
                        }}
                      />
                    </div>
                    <span className="amount">{formatCurrency(cat.total)}</span>
                  </div>
                ))}
              </div>

              <div className="category-analysis">
                <h4>Income Sources</h4>
                {categoryStats.income.map((cat, index) => (
                  <div key={cat.id} className="category-bar">
                    <div className="category-info">
                      <span className="rank">#{index + 1}</span>
                      <span className="icon">{cat.icon}</span>
                      <span className="name">{cat.name}</span>
                    </div>
                    <div className="bar-container">
                      <div 
                        className="bar-fill" 
                        style={{ 
                          width: `${(cat.total / (categoryStats.income[0]?.total || 1)) * 100}%`,
                          backgroundColor: cat.color 
                        }}
                      />
                    </div>
                    <span className="amount">{formatCurrency(cat.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Reports;
