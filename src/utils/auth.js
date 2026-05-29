import { authAPI } from '../services/api';
import { USE_CLOUD_BACKEND } from './api-adapter';

// Only for local/fallback mode
const hashPassword = (password) => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

export const registerUser = async (name, email, password) => {
  if (USE_CLOUD_BACKEND) {
    // Use cloud backend
    const response = await authAPI.signup(name, email, password);
    if (response.success) {
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      return response.user;
    }
    throw new Error('Registration failed');
  } else {
    // Use local database (original implementation)
    const { getDB, insertDefaultCategories, saveDB } = await import('./db');
    const db = getDB();
    
    const checkResult = db.exec('SELECT id FROM users WHERE email = ?', [email]);
    if (checkResult.length > 0 && checkResult[0].values.length > 0) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = hashPassword(password);
    const stmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    stmt.run([name, email, hashedPassword]);
    stmt.free();

    const result = db.exec('SELECT id, name, email, created_at FROM users WHERE email = ?', [email]);
    
    if (result.length > 0 && result[0].values.length > 0) {
      const user = {
        id: result[0].values[0][0],
        name: result[0].values[0][1],
        email: result[0].values[0][2],
        created_at: result[0].values[0][3]
      };

      localStorage.setItem('currentUser', JSON.stringify(user));
      insertDefaultCategories(user.id);
      saveDB();
      
      return user;
    }

    throw new Error('Registration failed');
  }
};

export const loginUser = async (email, password) => {
  if (USE_CLOUD_BACKEND) {
    // Use cloud backend
    const response = await authAPI.login(email, password);
    if (response.success) {
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      return response.user;
    }
    return null;
  } else {
    // Use local database (original implementation)
    const { getDB, insertDefaultCategories, saveDB } = await import('./db');
    const db = getDB();
    const hashedPassword = hashPassword(password);

    const result = db.exec(
      'SELECT id, name, email, created_at FROM users WHERE email = ? AND password = ?',
      [email, hashedPassword]
    );

    if (result.length > 0 && result[0].values.length > 0) {
      const user = {
        id: result[0].values[0][0],
        name: result[0].values[0][1],
        email: result[0].values[0][2],
        created_at: result[0].values[0][3]
      };

      const categoriesCheck = db.exec('SELECT COUNT(*) as count FROM categories WHERE user_id = ?', [user.id]);
      const categoryCount = categoriesCheck[0].values[0][0];
      
      if (categoryCount === 0) {
        insertDefaultCategories(user.id);
        saveDB();
      }

      localStorage.setItem('currentUser', JSON.stringify(user));
      
      return user;
    }

    return null;
  }
};

export const logoutUser = () => {
  localStorage.removeItem('currentUser');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('currentUser');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  }
  return null;
};
