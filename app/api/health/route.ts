import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Lightweight check — counts rows the anon key can see (RLS applies)
    const { error } = await supabase.from('notes').select('id', { count: 'exact', head: true });

    if (error) {
      return Response.json({ ok: false, error: error.message }, { status: 500 });
    }

    return Response.json({ ok: true, message: 'Supabase connection healthy' });
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
