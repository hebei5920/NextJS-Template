'use client';

import { useState, useEffect } from 'react';
import { History, Play, Pause, Download, Trash2, Calendar } from 'lucide-react';
import { useTranslation } from '@/providers/language-provider';

interface GenerationRecord {
  id: string;
  text: string;
  audioUrl: string;
  createdAt: string;
  duration?: number;
}

export function GenerationHistory() {
  const { t } = useTranslation();
  const [history, setHistory] = useState<GenerationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);

  // 模拟获取历史记录
  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟历史数据
      const mockHistory: GenerationRecord[] = [
        {
          id: '1',
          text: '欢迎使用AI语音克隆工作室',
          audioUrl: '#',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          duration: 3
        },
        {
          id: '2', 
          text: '人工智能技术正在快速发展，为我们的生活带来了巨大的变化。',
          audioUrl: '#',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          duration: 8
        },
        {
          id: '3',
          text: '今天天气很好，适合出门散步。',
          audioUrl: '#',
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          duration: 4
        }
      ];
      
      setHistory(mockHistory);
      setIsLoading(false);
    };

    loadHistory();
  }, []);

  // 播放音频
  const playAudio = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
      // 这里可以添加实际的音频播放逻辑
      setTimeout(() => setPlayingId(null), 3000); // 模拟播放结束
    }
  };

  // 下载音频
  const downloadAudio = (record: GenerationRecord) => {
    // 实际应用中这里会下载真实的音频文件
    console.log('Downloading audio:', record.id);
  };

  // 删除记录
  const deleteRecord = (id: string) => {
    setHistory(prev => prev.filter(record => record.id !== id));
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return '今天';
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  // 格式化时长
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-2xl font-bold">生成历史</h2>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-2xl font-bold">生成历史</h2>
        <span className="ml-auto text-sm text-muted-foreground">
          {history.length} 条记录
        </span>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12">
          <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">暂无生成记录</h3>
          <p className="text-muted-foreground">
            开始生成您的第一段AI语音吧！
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map(record => (
            <div key={record.id} className="glass-card p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-foreground mb-2 line-clamp-2">
                    {record.text}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(record.createdAt)}
                    </div>
                    <div>
                      时长: {formatDuration(record.duration)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => playAudio(record.id)}
                    className="btn-secondary flex items-center gap-1 text-sm"
                  >
                    {playingId === record.id ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    {playingId === record.id ? '暂停' : '播放'}
                  </button>
                  
                  <button
                    onClick={() => downloadAudio(record)}
                    className="btn-secondary flex items-center gap-1 text-sm"
                  >
                    <Download className="h-4 w-4" />
                    下载
                  </button>
                  
                  <button
                    onClick={() => deleteRecord(record.id)}
                    className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 