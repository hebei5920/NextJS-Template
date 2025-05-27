'use client';

import { useState } from 'react';
import { Mic, Upload, Type, Sparkles, ArrowRight, User } from 'lucide-react';
import { AudioRecorder } from './audio-recorder';
import { FileUploader } from './file-uploader';
import { TextToSpeech } from './text-to-speech';
import { useTranslation } from '@/providers/language-provider';
import { createClient } from '@/lib/supabase-client';

type Step = 'input' | 'consent' | 'generate';
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
  const [userInfo, setUserInfo] = useState<{
    fullName: string;
    gender: 'male' | 'female';
    voiceName: string;
  }>({
    fullName: '',
    gender: 'male',
    voiceName: ''
  });
  const [isCreatingVoice, setIsCreatingVoice] = useState(false);
  const [voiceCreated, setVoiceCreated] = useState<any>(null);

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

  // 进入下一步（从音频采集到同意书）
  const proceedToConsent = () => {
    if (voiceData) {
      setCurrentStep('consent');
    }
  };

  // 创建语音模型
  const createVoiceModel = async () => {
    if (!voiceData || !userInfo.fullName) {
      return;
    }

    setIsCreatingVoice(true);

    try {
      const formData = new FormData();
      formData.append('name', userInfo.fullName);
      formData.append('gender', userInfo.gender);
      formData.append('sample', voiceData.blob!);
      formData.append('fullName', userInfo.fullName);

      // 获取用户头像
      await fetchAndAppendUserAvatar(formData);

    } catch (error) {
      console.error('Error creating voice model:', error);
      setIsCreatingVoice(false);
    }
  };

  // 获取并添加用户头像到表单数据
  const fetchAndAppendUserAvatar = async (formData: FormData) => {
    try {
      // 从 Supabase 获取用户信息
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      let avatarBlob: Blob | null = null;

      if (user?.user_metadata?.user_metadata) {
        // 尝试从用户元数据获取头像
        try {
          const response = await fetch(user.user_metadata.avatar_url);
          if (response.ok) {
            avatarBlob = await response.blob();
          }
        } catch (error) {
          console.warn('Failed to fetch avatar from user metadata:', error);
        }
      }

      // 如果用户有头像URL，尝试获取
      if (!avatarBlob && user?.user_metadata?.picture) {
        try {
          const response = await fetch(user.user_metadata.picture);
          if (response.ok) {
            avatarBlob = await response.blob();
          }
        } catch (error) {
          console.warn('Failed to fetch avatar from picture URL:', error);
        }
      }

      // 检查用户的头像文件（如果通过文件上传设置）
      if (!avatarBlob) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', user?.id)
            .single();

          if (profile?.avatar_url) {
            // 如果是 Supabase Storage 的URL
            if (profile.avatar_url.includes('supabase')) {
              const response = await fetch(profile.avatar_url);
              if (response.ok) {
                avatarBlob = await response.blob();
              }
            } else {
              // 外部URL
              const response = await fetch(profile.avatar_url);
              if (response.ok) {
                avatarBlob = await response.blob();
              }
            }
          }
        } catch (error) {
          console.warn('Failed to fetch avatar from profile:', error);
        }
      }

      // 如果仍然没有头像，创建一个默认头像
      if (!avatarBlob) {
        avatarBlob = await createDefaultAvatar();
      }

      // 添加头像到表单数据
      formData.append('avatar', avatarBlob, 'avatar.jpg');
      
      // 发送请求到API
      await submitVoiceCreation(formData);

    } catch (error) {
      console.error('Error processing avatar:', error);
      // 如果头像处理失败，使用默认头像
      const defaultAvatar = await createDefaultAvatar();
      formData.append('avatar', defaultAvatar, 'avatar.png');
      await submitVoiceCreation(formData);
    }
  };

  // 创建默认头像（如果用户没有头像）
  const createDefaultAvatar = async (): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // 创建一个简单的默认头像（圆形背景 + 用户名首字母）
        const gradient = ctx.createLinearGradient(0, 0, 200, 200);
        gradient.addColorStop(0, '#3b82f6');
        gradient.addColorStop(1, '#1d4ed8');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 200, 200);
        
        // 添加用户名首字母
        ctx.fillStyle = 'white';
        ctx.font = 'bold 80px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const initial = userInfo.fullName.charAt(0).toUpperCase() || 'U';
        ctx.fillText(initial, 100, 100);
      }
      
      canvas.toBlob((blob) => {
        resolve(blob || new Blob());
      }, 'image/png');
    });
  };

  const submitVoiceCreation = async (formData: FormData) => {
    try {
      const response = await fetch('/api/voice', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setVoiceCreated(result.data);
        setCurrentStep('generate');
      } else {
        throw new Error(result.error || 'Failed to create voice');
      }
    } catch (error) {
      console.error('Voice creation failed:', error);
      alert('语音模型创建失败，请稍后重试');
    } finally {
      setIsCreatingVoice(false);
    }
  };

  // 重新开始
  const resetStudio = () => {
    setCurrentStep('input');
    setVoiceData(null);
    setInputMethod('record');
    setUserInfo({
      fullName: '',
      gender: 'male',
      voiceName: ''
    });
    setVoiceCreated(null);
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
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${currentStep === 'input'
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

          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${currentStep === 'consent'
              ? 'bg-primary text-primary-foreground'
              : voiceCreated
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-muted text-muted-foreground'
            }`}>
            <div className="w-6 h-6 rounded-full bg-current/20 flex items-center justify-center text-sm font-bold">
              2
            </div>
            <span className="font-medium">信息确认</span>
          </div>

          <ArrowRight className="h-5 w-5 text-muted-foreground" />

          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${currentStep === 'generate'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
            }`}>
            <div className="w-6 h-6 rounded-full bg-current/20 flex items-center justify-center text-sm font-bold">
              3
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
                className={`px-6 py-3 rounded-md font-medium transition-all flex items-center gap-2 ${inputMethod === 'record'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                <Mic className="h-4 w-4" />
                录制音频
              </button>
              <button
                onClick={() => setInputMethod('upload')}
                className={`px-6 py-3 rounded-md font-medium transition-all flex items-center gap-2 ${inputMethod === 'upload'
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
                onClick={proceedToConsent}
                className="btn-primary flex items-center gap-2 text-lg px-8 py-4"
              >
                <ArrowRight className="h-5 w-5" />
                下一步：填写信息
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

      {currentStep === 'consent' && (
        <div className="space-y-8">
          {/* 标题 */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
              <User className="h-8 w-8 text-primary" />
              信息确认与授权
            </h2>
            <p className="text-lg text-muted-foreground">
              请填写必要信息并确认您同意创建语音模型
            </p>
          </div>

          {/* 音色预览 */}
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
                <div className="font-medium">音频样本已就绪</div>
                <div className="text-sm text-muted-foreground">
                  来源：{voiceData?.method === 'record' ? '录制' : '上传文件'}
                </div>
              </div>
            </div>
            <button
              onClick={resetStudio}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              重新录制
            </button>
          </div>

          {/* 信息表单 */}
          <div className="glass-card rounded-2xl p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 姓名输入 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  模型名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={userInfo.fullName}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="请输入模型名称"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>


            </div>

            {/* 性别选择 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">性别</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={userInfo.gender === 'male'}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' }))}
                    className="text-primary focus:ring-primary"
                  />
                  <span>男性</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={userInfo.gender === 'female'}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' }))}
                    className="text-primary focus:ring-primary"
                  />
                  <span>女性</span>
                </label>
              </div>
            </div>

            {/* 同意条款 */}
            <div className="bg-muted/50 rounded-lg p-4 text-sm">
              <h4 className="font-semibold mb-2">授权声明</h4>
              <p className="text-muted-foreground leading-relaxed">
                我确认并同意：<br />
                1. 我拥有所提供音频的合法权利<br />
                2. 同意将此音频用于语音模型训练<br />
                3. 理解生成的语音模型可能被用于文本转语音服务<br />
                4. 我的姓名和邮箱将作为授权记录保存
              </p>
            </div>

            {/* 创建按钮 */}
            <div className="flex justify-center pt-4">
              <button
                onClick={createVoiceModel}
                disabled={!userInfo.fullName || isCreatingVoice}
                className="btn-primary flex items-center gap-2 text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingVoice ? (
                  <>
                    <Sparkles className="h-5 w-5 animate-spin" />
                    创建中...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    创建语音模型
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {currentStep === 'generate' && voiceCreated && (
        <div className="space-y-8">
          {/* 标题 */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
              <Type className="h-8 w-8 text-primary" />
              文本转语音
            </h2>
            <p className="text-lg text-muted-foreground">
              语音模型创建成功！现在您可以输入文本生成语音了
            </p>
          </div>

          {/* 语音模型信息 */}
          <div className="glass-card rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="font-medium">{userInfo.voiceName}</div>
                <div className="text-sm text-muted-foreground">
                  语音模型ID: {voiceCreated.id}
                </div>
              </div>
            </div>
            <button
              onClick={resetStudio}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              创建新模型
            </button>
          </div>

          {/* 文本转语音组件 */}
          <div className="glass-card rounded-2xl p-8">
            <TextToSpeech
              voiceModel={voiceCreated}
              onGenerate={handleGenerate}
            />
          </div>
        </div>
      )}
    </div>
  );
} 