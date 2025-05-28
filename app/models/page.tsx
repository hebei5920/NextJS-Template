'use client';

import { Navbar } from '@/components/ui/navbar';
import { VoiceModelsHistory } from '@/components/voice-cloning/voice-models-history';

export default function ModelsPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Main content with top padding to account for fixed navbar */}
            <main className="pt-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">
                            语音模型
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            管理您创建的所有AI语音模型
                        </p>
                    </div>

                    <VoiceModelsHistory />
                </div>
            </main>
        </div>
    );
} 