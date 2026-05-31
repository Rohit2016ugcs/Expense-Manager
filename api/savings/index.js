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
        SELECT * FROM savings_goals 
        WHERE user_id = ${userId} 
        ORDER BY deadline
      `;

      res.status(200).json({ success: true, goals: result.rows });

    } else if (req.method === 'POST') {
      const { name, target_amount, current_amount, deadline, description } = req.body;

      if (!name || !target_amount) {
        return res.status(400).json({ error: 'Name and target amount are required' });
      }

      const result = await sql`
        INSERT INTO savings_goals (user_id, name, target_amount, current_amount, deadline, description)
        VALUES (${userId}, ${name}, ${target_amount}, ${current_amount || 0}, ${deadline || null}, ${description || null})
        RETURNING *
      `;

      res.status(201).json({ success: true, goal: result.rows[0] });

    } else if (req.method === 'PUT') {
      const { id, name, target_amount, current_amount, deadline, description } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Goal ID is required' });
      }

      const result = await sql`
        UPDATE savings_goals 
        SET name = ${name}, target_amount = ${target_amount}, current_amount = ${current_amount}, 
            deadline = ${deadline || null}, description = ${description || null}
        WHERE id = ${id} AND user_id = ${userId}
        RETURNING *
      `;

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Goal not found' });
      }

      res.status(200).json({ success: true, goal: result.rows[0] });

    } else if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Goal ID is required' });
      }

      await sql`
        DELETE FROM savings_goals WHERE id = ${id} AND user_id = ${userId}
      `;

      res.status(200).json({ success: true, message: 'Goal deleted' });

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Savings goals API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
