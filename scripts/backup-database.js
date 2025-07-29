#!/usr/bin/env node

/**
 * Database Backup Script
 * Creates a backup of the Supabase database
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

async function backupDatabase() {
  try {
    console.log('🔄 Starting database backup...');
    
    const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.sql`);
    
    // For Supabase, you would typically use their CLI or API
    // This is a template for the backup command
    const backupCommand = `supabase db dump --file="${backupFile}"`;
    
    exec(backupCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Backup failed:', error);
        process.exit(1);
      }
      
      if (stderr) {
        console.warn('⚠️ Backup warnings:', stderr);
      }
      
      console.log('✅ Database backup completed successfully');
      console.log(`📁 Backup saved to: ${backupFile}`);
      
      // Clean up old backups (keep last 7 days)
      cleanupOldBackups();
    });
    
  } catch (error) {
    console.error('❌ Backup process failed:', error);
    process.exit(1);
  }
}

function cleanupOldBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR);
    const backupFiles = files.filter(file => file.startsWith('backup-') && file.endsWith('.sql'));
    
    // Sort by creation time (newest first)
    const sortedFiles = backupFiles
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        time: fs.statSync(path.join(BACKUP_DIR, file)).mtime
      }))
      .sort((a, b) => b.time - a.time);
    
    // Keep only the last 7 backups
    const filesToDelete = sortedFiles.slice(7);
    
    filesToDelete.forEach(file => {
      fs.unlinkSync(file.path);
      console.log(`🗑️ Removed old backup: ${file.name}`);
    });
    
    console.log(`📊 Backup cleanup completed. Kept ${Math.min(sortedFiles.length, 7)} backups.`);
    
  } catch (error) {
    console.warn('⚠️ Failed to cleanup old backups:', error.message);
  }
}

// Run backup if called directly
if (require.main === module) {
  backupDatabase();
}

module.exports = { backupDatabase };