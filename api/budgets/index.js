import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,DELETE');
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
        SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color
        FROM budgets b
        LEFT JOIN categories c ON b.category_id = c.id
        WHERE b.user_id = ${userId}
        ORDER BY b.created_at DESC
      `;

      res.status(200).json({ success: true, budgets: result.rows });

    } else if (req.method === 'POST') {
      const { category_id, amount, period, start_date, end_date, alert_threshold } = req.body;

      if (!amount || !period || !start_date || !end_date) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = await sql`
        INSERT INTO budgets (user_id, category_id, amount, period, start_date, end_date, alert_threshold)
        VALUES (${userId}, ${category_id || null}, ${amount}, ${period}, ${start_date}, ${end_date}, ${alert_threshold || 80})
        RETURNING *
      `;

      res.status(201).json({ success: true, budget: result.rows[0] });

    } else if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Budget ID is required' });
      }

      await sql`
        DELETE FROM budgets WHERE id = ${id} AND user_id = ${userId}
      `;

      res.status(200).json({ success: true, message: 'Budget deleted' });

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Budgets API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
