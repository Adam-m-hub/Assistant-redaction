// src/lib/personas/personasPredefinis.ts
// Personas prédéfinis avec structure simplifiée

import type { Persona } from '../../types/personas';

/**
 * 4 Personas prédéfinis pour l'édition de texte
 * Structure : id, nom, description, expertise, estPredefini, temperature
 */
export const PERSONAS_PREDEFINIS: Persona[] = [
  {
    id: 'correcteur',
    nom: 'Correcteur professionnel',
    description: 'Spécialiste de la correction orthographique et grammaticale',
    expertise: ['Orthographe', 'Grammaire', 'Ponctuation', 'Typographie'],
    estPredefini: true,
    temperature: 0.3, // Très précis
  },

  {
    id: 'editeur-technique',
    nom: 'Éditeur technique',
    description: 'Expert en rédaction technique claire et concise',
    expertise: ['Clarté', 'Précision', 'Concision', 'Structure'],
    estPredefini: true,
    temperature: 0.4, // Factuel
  },

  {
    id: 'assistant-redaction',
    nom: 'Assistant de rédaction',
    description: 'Assistant polyvalent pour l\'amélioration de textes',
    expertise: ['Rédaction', 'Style', 'Grammaire', 'Structure'],
    estPredefini: true,
    temperature: 0.7, // Équilibré
  },

  {
    id: 'redacteur-academique',
    nom: 'Rédacteur académique',
    description: 'Spécialiste de la rédaction académique formelle',
    expertise: ['Style académique', 'Rigueur', 'Objectivité', 'Formalisme'],
    estPredefini: true,
    temperature: 0.5, // Rigoureux
  },
];

/**
 * Obtenir un persona par ID
 */
export function obtenirPersonaParId(id: string): Persona | undefined {
  return PERSONAS_PREDEFINIS.find(p => p.id === id);
}

/**
 * Obtenir tous les personas prédéfinis
 */
export function obtenirTousLesPersonas(): Persona[] {
  return [...PERSONAS_PREDEFINIS];
}
