#!/usr/bin/env node

/**
 * Database Migration Script
 * Applies pending migrations to the database
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations');

async function runMigrations() {
  try {
    console.log('🔄 Starting database migrations...');
    
    // Check if migrations directory exists
    if (!fs.existsSync(MIGRATIONS_DIR)) {
      console.log('📁 No migrations directory found. Skipping migrations.');
      return;
    }
    
    // Get list of migration files
    const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    if (migrationFiles.length === 0) {
      console.log('📝 No migration files found. Database is up to date.');
      return;
    }
    
    console.log(`📝 Found ${migrationFiles.length} migration files`);
    
    // Run migrations using Supabase CLI
    const migrateCommand = 'supabase db push';
    
    exec(migrateCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
      }
      
      if (stderr) {
        console.warn('⚠️ Migration warnings:', stderr);
      }
      
      console.log('✅ Database migrations completed successfully');
      console.log(stdout);
    });
    
  } catch (error) {
    console.error('❌ Migration process failed:', error);
    process.exit(1);
  }
}

async function rollbackMigration(steps = 1) {
  try {
    console.log(`🔄 Rolling back ${steps} migration(s)...`);
    
    // This would depend on your migration strategy
    // For Supabase, you might need custom rollback scripts
    const rollbackCommand = `supabase migration rollback --count=${steps}`;
    
    exec(rollbackCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Rollback failed:', error);
        process.exit(1);
      }
      
      if (stderr) {
        console.warn('⚠️ Rollback warnings:', stderr);
      }
      
      console.log('✅ Database rollback completed successfully');
      console.log(stdout);
    });
    
  } catch (error) {
    console.error('❌ Rollback process failed:', error);
    process.exit(1);
  }
}

async function checkMigrationStatus() {
  try {
    console.log('🔍 Checking migration status...');
    
    const statusCommand = 'supabase migration list';
    
    exec(statusCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Status check failed:', error);
        process.exit(1);
      }
      
      if (stderr) {
        console.warn('⚠️ Status check warnings:', stderr);
      }
      
      console.log('📊 Migration Status:');
      console.log(stdout);
    });
    
  } catch (error) {
    console.error('❌ Status check failed:', error);
    process.exit(1);
  }
}

// Handle command line arguments
const command = process.argv[2];

switch (command) {
  case 'up':
  case 'apply':
    runMigrations();
    break;
  case 'rollback':
    const steps = parseInt(process.argv[3]) || 1;
    rollbackMigration(steps);
    break;
  case 'status':
    checkMigrationStatus();
    break;
  default:
    console.log('Usage:');
    console.log('  node migrate-database.js up        - Apply pending migrations');
    console.log('  node migrate-database.js rollback [n] - Rollback n migrations (default: 1)');
    console.log('  node migrate-database.js status    - Check migration status');
    break;
}

module.exports = { runMigrations, rollbackMigration, checkMigrationStatus };