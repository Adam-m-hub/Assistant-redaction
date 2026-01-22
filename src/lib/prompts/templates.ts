// src/lib/prompts/templates.ts
// Système de construction de prompts pour WebLLM

import type { Message } from '../webllm/types';

/**
 * Types d'actions possibles
 */
export type TypeAction = 'ameliorer' | 'corriger' | 'raccourcir' | 'allonger';

/**
 * Styles d'écriture disponibles
 */
export type StyleEcriture = 'formel' | 'creatif' | 'concis' | 'technique';

/**
 * Tons disponibles
 */
export type Ton = 'neutre' | 'enthousiaste' | 'serieux' | 'amical';

/**
 * Longueurs cibles
 */
export type Longueur = 'court' | 'moyen' | 'long';

/**
 * Paramètres pour construire un prompt
 */
export interface ParametresPrompt {
  action: TypeAction;           // Action à effectuer
  texte: string;                // Texte de l'utilisateur
  style?: StyleEcriture;        // Style d'écriture (optionnel)
  ton?: Ton;                    // Ton du texte (optionnel)
  longueur?: Longueur;          // Longueur cible (optionnel)
}

/**
 * Résultat de la construction du prompt
 */
export interface PromptConstruit {
  messages: Message[];          // Messages prêts pour WebLLM
  description: string;          // Description de ce qui va être fait
}

// ============================================
// TEMPLATES DE BASE (Instructions fixes)
// ============================================

/**
 * Instructions système de base
 * Commune à toutes les actions
 */
const INSTRUCTIONS_SYSTEME_BASE = `Tu es un assistant de rédaction professionnel expert en français.

RÈGLES ABSOLUES À RESPECTER :
- Réponds UNIQUEMENT avec le texte demandé
- Pas d'explications, pas de commentaires, pas de préambule
- Ne dis jamais "Voici le texte amélioré" ou similaire
- Respecte toujours la langue du texte original
- Garde le sens général du texte
- Sois naturel et fluide dans ton écriture`;

/**
 * Instructions spécifiques par action
 */
const INSTRUCTIONS_PAR_ACTION: Record<TypeAction, string> = {
  ameliorer: `Ta mission : AMÉLIORER la qualité du texte.

COMMENT AMÉLIORER :
- Enrichir le vocabulaire (utiliser des mots plus précis et variés)
- Améliorer la structure des phrases (fluidité et clarté)
- Renforcer l'impact du message
- Corriger les erreurs si présentes
- Rendre le texte plus professionnel et agréable à lire`,

  corriger: `Ta mission : CORRIGER uniquement les erreurs.

QUOI CORRIGER :
- Orthographe (fautes de frappe, accords)
- Grammaire (conjugaison, syntaxe)
- Ponctuation (virgules, points, majuscules)

CE QU'IL NE FAUT PAS FAIRE :
- Ne change PAS le style d'écriture
- Ne change PAS le vocabulaire (sauf si erreur)
- Ne change PAS le ton
- Ne change PAS la structure (sauf si incorrect)
- Garde le texte aussi proche que possible de l'original`,

  raccourcir: `Ta mission : RACCOURCIR le texte en gardant l'essentiel.

COMMENT RACCOURCIR :
- Garde uniquement les informations essentielles
- Supprime les répétitions et redondances
- Enlève les détails non critiques
- Utilise des formulations plus concises
- Va droit au but

IMPORTANT :
- Le message principal doit rester clair
- Ne perds pas d'informations importantes
- Reste cohérent et naturel`,

  allonger: `Ta mission : DÉVELOPPER et enrichir le texte.

COMMENT ALLONGER :
- Ajouter des détails pertinents et utiles
- Développer les idées principales
- Enrichir avec des exemples concrets
- Expliquer davantage les points importants
- Rendre le texte plus complet et informatif

IMPORTANT :
- N'invente PAS d'informations
- Reste cohérent avec le texte original
- Ajoute seulement du contenu pertinent
- Garde le même sujet et la même direction`
};

/**
 * Descriptions des longueurs cibles
 */
const DESCRIPTIONS_LONGUEUR: Record<Longueur, string> = {
  court: 'environ 30-50 mots',
  moyen: 'environ 100-200 mots',
  long: 'environ 300-500 mots'
};

/**
 * Nombres de mots cibles pour raccourcir
 */
const MOTS_CIBLES_RACCOURCIR: Record<string, number> = {
  'tres_long': 50,    // Plus de 150 mots → réduire à 50
  'long': 40,         // 100-150 mots → réduire à 40
  'moyen': 30,        // 50-100 mots → réduire à 30
  'court': 20         // Moins de 50 mots → réduire à 20
};

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Calculer le nombre de mots dans un texte
 */
function compterMots(texte: string): number {
  return texte.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Déterminer la longueur cible pour raccourcir
 */
function obtenirLongueurCibleRaccourcir(texte: string): number {
  const nombreMots = compterMots(texte);
  
  if (nombreMots > 150) return MOTS_CIBLES_RACCOURCIR.tres_long;
  if (nombreMots > 100) return MOTS_CIBLES_RACCOURCIR.long;
  if (nombreMots > 50) return MOTS_CIBLES_RACCOURCIR.moyen;
  return MOTS_CIBLES_RACCOURCIR.court;
}

/**
 * Construire les instructions de style
 */
function construireInstructionsStyle(
  style?: StyleEcriture,
  ton?: Ton,
  longueur?: Longueur,
  action?: TypeAction
): string {
  const instructions: string[] = [];
  
  // Style d'écriture
  if (style) {
    const descriptions: Record<StyleEcriture, string> = {
      formel: 'formel et professionnel',
      creatif: 'créatif et original',
      concis: 'concis et direct',
      technique: 'technique et précis'
    };
    instructions.push(`Style : ${descriptions[style]}`);
  }
  
  // Ton
  if (ton) {
    const descriptions: Record<Ton, string> = {
      neutre: 'neutre et objectif',
      enthousiaste: 'enthousiaste et positif',
      serieux: 'sérieux et posé',
      amical: 'amical et chaleureux'
    };
    instructions.push(`Ton : ${descriptions[ton]}`);
  }
  
  // Longueur (sauf pour raccourcir qui a sa propre logique)
  if (longueur && action !== 'raccourcir') {
    instructions.push(`Longueur cible : ${DESCRIPTIONS_LONGUEUR[longueur]}`);
  }
  
  return instructions.length > 0 
    ? '\n\nPARAMÈTRES SOUHAITÉS :\n' + instructions.join('\n')
    : '';
}

// ============================================
// FONCTION PRINCIPALE
// ============================================

/**
 * Construire un prompt complet pour WebLLM
 * 
 * @param params - Paramètres du prompt
 * @returns Messages formatés pour WebLLM + description
 * 
 * @example
 * const prompt = construirePrompt({
 *   action: 'ameliorer',
 *   texte: 'Bonjour je veux un truc',
 *   style: 'formel',
 *   ton: 'neutre'
 * });
 */
export function construirePrompt(params: ParametresPrompt): PromptConstruit {
  const { action, texte, style, ton, longueur } = params;
  
  // Vérifier que le texte n'est pas vide
  if (!texte.trim()) {
    throw new Error('Le texte ne peut pas être vide');
  }
  
  // 1. Construire le prompt système
  let promptSysteme = INSTRUCTIONS_SYSTEME_BASE;
  promptSysteme += '\n\n' + INSTRUCTIONS_PAR_ACTION[action];
  
  // Ajouter les paramètres de style
  promptSysteme += construireInstructionsStyle(style, ton, longueur, action);
  
  // 2. Construire le prompt utilisateur
  let promptUtilisateur = '';
  
  switch (action) {
    case 'ameliorer':
      promptUtilisateur = `Améliore ce texte :\n\n"${texte}"\n\nRéponds uniquement avec le texte amélioré.`;
      break;
      
    case 'corriger':
      promptUtilisateur = `Corrige les erreurs dans ce texte :\n\n"${texte}"\n\nRéponds uniquement avec le texte corrigé.`;
      break;
      
    case 'raccourcir':
      const motsCibles = obtenirLongueurCibleRaccourcir(texte);
      promptUtilisateur = `Raccourcis ce texte à environ ${motsCibles} mots maximum :\n\n"${texte}"\n\nRéponds uniquement avec le texte raccourci.`;
      break;
      
    case 'allonger':
      promptUtilisateur = `Développe et enrichis ce texte :\n\n"${texte}"\n\nRéponds uniquement avec le texte développé.`;
      break;
  }
  
  // 3. Créer les messages pour WebLLM
  const messages: Message[] = [
    {
      role: 'system',
      contenu: promptSysteme
    },
    {
      role: 'user',
      contenu: promptUtilisateur
    }
  ];
  
  // 4. Créer la description pour l'utilisateur
  const descriptionsAction: Record<TypeAction, string> = {
    ameliorer: 'Amélioration du texte',
    corriger: 'Correction des erreurs',
    raccourcir: 'Raccourcissement du texte',
    allonger: 'Développement du texte'
  };
  
  return {
    messages,
    description: descriptionsAction[action]
  };
}

/**
 * Construire un prompt personnalisé
 * Pour des cas d'usage avancés
 * 
 * @param instructionsSysteme - Instructions système personnalisées
 * @param instructionsUtilisateur - Instructions utilisateur personnalisées
 * @returns Messages formatés pour WebLLM
 */
export function construirePromptPersonnalise(
  instructionsSysteme: string,
  instructionsUtilisateur: string
): Message[] {
  return [
    {
      role: 'system',
      contenu: instructionsSysteme
    },
    {
      role: 'user',
      contenu: instructionsUtilisateur
    }
  ];
}