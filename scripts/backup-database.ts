#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { env } from '../lib/env';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { format } from 'date-fns';
import * as Sentry from '@sentry/node';

const execAsync = promisify(exec);

// Initialize Sentry for error tracking
Sentry.init({
  dsn: env.SENTRY_DSN,
  environment: env.NODE_ENV,
});

interface BackupOptions {
  includeFiles?: boolean;
  retention?: number; // days
  compress?: boolean;
}

class DatabaseBackup {
  private supabase;
  private s3Client?: S3Client;
  private backupDir = path.join(process.cwd(), 'backups');

  constructor() {
    this.supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!);
    
    // Initialize S3 if configured
    if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) {
      this.s3Client = new S3Client({
        region: env.AWS_REGION || 'eu-west-1',
        credentials: {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        },
      });
    }
  }

  async run(options: BackupOptions = {}) {
    const {
      includeFiles = true,
      retention = 30,
      compress = true,
    } = options;

    const timestamp = format(new Date(), 'yyyy-MM-dd-HHmmss');
    const backupName = `courseflow-backup-${timestamp}`;

    try {
      console.log(`Starting backup: ${backupName}`);
      
      // Create backup directory
      await fs.mkdir(this.backupDir, { recursive: true });

      // 1. Export database schema and data
      const dbBackupPath = await this.backupDatabase(backupName);

      // 2. Export files metadata
      const filesMetadataPath = await this.backupFilesMetadata(backupName);

      // 3. Create backup manifest
      const manifest = {
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version,
        environment: env.NODE_ENV,
        includes: {
          database: true,
          filesMetadata: true,
          fileStorage: includeFiles,
        },
      };

      const manifestPath = path.join(this.backupDir, `${backupName}-manifest.json`);
      await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

      // 4. Compress if requested
      let finalBackupPath = '';
      if (compress) {
        finalBackupPath = await this.compressBackup(backupName, [
          dbBackupPath,
          filesMetadataPath,
          manifestPath,
        ]);
      }

      // 5. Upload to S3 if configured
      if (this.s3Client) {
        await this.uploadToS3(finalBackupPath || dbBackupPath, backupName);
      }

      // 6. Clean up old backups
      await this.cleanupOldBackups(retention);

      console.log(`Backup completed successfully: ${backupName}`);
      
      // Report success metrics
      await this.reportMetrics({
        success: true,
        backupName,
        size: await this.getFileSize(finalBackupPath || dbBackupPath),
      });

    } catch (error) {
      console.error('Backup failed:', error);
      Sentry.captureException(error);
      
      // Report failure metrics
      await this.reportMetrics({
        success: false,
        backupName,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      throw error;
    }
  }

  private async backupDatabase(backupName: string): Promise<string> {
    console.log('Backing up database...');
    
    // Export all tables
    const tables = [
      'profiles',
      'courses',
      'files',
      'course_folders',
      'subscriptions',
      'usage_tracking',
      'ai_summaries',
      'chat_messages',
      'study_groups',
      'shared_resources',
    ];

    const dbBackup: Record<string, any[]> = {};

    for (const table of tables) {
      console.log(`Exporting table: ${table}`);
      
      let allData: any[] = [];
      let lastId = '';
      const pageSize = 1000;

      // Paginate through all records
      while (true) {
        const query = this.supabase
          .from(table)
          .select('*')
          .order('id')
          .limit(pageSize);

        if (lastId) {
          query.gt('id', lastId);
        }

        const { data, error } = await query;

        if (error) {
          console.error(`Error exporting ${table}:`, error);
          throw error;
        }

        if (!data || data.length === 0) break;

        allData = allData.concat(data);
        lastId = data[data.length - 1].id;
      }

      dbBackup[table] = allData;
      console.log(`Exported ${allData.length} records from ${table}`);
    }

    const backupPath = path.join(this.backupDir, `${backupName}-database.json`);
    await fs.writeFile(backupPath, JSON.stringify(dbBackup, null, 2));

    return backupPath;
  }

  private async backupFilesMetadata(backupName: string): Promise<string> {
    console.log('Backing up files metadata...');
    
    // Get all files with their storage paths
    const { data: files, error } = await this.supabase
      .from('files')
      .select('*')
      .order('created_at');

    if (error) throw error;

    const metadata = {
      count: files?.length || 0,
      totalSize: files?.reduce((sum, file) => sum + (file.file_size || 0), 0) || 0,
      files: files || [],
    };

    const metadataPath = path.join(this.backupDir, `${backupName}-files-metadata.json`);
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    return metadataPath;
  }

  private async compressBackup(backupName: string, files: string[]): Promise<string> {
    console.log('Compressing backup...');
    
    const tarPath = path.join(this.backupDir, `${backupName}.tar.gz`);
    const filesList = files.map(f => path.basename(f)).join(' ');
    
    await execAsync(
      `tar -czf ${tarPath} -C ${this.backupDir} ${filesList}`,
      { cwd: process.cwd() }
    );

    // Remove uncompressed files
    for (const file of files) {
      await fs.unlink(file);
    }

    return tarPath;
  }

  private async uploadToS3(filePath: string, backupName: string) {
    if (!this.s3Client) return;
    
    console.log('Uploading to S3...');
    
    const fileContent = await fs.readFile(filePath);
    const key = `backups/${env.NODE_ENV}/${backupName}.tar.gz`;

    const command = new PutObjectCommand({
      Bucket: env.BACKUP_S3_BUCKET || 'courseflow-backups',
      Key: key,
      Body: fileContent,
      ContentType: 'application/gzip',
      Metadata: {
        environment: env.NODE_ENV || 'production',
        timestamp: new Date().toISOString(),
      },
    });

    await this.s3Client.send(command);
    console.log(`Uploaded to S3: ${key}`);
  }

  private async cleanupOldBackups(retentionDays: number) {
    console.log(`Cleaning up backups older than ${retentionDays} days...`);
    
    const files = await fs.readdir(this.backupDir);
    const now = Date.now();
    const maxAge = retentionDays * 24 * 60 * 60 * 1000;

    for (const file of files) {
      if (!file.startsWith('courseflow-backup-')) continue;
      
      const filePath = path.join(this.backupDir, file);
      const stats = await fs.stat(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        await fs.unlink(filePath);
        console.log(`Deleted old backup: ${file}`);
      }
    }
  }

  private async getFileSize(filePath: string): Promise<number> {
    const stats = await fs.stat(filePath);
    return stats.size;
  }

  private async reportMetrics(metrics: any) {
    // Report to monitoring service
    try {
      await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'custom',
          name: 'database_backup',
          value: metrics.success ? 1 : 0,
          metadata: metrics,
        }),
      });
    } catch (error) {
      console.error('Failed to report metrics:', error);
    }
  }
}

// CLI interface
if (require.main === module) {
  const backup = new DatabaseBackup();
  
  const args = process.argv.slice(2);
  const options: BackupOptions = {
    includeFiles: !args.includes('--no-files'),
    retention: parseInt(args.find(a => a.startsWith('--retention='))?.split('=')[1] || '30'),
    compress: !args.includes('--no-compress'),
  };

  backup.run(options)
    .then(() => {
      console.log('Backup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Backup failed:', error);
      process.exit(1);
    });
}

export { DatabaseBackup };