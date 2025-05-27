import { createClient } from "@/lib/supabase-server";
import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

        // Parse multipart/form-data
        const formData = await request.formData();
        const name = formData.get('name') as string;
        const gender = formData.get('gender') as string;
        const sample = formData.get('sample') as File;
        const avatar = formData.get('avatar') as File;
        const fullName = formData.get('fullName') as string;

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

        if (!fullName || typeof fullName !== 'string') {
            return NextResponse.json(
                { error: 'Full name is required for consent' },
                { status: 400 }
            );
        }

        // 构建 consent 对象
        const consent = JSON.stringify({
            fullName: fullName,
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
                    locale: speechifyResult.locale || 'zh-CN',
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
            data: speechifyResult
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
