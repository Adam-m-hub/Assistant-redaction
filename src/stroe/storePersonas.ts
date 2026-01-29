// src/store/storePersonas.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Persona, StorePersonas, CreerPersonaParams } from '../types/personas';
import { PERSONAS_PREDEFINIS } from '../lib/personas/personasPredefinis';
import { servicePersonasDB } from '../lib/storage/servicePersonas';

/**
 * Store Zustand pour gérer les personas
 */
export const useStorePersonas = create<StorePersonas>()(
  persist(
    (set, get) => ({
      // ============================================
      // ÉTAT INITIAL
      // ============================================
      personas: [],
      personaActif: null,

      // ============================================
      // ACTIONS
      // ============================================

      /**
       * Charger tous les personas (prédéfinis + personnalisés)
       */
      chargerPersonas: async () => {
        try {
          console.log('📚 Chargement des personas...');

          // Récupérer les personas personnalisés depuis IndexedDB
          const personasDB = await servicePersonasDB.recupererTous();

          // Fusionner prédéfinis et personnalisés
          const tousLesPersonas = [
            ...PERSONAS_PREDEFINIS,
            ...personasDB.filter(p => !p.estPredefini)
          ];

          set({ personas: tousLesPersonas });

          console.log(`✅ ${tousLesPersonas.length} personas chargés`);

          // Si aucun persona actif, sélectionner le journaliste par défaut
          if (!get().personaActif && tousLesPersonas.length > 0) {
            set({ personaActif: tousLesPersonas[0] });
          }

        } catch (erreur) {
          console.error('❌ Erreur chargement personas:', erreur);
        }
      },

      /**
       * Sélectionner un persona
       */
      selectionnerPersona: (id: string) => {
        const persona = get().personas.find(p => p.id === id);
        
        if (persona) {
          set({ personaActif: persona });
          console.log(`👤 Persona sélectionné : ${persona.nom}`);
        } else {
          console.warn(`⚠️ Persona non trouvé : ${id}`);
        }
      },

      /**
       * Créer un nouveau persona personnalisé
       */
      creerPersona: async (params: CreerPersonaParams) => {
        try {
          // Générer un ID unique
          const id = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          // Créer le persona
          const nouveauPersona: Persona = {
            id,
            nom: params.nom,
            description: params.description,
            style: params.style,
            ton: params.ton,
            expertise: params.expertise,
            exempleTexte: params.exempleTexte || '',
            systemPrompt: genererSystemPrompt(params),
            estPredefini: false,
            temperature: params.temperature || 0.7,
            creeLe: new Date(),
            modifieLe: new Date(),
          };

          // Sauvegarder dans IndexedDB
          await servicePersonasDB.sauvegarder(nouveauPersona);

          // Ajouter au store
          set((state) => ({
            personas: [...state.personas, nouveauPersona],
            personaActif: nouveauPersona,
          }));

          console.log(`✅ Persona créé : ${nouveauPersona.nom}`);

          return nouveauPersona;

        } catch (erreur) {
          console.error('❌ Erreur création persona:', erreur);
          throw erreur;
        }
      },

      /**
       * Modifier un persona existant
       */
      modifierPersona: async (id: string, params: Partial<CreerPersonaParams>) => {
        try {
          const personaExistant = get().personas.find(p => p.id === id);

          if (!personaExistant) {
            throw new Error(`Persona non trouvé : ${id}`);
          }

          if (personaExistant.estPredefini) {
            throw new Error('Impossible de modifier un persona prédéfini');
          }

          // Fusionner les modifications
          const personaModifie: Persona = {
            ...personaExistant,
            ...params,
            systemPrompt: params.style || params.ton 
              ? genererSystemPrompt({ ...personaExistant, ...params })
              : personaExistant.systemPrompt,
            modifieLe: new Date(),
          };

          // Sauvegarder dans IndexedDB
          await servicePersonasDB.sauvegarder(personaModifie);

          // Mettre à jour le store
          set((state) => ({
            personas: state.personas.map(p => p.id === id ? personaModifie : p),
            personaActif: state.personaActif?.id === id ? personaModifie : state.personaActif,
          }));

          console.log(`✅ Persona modifié : ${personaModifie.nom}`);

        } catch (erreur) {
          console.error('❌ Erreur modification persona:', erreur);
          throw erreur;
        }
      },

      /**
       * Supprimer un persona personnalisé
       */
      supprimerPersona: async (id: string) => {
        try {
          const persona = get().personas.find(p => p.id === id);

          if (!persona) {
            throw new Error(`Persona non trouvé : ${id}`);
          }

          if (persona.estPredefini) {
            throw new Error('Impossible de supprimer un persona prédéfini');
          }

          // Supprimer de IndexedDB
          await servicePersonasDB.supprimer(id);

          // Retirer du store
          set((state) => {
            const nouveauxPersonas = state.personas.filter(p => p.id !== id);
            
            // Si c'était le persona actif, sélectionner le premier
            const nouveauActif = state.personaActif?.id === id 
              ? nouveauxPersonas[0] 
              : state.personaActif;

            return {
              personas: nouveauxPersonas,
              personaActif: nouveauActif,
            };
          });

          console.log(`🗑️ Persona supprimé : ${persona.nom}`);

        } catch (erreur) {
          console.error('❌ Erreur suppression persona:', erreur);
          throw erreur;
        }
      },

      /**
       * Restaurer les personas par défaut
       */
      restaurerDefauts: async () => {
        try {
          // Supprimer tous les personnalisés
          await servicePersonasDB.supprimerPersonnalises();

          // Recharger
          await get().chargerPersonas();

          console.log('✅ Personas par défaut restaurés');

        } catch (erreur) {
          console.error('❌ Erreur restauration:', erreur);
          throw erreur;
        }
      },
    }),
    {
      name: 'assistant-redaction-personas',
      partialize: (state) => ({
        personaActif: state.personaActif,
      }),
    }
  )
);

/**
 * Générer un system prompt à partir des paramètres
 */
function genererSystemPrompt(params: Partial<CreerPersonaParams>): string {
  return `Tu es un assistant de rédaction spécialisé.

Caractéristiques :
- Style : ${params.style || 'Adapté'}
- Ton : ${params.ton || 'Professionnel'}
- Expertises : ${params.expertise?.join(', ') || 'Rédaction générale'}

Ta mission est de rédiger des textes de qualité en respectant strictement ces caractéristiques.
Sois ${params.ton?.toLowerCase() || 'professionnel'} et adopte un style ${params.style?.toLowerCase() || 'adapté'}.`;
}