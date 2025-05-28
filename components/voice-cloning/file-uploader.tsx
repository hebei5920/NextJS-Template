'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, File, X, Play, Pause, CheckCircle } from 'lucide-react';
import { useTranslation } from '@/providers/language-provider';

interface FileUploaderProps {
  onFileUpload: (file: File, audioUrl: string) => void;
  minDuration?: number;
  acceptedFormats?: string[];
  maxSize?: number; // MB
}

const DEFAULT_ACCEPTED_FORMATS = [
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/aac',
  'audio/webm',
  'audio/mpeg',
  'audio/mp4',
];

export function FileUploader({ 
  onFileUpload, 
  minDuration = 3,
  acceptedFormats = DEFAULT_ACCEPTED_FORMATS,
  maxSize = 50 
}: FileUploaderProps) {
  const { t } = useTranslation();
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // 验证文件
  const validateFile = useCallback(async (file: File): Promise<{ isValid: boolean; error?: string; duration?: number }> => {
    // 检查文件类型
    if (!acceptedFormats.includes(file.type)) {
      const formats = acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ');
      return { 
        isValid: false, 
        error: t('components.fileUploader.unsupportedFormat').replace('{formats}', formats)
      };
    }

    // 检查文件大小
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      return { 
        isValid: false, 
        error: t('components.fileUploader.fileSizeExceeded').replace('{maxSize}', maxSize.toString())
      };
    }

    // 检查音频时长
    return new Promise((resolve) => {
      const audio = document.createElement('audio');
      const url = URL.createObjectURL(file);
      
      audio.onloadedmetadata = () => {
        const audioDuration = audio.duration;
        URL.revokeObjectURL(url);
        
        if (audioDuration < minDuration) {
          resolve({
            isValid: false,
            error: t('components.fileUploader.durationTooShort').replace('{minDuration}', minDuration.toString()),
            duration: audioDuration
          });
        } else {
          resolve({
            isValid: true,
            duration: audioDuration
          });
        }
      };
      
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({
          isValid: false,
          error: t('components.fileUploader.cannotParseAudio')
        });
      };
      
      audio.src = url;
    });
  }, [acceptedFormats, maxSize, minDuration, t]);

  // 处理文件选择
  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);
    setIsValidating(true);

    try {
      const validation = await validateFile(file);
      
      if (!validation.isValid) {
        setError(validation.error || t('components.fileUploader.validationFailed'));
        setIsValidating(false);
        return;
      }

      const url = URL.createObjectURL(file);
      setUploadedFile(file);
      setAudioUrl(url);
      setDuration(validation.duration || null);
      setIsValidating(false);
      
      // 自动调用回调
      onFileUpload(file, url);
      
    } catch (err) {
      setError(t('components.fileUploader.processingError'));
      setIsValidating(false);
    }
  }, [validateFile, onFileUpload, t]);

  // 拖拽处理
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  // 文件输入处理
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // 播放控制
  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  // 移除文件
  const removeFile = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setUploadedFile(null);
    setAudioUrl(null);
    setDuration(null);
    setIsPlaying(false);
    setError(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 格式化时长
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {!uploadedFile ? (
        // 上传区域
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`upload-zone cursor-pointer ${isDragOver ? 'dragover' : ''} p-8 rounded-2xl border-2 border-dashed transition-all duration-300 hover:border-primary/60 hover:bg-primary/5 glass-card`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div className="text-lg font-medium mb-2">
              {isDragOver ? t('components.fileUploader.dropToUpload') : t('components.fileUploader.uploadAudioFile')}
            </div>
            <div className="text-sm text-muted-foreground mb-6">
              {t('components.fileUploader.clickOrDragHelper')}
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-xs text-muted-foreground space-y-1">
              <div className="flex items-center justify-start gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>{t('components.fileUploader.supportedFormats')}</span>
              </div>
              <div className="flex items-center justify-start gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>{t('components.fileUploader.maxFileSize').replace('{maxSize}', maxSize.toString())}</span>
              </div>
              <div className="flex items-center justify-start gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span>{t('components.fileUploader.minDuration').replace('{minDuration}', minDuration.toString())}</span>
              </div>
            </div>
            
            {isValidating && (
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-primary">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                {t('components.fileUploader.validatingFile')}
              </div>
            )}
          </div>
        </div>
      ) : (
        // 文件预览
        <div className="glass-card border border-border rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <File className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="font-medium truncate max-w-48">
                  {uploadedFile.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatFileSize(uploadedFile.size)}
                  {duration && ` • ${formatDuration(duration)}`}
                </div>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="text-muted-foreground hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {duration && duration >= minDuration && (
            <div className="flex items-center gap-2 text-green-600 text-sm mb-4 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <CheckCircle className="h-4 w-4" />
              {t('components.fileUploader.fileValidated')}
            </div>
          )}

          {/* 播放控制 */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlayback}
              className="btn-secondary flex items-center gap-2 flex-1"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? t('components.fileUploader.pause') : t('components.fileUploader.play')}
            </button>
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="mt-4 text-sm text-red-600 text-center bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <X className="h-3 w-3 text-white" />
            </div>
            {error}
          </div>
        </div>
      )}

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* 隐藏的音频元素 */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />
      )}
    </div>
  );
} 