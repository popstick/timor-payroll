import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  const email = process.env.DEMO_EMAIL;
  const password = process.env.DEMO_PASSWORD;

  const supabase = await createClient();
  const { error } =
    email && password
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signInAnonymously();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
