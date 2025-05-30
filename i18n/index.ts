'use server';

import { cookies, headers } from 'next/headers';

import { defaultLocale, locales, Locale } from './config';

const COOKIE_NAME = 'NEXT_LOCALE';

export async function getLocale() {
  const locale = (await cookies()).get(COOKIE_NAME)?.value
  if (locale) return locale

  const acceptLanguage = (await headers()).get('accept-language')

  const parsedLocale = acceptLanguage?.split(',')[0].split('-')[0] as Locale || defaultLocale

  return locales.includes(parsedLocale) ? parsedLocale as Locale : defaultLocale;
}

export async function setLocale(locale: Locale) {
  (await cookies()).set(COOKIE_NAME, locale);
} 