export type Locale = (typeof locales)[number];

export const locales = ['zh-CN', 'en', 'zh-TW', 'es', 'jp', 'ko', 'ru', 'fr', 'de', 'hi', 'ar', 'it'] as const;
export const defaultLocale: Locale = 'en';

export const languages = [
    { code: 'en' as const, name: 'English', flag: '🇺🇸' },
    { code: 'zh-CN' as const, name: '简体中文', flag: '🇨🇳' },
    { code: 'zh-TW' as const, name: '繁體中文', flag: '🇹🇼' },
    { code: 'es' as const, name: 'Español', flag: '🇪🇸' },
    { code: 'jp' as const, name: '日本語', flag: '🇯🇵' },
    { code: 'ko' as const, name: '한국어', flag: '🇰🇷' },
    { code: 'ru' as const, name: 'Русский', flag: '🇷🇺' },
    { code: 'fr' as const, name: 'Français', flag: '🇫🇷' },
    { code: 'de' as const, name: 'Deutsch', flag: '🇩🇪' },
    { code: 'hi' as const, name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ar' as const, name: 'العربية', flag: '🇸🇦' },
    { code: 'it' as const, name: 'Italiano', flag: '🇮🇹' }
];