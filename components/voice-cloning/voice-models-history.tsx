'use client';

import { useState, useEffect } from 'react';
import { User, Calendar, Trash2, Settings, Play } from 'lucide-react';
import { useTranslation } from '@/providers/language-provider';
import { useVoiceModel } from '@/providers/voice-model-provider';
import { useRouter } from 'next/navigation';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/toast';

interface VoiceModelRecord {
  id: number;
  modelId: string;
  userId: string;
  gender: string;
  locale: string | null;
  displayName: string;
  avatarImage: string | null;
  createDate: string;
  updateDate: string;
}

export function VoiceModelsHistory() {
  const { t } = useTranslation();
  const { setSelectedVoiceModel } = useVoiceModel();
  const router = useRouter();
  const { showConfirm, ConfirmDialog } = useConfirmDialog();
  const { showToast, Toast } = useToast();
  const [voiceModels, setVoiceModels] = useState<VoiceModelRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 获取语音模型列表
  useEffect(() => {
    const loadVoiceModels = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/voice');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setVoiceModels(result.data || []);
          }
        }
      } catch (error) {
        console.error('Failed to load voice models:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVoiceModels();
  }, []);

  // 格式化日期
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        return '日期无效';
      }
      
      const now = new Date();
      
      // 获取本地日期（忽略时间部分）
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // 计算天数差异
      const diffMs = nowOnly.getTime() - dateOnly.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
       
      if (diffDays === 0) {
        return '今天';
      } else if (diffDays === 1) {
        return '昨天';
      } else if (diffDays < 7) {
        return `${diffDays}天前`;
      } else {
        return date.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    } catch (error) {
      console.error('Date formatting error:', error);
      return '日期格式错误';
    }
  };

  // 使用模型进行语音生成
  const useModel = (model: VoiceModelRecord) => {
    // 设置选中的语音模型
    setSelectedVoiceModel(model);
    // 跳转到首页
    router.push('/#studio');
  };

  // 删除模型
  const deleteModel = async (modelId: string, modelName: string) => {
    showConfirm({
      title: '删除语音模型',
      description: `确定要删除语音模型"${modelName}"吗？删除后将无法恢复。`,
      confirmText: '删除',
      cancelText: '取消',
      type: 'danger',
      icon: <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />,
      onConfirm: async () => {
        try {
          const response = await fetch('/api/voice', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ modelId }),
          });

          const result = await response.json();

          if (response.ok && result.success) {
            // 从列表中移除已删除的模型
            setVoiceModels(prev => prev.filter(model => model.modelId !== modelId));
            // 显示成功提示
            showToast({
              title: '删除成功',
              description: `语音模型"${modelName}"已成功删除`,
              type: 'success'
            });
          } else {
            showToast({
              title: '删除失败',
              description: result.error || '删除失败，请重试',
              type: 'error'
            });
          }
        } catch (error) {
          console.error('Failed to delete model:', error);
          showToast({
            title: '删除失败',
            description: '网络连接错误，请检查后重试',
            type: 'error'
          });
        }
      }
    });
  };

  const LoadingSkeleton = ({ count = 6 }: { count?: number }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-6 animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-muted"></div>
            <div className="flex-1">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </div>
          <div className="h-3 bg-muted rounded w-full mb-2"></div>
          <div className="h-3 bg-muted rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-6 text-center">
          <div className="text-3xl font-bold text-primary mb-2">
            {voiceModels.length}
          </div>
          <div className="text-sm text-muted-foreground">总模型数</div>
        </div>
        <div className="glass-card p-6 text-center">
          <div className="text-3xl font-bold text-primary mb-2">
            {voiceModels.filter(m => m.gender === 'male').length}
          </div>
          <div className="text-sm text-muted-foreground">男声模型</div>
        </div>
        <div className="glass-card p-6 text-center">
          <div className="text-3xl font-bold text-primary mb-2">
            {voiceModels.filter(m => m.gender === 'female').length}
          </div>
          <div className="text-sm text-muted-foreground">女声模型</div>
        </div>
      </div>

      {/* 模型列表 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">我的语音模型</h3>
        <div className="text-sm text-muted-foreground">
          {voiceModels.length} 个模型
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : voiceModels.length === 0 ? (
        <div className="text-center py-16">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
          <h3 className="text-xl font-medium mb-3">暂无语音模型</h3>
          <p className="text-muted-foreground mb-6">
            创建您的第一个AI语音模型，开始个性化语音生成之旅
          </p>
          <button className="btn-primary">
            创建语音模型
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {voiceModels.map(model => (
            <div key={model.id} className="glass-card p-6 hover:shadow-lg transition-shadow">
              {/* 模型头部信息 */}
              <div className="flex items-center gap-3 mb-4">
                {model.avatarImage ? (
                  <img
                    src={model.avatarImage}
                    alt={model.displayName}
                    className="w-14 h-14 rounded-full object-cover border-2 border-muted"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center border-2 border-muted">
                    <User className="h-7 w-7 text-primary" />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-lg mb-1">{model.displayName}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      model.gender === 'male' 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300'
                    }`}>
                      {model.gender === 'male' ? '男声' : '女声'}
                    </span>
                    {model.locale && (
                      <span className="text-xs px-2 py-1 bg-muted rounded-full">
                        {model.locale}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* 模型详情 */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>创建于 {formatDate(model.createDate)}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  模型ID: {model.modelId}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center gap-2 pt-4 border-t border-muted">
                <button
                  onClick={() => useModel(model)}
                  className="flex-1 btn-secondary text-sm flex items-center justify-center gap-1"
                >
                  <Play className="h-4 w-4" />
                  使用
                </button>
                <button
                  onClick={() => deleteModel(model.modelId, model.displayName)}
                  className="text-red-500 hover:text-red-700 p-2 rounded transition-colors"
                  title="删除模型"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
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