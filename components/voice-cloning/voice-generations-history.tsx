'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, Download, Trash2, Calendar, Clock, Volume2 } from 'lucide-react';
import { useTranslation } from '@/providers/language-provider';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/toast';

interface VoiceGenerationRecord {
  id: number;
  vmId: string;
  userId: string;
  speechMarks?: any;
  billableCharactersCount: number;
  audioFormat: string;
  audioUrl: string;
  inputText: string;
  model: string;
  options?: any;
  createdAt: string;
  updatedAt: string;
  voiceModel?: {
    displayName: string;
    avatarImage: string | null;
    gender: string;
  };
}

export function VoiceGenerationsHistory() {
  const { t } = useTranslation();
  const { showConfirm, ConfirmDialog } = useConfirmDialog();
  const { showToast, Toast } = useToast();
  const [voiceGenerations, setVoiceGenerations] = useState<VoiceGenerationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  // 获取语音生成历史
  useEffect(() => {
    const loadVoiceGenerations = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/voice/generations');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setVoiceGenerations(result.data || []);
          }
        }
      } catch (error) {
        console.error('Failed to load voice generations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVoiceGenerations();
  }, []);

  // 清理音频资源
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
      }
    };
  }, [currentAudio]);

  // 播放音频
  const playAudio = (id: string, audioUrl: string) => {
    if (playingId === id) {
      // 暂停当前播放的音频
      if (currentAudio) {
        currentAudio.pause();
        setPlayingId(null);
        setCurrentAudio(null);
      }
    } else {
      // 停止之前的音频
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
      }

      // 创建新的音频实例
      const audio = new Audio(audioUrl);
      
      // 设置音频事件监听器
      audio.onloadstart = () => {
        setPlayingId(id);
        setCurrentAudio(audio);
      };
      
      audio.onended = () => {
        setPlayingId(null);
        setCurrentAudio(null);
      };
      
      audio.onerror = () => {
        console.error('Audio playback error');
        setPlayingId(null);
        setCurrentAudio(null);
      };

      // 开始播放
      audio.play().catch((error) => {
        console.error('Failed to play audio:', error);
        setPlayingId(null);
        setCurrentAudio(null);
      });
    }
  };

  // 下载音频
  const downloadAudio = async (record: VoiceGenerationRecord) => {
    try {
      // 显示下载开始提示
      showToast({
        title: t('components.voiceGenerations.downloadStart'),
        description: t('components.voiceGenerations.downloadStartDescription'),
        type: 'info',
        duration: 2000
      });

      // 获取音频文件
      const response = await fetch(record.audioUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch audio file');
      }
      
      // 转换为 Blob
      const blob = await response.blob();
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // 生成文件名
      const fileName = `voice-${record.id}-${Date.now()}.${record.audioFormat}`;
      link.download = fileName;
      
      // 设置额外属性确保强制下载
      link.setAttribute('download', fileName);
      link.style.display = 'none';
      
      // 添加到 DOM，点击，然后移除
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 清理 URL 对象
      window.URL.revokeObjectURL(url);
      
      // 显示成功提示
      showToast({
        title: t('components.voiceGenerations.downloadSuccess'),
        description: t('components.voiceGenerations.downloadSuccessDescription'),
        type: 'success',
        duration: 2000
      });
    } catch (error) {
      console.error('Download failed:', error);
      showToast({
        title: t('components.voiceGenerations.downloadFailed'),
        description: t('components.voiceGenerations.downloadFailedDescription'),
        type: 'error'
      });
    }
  };

  // 删除语音生成记录
  const deleteGeneration = async (id: number, inputText: string) => {
    const previewText = inputText.length > 50 ? inputText.substring(0, 50) + '...' : inputText;
    
    showConfirm({
      title: t('components.voiceGenerations.deleteConfirmTitle'),
      description: t('components.voiceGenerations.deleteConfirmDescription').replace('{previewText}', previewText),
      confirmText: t('components.voiceGenerations.delete'),
      cancelText: t('components.voiceGenerations.cancel'),
      type: 'danger',
      icon: <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />,
      onConfirm: async () => {
        try {
          const response = await fetch('/api/voice/generations', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ voiceId: id }),
          });

          const result = await response.json();

          if (response.ok && result.success) {
            setVoiceGenerations(prev => prev.filter(record => record.id !== id));
            // 显示成功提示
            showToast({
              title: t('components.voiceGenerations.deleteSuccess'),
              description: t('components.voiceGenerations.deleteSuccessDescription'),
              type: 'success'
            });
          } else {
            showToast({
              title: t('components.voiceGenerations.deleteFailed'),
              description: result.error || t('components.voiceGenerations.deleteFailedDescription'),
              type: 'error'
            });
          }
        } catch (error) {
          console.error('Failed to delete voice generation:', error);
          showToast({
            title: t('components.voiceGenerations.deleteFailed'),
            description: t('components.voiceGenerations.networkError'),
            type: 'error'
          });
        }
      }
    });
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        return t('components.voiceGenerations.dateFormatting.invalidDate');
      }
      
      const now = new Date();
      
      // 获取本地日期（忽略时间部分）
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // 计算天数差异
      const diffMs = nowOnly.getTime() - dateOnly.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return t('components.voiceGenerations.dateFormatting.today');
      } else if (diffDays === 1) {
        return t('components.voiceGenerations.dateFormatting.yesterday');
      } else if (diffDays < 7) {
        return t('components.voiceGenerations.dateFormatting.daysAgo').replace('{days}', diffDays.toString());
      } else {
        return date.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    } catch (error) {
      console.error('Date formatting error:', error);
      return t('components.voiceGenerations.dateFormatting.formatError');
    }
  };

  // 计算音频时长（基于字符数的估算）
  const estimateDuration = (text: string) => {
    // 假设每分钟约150个字符
    const minutes = Math.ceil(text.length / 150);
    return minutes > 0 ? t('components.voiceGenerations.estimatedDuration.minutes').replace('{minutes}', minutes.toString()) : t('components.voiceGenerations.estimatedDuration.lessThanMinute');
  };

  const LoadingSkeleton = ({ count = 5 }: { count?: number }) => (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-6 animate-pulse">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-muted"></div>
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-4 bg-muted rounded w-12"></div>
              </div>
              <div className="h-4 bg-muted rounded w-full mb-2"></div>
              <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
              <div className="flex gap-4">
                <div className="h-3 bg-muted rounded w-16"></div>
                <div className="h-3 bg-muted rounded w-20"></div>
                <div className="h-3 bg-muted rounded w-16"></div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-16 h-8 bg-muted rounded"></div>
              <div className="w-16 h-8 bg-muted rounded"></div>
              <div className="w-8 h-8 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // 计算统计数据
  const totalCharacters = voiceGenerations.reduce((sum, record) => sum + record.billableCharactersCount, 0);
  const totalGenerations = voiceGenerations.length;
  const uniqueModels = new Set(voiceGenerations.map(record => record.vmId)).size;

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-6 text-center">
          <div className="text-3xl font-bold text-primary mb-2">
            {totalGenerations}
          </div>
          <div className="text-sm text-muted-foreground">{t('components.voiceGenerations.totalGenerations')}</div>
        </div>
        <div className="glass-card p-6 text-center">
          <div className="text-3xl font-bold text-primary mb-2">
            {totalCharacters.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">{t('components.voiceGenerations.totalCharacters')}</div>
        </div>
        <div className="glass-card p-6 text-center">
          <div className="text-3xl font-bold text-primary mb-2">
            {uniqueModels}
          </div>
          <div className="text-sm text-muted-foreground">{t('components.voiceGenerations.modelsUsed')}</div>
        </div>
      </div>

      {/* 生成历史列表 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">{t('components.voiceGenerations.generationRecords')}</h3>
        <div className="text-sm text-muted-foreground">
          {voiceGenerations.length} {t('components.voiceGenerations.recordsCount')}
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : voiceGenerations.length === 0 ? (
        <div className="text-center py-16">
          <Volume2 className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
          <h3 className="text-xl font-medium mb-3">{t('components.voiceGenerations.noRecords')}</h3>
          <p className="text-muted-foreground mb-6">
            {t('components.voiceGenerations.noRecordsDescription')}
          </p>
          <button className="btn-primary">
            {t('components.voiceGenerations.startGeneration')}
          </button>
        </div>
      ) : (
        <div className="space-y-4 pb-4">
          {voiceGenerations.map(record => (
            <div key={record.id} className="glass-card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* 模型信息 */}
                  <div className="flex items-center gap-2 mb-3">
                    {record.voiceModel?.avatarImage && (
                      <img
                        src={record.voiceModel.avatarImage}
                        alt={record.voiceModel.displayName}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <span className="text-sm font-medium text-muted-foreground">
                      {record.voiceModel?.displayName || t('components.voiceGenerations.unknownModel')}
                    </span>
                    <span className="text-xs px-2 py-1 bg-muted rounded-full">
                      {record.voiceModel?.gender === 'male' ? t('components.voiceGenerations.male') : t('components.voiceGenerations.female')}
                    </span>
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                      {record.model}
                    </span>
                  </div>
                  
                  {/* 文本内容 */}
                  <p className="text-foreground mb-4 line-clamp-3 leading-relaxed">
                    {record.inputText}
                  </p>
                  
                  {/* 元数据 */}
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(record.createdAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {estimateDuration(record.inputText)}
                    </div>
                    <div>
                      {t('components.voiceGenerations.charactersCount')}: {record.billableCharactersCount}
                    </div>
                    <div>
                      {t('components.voiceGenerations.format')}: {record.audioFormat.toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => playAudio(record.id.toString(), record.audioUrl)}
                    className="btn-secondary flex items-center gap-1 text-sm min-w-[80px] justify-center"
                  >
                    {playingId === record.id.toString() ? (
                      <>
                        <Pause className="h-4 w-4" />
                        {t('components.voiceGenerations.pause')}
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        {t('components.voiceGenerations.play')}
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => downloadAudio(record)}
                    className="btn-secondary flex items-center gap-1 text-sm"
                    title={t('components.voiceGenerations.download')}
                  >
                    <Download className="h-4 w-4" />
                    {t('components.voiceGenerations.download')}
                  </button>
                  
                  <button
                    onClick={() => deleteGeneration(record.id, record.inputText)}
                    className="text-red-500 hover:text-red-700 p-2 rounded transition-colors"
                    title={t('components.voiceGenerations.deleteRecord')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 确认对话框 */}
      <ConfirmDialog />
      
      {/* 提示消息 */}
      <Toast />
    </div>
  );
} 