// src/lib/webllm/moteur.ts
// Service principal pour gérer WebLLM - Pattern Singleton

import { CreateMLCEngine, MLCEngine } from "@mlc-ai/web-llm";
import type {
  StatutModele,
  ProgressionChargement,
  ConfigurationModele,
  ParametresGeneration,
  Message,
  ReponseModele,
  ErreurWebLLM
} from './types';
import { text } from "stream/consumers";
import { useStorePersonas } from "../../stroe/storePersonas";


/**
 * Service Singleton pour gérer le modèle WebLLM
 * 
 * Responsabilités :
 * - Charger le modèle une seule fois
 * - Gérer le statut du modèle
 * - Générer du texte
 * - Gérer les erreurs
 * 
 * Pattern Singleton : Une seule instance dans toute l'application
 */
class ServiceMoteurWebLLM {

  private static instance: ServiceMoteurWebLLM | null = null;   // Instance unique du service (Singleton)

  private moteur: MLCEngine | null = null;   // Le moteur WebLLM (null tant qu'il n'est pas chargé)
 
  private statut: StatutModele = 'inactif';  // Statut actuel du modèle
  
  private configuration: ConfigurationModele | null = null; // Configuration du modèle actuellement chargé
  
  // Callbacks pour notifier les changements de statut
  private observateurs: {
    surChangementStatut?: (statut: StatutModele) => void;
    surProgression?: (progression: ProgressionChargement) => void;
    surErreur?: (erreur: ErreurWebLLM) => void;
  } = {};

  /**
   * Constructeur privé (Singleton)
   * Ne peut pas être appelé directement
   */
  private constructor() {
    console.log("🤖 Service WebLLM initialisé");
  }

  /**
   * Obtenir l'instance unique du service (Singleton)
   * 
   * Utilisation :
   *   const service = ServiceMoteurWebLLM.obtenirInstance();
   */
  public static obtenirInstance(): ServiceMoteurWebLLM {
    if (!ServiceMoteurWebLLM.instance) {
      ServiceMoteurWebLLM.instance = new ServiceMoteurWebLLM();
    }
    return ServiceMoteurWebLLM.instance;
  }

  /**
   * Enregistrer des callbacks pour être notifié des changements
   * 
   * @param callbacks - Fonctions à appeler lors d'événements
   * 
   * Exemple :
   *   service.enregistrerObservateurs({
   *     surChangementStatut: (statut) => console.log(statut),
   *     surProgression: (prog) => console.log(prog.pourcentage + "%")
   *   });
   */
  public enregistrerObservateurs(callbacks: {
    surChangementStatut?: (statut: StatutModele) => void;
    surProgression?: (progression: ProgressionChargement) => void;
    surErreur?: (erreur: ErreurWebLLM) => void;
  }): void {
    this.observateurs = { ...this.observateurs, ...callbacks };
  }

  /**
   * Obtenir le statut actuel du modèle
   * 
   * @returns Le statut actuel ('inactif', 'chargement', 'pret', 'erreur')
   */
  public obtenirStatut(): StatutModele {
    return this.statut;
  }

  /**
   * Vérifier si le modèle est prêt à générer du texte
   * 
   * @returns true si le modèle est chargé et prêt
   */
  public estPret(): boolean {
    return this.statut === 'pret' && this.moteur !== null;
  }

  /**
   * Charger le modèle WebLLM
   * 
   * @param config - Configuration du modèle à charger
   * 
   * Exemple :
   *   await service.chargerModele({
   *     nom: "Phi-3-mini-4k-instruct-q4f16_1-MLC",
   *     description: "Modèle Phi-3 Mini"
   *   });
   */
  public async chargerModele(config: ConfigurationModele): Promise<void> {
    try {
      // 1. Vérifier si un modèle est déjà en cours de chargement
      if (this.statut === 'chargement') {
        console.warn("⚠️ Un modèle est déjà en cours de chargement");
        return;
      }

      // 2. Mettre à jour le statut
      this.changerStatut('chargement');
      this.configuration = config;

      console.log(`🔄 Début du chargement du modèle : ${config.nom}`);

      // 3. Créer le moteur WebLLM avec suivi de progression
      this.moteur = await CreateMLCEngine(
        config.nom,
        {
          // Callback appelé pendant le chargement
          initProgressCallback: (rapport) => {
            console.log(`📊 Progression : ${rapport.text}`);
            
            // Notifier les observateurs
            this.notifierProgression({
              pourcentage: rapport.progress * 100,
              etape: rapport.text
            });
          }
        }
      );

      // 4. Modèle chargé avec succès !
      console.log("✅ Modèle chargé avec succès !");
      this.changerStatut('pret');

    } catch (erreur) {
      // 5. Gérer les erreurs
      console.error("❌ Erreur lors du chargement du modèle :", erreur);
      
      const erreurFormatee: ErreurWebLLM = {
        code: 'ERREUR_CHARGEMENT',
        message: "Impossible de charger le modèle",
        details: erreur instanceof Error ? erreur.message : String(erreur)
      };

      this.changerStatut('erreur');
      this.notifierErreur(erreurFormatee);
      
      throw erreurFormatee;
    }
  }

  /**
   * Générer du texte avec le modèle
   * 
   * @param messages - Liste des messages de la conversation
   * @param parametres - Paramètres de génération (optionnel)
   * @returns Le texte généré
   */
  /*
  public async genererTexte(
    messages: Message[],
    parametres?: ParametresGeneration,
    onChunk?: (chunk: string) => void,  // <-- Nouveau paramètre optionnel
  ): Promise<ReponseModele> {
    // 1. Vérifier que le modèle est prêt
    if (!this.estPret()) {
      throw {
        code: 'MODELE_NON_PRET',
        message: 'Le modèle doit être chargé avant de générer du texte'
      } as ErreurWebLLM;
    }

    try {
      const tempsDebut = Date.now();

      // 2. Paramètres par défaut si non fournis
      const paramsFinaux: ParametresGeneration = {
        temperature: parametres?.temperature ?? 0.7,
        longueurMaximale: parametres?.longueurMaximale ?? 100,
        topP: parametres?.topP ?? 0.9,
        penaliteFrequence: parametres?.penaliteFrequence ?? 0.0
      };

      // 3. Convertir nos messages au format WebLLM
      // S'assurer que le message système est toujours en premier
      const systemMessage = messages.find(msg => msg.role === 'system');
      const otherMessages = messages.filter(msg => msg.role !== 'system');
      
      const sortedMessages = systemMessage 
        ? [systemMessage, ...otherMessages]
        : otherMessages;
      
      const messagesWebLLM = sortedMessages.map(msg => ({
        role: msg.role,
        content: msg.contenu
      }));

      console.log("🤔 Génération en cours...");

      // 4. Générer le texte (mode non-streaming pour l'instant)
      const reponse = await this.moteur!.chat.completions.create({
        messages: messagesWebLLM,
        temperature: paramsFinaux.temperature,
        max_tokens: paramsFinaux.longueurMaximale,
        top_p: paramsFinaux.topP,
        frequency_penalty: paramsFinaux.penaliteFrequence,
        stream: true  // Pas de streaming pour l'instant (on fera ça plus tard)


      });

      const tempsFin = Date.now();
      const tempsGeneration = tempsFin - tempsDebut;

      console.log(`✅ Texte généré en ${tempsGeneration}ms`);
        let texteComplet = "";
        let tokensUtilises = 0;

             // Et il faudrait traiter les chunks
      for await (const chunk of reponse) {
          const nouveauTexte = chunk.choices[0]?.delta?.content || "";
          // Afficher progressivement dans l'UI
          console.log(nouveauTexte);
          texteComplet += nouveauTexte;
          tokensUtilises += chunk.choices[0]?.delta?.content?.length || 0;
        }

      // 5. Retourner la réponse formatée
      return {
        texte: texteComplet,
        tokensUtilises,
        tempsGeneration
      };

    } catch (erreur) {
      console.error("❌ Erreur lors de la génération :", erreur);
      
      throw {
        code: 'ERREUR_GENERATION',
        message: 'Erreur lors de la génération du texte',
        details: erreur instanceof Error ? erreur.message : String(erreur)
      } as ErreurWebLLM;
    }
  }*/


  public async genererTexte(
    messages: Message[],
    parametres?: ParametresGeneration,
    onChunk?: (chunk: string) => void,  // <-- Nouveau paramètre optionnel
  ): Promise<ReponseModele> {
    // 1. Vérifier que le modèle est prêt
    if (!this.estPret()) {
      throw {
        code: 'MODELE_NON_PRET',
        message: 'Le modèle doit être chargé avant de générer du texte'
      } as ErreurWebLLM;
    }

    try {
      const tempsDebut = Date.now();

      // 2. Paramètres par défaut si non fournis
      const paramsFinaux: ParametresGeneration = {
        temperature: parametres?.temperature ?? 0.7,
        longueurMaximale: parametres?.longueurMaximale ?? 100,
        topP: parametres?.topP ?? 0.9,
        penaliteFrequence: parametres?.penaliteFrequence ?? 0.0
      };

      // 3. Convertir nos messages au format WebLLM
      // S'assurer que le message système est toujours en premier
      const systemMessage = messages.find(msg => msg.role === 'system');
      const otherMessages = messages.filter(msg => msg.role !== 'system');
      
      const sortedMessages = systemMessage 
        ? [systemMessage, ...otherMessages]
        : otherMessages;
      
      const messagesWebLLM = sortedMessages.map(msg => ({
        role: msg.role,
        content: msg.contenu
      }));

      console.log("🤔 Génération en cours...");

      // 4. Générer le texte avec streaming
      const reponseStream = await this.moteur!.chat.completions.create({
        messages: messagesWebLLM,
        temperature: paramsFinaux.temperature,
        max_tokens: paramsFinaux.longueurMaximale,
        top_p: paramsFinaux.topP,
        frequency_penalty: paramsFinaux.penaliteFrequence,
        stream: true  // Streaming activé
      });

      let texteComplet = "";
      let tokensUtilises = 0;
      let lastChunkWithUsage: any = null;

      // Traiter les chunks du stream
      for await (const chunk of reponseStream) {
        const nouveauTexte = chunk.choices[0]?.delta?.content || "";
        
        // Ajouter au texte complet
        texteComplet += nouveauTexte;
        
        // Appeler le callback si fourni (pour l'UI)
        if (onChunk && nouveauTexte) {
          onChunk(nouveauTexte);
        }
        
        // Afficher dans la console pour le débogage
        if (nouveauTexte) {
          console.log("Chunk reçu:", nouveauTexte);
        }
        
        // Garder une référence au dernier chunk (qui contient souvent les infos d'usage)
        lastChunkWithUsage = chunk;
      }

      const tempsFin = Date.now();
      const tempsGeneration = tempsFin - tempsDebut;

      // Récupérer le nombre de tokens depuis le dernier chunk ou l'usage
      if (lastChunkWithUsage?.usage?.total_tokens) {
        tokensUtilises = lastChunkWithUsage.usage.total_tokens;
      } else {
        // Estimation approximative si l'API ne fournit pas l'usage dans le streaming
        tokensUtilises = Math.ceil(texteComplet.length / 4); // Estimation: ~4 caractères par token
      }

      console.log(`✅ Texte généré en ${tempsGeneration}ms`);
      console.log(`Longueur totale: ${texteComplet.length} caractères`);
      console.log(`Tokens estimés: ${tokensUtilises}`);

      // 5. Retourner la réponse formatée
      return {
        texte: texteComplet,
        tokensUtilises,
        tempsGeneration
      };

    } catch (erreur) {
      console.error("❌ Erreur lors de la génération :", erreur);
      
      throw {
        code: 'ERREUR_GENERATION',
        message: 'Erreur lors de la génération du texte',
        details: erreur instanceof Error ? erreur.message : String(erreur)
      } as ErreurWebLLM;
    }
  }


  /**
   * Décharger le modèle de la mémoire
   * Utile pour libérer de la RAM
   */
  public async dechargerModele(): Promise<void> {
    if (this.moteur) {
      console.log("🗑️ Déchargement du modèle...");
      // Note: WebLLM n'a pas de méthode explicite de déchargement
      // On met juste à null pour permettre au garbage collector de nettoyer
      this.moteur = null;
      this.changerStatut('inactif');
      this.configuration = null;
      console.log("✅ Modèle déchargé");
    }
  }

  // ============================================
  // MÉTHODES PRIVÉES (Helpers internes)
  // ============================================

  /**
   * Changer le statut et notifier les observateurs
   */
  private changerStatut(nouveauStatut: StatutModele): void {
    this.statut = nouveauStatut;
    if (this.observateurs.surChangementStatut) {
      this.observateurs.surChangementStatut(nouveauStatut);
    }
  }

  /**
   * Notifier la progression du chargement
   */
  private notifierProgression(progression: ProgressionChargement): void {
    if (this.observateurs.surProgression) {
      this.observateurs.surProgression(progression);
    }
  }

  /**
   * Notifier une erreur
   */
  private notifierErreur(erreur: ErreurWebLLM): void {
    if (this.observateurs.surErreur) {
      this.observateurs.surErreur(erreur);
    }
  }
}

// Exporter une instance unique (Singleton)
export const serviceMoteur = ServiceMoteurWebLLM.obtenirInstance();