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

/**
 * Service Singleton pour gérer le modèle WebLLM
 * 
 * Responsabilités :
 * - Charger le modèle une seule fois
 * - Gérer le statut du modèle
 * - Générer du texte avec streaming
 * - Gérer les erreurs
 */
class ServiceMoteurWebLLM {
  private static instance: ServiceMoteurWebLLM | null = null;
  private moteur: MLCEngine | null = null;
  private statut: StatutModele = 'inactif';
  private configuration: ConfigurationModele | null = null;
  
  // Callbacks pour notifier les changements
  private observateurs: {
    surChangementStatut?: (statut: StatutModele) => void;
    surProgression?: (progression: ProgressionChargement) => void;
    surErreur?: (erreur: ErreurWebLLM) => void;
  } = {};

  /**
   * Constructeur privé (Singleton)
   */
  private constructor() {
    console.log("🤖 Service WebLLM initialisé");
  }

  /**
   * Obtenir l'instance unique (Singleton)
   */
  public static obtenirInstance(): ServiceMoteurWebLLM {
    if (!ServiceMoteurWebLLM.instance) {
      ServiceMoteurWebLLM.instance = new ServiceMoteurWebLLM();
    }
    return ServiceMoteurWebLLM.instance;
  }

  /**
   * Enregistrer des callbacks
   */
  public enregistrerObservateurs(callbacks: {
    surChangementStatut?: (statut: StatutModele) => void;
    surProgression?: (progression: ProgressionChargement) => void;
    surErreur?: (erreur: ErreurWebLLM) => void;
  }): void {
    this.observateurs = { ...this.observateurs, ...callbacks };
  }

  /**
   * Obtenir le statut actuel
   */
  public obtenirStatut(): StatutModele {
    return this.statut;
  }

  /**
   * Vérifier si le modèle est prêt
   */
  public estPret(): boolean {
    return this.statut === 'pret' && this.moteur !== null;
  }

  /**
   * Charger le modèle WebLLM
   */
  public async chargerModele(config: ConfigurationModele): Promise<void> {
    try {
      // Vérifier si déjà en cours
      if (this.statut === 'chargement') {
        console.warn("⚠️ Un modèle est déjà en cours de chargement");
        return;
      }

      this.changerStatut('chargement');
      this.configuration = config;

      console.log(`🔄 Chargement : ${config.nom}`);

      let dernierPourcentage = 0;

      // Créer le moteur avec suivi de progression
      this.moteur = await CreateMLCEngine(
        config.nom,
        {
          initProgressCallback: (rapport) => {
            const pourcentage = Math.round(rapport.progress * 100);
            
            // Log tous les 10% ou à 100%
            if (pourcentage >= dernierPourcentage + 10 || pourcentage === 100) {
              console.log(`⏳ ${pourcentage}% - ${rapport.text}`);
              dernierPourcentage = pourcentage;
            }
            
            // Notifier les observateurs
            this.notifierProgression({
              pourcentage: rapport.progress * 100,
              etape: rapport.text
            });
          }
        }
      );

      console.log("✅ Modèle chargé !");
      this.changerStatut('pret');

    } catch (erreur) {
      console.error("❌ Erreur chargement :", erreur);
      
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
   * Générer du texte avec streaming
   */
  public async genererTexte(
    messages: Message[],
    parametres?: ParametresGeneration,
    onChunk?: (chunk: string) => void,   
  ): Promise<ReponseModele> {
    // Vérifier que le modèle est prêt
    if (!this.estPret()) {
      throw {
        code: 'MODELE_NON_PRET',
        message: 'Le modèle doit être chargé avant de générer du texte'
      } as ErreurWebLLM;
    }

    try {
      const tempsDebut = Date.now();

      // Paramètres par défaut
      const paramsFinaux: ParametresGeneration = {
        temperature: parametres?.temperature ?? 0.7,
        longueurMaximale: parametres?.longueurMaximale ?? 1000,
        topP: parametres?.topP ?? 0.9,
        penaliteFrequence: parametres?.penaliteFrequence ?? 0.0
      };

      // Convertir au format WebLLM
      const messagesWebLLM = messages.map(msg => ({
        role: msg.role,
        content: msg.contenu
      }));

     // console.log(`🚀 Génération (max: ${paramsFinaux.longueurMaximale} tokens)`);

      // Générer avec streaming
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
      let lastChunk: any = null;

      // Traiter les chunks
      for await (const chunk of reponseStream) {
        const nouveauTexte = chunk.choices[0]?.delta?.content || "";
        texteComplet += nouveauTexte;
        
        if (onChunk && nouveauTexte) {
          onChunk(nouveauTexte);
        }
        
        lastChunk = chunk;
      }

      const tempsFin = Date.now();
      const tempsGeneration = tempsFin - tempsDebut;

      // Récupérer les tokens
      tokensUtilises = lastChunk?.usage?.total_tokens 
        ?? Math.ceil(texteComplet.length / 4);

    //  console.log(`✅ Généré : ${texteComplet.length} caractères en ${tempsGeneration}ms`);

      return {
        texte: texteComplet,
        tokensUtilises,
        tempsGeneration
      };

    } catch (erreur) {
      console.error("❌ Erreur génération :", erreur);
      
      throw {
        code: 'ERREUR_GENERATION',
        message: 'Erreur lors de la génération du texte',
        details: erreur instanceof Error ? erreur.message : String(erreur)
      } as ErreurWebLLM;
    }
  }

  /**
   * Décharger le modèle
   */
  public async dechargerModele(): Promise<void> {
    if (this.moteur) {
    //  console.log("🗑️ Déchargement...");
      this.moteur = null;
      this.changerStatut('inactif');
      this.configuration = null;
    //  console.log("✅ Déchargé");
    }
  }

  // ============================================
  // MÉTHODES PRIVÉES
  // ============================================

  private changerStatut(nouveauStatut: StatutModele): void {
    this.statut = nouveauStatut;
    if (this.observateurs.surChangementStatut) {
      this.observateurs.surChangementStatut(nouveauStatut);
    }
  }

  private notifierProgression(progression: ProgressionChargement): void {
    if (this.observateurs.surProgression) {
      this.observateurs.surProgression(progression);
    }
  }

  private notifierErreur(erreur: ErreurWebLLM): void {
    if (this.observateurs.surErreur) {
      this.observateurs.surErreur(erreur);
    }
  }
}

// Exporter l'instance unique (Singleton)
export const serviceMoteur = ServiceMoteurWebLLM.obtenirInstance();
