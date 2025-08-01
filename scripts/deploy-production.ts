#!/usr/bin/env node
import { exec } from 'child_process';
import { promisify } from 'util';
import { env } from '../lib/env';
import * as Sentry from '@sentry/node';
import chalk from 'chalk';
import ora from 'ora';

const execAsync = promisify(exec);

// Initialize Sentry
Sentry.init({
  dsn: env.SENTRY_DSN,
  environment: 'deployment',
});

interface DeploymentOptions {
  skipTests?: boolean;
  skipBackup?: boolean;
  skipHealthCheck?: boolean;
  environment?: 'production' | 'staging';
}

class ProductionDeployment {
  private startTime = Date.now();
  private steps: Array<{ name: string; status: 'pending' | 'running' | 'completed' | 'failed' }> = [];

  constructor(private options: DeploymentOptions = {}) {
    this.steps = [
      { name: 'Pre-deployment checks', status: 'pending' },
      { name: 'Run tests', status: 'pending' },
      { name: 'Database backup', status: 'pending' },
      { name: 'Build application', status: 'pending' },
      { name: 'Deploy to Vercel', status: 'pending' },
      { name: 'Run database migrations', status: 'pending' },
      { name: 'Health check', status: 'pending' },
      { name: 'Clear caches', status: 'pending' },
      { name: 'Notify monitoring', status: 'pending' },
    ];
  }

  async deploy() {
    console.log(chalk.bold.blue('🚀 Starting production deployment'));
    console.log(chalk.gray(`Environment: ${this.options.environment || 'production'}`));
    console.log(chalk.gray(`Time: ${new Date().toISOString()}\n`));

    try {
      await this.runStep('Pre-deployment checks', this.preDeploymentChecks.bind(this));
      
      if (!this.options.skipTests) {
        await this.runStep('Run tests', this.runTests.bind(this));
      }
      
      if (!this.options.skipBackup) {
        await this.runStep('Database backup', this.backupDatabase.bind(this));
      }
      
      await this.runStep('Build application', this.buildApplication.bind(this));
      await this.runStep('Deploy to Vercel', this.deployToVercel.bind(this));
      await this.runStep('Run database migrations', this.runMigrations.bind(this));
      
      if (!this.options.skipHealthCheck) {
        await this.runStep('Health check', this.healthCheck.bind(this));
      }
      
      await this.runStep('Clear caches', this.clearCaches.bind(this));
      await this.runStep('Notify monitoring', this.notifyMonitoring.bind(this));

      const duration = Math.round((Date.now() - this.startTime) / 1000);
      console.log(chalk.bold.green(`\n✅ Deployment completed successfully in ${duration}s`));
      
      this.printSummary();
      
    } catch (error) {
      console.error(chalk.bold.red('\n❌ Deployment failed'));
      console.error(error);
      
      Sentry.captureException(error);
      
      this.printSummary();
      
      // Attempt rollback
      await this.rollback();
      
      process.exit(1);
    }
  }

  private async runStep(name: string, fn: () => Promise<void>) {
    const step = this.steps.find(s => s.name === name);
    if (!step) return;

    const spinner = ora(name).start();
    step.status = 'running';

    try {
      await fn();
      step.status = 'completed';
      spinner.succeed(chalk.green(name));
    } catch (error) {
      step.status = 'failed';
      spinner.fail(chalk.red(name));
      throw error;
    }
  }

  private async preDeploymentChecks() {
    // Check Git status
    const { stdout: gitStatus } = await execAsync('git status --porcelain');
    if (gitStatus.trim()) {
      throw new Error('Working directory is not clean. Commit or stash changes before deploying.');
    }

    // Check current branch
    const { stdout: branch } = await execAsync('git rev-parse --abbrev-ref HEAD');
    if (branch.trim() !== 'main' && !this.options.environment) {
      throw new Error('Deployments to production must be from main branch');
    }

    // Verify environment variables
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'VERCEL_TOKEN',
    ];

    const missingVars = requiredVars.filter(v => !process.env[v]);
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
  }

  private async runTests() {
    await execAsync('npm run test');
    await execAsync('npm run lint');
  }

  private async backupDatabase() {
    await execAsync('npm run db:backup:prod');
  }

  private async buildApplication() {
    // Clean build directory
    await execAsync('rm -rf .next');
    
    // Build with production optimizations
    await execAsync('NODE_ENV=production npm run build');
    
    // Analyze bundle size
    const { stdout } = await execAsync('ls -la .next');
    console.log(chalk.gray('Build output:'));
    console.log(chalk.gray(stdout));
  }

  private async deployToVercel() {
    const env = this.options.environment || 'production';
    const deployCommand = env === 'production' 
      ? 'vercel --prod --token=$VERCEL_TOKEN'
      : 'vercel --token=$VERCEL_TOKEN';
    
    const { stdout } = await execAsync(deployCommand);
    console.log(chalk.gray(`Deployment URL: ${stdout.trim()}`));
  }

  private async runMigrations() {
    await execAsync('npm run db:migrate');
  }

  private async healthCheck() {
    // Wait for deployment to propagate
    await new Promise(resolve => setTimeout(resolve, 30000)); // 30 seconds
    
    const appUrl = this.options.environment === 'staging' 
      ? process.env.STAGING_URL 
      : env.NEXT_PUBLIC_APP_URL;
    
    const response = await fetch(`${appUrl}/api/health`);
    const health = await response.json();
    
    if (health.status !== 'healthy') {
      throw new Error(`Health check failed: ${JSON.stringify(health)}`);
    }
  }

  private async clearCaches() {
    // Clear Redis caches if configured
    if (env.REDIS_URL) {
      const { Cache } = await import('../lib/cache/redis');
      const cache = new Cache();
      await cache.flush();
    }
    
    // Clear Vercel cache
    await execAsync('vercel cache clear --token=$VERCEL_TOKEN');
  }

  private async notifyMonitoring() {
    // Send deployment event to Sentry
    Sentry.captureMessage('Production deployment completed', {
      level: 'info',
      tags: {
        environment: this.options.environment || 'production',
        version: process.env.npm_package_version,
      },
    });
    
    // Report to metrics endpoint
    await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/metrics`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.METRICS_SECRET}`,
      },
      body: JSON.stringify({
        type: 'custom',
        name: 'deployment_success',
        value: 1,
        metadata: {
          environment: this.options.environment || 'production',
          duration: Date.now() - this.startTime,
        },
      }),
    });
  }

  private async rollback() {
    console.log(chalk.yellow('\n🔄 Attempting rollback...'));
    
    try {
      // Rollback Vercel deployment
      await execAsync('vercel rollback --token=$VERCEL_TOKEN');
      
      // Rollback database if needed
      await execAsync('npm run db:rollback');
      
      console.log(chalk.green('✅ Rollback completed'));
    } catch (error) {
      console.error(chalk.red('❌ Rollback failed'));
      console.error(error);
      Sentry.captureException(error);
    }
  }

  private printSummary() {
    console.log('\n' + chalk.bold('Deployment Summary:'));
    console.log(chalk.gray('─'.repeat(40)));
    
    for (const step of this.steps) {
      const icon = step.status === 'completed' ? '✅' :
                   step.status === 'failed' ? '❌' :
                   step.status === 'running' ? '⏳' : '⏸️';
      
      const color = step.status === 'completed' ? chalk.green :
                    step.status === 'failed' ? chalk.red :
                    step.status === 'running' ? chalk.yellow : chalk.gray;
      
      console.log(`${icon} ${color(step.name)}`);
    }
    
    console.log(chalk.gray('─'.repeat(40)));
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  const options: DeploymentOptions = {
    skipTests: args.includes('--skip-tests'),
    skipBackup: args.includes('--skip-backup'),
    skipHealthCheck: args.includes('--skip-health-check'),
    environment: args.includes('--staging') ? 'staging' : 'production',
  };
  
  const deployment = new ProductionDeployment(options);
  
  deployment.deploy()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { ProductionDeployment };