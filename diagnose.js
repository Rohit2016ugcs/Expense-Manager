// Quick Diagnostic Tool for Database Issues
// This script checks your database setup and identifies problems
// Usage: 
//   1. vercel env pull .env.local
//   2. node diagnose.js

import { sql } from '@vercel/postgres';

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

async function diagnose() {
  console.log(`${BLUE}╔════════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BLUE}║     DATABASE CONNECTION DIAGNOSTIC TOOL            ║${RESET}`);
  console.log(`${BLUE}╚════════════════════════════════════════════════════╝${RESET}\n`);

  const results = {
    passed: 0,
    failed: 0,
    warnings: 0
  };

  // Test 1: Environment Variables
  console.log(`${BLUE}[1/5]${RESET} Checking environment variables...`);
  const envVars = [
    'POSTGRES_URL',
    'POSTGRES_PRISMA_URL',
    'POSTGRES_URL_NON_POOLING',
    'POSTGRES_USER',
    'POSTGRES_HOST',
    'POSTGRES_PASSWORD',
    'POSTGRES_DATABASE'
  ];

  const missingVars = envVars.filter(v => !process.env[v]);
  
  if (missingVars.length === 0) {
    console.log(`${GREEN}✅ All environment variables are set${RESET}\n`);
    results.passed++;
  } else {
    console.log(`${RED}❌ Missing environment variables:${RESET}`);
    missingVars.forEach(v => console.log(`   - ${v}`));
    console.log(`${YELLOW}💡 Solution: Run 'vercel env pull .env.local'${RESET}\n`);
    results.failed++;
    
    console.log(`${RED}Cannot proceed without environment variables. Exiting...${RESET}\n`);
    process.exit(1);
  }

  // Test 2: Database Connection
  console.log(`${BLUE}[2/5]${RESET} Testing database connection...`);
  try {
    const connResult = await sql`SELECT current_database(), current_user, version()`;
    console.log(`${GREEN}✅ Connected successfully${RESET}`);
    console.log(`   Database: ${connResult.rows[0].current_database}`);
    console.log(`   User: ${connResult.rows[0].current_user}`);
    console.log(`   PostgreSQL Version: ${connResult.rows[0].version.split(',')[0]}\n`);
    results.passed++;
  } catch (error) {
    console.log(`${RED}❌ Connection failed: ${error.message}${RESET}`);
    
    if (error.message.includes('404')) {
      console.log(`${YELLOW}💡 This is your problem!${RESET}`);
      console.log(`   ${RED}Database endpoint not found (HTTP 404)${RESET}`);
      console.log(`\n${YELLOW}Possible causes:${RESET}`);
      console.log(`   1. Database doesn't exist in Vercel`);
      console.log(`   2. Database was deleted`);
      console.log(`   3. Wrong region or incorrect URL`);
      console.log(`   4. Environment variables are outdated`);
      console.log(`\n${GREEN}Solution:${RESET}`);
      console.log(`   1. Go to Vercel Dashboard → Your Project → Storage`);
      console.log(`   2. Create a new Postgres database if none exists`);
      console.log(`   3. Copy the environment variables`);
      console.log(`   4. Go to Settings → Environment Variables`);
      console.log(`   5. Update all environment variables`);
      console.log(`   6. Redeploy your application\n`);
    }
    
    results.failed++;
    console.log(`${RED}Cannot proceed without database connection. Exiting...${RESET}\n`);
    process.exit(1);
  }

  // Test 3: Tables Existence
  console.log(`${BLUE}[3/5]${RESET} Checking database tables...`);
  try {
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    const existingTables = tablesResult.rows.map(r => r.table_name);
    const requiredTables = ['users', 'categories', 'expenses', 'budgets', 'recurring_expenses', 'savings_goals'];
    const missingTables = requiredTables.filter(t => !existingTables.includes(t));

    if (missingTables.length === 0) {
      console.log(`${GREEN}✅ All required tables exist (${existingTables.length} total)${RESET}`);
      existingTables.forEach(t => console.log(`   - ${t}`));
      console.log('');
      results.passed++;
    } else {
      console.log(`${YELLOW}⚠️  Missing tables: ${missingTables.join(', ')}${RESET}`);
      console.log(`${YELLOW}💡 Solution: Run 'node setup-database.js' to create tables${RESET}\n`);
      results.warnings++;
    }
  } catch (error) {
    console.log(`${RED}❌ Failed to check tables: ${error.message}${RESET}\n`);
    results.failed++;
  }

  // Test 4: Sample Query Test
  console.log(`${BLUE}[4/5]${RESET} Testing sample queries...`);
  try {
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    const categoryCount = await sql`SELECT COUNT(*) as count FROM categories`;
    const expenseCount = await sql`SELECT COUNT(*) as count FROM expenses`;
    
    console.log(`${GREEN}✅ Queries working correctly${RESET}`);
    console.log(`   Users: ${userCount.rows[0].count}`);
    console.log(`   Categories: ${categoryCount.rows[0].count}`);
    console.log(`   Expenses: ${expenseCount.rows[0].count}\n`);
    results.passed++;
  } catch (error) {
    console.log(`${RED}❌ Query failed: ${error.message}${RESET}`);
    if (error.message.includes('does not exist')) {
      console.log(`${YELLOW}💡 Solution: Tables need to be created. Run 'node setup-database.js'${RESET}\n`);
    }
    results.failed++;
  }

  // Test 5: Indexes Check
  console.log(`${BLUE}[5/5]${RESET} Checking database indexes...`);
  try {
    const indexResult = await sql`
      SELECT indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public'
      ORDER BY indexname
    `;
    
    const indexCount = indexResult.rows.length;
    if (indexCount > 0) {
      console.log(`${GREEN}✅ Found ${indexCount} indexes${RESET}\n`);
      results.passed++;
    } else {
      console.log(`${YELLOW}⚠️  No indexes found${RESET}`);
      console.log(`${YELLOW}💡 Solution: Run 'node setup-database.js' to create indexes${RESET}\n`);
      results.warnings++;
    }
  } catch (error) {
    console.log(`${YELLOW}⚠️  Could not check indexes: ${error.message}${RESET}\n`);
    results.warnings++;
  }

  // Summary
  console.log(`${BLUE}═══════════════════════════════════════════════════${RESET}`);
  console.log(`${BLUE}                    SUMMARY                         ${RESET}`);
  console.log(`${BLUE}═══════════════════════════════════════════════════${RESET}`);
  console.log(`${GREEN}✅ Passed:   ${results.passed}${RESET}`);
  console.log(`${YELLOW}⚠️  Warnings: ${results.warnings}${RESET}`);
  console.log(`${RED}❌ Failed:   ${results.failed}${RESET}`);
  console.log(`${BLUE}═══════════════════════════════════════════════════${RESET}\n`);

  if (results.failed === 0 && results.warnings === 0) {
    console.log(`${GREEN}🎉 EXCELLENT! Your database is properly configured!${RESET}`);
    console.log(`${GREEN}   Your APIs should be working now.${RESET}\n`);
    console.log(`${BLUE}Next steps:${RESET}`);
    console.log(`   1. Deploy: git push origin main`);
    console.log(`   2. Test: Visit your app and try logging in`);
    console.log(`   3. Check: https://your-app.vercel.app/api/test-connection\n`);
  } else if (results.failed === 0 && results.warnings > 0) {
    console.log(`${YELLOW}⚠️  GOOD, but some optimizations needed${RESET}`);
    console.log(`${YELLOW}   Your database works but could be improved.${RESET}\n`);
    console.log(`${BLUE}Recommended action:${RESET}`);
    console.log(`   Run: node setup-database.js\n`);
  } else {
    console.log(`${RED}❌ ISSUES FOUND! Your database needs attention.${RESET}`);
    console.log(`${RED}   Follow the solutions above to fix the problems.${RESET}\n`);
    console.log(`${BLUE}Quick fix:${RESET}`);
    console.log(`   1. Check FIX_INTERNAL_SERVER_ERROR.md`);
    console.log(`   2. Verify database exists in Vercel Dashboard`);
    console.log(`   3. Run: vercel env pull .env.local`);
    console.log(`   4. Run: node setup-database.js\n`);
    process.exit(1);
  }
}

// Run diagnostics
diagnose().catch(error => {
  console.error(`${RED}\n❌ Diagnostic failed:${RESET}`, error.message);
  process.exit(1);
});
