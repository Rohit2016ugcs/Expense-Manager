import { sql } from '@vercel/postgres';

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

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (req.method === 'GET') {
      const result = await sql`
        SELECT r.*, c.name as category_name, c.icon as category_icon, c.color as category_color
        FROM recurring_expenses r
        LEFT JOIN categories c ON r.category_id = c.id
        WHERE r.user_id = ${userId} AND r.is_active = true
        ORDER BY r.next_occurrence
      `;

      res.status(200).json({ success: true, recurring: result.rows });

    } else if (req.method === 'POST') {
      const { amount, category_id, description, frequency, start_date, end_date, next_occurrence, type, payment_method } = req.body;

      if (!amount || !category_id || !frequency || !start_date || !next_occurrence || !type) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = await sql`
        INSERT INTO recurring_expenses (user_id, amount, category_id, description, frequency, start_date, end_date, next_occurrence, type, payment_method)
        VALUES (${userId}, ${amount}, ${category_id}, ${description || null}, ${frequency}, ${start_date}, ${end_date || null}, ${next_occurrence}, ${type}, ${payment_method || null})
        RETURNING *
      `;

      res.status(201).json({ success: true, recurring: result.rows[0] });

    } else if (req.method === 'PUT') {
      const { id, next_occurrence } = req.body;

      if (!id || !next_occurrence) {
        return res.status(400).json({ error: 'ID and next_occurrence are required' });
      }

      const result = await sql`
        UPDATE recurring_expenses 
        SET next_occurrence = ${next_occurrence}
        WHERE id = ${id} AND user_id = ${userId}
        RETURNING *
      `;

      res.status(200).json({ success: true, recurring: result.rows[0] });

    } else if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Recurring expense ID is required' });
      }

      await sql`
        UPDATE recurring_expenses SET is_active = false WHERE id = ${id} AND user_id = ${userId}
      `;

      res.status(200).json({ success: true, message: 'Recurring expense deleted' });

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Recurring expenses API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
