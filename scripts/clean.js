#!/usr/bin/env node

/**
 * Clean build artifacts and caches
 * Helps reduce project size and resolve build issues
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning project...\n');

const dirsToClean = [
  '.next',
  'node_modules/.cache',
  '.turbo',
  '.eslintcache',
  'tsconfig.tsbuildinfo',
];

const filesToRemove = [
  'tsconfig.tsbuildinfo',
];

// Function to remove directory recursively
function removeDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    const sizeBefore = getDirSize(dirPath);
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`✅ Removed ${dirPath} (freed ${formatBytes(sizeBefore)})`);
  } else {
    console.log(`⏭️  ${dirPath} not found, skipping...`);
  }
}

// Function to remove file
function removeFile(filePath) {
  if (fs.existsSync(filePath)) {
    const sizeBefore = fs.statSync(filePath).size;
    fs.rmSync(filePath, { force: true });
    console.log(`✅ Removed ${filePath} (freed ${formatBytes(sizeBefore)})`);
  } else {
    console.log(`⏭️  ${filePath} not found, skipping...`);
  }
}

// Function to get directory size
function getDirSize(dirPath) {
  let size = 0;
  
  try {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        size += getDirSize(filePath);
      } else {
        size += stats.size;
      }
    }
  } catch (err) {
    console.error(`Error calculating size for ${dirPath}:`, err.message);
  }
  
  return size;
}

// Function to format bytes to human readable
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Clean directories
console.log('Cleaning directories...');
dirsToClean.forEach(dir => removeDir(dir));

// Clean files
console.log('\nCleaning files...');
filesToRemove.forEach(file => removeFile(file));

console.log('\n✨ Cleaning complete!');
console.log('\n📝 Next steps:');
console.log('1. Run "npm install" to reinstall dependencies');
console.log('2. Run "npm run build" to rebuild the project');
console.log('3. The .next folder will be recreated automatically');
console.log('\n💡 Tip: Add "npm run clean" to package.json scripts for easy access');