export type Locale = (typeof locales)[number];

export const locales = ['en', 'zh-CN', 'zh-TW', 'es', 'jp', 'ko', 'ru', 'fr', 'de', 'hi', 'ar', 'it'] as const;
export const defaultLocale: Locale = 'en';

// 语言配置，包含更多信息
export interface LanguageConfig {
    code: Locale;
    name: string;
    nativeName: string;
    flag: string;
    dir: 'ltr' | 'rtl';
}

export const languages: readonly LanguageConfig[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', dir: 'ltr' },
    { code: 'zh-CN', name: 'Simplified Chinese', nativeName: '简体中文', flag: '🇨🇳', dir: 'ltr' },
    { code: 'zh-TW', name: 'Traditional Chinese', nativeName: '繁體中文', flag: '🇹🇼', dir: 'ltr' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr' },
    { code: 'jp', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', dir: 'ltr' },
    { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', dir: 'ltr' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', dir: 'ltr' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', dir: 'ltr' }
] as const;

export function isValidLocale(locale: string): locale is Locale {
    return locales.includes(locale as Locale);
}

export function getLanguageConfig(locale: Locale): LanguageConfig {
    const config = languages.find(lang => lang.code === locale);
    if (!config) {
        console.warn(`Language config not found for locale: ${locale}`);
        return languages.find(lang => lang.code === defaultLocale)!;
    }
    return config;
}

export function getLanguageDisplayName(locale: Locale): string {
    return getLanguageConfig(locale).nativeName;
}

export function getLanguageDirection(locale: Locale): 'ltr' | 'rtl' {
    return getLanguageConfig(locale).dir;
}

// 获取支持的语言代码列表
export function getSupportedLocales(): readonly Locale[] {
    return locales;
}

// 获取语言的主要部分（例如从 'zh-CN' 获取 'zh'）
export function getMainLanguage(locale: Locale): string {
    return locale.split('-')[0];
}