// Database Setup Script
// This script initializes all required tables in your Vercel Postgres database
// Usage: 
//   1. vercel env pull .env.local
//   2. node setup-database.js

import { sql } from '@vercel/postgres';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  console.log('🚀 Starting database setup...\n');

  try {
    // Check environment variable
    if (!process.env.POSTGRES_URL) {
      console.error('❌ POSTGRES_URL environment variable not found!');
      console.error('Run: vercel env pull .env.local');
      process.exit(1);
    }
    console.log('✅ Database connection string found\n');

    // Test connection
    console.log('🔌 Testing database connection...');
    const connTest = await sql`SELECT current_database(), current_user, version()`;
    console.log('✅ Connected to database:', connTest.rows[0].current_database);
    console.log('   User:', connTest.rows[0].current_user);
    console.log('   Version:', connTest.rows[0].version.substring(0, 50) + '...\n');

    // Read SQL file
    const sqlFilePath = path.join(__dirname, 'api', 'db-setup.sql');
    console.log('📄 Reading SQL schema from:', sqlFilePath);
    
    if (!fs.existsSync(sqlFilePath)) {
      console.error('❌ SQL file not found:', sqlFilePath);
      process.exit(1);
    }
    
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    console.log('✅ SQL schema loaded\n');

    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`🔧 Executing ${statements.length} SQL statements...\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Extract table/index name for logging
      let actionType = 'statement';
      let objectName = '';
      
      if (statement.match(/CREATE TABLE.*?(\w+)\s*\(/i)) {
        actionType = 'table';
        objectName = statement.match(/CREATE TABLE.*?(\w+)\s*\(/i)[1];
      } else if (statement.match(/CREATE INDEX.*?(\w+)/i)) {
        actionType = 'index';
        objectName = statement.match(/CREATE INDEX.*?(\w+)/i)[1];
      }

      try {
        await sql.query(statement + ';');
        if (objectName) {
          console.log(`✅ Created ${actionType}: ${objectName}`);
        } else {
          console.log(`✅ Executed statement ${i + 1}`);
        }
      } catch (error) {
        // Ignore "already exists" errors
        if (error.message.includes('already exists')) {
          console.log(`⚠️  ${actionType} ${objectName || i + 1} already exists (skipped)`);
        } else {
          console.error(`❌ Error in statement ${i + 1}:`, error.message);
          throw error;
        }
      }
    }

    console.log('\n🎉 Database setup completed!\n');

    // Verify tables
    console.log('🔍 Verifying tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log(`✅ Found ${tables.rows.length} tables:`);
    tables.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    // Check for required tables
    const requiredTables = ['users', 'categories', 'expenses', 'budgets', 'recurring_expenses', 'savings_goals'];
    const existingTables = tables.rows.map(r => r.table_name);
    const missingTables = requiredTables.filter(t => !existingTables.includes(t));

    if (missingTables.length > 0) {
      console.warn('\n⚠️  Warning: Missing required tables:', missingTables.join(', '));
    } else {
      console.log('\n✅ All required tables are present!');
    }

    console.log('\n✨ Setup complete! Your database is ready to use.\n');
    console.log('Next steps:');
    console.log('1. Deploy your application: git push origin main');
    console.log('2. Test the connection: https://your-app.vercel.app/api/test-connection');
    console.log('3. Try logging in or signing up\n');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    
    if (error.message.includes('404')) {
      console.error('\n💡 Troubleshooting:');
      console.error('   - Database endpoint not found (HTTP 404)');
      console.error('   - Verify database exists in Vercel Dashboard → Storage');
      console.error('   - Check POSTGRES_URL is correct');
      console.error('   - Database might be in wrong region or deleted');
    } else if (error.message.includes('authentication')) {
      console.error('\n💡 Troubleshooting:');
      console.error('   - Database authentication failed');
      console.error('   - Pull latest env variables: vercel env pull .env.local');
      console.error('   - Check POSTGRES_PASSWORD is correct');
    }
    
    process.exit(1);
  }
}

// Run setup
setupDatabase();
