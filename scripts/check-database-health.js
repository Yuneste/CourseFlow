/**
 * Database Health Check Script
 * Run this to verify database integrity after debugging sessions
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDatabaseHealth() {
  console.log('🔍 Starting database health check...\n');

  try {
    // 1. Check for orphaned files (files without valid courses)
    console.log('1. Checking for orphaned files...');
    const { data: orphanedFiles, error: orphanedFilesError } = await supabase
      .from('files')
      .select('id, display_name, course_id')
      .not('course_id', 'is', null)
      .filter('course_id', 'not.in', '(SELECT id FROM courses)');

    if (orphanedFilesError) {
      console.error('Error checking orphaned files:', orphanedFilesError);
    } else {
      console.log(`   ✓ Found ${orphanedFiles?.length || 0} orphaned files`);
      if (orphanedFiles?.length > 0) {
        console.log('   ⚠️  Orphaned files:', orphanedFiles.map(f => f.display_name).join(', '));
      }
    }

    // 2. Check for orphaned folders
    console.log('\n2. Checking for orphaned folders...');
    const { data: orphanedFolders, error: orphanedFoldersError } = await supabase
      .from('course_folders')
      .select('id, name, course_id')
      .filter('course_id', 'not.in', '(SELECT id FROM courses)');

    if (orphanedFoldersError) {
      console.error('Error checking orphaned folders:', orphanedFoldersError);
    } else {
      console.log(`   ✓ Found ${orphanedFolders?.length || 0} orphaned folders`);
      if (orphanedFolders?.length > 0) {
        console.log('   ⚠️  Orphaned folders:', orphanedFolders.map(f => f.name).join(', '));
      }
    }

    // 3. Check for duplicate folders in same course
    console.log('\n3. Checking for duplicate folders...');
    const { data: allFolders, error: foldersError } = await supabase
      .from('course_folders')
      .select('name, course_id')
      .order('course_id');

    if (!foldersError && allFolders) {
      const duplicates = {};
      allFolders.forEach(folder => {
        const key = `${folder.course_id}-${folder.name}`;
        if (duplicates[key]) {
          duplicates[key]++;
        } else {
          duplicates[key] = 1;
        }
      });

      const duplicateCount = Object.values(duplicates).filter(count => count > 1).length;
      console.log(`   ✓ Found ${duplicateCount} duplicate folder names`);
      if (duplicateCount > 0) {
        console.log('   ⚠️  Courses have folders with duplicate names');
      }
    }

    // 4. Check for files with invalid sizes
    console.log('\n4. Checking for files with invalid sizes...');
    const { data: invalidFiles, error: invalidFilesError } = await supabase
      .from('files')
      .select('id, display_name, file_size')
      .or('file_size.is.null,file_size.lte.0,file_size.gte.52428800'); // > 50MB

    if (invalidFilesError) {
      console.error('Error checking invalid files:', invalidFilesError);
    } else {
      console.log(`   ✓ Found ${invalidFiles?.length || 0} files with invalid sizes`);
      if (invalidFiles?.length > 0) {
        console.log('   ⚠️  Files with issues:', invalidFiles.map(f => 
          `${f.display_name} (${f.file_size ? `${(f.file_size / 1024 / 1024).toFixed(2)}MB` : 'null size'})`
        ).join(', '));
      }
    }

    // 5. Check storage usage
    console.log('\n5. Checking storage usage...');
    const { data: storageStats, error: storageError } = await supabase
      .from('files')
      .select('file_size');

    if (!storageError && storageStats) {
      const totalSize = storageStats.reduce((sum, file) => sum + (file.file_size || 0), 0);
      const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
      console.log(`   ✓ Total storage used: ${totalSizeMB} MB`);
      console.log(`   ✓ Total files: ${storageStats.length}`);
      console.log(`   ✓ Average file size: ${(totalSize / storageStats.length / 1024 / 1024).toFixed(2)} MB`);
    }

    console.log('\n✅ Database health check complete!');
    
    // Summary
    const issues = [];
    if (orphanedFiles?.length > 0) issues.push(`${orphanedFiles.length} orphaned files`);
    if (orphanedFolders?.length > 0) issues.push(`${orphanedFolders.length} orphaned folders`);
    if (duplicateCount > 0) issues.push(`${duplicateCount} duplicate folders`);
    if (invalidFiles?.length > 0) issues.push(`${invalidFiles.length} files with invalid sizes`);

    if (issues.length > 0) {
      console.log('\n⚠️  Issues found:', issues.join(', '));
      console.log('   Consider running cleanup operations to fix these issues.');
    } else {
      console.log('\n✨ No issues found! Your database is healthy.');
    }

  } catch (error) {
    console.error('❌ Health check failed:', error);
  }
}

// Run the health check
checkDatabaseHealth();