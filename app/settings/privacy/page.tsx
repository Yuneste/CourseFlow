'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ChevronLeft, Shield, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function PrivacySettingsPage() {
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    setIsDeleting(true);
    
    try {
      // Delete user data
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user found');
      }

      // Delete user's files from storage
      const { data: files } = await supabase
        .from('files')
        .select('storage_path')
        .eq('user_id', user.id);

      if (files && files.length > 0) {
        const filePaths = files.map(f => f.storage_path);
        await supabase.storage.from('course-files').remove(filePaths);
      }

      // Delete user account (this will cascade delete all related data)
      const { error } = await supabase.rpc('delete_user_account');
      
      if (error) throw error;

      // Sign out and clear all session data
      await supabase.auth.signOut({ scope: 'local' });
      await supabase.auth.signOut({ scope: 'global' });
      
      // Clear any cached data
      localStorage.clear();
      sessionStorage.clear();
      
      // Force reload to clear any in-memory cache
      toast.success('Your account has been deleted');
      window.location.href = '/';
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl">
        <div className="mb-8">
          <Link href="/settings">
            <Button variant="ghost" className="mb-4">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Settings
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">
            Privacy & Security
          </h1>
          <p className="text-muted-foreground mt-1">Manage your account security and privacy settings</p>
        </div>

        <div className="space-y-6">
          {/* Password Change Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/update-password">
                <Button variant="outline">
                  Change Password
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Delete Account Section */}
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Delete Account
              </CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="text-sm text-red-900">
                    <p className="font-semibold mb-1">This action cannot be undone</p>
                    <p>Deleting your account will:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Remove all your courses and files</li>
                      <li>Delete all your personal information</li>
                      <li>Cancel any active subscriptions</li>
                      <li>Remove access to all shared resources</li>
                    </ul>
                  </div>
                </div>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    Delete My Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      account and remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="my-4">
                    <Label htmlFor="delete-confirmation" className="text-sm font-medium">
                      Type <span className="font-mono font-bold">DELETE</span> to confirm
                    </Label>
                    <Input
                      id="delete-confirmation"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder="Type DELETE here"
                      className="mt-2"
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmation !== 'DELETE' || isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete Account'}
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}