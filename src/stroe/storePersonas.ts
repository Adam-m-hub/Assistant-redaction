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
           //  style: params.style,
            // ton: params.ton,
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

    // ✅ Fusionner les modifications (SANS style/ton)
    const personaModifie: Persona = {
      ...personaExistant,
      ...params,
      systemPrompt: genererSystemPrompt({ ...personaExistant, ...params }),
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
  return `Tu es un expert spécialisé dans : ${params.expertise?.join(', ') || 'rédaction générale'}.

Description de ton rôle :
${params.description || 'Assistant de rédaction professionnel'}

Tes caractéristiques :
- Maîtrise parfaite de tes domaines : ${params.expertise?.join(', ') || 'rédaction'}
- Style adapté à ton expertise
- Vocabulaire spécifique à ton domaine
- Structure claire et cohérente

${params.exempleTexte ? `Exemple du style attendu :
"${params.exempleTexte}"

Écris toujours dans un style similaire à cet exemple.` : ''}

RÈGLES ABSOLUES À RESPECTER :
- Réponds UNIQUEMENT avec le texte demandé, RIEN d'autre
- INTERDICTION STRICTE d'ajouter des explications, commentaires ou notes
- INTERDICTION d'utiliser des astérisques (*) ou des annotations
- Ne dis JAMAIS "Voici", "J'ai amélioré", ou toute autre introduction
- Ne mentionne JAMAIS les modifications que tu as faites
- Écris UNIQUEMENT le résultat final, comme si c'était toi qui l'avais écrit
- Respecte toujours la langue du texte original
- Garde le sens général du texte
- Sois naturel et fluide dans ton écriture
- Reste dans le rôle de cet expert
- Pas d'explications ni de commentaires
- Adapte ton style selon les paramètres du panneau latéral.`;
}
 