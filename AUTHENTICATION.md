# Authentication System Documentation

## Overview
The Expense Manager now includes a complete authentication system with signup and signin functionality. All user data is stored in a SQLite database with user-specific isolation, ensuring data privacy and persistence.

## Features

### 1. User Authentication
- **Signup**: New users can create an account with name, email, and password
- **Login**: Existing users can sign in with email and password
- **Logout**: Users can securely log out of their accounts
- **Session Management**: User sessions are maintained across page refreshes

### 2. Data Isolation
All user data is completely isolated:
- Expenses
- Categories
- Budgets
- Recurring Expenses
- Savings Goals
- Reports and Statistics

Each user only sees and manages their own data.

### 3. Default Categories
When a new user signs up, the system automatically creates default expense and income categories:

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

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
```

### Updated Tables with User Isolation
All existing tables now include a `user_id` foreign key:
- `expenses` - user_id links to users(id)
- `categories` - user_id links to users(id)
- `budgets` - user_id links to users(id)
- `recurring_expenses` - user_id links to users(id)
- `savings_goals` - user_id links to users(id)

## Implementation Details

### File Structure
```
src/
├── context/
│   └── AuthContext.jsx       # Authentication context provider
├── components/
│   ├── Auth.jsx              # Login/Signup component
│   └── Auth.css              # Auth component styles
├── utils/
│   ├── auth.js               # Authentication functions
│   └── db.js                 # Database operations (updated with userId)
├── App.jsx                   # Main app with auth integration
└── main.jsx                  # Root with AuthProvider
```

### Key Components

#### AuthContext
Provides authentication state and methods throughout the app:
- `user` - Current logged-in user object
- `login(email, password)` - Login function
- `signup(name, email, password)` - Signup function
- `logout()` - Logout function
- `isAuthenticated` - Boolean indicating auth status
- `loading` - Loading state

#### Auth Component
Beautiful, responsive login/signup form with:
- Form validation
- Error handling
- Toggle between login and signup modes
- Gradient background design

### Database Operations
All database functions now require a `userId` parameter to ensure data isolation:

```javascript
// Example usage
import { useAuth } from './context/AuthContext';

const { user } = useAuth();

// Fetch user-specific expenses
const expenses = getExpenses(user.id, filters);

// Add expense for current user
addExpense(expenseData, user.id);
```

## Security Notes

⚠️ **Important**: The current password hashing implementation is simplified for demonstration. In a production environment:
1. Use proper password hashing libraries like bcrypt or argon2
2. Add salt to password hashes
3. Implement rate limiting on login attempts
4. Add CSRF protection
5. Use HTTPS for all communications
6. Consider using backend authentication with JWT tokens

## Usage

### For Users
1. **First Time**: Click "Sign Up" and create an account
2. **Returning Users**: Sign in with your email and password
3. **Session**: Your session persists even after closing the browser
4. **Logout**: Click the "Logout" button in the header to sign out

### For Developers
To update components to use the authenticated user:

```javascript
import { useAuth } from '../context/AuthContext';

function YourComponent() {
  const { user } = useAuth();
  
  // Use user.id for database operations
  const data = getSomeData(user.id);
  
  return (
    <div>
      {/* Your component JSX */}
    </div>
  );
}
```

## Migration
Existing databases will be automatically migrated to include the users table. However, since old data doesn't have user associations, you may need to:
1. Clear existing data, or
2. Manually associate old data with a user account

## Future Enhancements
- Password recovery/reset
- Email verification
- OAuth integration (Google, GitHub, etc.)
- Two-factor authentication
- User profile management
- Data export/import per user
- Backend API integration
- Multi-device synchronization

## Testing
1. **Signup**: Create a new account
2. **Login**: Sign in with your credentials
3. **Data Isolation**: Create a second account and verify data separation
4. **Persistence**: Refresh the page and verify session maintains
5. **Logout**: Sign out and verify you return to login screen

---

Built with ❤️ for secure, personal expense management
