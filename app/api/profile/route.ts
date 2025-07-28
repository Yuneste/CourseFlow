import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    
    // Update profile
    const updateData: any = {};
    
    // Only add fields that are provided
    if (body.study_program !== undefined) updateData.study_program = body.study_program;
    if (body.degree_type !== undefined) updateData.degree_type = body.degree_type;
    if (body.start_year !== undefined) updateData.start_year = body.start_year;
    if (body.expected_graduation_year !== undefined) updateData.expected_graduation_year = body.expected_graduation_year;
    if (body.country !== undefined) updateData.country = body.country;
    if (body.full_name !== undefined) updateData.full_name = body.full_name;
    if (body.onboarding_completed !== undefined) updateData.onboarding_completed = body.onboarding_completed;
    
    console.log('Updating profile for user:', user.id, 'with data:', updateData);
    
    // First try to update
    const { data: updateResult, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select();

    if (updateError) {
      console.error('Error updating profile:', updateError);
      
      // If update fails, try to create the profile
      if (updateError.code === 'PGRST116') { // No rows returned
        console.log('Profile not found, creating new profile');
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            ...updateData
          });
          
        if (insertError) {
          console.error('Error creating profile:', insertError);
          return NextResponse.json(
            { error: 'Failed to create profile' },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Failed to update profile' },
          { status: 500 }
        );
      }
    }
    
    console.log('Profile updated successfully:', updateResult);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in PATCH /api/profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}