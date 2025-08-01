/**
 * Database Cleanup Script
 * ⚠️  WARNING: This script will DELETE data. Run the health check first!
 * Only run this if you're sure you want to clean up orphaned records.
 */

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

async function cleanupDatabase() {
  console.log('🧹 Database Cleanup Tool\n');
  console.log('⚠️  WARNING: This will DELETE orphaned records from your database!');
  console.log('   Run check-database-health.js first to see what will be removed.\n');

  const proceed = await askQuestion('Do you want to continue? (yes/no): ');
  
  if (!proceed) {
    console.log('Cleanup cancelled.');
    rl.close();
    return;
  }

  try {
    // 1. Remove orphaned files
    console.log('\n1. Removing orphaned files...');
    const { data: orphanedFiles, error: fetchError } = await supabase
      .from('files')
      .select('id, display_name')
      .not('course_id', 'is', null)
      .filter('course_id', 'not.in', '(SELECT id FROM courses)');

    if (fetchError) {
      console.error('Error fetching orphaned files:', fetchError);
    } else if (orphanedFiles?.length > 0) {
      const confirmDelete = await askQuestion(`   Delete ${orphanedFiles.length} orphaned files? (yes/no): `);
      
      if (confirmDelete) {
        const { error: deleteError } = await supabase
          .from('files')
          .delete()
          .in('id', orphanedFiles.map(f => f.id));

        if (deleteError) {
          console.error('   ❌ Error deleting files:', deleteError);
        } else {
          console.log(`   ✓ Deleted ${orphanedFiles.length} orphaned files`);
        }
      }
    } else {
      console.log('   ✓ No orphaned files found');
    }

    // 2. Remove orphaned folders
    console.log('\n2. Removing orphaned folders...');
    const { data: orphanedFolders, error: foldersFetchError } = await supabase
      .from('course_folders')
      .select('id, name')
      .filter('course_id', 'not.in', '(SELECT id FROM courses)');

    if (foldersFetchError) {
      console.error('Error fetching orphaned folders:', foldersFetchError);
    } else if (orphanedFolders?.length > 0) {
      const confirmDelete = await askQuestion(`   Delete ${orphanedFolders.length} orphaned folders? (yes/no): `);
      
      if (confirmDelete) {
        const { error: deleteError } = await supabase
          .from('course_folders')
          .delete()
          .in('id', orphanedFolders.map(f => f.id));

        if (deleteError) {
          console.error('   ❌ Error deleting folders:', deleteError);
        } else {
          console.log(`   ✓ Deleted ${orphanedFolders.length} orphaned folders`);
        }
      }
    } else {
      console.log('   ✓ No orphaned folders found');
    }

    // 3. Remove duplicate folders (keep the first one)
    console.log('\n3. Checking for duplicate folders...');
    const { data: allFolders, error: allFoldersError } = await supabase
      .from('course_folders')
      .select('*')
      .order('created_at', { ascending: true });

    if (!allFoldersError && allFolders) {
      const seen = new Set();
      const duplicates = [];
      
      allFolders.forEach(folder => {
        const key = `${folder.course_id}-${folder.name}`;
        if (seen.has(key)) {
          duplicates.push(folder);
        } else {
          seen.add(key);
        }
      });

      if (duplicates.length > 0) {
        console.log(`   Found ${duplicates.length} duplicate folders`);
        const confirmDelete = await askQuestion(`   Delete ${duplicates.length} duplicate folders? (yes/no): `);
        
        if (confirmDelete) {
          const { error: deleteError } = await supabase
            .from('course_folders')
            .delete()
            .in('id', duplicates.map(f => f.id));

          if (deleteError) {
            console.error('   ❌ Error deleting duplicates:', deleteError);
          } else {
            console.log(`   ✓ Deleted ${duplicates.length} duplicate folders`);
          }
        }
      } else {
        console.log('   ✓ No duplicate folders found');
      }
    }

    console.log('\n✅ Cleanup complete!');

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    rl.close();
  }
}

// Run the cleanup
cleanupDatabase();