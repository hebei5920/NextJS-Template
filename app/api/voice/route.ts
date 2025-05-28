import { createClient } from "@/lib/supabase-server";
import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createServerMediaService } from "@/service/media-service";

const prisma = new PrismaClient();

// Speechify TTS API 类型定义
interface SpeechifyTTSRequest {
    input: string;
    voice_id: string;
    audio_format?: 'wav' | 'mp3' | 'ogg' | 'aac';
    model?: 'simba-english' | 'simba-multilingual';
    language?: string;
    options?: {
        loudness_normalization?: boolean;
        text_normalization?: boolean;
    };
}

interface SpeechifyTTSResponse {
    audio_data: string;
    audio_format: 'wav' | 'mp3' | 'ogg' | 'aac';
    billable_characters_count: number;
    speech_marks?: {
        chunks: any[];
        end: number;
        end_time: number;
        start: number;
        start_time: number;
        type: string;
        value: string;
    };
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

// 获取语音模型列表
export async function GET(request: NextRequest) {
    try {
        // 验证用户身份
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized - Please log in to access voice models' },
                { status: 401 }
            );
        }

        // 获取用户的语音模型
        const voiceModels = await prisma.voiceModel.findMany({
            where: {
                userId: user.id
            },
            orderBy: {
                createDate: 'desc'
            }
        });

        return NextResponse.json({
            success: true,
            data: voiceModels || []
        });

    } catch (error) {
        console.error('Get voice models error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// 文本转语音 API
export async function POST(request: NextRequest) {
    try {
        // 验证用户身份
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized - Please log in to use this service' },
                { status: 401 }
            );
        }

        // 解析请求体
        const body = await request.json();
        const { 
            input, 
            voice_id, 
            audio_format = 'wav',
            model = 'simba-english',
            language,
            options = {}
        } = body;

        // 输入验证
        if (!input || typeof input !== 'string') {
            return NextResponse.json(
                { error: 'Input is required and must be a string' },
                { status: 400 }
            );
        }

        if (input.length < 1) {
            return NextResponse.json(
                { error: 'Input cannot be empty' },
                { status: 400 }
            );
        }

        if (input.length > 5000) {
            return NextResponse.json(
                { error: 'Input cannot exceed 5000 characters' },
                { status: 400 }
            );
        }

        if (!voice_id || typeof voice_id !== 'string') {
            return NextResponse.json(
                { error: 'Voice ID is required' },
                { status: 400 }
            );
        }

        // 验证音频格式
        const validFormats = ['wav', 'mp3', 'ogg', 'aac'];
        if (!validFormats.includes(audio_format)) {
            return NextResponse.json(
                { error: `Invalid audio format. Must be one of: ${validFormats.join(', ')}` },
                { status: 400 }
            );
        }

        // 验证模型
        const validModels = ['simba-english', 'simba-multilingual'];
        if (!validModels.includes(model)) {
            return NextResponse.json(
                { error: `Invalid model. Must be one of: ${validModels.join(', ')}` },
                { status: 400 }
            );
        }

        // 验证语言参数（可选）
        if (language && !SUPPORTED_LANGUAGES[language as keyof typeof SUPPORTED_LANGUAGES]) {
            return NextResponse.json(
                { error: `Unsupported language. Supported languages: ${Object.keys(SUPPORTED_LANGUAGES).join(', ')}` },
                { status: 400 }
            );
        }

        // 验证选项
        const { loudness_normalization, text_normalization } = options;
        if (loudness_normalization !== undefined && typeof loudness_normalization !== 'boolean') {
            return NextResponse.json(
                { error: 'loudness_normalization must be a boolean value' },
                { status: 400 }
            );
        }

        if (text_normalization !== undefined && typeof text_normalization !== 'boolean') {
            return NextResponse.json(
                { error: 'text_normalization must be a boolean value' },
                { status: 400 }
            );
        }

        // 检查环境变量
        const speechifyToken = process.env.SPEECHIFY_KEY;
        if (!speechifyToken) {
            return NextResponse.json(
                { error: 'Speechify API token not configured' },
                { status: 500 }
            );
        }

        // 构建 Speechify API 请求
        const speechifyRequest: SpeechifyTTSRequest = {
            input,
            voice_id,
            audio_format,
            model
        };

        // 添加语言参数（如果提供）
        if (language) {
            speechifyRequest.language = language;
        }

        // 添加可选参数
        if (Object.keys(options).length > 0) {
            speechifyRequest.options = {};
            
            if (loudness_normalization !== undefined) {
                speechifyRequest.options.loudness_normalization = loudness_normalization;
            }
            
            if (text_normalization !== undefined) {
                speechifyRequest.options.text_normalization = text_normalization;
            }
        }

        console.log('Speechify TTS API Request:', speechifyRequest);

        const speechifyResponse = await fetch('https://api.sws.speechify.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${speechifyToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(speechifyRequest)
        });

        if (!speechifyResponse.ok) {
            const errorText = await speechifyResponse.text();
            console.error('TTS API error:', errorText);
            
            // 尝试解析错误响应
            let errorDetails;
            try {
                errorDetails = JSON.parse(errorText);
            } catch {
                errorDetails = { message: errorText };
            }

            return NextResponse.json(
                { 
                    error: 'Failed to generate speech',
                    details: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
                    statusCode: speechifyResponse.status
                },
                { status: speechifyResponse.status }
            );
        }

        // 解析 Speechify 响应
        const speechifyResult: SpeechifyTTSResponse = await speechifyResponse.json();
        
        // 将 Base64 音频数据转换为 Buffer
        const audioBuffer = Buffer.from(speechifyResult.audio_data, 'base64');
        
        // 创建 File 对象用于 media-service（Node.js 环境兼容）
        const fileName = `tts-${Date.now()}.${speechifyResult.audio_format}`;
        const audioFile = new File(
            [audioBuffer], 
            fileName,
            { type: `audio/${speechifyResult.audio_format}` }
        );

        // 使用 media-service 上传音频文件
        const mediaService = createServerMediaService();
        const uploadResult = await mediaService.uploadAudio({
            file: audioFile,
            userId: user.id,
            bucket: 'media'
        });

        // 保存语音记录到数据库
        const voiceRecord = await prisma.voice.create({
            data: {
                vmId: voice_id,
                userId: user.id,
                speechMarks: speechifyResult.speech_marks || undefined,
                billableCharactersCount: speechifyResult.billable_characters_count,
                audioFormat: speechifyResult.audio_format,
                audioUrl: uploadResult.url,
                inputText: input,
                model: model,
                options: options
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Speech generated successfully',
            data: {
                id: voiceRecord.id,
                input: input,
                audioUrl: uploadResult.url,
                voiceId: voice_id,
                voiceModelId: voice_id,
                audioFormat: speechifyResult.audio_format,
                billableCharacters: speechifyResult.billable_characters_count,
                model: model,
                options: options,
                speechMarks: speechifyResult.speech_marks,
                generatedAt: voiceRecord.createdAt.toISOString()
            }
        });

    } catch (error) {
        console.error('Text-to-speech error:', error);

        return NextResponse.json(
            {
                error: 'Internal server error occurred during speech generation',
                details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
            },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

// 删除语音模型
export async function DELETE(request: NextRequest) {
    try {
        // 验证用户身份
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized - Please log in to delete voice models' },
                { status: 401 }
            );
        }

        // 解析请求体
        const body = await request.json();
        const { modelId } = body;

        if (!modelId || typeof modelId !== 'string') {
            return NextResponse.json(
                { error: 'Model ID is required' },
                { status: 400 }
            );
        }

        // 检查模型是否存在且属于当前用户
        const voiceModel = await prisma.voiceModel.findFirst({
            where: {
                modelId: modelId,
                userId: user.id
            }
        });

        if (!voiceModel) {
            return NextResponse.json(
                { error: 'Voice model not found or you do not have permission to delete it' },
                { status: 404 }
            );
        }

        // 删除与该模型相关的所有语音生成记录
        await prisma.voice.deleteMany({
            where: {
                vmId: modelId,
                userId: user.id
            }
        });

        // 删除语音模型
        await prisma.voiceModel.delete({
            where: {
                id: voiceModel.id
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Voice model and related generations deleted successfully'
        });

    } catch (error) {
        console.error('Delete voice model error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
