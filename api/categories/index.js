import { createConnection } from '@vercel/postgres';

// Support both prefixed and unprefixed environment variables
const POSTGRES_URL = process.env.POSTGRES_URL || process.env.Expense_Manager_POSTGRES_URL;
const sql = createConnection({ connectionString: POSTGRES_URL });

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (req.method === 'GET') {
      // Get categories
      const { type } = req.query;
      
      let query = 'SELECT * FROM categories WHERE user_id = $1';
      const params = [userId];

      if (type) {
        query += ' AND type = $2';
        params.push(type);
      }

      query += ' ORDER BY name';

      const result = await sql.query(query, params);
      res.status(200).json({ success: true, categories: result.rows });

    } else if (req.method === 'POST') {
      // Add new category
      const { name, icon, color, type, budget_limit } = req.body;

      if (!name || !type) {
        return res.status(400).json({ error: 'Name and type are required' });
      }

      const result = await sql`
        INSERT INTO categories (user_id, name, icon, color, type, budget_limit)
        VALUES (${userId}, ${name}, ${icon || null}, ${color || null}, ${type}, ${budget_limit || 0})
        RETURNING *
      `;

      res.status(201).json({ success: true, category: result.rows[0] });

    } else if (req.method === 'PUT') {
      // Update category
      const { id, name, icon, color, budget_limit } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Category ID is required' });
      }

      const result = await sql`
        UPDATE categories 
        SET name = ${name}, icon = ${icon || null}, color = ${color || null}, budget_limit = ${budget_limit || 0}
        WHERE id = ${id} AND user_id = ${userId}
        RETURNING *
      `;

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.status(200).json({ success: true, category: result.rows[0] });

    } else if (req.method === 'DELETE') {
      // Delete category
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Category ID is required' });
      }

      await sql`
        DELETE FROM categories WHERE id = ${id} AND user_id = ${userId}
      `;

      res.status(200).json({ success: true, message: 'Category deleted' });

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Categories API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
