// src/store/storePersonas.ts
// 🔒 VERSION SÉCURISÉE avec protection contre prompt injection
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Persona, StorePersonas, CreerPersonaParams } from '../types/personas';
import { PERSONAS_PREDEFINIS } from '../lib/personas/personasPredefinis';
import { servicePersonasDB } from '../lib/storage/servicePersonas';

// ============================================
// 🔒 FONCTIONS DE SÉCURITÉ (RÉSUMÉES)
// ============================================

/**
 * 🔒 Nettoyer les inputs contre l'injection de prompt
 * Version résumée mais logique identique
 */
function nettoyerInputPersona(texte: string): string {
  // Tous les patterns dangereux regroupés
  const patternsDangereux = [
    /ignore.*(instruction|règle|prompt|système|commande)/gi,
    /tu es (maintenant|désormais|dorénavant)/gi,
    /réponds?.*(à|a)?.*(question|requête)/gi,
    /oublie (tout|les|ton)/gi,
    /change.*(rôle|comportement|ton|mission)/gi,
    /(système|assistant|user)\s*:/gi,
    /<\/?système>/gi,
    /execute|exécute/gi,
    /<TEXTE_UTILISATEUR>|<\/TEXTE_UTILISATEUR>/gi,
    /<INSTRUCTIONS_SYSTEME>|<\/INSTRUCTIONS_SYSTEME>/gi,
    /ne (fais|fait) (pas|plus)/gi,
    /arrête de|cesse de/gi,
  ];

  let texteNettoye = texte;
  let patternDetecte = false;

  patternsDangereux.forEach(pattern => {
    if (pattern.test(texteNettoye)) {
      patternDetecte = true;
      texteNettoye = texteNettoye.replace(pattern, '[CONTENU_FILTRÉ]');
    }
  });

  if (patternDetecte) console.warn('⚠️ SÉCURITÉ : Pattern suspect filtré');

  // Échappement XML
  texteNettoye = texteNettoye.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Limite de longueur
  if (texteNettoye.length > 500) {
    console.warn('⚠️ Texte tronqué : dépassement de 500 caractères');
    texteNettoye = texteNettoye.substring(0, 500) + '...';
  }

  return texteNettoye.trim();
}

/**
 *  Valider et nettoyer les expertises
 * Version résumée mais logique identique
 */
function validerExpertises(expertises: string[]): string[] {
  const expertisesNettoyees = expertises
    .map(nettoyerInputPersona)
    .filter(exp => exp.length > 0 && !exp.includes('[CONTENU_FILTRÉ]'))
    .slice(0, 10);

  return expertisesNettoyees.length > 0 
    ? expertisesNettoyees 
    : ['Rédaction générale'];
}

/**
 *  Validation des paramètres
 * Version résumée mais logique identique
 */
function validerParametresPersona(params: CreerPersonaParams): void {
  if (!params.nom?.trim() || params.nom.trim().length < 2) {
    throw new Error('Le nom doit contenir au moins 2 caractères');
  }
  if (!params.description?.trim() || params.description.trim().length < 10) {
    throw new Error('La description doit contenir au moins 10 caractères');
  }
  if (!params.expertise?.length) {
    throw new Error('Au moins une expertise est requise');
  }
}

/**
 *  Générer un prompt système simplifié
 * Version résumée mais logique identique
 */
function genererSystemPrompt(params: Partial<CreerPersonaParams>): string {
  const descriptionNettoyee = params.description 
    ? nettoyerInputPersona(params.description)
    : 'assistant de rédaction';
  return descriptionNettoyee;
}

// ============================================
// STORE ZUSTAND (NON MODIFIÉ - reste exactement comme avant)
// ============================================

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
       *  SÉCURISÉ : Créer un nouveau persona personnalisé
       */
      creerPersona: async (params: CreerPersonaParams) => {
        try {
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('🔒 CRÉATION PERSONA SÉCURISÉE');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

          //  VALIDATION DES INPUTS
          validerParametresPersona(params);

          //  NETTOYER LE NOM
          const nomNettoye = nettoyerInputPersona(params.nom);
          
          if (nomNettoye === '[CONTENU_FILTRÉ]' || nomNettoye.length < 2) {
            throw new Error('Le nom contient du contenu non autorisé');
          }

          //  NETTOYER LA DESCRIPTION
          const descriptionNettoyee = nettoyerInputPersona(params.description);
          
          if (descriptionNettoyee === '[CONTENU_FILTRÉ]' || descriptionNettoyee.length < 10) {
            throw new Error('La description contient trop de contenu non autorisé');
          }

          //  NETTOYER LES EXPERTISES
          const expertisesNettoyees = validerExpertises(params.expertise);

          //  NETTOYER L'EXEMPLE
          const exempleNettoye = params.exempleTexte 
            ? nettoyerInputPersona(params.exempleTexte)
            : '';

          //  LOGS DE SÉCURITÉ
          console.log('Nom nettoyé:', nomNettoye);
          console.log('Expertises nettoyées:', expertisesNettoyees);
          console.log('Description sûre:', descriptionNettoyee.length, 'caractères');

          // Générer un ID unique
          const id = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          //  Créer le persona avec données NETTOYÉES
          const nouveauPersona: Persona = {
            id,
            nom: nomNettoye,
            description: descriptionNettoyee,
            expertise: expertisesNettoyees,
            exempleTexte: exempleNettoye,
            systemPrompt: genererSystemPrompt({
              ...params,
              nom: nomNettoye,
              description: descriptionNettoyee,
              expertise: expertisesNettoyees,
              exempleTexte: exempleNettoye
            }),
            estPredefini: false,
            temperature: params.temperature || 0.7,
            creeLe: new Date(),
            modifieLe: new Date(),
          };

          console.log('✅ SystemPrompt généré avec sécurité (300 premiers caractères):');
          console.log(nouveauPersona.systemPrompt.substring(0, 300) + '...');

          // Sauvegarder dans IndexedDB
          await servicePersonasDB.sauvegarder(nouveauPersona);

          // Ajouter au store
          set((state) => ({
            personas: [...state.personas, nouveauPersona],
            personaActif: nouveauPersona,
          }));

          console.log(`✅ Persona créé avec sécurité : ${nouveauPersona.nom}`);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

          return nouveauPersona;

        } catch (erreur) {
          console.error('❌ Erreur création persona:', erreur);
          throw erreur;
        }
      },

      /**
       *  SÉCURISÉ : Modifier un persona existant
       */
      modifierPersona: async (id: string, params: Partial<CreerPersonaParams>) => {
        try {
          console.log('🔒 Modification sécurisée du persona:', id);

          const personaExistant = get().personas.find(p => p.id === id);

          if (!personaExistant) {
            throw new Error(`Persona non trouvé : ${id}`);
          }

          if (personaExistant.estPredefini) {
            throw new Error('Impossible de modifier un persona prédéfini');
          }

          //  NETTOYER LES INPUTS MODIFIÉS
          const paramsNettoyés: Partial<CreerPersonaParams> = {};

          if (params.nom) {
            paramsNettoyés.nom = nettoyerInputPersona(params.nom);
          }

          if (params.description) {
            paramsNettoyés.description = nettoyerInputPersona(params.description);
          }

          if (params.expertise) {
            paramsNettoyés.expertise = validerExpertises(params.expertise);
          }

          if (params.exempleTexte) {
            paramsNettoyés.exempleTexte = nettoyerInputPersona(params.exempleTexte);
          }

          if (params.temperature !== undefined) {
            paramsNettoyés.temperature = params.temperature;
          }

          //  Fusionner les modifications NETTOYÉES
          const personaModifie: Persona = {
            ...personaExistant,
            ...paramsNettoyés,
            systemPrompt: genererSystemPrompt({ ...personaExistant, ...paramsNettoyés }),
            modifieLe: new Date(),
          };

          // Sauvegarder dans IndexedDB
          await servicePersonasDB.sauvegarder(personaModifie);

          // Mettre à jour le store
          set((state) => ({
            personas: state.personas.map(p => p.id === id ? personaModifie : p),
            personaActif: state.personaActif?.id === id ? personaModifie : state.personaActif,
          }));

          console.log(`✅ Persona modifié avec sécurité : ${personaModifie.nom}`);

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