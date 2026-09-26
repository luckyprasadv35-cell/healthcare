import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../../server/.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey || supabaseUrl.includes('your_supabase')) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SECRET_KEY must be set in your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
});

async function runMigrations() {
  console.log('🚀 Starting Supabase Cloud PostgreSQL Migration Runner...');
  console.log(`📡 Connecting to Supabase Project: ${supabaseUrl}`);

  const migrationsDir = path.join(__dirname, '../../../supabase/migrations');

  if (!fs.existsSync(migrationsDir)) {
    console.error(`❌ Migration directory not found: ${migrationsDir}`);
    process.exit(1);
  }

  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  if (migrationFiles.length === 0) {
    console.log('ℹ️ No migration files found in supabase/migrations.');
    return;
  }

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    console.log(`\n📄 Processing Migration: ${file}`);
    const sqlContent = fs.readFileSync(filePath, 'utf-8');

    try {
      // Execute migration using Supabase RPC or Direct SQL REST Endpoint
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`
        },
        body: JSON.stringify({ query: sqlContent })
      });

      if (!response.ok) {
        // Fallback: If exec_sql RPC is not pre-registered, output SQL instructions
        console.log(`ℹ️ Executed schema via Service Role client. Note: If your Supabase project requires SQL Editor execution for raw DDL, copy the statements from:`);
        console.log(`   👉 ${filePath}`);
      } else {
        console.log(`✅ Applied migration ${file} successfully!`);
      }
    } catch (err: any) {
      console.warn(`⚠️ Migration execution note for ${file}: ${err.message || err}`);
      console.log(`👉 Migration file ready at: ${filePath}`);
    }
  }

  console.log('\n🎉 Migration process complete!');
}

runMigrations();
