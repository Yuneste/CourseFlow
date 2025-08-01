// Debug script to check ECTS credits issue
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function debugECTS() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  console.log('=== ECTS Credits Debug ===\n');
  
  // 1. Check all users with ECTS academic system
  const { data: ectsUsers, error: usersError } = await supabase
    .from('profiles')
    .select('id, email, academic_system')
    .eq('academic_system', 'ects');
    
  console.log('Users with ECTS academic system:', ectsUsers?.length || 0);
  
  if (ectsUsers && ectsUsers.length > 0) {
    for (const user of ectsUsers) {
      console.log(`\nUser: ${user.email} (${user.id})`);
      console.log(`Academic System: ${user.academic_system}`);
      
      // 2. Check their courses
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('id, name, credits, ects_credits, created_at')
        .eq('user_id', user.id);
        
      if (courses) {
        console.log(`Total courses: ${courses.length}`);
        courses.forEach(course => {
          console.log(`  - ${course.name}:`);
          console.log(`    credits: ${course.credits}`);
          console.log(`    ects_credits: ${course.ects_credits}`);
          console.log(`    created: ${course.created_at}`);
        });
      }
    }
  }
  
  // 3. Check if there are any courses with both credits and ects_credits
  const { data: mixedCourses } = await supabase
    .from('courses')
    .select('id, name, credits, ects_credits')
    .not('credits', 'is', null)
    .not('ects_credits', 'is', null);
    
  if (mixedCourses && mixedCourses.length > 0) {
    console.log('\n⚠️  Courses with both credits and ECTS credits:');
    mixedCourses.forEach(course => {
      console.log(`  - ${course.name}: credits=${course.credits}, ects_credits=${course.ects_credits}`);
    });
  }
  
  // 4. Check constraint limits
  console.log('\n=== Database Constraints ===');
  console.log('credits: 0-10 (based on migration)');
  console.log('ects_credits: 0-30 (based on migration)');
  
  // 5. Test creating a course with ECTS
  console.log('\n=== Testing Course Creation ===');
  const testUserId = ectsUsers?.[0]?.id;
  
  if (testUserId) {
    const testCourse = {
      user_id: testUserId,
      name: 'ECTS Test Course ' + new Date().toISOString(),
      term: 'Spring 2025',
      academic_period_type: 'semester',
      ects_credits: 6,
      color: '#3B82F6'
    };
    
    console.log('Creating test course:', testCourse);
    
    const { data: newCourse, error: createError } = await supabase
      .from('courses')
      .insert(testCourse)
      .select()
      .single();
      
    if (createError) {
      console.error('Error creating course:', createError);
    } else {
      console.log('Course created successfully!');
      console.log('Created course ECTS credits:', newCourse.ects_credits);
      
      // Clean up test course
      await supabase.from('courses').delete().eq('id', newCourse.id);
      console.log('Test course cleaned up');
    }
  }
}

debugECTS().catch(console.error);