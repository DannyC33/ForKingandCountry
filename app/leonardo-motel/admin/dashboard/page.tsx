import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminDashboard from '@/components/leonardo/AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('leo_admin')?.value;

  if (!token || token !== process.env.LEONARDO_ADMIN_PASSWORD) {
    redirect('/admin');
  }

  return <AdminDashboard />;
}
