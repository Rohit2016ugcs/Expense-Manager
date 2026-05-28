import { getDB, insertDefaultCategories, saveDB } from './db';

// Hash password (simple implementation - in production use bcrypt or similar)
const hashPassword = (password) => {
  // Simple hash for demo - in production use proper hashing like bcrypt
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

export const registerUser = (name, email, password) => {
  const db = getDB();
  
  // Check if user already exists
  const checkResult = db.exec('SELECT id FROM users WHERE email = ?', [email]);
  if (checkResult.length > 0 && checkResult[0].values.length > 0) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const hashedPassword = hashPassword(password);

  // Insert new user
  const stmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
  stmt.run([name, email, hashedPassword]);
  stmt.free();

  // Get the newly created user
  const result = db.exec('SELECT id, name, email, created_at FROM users WHERE email = ?', [email]);
  
  if (result.length > 0 && result[0].values.length > 0) {
    const user = {
      id: result[0].values[0][0],
      name: result[0].values[0][1],
      email: result[0].values[0][2],
      created_at: result[0].values[0][3]
    };

    // Save to localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Insert default categories for the new user
    insertDefaultCategories(user.id);
    
    // Save DB after registration
    saveDB();
    
    return user;
  }

  throw new Error('Registration failed');
};

export const loginUser = (email, password) => {
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

    // Save to localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    return user;
  }

  return null;
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
