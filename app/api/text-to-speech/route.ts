import { createClient } from "@/lib/supabase-server";
import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    try {
        // Verify user identity
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized - Please log in to use this service' },
                { status: 401 }
            );
        }

        // Parse request body
        const body = await request.json();
        const { text, voiceId } = body;

        // Input validation
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

        if (!voiceId || typeof voiceId !== 'string') {
            return NextResponse.json(
                { error: 'Voice ID is required' },
                { status: 400 }
            );
        }

        // Check environment variables
        const speechifyToken = process.env.SPEECHIFY_KEY;
        if (!speechifyToken) {
            return NextResponse.json(
                { error: 'Speechify API token not configured' },
                { status: 500 }
            );
        }

        // Call Speechify text-to-speech API
        const speechifyResponse = await fetch('https://api.sws.speechify.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${speechifyToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                input: text,
                voice_id: voiceId,
                audio_format: 'mp3',
                sample_rate: 22050,
                speed: 1.0,
                emotion: 'neutral'
            })
        });

        if (!speechifyResponse.ok) {
            const errorText = await speechifyResponse.text();
            console.error('Speechify TTS API error:', errorText);
            return NextResponse.json(
                { 
                    error: 'Failed to generate speech with Speechify API',
                    details: process.env.NODE_ENV === 'development' ? errorText : undefined
                },
                { status: speechifyResponse.status }
            );
        }

        // Get audio data
        const audioBuffer = await speechifyResponse.arrayBuffer();
        const audioBase64 = Buffer.from(audioBuffer).toString('base64');
        const audioUrl = `data:audio/mp3;base64,${audioBase64}`;

        // Record usage history
        try {
            await supabase
                .from('tts_usage')
                .insert({
                    user_id: user.id,
                    voice_id: voiceId,
                    text: text,
                    character_count: text.length,
                    created_at: new Date().toISOString()
                });
        } catch (dbError) {
            console.error('Failed to save TTS usage history:', dbError);
        }

        return NextResponse.json({
            success: true,
            message: 'Speech generated successfully',
            data: {
                text: text,
                audioUrl: audioUrl,
                voiceId: voiceId,
                duration: Math.ceil(text.length / 15), // Estimate audio duration (seconds)
                generatedAt: new Date().toISOString()
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
    }
} 