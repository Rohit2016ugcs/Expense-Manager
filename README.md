# 💰 Expense Manager - Progressive Web App

A comprehensive, feature-rich expense manager PWA built with React and SQLite. Track your finances, set budgets, manage recurring transactions, and achieve your savings goals - all offline!

## ✨ Features

### Core Features
- ✅ **Track Income & Expenses** - Add, edit, and delete transactions with detailed information
- ✅ **Categorization** - Organize transactions with customizable categories and icons
- ✅ **Advanced Filtering** - Search and filter by date, category, type, and keywords
- ✅ **Payment Methods** - Track payment methods (Cash, Card, UPI, Net Banking)
- ✅ **Tags** - Add custom tags to transactions for better organization

### Budget Management
- 📈 **Budget Tracking** - Set daily, weekly, monthly, or yearly budgets
- 📊 **Category Budgets** - Create budgets for specific categories or overall spending
- ⚠️ **Budget Alerts** - Get visual warnings when approaching budget limits
- 📉 **Progress Visualization** - See budget progress with color-coded indicators

### Recurring Transactions
- 🔄 **Automated Tracking** - Set up recurring income or expenses
- 📅 **Flexible Frequency** - Daily, weekly, monthly, or yearly recurrence
- ⏰ **Due Notifications** - Visual indicators for due recurring transactions
- ✅ **Easy Processing** - One-click to create transactions from recurring items

### Savings Goals
- 🎯 **Goal Setting** - Create and track multiple savings goals
- 💰 **Progress Tracking** - Monitor progress with visual indicators
- 📆 **Deadline Management** - Set target dates and see days remaining
- ➕ **Quick Updates** - Easily add amounts to your goals

### Analytics & Reports
- 📊 **Dashboard** - Comprehensive overview with charts and statistics
- 📈 **Multiple Chart Types** - Pie charts, bar charts, and line graphs
- 📑 **Detailed Reports** - Summary, detailed, and category-wise reports
- 📤 **Export Options** - Export to CSV or JSON formats
- 🖨️ **Print Support** - Print-friendly report layouts
- 📉 **Trend Analysis** - Income vs expense trends over time

### Data Management
- 💾 **Local Storage** - All data stored locally using SQLite (sql.js)
- 📤 **Export/Import** - Backup and restore your data
- 🔒 **Privacy First** - No server, no data collection, completely private
- 🗑️ **Clear Data** - Option to delete all data when needed

### Progressive Web App
- 📱 **Installable** - Add to home screen on mobile and desktop
- 🚀 **Offline Support** - Works without internet connection
- ⚡ **Fast Loading** - Optimized performance with service workers
- 📲 **Responsive Design** - Beautiful UI on all devices

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd "Expense Manager"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - Navigate to `http://localhost:5173` (or the URL shown in terminal)

### Building for Production

```bash
npm run build
```

The build output will be in the `dist` directory, ready to deploy.

### Preview Production Build

```bash
npm run preview
```

## 📱 Installing as PWA

### On Mobile (iOS/Android)
1. Open the app in your mobile browser
2. Tap the share/menu button
3. Select "Add to Home Screen"
4. The app will be installed like a native app

### On Desktop (Chrome/Edge)
1. Open the app in your browser
2. Look for the install icon in the address bar
3. Click "Install" when prompted
4. The app will open in its own window

## 🎨 Features Walkthrough

### Dashboard
- View your financial summary at a glance
- See income, expenses, and balance for different periods (week/month/year)
- Visualize spending patterns with interactive charts
- Check recent transactions quickly

### Transactions (Expenses)
- Add income or expense with one click
- Include description, date, amount, category, payment method, and tags
- Filter and search transactions easily
- Edit or delete transactions as needed

### Categories
- Customize income and expense categories
- Choose from 30+ emoji icons
- Set custom colors for visual identification
- Optional budget limits per category

### Budgets
- Create budgets for specific categories or overall spending
- Choose budget period (daily, weekly, monthly, yearly)
- Set alert thresholds (default 80%)
- Visual progress bars with color indicators:
  - 🟢 Green: < 60% used
  - 🟡 Yellow: 60-80% used
  - 🟠 Orange: 80-100% used
  - 🔴 Red: Over budget

### Recurring Transactions
- Set up subscriptions, rent, salary, etc.
- Automatic reminders for due transactions
- One-click processing to create actual transactions
- Supports both recurring income and expenses

### Savings Goals
- Create multiple savings goals
- Track progress with percentage indicators
- Set optional deadlines
- Add amounts incrementally
- Celebrate when goals are achieved! 🎉

### Reports
- **Summary Report**: Financial overview with category breakdowns
- **Detailed Report**: Complete transaction list with all details
- **Category Analysis**: Top spending categories with visual bars
- Export reports in CSV or JSON format
- Print-friendly layouts

### Settings
- **Data Management**: Export, import, or clear all data
- **App Settings**: Install app, future features (dark mode, notifications)
- **About**: App information and feature list

## 💾 Data Storage

- Uses **sql.js** (SQLite compiled to WebAssembly)
- All data stored in browser's **localStorage**
- Database schema includes:
  - Expenses table
  - Categories table
  - Budgets table
  - Recurring expenses table
  - Savings goals table

### Database Schema

```sql
-- Expenses: All income and expense transactions
CREATE TABLE expenses (
  id INTEGER PRIMARY KEY,
  amount REAL,
  category_id INTEGER,
  description TEXT,
  date TEXT,
  type TEXT (income/expense),
  payment_method TEXT,
  tags TEXT,
  receipt_url TEXT,
  created_at TEXT
);

-- Categories: Custom categories for transactions
CREATE TABLE categories (
  id INTEGER PRIMARY KEY,
  name TEXT UNIQUE,
  icon TEXT,
  color TEXT,
  type TEXT (income/expense),
  budget_limit REAL
);

-- And more tables for budgets, recurring expenses, and savings goals
```

## 🛠️ Tech Stack

- **Frontend**: React 18
- **Build Tool**: Vite
- **Database**: SQLite (sql.js)
- **Charts**: Recharts
- **PWA**: vite-plugin-pwa with Workbox
- **Icons**: Emoji + Lucide React
- **Styling**: Custom CSS

## 🔧 Configuration

### PWA Configuration
The app is configured as a PWA with:
- Auto-update strategy
- Offline support
- Manifest for installability
- Service worker for caching

### Customize Theme
Edit `src/App.css` to change:
- Primary colors
- Gradients
- Spacing
- Font sizes

## 📊 Default Categories

The app comes with pre-configured categories:

**Expense Categories:**
- Food & Dining 🍔
- Transportation 🚗
- Shopping 🛍️
- Entertainment 🎮
- Bills & Utilities ⚡
- Healthcare 🏥
- Education 📚
- Personal Care 💅
- Travel ✈️
- Home 🏠
- Other 📌

**Income Categories:**
- Salary 💰
- Freelance 💼
- Investment 📈
- Gift 🎁
- Other Income 💵

## 🚨 Important Notes

1. **Data Backup**: Since data is stored locally, regular backups are recommended
2. **Browser Support**: Works best on modern browsers (Chrome, Firefox, Safari, Edge)
3. **Storage Limits**: Browser localStorage has limits (usually 5-10MB)
4. **Clearing Browser Data**: Will delete all app data unless backed up
5. **Incognito Mode**: Data won't persist in incognito/private browsing

## 🔮 Future Enhancements

- 🌙 Dark mode
- 🔔 Push notifications for budget alerts
- 💱 Multi-currency support
- 📊 More chart types and analytics
- 🔄 Cloud sync (optional)
- 📸 Receipt photo storage
- 🏷️ Advanced tag management
- 📅 Calendar view
- 🤖 Smart insights and recommendations

## 🐛 Troubleshooting

### App Not Loading
- Clear browser cache and reload
- Check browser console for errors
- Ensure JavaScript is enabled

### Database Not Initializing
- Check browser localStorage is enabled
- Try in a different browser
- Clear localStorage and restart

### PWA Not Installing
- Ensure HTTPS is used (or localhost)
- Check browser PWA support
- Look for install icon in address bar

## 📄 License

This project is open source and available for personal use.

## 🤝 Contributing

Feel free to fork this project and add your own features!

## 📞 Support

For issues or questions, please check the Settings > About section in the app for more information.

---

**Made with ❤️ using React + SQLite + PWA technologies**

Enjoy managing your finances with complete privacy and control! 💰
