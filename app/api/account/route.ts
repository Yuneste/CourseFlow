import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(request: NextRequest) {
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

    // Delete user's data from all tables
    // The ON DELETE CASCADE in the database will handle related records
    
    // Delete from auth.users (this will cascade to profiles and courses)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(
      user.id
    );

    if (deleteError) {
      // If admin delete fails, try user self-deletion
      const { error: selfDeleteError } = await supabase.rpc('delete_user');
      
      if (selfDeleteError) {
        console.error('Error deleting user:', selfDeleteError);
        return NextResponse.json(
          { error: 'Failed to delete account' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}