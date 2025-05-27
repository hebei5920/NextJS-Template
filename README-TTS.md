# Speechify 文本转语音集成

本项目已成功集成 Speechify 的文本转语音 API，提供高质量的语音合成服务。

## 功能特性

### 支持的参数

1. **input** (必填)
   - 类型：字符串
   - 限制：1-5000 字符
   - 描述：要转换为语音的文本内容

2. **voice_id** (必填)
   - 类型：字符串
   - 描述：语音模型的唯一标识符

3. **audio_format** (可选)
   - 类型：枚举值
   - 默认值：wav
   - 可选值：wav, mp3, ogg, aac
   - 描述：输出音频的格式

4. **model** (可选)
   - 类型：枚举值
   - 默认值：simba-english
   - 可选值：
     - `simba-english`: 英语专用模型
     - `simba-multilingual`: 多语言模型
   - 描述：用于语音合成的 AI 模型

5. **options** (可选)
   - 类型：对象
   - 包含以下子选项：
     - `loudness_normalization` (布尔值): 是否将音频音量标准化到统一水平
     - `text_normalization` (布尔值): 是否标准化文本（将数字、日期等转换为文字形式）

## API 端点

### POST /api/voice
文本转语音生成

**请求体示例：**
```json
{
  "input": "Hello, this is a test message.",
  "voice_id": "your-voice-model-id",
  "audio_format": "mp3",
  "model": "simba-english",
  "options": {
    "loudness_normalization": true,
    "text_normalization": true
  }
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "Speech generated successfully",
  "data": {
    "input": "Hello, this is a test message.",
    "audioUrl": "data:audio/mp3;base64,...",
    "voiceId": "your-voice-model-id",
    "audioFormat": "mp3",
    "billableCharacters": 28,
    "model": "simba-english",
    "options": {
      "loudness_normalization": true,
      "text_normalization": true
    },
    "speechMarks": {...},
    "generatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### GET /api/voice
获取用户的语音模型列表

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "id": "model-id-1",
      "name": "My Voice Model",
      "created_at": "2024-01-01T12:00:00.000Z",
      ...
    }
  ]
}
```

## 前端组件

### TextToSpeech 组件

位置：`components/voice-cloning/text-to-speech.tsx`

**主要功能：**
- 文本输入（支持最多 5000 字符）
- 音频格式选择（WAV, MP3, OGG, AAC）
- 模型选择（Simba English, Simba Multilingual）
- 高级选项配置（音量标准化、文本标准化）
- 实时进度显示
- 音频播放和下载
- 详细的生成结果展示

**使用示例：**
```tsx
import { TextToSpeech } from '@/components/voice-cloning/text-to-speech';

function MyComponent() {
  const handleGenerate = (text: string, audioUrl: string) => {
    console.log('Generated audio:', audioUrl);
  };

  return (
    <TextToSpeech 
      voiceModel={{ id: 'your-voice-model-id' }}
      onGenerate={handleGenerate}
    />
  );
}
```

## 环境配置

确保在 `.env.local` 文件中设置以下环境变量：

```env
SPEECHIFY_KEY=your_speechify_api_token
```

## 数据库集成

系统会自动记录 TTS 使用历史到 `tts_usage` 表，包含以下信息：
- 用户 ID
- 语音模型 ID
- 输入文本
- 字符数统计
- 计费字符数
- 音频格式
- 使用的模型
- 选项配置
- 创建时间

## 错误处理

API 提供完整的错误处理机制：
- 输入验证错误（400）
- 身份验证错误（401）
- Speechify API 错误（转发原始状态码）
- 服务器内部错误（500）

## 技术实现

1. **API 集成**：直接调用 Speechify 的 `/v1/audio/speech` 端点
2. **音频处理**：接收 Base64 编码的音频数据并转换为可播放的 Data URL
3. **类型安全**：使用 TypeScript 接口确保类型安全
4. **用户体验**：提供实时进度反馈和详细的结果展示
5. **数据持久化**：集成 Supabase 进行使用历史记录

## 注意事项

- 文本长度限制为 5000 字符
- 需要有效的 Speechify API 令牌
- 用户必须先创建语音模型才能使用 TTS 功能
- 生成的音频以 Base64 格式返回，适合直接在浏览器中播放
- 启用文本标准化可能会增加处理延迟 