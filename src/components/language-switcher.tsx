'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Globe } from 'lucide-react';
import { locales, type Locale } from '@/i18n/config';

export function LanguageSwitcher() {
  const t = useTranslations('language');
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = async (newLocale: Locale) => {
    // Update locale via API
    await fetch('/api/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: newLocale }),
    });

    // Refresh the page to apply new locale
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="relative inline-block">
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-gray-500" />
        <select
          value={locale}
          onChange={(e) => handleLocaleChange(e.target.value as Locale)}
          disabled={isPending}
          aria-label={t('select')}
          className="bg-transparent border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F86037] cursor-pointer disabled:opacity-50"
        >
          {locales.map((loc) => (
            <option key={loc} value={loc}>
              {t(loc)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// Compact version for sidebar
export function LanguageSwitcherCompact() {
  const t = useTranslations('language');
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = async (newLocale: Locale) => {
    await fetch('/api/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: newLocale }),
    });

    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-gray-400" />
      <div className="flex bg-gray-100 rounded-md p-0.5">
        {locales.map((loc) => (
          <button
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            disabled={isPending || locale === loc}
            className={`px-3 py-1 text-xs font-medium rounded transition-all ${
              locale === loc
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            } disabled:cursor-default`}
          >
            {t(loc)}
          </button>
        ))}
      </div>
    </div>
  );
}
