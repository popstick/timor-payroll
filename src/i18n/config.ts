export const locales = ['en', 'pt', 'tet'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';
