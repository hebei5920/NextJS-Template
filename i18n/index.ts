'use server';

import { cookies, headers } from 'next/headers';

import { defaultLocale, locales, Locale, isValidLocale } from './config';

const COOKIE_NAME = 'NEXT_LOCALE';

export async function getLocale(): Promise<Locale> {
  // 首先检查 cookie 中的语言设置，并验证其有效性
  const cookieLocale = (await cookies()).get(COOKIE_NAME)?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) {
    return cookieLocale;
  }

  // 解析 Accept-Language 头部
  const acceptLanguage = (await headers()).get('accept-language');
  
  if (acceptLanguage) {
    try {
      // 解析 Accept-Language 头部，支持权重和多语言
      const languages = acceptLanguage
        .split(',')
        .map(lang => {
          const [locale, q = 'q=1'] = lang.trim().split(';');
          const quality = parseFloat(q.replace('q=', '')) || 1;
          return { locale: locale.trim(), quality };
        })
        .sort((a, b) => b.quality - a.quality); // 按权重排序

      // 首先查找完全匹配的语言（如 zh-CN）
      for (const { locale } of languages) {
        if (isValidLocale(locale)) {
          return locale;
        }
      }

      // 然后查找主语言匹配（如 zh 匹配 zh-CN）
      for (const { locale } of languages) {
        const mainLang = locale.split('-')[0].toLowerCase();
        const matchedLocale = locales.find(supportedLocale => 
          supportedLocale.toLowerCase().startsWith(mainLang)
        );
        if (matchedLocale) {
          return matchedLocale;
        }
      }
    } catch (error) {
      console.warn('Failed to parse Accept-Language header:', acceptLanguage, error);
    }
  }

  return defaultLocale;
}

export async function setLocale(locale: string): Promise<void> {
  if (!isValidLocale(locale)) {
    console.warn(`Invalid locale: ${locale}. Using default locale: ${defaultLocale}`);
    locale = defaultLocale;
  }
  
  (await cookies()).set(COOKIE_NAME, locale, {
    path: '/',
    maxAge: 365 * 24 * 60 * 60, // 1 year
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
} 