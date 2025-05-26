import en from './locales/en';
import zh from './locales/zh';

// 支持的语言类型
export type SupportedLanguage = 'en' | 'zh';

// 语言映射
const translations = {
  en,
  zh
};

// 语言配置
export const languages = [
  { code: 'en' as const, name: 'English', flag: '🇺🇸' },
  { code: 'zh' as const, name: '中文', flag: '🇨🇳' }
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