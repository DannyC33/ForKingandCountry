import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: recentNotes } = await supabase
    .from('notes')
    .select('id, title, content, updated_at')
    .eq('user_id', user!.id)
    .order('updated_at', { ascending: false })
    .limit(3);

  const { count: noteCount } = await supabase
    .from('notes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user!.id);

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.email}</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-3xl font-bold text-gray-900">{noteCount ?? 0}</div>
          <div className="text-sm text-gray-500 mt-1">Saved Notes</div>
        </div>
        <Link
          href="/dashboard/chat"
          className="bg-brand-600 text-white rounded-xl p-5 hover:bg-brand-700 transition-colors group"
        >
          <div className="text-lg font-semibold group-hover:underline">Open AI Chat</div>
          <div className="text-sm text-brand-100 mt-1">Ask questions, save notes, get help</div>
        </Link>
      </div>

      {/* Recent notes */}
      {recentNotes && recentNotes.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Notes</h2>
          <div className="space-y-3">
            {recentNotes.map((note) => (
              <div
                key={note.id}
                className="bg-white rounded-xl border border-gray-200 p-4"
              >
                {note.title && (
                  <div className="font-medium text-gray-900 mb-1 text-sm">{note.title}</div>
                )}
                <p className="text-sm text-gray-600 line-clamp-2">{note.content}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(note.updated_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
