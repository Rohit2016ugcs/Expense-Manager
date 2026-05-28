import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getCurrentUser, logoutUser } from '../utils/auth';
import { initDB } from '../utils/db';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      // Initialize database first
      const dbInitialized = await initDB();
      setDbReady(dbInitialized);
      
      if (dbInitialized) {
        // Then check if user is already logged in
        const currentUser = getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      }
      
      setLoading(false);
    };
    
    initialize();
  }, []);

  const login = async (email, password) => {
    try {
      const loggedInUser = await loginUser(email, password);
      if (loggedInUser) {
        setUser(loggedInUser);
        return { success: true };
      }
      return { success: false, error: 'Invalid email or password' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const newUser = await registerUser(name, email, password);
      if (newUser) {
        setUser(newUser);
        return { success: true };
      }
      return { success: false, error: 'Registration failed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
    dbReady,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
