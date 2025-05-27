'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Upload } from 'lucide-react';
import { useTranslation } from '@/providers/language-provider';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob, audioUrl: string) => void;
  minDuration?: number; // 最小录音时长（秒）
}

export function AudioRecorder({ onRecordingComplete, minDuration = 3 }: AudioRecorderProps) {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();
  const durationIntervalRef = useRef<NodeJS.Timeout>();

  // 初始化音频上下文和分析器
  const initializeAudioAnalyzer = (stream: MediaStream) => {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;

    // 开始音频级别监控
    const monitorAudioLevel = () => {
      if (!analyserRef.current) return;
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // 计算音频级别
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      setAudioLevel(average / 255);
      
      if (isRecording) {
        animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);
      }
    };
    
    monitorAudioLevel();
  };

  // 开始录音
  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });
      
      streamRef.current = stream;
      initializeAudioAnalyzer(stream);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        
        if (duration >= minDuration) {
          onRecordingComplete(blob, url);
        }
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      
      // 开始计时
      durationIntervalRef.current = setInterval(() => {
        setDuration(prev => prev + 0.1);
      }, 100);
      
    } catch (err) {
      setError('无法访问麦克风，请确保已授予权限');
      console.error('Error accessing microphone:', err);
    }
  };

  // 停止录音
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // 停止音频流
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // 清理定时器和动画帧
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      setAudioLevel(0);
    }
  };

  // 播放录音
  const playRecording = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // 暂停播放
  const pausePlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // 删除录音
  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setAudioBlob(null);
    setDuration(0);
    setIsPlaying(false);
  };

  // 生成音频波形可视化
  const generateWaveform = () => {
    const bars = [];
    for (let i = 0; i < 20; i++) {
      const height = isRecording 
        ? Math.max(2, audioLevel * 20 + Math.random() * 5)
        : 2 + Math.random() * 2;
      
      bars.push(
        <div
          key={i}
          className={`waveform-bar bg-primary rounded-full ${isRecording ? 'opacity-80' : 'opacity-30'}`}
          style={{
            width: '3px',
            height: `${height}px`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      );
    }
    return bars;
  };

  // 清理资源
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* 录音状态显示 */}
      <div className="text-center mb-6">
        <div className="text-2xl font-bold mb-2">
          {formatDuration(duration)}
        </div>
        {duration > 0 && duration < minDuration && (
          <div className="text-sm text-muted-foreground">
            至少需要录制 {minDuration} 秒
          </div>
        )}
        {duration >= minDuration && (
          <div className="text-sm text-green-600">
            ✓ 录音时长符合要求
          </div>
        )}
      </div>

      {/* 音频波形可视化 */}
      <div className="flex items-end justify-center gap-1 h-16 mb-6">
        {generateWaveform()}
      </div>

      {/* 控制按钮 */}
      <div className="flex justify-center gap-4 mb-4">
        {!isRecording && !audioUrl && (
          <button
            onClick={startRecording}
            className="btn-primary flex items-center gap-2"
          >
            <Mic className="h-5 w-5" />
            开始录音
          </button>
        )}

        {isRecording && (
          <button
            onClick={stopRecording}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 recording-pulse"
          >
            <Square className="h-5 w-5" />
            停止录音
          </button>
        )}

        {audioUrl && !isRecording && (
          <>
            <button
              onClick={isPlaying ? pausePlayback : playRecording}
              className="btn-secondary flex items-center gap-2"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              {isPlaying ? '暂停' : '播放'}
            </button>
            
            <button
              onClick={deleteRecording}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
            >
              <Trash2 className="h-5 w-5" />
              删除
            </button>
            
            {duration >= minDuration && (
              <button
                onClick={() => audioBlob && onRecordingComplete(audioBlob, audioUrl)}
                className="btn-primary flex items-center gap-2"
              >
                <Upload className="h-5 w-5" />
                使用录音
              </button>
            )}
          </>
        )}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="text-sm text-red-600 text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* 隐藏的音频元素 */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}
    </div>
  );
} 