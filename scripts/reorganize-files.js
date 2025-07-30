#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

async function reorganizeFiles() {
  console.log('🔧 Starting file reorganization...\n');

  // Create new directories
  const directories = ['config', 'docker', 'docs/examples'];
  
  for (const dir of directories) {
    try {
      await fs.mkdir(path.join(process.cwd(), dir), { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    } catch (error) {
      console.log(`📁 Directory already exists: ${dir}`);
    }
  }

  // Define file moves
  const fileMoves = [
    // Config files
    { from: '.eslintrc.json', to: 'config/eslint.config.json' },
    { from: 'vitest.config.ts', to: 'config/vitest.config.ts' },
    { from: 'components.json', to: 'config/components.json' },
    
    // Docker files
    { from: 'Dockerfile', to: 'docker/Dockerfile' },
    { from: 'docker-compose.yml', to: 'docker/docker-compose.yml' },
    
    // Documentation
    { from: 'CLAUDE.md', to: 'docs/CLAUDE.md' },
    { from: 'next.config.js.codeSplitting', to: 'docs/examples/next.config.js.codeSplitting' }
  ];

  // Move files
  console.log('\n📦 Moving files...');
  for (const { from, to } of fileMoves) {
    try {
      const fromPath = path.join(process.cwd(), from);
      const toPath = path.join(process.cwd(), to);
      
      // Check if source file exists
      await fs.access(fromPath);
      
      // Move the file
      await fs.rename(fromPath, toPath);
      console.log(`✅ Moved: ${from} → ${to}`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(`⚠️  File not found: ${from}`);
      } else {
        console.error(`❌ Error moving ${from}: ${error.message}`);
      }
    }
  }

  // Update references
  console.log('\n🔄 Updating references...');
  
  // Update package.json scripts
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  try {
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
    
    // Update ESLint config reference
    if (packageJson.scripts) {
      Object.keys(packageJson.scripts).forEach(key => {
        if (packageJson.scripts[key].includes('eslint')) {
          packageJson.scripts[key] = packageJson.scripts[key].replace(
            'eslint',
            'eslint --config ./config/eslint.config.json'
          );
        }
      });
    }
    
    // Update eslintConfig if it exists
    if (packageJson.eslintConfig) {
      delete packageJson.eslintConfig;
      console.log('✅ Removed inline eslintConfig from package.json');
    }
    
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log('✅ Updated package.json');
  } catch (error) {
    console.error('❌ Error updating package.json:', error.message);
  }

  // Update .dockerignore
  const dockerignorePath = path.join(process.cwd(), '.dockerignore');
  try {
    let dockerignore = await fs.readFile(dockerignorePath, 'utf8');
    dockerignore = dockerignore.replace('Dockerfile', 'docker/Dockerfile');
    dockerignore = dockerignore.replace('docker-compose.yml', 'docker/docker-compose.yml');
    await fs.writeFile(dockerignorePath, dockerignore);
    console.log('✅ Updated .dockerignore');
  } catch (error) {
    console.error('❌ Error updating .dockerignore:', error.message);
  }

  // Create a new vitest config that imports from the new location
  const vitestConfigContent = `import { defineConfig } from 'vitest/config';
import vitestConfig from './config/vitest.config';

export default vitestConfig;
`;
  
  try {
    await fs.writeFile(path.join(process.cwd(), 'vitest.config.ts'), vitestConfigContent);
    console.log('✅ Created vitest.config.ts proxy file');
  } catch (error) {
    console.error('❌ Error creating vitest proxy:', error.message);
  }

  // Update next.config.js to reference components.json in new location
  // This is handled automatically by shadcn/ui, so no changes needed

  // Update any GitHub workflows or CI/CD configs
  const workflowsDir = path.join(process.cwd(), '.github/workflows');
  try {
    const workflows = await fs.readdir(workflowsDir);
    for (const workflow of workflows) {
      const workflowPath = path.join(workflowsDir, workflow);
      let content = await fs.readFile(workflowPath, 'utf8');
      
      // Update Docker references
      content = content.replace(/Dockerfile/g, 'docker/Dockerfile');
      content = content.replace(/docker-compose\.yml/g, 'docker/docker-compose.yml');
      
      await fs.writeFile(workflowPath, content);
    }
    console.log('✅ Updated GitHub workflows');
  } catch (error) {
    // No workflows directory
  }

  // Check for .env.production
  try {
    await fs.access(path.join(process.cwd(), '.env.production'));
    console.log('\n⚠️  Warning: .env.production found in repository. This file should typically not be committed as it may contain secrets.');
    console.log('   Consider using .env.production.example instead or ensure no sensitive data is included.');
  } catch (error) {
    // File doesn't exist, which is good
  }

  console.log('\n✨ File reorganization complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Review the changes');
  console.log('2. Test that everything still works (npm run dev, npm test, etc.)');
  console.log('3. Commit the changes');
  console.log('4. Update any deployment scripts or CI/CD pipelines if needed');
}

// Run the reorganization
reorganizeFiles().catch(console.error);