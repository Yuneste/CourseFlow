import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { UnifiedBackground, UnifiedSection, UnifiedCard } from '@/components/ui/unified-background';

export default async function CourseSettingsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/login');
  }

  // Verify course exists and belongs to user
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (!course) {
    redirect('/dashboard');
  }

  return (
    <UnifiedBackground>
      <UnifiedSection>
        <div className="mb-6">
          <Link href={`/courses/${params.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Button>
          </Link>
        </div>

        <UnifiedCard className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Course Settings</h1>
          <p className="text-muted-foreground mb-6">
            Course settings will be available in a future update.
          </p>
          <p className="text-sm text-muted-foreground">
            Coming soon: Edit course details, manage permissions, export data, and more.
          </p>
        </UnifiedCard>
      </UnifiedSection>
    </UnifiedBackground>
  );
}