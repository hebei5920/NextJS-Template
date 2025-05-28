'use client';

import { useState, useRef } from 'react';
import { Volume2, Play, Pause, Download, Loader2, Type, Settings, ChevronDown, ChevronUp, Globe } from 'lucide-react';
import { useTranslation } from '@/providers/language-provider';

interface TextToSpeechProps {
  voiceModel?: any; // Speechify语音模型对象
  onGenerate?: (text: string, audioUrl: string) => void;
}

interface TTSOptions {
  loudness_normalization?: boolean;
  text_normalization?: boolean;
}

interface GenerationResult {
  input: string;
  audioUrl: string;
  voiceId: string;
  audioFormat: string;
  billableCharacters: number;
  model: string;
  options: TTSOptions;
  speechMarks?: any;
  generatedAt: string;
}

// Speechify支持的语言列表
const SUPPORTED_LANGUAGES = {
  // 完全支持的语言
  'en': 'English',
  'fr-FR': 'French',
  'de-DE': 'German', 
  'es-ES': 'Spanish',
  'pt-BR': 'Portuguese (Brazil)',
  'pt-PT': 'Portuguese (Portugal)',
  
  // Beta语言
  'ar-AE': 'Arabic',
  'da-DK': 'Danish',
  'nl-NL': 'Dutch',
  'et-EE': 'Estonian',
  'fi-FI': 'Finnish',
  'el-GR': 'Greek',
  'he-IL': 'Hebrew',
  'hi-IN': 'Hindi',
  'it-IT': 'Italian',
  'ja-JP': 'Japanese',
  'nb-NO': 'Norwegian',
  'pl-PL': 'Polish',
  'ru-RU': 'Russian',
  'sv-SE': 'Swedish',
  'tr-TR': 'Turkish',
  'uk-UA': 'Ukrainian',
  'vi-VN': 'Vietnamese'
};

export function TextToSpeech({ voiceModel, onGenerate }: TextToSpeechProps) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);

  // TTS 参数
  const [audioFormat, setAudioFormat] = useState<'wav' | 'mp3' | 'ogg' | 'aac'>('wav');
  const [model, setModel] = useState<'simba-english' | 'simba-multilingual'>('simba-multilingual');
  const [language, setLanguage] = useState<string>(''); // 空字符串表示自动检测
  const [options, setOptions] = useState<TTSOptions>({
    loudness_normalization: true,
    text_normalization: true
  });

  const audioRef = useRef<HTMLAudioElement>(null);

  // 示例文本
  const exampleTexts = [
    'Hello, this is a voice cloning test.',
    'Artificial intelligence technology is developing rapidly, bringing great changes to our lives.',
    'The weather is nice today, perfect for a walk.',
    'Thank you for using our voice cloning service.',
  ];

  // 生成语音
  const generateSpeech = async () => {
    if (!text.trim()) {
      setError(t('components.textToSpeech.enterText'));
      return;
    }

    if (!voiceModel?.id) {
      setError(t('components.textToSpeech.modelNotReady'));
      return;
    }

    setIsGenerating(true);
    setError(null);
    setProgress(0);
    setGenerationResult(null);

    try {
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // 构建请求体
      const requestBody: any = {
        input: text,
        voice_id: voiceModel.id,
        audio_format: audioFormat,
        model: model,
        options: options
      };

      // 如果选择了特定语言，添加到请求中
      if (language) {
        requestBody.language = language;
      }

      // 调用 Speechify 文本转语音 API
      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('components.textToSpeech.serverError'));
      }

      const result = await response.json();

      if (result.success && result.data) {
        setGeneratedAudioUrl(result.data.audioUrl);
        setGenerationResult(result.data);
        onGenerate?.(text, result.data.audioUrl);
      } else {
        throw new Error(result.message || t('components.textToSpeech.generationFailed'));
      }

    } catch (err) {
      console.error('Speech generation error:', err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('components.textToSpeech.generationError'));
      }
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  // 播放生成的音频
  const playGeneratedAudio = () => {
    if (generatedAudioUrl && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // 暂停播放
  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // 下载音频
  const downloadAudio = () => {
    if (generatedAudioUrl && generationResult) {
      const a = document.createElement('a');
      a.href = generatedAudioUrl;
      a.download = `voice-clone-${Date.now()}.${generationResult.audioFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* 文本输入区域 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Type className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">{t('components.textToSpeech.inputText')}</h3>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('components.textToSpeech.placeholder')}
          className="w-full h-32 p-4 border border-border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
          maxLength={5000}
        />

        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>{t('components.textToSpeech.charactersCount').replace('{count}', text.length.toString())}</span>
          {!voiceModel && (
            <span className="text-amber-600">{t('components.textToSpeech.createModelFirst')}</span>
          )}
        </div>
      </div>

      {/* 示例文本 */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">{t('components.textToSpeech.quickSelect')}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {exampleTexts.map((example, index) => (
            <button
              key={index}
              onClick={() => setText(example)}
              className="text-left p-3 text-sm border border-border rounded-lg hover:bg-accent transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* TTS 参数设置 */}
      <div className="border border-border rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <h4 className="font-semibold">{t('components.textToSpeech.parameters')}</h4>
        </div>

        {/* 基础参数 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 音频格式 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('components.textToSpeech.audioFormat')}</label>
            <select
              value={audioFormat}
              onChange={(e) => setAudioFormat(e.target.value as any)}
              className="w-full p-2 border border-border rounded-lg bg-background"
            >
              <option value="wav">WAV</option>
              <option value="mp3">MP3</option>
              <option value="ogg">OGG</option>
              <option value="aac">AAC</option>
            </select>
          </div>

          {/* 模型选择 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('components.textToSpeech.model')}</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as any)}
              className="w-full p-2 border border-border rounded-lg bg-background"
            >
              <option value="simba-english">Simba English</option>
              <option value="simba-multilingual">Simba Multilingual</option>
            </select>
          </div>

          {/* 语言选择 */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {t('components.textToSpeech.language')}
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-2 border border-border rounded-lg bg-background"
            >
              <option value="">{t('components.textToSpeech.autoDetect')}</option>
              <optgroup label={t('components.voiceCloning.languageOptions.fullSupport')}>
                <option value="en">English</option>
                <option value="fr-FR">French</option>
                <option value="de-DE">German</option>
                <option value="es-ES">Spanish</option>
                <option value="pt-BR">Portuguese (Brazil)</option>
                <option value="pt-PT">Portuguese (Portugal)</option>
              </optgroup>
              <optgroup label={t('components.voiceCloning.languageOptions.beta')}>
                <option value="ar-AE">Arabic</option>
                <option value="da-DK">Danish</option>
                <option value="nl-NL">Dutch</option>
                <option value="et-EE">Estonian</option>
                <option value="fi-FI">Finnish</option>
                <option value="el-GR">Greek</option>
                <option value="he-IL">Hebrew</option>
                <option value="hi-IN">Hindi</option>
                <option value="it-IT">Italian</option>
                <option value="ja-JP">Japanese</option>
                <option value="nb-NO">Norwegian</option>
                <option value="pl-PL">Polish</option>
                <option value="ru-RU">Russian</option>
                <option value="sv-SE">Swedish</option>
                <option value="tr-TR">Turkish</option>
                <option value="uk-UA">Ukrainian</option>
                <option value="vi-VN">Vietnamese</option>
              </optgroup>
            </select>
            <p className="text-xs text-muted-foreground">
              {t('components.textToSpeech.languageHelper')}
            </p>
          </div>
        </div>

        {/* 高级选项 */}
        <div className="space-y-3">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {t('components.textToSpeech.advancedOptions')}
          </button>

          {showAdvanced && (
            <div className="space-y-3 pl-4 border-l-2 border-primary/20">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="loudness_normalization"
                  checked={options.loudness_normalization || false}
                  onChange={(e) => setOptions(prev => ({
                    ...prev,
                    loudness_normalization: e.target.checked
                  }))}
                  className="rounded"
                />
                <label htmlFor="loudness_normalization" className="text-sm">
                  <span className="font-medium">{t('components.textToSpeech.loudnessNormalization')}</span>
                  <p className="text-muted-foreground text-xs">{t('components.textToSpeech.loudnessHelper')}</p>
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="text_normalization"
                  checked={options.text_normalization || false}
                  onChange={(e) => setOptions(prev => ({
                    ...prev,
                    text_normalization: e.target.checked
                  }))}
                  className="rounded"
                />
                <label htmlFor="text_normalization" className="text-sm">
                  <span className="font-medium">{t('components.textToSpeech.textNormalization')}</span>
                  <p className="text-muted-foreground text-xs">{t('components.textToSpeech.textHelper')}</p>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 生成按钮 */}
      <div className="flex justify-center">
        <button
          onClick={generateSpeech}
          disabled={isGenerating || !text.trim() || !voiceModel}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[200px] justify-center"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {t('components.textToSpeech.generating')}
            </>
          ) : (
            <>
              <Volume2 className="h-5 w-5" />
              {t('components.textToSpeech.generateSpeech')}
            </>
          )}
        </button>
      </div>

      {/* 进度条 */}
      {isGenerating && (
        <div className="space-y-2">
          <div className="progress-bar h-2">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-center text-sm text-muted-foreground">
            {t('components.textToSpeech.generatingProgress').replace('{progress}', progress.toString())}
          </div>
        </div>
      )}

      {/* 生成结果 */}
      {generatedAudioUrl && generationResult && (
        <div className="border border-border rounded-lg p-6 bg-card">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-primary" />
            {t('components.textToSpeech.generatedVoice')}
          </h4>

          <div className="space-y-4">
            {/* 文本预览 */}
            <div className="bg-muted/30 p-3 rounded-lg text-sm">
              {generationResult.input}
            </div>

            {/* 生成信息 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">{t('components.textToSpeech.format')}:</span>
                <span className="ml-1 font-medium">{generationResult.audioFormat.toUpperCase()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t('components.textToSpeech.characters')}:</span>
                <span className="ml-1 font-medium">{generationResult.billableCharacters}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t('components.textToSpeech.model')}:</span>
                <span className="ml-1 font-medium">{generationResult.model}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t('components.textToSpeech.generationTime')}:</span>
                <span className="ml-1 font-medium">
                  {new Date(generationResult.generatedAt).toLocaleTimeString()}
                </span>
              </div>
            </div>

            {/* 选项信息 */}
            {generationResult.options && Object.keys(generationResult.options).length > 0 && (
              <div className="text-sm">
                <span className="text-muted-foreground">{t('components.textToSpeech.options')}:</span>
                <div className="ml-2 mt-1 space-y-1">
                  {generationResult.options.loudness_normalization && (
                    <div className="text-green-600">{t('components.textToSpeech.optionEnabled').replace('{option}', t('components.textToSpeech.loudnessNormalization'))}</div>
                  )}
                  {generationResult.options.text_normalization && (
                    <div className="text-green-600">{t('components.textToSpeech.optionEnabled').replace('{option}', t('components.textToSpeech.textNormalization'))}</div>
                  )}
                </div>
              </div>
            )}

            {/* 播放控制 */}
            <div className="flex items-center gap-4">
              <button
                onClick={isPlaying ? pauseAudio : playGeneratedAudio}
                className="btn-secondary flex items-center gap-2"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? t('components.textToSpeech.pause') : t('components.textToSpeech.play')}
              </button>

              <button
                onClick={downloadAudio}
                className="btn-secondary flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {t('components.textToSpeech.download')}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="text-sm text-red-600 text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* 隐藏的音频元素 */}
      {generatedAudioUrl && (
        <audio
          ref={audioRef}
          src={generatedAudioUrl}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />
      )}
    </div>
  );
} 