// src/lib/storage/serviceHistorique.ts
// Service pour gérer l'historique dans IndexedDB

import type { EntreeHistorique } from '../../types/historique';

const DB_NAME = 'assistant-redaction-db';
const DB_VERSION = 2; // Incrémenté pour ajouter le store historique
const STORE_HISTORIQUE = 'historique';
const MAX_ENTREES = 50; // Limite d'historique

/**
 * Service pour gérer l'historique dans IndexedDB
 */
class ServiceHistoriqueDB {
  private db: IDBDatabase | null = null;

  /**
   * Initialiser la connexion à IndexedDB
   */
  private async initialiser(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Erreur lors de l\'ouverture de IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Créer le store historique s'il n'existe pas
        if (!db.objectStoreNames.contains(STORE_HISTORIQUE)) {
          const store = db.createObjectStore(STORE_HISTORIQUE, { keyPath: 'id' });
          store.createIndex('dateModification', 'dateModification', { unique: false });
        }
      };
    });
  }

  /**
   * Sauvegarder une entrée d'historique
   */
  async sauvegarder(entree: EntreeHistorique): Promise<void> {
    const db = await this.initialiser();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_HISTORIQUE], 'readwrite');
      const store = transaction.objectStore(STORE_HISTORIQUE);

      // Convertir la date en string pour IndexedDB
      const entreeSerializable = {
        ...entree,
        dateModification: entree.dateModification.toISOString()
      };

      const request = store.put(entreeSerializable);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Erreur lors de la sauvegarde de l\'historique'));
    });
  }

  /**
   * Récupérer toutes les entrées d'historique
   */
  async recupererTous(): Promise<EntreeHistorique[]> {
    const db = await this.initialiser();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_HISTORIQUE], 'readonly');
      const store = transaction.objectStore(STORE_HISTORIQUE);
      const request = store.getAll();

      request.onsuccess = () => {
        const entrees = request.result.map((entree: any) => ({
          ...entree,
          dateModification: new Date(entree.dateModification)
        }));

        // Trier par date (plus récent en premier)
        entrees.sort((a, b) => b.dateModification.getTime() - a.dateModification.getTime());

        resolve(entrees);
      };

      request.onerror = () => reject(new Error('Erreur lors de la récupération de l\'historique'));
    });
  }

  /**
   * Supprimer une entrée d'historique
   */
  async supprimer(id: string): Promise<void> {
    const db = await this.initialiser();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_HISTORIQUE], 'readwrite');
      const store = transaction.objectStore(STORE_HISTORIQUE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Erreur lors de la suppression de l\'historique'));
    });
  }

  /**
   * Supprimer tout l'historique
   */
  async supprimerTout(): Promise<void> {
    const db = await this.initialiser();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_HISTORIQUE], 'readwrite');
      const store = transaction.objectStore(STORE_HISTORIQUE);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Erreur lors de la suppression de l\'historique'));
    });
  }

  /**
   * Limiter le nombre d'entrées (garder les MAX_ENTREES plus récentes)
   */
  async limiterEntrees(): Promise<void> {
    const entrees = await this.recupererTous();

    if (entrees.length > MAX_ENTREES) {
      // Supprimer les plus anciennes
      const aSupprimer = entrees.slice(MAX_ENTREES);
      
      for (const entree of aSupprimer) {
        await this.supprimer(entree.id);
      }

      console.log(` ${aSupprimer.length} anciennes entrées supprimées (limite: ${MAX_ENTREES})`);
    }
  }
}

// Export de l'instance unique
export const serviceHistoriqueDB = new ServiceHistoriqueDB();
