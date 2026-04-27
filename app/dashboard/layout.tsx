import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardNav } from '@/components/layout/dashboard-nav';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <DashboardNav userEmail={user.email ?? ''} />
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
