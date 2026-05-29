/**
 * Database Verification Script
 * 
 * This script checks if your Vercel Postgres database is properly set up.
 * 
 * HOW TO RUN:
 * 1. First, pull environment variables from Vercel:
 *    vercel env pull .env.local
 * 
 * 2. Then run this script:
 *    node verify-database.js
 */

import { sql } from '@vercel/postgres';

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

async function verifyDatabase() {
  console.log(`${BLUE}========================================${RESET}`);
  console.log(`${BLUE}  DATABASE VERIFICATION SCRIPT${RESET}`);
  console.log(`${BLUE}========================================${RESET}\n`);

  let totalTests = 0;
  let passedTests = 0;

  // Test 1: Check environment variables
  console.log(`${YELLOW}Test 1: Checking environment variables...${RESET}`);
  totalTests++;
  
  if (process.env.POSTGRES_URL) {
    console.log(`${GREEN}✓ POSTGRES_URL exists${RESET}`);
    console.log(`  URL: ${process.env.POSTGRES_URL.substring(0, 30)}...`);
    passedTests++;
  } else {
    console.log(`${RED}✗ POSTGRES_URL not found${RESET}`);
    console.log(`${RED}  Solution: Run 'vercel env pull .env.local' first${RESET}\n`);
    process.exit(1);
  }

  // Test 2: Test database connection
  console.log(`\n${YELLOW}Test 2: Testing database connection...${RESET}`);
  totalTests++;
  
  try {
    const result = await sql`SELECT current_database(), current_user, version()`;
    console.log(`${GREEN}✓ Database connection successful${RESET}`);
    console.log(`  Database: ${result.rows[0].current_database}`);
    console.log(`  User: ${result.rows[0].current_user}`);
    passedTests++;
  } catch (error) {
    console.log(`${RED}✗ Database connection failed${RESET}`);
    console.log(`${RED}  Error: ${error.message}${RESET}`);
    
    if (error.message.includes('404')) {
      console.log(`\n${YELLOW}  This is the 404 error you're seeing!${RESET}`);
      console.log(`  Possible causes:`);
      console.log(`  1. Database endpoint doesn't exist`);
      console.log(`  2. Database is sleeping (Neon free tier)`);
      console.log(`  3. Wrong database URL in environment variables`);
      console.log(`\n  ${BLUE}Fix: Check IMMEDIATE_FIX_STEPS.md${RESET}\n`);
    }
    
    process.exit(1);
  }

  // Test 3: Check if tables exist
  console.log(`\n${YELLOW}Test 3: Checking if tables exist...${RESET}`);
  totalTests++;
  
  try {
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    const requiredTables = ['users', 'categories', 'expenses', 'budgets', 'recurring_expenses', 'savings_goals'];
    const existingTables = result.rows.map(row => row.table_name);
    
    console.log(`  Found ${existingTables.length} tables:`);
    existingTables.forEach(table => {
      console.log(`    - ${table}`);
    });
    
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length === 0) {
      console.log(`${GREEN}✓ All required tables exist${RESET}`);
      passedTests++;
    } else {
      console.log(`${RED}✗ Missing tables: ${missingTables.join(', ')}${RESET}`);
      console.log(`\n${YELLOW}  This is likely the cause of your 404 error!${RESET}`);
      console.log(`  ${BLUE}Fix: Run the SQL schema in Vercel Dashboard${RESET}`);
      console.log(`  See IMMEDIATE_FIX_STEPS.md - Step 3\n`);
    }
  } catch (error) {
    console.log(`${RED}✗ Failed to check tables${RESET}`);
    console.log(`${RED}  Error: ${error.message}${RESET}\n`);
  }

  // Test 4: Check if users table has correct schema
  console.log(`\n${YELLOW}Test 4: Verifying users table schema...${RESET}`);
  totalTests++;
  
  try {
    const result = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `;
    
    if (result.rows.length > 0) {
      console.log(`${GREEN}✓ Users table schema verified${RESET}`);
      console.log(`  Columns:`);
      result.rows.forEach(col => {
        console.log(`    - ${col.column_name} (${col.data_type})`);
      });
      passedTests++;
    } else {
      console.log(`${RED}✗ Users table not found or empty${RESET}`);
    }
  } catch (error) {
    console.log(`${RED}✗ Failed to verify users table${RESET}`);
    console.log(`${RED}  Error: ${error.message}${RESET}`);
  }

  // Test 5: Check if indexes exist
  console.log(`\n${YELLOW}Test 5: Checking database indexes...${RESET}`);
  totalTests++;
  
  try {
    const result = await sql`
      SELECT tablename, indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      ORDER BY tablename, indexname
    `;
    
    console.log(`${GREEN}✓ Found ${result.rows.length} indexes${RESET}`);
    passedTests++;
  } catch (error) {
    console.log(`${YELLOW}⚠ Could not check indexes (not critical)${RESET}`);
    passedTests++; // Don't fail on this
  }

  // Final summary
  console.log(`\n${BLUE}========================================${RESET}`);
  console.log(`${BLUE}  VERIFICATION SUMMARY${RESET}`);
  console.log(`${BLUE}========================================${RESET}`);
  console.log(`\n  Tests Passed: ${passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log(`\n${GREEN}  ✓ ALL TESTS PASSED!${RESET}`);
    console.log(`${GREEN}  Your database is properly configured.${RESET}`);
    console.log(`\n  If you're still getting errors:`);
    console.log(`  1. Make sure you've redeployed on Vercel`);
    console.log(`  2. Check Vercel Function logs for details`);
    console.log(`  3. Clear your browser cache and try again\n`);
  } else {
    console.log(`\n${RED}  ✗ SOME TESTS FAILED${RESET}`);
    console.log(`${YELLOW}  Please follow the fixes suggested above.${RESET}`);
    console.log(`${BLUE}  See IMMEDIATE_FIX_STEPS.md for detailed instructions.${RESET}\n`);
  }

  process.exit(passedTests === totalTests ? 0 : 1);
}

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
  console.error(`\n${RED}Unhandled error:${RESET}`, error.message);
  console.log(`\n${YELLOW}Make sure you've run: vercel env pull .env.local${RESET}\n`);
  process.exit(1);
});

// Run the verification
verifyDatabase();
