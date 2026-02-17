// src/types/personas.ts
/**
 * Interface définissant un Persona
 */
export interface Persona {
  id: string;
  nom: string;
  description: string;
  expertise: string[];
 // exempleTexte: string;
  //systemPrompt: string;
  estPredefini: boolean;
  temperature: number;
  creeLe?: Date;
  modifieLe?: Date;
}

/**
 * Paramètres pour créer un nouveau persona
 */
export interface CreerPersonaParams {
  nom: string;
  description: string;
  expertise: string[];
  exempleTexte?: string;
  temperature?: number;
}

/**
 * Store des personas
 */
export interface StorePersonas {
  // État
  personas: Persona[];
  personaActif: Persona | null;
  
  // Actions
  chargerPersonas: () => Promise<void>;
  selectionnerPersona: (id: string) => void;
  creerPersona: (params: CreerPersonaParams) => Promise<Persona>;
  modifierPersona: (id: string, params: Partial<CreerPersonaParams>) => Promise<void>;
  supprimerPersona: (id: string) => Promise<void>;
  restaurerDefauts: () => Promise<void>;
}