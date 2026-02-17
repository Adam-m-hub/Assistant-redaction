// src/store/storeModele.ts
// Store Zustand pour gérer l'état du modèle WebLLM

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
 */
interface EtatModele {
  // État
  statut: StatutModele;
  progression: ProgressionChargement | null;
  erreur: ErreurWebLLM | null;
  nomModele: string | null;
  generationEnCours: boolean;
  derniereReponse: ReponseModele | null;
  texteEnCours: string;
  modeNuit: boolean;
  parametres: {
    style: string;
    ton: string;
    longueur: string;
  } | null;
  
  // Actions
  chargerModele: (nomModele: string) => Promise<void>;
  genererTexte: (messages: Message[]) => Promise<ReponseModele | null>;
  effacerErreur: () => void;
  dechargerModele: () => Promise<void>;
  effacerSuggestion: () => void;
  toggleModeNuit: () => void;
  mettreAJourParametres: (params: { style?: string; ton?: string; longueur?: string }) => void;
}

/**
 * Créer le store Zustand
 */
export const useStoreModele = create<EtatModele>()(
  persist(
    (set, get) => {
      // Enregistrer les observateurs
      serviceMoteur.enregistrerObservateurs({
        surChangementStatut: (nouveauStatut: StatutModele) => {
          set({ statut: nouveauStatut });
          if (nouveauStatut === 'pret') {
            set({ progression: null });
          }
        },
        
        surProgression: (nouvelleProgression: ProgressionChargement) => {
          set({ progression: nouvelleProgression });
        },
        
        surErreur: (nouvelleErreur: ErreurWebLLM) => {
          console.error('❌ Erreur :', nouvelleErreur.message);
          set({ 
            erreur: nouvelleErreur,
            generationEnCours: false 
          });
        }
      });

      return {
        // État initial
        statut: 'inactif',
        progression: null,
        erreur: null,
        nomModele: null,
        generationEnCours: false,
        derniereReponse: null,
        texteEnCours: '',
        modeNuit: false,
        parametres: null,

        // Actions
        chargerModele: async (nomModele: string) => {
          try {
            set({ erreur: null, nomModele });
            await serviceMoteur.chargerModele({
              nom: nomModele,
              description: "Modèle chargé depuis l'interface"
            });
          } catch (erreur) {
            console.error('❌ Échec du chargement :', erreur);
          }
        },

        /**
         * Génère du texte avec les messages fournis
         * Les messages sont construits dans App.tsx via construirePrompt()
         */
        genererTexte: async (messages: Message[]) => {
          try {
            // Vérification : Modèle prêt
            if (!serviceMoteur.estPret()) {
              const erreur: ErreurWebLLM = {
                code: 'MODELE_NON_PRET',
                message: 'Le modèle doit être chargé avant de générer du texte'
              };
              set({ erreur });
              return null;
            }

            set({ 
              generationEnCours: true, 
              erreur: null,
              texteEnCours: ''
            });

            // Adapter max_tokens selon la longueur
            const parametres = get().parametres;
            const maxTokens = parametres?.longueur === 'court' ? 300 
              : parametres?.longueur === 'moyen' ? 600 
              : parametres?.longueur === 'long' ? 1000 
              : 600;

            // Générer avec streaming
            const reponse = await serviceMoteur.genererTexte(
              messages,
              { 
                longueurMaximale: maxTokens,
                temperature: 0.7,
                topP: 0.9
              },
              (chunk: string) => {
                // Streaming : mise à jour en temps réel
                set((state) => ({
                  texteEnCours: state.texteEnCours + chunk
                }));
              }
            );

            set({ 
              derniereReponse: reponse,
              generationEnCours: false,
              texteEnCours: ''
            });

            return reponse;

          } catch (erreur) {
            console.error('❌ Erreur génération :', erreur);
            
            set({ 
              generationEnCours: false,
              erreur: erreur as ErreurWebLLM,
              texteEnCours: ''
            });
            
            return null;
          }
        },

        effacerErreur: () => {
          set({ erreur: null });
        },

        dechargerModele: async () => {
          try {
            await serviceMoteur.dechargerModele();
            
            set({ 
              statut: 'inactif',
              nomModele: null,
              progression: null,
              derniereReponse: null
            });
          } catch (erreur) {
            console.error('❌ Erreur déchargement :', erreur);
          }
        },

        effacerSuggestion: () => {
          set({ derniereReponse: null });
        },

        mettreAJourParametres: (params) => {
          set((state) => ({
            parametres: { 
              ...state.parametres, 
              ...params 
            } as { style: string; ton: string; longueur: string }
          }));
        },

        toggleModeNuit: () => {
          const nouveauMode = !get().modeNuit;
          set({ modeNuit: nouveauMode });
          
          if (nouveauMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        },
      };
    },
    {
      name: 'assistant-redaction-storage',
      partialize: (state) => ({
        modeNuit: state.modeNuit,
        parametres: state.parametres,
      }),
    }
  )
);
