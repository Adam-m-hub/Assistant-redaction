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
    
    // ============================================
    // 📊 LOGS AMÉLIORÉS POUR LE DEBUG
    // ============================================
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🚀 MOTEUR : Début génération");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    const contenuSysteme = messages[0]?.contenu || '';
    
    // Détection de l'action
    const actionMatch = contenuSysteme.match(/Action : (corrige|améliore|raccourcis|allonge)/i);
    const actionDetectee = actionMatch ? actionMatch[1] : 'inconnue';
    
    // Vérification structure
    const hasBalises = contenuSysteme.includes('<TexteUtilisateur>');
    const hasInstructionsReponse = contenuSysteme.includes('Comment répondre :');
    
   // console.log(`📤 Action détectée: ${actionDetectee}`);
  //  console.log(`📏 Longueur prompt: ${contenuSysteme.length} caractères`);
    //console.log(`🏷️  Balises TexteUtilisateur: ${hasBalises ? '✅' : '❌'}`);
  //  console.log(`📝 Instructions réponse: ${hasInstructionsReponse ? '✅' : '❌'}`);
    
    // Extraire le texte utilisateur pour info
    const texteMatch = contenuSysteme.match(/<TexteUtilisateur>\n([\s\S]*?)\n<\/TexteUtilisateur>/);
    if (texteMatch) {
      const texteUser = texteMatch[1];
      console.log(`📄 Texte utilisateur: ${texteUser.substring(0, 50)}... (${texteUser.length} caractères)`);
    }

    // 2. Paramètres par défaut
    const paramsFinaux: ParametresGeneration = {
      temperature: parametres?.temperature ?? 0.7,
      longueurMaximale: parametres?.longueurMaximale ?? 1000,
      topP: parametres?.topP ?? 0.9,
      penaliteFrequence: parametres?.penaliteFrequence ?? 0.0
    };

    console.log(`⚙️ Paramètres: temp=${paramsFinaux.temperature}, max_tokens=${paramsFinaux.longueurMaximale}`);

    // 3. Convertir nos messages au format WebLLM
    // IMPORTANT: Garder l'ordre système puis utilisateur
    const messagesWebLLM = messages.map(msg => ({
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
      stream: true
    });

    let texteComplet = "";
    let tokensUtilises = 0;
    let lastChunkWithUsage: any = null;
    let chunkCount = 0;

    // Traiter les chunks du stream
    for await (const chunk of reponseStream) {
      const nouveauTexte = chunk.choices[0]?.delta?.content || "";
      texteComplet += nouveauTexte;
      chunkCount++;
      
      if (onChunk && nouveauTexte) {
        onChunk(nouveauTexte);
      }
      
      lastChunkWithUsage = chunk;
    }

    const tempsFin = Date.now();
    const tempsGeneration = tempsFin - tempsDebut;

    // Récupérer le nombre de tokens
    if (lastChunkWithUsage?.usage?.total_tokens) {
      tokensUtilises = lastChunkWithUsage.usage.total_tokens;
    } else {
      tokensUtilises = Math.ceil(texteComplet.length / 4);
    }

    // ============================================
    // 📊 LOGS DE RÉSULTAT
    // ============================================
    /*console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ GÉNÉRATION TERMINÉE");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`⏱️  Temps: ${tempsGeneration}ms`);
    console.log(`📏 Réponse: ${texteComplet.length} caractères`);
    console.log(`🎯 Tokens estimés: ${tokensUtilises}`);
    console.log(`🔄 Chunks reçus: ${chunkCount}`);
    console.log(`📝 Aperçu réponse: "${texteComplet.substring(0, 100)}..."`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");*/

    // 5. Retourner la réponse formatée
    return {
      texte: texteComplet,
      tokensUtilises,
      tempsGeneration
    };

  } catch (erreur) {
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("❌ ERREUR LORS DE LA GÉNÉRATION");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("Détails:", erreur);
    
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
