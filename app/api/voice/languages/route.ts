import { NextResponse } from "next/server";

// Speechify支持的语言列表
const SUPPORTED_LANGUAGES = {
  // 完全支持的语言
  'en': { name: 'English', status: 'fully_supported' },
  'fr-FR': { name: 'French', status: 'fully_supported' },
  'de-DE': { name: 'German', status: 'fully_supported' },
  'es-ES': { name: 'Spanish', status: 'fully_supported' },
  'pt-BR': { name: 'Portuguese (Brazil)', status: 'fully_supported' },
  'pt-PT': { name: 'Portuguese (Portugal)', status: 'fully_supported' },
  
  // Beta语言
  'ar-AE': { name: 'Arabic', status: 'beta' },
  'da-DK': { name: 'Danish', status: 'beta' },
  'nl-NL': { name: 'Dutch', status: 'beta' },
  'et-EE': { name: 'Estonian', status: 'beta' },
  'fi-FI': { name: 'Finnish', status: 'beta' },
  'el-GR': { name: 'Greek', status: 'beta' },
  'he-IL': { name: 'Hebrew', status: 'beta' },
  'hi-IN': { name: 'Hindi', status: 'beta' },
  'it-IT': { name: 'Italian', status: 'beta' },
  'ja-JP': { name: 'Japanese', status: 'beta' },
  'nb-NO': { name: 'Norwegian', status: 'beta' },
  'pl-PL': { name: 'Polish', status: 'beta' },
  'ru-RU': { name: 'Russian', status: 'beta' },
  'sv-SE': { name: 'Swedish', status: 'beta' },
  'tr-TR': { name: 'Turkish', status: 'beta' },
  'uk-UA': { name: 'Ukrainian', status: 'beta' },
  'vi-VN': { name: 'Vietnamese', status: 'beta' }
};

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        languages: SUPPORTED_LANGUAGES,
        fully_supported: Object.entries(SUPPORTED_LANGUAGES)
          .filter(([_, lang]) => lang.status === 'fully_supported')
          .reduce((acc, [code, lang]) => ({ ...acc, [code]: lang }), {}),
        beta: Object.entries(SUPPORTED_LANGUAGES)
          .filter(([_, lang]) => lang.status === 'beta')
          .reduce((acc, [code, lang]) => ({ ...acc, [code]: lang }), {}),
        note: "Voice cloning has no language limitations. Speechify can produce high-quality cloned voices and use the same voice to synthesize speech in any supported language."
      }
    });
  } catch (error) {
    console.error('Error fetching supported languages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supported languages' },
      { status: 500 }
    );
  }
} 