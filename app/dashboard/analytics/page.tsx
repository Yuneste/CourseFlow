import { redirect } from 'next/navigation';

export default function AnalyticsPage() {
  // Redirect to dashboard for now
  redirect('/dashboard');
}