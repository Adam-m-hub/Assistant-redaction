// src/store/storeHistorique.ts
// Store Zustand pour gérer l'historique

import { create } from 'zustand';
import type { StoreHistorique, EntreeHistorique } from '../types/historique';
import { serviceHistoriqueDB } from '../lib/storage/serviceHistorique';

/**
 * Store Zustand pour l'historique
 */
export const useStoreHistorique = create<StoreHistorique>((set, get) => ({
  // ============================================
  // ÉTAT INITIAL
  // ============================================
  historique: [],
  modaleOuverte: false,

  // ============================================
  // ACTIONS
  // ============================================

  /**
   * Charger l'historique depuis IndexedDB
   */
  chargerHistorique: async () => {
    try {
    //  console.log('📚 Chargement de l\'historique...');
      const entrees = await serviceHistoriqueDB.recupererTous();
      set({ historique: entrees });
      console.log(`✅ ${entrees.length} entrées d'historique chargées`);
    } catch (erreur) {
      console.error('❌ Erreur chargement historique:', erreur);
    }
  },

  /**
   * Ajouter une nouvelle entrée d'historique
   */
  ajouterEntree: async (entree) => {
    try {
      // Générer un ID unique
      const id = `hist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const nouvelleEntree: EntreeHistorique = {
        ...entree,
        id,
        dateModification: new Date(),
      };

      // Sauvegarder dans IndexedDB
      await serviceHistoriqueDB.sauvegarder(nouvelleEntree);

      // Ajouter au store (en début de liste)
      set((state) => ({
        historique: [nouvelleEntree, ...state.historique]
      }));

      console.log('✅ Entrée ajoutée à l\'historique');

      // Limiter le nombre d'entrées
      await serviceHistoriqueDB.limiterEntrees();
      
      // Recharger pour être sûr d'avoir la liste à jour
      await get().chargerHistorique();

    } catch (erreur) {
      console.error('❌ Erreur ajout historique:', erreur);
      throw erreur;
    }
  },

  /**
   * Supprimer une entrée d'historique
   */
  supprimerEntree: async (id) => {
    try {
      await serviceHistoriqueDB.supprimer(id);

      set((state) => ({
        historique: state.historique.filter(e => e.id !== id)
      }));

    //  console.log('🗑️ Entrée supprimée de l\'historique');
    } catch (erreur) {
      console.error('❌ Erreur suppression historique:', erreur);
      throw erreur;
    }
  },

  /**
   * Supprimer tout l'historique
   */
  supprimerTout: async () => {
    try {
      await serviceHistoriqueDB.supprimerTout();

      set({ historique: [] });

     //  console.log('🗑️ Tout l\'historique a été supprimé');
    } catch (erreur) {
      console.error('❌ Erreur suppression historique:', erreur);
      throw erreur;
    }
  },

  /**
   * Ouvrir la modale d'historique
   */
  ouvrirModale: () => {
    set({ modaleOuverte: true });
  },

  /**
   * Fermer la modale d'historique
   */
  fermerModale: () => {
    set({ modaleOuverte: false });
  },
}));
