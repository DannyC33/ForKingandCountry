import Link from 'next/link';
import { LogoutButton } from '@/components/auth/logout-button';

interface DashboardNavProps {
  userEmail: string;
}

export function DashboardNav({ userEmail }: DashboardNavProps) {
  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center px-4 gap-4">
      <Link href="/dashboard" className="font-bold text-gray-900 mr-auto">
        The Last Shall Be First
      </Link>

      <nav className="flex items-center gap-1">
        <Link
          href="/dashboard"
          className="text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          Dashboard
        </Link>
        <Link
          href="/dashboard/chat"
          className="text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          AI Chat
        </Link>
      </nav>

      <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
        <span className="text-xs text-gray-400 hidden sm:block truncate max-w-[160px]">{userEmail}</span>
        <LogoutButton />
      </div>
    </header>
  );
}
