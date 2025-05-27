'use client';

import { useState } from 'react';
import { Mic, Upload, Type, Sparkles, ArrowRight } from 'lucide-react';
import { AudioRecorder } from './audio-recorder';
import { FileUploader } from './file-uploader';
import { TextToSpeech } from './text-to-speech';
import { useTranslation } from '@/providers/language-provider';

type Step = 'input' | 'generate';
type InputMethod = 'record' | 'upload';

export function VoiceCloningStudio() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<Step>('input');
  const [inputMethod, setInputMethod] = useState<InputMethod>('record');
  const [voiceData, setVoiceData] = useState<{
    blob?: Blob;
    url?: string;
    method: InputMethod;
  } | null>(null);

  // 处理录音完成
  const handleRecordingComplete = (audioBlob: Blob, audioUrl: string) => {
    setVoiceData({
      blob: audioBlob,
      url: audioUrl,
      method: 'record'
    });
  };

  // 处理文件上传
  const handleFileUpload = (file: File, audioUrl: string) => {
    setVoiceData({
      blob: file,
      url: audioUrl,
      method: 'upload'
    });
  };

  // 进入下一步
  const proceedToGenerate = () => {
    if (voiceData) {
      setCurrentStep('generate');
    }
  };

  // 重新开始
  const resetStudio = () => {
    setCurrentStep('input');
    setVoiceData(null);
    setInputMethod('record');
  };

  // 处理语音生成
  const handleGenerate = (text: string, audioUrl: string) => {
    console.log('Generated speech:', { text, audioUrl });
    // 这里可以添加更多的处理逻辑，比如保存到历史记录等
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* 步骤指示器 */}
      <div className="flex items-center justify-center mb-12">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            currentStep === 'input' 
              ? 'bg-primary text-primary-foreground' 
              : voiceData 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-muted text-muted-foreground'
          }`}>
            <div className="w-6 h-6 rounded-full bg-current/20 flex items-center justify-center text-sm font-bold">
              1
            </div>
            <span className="font-medium">音色采集</span>
          </div>
          
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
          
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            currentStep === 'generate' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground'
          }`}>
            <div className="w-6 h-6 rounded-full bg-current/20 flex items-center justify-center text-sm font-bold">
              2
            </div>
            <span className="font-medium">语音生成</span>
          </div>
        </div>
      </div>

      {currentStep === 'input' && (
        <div className="space-y-8">
          {/* 标题和描述 */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">
              <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI 语音克隆工作室
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              通过录制或上传您的音频样本，我们的AI将学习您的声音特征，为您生成逼真的语音克隆
            </p>
          </div>

          {/* 输入方式选择 */}
          <div className="flex justify-center mb-8">
            <div className="bg-muted p-1 rounded-lg flex">
              <button
                onClick={() => setInputMethod('record')}
                className={`px-6 py-3 rounded-md font-medium transition-all flex items-center gap-2 ${
                  inputMethod === 'record'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Mic className="h-4 w-4" />
                录制音频
              </button>
              <button
                onClick={() => setInputMethod('upload')}
                className={`px-6 py-3 rounded-md font-medium transition-all flex items-center gap-2 ${
                  inputMethod === 'upload'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Upload className="h-4 w-4" />
                上传文件
              </button>
            </div>
          </div>

          {/* 输入组件 */}
          <div className="glass-card rounded-2xl p-8">
            {inputMethod === 'record' ? (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-semibold mb-2 flex items-center justify-center gap-2">
                    <Mic className="h-6 w-6 text-primary" />
                    录制您的声音
                  </h3>
                  <p className="text-muted-foreground">
                    请清晰地朗读一段文字，录音时长至少3秒，建议10-30秒以获得最佳效果
                  </p>
                </div>
                <AudioRecorder onRecordingComplete={handleRecordingComplete} />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-semibold mb-2 flex items-center justify-center gap-2">
                    <Upload className="h-6 w-6 text-primary" />
                    上传音频文件
                  </h3>
                  <p className="text-muted-foreground">
                    支持 MP3、WAV、OGG、AAC、WebM 格式，文件大小不超过50MB
                  </p>
                </div>
                <FileUploader onFileUpload={handleFileUpload} />
              </div>
            )}
          </div>

          {/* 继续按钮 */}
          {voiceData && (
            <div className="flex justify-center">
              <button
                onClick={proceedToGenerate}
                className="btn-primary flex items-center gap-2 text-lg px-8 py-4"
              >
                <Sparkles className="h-5 w-5" />
                开始生成语音
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* 提示信息 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              💡 获得最佳效果的建议：
            </h4>
            <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
              <li>• 在安静的环境中录制，避免背景噪音</li>
              <li>• 使用清晰、自然的语调，避免过快或过慢</li>
              <li>• 录制时长建议在10-30秒之间</li>
              <li>• 朗读内容应包含多种音素，如数字、标点等</li>
            </ul>
          </div>
        </div>
      )}

      {currentStep === 'generate' && (
        <div className="space-y-8">
          {/* 标题 */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
              <Type className="h-8 w-8 text-primary" />
              文本转语音
            </h2>
            <p className="text-lg text-muted-foreground">
              输入您想要转换的文本，AI将使用您的音色生成语音
            </p>
          </div>

          {/* 音色信息 */}
          <div className="glass-card rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                {voiceData?.method === 'record' ? (
                  <Mic className="h-5 w-5 text-green-600" />
                ) : (
                  <Upload className="h-5 w-5 text-green-600" />
                )}
              </div>
              <div>
                <div className="font-medium">音色已准备就绪</div>
                <div className="text-sm text-muted-foreground">
                  来源：{voiceData?.method === 'record' ? '录制' : '上传文件'}
                </div>
              </div>
            </div>
            <button
              onClick={resetStudio}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              重新选择
            </button>
          </div>

          {/* 文本转语音组件 */}
          <div className="glass-card rounded-2xl p-8">
            <TextToSpeech 
              voiceUrl={voiceData?.url} 
              onGenerate={handleGenerate}
            />
          </div>
        </div>
      )}
    </div>
  );
} 