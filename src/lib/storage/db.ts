// src/lib/storage/db.ts
// Service de sauvegarde locale avec IndexedDB

import type { StyleEcriture, Ton, Longueur } from '../prompts/templates';

/**
 * Structure d'un document sauvegardé
 */
export interface DocumentSauvegarde {
  id: string;                    // ID unique du document
  titre?: string;                // Titre optionnel
  contenu: string;               // Contenu texte
  dateCreation: Date;            // Date de création
  dateModification: Date;        // Dernière modification
  parametres?: {                 // Paramètres utilisés
    style: StyleEcriture;
    ton: Ton;
    longueur: Longueur;
  };
}

/**
 * Nom de la base de données
 */
const NOM_DB = 'AssistantRedactionDB';

/**
 * Version de la base de données
 */
const VERSION_DB = 1;

/**
 * Nom du store (table)
 */
const NOM_STORE = 'documents';

/**
 * ID spécial pour le brouillon automatique
 */
export const ID_BROUILLON_AUTO = 'brouillon_auto';

/**
 * Ouvrir la connexion à IndexedDB
 * Crée la base si elle n'existe pas
 */
function ouvrirDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    // Ouvrir la base de données
    const requete = indexedDB.open(NOM_DB, VERSION_DB);

    // Erreur d'ouverture
    requete.onerror = () => {
      reject(new Error('Impossible d\'ouvrir IndexedDB'));
    };

    // Succès d'ouverture
    requete.onsuccess = () => {
      resolve(requete.result);
    };

    // Création/mise à jour du schéma
    requete.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Créer le store s'il n'existe pas
      if (!db.objectStoreNames.contains(NOM_STORE)) {
        const objectStore = db.createObjectStore(NOM_STORE, { keyPath: 'id' });
        
        // Créer des index pour rechercher facilement
        objectStore.createIndex('dateModification', 'dateModification', { unique: false });
        objectStore.createIndex('titre', 'titre', { unique: false });
      }
    };
  });
}

/**
 * Sauvegarder un document dans IndexedDB
 * 
 * @param document - Document à sauvegarder
 * @returns Promise résolue quand la sauvegarde est terminée
 * 
 * @example
 * await sauvegarderDocument({
 *   id: 'brouillon_auto',
 *   contenu: 'Mon texte...',
 *   dateCreation: new Date(),
 *   dateModification: new Date()
 * });
 */
export async function sauvegarderDocument(document: DocumentSauvegarde): Promise<void> {
  try {
    const db = await ouvrirDB();

    return new Promise((resolve, reject) => {
      // Créer une transaction en mode lecture/écriture
      const transaction = db.transaction([NOM_STORE], 'readwrite');
      const store = transaction.objectStore(NOM_STORE);

      // Mettre à jour la date de modification
      const documentAJour = {
        ...document,
        dateModification: new Date()
      };

      // Ajouter ou mettre à jour le document
      const requete = store.put(documentAJour);

      requete.onsuccess = () => {
        console.log('✅ Document sauvegardé :', document.id);
        resolve();
      };

      requete.onerror = () => {
        console.error('❌ Erreur sauvegarde :', requete.error);
        reject(new Error('Erreur lors de la sauvegarde'));
      };

      // Fermer la connexion quand la transaction est terminée
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (erreur) {
    console.error('❌ Erreur IndexedDB :', erreur);
    throw erreur;
  }
}

/**
 * Charger un document depuis IndexedDB
 * 
 * @param id - ID du document à charger
 * @returns Le document ou null si non trouvé
 * 
 * @example
 * const doc = await chargerDocument('brouillon_auto');
 * if (doc) {
 *   console.log(doc.contenu);
 * }
 */
export async function chargerDocument(id: string): Promise<DocumentSauvegarde | null> {
  try {
    const db = await ouvrirDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([NOM_STORE], 'readonly');
      const store = transaction.objectStore(NOM_STORE);
      const requete = store.get(id);

      requete.onsuccess = () => {
        const doc = requete.result as DocumentSauvegarde | undefined;
        
        if (doc) {
          console.log('✅ Document chargé :', id);
          // Convertir les dates (stockées en string) en objets Date
          doc.dateCreation = new Date(doc.dateCreation);
          doc.dateModification = new Date(doc.dateModification);
        } else {
          console.log('ℹ️ Document non trouvé :', id);
        }
        
        resolve(doc || null);
      };

      requete.onerror = () => {
        console.error('❌ Erreur chargement :', requete.error);
        reject(new Error('Erreur lors du chargement'));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (erreur) {
    console.error('❌ Erreur IndexedDB :', erreur);
    return null;
  }
}

/**
 * Lister tous les documents sauvegardés
 * 
 * @returns Liste des documents triés par date de modification (plus récent en premier)
 * 
 * @example
 * const docs = await listerDocuments();
 * docs.forEach(doc => console.log(doc.titre));
 */
export async function listerDocuments(): Promise<DocumentSauvegarde[]> {
  try {
    const db = await ouvrirDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([NOM_STORE], 'readonly');
      const store = transaction.objectStore(NOM_STORE);
      const requete = store.getAll();

      requete.onsuccess = () => {
        const documents = (requete.result as DocumentSauvegarde[]).map(doc => ({
          ...doc,
          dateCreation: new Date(doc.dateCreation),
          dateModification: new Date(doc.dateModification)
        }));

        // Trier par date de modification (plus récent en premier)
        documents.sort((a, b) => 
          b.dateModification.getTime() - a.dateModification.getTime()
        );

        console.log(`✅ ${documents.length} document(s) trouvé(s)`);
        resolve(documents);
      };

      requete.onerror = () => {
        console.error('❌ Erreur listage :', requete.error);
        reject(new Error('Erreur lors du listage'));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (erreur) {
    console.error('❌ Erreur IndexedDB :', erreur);
    return [];
  }
}

/**
 * Supprimer un document
 * 
 * @param id - ID du document à supprimer
 * 
 * @example
 * await supprimerDocument('doc_123');
 */
export async function supprimerDocument(id: string): Promise<void> {
  try {
    const db = await ouvrirDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([NOM_STORE], 'readwrite');
      const store = transaction.objectStore(NOM_STORE);
      const requete = store.delete(id);

      requete.onsuccess = () => {
        console.log('✅ Document supprimé :', id);
        resolve();
      };

      requete.onerror = () => {
        console.error('❌ Erreur suppression :', requete.error);
        reject(new Error('Erreur lors de la suppression'));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (erreur) {
    console.error('❌ Erreur IndexedDB :', erreur);
    throw erreur;
  }
}

/**
 * Vider complètement la base de données
 * Utile pour le développement ou réinitialisation
 * 
 * @example
 * await viderDB();
 */
export async function viderDB(): Promise<void> {
  try {
    const db = await ouvrirDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([NOM_STORE], 'readwrite');
      const store = transaction.objectStore(NOM_STORE);
      const requete = store.clear();

      requete.onsuccess = () => {
        console.log('✅ Base de données vidée');
        resolve();
      };

      requete.onerror = () => {
        console.error('❌ Erreur vidage :', requete.error);
        reject(new Error('Erreur lors du vidage'));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (erreur) {
    console.error('❌ Erreur IndexedDB :', erreur);
    throw erreur;
  }
}