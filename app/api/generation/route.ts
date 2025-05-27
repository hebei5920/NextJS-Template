import { createClient } from "@/lib/supabase-server";
import { NextResponse, NextRequest } from "next/server";

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
        
        // Parse and validate request body
        const body = await request.json();
        const { text, voiceUrl } = body;

        // 输入验证
        if (!text || typeof text !== 'string') {
            return NextResponse.json(
                { error: 'Text is required and must be a string' },
                { status: 400 }
            );
        }

        if (text.length < 1) {
            return NextResponse.json(
                { error: 'Text cannot be empty' },
                { status: 400 }
            );
        }

        if (text.length > 1000) {
            return NextResponse.json(
                { error: 'Text cannot exceed 1000 characters' },
                { status: 400 }
            );
        }

        if (!voiceUrl || typeof voiceUrl !== 'string') {
            return NextResponse.json(
                { error: 'Voice URL is required' },
                { status: 400 }
            );
        }

        // 模拟处理时间（在实际应用中这里会调用真实的AI服务）
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        // 模拟生成结果（实际应用中这里会返回真实的生成音频URL）
        const generatedAudioUrl = `data:audio/wav;base64,${Buffer.from('mock-audio-data').toString('base64')}`;

        // 记录生成历史（可选）
        try {
            await supabase
                .from('voice_generations')
                .insert({
                    user_id: user.id,
                    text: text,
                    voice_url: voiceUrl,
                    generated_url: generatedAudioUrl,
                    created_at: new Date().toISOString()
                });
        } catch (dbError) {
            console.error('Failed to save generation history:', dbError);
            // 不阻断主流程，只记录错误
        }

        return NextResponse.json({
            success: true,
            message: 'Voice generation completed successfully',
            data: {
                text: text,
                audioUrl: generatedAudioUrl,
                duration: Math.ceil(text.length / 10), // 模拟音频时长
                generatedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Voice generation error:', error);
        
        return NextResponse.json(
            { 
                error: 'Internal server error occurred during voice generation',
                details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
            },
            { status: 500 }
        );
    }
}   