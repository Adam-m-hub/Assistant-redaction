// src/lib/utils/calculerStats.ts
// Fonction utilitaire pour calculer les statistiques d'un texte

import type { StatistiquesTexte } from '../types/historique';

/**
 * Calculer les statistiques d'un texte
 */
export function calculerStatistiques(texte: string): StatistiquesTexte {
  const texteNettoye = texte.trim();
  
  // Compter les mots
  const mots = texteNettoye.length > 0 
    ? texteNettoye.split(/\s+/).filter(Boolean).length 
    : 0;
  
  // Compter les caractères (sans espaces)
  const caracteres = texteNettoye.replace(/\s/g, '').length;
  
  // Compter les phrases (approximatif)
  const phrases = texteNettoye.length > 0
    ? texteNettoye.split(/[.!?]+/).filter(p => p.trim().length > 0).length
    : 0;
  
  return {
    mots,
    caracteres,
    phrases
  };
}
