// src/store/storeModele.ts
// Store Zustand pour gérer l'état du modèle WebLLM

import { create } from 'zustand';
import { serviceMoteur } from '../lib/webllm/moteur';
import type { 
  StatutModele, 
  ProgressionChargement, 
  ErreurWebLLM,
  Message,
  ReponseModele 
} from '../lib/webllm/types';

/**
 * Interface de l'état du store
 * Décrit toutes les données stockées
 */
interface EtatModele {
  // ============================================
  // ÉTAT (Données)
  // ============================================
  statut: StatutModele; // Statut actuel du modèle

  progression: ProgressionChargement | null;   // Progression du chargement (0-100) 
  
  erreur: ErreurWebLLM | null;  // Dernière erreur survenue 

  nomModele: string | null;   // Nom du modèle actuellement chargé 
  
  generationEnCours: boolean;  // Indique si une génération est en cours
  
  derniereReponse: ReponseModele | null;   // Dernière réponse générée
  // ============================================
  // ACTIONS (Fonctions)
  // ============================================
  
  /**
   * Charger le modèle WebLLM
   * 
   * @param nomModele - Nom du modèle à charger
   * 
   * Exemple :
   *   chargerModele("Phi-3-mini-4k-instruct-q4f16_1-MLC")
   */
  chargerModele: (nomModele: string) => Promise<void>;
  
  /**
   * Générer du texte avec le modèle
   * 
   * @param messages - Messages de la conversation
   * @returns La réponse générée
   * 
   * Exemple :
   *   const reponse = await genererTexte([
   *     { role: 'user', contenu: 'Bonjour' }
   *   ]);
   */
  genererTexte: (messages: Message[]) => Promise<ReponseModele | null>;
  
  
  effacerErreur: () => void; //Réinitialiser l'erreur
  
  dechargerModele: () => Promise<void>;   // Décharger le modèle
  
  effacerSuggestion: () => void;   // Effacer la suggestion (dernière réponse)
}

/**
 * Créer le store Zustand
 * 
 * Utilisation dans un composant React :
 *   const { statut, chargerModele } = useStoreModele();
 */
export const useStoreModele = create<EtatModele>((set, _get) => {
  
  // ============================================
  // ENREGISTRER LES OBSERVATEURS
  // Connecter le service WebLLM au store
  // ============================================
  
  serviceMoteur.enregistrerObservateurs({
    // Quand le statut change
    surChangementStatut: (nouveauStatut: StatutModele) => {
      console.log('📊 Statut changé :', nouveauStatut);
      set({ statut: nouveauStatut });
      
      // Si le modèle est prêt, effacer la progression
      if (nouveauStatut === 'pret') {
        set({ progression: null });
      }
    },
    
    // Quand la progression avance
    surProgression: (nouvelleProgression: ProgressionChargement) => {
      console.log(`📈 Progression : ${nouvelleProgression.pourcentage}%`);
      set({ progression: nouvelleProgression });
    },
    
    // Quand une erreur survient
    surErreur: (nouvelleErreur: ErreurWebLLM) => {
      console.error('❌ Erreur :', nouvelleErreur);
      set({ 
        erreur: nouvelleErreur,
        generationEnCours: false 
      });
    }
  });

  // ============================================
  // ÉTAT INITIAL
  // ============================================
  
  return {
    // État initial
    statut: 'inactif',
    progression: null,
    erreur: null,
    nomModele: null,
    generationEnCours: false,
    derniereReponse: null,

    // ============================================
    // ACTIONS
    // ============================================

    /**
     * Charger le modèle WebLLM
     */
    chargerModele: async (nomModele: string) => {
      try {
        console.log(`🚀 Demande de chargement du modèle : ${nomModele}`);
        
        // Effacer les anciennes erreurs
        set({ erreur: null, nomModele });
        
        // Charger le modèle via le service
        await serviceMoteur.chargerModele({
          nom: nomModele,
          description: "Modèle chargé depuis l'interface"
        });
        
        console.log('✅ Modèle chargé avec succès !');
        
      } catch (erreur) {
        console.error('❌ Échec du chargement :', erreur);
        // L'erreur est déjà gérée par l'observateur surErreur
      }
    },

    /**
     * Générer du texte
     */
    genererTexte: async (messages: Message[]) => {
      try {
        // Vérifier que le modèle est prêt
        if (!serviceMoteur.estPret()) {
          const erreur: ErreurWebLLM = {
            code: 'MODELE_NON_PRET',
            message: 'Le modèle doit être chargé avant de générer du texte'
          };
          set({ erreur });
          return null;
        }

        console.log('🤔 Génération de texte en cours...');
        
        // Indiquer qu'une génération est en cours
        set({ 
          generationEnCours: true, 
          erreur: null 
        });

        // Générer le texte
        const reponse = await serviceMoteur.genererTexte(messages);
        
        console.log('✅ Texte généré :', reponse.texte.substring(0, 50) + '...');
        
        // Mettre à jour l'état
        // Nettoyer le texte (enlever les guillemets)
            const texteNettoye = reponse.texte
            .trim()
            .replace(/^["«]/, '')   
            .replace(/["»]$/, '')   
            .trim();
                // Mettre à jour l'état avec le texte nettoyé
        set({ 
        derniereReponse: {
            ...reponse,
            texte: texteNettoye
        },
        generationEnCours: false 
        });

        return reponse;

      } catch (erreur) {
        console.error('❌ Erreur lors de la génération :', erreur);
        
        set({ 
          generationEnCours: false,
          erreur: erreur as ErreurWebLLM
        });
        
        return null;
      }
    },

    /**
     * Effacer l'erreur
     */
    effacerErreur: () => {
      set({ erreur: null });
    },

    /**
     * Décharger le modèle
     */
    dechargerModele: async () => {
      try {
        console.log('🗑️ Déchargement du modèle...');
        
        await serviceMoteur.dechargerModele();
        
        set({ 
          statut: 'inactif',
          nomModele: null,
          progression: null,
          derniereReponse: null
        });
        
        console.log('✅ Modèle déchargé');
        
      } catch (erreur) {
        console.error('❌ Erreur lors du déchargement :', erreur);
      }
    },
          /**
       * Effacer la suggestion
       */
      effacerSuggestion: () => {
        set({ 
          derniereReponse: null 
        });
      },
  };
});