#!/usr/bin/env node
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import chalk from 'chalk';
import { env } from '../lib/env';

const execAsync = promisify(exec);

interface CheckResult {
  name: string;
  passed: boolean;
  message?: string;
  warning?: boolean;
}

class PreDeploymentChecklist {
  private checks: CheckResult[] = [];

  async run() {
    console.log(chalk.bold.blue('🔍 Running pre-deployment checklist\n'));

    await this.checkGitStatus();
    await this.checkBranch();
    await this.checkEnvironmentVariables();
    await this.checkDependencies();
    await this.checkBuildSize();
    await this.checkTests();
    await this.checkLinting();
    await this.checkTypeScript();
    await this.checkDatabaseMigrations();
    await this.checkSecurityHeaders();
    await this.checkAPIEndpoints();
    await this.checkPerformance();

    this.printResults();
  }

  private async checkGitStatus() {
    try {
      const { stdout } = await execAsync('git status --porcelain');
      const isDirty = stdout.trim().length > 0;
      
      this.checks.push({
        name: 'Git Working Directory',
        passed: !isDirty,
        message: isDirty ? 'Working directory has uncommitted changes' : 'Clean',
      });
    } catch (error) {
      this.checks.push({
        name: 'Git Working Directory',
        passed: false,
        message: 'Failed to check git status',
      });
    }
  }

  private async checkBranch() {
    try {
      const { stdout } = await execAsync('git rev-parse --abbrev-ref HEAD');
      const branch = stdout.trim();
      const isMain = branch === 'main';
      
      this.checks.push({
        name: 'Git Branch',
        passed: isMain,
        message: `Current branch: ${branch}`,
        warning: !isMain,
      });
    } catch (error) {
      this.checks.push({
        name: 'Git Branch',
        passed: false,
        message: 'Failed to check current branch',
      });
    }
  }

  private async checkEnvironmentVariables() {
    const required = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'NEXT_PUBLIC_APP_URL',
    ];

    const optional = [
      'STRIPE_SECRET_KEY',
      'OPENAI_API_KEY',
      'REDIS_URL',
      'SENTRY_DSN',
    ];

    const missingRequired = required.filter(v => !process.env[v]);
    const missingOptional = optional.filter(v => !process.env[v]);

    this.checks.push({
      name: 'Required Environment Variables',
      passed: missingRequired.length === 0,
      message: missingRequired.length > 0 
        ? `Missing: ${missingRequired.join(', ')}`
        : 'All present',
    });

    if (missingOptional.length > 0) {
      this.checks.push({
        name: 'Optional Environment Variables',
        passed: true,
        warning: true,
        message: `Not configured: ${missingOptional.join(', ')}`,
      });
    }
  }

  private async checkDependencies() {
    try {
      await execAsync('npm audit --audit-level=high');
      this.checks.push({
        name: 'Security Vulnerabilities',
        passed: true,
        message: 'No high or critical vulnerabilities',
      });
    } catch (error) {
      this.checks.push({
        name: 'Security Vulnerabilities',
        passed: false,
        message: 'Found high or critical vulnerabilities',
      });
    }
  }

  private async checkBuildSize() {
    try {
      await execAsync('npm run build');
      const { stdout } = await execAsync('du -sh .next');
      const size = stdout.split('\t')[0];
      
      this.checks.push({
        name: 'Build Size',
        passed: true,
        message: `Build size: ${size}`,
      });
    } catch (error) {
      this.checks.push({
        name: 'Build Size',
        passed: false,
        message: 'Failed to build application',
      });
    }
  }

  private async checkTests() {
    try {
      await execAsync('npm test -- --run');
      this.checks.push({
        name: 'Unit Tests',
        passed: true,
        message: 'All tests passing',
      });
    } catch (error) {
      this.checks.push({
        name: 'Unit Tests',
        passed: false,
        message: 'Some tests are failing',
      });
    }
  }

  private async checkLinting() {
    try {
      await execAsync('npm run lint');
      this.checks.push({
        name: 'ESLint',
        passed: true,
        message: 'No linting errors',
      });
    } catch (error) {
      this.checks.push({
        name: 'ESLint',
        passed: false,
        message: 'Linting errors found',
      });
    }
  }

  private async checkTypeScript() {
    try {
      await execAsync('npx tsc --noEmit');
      this.checks.push({
        name: 'TypeScript',
        passed: true,
        message: 'No type errors',
      });
    } catch (error) {
      this.checks.push({
        name: 'TypeScript',
        passed: false,
        message: 'Type errors found',
      });
    }
  }

  private async checkDatabaseMigrations() {
    try {
      const { stdout } = await execAsync('npm run db:status');
      const pending = stdout.includes('pending');
      
      this.checks.push({
        name: 'Database Migrations',
        passed: !pending,
        message: pending ? 'Pending migrations found' : 'All migrations applied',
        warning: pending,
      });
    } catch (error) {
      this.checks.push({
        name: 'Database Migrations',
        passed: false,
        message: 'Failed to check migration status',
      });
    }
  }

  private async checkSecurityHeaders() {
    const middlewarePath = './middleware.ts';
    try {
      const content = await fs.readFile(middlewarePath, 'utf-8');
      const hasCSP = content.includes('Content-Security-Policy');
      const hasXFrame = content.includes('X-Frame-Options');
      
      this.checks.push({
        name: 'Security Headers',
        passed: hasCSP && hasXFrame,
        message: hasCSP && hasXFrame ? 'Security headers configured' : 'Missing security headers',
      });
    } catch (error) {
      this.checks.push({
        name: 'Security Headers',
        passed: false,
        message: 'Could not verify security headers',
      });
    }
  }

  private async checkAPIEndpoints() {
    const criticalEndpoints = [
      '/api/health',
      '/api/ready',
      '/api/metrics',
    ];

    const allExist = await Promise.all(
      criticalEndpoints.map(async (endpoint) => {
        try {
          await fs.access(`./app${endpoint}/route.ts`);
          return true;
        } catch {
          return false;
        }
      })
    );

    this.checks.push({
      name: 'Critical API Endpoints',
      passed: allExist.every(exists => exists),
      message: allExist.every(exists => exists) 
        ? 'All critical endpoints present'
        : 'Missing critical endpoints',
    });
  }

  private async checkPerformance() {
    try {
      // Check for common performance issues
      const checks = [
        { file: 'next.config.js', pattern: 'swcMinify: true', name: 'SWC Minification' },
        { file: 'next.config.js', pattern: 'compress: true', name: 'Compression' },
      ];

      const performanceChecks = await Promise.all(
        checks.map(async ({ file, pattern }) => {
          try {
            const content = await fs.readFile(file, 'utf-8');
            return content.includes(pattern);
          } catch {
            return false;
          }
        })
      );

      this.checks.push({
        name: 'Performance Optimizations',
        passed: performanceChecks.every(check => check),
        message: performanceChecks.every(check => check)
          ? 'Performance optimizations enabled'
          : 'Some performance optimizations missing',
        warning: !performanceChecks.every(check => check),
      });
    } catch (error) {
      this.checks.push({
        name: 'Performance Optimizations',
        passed: false,
        message: 'Could not verify performance settings',
      });
    }
  }

  private printResults() {
    console.log('\n' + chalk.bold('Checklist Results:'));
    console.log(chalk.gray('─'.repeat(60)));

    let passedCount = 0;
    let failedCount = 0;
    let warningCount = 0;

    for (const check of this.checks) {
      const icon = check.passed ? (check.warning ? '⚠️ ' : '✅') : '❌';
      const color = check.passed ? (check.warning ? chalk.yellow : chalk.green) : chalk.red;
      
      console.log(`${icon} ${color(check.name.padEnd(35))} ${chalk.gray(check.message || '')}`);
      
      if (check.passed && !check.warning) passedCount++;
      else if (check.warning) warningCount++;
      else failedCount++;
    }

    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.green(`✅ Passed: ${passedCount}`));
    console.log(chalk.yellow(`⚠️  Warnings: ${warningCount}`));
    console.log(chalk.red(`❌ Failed: ${failedCount}`));

    if (failedCount > 0) {
      console.log(chalk.bold.red('\n⚠️  Deployment not recommended - fix failures first'));
      process.exit(1);
    } else if (warningCount > 0) {
      console.log(chalk.bold.yellow('\n⚠️  Deployment possible but review warnings'));
    } else {
      console.log(chalk.bold.green('\n✅ Ready for deployment!'));
    }
  }
}

// Run if called directly
if (require.main === module) {
  const checklist = new PreDeploymentChecklist();
  checklist.run().catch(console.error);
}

export { PreDeploymentChecklist };