import { redirect } from 'next/navigation';

export default function StatsPage() {
  // Redirect to dashboard for now
  redirect('/dashboard');
}