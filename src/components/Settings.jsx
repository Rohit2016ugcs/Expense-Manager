import { useState } from 'react';
import { exportData, importData, clearAllData } from '../utils/db';

function Settings() {
  const [activeSection, setActiveSection] = useState('data');

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    alert('Data exported successfully!');
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const success = importData(event.target.result);
        if (success) {
          alert('Data imported successfully! Please refresh the page.');
          window.location.reload();
        } else {
          alert('Failed to import data. Please check the file format.');
        }
      } catch (error) {
        alert('Error importing data: ' + error.message);
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (confirm('⚠️ WARNING: This will delete ALL your data permanently. This action cannot be undone. Are you absolutely sure?')) {
      if (confirm('Are you REALLY sure? This will delete all expenses, budgets, recurring transactions, and savings goals.')) {
        clearAllData();
        alert('All data cleared successfully! Page will refresh.');
        window.location.reload();
      }
    }
  };

  const installPWA = () => {
    alert('To install this app:\n\n📱 Mobile: Tap the share button and select "Add to Home Screen"\n\n💻 Desktop: Look for the install icon in your browser\'s address bar');
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h2>⚙️ Settings</h2>
      </div>

      <div className="settings-nav">
        <button 
          className={activeSection === 'data' ? 'active' : ''} 
          onClick={() => setActiveSection('data')}
        >
          💾 Data Management
        </button>
        <button 
          className={activeSection === 'app' ? 'active' : ''} 
          onClick={() => setActiveSection('app')}
        >
          📱 App Settings
        </button>
        <button 
          className={activeSection === 'about' ? 'active' : ''} 
          onClick={() => setActiveSection('about')}
        >
          ℹ️ About
        </button>
      </div>

      <div className="settings-content">
        {activeSection === 'data' && (
          <div className="settings-section">
            <h3>Data Management</h3>
            
            <div className="setting-card">
              <div className="setting-info">
                <h4>📤 Export Data</h4>
                <p>Download all your data as a backup file</p>
              </div>
              <button className="btn-primary" onClick={handleExport}>
                Export
              </button>
            </div>

            <div className="setting-card">
              <div className="setting-info">
                <h4>📥 Import Data</h4>
                <p>Restore data from a backup file</p>
              </div>
              <label className="btn-primary" style={{ cursor: 'pointer' }}>
                Import
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={handleImport}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <div className="setting-card danger">
              <div className="setting-info">
                <h4>🗑️ Clear All Data</h4>
                <p>Permanently delete all data from the app</p>
              </div>
              <button className="btn-danger" onClick={handleClearData}>
                Clear Data
              </button>
            </div>

            <div className="info-box">
              <p>💡 <strong>Tip:</strong> Export your data regularly to keep backups safe!</p>
            </div>
          </div>
        )}

        {activeSection === 'app' && (
          <div className="settings-section">
            <h3>App Settings</h3>

            <div className="setting-card">
              <div className="setting-info">
                <h4>📱 Install App</h4>
                <p>Install this app on your device for offline access</p>
              </div>
              <button className="btn-primary" onClick={installPWA}>
                Install
              </button>
            </div>

            <div className="setting-card">
              <div className="setting-info">
                <h4>🔔 Notifications</h4>
                <p>Enable notifications for budget alerts and recurring expenses</p>
              </div>
              <button className="btn-secondary" disabled>
                Coming Soon
              </button>
            </div>

            <div className="setting-card">
              <div className="setting-info">
                <h4>🌙 Dark Mode</h4>
                <p>Switch between light and dark themes</p>
              </div>
              <button className="btn-secondary" disabled>
                Coming Soon
              </button>
            </div>

            <div className="setting-card">
              <div className="setting-info">
                <h4>💱 Currency</h4>
                <p>Change display currency (Currently: INR ₹)</p>
              </div>
              <button className="btn-secondary" disabled>
                Coming Soon
              </button>
            </div>
          </div>
        )}

        {activeSection === 'about' && (
          <div className="settings-section">
            <h3>About Expense Manager</h3>

            <div className="about-card">
              <h1 style={{ fontSize: '48px', marginBottom: '10px' }}>💰</h1>
              <h2>Expense Manager</h2>
              <p className="version">Version 1.0.0</p>
            </div>

            <div className="features-list">
              <h4>Features</h4>
              <ul>
                <li>✅ Track income and expenses</li>
                <li>✅ Categorize transactions</li>
                <li>✅ Set and monitor budgets</li>
                <li>✅ Manage recurring transactions</li>
                <li>✅ Set savings goals</li>
                <li>✅ Generate detailed reports</li>
                <li>✅ Visual charts and statistics</li>
                <li>✅ Export/Import data</li>
                <li>✅ Offline support (PWA)</li>
                <li>✅ No server required - all data stored locally</li>
              </ul>
            </div>

            <div className="tech-stack">
              <h4>Built With</h4>
              <div className="tech-tags">
                <span>React</span>
                <span>SQLite (sql.js)</span>
                <span>Recharts</span>
                <span>Vite</span>
                <span>PWA</span>
              </div>
            </div>

            <div className="info-box">
              <p>
                <strong>Privacy First:</strong> All your data is stored locally in your browser. 
                Nothing is sent to any server. Your financial information stays private and secure.
              </p>
            </div>

            <div className="info-box">
              <p>
                <strong>Storage:</strong> This app uses browser localStorage and IndexedDB. 
                Make sure to export backups regularly to prevent data loss.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;
