// src/types/historique.ts
// Types pour l'historique des modifications

import type { TypeAction } from '../lib/prompts/templates';

/**
 * Statistiques d'un texte
 */
export interface StatistiquesTexte {
  mots: number;
  caracteres: number;
  phrases: number;
}

/**
 * Entrée d'historique (une modification)
 */
export interface EntreeHistorique {
  id: string;                          // ID unique
  texteInitial: string;                // Texte avant modification
  texteModifie: string;                // Texte après modification
  action: TypeAction;                  // Action effectuée
  personaNom: string;                  // Nom du persona utilisé
  dateModification: Date;              // Date de la modification
  statsInitial: StatistiquesTexte;    // Stats du texte initial
  statsFinal: StatistiquesTexte;      // Stats du texte modifié
}

/**
 * Store Zustand pour l'historique
 */
export interface StoreHistorique {
  // État
  historique: EntreeHistorique[];
  modaleOuverte: boolean;
  
  // Actions
  chargerHistorique: () => Promise<void>;
  ajouterEntree: (entree: Omit<EntreeHistorique, 'id' | 'dateModification'>) => Promise<void>;
  supprimerEntree: (id: string) => Promise<void>;
  supprimerTout: () => Promise<void>;
  ouvrirModale: () => void;
  fermerModale: () => void;
}
