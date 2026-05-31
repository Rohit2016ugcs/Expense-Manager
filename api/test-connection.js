// Test endpoint to verify database connection
// Visit: https://your-app.vercel.app/api/test-connection

import { createConnection } from '@vercel/postgres';

// Support both prefixed and unprefixed environment variables
const POSTGRES_URL = process.env.POSTGRES_URL || process.env.Expense_Manager_POSTGRES_URL;
const sql = createConnection({ connectionString: POSTGRES_URL });

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const results = {
    timestamp: new Date().toISOString(),
    checks: []
  };

  // Test 1: Check environment variable
  results.checks.push({
    test: 'Environment Variable Check',
    status: process.env.POSTGRES_URL ? 'PASS' : 'FAIL',
    details: process.env.POSTGRES_URL 
      ? `URL exists: ${process.env.POSTGRES_URL.substring(0, 30)}...`
      : 'POSTGRES_URL not found'
  });

  // Test 2: Test basic connection
  try {
    const connectionResult = await sql`SELECT current_database(), current_user, version()`;
    results.checks.push({
      test: 'Database Connection',
      status: 'PASS',
      details: {
        database: connectionResult.rows[0].current_database,
        user: connectionResult.rows[0].current_user,
        version: connectionResult.rows[0].version.substring(0, 50)
      }
    });
  } catch (error) {
    results.checks.push({
      test: 'Database Connection',
      status: 'FAIL',
      error: error.message,
      code: error.code,
      details: 'Cannot connect to database'
    });
    return res.status(500).json(results);
  }

  // Test 3: Check if tables exist
  try {
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    const tableNames = tablesResult.rows.map(row => row.table_name);
    const requiredTables = ['users', 'categories', 'expenses', 'budgets', 'recurring_expenses', 'savings_goals'];
    const missingTables = requiredTables.filter(table => !tableNames.includes(table));
    
    results.checks.push({
      test: 'Tables Exist',
      status: missingTables.length === 0 ? 'PASS' : 'FAIL',
      details: {
        found: tableNames,
        missing: missingTables,
        total: tableNames.length
      }
    });
  } catch (error) {
    results.checks.push({
      test: 'Tables Exist',
      status: 'FAIL',
      error: error.message
    });
  }

  // Test 4: Test users table query
  try {
    const usersTest = await sql`SELECT COUNT(*) as count FROM users`;
    results.checks.push({
      test: 'Query Users Table',
      status: 'PASS',
      details: `Users table has ${usersTest.rows[0].count} rows`
    });
  } catch (error) {
    results.checks.push({
      test: 'Query Users Table',
      status: 'FAIL',
      error: error.message,
      hint: error.message.includes('404') 
        ? 'Database endpoint not found - check POSTGRES_URL'
        : 'Check if users table exists'
    });
  }

  // Summary
  const passedTests = results.checks.filter(c => c.status === 'PASS').length;
  const totalTests = results.checks.length;
  
  results.summary = {
    passed: passedTests,
    total: totalTests,
    success: passedTests === totalTests
  };

  const statusCode = results.summary.success ? 200 : 500;
  return res.status(statusCode).json(results);
}
