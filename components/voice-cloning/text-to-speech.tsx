'use client';

import { useState, useRef } from 'react';
import { Volume2, Play, Pause, Download, Loader2, Type } from 'lucide-react';
import { useTranslation } from '@/providers/language-provider';

interface TextToSpeechProps {
  voiceUrl?: string; // 用户上传的音色文件URL
  onGenerate?: (text: string, audioUrl: string) => void;
}

export function TextToSpeech({ voiceUrl, onGenerate }: TextToSpeechProps) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);

  // 示例文本
  const exampleTexts = [
    '你好，这是一个语音克隆测试。',
    '人工智能技术正在快速发展，为我们的生活带来了巨大的变化。',
    '今天天气很好，适合出门散步。',
    '感谢您使用我们的语音克隆服务。',
  ];

  // 生成语音
  const generateSpeech = async () => {
    if (!text.trim()) {
      setError('请输入要转换的文本');
      return;
    }

    if (!voiceUrl) {
      setError('请先录制或上传音色文件');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setProgress(0);

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

      // 调用语音生成API
      const response = await fetch('/api/generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voiceUrl,
        }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '服务器错误');
      }

      const result = await response.json();

      if (result.success) {
        // 如果API返回了真实的音频URL，使用它；否则生成模拟音频
        let audioUrl = result.data?.audioUrl;
        
        if (!audioUrl || audioUrl.startsWith('data:audio/wav;base64,')) {
          // 如果是模拟数据或空数据，使用Web Speech API生成演示音频
          audioUrl = await generateMockAudio(text);
        }
        
        setGeneratedAudioUrl(audioUrl);
        onGenerate?.(text, audioUrl);
      } else {
        throw new Error(result.message || '语音生成失败');
      }
      
    } catch (err) {
      console.error('Speech generation error:', err);
      
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('生成语音时出错，请稍后重试');
      }
      
      // 如果API调用失败，尝试使用本地Web Speech API作为后备
      try {
        const fallbackAudio = await generateMockAudio(text);
        setGeneratedAudioUrl(fallbackAudio);
        onGenerate?.(text, fallbackAudio);
        setError('使用本地语音合成引擎生成（演示模式）');
      } catch (fallbackError) {
        console.error('Fallback audio generation failed:', fallbackError);
      }
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  // 模拟音频生成（使用Web Speech API作为演示）
  const generateMockAudio = async (inputText: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(inputText);
        utterance.lang = 'zh-CN';
        utterance.rate = 1;
        utterance.pitch = 1;
        
        // 创建一个音频上下文来录制合成的语音
        const audioContext = new AudioContext();
        const destination = audioContext.createMediaStreamDestination();
        const mediaRecorder = new MediaRecorder(destination.stream);
        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (event) => {
          chunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          resolve(url);
        };

        utterance.onstart = () => {
          mediaRecorder.start();
        };

        utterance.onend = () => {
          setTimeout(() => {
            mediaRecorder.stop();
          }, 100);
        };

        speechSynthesis.speak(utterance);
      } else {
        // 如果不支持语音合成，返回一个空的音频URL
        const canvas = document.createElement('canvas');
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            reject(new Error('无法生成音频'));
          }
        });
      }
    });
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
    if (generatedAudioUrl) {
      const a = document.createElement('a');
      a.href = generatedAudioUrl;
      a.download = `voice-clone-${Date.now()}.webm`;
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
          <h3 className="text-lg font-semibold">输入要转换的文本</h3>
        </div>
        
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="请输入您想要转换为语音的文本..."
          className="w-full h-32 p-4 border border-border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
          maxLength={500}
        />
        
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>{text.length}/500 字符</span>
          {!voiceUrl && (
            <span className="text-amber-600">⚠️ 请先录制或上传音色文件</span>
          )}
        </div>
      </div>

      {/* 示例文本 */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">快速选择示例文本：</h4>
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

      {/* 生成按钮 */}
      <div className="flex justify-center">
        <button
          onClick={generateSpeech}
          disabled={isGenerating || !text.trim() || !voiceUrl}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[200px] justify-center"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <Volume2 className="h-5 w-5" />
              生成语音
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
            正在生成语音... {progress}%
          </div>
        </div>
      )}

      {/* 生成结果 */}
      {generatedAudioUrl && (
        <div className="border border-border rounded-lg p-6 bg-card">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-primary" />
            生成的语音
          </h4>
          
          <div className="space-y-4">
            {/* 文本预览 */}
            <div className="bg-muted/30 p-3 rounded-lg text-sm">
              {text}
            </div>
            
            {/* 播放控制 */}
            <div className="flex items-center gap-4">
              <button
                onClick={isPlaying ? pauseAudio : playGeneratedAudio}
                className="btn-secondary flex items-center gap-2"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? '暂停' : '播放'}
              </button>
              
              <button
                onClick={downloadAudio}
                className="btn-secondary flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                下载
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