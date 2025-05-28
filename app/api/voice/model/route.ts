import { createClient } from "@/lib/supabase-server";
import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Speechify supported languages list
const SUPPORTED_LANGUAGES = {
  // Fully supported languages
  'en': 'English',
  'fr-FR': 'French',
  'de-DE': 'German', 
  'es-ES': 'Spanish',
  'pt-BR': 'Portuguese (Brazil)',
  'pt-PT': 'Portuguese (Portugal)',
  
  // Beta languages
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
        // Verify user identity
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized - Please log in to use this service' },
                { status: 401 }
            );
        }

        // Get user's full information for fullName
        let userFullName = '';
        
        // Try to get name from user metadata
        if (user.user_metadata?.full_name) {
            userFullName = user.user_metadata.full_name;
        } else if (user.user_metadata?.name) {
            userFullName = user.user_metadata.name;
        } else {
            // Get user information from profiles table
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

        // If still no name is obtained, use email prefix as default
        if (!userFullName && user.email) {
            userFullName = user.email.split('@')[0];
        }

        // Parse multipart/form-data
        const formData = await request.formData();
        const name = formData.get('name') as string;
        const gender = formData.get('gender') as string;
        const sample = formData.get('sample') as File;
        const avatar = formData.get('avatar') as File;
        const language = formData.get('language') as string || 'en'; // Default English

        // Input validation
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

        // Validate language code
        if (language && !SUPPORTED_LANGUAGES[language as keyof typeof SUPPORTED_LANGUAGES]) {
            return NextResponse.json(
                { error: `Unsupported language. Supported languages: ${Object.keys(SUPPORTED_LANGUAGES).join(', ')}` },
                { status: 400 }
            );
        }

        // Build consent object, using fullName obtained from user information
        const consent = JSON.stringify({
            fullName: userFullName || 'Unknown User',
            email: user.email || '',
            timestamp: new Date().toISOString(),
            agreed: true
        });

        // Check environment variables
        const speechifyToken = process.env.SPEECHIFY_KEY;
        if (!speechifyToken) {
            return NextResponse.json(
                { error: 'Speechify API token not configured' },
                { status: 500 }
            );
        }

        // Prepare form data to send to Speechify API
        const speechifyFormData = new FormData();
        speechifyFormData.append('name', name);
        speechifyFormData.append('gender', gender);
        speechifyFormData.append('sample', sample);
        speechifyFormData.append('avatar', avatar);
        speechifyFormData.append('consent', consent);
        
        // If language is specified, add it to the request
        if (language && language !== 'en') {
            speechifyFormData.append('language', language);
        }

        // Call Speechify API
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

        // Save voice model to database
        try {
            const voiceModel = await prisma.voiceModel.create({
                data: {
                    modelId: speechifyResult.id,
                    userId: user.id, // User's supabaseId
                    gender: speechifyResult.gender || gender,
                    locale: speechifyResult.locale || language,
                    displayName: speechifyResult.display_name || name,
                    avatarImage: speechifyResult.avatar_image || null,
                }
            });

            console.log('Voice model saved to database:', voiceModel);
        } catch (dbError) {
            console.error('Failed to save voice model to database:', dbError);
            // Return success response even if database save fails, as voice model was successfully created in Speechify
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
        // Verify user identity
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized - Please log in to use this service' },
                { status: 401 }
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

        // Get user's voice list
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
