import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/providers/theme-provider';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { getLocale } from '@/i18n';
import { getLanguageDirection, getLanguageConfig } from '@/i18n/config';

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    metadataBase: new URL('https://yourdomain.com'),
    title: {
      template: '%s | Your Site Name',
      default: 'Your Site Name'
    },
    description: 'A compelling description about your site',
    keywords: ['keyword1', 'keyword2'],
    authors: [{ name: 'Your Name', url: 'https://yoursite.com' }],
    openGraph: {
      title: 'Your Site Name',
      description: 'A compelling description',
      type: 'website',
      locale: locale,
      siteName: 'Your Site Name',
      images: ['/og-image.jpg'],
    }
    // twitter: {
    //   card: 'summary_large_image',
    //   creator: '@yourusername'
    // }
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  const direction = getLanguageDirection(locale);
  const languageConfig = getLanguageConfig(locale);

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <head>
        <meta name="language" content={locale} />
        <meta name="content-language" content={locale} />
        <meta name="language-direction" content={direction} />
        <meta name="language-name" content={languageConfig.nativeName} />
        <meta name="robots" content="index,follow" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              "inLanguage": locale,
              "name": "title",
              "description": "description"
            })
          }}
        />
      </head>
      <body className={`${inter.className} ${direction === 'rtl' ? 'rtl' : 'ltr'}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <NextIntlClientProvider messages={messages}>
            <div className={`
              min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
              ${direction === 'rtl' ? 'text-right' : 'text-left'}
            `}>
              <main className="container mx-auto px-4 py-8">
                {children}
              </main>
            </div>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}