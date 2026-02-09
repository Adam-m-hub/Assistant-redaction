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
          console.log('📊 Statut changé :', nouveauStatut);
          set({ statut: nouveauStatut });
          if (nouveauStatut === 'pret') {
            set({ progression: null });
          }
        },
        
        surProgression: (nouvelleProgression: ProgressionChargement) => {
          set({ progression: nouvelleProgression });
        },
        
        surErreur: (nouvelleErreur: ErreurWebLLM) => {
          console.error('❌ Erreur :', nouvelleErreur);
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
            console.log(`🚀 Chargement du modèle : ${nomModele}`);
            set({ erreur: null, nomModele });
            
            await serviceMoteur.chargerModele({
              nom: nomModele,
              description: "Modèle chargé depuis l'interface"
            });
            
            console.log('✅ Modèle chargé avec succès !');
          } catch (erreur) {
            console.error('❌ Échec du chargement :', erreur);
          }
        },

        /**
         * ✅ SIMPLIFIÉ : Génère directement avec les messages fournis
         * Les messages sont DÉJÀ construits dans App.tsx via construirePrompt()
         */
        genererTexte: async (messages: Message[]) => {
          try {
            // 🔒 VÉRIFICATION : Modèle prêt
            if (!serviceMoteur.estPret()) {
              const erreur: ErreurWebLLM = {
                code: 'MODELE_NON_PRET',
                message: 'Le modèle doit être chargé avant de générer du texte'
              };
              set({ erreur });
              return null;
            }

            // 📊 CONSOLE LOG - Avant envoi au modèle
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log("🚀 STORE : Envoi des messages au modèle");
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log("Nombre de messages :", messages.length);
            messages.forEach((msg, index) => {
              console.log(`\n[Message ${index + 1}] Rôle : ${msg.role.toUpperCase()}`);
              console.log("Contenu (100 premiers caractères) :", 
                msg.contenu.substring(0, 100) + (msg.contenu.length > 100 ? '...' : ''));
            });
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

            console.log('🤔 Génération de texte en cours...');
            
            set({ 
              generationEnCours: true, 
              erreur: null,
              texteEnCours: ''
            });

            // Adapter max_tokens selon la longueur du panneau
            const parametres = get().parametres;
            let maxTokens = 600; // Par défaut
            
            if (parametres?.longueur === 'court') {
              maxTokens = 300;
            } else if (parametres?.longueur === 'moyen') {
              maxTokens = 600;
            } else if (parametres?.longueur === 'long') {
              maxTokens = 1000;
            }

            console.log(`⚙️ Paramètres de génération : max_tokens = ${maxTokens}`);

            // ✅ Générer avec les messages (déjà prêts !)
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
            
            console.log('✅ Texte généré avec', maxTokens, 'tokens max');
            console.log('📏 Longueur de la réponse :', reponse.texte.length, 'caractères');
            
            // Nettoyer le texte (enlever guillemets au début/fin)
            const texteNettoye = reponse.texte
              .trim()
              .replace(/^["«]/, '')   
              .replace(/["»]$/, '')   
              .trim();

            console.log('🧹 Texte nettoyé :', texteNettoye.substring(0, 100) + '...');

            set({ 
              derniereReponse: {
                ...reponse,
                texte: texteNettoye
              },
              generationEnCours: false,
              texteEnCours: ''
            });

            return reponse;

          } catch (erreur) {
            console.error('❌ Erreur lors de la génération :', erreur);
            
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

        effacerSuggestion: () => {
          set({ derniereReponse: null });
        },

        mettreAJourParametres: (params) => {
          console.log('⚙️ Mise à jour des paramètres :', params);
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
          
          console.log('🌙 Mode nuit :', nouveauMode ? 'Activé' : 'Désactivé');
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
