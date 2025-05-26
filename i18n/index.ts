import en from './locales/en';
import zh from './locales/zh';
import zhTW from './locales/zhTw';
import es from './locales/es';
import jp from './locales/jp';
import ko from './locales/ko';
import ru from './locales/ru';
import fr from './locales/fr';
import de from './locales/de';
import hi from './locales/hi';
import ar from './locales/ar';
import it from './locales/it';

// 支持的语言类型
export type SupportedLanguage = 'en' | 'zh' | 'zhTW' | 'es' | 'jp' | 'ko' | 'ru' | 'fr' | 'de' | 'hi' | 'ar' | 'it';

// 语言映射
const translations = {
  en,
  zh,
  zhTW,
  es,
  jp,
  ko,
  ru,
  fr,
  de,
  hi,
  ar,
  it,
};

export const languages = [
  { code: 'en' as const, name: 'English', flag: '🇺🇸' },
  { code: 'zh' as const, name: '简体中文', flag: '🇨🇳' },
  { code: 'zhTW' as const, name: '繁體中文', flag: '🇹🇼' },
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

// 默认语言
export const defaultLanguage: SupportedLanguage = 'en';

// 获取嵌套对象的值，支持点号路径
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
}

// 翻译函数
export function getTranslation(
  language: SupportedLanguage,
  key: string,
  fallback?: string
): string {
  const translation = translations[language] || translations[defaultLanguage];
  const value = getNestedValue(translation, key);

  if (value !== null && value !== undefined) {
    return typeof value === 'string' ? value : fallback || key;
  }

  // 如果当前语言没有找到，尝试使用默认语言
  if (language !== defaultLanguage) {
    const defaultValue = getNestedValue(translations[defaultLanguage], key);
    if (defaultValue !== null && defaultValue !== undefined) {
      return typeof defaultValue === 'string' ? defaultValue : fallback || key;
    }
  }

  return fallback || key;
}

// 检测浏览器语言
export function detectBrowserLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') {
    return defaultLanguage;
  }

  const browserLang = navigator.language.split('-')[0] as SupportedLanguage;
  return translations[browserLang] ? browserLang : defaultLanguage;
}

// 本地存储键名
export const LANGUAGE_STORAGE_KEY = 'nexusai-language';

// 保存语言设置到本地存储
export function saveLanguageToStorage(language: SupportedLanguage): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }
}

// 从本地存储获取语言设置
export function getLanguageFromStorage(): SupportedLanguage | null {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY) as SupportedLanguage;
    return translations[stored] ? stored : null;
  }
  return null;
}

// 获取初始语言（优先级：本地存储 > 浏览器语言 > 默认语言）
export function getInitialLanguage(): SupportedLanguage {
  const storedLanguage = getLanguageFromStorage();
  if (storedLanguage) {
    return storedLanguage;
  }

  return detectBrowserLanguage();
}

// 导出翻译数据（用于调试）
export { translations }; 