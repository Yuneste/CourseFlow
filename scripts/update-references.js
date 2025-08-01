#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

async function updateReferences() {
  console.log('🔍 Updating file references throughout the codebase...\n');

  // Define reference updates
  const referenceUpdates = [
    // ESLint config references
    { 
      pattern: /\.eslintrc\.json/g, 
      replacement: './config/eslint.config.json',
      fileTypes: ['.json', '.js', '.ts', '.md']
    },
    // Vitest config references
    { 
      pattern: /vitest\.config\.ts/g, 
      replacement: './config/vitest.config.ts',
      fileTypes: ['.json', '.js', '.ts', '.md']
    },
    // Components.json references
    { 
      pattern: /components\.json/g, 
      replacement: './config/components.json',
      fileTypes: ['.js', '.ts', '.tsx']
    },
    // Docker references
    { 
      pattern: /Dockerfile(?!\.)/g, 
      replacement: './docker/Dockerfile',
      fileTypes: ['.yml', '.yaml', '.md', '.json']
    },
    { 
      pattern: /docker-compose\.yml/g, 
      replacement: './docker/docker-compose.yml',
      fileTypes: ['.md', '.json', '.sh']
    },
    // CLAUDE.md references
    { 
      pattern: /CLAUDE\.md/g, 
      replacement: './docs/CLAUDE.md',
      fileTypes: ['.md', '.ts', '.tsx', '.js']
    }
  ];

  // Directories to search (excluding node_modules and .git)
  const searchDirs = [
    'app',
    'components', 
    'lib',
    'hooks',
    'scripts',
    'docs',
    '.github',
    '__tests__'
  ];

  const rootFiles = [
    'README.md',
    'package.json',
    '.dockerignore',
    'vercel.json'
  ];

  async function updateFile(filePath, updates) {
    try {
      let content = await fs.readFile(filePath, 'utf8');
      let updated = false;

      for (const { pattern, replacement, fileTypes } of updates) {
        const ext = path.extname(filePath);
        if (fileTypes.includes(ext)) {
          const newContent = content.replace(pattern, replacement);
          if (newContent !== content) {
            content = newContent;
            updated = true;
          }
        }
      }

      if (updated) {
        await fs.writeFile(filePath, content);
        console.log(`✅ Updated references in: ${filePath}`);
      }
    } catch (error) {
      console.error(`❌ Error updating ${filePath}: ${error.message}`);
    }
  }

  async function walkDir(dir) {
    try {
      const files = await fs.readdir(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          await walkDir(filePath);
        } else if (stat.isFile()) {
          await updateFile(filePath, referenceUpdates);
        }
      }
    } catch (error) {
      console.error(`❌ Error walking directory ${dir}: ${error.message}`);
    }
  }

  // Update root files
  console.log('📝 Updating root files...');
  for (const file of rootFiles) {
    await updateFile(path.join(process.cwd(), file), referenceUpdates);
  }

  // Update files in directories
  console.log('\n📁 Updating files in directories...');
  for (const dir of searchDirs) {
    const dirPath = path.join(process.cwd(), dir);
    try {
      await fs.access(dirPath);
      await walkDir(dirPath);
    } catch (error) {
      // Directory doesn't exist
    }
  }

  // Special case: Update CLAUDE.md references that might be importing it
  console.log('\n🔧 Updating CLAUDE.md imports...');
  try {
    // Update any BMad configs that might reference CLAUDE.md
    const bmadConfigPath = path.join(process.cwd(), '.bmad-core/core-config.yaml');
    let bmadConfig = await fs.readFile(bmadConfigPath, 'utf8');
    bmadConfig = bmadConfig.replace(/CLAUDE\.md/g, 'docs/CLAUDE.md');
    await fs.writeFile(bmadConfigPath, bmadConfig);
    console.log('✅ Updated BMad core config');
  } catch (error) {
    // BMad config doesn't exist or couldn't be updated
  }

  console.log('\n✨ Reference updates complete!');
}

// Run the reference updates
updateReferences().catch(console.error);