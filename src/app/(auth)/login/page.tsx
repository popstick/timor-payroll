'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { DollarSign, Mail, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { LanguageSwitcher } from '@/components/language-switcher';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');

  const publicDemoEmail = process.env.NEXT_PUBLIC_DEMO_EMAIL || '';
  const publicDemoPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInAndRedirect = async (emailToUse: string, passwordToUse: string) => {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password: passwordToUse,
    });

    if (signInError) throw signInError;

    const redirectTo = searchParams.get('redirectTo') || '/dashboard';
    router.push(redirectTo);
    router.refresh();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signInAndRedirect(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-gray-900">{t('welcomeBack')}</CardTitle>
          <CardDescription>{t('signInTo')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('emailPlaceholder')}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('signingIn')}
                </>
              ) : (
                t('login')
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">{tCommon('or')}</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              setError(null);
              try {
                if (publicDemoEmail && publicDemoPassword) {
                  await signInAndRedirect(publicDemoEmail, publicDemoPassword);
                  return;
                }

                const response = await fetch('/api/auth/demo-login', { method: 'POST' });
                if (!response.ok) {
                  const json = (await response.json()) as { error?: string; details?: string };
                  throw new Error(
                    json?.error ||
                      json?.details ||
                      'Demo account not configured. Set NEXT_PUBLIC_DEMO_EMAIL/NEXT_PUBLIC_DEMO_PASSWORD (local), or DEMO_EMAIL/DEMO_PASSWORD (server).'
                  );
                }

                const redirectTo = searchParams.get('redirectTo') || '/dashboard';
                router.push(redirectTo);
                router.refresh();
              } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Failed to sign in');
              } finally {
                setLoading(false);
              }
            }}
          >
            {t('continueAsGuest')}
          </Button>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">{t('noAccount')} </span>
            <Link href="/signup" className="text-blue-600 hover:underline font-medium">
              {t('signup')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
