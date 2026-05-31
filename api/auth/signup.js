import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  // Support both prefixed and unprefixed environment variables
  if (!process.env.POSTGRES_URL && process.env.Expense_Manager_POSTGRES_URL) {
    process.env.POSTGRES_URL = process.env.Expense_Manager_POSTGRES_URL;
  }
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await sql`
      INSERT INTO users (name, email, password)
      VALUES (${name}, ${email}, ${hashedPassword})
      RETURNING id, name, email, created_at
    `;

    const user = result.rows[0];

    // Insert default categories for the new user
    const defaultCategories = [
      // Expense categories
      { name: 'Food & Dining', icon: '🍔', color: '#ef4444', type: 'expense' },
      { name: 'Transportation', icon: '🚗', color: '#f97316', type: 'expense' },
      { name: 'Shopping', icon: '🛍️', color: '#ec4899', type: 'expense' },
      { name: 'Entertainment', icon: '🎮', color: '#a855f7', type: 'expense' },
      { name: 'Bills & Utilities', icon: '⚡', color: '#3b82f6', type: 'expense' },
      { name: 'Healthcare', icon: '🏥', color: '#06b6d4', type: 'expense' },
      { name: 'Education', icon: '📚', color: '#14b8a6', type: 'expense' },
      { name: 'Personal Care', icon: '💅', color: '#8b5cf6', type: 'expense' },
      { name: 'Travel', icon: '✈️', color: '#0ea5e9', type: 'expense' },
      { name: 'Home', icon: '🏠', color: '#84cc16', type: 'expense' },
      { name: 'Other', icon: '📌', color: '#6b7280', type: 'expense' },
      // Income categories
      { name: 'Salary', icon: '💰', color: '#22c55e', type: 'income' },
      { name: 'Freelance', icon: '💼', color: '#10b981', type: 'income' },
      { name: 'Investment', icon: '📈', color: '#059669', type: 'income' },
      { name: 'Gift', icon: '🎁', color: '#34d399', type: 'income' },
      { name: 'Other Income', icon: '💵', color: '#6ee7b7', type: 'income' }
    ];

    // Insert categories
    for (const cat of defaultCategories) {
      await sql`
        INSERT INTO categories (user_id, name, icon, color, type, budget_limit)
        VALUES (${user.id}, ${cat.name}, ${cat.icon}, ${cat.color}, ${cat.type}, 0)
      `;
    }

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
