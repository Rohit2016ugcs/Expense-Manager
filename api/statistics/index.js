import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, startDate, endDate, type } = req.query;

    if (!userId || !startDate || !endDate) {
      return res.status(400).json({ error: 'userId, startDate, and endDate are required' });
    }

    if (type === 'summary') {
      // Overall statistics
      const result = await sql`
        SELECT 
          type,
          SUM(amount) as total,
          COUNT(*) as count
        FROM expenses
        WHERE user_id = ${userId} AND date BETWEEN ${startDate} AND ${endDate}
        GROUP BY type
      `;

      const stats = { income: 0, expense: 0, income_count: 0, expense_count: 0 };
      result.rows.forEach(row => {
        if (row.type === 'income') {
          stats.income = parseFloat(row.total);
          stats.income_count = parseInt(row.count);
        } else {
          stats.expense = parseFloat(row.total);
          stats.expense_count = parseInt(row.count);
        }
      });

      res.status(200).json({ success: true, stats });

    } else if (type === 'category') {
      // Category-wise statistics
      const expenseType = req.query.expenseType || 'expense';
      
      const result = await sql`
        SELECT 
          c.id,
          c.name,
          c.icon,
          c.color,
          SUM(e.amount) as total,
          COUNT(e.id) as count
        FROM expenses e
        LEFT JOIN categories c ON e.category_id = c.id
        WHERE e.user_id = ${userId} AND e.date BETWEEN ${startDate} AND ${endDate} AND e.type = ${expenseType}
        GROUP BY c.id, c.name, c.icon, c.color
        ORDER BY total DESC
      `;

      res.status(200).json({ success: true, categories: result.rows });

    } else if (type === 'daily') {
      // Daily statistics
      const result = await sql`
        SELECT 
          date,
          type,
          SUM(amount) as total
        FROM expenses
        WHERE user_id = ${userId} AND date BETWEEN ${startDate} AND ${endDate}
        GROUP BY date, type
        ORDER BY date
      `;

      res.status(200).json({ success: true, daily: result.rows });

    } else {
      res.status(400).json({ error: 'Invalid type parameter. Use: summary, category, or daily' });
    }
  } catch (error) {
    console.error('Statistics API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
