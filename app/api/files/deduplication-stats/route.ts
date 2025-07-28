import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  
  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get deduplication stats for the user
    // In a real implementation, we would track this in a separate table
    // For now, we'll calculate based on file hashes
    const { data: files, error: filesError } = await supabase
      .from('files')
      .select('file_hash, file_size, display_name, created_at')
      .eq('user_id', user.id);

    if (filesError) {
      throw filesError;
    }

    // Calculate duplicate stats
    const hashMap = new Map<string, Array<any>>();
    files?.forEach(file => {
      if (!hashMap.has(file.file_hash)) {
        hashMap.set(file.file_hash, []);
      }
      hashMap.get(file.file_hash)!.push(file);
    });

    let totalSaved = 0;
    let duplicatesPreventedCount = 0;
    const topDuplicates: Array<{
      fileName: string;
      count: number;
      spaceSaved: number;
    }> = [];

    // Calculate space saved
    hashMap.forEach((duplicates, hash) => {
      if (duplicates.length > 1) {
        // Sort by creation date to find the original
        duplicates.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        
        const original = duplicates[0];
        const spaceSaved = original.file_size * (duplicates.length - 1);
        totalSaved += spaceSaved;
        duplicatesPreventedCount += duplicates.length - 1;

        topDuplicates.push({
          fileName: original.display_name,
          count: duplicates.length,
          spaceSaved,
        });
      }
    });

    // Sort top duplicates by space saved
    topDuplicates.sort((a, b) => b.spaceSaved - a.spaceSaved);

    // Calculate last month's savings
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    
    let lastMonthSaved = 0;
    hashMap.forEach((duplicates) => {
      const recentDuplicates = duplicates.filter(file => 
        new Date(file.created_at) > lastMonthDate
      );
      if (recentDuplicates.length > 0 && duplicates.length > recentDuplicates.length) {
        lastMonthSaved += duplicates[0].file_size * recentDuplicates.length;
      }
    });

    return NextResponse.json({
      totalSaved,
      duplicatesPreventedCount,
      lastMonthSaved,
      topDuplicates: topDuplicates.slice(0, 10),
    });
  } catch (error) {
    console.error('Deduplication stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deduplication stats' },
      { status: 500 }
    );
  }
}