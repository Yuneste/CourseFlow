#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

async function previewReorganization() {
  console.log('📋 File Reorganization Preview\n');
  console.log('This script will show you what changes will be made without actually moving files.\n');

  // Files that will be moved
  const fileMoves = [
    { from: '.eslintrc.json', to: 'config/eslint.config.json' },
    { from: 'vitest.config.ts', to: 'config/vitest.config.ts' },
    { from: 'components.json', to: 'config/components.json' },
    { from: 'Dockerfile', to: 'docker/Dockerfile' },
    { from: 'docker-compose.yml', to: 'docker/docker-compose.yml' },
    { from: 'CLAUDE.md', to: 'docs/CLAUDE.md' },
    { from: 'next.config.js.codeSplitting', to: 'docs/examples/next.config.js.codeSplitting' }
  ];

  // Check current state
  console.log('🔍 Current root directory files:\n');
  const rootFiles = await fs.readdir(process.cwd());
  const configFiles = rootFiles.filter(f => 
    f.endsWith('.json') || 
    f.endsWith('.config.js') || 
    f.endsWith('.config.ts') ||
    f.startsWith('.') ||
    f === 'Dockerfile' ||
    f === 'docker-compose.yml' ||
    f === 'CLAUDE.md'
  ).sort();
  
  console.log('Configuration/Tool files in root:');
  configFiles.forEach(f => console.log(`  - ${f}`));

  console.log('\n📦 Files that will be moved:\n');
  for (const { from, to } of fileMoves) {
    try {
      await fs.access(path.join(process.cwd(), from));
      console.log(`  ✓ ${from} → ${to}`);
    } catch {
      console.log(`  ✗ ${from} (not found)`);
    }
  }

  console.log('\n📁 New directory structure:\n');
  console.log(`CourseFlow/
├── config/                    # Configuration files
│   ├── eslint.config.json    # ESLint configuration
│   ├── vitest.config.ts      # Vitest test configuration
│   └── components.json       # shadcn/ui components config
├── docker/                    # Docker-related files
│   ├── Dockerfile            # Docker image definition
│   └── docker-compose.yml    # Docker compose configuration
├── docs/                      # Documentation
│   ├── CLAUDE.md             # AI assistance guidelines
│   └── examples/             # Example configurations
│       └── next.config.js.codeSplitting
├── [Root files that will remain]
├── .env.example
├── .gitignore
├── .dockerignore
├── .vercelignore
├── LICENSE
├── README.md
├── middleware.ts
├── next.config.js
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
└── vercel.json`);

  console.log('\n🔧 Configuration updates that will be made:\n');
  console.log('1. package.json - Update ESLint script to use new config location');
  console.log('2. Create vitest.config.ts proxy file in root (required by Vitest)');
  console.log('3. Update .dockerignore to reference new Docker file locations');
  console.log('4. Update any GitHub workflows that reference Docker files');
  console.log('5. Update file references throughout the codebase');

  // Check for potential issues
  console.log('\n⚠️  Potential issues to review:\n');
  
  try {
    await fs.access(path.join(process.cwd(), '.env.production'));
    console.log('❗ .env.production is committed - should this contain secrets?');
  } catch {
    // Good, file doesn't exist
  }

  try {
    await fs.access(path.join(process.cwd(), 'next.config.js.codeSplitting'));
    console.log('❗ next.config.js.codeSplitting appears to be a backup file');
  } catch {
    // File doesn't exist
  }

  console.log('\n✅ Benefits of this reorganization:\n');
  console.log('• Cleaner root directory - easier to navigate');
  console.log('• Logical grouping of related files');
  console.log('• Follows common project organization patterns');
  console.log('• Easier to find configuration files');
  console.log('• Better separation of concerns');

  console.log('\n🚀 To proceed with the reorganization, run:');
  console.log('   node scripts/reorganize-files.js');
  console.log('   node scripts/update-references.js');
}

// Run the preview
previewReorganization().catch(console.error);