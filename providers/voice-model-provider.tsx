'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface VoiceModelRecord {
  id: number;
  modelId: string;
  userId: string;
  gender: string;
  locale: string | null;
  displayName: string;
  avatarImage: string | null;
  createDate: string;
  updateDate: string;
}

interface VoiceModelContextType {
  selectedVoiceModel: VoiceModelRecord | null;
  setSelectedVoiceModel: (model: VoiceModelRecord | null) => void;
  clearSelectedVoiceModel: () => void;
}

const VoiceModelContext = createContext<VoiceModelContextType | undefined>(undefined);

export function VoiceModelProvider({ children }: { children: ReactNode }) {
  const [selectedVoiceModel, setSelectedVoiceModel] = useState<VoiceModelRecord | null>(null);

  const clearSelectedVoiceModel = () => {
    setSelectedVoiceModel(null);
  };

  return (
    <VoiceModelContext.Provider
      value={{
        selectedVoiceModel,
        setSelectedVoiceModel,
        clearSelectedVoiceModel,
      }}
    >
      {children}
    </VoiceModelContext.Provider>
  );
}

export function useVoiceModel() {
  const context = useContext(VoiceModelContext);
  if (context === undefined) {
    throw new Error('useVoiceModel must be used within a VoiceModelProvider');
  }
  return context;
} 