import { createClient } from "@/lib/supabase-server";
import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

        // 获取用户的完整信息用于fullName
        let userFullName = '';
        
        // 尝试从用户元数据获取姓名
        if (user.user_metadata?.full_name) {
            userFullName = user.user_metadata.full_name;
        } else if (user.user_metadata?.name) {
            userFullName = user.user_metadata.name;
        } else {
            // 从profiles表获取用户信息
            try {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, first_name, last_name')
                    .eq('id', user.id)
                    .single();

                if (profile?.full_name) {
                    userFullName = profile.full_name;
                } else if (profile?.first_name && profile?.last_name) {
                    userFullName = `${profile.first_name} ${profile.last_name}`;
                } else if (profile?.first_name) {
                    userFullName = profile.first_name;
                }
            } catch (error) {
                console.warn('Failed to fetch user profile:', error);
            }
        }

        // 如果仍然没有获取到姓名，使用邮箱前缀作为默认值
        if (!userFullName && user.email) {
            userFullName = user.email.split('@')[0];
        }

        // Parse multipart/form-data
        const formData = await request.formData();
        const name = formData.get('name') as string;
        const gender = formData.get('gender') as string;
        const sample = formData.get('sample') as File;
        const avatar = formData.get('avatar') as File;
        const language = formData.get('language') as string || 'en'; // 默认英语

        // 输入验证
        if (!name || typeof name !== 'string') {
            return NextResponse.json(
                { error: 'Name is required and must be a string' },
                { status: 400 }
            );
        }

        if (!gender || !['male', 'female'].includes(gender)) {
            return NextResponse.json(
                { error: 'Gender is required and must be either "male" or "female"' },
                { status: 400 }
            );
        }

        if (!sample || !(sample instanceof File)) {
            return NextResponse.json(
                { error: 'Sample file is required' },
                { status: 400 }
            );
        }

        if (!avatar || !(avatar instanceof File)) {
            return NextResponse.json(
                { error: 'Avatar file is required' },
                { status: 400 }
            );
        }

        // 验证语言代码
        if (language && !SUPPORTED_LANGUAGES[language as keyof typeof SUPPORTED_LANGUAGES]) {
            return NextResponse.json(
                { error: `Unsupported language. Supported languages: ${Object.keys(SUPPORTED_LANGUAGES).join(', ')}` },
                { status: 400 }
            );
        }

        // 构建 consent 对象，使用从用户信息中获取的fullName
        const consent = JSON.stringify({
            fullName: userFullName || 'Unknown User',
            email: user.email || '',
            timestamp: new Date().toISOString(),
            agreed: true
        });

        // 检查环境变量
        const speechifyToken = process.env.SPEECHIFY_KEY;
        if (!speechifyToken) {
            return NextResponse.json(
                { error: 'Speechify API token not configured' },
                { status: 500 }
            );
        }

        // 准备发送到 Speechify API 的表单数据
        const speechifyFormData = new FormData();
        speechifyFormData.append('name', name);
        speechifyFormData.append('gender', gender);
        speechifyFormData.append('sample', sample);
        speechifyFormData.append('avatar', avatar);
        speechifyFormData.append('consent', consent);
        
        // 如果指定了语言，添加到请求中
        if (language && language !== 'en') {
            speechifyFormData.append('language', language);
        }

        // 调用 Speechify API
        const speechifyResponse = await fetch('https://api.sws.speechify.com/v1/voices', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${speechifyToken}`,
            },
            body: speechifyFormData
        });

        console.log("speechifyResponse", speechifyResponse);

        if (!speechifyResponse.ok) {
            const errorText = await speechifyResponse.text();
            console.error('Speechify API error:', errorText);
            return NextResponse.json(
                {
                    error: 'Failed to create voice with Speechify API',
                    details: process.env.NODE_ENV === 'development' ? errorText : undefined
                },
                { status: speechifyResponse.status }
            );
        }

        const speechifyResult = await speechifyResponse.json();

        // 保存语音模型到数据库
        try {
            const voiceModel = await prisma.voiceModel.create({
                data: {
                    modelId: speechifyResult.id,
                    userId: user.id, // 用户的supabaseId
                    gender: speechifyResult.gender || gender,
                    locale: speechifyResult.locale || language,
                    displayName: speechifyResult.display_name || name,
                    avatarImage: speechifyResult.avatar_image || null,
                }
            });

            console.log('Voice model saved to database:', voiceModel);
        } catch (dbError) {
            console.error('Failed to save voice model to database:', dbError);
            // 即使数据库保存失败，也返回成功响应，因为语音模型已在Speechify创建成功
        }

        return NextResponse.json({
            success: true,
            message: 'Voice created successfully',
            data: {
                ...speechifyResult,
                language: language,
                userFullName: userFullName
            }
        });

    } catch (error) {
        console.error('Voice creation error:', error);

        return NextResponse.json(
            {
                error: 'Internal server error occurred during voice creation',
                details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
            },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

export async function GET(request: NextRequest) {
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

        // 检查环境变量
        const speechifyToken = process.env.SPEECHIFY_KEY;
        if (!speechifyToken) {
            return NextResponse.json(
                { error: 'Speechify API token not configured' },
                { status: 500 }
            );
        }

        // 获取用户的语音列表
        const speechifyResponse = await fetch('https://api.sws.speechify.com/v1/voices', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${speechifyToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!speechifyResponse.ok) {
            const errorText = await speechifyResponse.text();
            console.error('Speechify API error:', errorText);
            return NextResponse.json(
                {
                    error: 'Failed to fetch voices from Speechify API',
                    details: process.env.NODE_ENV === 'development' ? errorText : undefined
                },
                { status: speechifyResponse.status }
            );
        }

        const voices = await speechifyResponse.json();

        return NextResponse.json({
            success: true,
            message: 'Voices fetched successfully',
            data: voices
        });

    } catch (error) {
        console.error('Voice fetch error:', error);

        return NextResponse.json(
            {
                error: 'Internal server error occurred while fetching voices',
                details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
            },
            { status: 500 }
        );
    }
}
