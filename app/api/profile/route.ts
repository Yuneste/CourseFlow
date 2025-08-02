import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ProfileService, ProfileUpdateData } from '@/lib/services/profile.service';
import { logger } from '@/lib/services/logger.service';
import { ERROR_MESSAGES } from '@/lib/constants';

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.UNAUTHORIZED },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    
    // Build update data with proper typing
    const updateData: ProfileUpdateData = {};
    
    // Only add fields that are provided
    if (body.study_program !== undefined) updateData.study_program = body.study_program;
    if (body.degree_type !== undefined) updateData.degree_type = body.degree_type;
    if (body.start_year !== undefined) updateData.start_year = body.start_year;
    if (body.expected_graduation_year !== undefined) updateData.expected_graduation_year = body.expected_graduation_year;
    if (body.country !== undefined) updateData.country = body.country;
    if (body.academic_system !== undefined) updateData.academic_system = body.academic_system;
    if (body.full_name !== undefined) updateData.full_name = body.full_name;
    if (body.onboarding_completed !== undefined) updateData.onboarding_completed = body.onboarding_completed;
    if (body.current_term !== undefined) updateData.current_term = body.current_term;
    
    // Update profile using service
    const result = await ProfileService.updateProfile(
      user.id,
      user.email,
      updateData
    );
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || ERROR_MESSAGES.GENERIC },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Unexpected error in PATCH /api/profile', error, {
      action: 'patchProfile'
    });
    return NextResponse.json(
      { error: ERROR_MESSAGES.GENERIC },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.UNAUTHORIZED },
        { status: 401 }
      );
    }
    
    // Get profile using service
    const profile = await ProfileService.getProfile(user.id);
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(profile);
  } catch (error) {
    logger.error('Unexpected error in GET /api/profile', error, {
      action: 'getProfile'
    });
    return NextResponse.json(
      { error: ERROR_MESSAGES.GENERIC },
      { status: 500 }
    );
  }
}