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
      // Get expenses with filters
      const { type, category_id, startDate, endDate, search, limit } = req.query;
      
      let query = `
        SELECT e.*, c.name as category_name, c.icon as category_icon, c.color as category_color
        FROM expenses e
        LEFT JOIN categories c ON e.category_id = c.id
        WHERE e.user_id = $1
      `;
      const params = [userId];
      let paramCount = 1;

      if (type) {
        paramCount++;
        query += ` AND e.type = $${paramCount}`;
        params.push(type);
      }

      if (category_id) {
        paramCount++;
        query += ` AND e.category_id = $${paramCount}`;
        params.push(category_id);
      }

      if (startDate) {
        paramCount++;
        query += ` AND e.date >= $${paramCount}`;
        params.push(startDate);
      }

      if (endDate) {
        paramCount++;
        query += ` AND e.date <= $${paramCount}`;
        params.push(endDate);
      }

      if (search) {
        paramCount++;
        query += ` AND (e.description ILIKE $${paramCount} OR c.name ILIKE $${paramCount})`;
        params.push(`%${search}%`);
      }

      query += ' ORDER BY e.date DESC, e.id DESC';

      if (limit) {
        paramCount++;
        query += ` LIMIT $${paramCount}`;
        params.push(parseInt(limit));
      }

      const result = await sql.query(query, params);
      res.status(200).json({ success: true, expenses: result.rows });

    } else if (req.method === 'POST') {
      // Add new expense
      const { amount, category_id, description, date, type, payment_method, tags, receipt_url } = req.body;

      if (!amount || !category_id || !date || !type) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = await sql`
        INSERT INTO expenses (user_id, amount, category_id, description, date, type, payment_method, tags, receipt_url)
        VALUES (${userId}, ${amount}, ${category_id}, ${description || null}, ${date}, ${type}, ${payment_method || null}, ${tags || null}, ${receipt_url || null})
        RETURNING *
      `;

      res.status(201).json({ success: true, expense: result.rows[0] });

    } else if (req.method === 'PUT') {
      // Update expense
      const { id, amount, category_id, description, date, type, payment_method, tags, receipt_url } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Expense ID is required' });
      }

      const result = await sql`
        UPDATE expenses 
        SET amount = ${amount}, category_id = ${category_id}, description = ${description || null}, 
            date = ${date}, type = ${type}, payment_method = ${payment_method || null}, 
            tags = ${tags || null}, receipt_url = ${receipt_url || null}
        WHERE id = ${id} AND user_id = ${userId}
        RETURNING *
      `;

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      res.status(200).json({ success: true, expense: result.rows[0] });

    } else if (req.method === 'DELETE') {
      // Delete expense
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Expense ID is required' });
      }

      await sql`
        DELETE FROM expenses WHERE id = ${id} AND user_id = ${userId}
      `;

      res.status(200).json({ success: true, message: 'Expense deleted' });

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Expenses API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
