// Simple Database Initialization Script
import { sql } from '@vercel/postgres';

async function initDatabase() {
  console.log('🚀 Initializing database...\n');

  try {
    // Test connection
    const connTest = await sql`SELECT current_database(), current_user`;
    console.log('✅ Connected to:', connTest.rows[0].current_database);
    console.log('   User:', connTest.rows[0].current_user);
    console.log('');

    // Create users table
    console.log('Creating users table...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Users table created\n');

    // Create categories table
    console.log('Creating categories table...');
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        icon VARCHAR(50),
        color VARCHAR(50),
        type VARCHAR(20) NOT NULL CHECK(type IN ('income', 'expense')),
        budget_limit DECIMAL(10, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Categories table created\n');

    // Create expenses table
    console.log('Creating expenses table...');
    await sql`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10, 2) NOT NULL,
        category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        description TEXT,
        date DATE NOT NULL,
        type VARCHAR(20) NOT NULL CHECK(type IN ('income', 'expense')),
        payment_method VARCHAR(50),
        tags TEXT,
        receipt_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Expenses table created\n');

    // Create budgets table
    console.log('Creating budgets table...');
    await sql`
      CREATE TABLE IF NOT EXISTS budgets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
        amount DECIMAL(10, 2) NOT NULL,
        period VARCHAR(20) NOT NULL CHECK(period IN ('daily', 'weekly', 'monthly', 'yearly')),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        alert_threshold INTEGER DEFAULT 80,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Budgets table created\n');

    // Create recurring_expenses table
    console.log('Creating recurring_expenses table...');
    await sql`
      CREATE TABLE IF NOT EXISTS recurring_expenses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10, 2) NOT NULL,
        category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        description TEXT,
        frequency VARCHAR(20) NOT NULL CHECK(frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
        start_date DATE NOT NULL,
        end_date DATE,
        next_occurrence DATE NOT NULL,
        is_active BOOLEAN DEFAULT true,
        type VARCHAR(20) NOT NULL CHECK(type IN ('income', 'expense')),
        payment_method VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Recurring expenses table created\n');

    // Create savings_goals table
    console.log('Creating savings_goals table...');
    await sql`
      CREATE TABLE IF NOT EXISTS savings_goals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        target_amount DECIMAL(10, 2) NOT NULL,
        current_amount DECIMAL(10, 2) DEFAULT 0,
        deadline DATE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Savings goals table created\n');

    // Create indexes
    console.log('Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_recurring_expenses_user_id ON recurring_expenses(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON savings_goals(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    console.log('✅ Indexes created\n');

    // Verify tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log('✅ All tables created successfully!\n');
    console.log('Tables in database:');
    tables.rows.forEach(row => console.log(`   - ${row.table_name}`));

    console.log('\n🎉 Database initialization complete!');
    console.log('\n✅ Next steps:');
    console.log('   1. Deploy your application');
    console.log('   2. Test at: https://your-app.vercel.app');
    console.log('   3. Try signing up and logging in\n');

  } catch (error) {
    console.error('\n❌ Database initialization failed:', error.message);
    if (error.code) console.error('   Error code:', error.code);
    process.exit(1);
  }
}

initDatabase();
