// src/lib/personas/personasPredefinis.ts
// VERSION SIMPLIFIÉE - Prompts courts

import type { Persona } from '../../types/personas';

export const PERSONAS_PREDEFINIS: Persona[] = [
  {
    id: 'journaliste',
    nom: '📰 Journaliste',
    description: 'Style journalistique factuel et engageant',
    expertise: ['Actualités', 'Investigation', 'Reportage', 'Interview'],
    exempleTexte: 'Les experts s\'accordent à dire que... Selon nos sources...',
    systemPrompt: `Tu es un journaliste professionnel.`,
    estPredefini: true,
    temperature: 0.6,
  },

  {
    id: 'scientifique',
    nom: '🔬 Scientifique',
    description: 'Style académique rigoureux et précis',
    expertise: ['Recherche', 'Analyse', 'Méthodologie', 'Vulgarisation'],
    exempleTexte: 'Les données démontrent que... Cette étude révèle...',
    systemPrompt: `Tu es un chercheur scientifique.`,
    estPredefini: true,
    temperature: 0.4,
  },

  {
    id: 'marketeur',
    nom: '📈 Marketeur',
    description: 'Style persuasif et orienté conversion',
    expertise: ['Copywriting', 'Storytelling', 'Call-to-Action', 'SEO'],
    exempleTexte: 'Découvrez comment... Transformez dès maintenant...',
    systemPrompt: `Tu es un expert en marketing digital.`,
    estPredefini: true,
    temperature: 0.8,
  },

  {
    id: 'poete',
    nom: '🎭 Poète',
    description: 'Style créatif et imagé',
    expertise: ['Métaphores', 'Rythme', 'Émotions', 'Imagery'],
    exempleTexte: 'Comme un murmure dans le vent... Les mots dansent...',
    systemPrompt: `Tu es un poète talentueux.`,
    estPredefini: true,
    temperature: 0.9,
  },
];

export function obtenirPersonaParId(id: string): Persona | undefined {
  return PERSONAS_PREDEFINIS.find(p => p.id === id);
}

export function obtenirTousLesPersonas(): Persona[] {
  return [...PERSONAS_PREDEFINIS];
}
