// src/types/index.ts



// Types pour les paramètres de génération
export interface GenerationParams {
  temperature: number;
  maxLength: number;
  topP: number;
}

// Template de prompt
export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  userPrompt: string;
  parameters: GenerationParams;
}

// Suggestion générée par l'IA
export interface Suggestion {
  id: string;
  content: string;
  type: 'improvement' | 'correction' | 'alternative' | 'expansion';
  createdAt: Date;
  applied: boolean;
}

// Historique des textes
export interface TextHistory {
  id: string;
  content: string;
  timestamp: Date;
  action: string;
}

// Paramètres de l'assistant
export interface AssistantSettings {
  style: 'formal' | 'creative' | 'concise' | 'technical';
  length: 'short' | 'medium' | 'long';
  tone: 'neutral' | 'enthusiastic' | 'serious' | 'friendly';
  language: 'fr' | 'en';
  temperature: number;
  creativity: number;
  maxWords: number;
}

// État du modèle
export type ModelStatus = 'idle' | 'loading' | 'loaded' | 'error';

// Texte sauvegardé
export interface SavedText {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    wordCount: number;
    templateUsed?: string;
    parameters?: Record<string, any>;
  };
}