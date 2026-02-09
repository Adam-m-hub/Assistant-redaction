// src/lib/webllm/moteur.ts
// Service principal pour gérer WebLLM - Pattern Singleton

import { CreateMLCEngine, MLCEngine } from "@mlc-ai/web-llm";
//import { appConfig } from "./appConfig";
import type {
  StatutModele,
  ProgressionChargement,
  ConfigurationModele,
  ParametresGeneration,
  Message,
  ReponseModele,
  ErreurWebLLM
} from './types';


// ou
//console.log(MLCEngine);

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
   */
  public static obtenirInstance(): ServiceMoteurWebLLM {
    if (!ServiceMoteurWebLLM.instance) {
      ServiceMoteurWebLLM.instance = new ServiceMoteurWebLLM();
    }
    return ServiceMoteurWebLLM.instance;
  }

  /**
   * Enregistrer des callbacks pour être notifié des changements
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
   */
  public obtenirStatut(): StatutModele {
    return this.statut;
  }

  /**
   * Vérifier si le modèle est prêt à générer du texte
   */
  public estPret(): boolean {
    return this.statut === 'pret' && this.moteur !== null;
  }

  /**
   * Charger le modèle WebLLM
   */
  /**
   * Charger le modèle WebLLM
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

      // Variable pour tracer le dernier pourcentage affiché
      let dernierPourcentage = 0;

      // 3. Créer le moteur WebLLM avec suivi de progression + appConfig
      this.moteur = await CreateMLCEngine(
        config.nom,
        {
         // appConfig, // ← UTILISATION DE appConfig ICI
          // Callback appelé pendant le chargement
          initProgressCallback: (rapport) => {
            const pourcentage = Math.round(rapport.progress * 100);
            
            // Afficher seulement tous les 10% ou à 100%
            if (pourcentage >= dernierPourcentage + 10 || pourcentage === 100) {
              console.log(`⏳ ${pourcentage}% - ${rapport.text}`);
              dernierPourcentage = pourcentage;
            }
            
            // Notifier les observateurs (garde la progression exacte pour l'UI)
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
/*
// Dans moteur.ts - REMPLACE toute la fonction chargerModele
public async chargerModele(config: ConfigurationModele): Promise<void> {
  try {
    if (this.statut === 'chargement') return;
    
    this.changerStatut('chargement');
    this.configuration = config;

    console.log(`🔄 Chargement du modèle : ${config.nom}`);

    let dernierPourcentage = 0;

    // NOUVELLE MÉTHODE : utilise l'URL CDN directe
    this.moteur = await CreateMLCEngine(
      config.nom,
      {
        // WebLLM va chercher automatiquement
        initProgressCallback: (rapport) => {
          const pourcentage = Math.round(rapport.progress * 100);
          
          if (pourcentage >= dernierPourcentage + 10 || pourcentage === 100) {
            console.log(`⏳ ${pourcentage}% - ${rapport.text}`);
            dernierPourcentage = pourcentage;
          }
          
          this.notifierProgression({
            pourcentage: rapport.progress * 100,
            etape: rapport.text
          });
        }
      }
    );

    console.log("✅ Modèle chargé avec succès !");
    this.changerStatut('pret');

  } catch (erreur) {
    console.error("❌ Erreur :", erreur);
    
    // Si échec, essaie avec un modèle plus simple
    if (config.nom.includes("Llama")) {
      console.log("🔄 Essaie avec TinyLlama à la place...");
      // Essaie automatiquement avec TinyLlama
      await this.chargerModele({
        nom: "TinyLlama-1.1B-Chat-v1.0-q4f16_1",
        tailleMemoire: 512,
        description: "TinyLlama (backup)"
      });
      return;
    }
    
    this.changerStatut('erreur');
    this.notifierErreur({
      code: 'ERREUR_CHARGEMENT',
      message: "Impossible de charger le modèle",
      details: erreur instanceof Error ? erreur.message : String(erreur)
    });
  }
}*/


  /**
   * Générer du texte avec le modèle
   */
  public async genererTexte(
    messages: Message[],
    parametres?: ParametresGeneration,
    onChunk?: (chunk: string) => void,   
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
      
      // 📊 CONSOLE LOG - Messages envoyés au modèle WebLLM
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📤 MOTEUR : Envoi au modèle WebLLM");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      messages.forEach((msg, index) => {
        console.log(`\n[Message ${index + 1}] ${msg.role.toUpperCase()}:`);
        console.log(msg.contenu);
      });
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      // 2. Paramètres par défaut si non fournis
      const paramsFinaux: ParametresGeneration = {
        temperature: parametres?.temperature ?? 0.7,
        longueurMaximale: parametres?.longueurMaximale ?? 1000,
        topP: parametres?.topP ?? 0.9,
        penaliteFrequence: parametres?.penaliteFrequence ?? 0.0
      };

      console.log("⚙️ Paramètres WebLLM :", paramsFinaux);

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

      console.log("🔄 Génération en cours...");

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
        
        // Garder une référence au dernier chunk
        lastChunkWithUsage = chunk;
      }

      const tempsFin = Date.now();
      const tempsGeneration = tempsFin - tempsDebut;

      // Récupérer le nombre de tokens
      if (lastChunkWithUsage?.usage?.total_tokens) {
        tokensUtilises = lastChunkWithUsage.usage.total_tokens;
      } else {
        // Estimation approximative
        tokensUtilises = Math.ceil(texteComplet.length / 4);
      }

      //console.log(`✅ Texte généré en ${tempsGeneration}ms`);
      //console.log(`📏 Longueur : ${texteComplet.length} caractères`);
      //console.log(`🎯 Tokens : ${tokensUtilises}`);
      //console.log(`📝 Aperçu : ${texteComplet.substring(0, 100)}...`);

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
   */
  public async dechargerModele(): Promise<void> {
    if (this.moteur) {
      console.log("🗑️ Déchargement du modèle...");
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
