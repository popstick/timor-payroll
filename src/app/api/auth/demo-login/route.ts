import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';

export async function POST(request: NextRequest) {
  const email = process.env.DEMO_EMAIL;
  const password = process.env.DEMO_PASSWORD;

  const response = NextResponse.json({ ok: true });
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } =
    email && password
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signInAnonymously();

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

  return response;
}
