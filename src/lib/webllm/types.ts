// src/lib/webllm/types.ts
// Types pour le service WebLLM 
export type StatutModele = 'inactif' | 'chargement' | 'pret' | 'erreur';
/**
 * Progression du chargement du modèle
 */
export interface ProgressionChargement {
  pourcentage: number;        // 0 à 100
  etape: string;              // Description de l'étape actuelle
  octetsCharges?: number;     // Octets téléchargés (optionnel)
  octetsTotal?: number;       // Taille totale (optionnel)
}

/**
 * Configuration du modèle à charger
 */
export interface ConfigurationModele {
  nom: string;                // Nom du modèle (ex: "Phi-3-mini-4k-instruct-q4f16_1-MLC")
  tailleMemoire?: number;     // Mémoire estimée nécessaire en Mo
  description?: string;       // Description du modèle
}

/**
 * Paramètres de génération de texte
 */
export interface ParametresGeneration {
  temperature: number;         // 0 à 1 - Créativité (0 = précis, 1 = créatif)
  longueurMaximale: number;    // Nombre maximum de tokens à générer
  topP: number;                // 0 à 1 - Diversité des choix
  penaliteFrequence?: number;  // Pénalité pour éviter les répétitions
}

/**
 * Message dans une conversation
 */
export interface Message {
  role: 'system' | 'user' | 'assistant';  // Rôle du message
  contenu: string;                         // Contenu du message
}

/**
 * Réponse générée par le modèle
 */
export interface ReponseModele {
  texte: string;              // Texte généré
  tokensUtilises: number;     // Nombre de tokens utilisés
  tempsGeneration: number;    // Temps en millisecondes
}

/**
 * Erreur du service WebLLM
 */
export interface ErreurWebLLM {
  code: string;               // Code d'erreur
  message: string;            // Message d'erreur
  details?: string;           // Détails supplémentaires
}