import { getRequestConfig } from 'next-intl/server';
import { getLocale } from './index';
import { defaultLocale, isValidLocale } from './config';

export default getRequestConfig(async () => {
    let locale = await getLocale();
    
    // 确保语言代码有效
    if (!isValidLocale(locale)) {
        console.warn(`Invalid locale detected: ${locale}, falling back to ${defaultLocale}`);
        locale = defaultLocale;
    }

    let messages;
    try {
        // 尝试加载对应语言的翻译文件
        messages = (await import(`./locales/${locale}.json`)).default;
    } catch (error) {
        console.warn(`Failed to load messages for locale: ${locale}`, error);
        
        // 如果加载失败且不是默认语言，尝试加载默认语言
        if (locale !== defaultLocale) {
            try {
                console.info(`Falling back to default locale: ${defaultLocale}`);
                messages = (await import(`./locales/${defaultLocale}.json`)).default;
                locale = defaultLocale;
            } catch (fallbackError) {
                console.error(`Failed to load fallback messages for locale: ${defaultLocale}`, fallbackError);
                messages = {}; // 提供空对象作为最后的回退
            }
        } else {
            console.error(`Failed to load default locale messages: ${defaultLocale}`, error);
            messages = {}; // 提供空对象作为最后的回退
        }
    }

    return {
        locale,
        messages,
        // 添加时间区域设置
        timeZone: 'UTC',
        // 在开发环境中显示缺失翻译的警告
        onError: (error) => {
            if (process.env.NODE_ENV === 'development') {
                console.warn('Translation error:', error);
            }
        },
        // 当翻译缺失时的回退处理
        getMessageFallback: ({ namespace, key, error }) => {
            const path = [namespace, key].filter((part) => part != null).join('.');
            
            if (process.env.NODE_ENV === 'development') {
                console.warn(`Missing translation: ${path}`, error);
                return `Missing: ${path}`;
            }
            
            return path;
        }
    };
}); 