// src/lib/storage/servicePersonas.ts
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Persona } from '../../types/personas';

/**
 * Schéma de la base de données
 */
interface PersonasDB extends DBSchema {
  personas: {
    key: string;
    value: Persona;
    indexes: { 'par-nom': string };
  };
}

/**
 * Nom de la base de données
 */
const NOM_DB = 'assistant-redaction-personas';
const VERSION_DB = 1;

/**
 * Service de gestion des personas dans IndexedDB
 */
class ServicePersonasDB {
  private db: IDBPDatabase<PersonasDB> | null = null;

  /**
   * Initialiser la connexion à la base de données
   */
  async initialiser(): Promise<void> {
    if (this.db) return;

    try {
      this.db = await openDB<PersonasDB>(NOM_DB, VERSION_DB, {
        upgrade(db) {
          // Créer le store des personas
          if (!db.objectStoreNames.contains('personas')) {
            const store = db.createObjectStore('personas', { keyPath: 'id' });
            store.createIndex('par-nom', 'nom');
          }
        },
      });

      console.log('✅ Base de données personas initialisée');
    } catch (erreur) {
      console.error('❌ Erreur initialisation DB personas:', erreur);
      throw erreur;
    }
  }

  /**
   * Sauvegarder un persona
   */
  async sauvegarder(persona: Persona): Promise<void> {
    await this.initialiser();
    
    if (!this.db) {
      throw new Error('Base de données non initialisée');
    }

    // Ajouter les dates
    const personaComplet: Persona = {
      ...persona,
      modifieLe: new Date(),
      creeLe: persona.creeLe || new Date(),
    };

    await this.db.put('personas', personaComplet);
    console.log(`✅ Persona sauvegardé : ${persona.nom}`);
  }

  /**
   * Récupérer tous les personas
   */
  async recupererTous(): Promise<Persona[]> {
    await this.initialiser();
    
    if (!this.db) {
      throw new Error('Base de données non initialisée');
    }

    const personas = await this.db.getAll('personas');
    console.log(`📚 ${personas.length} personas récupérés`);
    
    return personas;
  }

  /**
   * Récupérer un persona par ID
   */
  async recupererParId(id: string): Promise<Persona | undefined> {
    await this.initialiser();
    
    if (!this.db) {
      throw new Error('Base de données non initialisée');
    }

    return await this.db.get('personas', id);
  }

  /**
   * Supprimer un persona
   */
  async supprimer(id: string): Promise<void> {
    await this.initialiser();
    
    if (!this.db) {
      throw new Error('Base de données non initialisée');
    }

    await this.db.delete('personas', id);
    console.log(`🗑️ Persona supprimé : ${id}`);
  }

  /**
   * Supprimer tous les personas personnalisés
   * (garde les prédéfinis)
   */
  async supprimerPersonnalises(): Promise<void> {
    await this.initialiser();
    
    if (!this.db) {
      throw new Error('Base de données non initialisée');
    }

    const tous = await this.recupererTous();
    const personnalises = tous.filter(p => !p.estPredefini);

    for (const persona of personnalises) {
      await this.supprimer(persona.id);
    }

    console.log(`🗑️ ${personnalises.length} personas personnalisés supprimés`);
  }

  /**
   * Vérifier si un persona existe
   */
  async existe(id: string): Promise<boolean> {
    const persona = await this.recupererParId(id);
    return !!persona;
  }
}

// Export instance unique (Singleton)
export const servicePersonasDB = new ServicePersonasDB();