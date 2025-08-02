const { execSync } = require('child_process');

console.log('Updating deprecated packages...\n');

// Update ESLint to v9
console.log('1. Updating ESLint to latest version...');
try {
  execSync('npm install --save-dev eslint@latest eslint-config-next@latest', { stdio: 'inherit' });
  console.log('✅ ESLint updated successfully\n');
} catch (error) {
  console.error('❌ Failed to update ESLint:', error.message);
}

// The @supabase/auth-helpers-nextjs is deprecated but still needed for backward compatibility
// We already have @supabase/ssr installed which is the replacement
console.log('2. Note: @supabase/auth-helpers-nextjs is deprecated but kept for compatibility');
console.log('   The app already uses @supabase/ssr for new features\n');

// Update other deprecated packages
console.log('3. Checking for other package updates...');
try {
  execSync('npm update', { stdio: 'inherit' });
  console.log('✅ Packages updated\n');
} catch (error) {
  console.error('❌ Failed to update packages:', error.message);
}

// Run audit to check vulnerabilities
console.log('4. Running security audit...');
try {
  execSync('npm audit', { stdio: 'inherit' });
} catch (error) {
  // npm audit returns non-zero exit code when vulnerabilities are found
  console.log('\n5. To fix vulnerabilities, you can run:');
  console.log('   npm audit fix');
  console.log('   or for breaking changes:');
  console.log('   npm audit fix --force');
}

console.log('\n✅ Package update check complete!');
console.log('\nNote: Some warnings (like rimraf, glob, inflight) come from dependencies of dependencies');
console.log('and cannot be directly fixed without the upstream packages updating their dependencies.');