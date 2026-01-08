import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  const email = process.env.DEMO_EMAIL;
  const password = process.env.DEMO_PASSWORD;

  const supabase = await createClient();
  if (email && password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return NextResponse.json({ error: error.message }, { status: 401 });
    return NextResponse.json({ ok: true });
  }

  const { error } = await supabase.auth.signInAnonymously();

  if (error) {
    return NextResponse.json(
      {
        error:
          'Guest login is not configured. Either set DEMO_EMAIL/DEMO_PASSWORD on the server, or enable Supabase Anonymous sign-ins.',
        details: error.message,
      },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
