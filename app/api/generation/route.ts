import { createClient } from "@/lib/supabase-server";
import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    // 验证用户身份
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }
    try {

        
        

    } catch (error) {
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}   