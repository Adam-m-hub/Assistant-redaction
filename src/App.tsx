// src/App.tsx
import { useState } from 'react';
import { useStoreModele } from './stroe/storeModele';
import { construirePrompt } from './lib/prompts/templates';
import type { TypeAction } from './lib/prompts/templates';
import EditorTipTap from './components/Editors/EditorTipTap';
import PanneauParametres from '@/components/Controls/PanneauParametres';
import type { StyleEcriture, Ton, Longueur } from './lib/prompts/templates';
import { sauvegarderDocument, chargerDocument, ID_BROUILLON_AUTO } from './lib/storage/db';
import { useEffect, useRef } from 'react';
import type { DocumentSauvegarde } from './lib/storage/db';
 
import Header from './components/UI/header';
import { useStorePersonas } from './stroe/storePersonas';
import PanneauDroit from './components/Controls/PanneauDroit';
import { useTranslation } from 'react-i18next';
import { ModaleHistorique } from './components/UI/ModalHistorique';
import { useStoreHistorique } from './stroe/storeHistorique';
import { calculerStatistiques } from './utils/calculerStats';


function App() {
  // Récupérer l'état depuis Zustand
  const { 
    statut, 
    progression, 
    erreur,
    generationEnCours,
    derniereReponse,
    chargerModele, 
    dechargerModele,
    genererTexte,
    effacerErreur,
    effacerSuggestion,
    texteEnCours, 

  } = useStoreModele();

  //  NOUVEAU : Hook pour l'historique
  const { ajouterEntree } = useStoreHistorique();

  // État local pour le texte de l'éditeur
  const [texteEditeur, setTexteEditeur] = useState('');
  
  // État local pour les paramètres de génération
  const [style, setStyle] = useState<StyleEcriture>('formel');
  const [ton, setTon] = useState<Ton>('neutre');
  const [longueur, setLongueur] = useState<Longueur>('moyen');
  const [tabActif, setTabActif] = useState<'suggestions' | 'statistiques'>('suggestions');
  
  // État pour la modale des documents
  const [modaleDocumentsOuverte, setModaleDocumentsOuverte] = useState(false);
  
    // Document actuellement ouvert
  const [documentActuel, setDocumentActuel] = useState<DocumentSauvegarde | null>(null);

  // Le texte a-t-il été modifié depuis la dernière sauvegarde ?
  const [estModifie, setEstModifie] = useState(false);

  //  NOUVEAU : États pour l'historique
  const [texteAvantModification, setTexteAvantModification] = useState('');
  const [actionEnCours, setActionEnCours] = useState<TypeAction | null>(null);

  /**
   * Gestionnaire pour charger le modèle
   */
  const handleChargerModele = async () => {
            // Phi-3 Mini (Recommandé pour débuter)
          //await chargerModele("Phi-3-mini-4k-instruct-q4f16_1-MLC");
         // await chargerModele("Phi-3-mini-4k-instruct-q4f32_1-MLC");

          // Phi-4 Mini (Plus intelligent)
          //await chargerModele("Phi-4-mini-4k-instruct-q4f16_1-MLC");
        //  await chargerModele("Phi-4-mini-instruct-q4f32_1-MLC");
         // await chargerModele("Phi-4-mini-4k-instruct-q4f32_1-MLC");
          // TinyLlama 1.1B (Très léger, bon pour l'édition simple)
          //await chargerModele("TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC");
          // await chargerModele("TinyLlama-1.1B-Chat-v1.0-q4f32_1-MLC");
          // // Qwen2.5 - Très léger
          // await chargerModele("Qwen2.5-0.5B-Instruct-q4f16_1-MLC");
          // await chargerModele("Qwen2.5-0.5B-Instruct-q4f32_1-MLC");

          // // Qwen1.5
          // await chargerModele("Qwen2-1.5B-Instruct-q4f16_1-MLC");
          // await chargerModele("Qwen2-1.5B-Instruct-q4f32_1-MLC");
          // // Llama 3.2 - 1B (TOP RECOMMANDÉ)
          // await chargerModele("Llama-3.2-1B-Instruct-q4f16_1-MLC");
          // await chargerModele("Llama-3.2-1B-Instruct-q4f32_1-MLC");

          // Llama 3.2 - 3B (Plus puissant)
        //  await chargerModele("Llama-3.2-3B-Instruct-q4f16_1-MLC"); // un peu bete
         // await chargerModele("Llama-3.2-3B-Instruct-q4f32_1-MLC");
          // Gemma 2 - 2B (Très bon pour l'écriture)
          await chargerModele("gemma-2-2b-it-q4f16_1-MLC"); // bon 
         // await chargerModele("gemma-2-2b-it-q4f32_1-MLC");
         // await chargerModele("gemma-2-9b-it-q4f16_1-MLC"); // Attention: lourd!
          // Hermes 3 - Très bon pour l'écriture
       //   await chargerModele("Hermes-3-Llama-3.2-3B-q4f16_1-MLC");
          // await chargerModele("Hermes-3-Llama-3.2-3B-q4f32_1-MLC");
          // // Mistral 7B - Excellent mais très lourd
          // await chargerModele("Mistral-7B-Instruct-v0.3-q4f16_1-MLC"); // Très lourd
          // // Llama 3.1 - 8B (Excellente qualité mais lourd)
          // await chargerModele("Llama-3.1-8B-Instruct-q4f16_1-MLC");
          // await chargerModele("Llama-3.1-8B-Instruct-q4f32_1-MLC");
          // // Qwen2.5 - 3B (Très bon compromis)
          // await chargerModele("Qwen2.5-3B-Instruct-q4f16_1-MLC");
          // await chargerModele("Qwen2.5-3B-Instruct-q4f32_1-MLC");

  };



  /**
 * Gestionnaire générique pour les actions
 * Construit le prompt et génère le texte
 */
const handleAction = async (action: TypeAction) => {
  // Vérifier que le texte n'est pas vide
  if (!texteEditeur.trim()) {
    return;
  }

  try {
    // 🟢 NOUVEAU : Sauvegarder le texte AVANT modification
    setTexteAvantModification(texteEditeur);
    setActionEnCours(action);

    //  Récupérer le persona actif (s'il existe)
    const { personaActif } = useStorePersonas.getState();
    
    //  Construire le prompt complet (avec ou sans persona)
    const prompt = construirePrompt({
      action,
      texte: texteEditeur,
      style,
      ton,
      longueur,
      systemPrompt: personaActif?.systemPrompt  // undefined si pas de persona
    });

    //  Générer le texte avec les messages prêts
    await genererTexte(prompt.messages);

  } catch (error) {
    console.error('Erreur lors de la génération :', error);
  }
};

  /**
   * Appliquer la suggestion (remplacer le texte)
   */
const handleAppliquerSuggestion = async () => {
  if (!derniereReponse || !texteAvantModification || !actionEnCours) {
    console.warn('⚠️ Pas de suggestion à appliquer');
    return;
  }

  // Appliquer le texte dans l'éditeur
  setTexteEditeur(derniereReponse.texte);
  
  // 🟢 NOUVEAU : Enregistrer dans l'historique
  try {
    const { personaActif } = useStorePersonas.getState();
    
    await ajouterEntree({
      texteInitial: texteAvantModification,
      texteModifie: derniereReponse.texte,
      action: actionEnCours,
      personaNom: personaActif?.nom || 'Par défaut',
      statsInitial: calculerStatistiques(texteAvantModification),
      statsFinal: calculerStatistiques(derniereReponse.texte)
    });
    
    console.log('✅ Modification enregistrée dans l\'historique');
    
    // Réinitialiser
    setTexteAvantModification('');
    setActionEnCours(null);
    
  } catch (erreur) {
    console.error('❌ Erreur enregistrement historique:', erreur);
  }
  
  // Effacer la suggestion
  effacerSuggestion();
};

  /**
   * Charger un document depuis la liste
   */
const handleChargerDocument = (doc: DocumentSauvegarde) => {
  setTexteEditeur(doc.contenu);
  if (doc.parametres) {
    setStyle(doc.parametres.style);
    setTon(doc.parametres.ton);
    setLongueur(doc.parametres.longueur);
  }
  setDocumentActuel(doc);    // ← AJOUTER
  setEstModifie(false);       // ← AJOUTER
  console.log('✅ Document chargé :', doc.id);
};

/**
 * Créer un nouveau document vierge
 */
const handleNouveauDocument = () => {
  // Vérifier s'il y a des modifications non sauvegardées
  if (estModifie && texteEditeur.trim()) {
    const confirmer = confirm('⚠️ Vous avez des modifications non sauvegardées. Continuer ?');
    if (!confirmer) return;
  }
  
  // Réinitialiser tout
  setTexteEditeur('');
  setDocumentActuel(null);
  setEstModifie(false);
  setStyle('formel');
  setTon('neutre');
  setLongueur('moyen');
  effacerSuggestion();
  
  console.log(' Nouveau document créé');
};
  /**
 * Enregistrer le document
 */
const handleEnregistrer = async () => {
  // Vérifier que le texte n'est pas vide
  if (!texteEditeur.trim()) {
    alert(' Le document est vide');
    return;
  }

  try {
   // Si c'est un nouveau document OU si le document actuel a été supprimé
    if (!documentActuel || documentActuel.id.startsWith('doc_')) {
      // Demander un nouveau titre à chaque fois
      const titre = prompt(' Titre du document :', documentActuel?.titre || '');
      
      // Si l'utilisateur annule
      if (titre === null) return;
      
      // Si le titre est vide
      if (!titre.trim()) {
        alert('⚠️ Le titre ne peut pas être vide');
        return;
      }

      // Créer un nouveau document
      const nouveauDoc: DocumentSauvegarde = {
        id: `doc_${Date.now()}`,
        titre: titre.trim(),
        contenu: texteEditeur,
        dateCreation: new Date(),
        dateModification: new Date(),
        parametres: { style, ton, longueur }
      };

      await sauvegarderDocument(nouveauDoc);
      setDocumentActuel(nouveauDoc);
      setEstModifie(false);
      
      console.log('✅ Document créé :', nouveauDoc.titre);
      
    } else {
      // Mettre à jour le document existant
      const docMisAJour: DocumentSauvegarde = {
        ...documentActuel,
        contenu: texteEditeur,
        dateModification: new Date(),
        parametres: { style, ton, longueur }
      };

      await sauvegarderDocument(docMisAJour);
      setDocumentActuel(docMisAJour);
      setEstModifie(false);
      
      console.log('✅ Document mis à jour :', docMisAJour.titre);
    }
    
  } catch (erreur) {
    console.error('❌ Erreur sauvegarde :', erreur);
    alert('❌ Erreur lors de la sauvegarde');
  }
};

 

  /**
   * Obtenir le texte et la couleur du statut
   */
  const obtenirInfoStatut = () => {
    switch (statut) {
      case 'pret':
        return { texte: 'Modèle prêt', couleur: 'bg-green-500' };
      case 'chargement':
        return { texte: 'Chargement...', couleur: 'bg-yellow-500 animate-pulse' };
      case 'erreur':
        return { texte: 'Erreur', couleur: 'bg-red-500' };
      default:
        return { texte: 'Hors ligne', couleur: 'bg-gray-400' };
    }
  };

  const infoStatut = obtenirInfoStatut();

  /**
   * Restaurer le brouillon au démarrage
   */
  useEffect(() => {
    const restaurerBrouillon = async () => {
      try {
        const brouillon = await chargerDocument(ID_BROUILLON_AUTO);
        
        if (brouillon) {
          setTexteEditeur(brouillon.contenu);
          
          // Restaurer les paramètres si disponibles
          if (brouillon.parametres) {
            setStyle(brouillon.parametres.style);
            setTon(brouillon.parametres.ton);
            setLongueur(brouillon.parametres.longueur);
          }
          
          console.log('✅ Brouillon restauré');
        }
      } catch (erreur) {
        console.error('Erreur restauration :', erreur);
      }
    };

    restaurerBrouillon();
  }, []); // Exécuter une seule fois au montage

  const { mettreAJourParametres } = useStoreModele();

// Quand l'utilisateur change le style
const handleStyleChange = (nouveauStyle: StyleEcriture) => {
  setStyle(nouveauStyle);
  mettreAJourParametres({ style: nouveauStyle });
};


const handleTonChange = (nouveauTon: Ton) => {
  setTon(nouveauTon);
  mettreAJourParametres({ ton: nouveauTon });
};

const handleLongueurChange = (nouvelleLongueur: Longueur) => {
  setLongueur(nouvelleLongueur);
  mettreAJourParametres({ longueur: nouvelleLongueur });
};


  /**
 * Détecter les modifications du texte
 */
useEffect(() => {
  if (texteEditeur) {
    setEstModifie(true);
  }
}, [texteEditeur]);

const {t} = useTranslation();

// 🟢 NOUVEAU : Référence à l'éditeur pour la modale
const editorRef = useRef<any>(null);

  return (
    <div className="min-h-screen bg-gray-60 space-y-1 dark:bg-gray-900 dark:text-gray-100">
      {/* Header */}
        <Header
          statut={statut}
          progression={progression}
          erreur={erreur}
          texteEditeur={texteEditeur}
          estModifie={estModifie}
          onChargerModele={handleChargerModele}
          onDechargerModele={dechargerModele}
          onNouveauDocument={handleNouveauDocument}
          onOuvrirDocuments={() => setModaleDocumentsOuverte(true)}
          onEnregistrer={handleEnregistrer}
          onEffacerErreur={effacerErreur}
        />

      {/* Zone principale - 3 colonnes */}
      <main className="max-w-full mx-auto p-1 dark:bg-gray-800 dark:text-gray-100 ">
        <div className="grid grid-cols-12 gap-3 min-h-[calc(100vh-160px)] dark:bg-gray-800 dark:text-gray-100">
          
              {/* Panneau gauche - Paramètres et contrôles */}
        <div className="col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:text-gray-100 h-[640px]">
          <PanneauParametres
            style={style}
            ton={ton}
            longueur={longueur}
           // onStyleChange={setStyle}
            onStyleChange={handleStyleChange} 
            onTonChange={handleTonChange}
            onLongueurChange={handleLongueurChange}
          />
       
        </div>

          {/* Zone centrale - Éditeur de texte */}
          <div className="col-span-6  bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden dark:bg-gray-800 dark:text-gray-100 h-[640px]">
            
            {/* Zone d'édition avec TipTap */}
            <div className="flex-1 overflow-hidden">
              <EditorTipTap
                contenu={texteEditeur}
                onChange={setTexteEditeur}
                placeholder="Commencez à écrire ou demandez à l'IA de vous aider..."
                desactive={statut !== 'pret' || generationEnCours}
                onEditorReady={(editor) => { editorRef.current = editor; }}
              />
            </div>

            {/* Boutons d'action rapide */}
            <div className="border-t border-gray-200 p-5  bg-gray-50 dark:bg-gray-700">
              <div className="flex justify-center items-center gap-8 flex-wrap">
                <button 
                  onClick={() => handleAction('ameliorer')}
                  disabled={statut !== 'pret' || !texteEditeur.trim() || generationEnCours}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generationEnCours ? '⏳' : '✨'} {t('buttons.ameliorer')}
                </button>
                <button 
                  onClick={() => handleAction('corriger')}
                  disabled={statut !== 'pret' || !texteEditeur.trim() || generationEnCours}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generationEnCours ? '⏳' : '✓'} {t('buttons.corriger')}
                </button>
                <button 
                  onClick={() => handleAction('raccourcir')}
                  disabled={statut !== 'pret' || !texteEditeur.trim() || generationEnCours}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generationEnCours ? '⏳' : '📏'} {t('buttons.raccourcir')}
                </button>
                <button 
                  onClick={() => handleAction('allonger')}
                  disabled={statut !== 'pret' || !texteEditeur.trim() || generationEnCours}
                  className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generationEnCours ? '⏳' : '📝'} {t('buttons.allonger')}
                </button>
              </div>
            </div>
          </div>

              {/* Panneau droit */}
              <PanneauDroit
                tabActif={tabActif}
                onTabChange={setTabActif}
                generationEnCours={generationEnCours}
                texteEnCours={texteEnCours}
                derniereReponse={derniereReponse}
                statut={statut}
                onAppliquerSuggestion={handleAppliquerSuggestion}
                onRegenererer={() => handleAction('ameliorer')}
                modaleDocumentsOuverte={modaleDocumentsOuverte}
                onFermerModalDocuments={() => setModaleDocumentsOuverte(false)}
                onChargerDocument={handleChargerDocument}
                texteEditeur={texteEditeur}
              />

        </div>
      </main>

      {/* 🟢 NOUVEAU : Modale Historique */}
      <ModaleHistorique 
        editor={editorRef.current} 
        texteEditeur={texteEditeur}
        setTexteEditeur={setTexteEditeur}
      />
    </div>
  );
}

export default App;
