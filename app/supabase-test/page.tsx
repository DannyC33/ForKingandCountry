import { createClient } from '@/lib/supabase/server';

interface CheckResult {
  label: string;
  ok: boolean;
  detail: string;
}

async function runChecks(): Promise<CheckResult[]> {
  const results: CheckResult[] = [];

  // 1. Env vars present
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  results.push({
    label: 'NEXT_PUBLIC_SUPABASE_URL set',
    ok: !!url && url !== 'https://your-project.supabase.co',
    detail: url ? url : 'Missing — add to .env.local',
  });

  const keyLooksValid = !!key && key.startsWith('eyJ') && key.length > 100;
  results.push({
    label: 'NEXT_PUBLIC_SUPABASE_ANON_KEY looks like a JWT',
    ok: keyLooksValid,
    detail: keyLooksValid
      ? `eyJ...${key!.slice(-6)} (${key!.length} chars)`
      : key
        ? `Got "${key.slice(0, 12)}…" — expected a JWT starting with "eyJ"`
        : 'Missing — add to .env.local',
  });

  if (!url || !keyLooksValid) {
    results.push({
      label: 'Database reachable',
      ok: false,
      detail: 'Skipped — fix env vars above first',
    });
    results.push({
      label: 'Table: notes exists',
      ok: false,
      detail: 'Skipped',
    });
    results.push({
      label: 'Table: conversations exists',
      ok: false,
      detail: 'Skipped',
    });
    results.push({
      label: 'Table: messages exists',
      ok: false,
      detail: 'Skipped',
    });
    return results;
  }

  // 2. Can connect + query each table
  try {
    const supabase = await createClient();

    for (const table of ['notes', 'conversations', 'messages'] as const) {
      const { error } = await supabase
        .from(table)
        .select('id', { count: 'exact', head: true });

      if (!error) {
        results.push({ label: `Table: ${table} exists`, ok: true, detail: 'Query succeeded' });
      } else if (error.code === '42P01') {
        results.push({
          label: `Table: ${table} exists`,
          ok: false,
          detail: 'Table not found — run supabase/migrations/001_schema.sql in the SQL editor',
        });
      } else if (error.code === 'PGRST301') {
        // RLS blocked anonymous select — that's actually fine, table exists
        results.push({ label: `Table: ${table} exists`, ok: true, detail: 'RLS active (anonymous access blocked — expected)' });
      } else {
        results.push({ label: `Table: ${table} exists`, ok: false, detail: error.message });
      }
    }

    results.splice(2, 0, { label: 'Database reachable', ok: true, detail: `Connected to ${url}` });
  } catch (err) {
    results.push({
      label: 'Database reachable',
      ok: false,
      detail: err instanceof Error ? err.message : String(err),
    });
  }

  return results;
}

export default async function SupabaseTestPage() {
  const checks = await runChecks();
  const allOk = checks.every((c) => c.ok);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className={`px-6 py-4 ${allOk ? 'bg-green-500' : 'bg-amber-500'}`}>
          <h1 className="text-white font-bold text-lg">
            {allOk ? '✓ Supabase connection healthy' : '⚠ Connection issues detected'}
          </h1>
          <p className="text-white/80 text-sm mt-0.5">
            {allOk
              ? 'All checks passed — you can delete this page before deploying.'
              : 'Fix the issues below, then refresh this page.'}
          </p>
        </div>

        <ul className="divide-y divide-gray-100">
          {checks.map((check) => (
            <li key={check.label} className="px-6 py-4 flex items-start gap-3">
              <span className={`mt-0.5 text-lg ${check.ok ? 'text-green-500' : 'text-red-500'}`}>
                {check.ok ? '✓' : '✗'}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">{check.label}</div>
                <div className={`text-xs mt-0.5 truncate ${check.ok ? 'text-gray-400' : 'text-red-600'}`}>
                  {check.detail}
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            <span className="font-medium">Next step:</span> Run the migration SQL then sign up at{' '}
            <a href="/login" className="text-blue-500 hover:underline">/login</a> to test auth end-to-end.
          </p>
        </div>
      </div>
    </div>
  );
}
