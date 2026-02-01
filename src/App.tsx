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
import ModalDocuments from './components/UI/ModalDocuments';
import type { DocumentSauvegarde } from './lib/storage/db';
import { ToggleModeNuit } from './components/UI/ToggleModeNuit';
import { SelecteurPersonas } from './lib/personas/SelecteurPersonas';
import Header from './components/UI/header';
import { useStorePersonas } from './stroe/storePersonas';
import PanneauDroit from './components/Controls/PanneauDroit';


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

  /**
   * Gestionnaire pour charger le modèle
   */
  const handleChargerModele = async () => {
    await chargerModele("Phi-3-mini-4k-instruct-q4f16_1-MLC");
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
    // 🆕 Récupérer le persona actif (s'il existe)
    const { personaActif } = useStorePersonas.getState();
    
    // ✅ Construire le prompt complet (avec ou sans persona)
    const prompt = construirePrompt({
      action,
      texte: texteEditeur,
      style,
      ton,
      longueur,
      systemPrompt: personaActif?.systemPrompt  // undefined si pas de persona
    });

    // ✅ Générer le texte avec les messages prêts
    await genererTexte(prompt.messages);

  } catch (error) {
    console.error('Erreur lors de la génération :', error);
  }
};

  /**
   * Appliquer la suggestion (remplacer le texte)
   */
      const handleAppliquerSuggestion = () => {
        if (derniereReponse) {
          setTexteEditeur(derniereReponse.texte);
          effacerSuggestion(); 
        }
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
  
  console.log('📄 Nouveau document créé');
};
  /**
 * Enregistrer le document
 */
const handleEnregistrer = async () => {
  // Vérifier que le texte n'est pas vide
  if (!texteEditeur.trim()) {
    alert('⚠️ Le document est vide');
    return;
  }

  try {
   // Si c'est un nouveau document OU si le document actuel a été supprimé
    if (!documentActuel || documentActuel.id.startsWith('doc_')) {
      // Demander un nouveau titre à chaque fois
      const titre = prompt('📝 Titre du document :', documentActuel?.titre || '');
      
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
        <div className="col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 p-6 overflow-y-auto dark:bg-gray-800 dark:text-gray-100 h-[750px]">
              {/* 👤 NOUVEAU : Sélecteur de Personas */}
            <SelecteurPersonas />
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
          <div className="col-span-6  bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden dark:bg-gray-800 dark:text-gray-100 h-[750px]">
            
            {/* Zone d'édition avec TipTap */}
            <div className="flex-1 overflow-hidden">
              <EditorTipTap
                contenu={texteEditeur}
                onChange={setTexteEditeur}
                placeholder="Commencez à écrire ou demandez à l'IA de vous aider..."
                desactive={statut !== 'pret' || generationEnCours}
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
                  {generationEnCours ? '⏳' : '✨'} Améliorer
                </button>
                <button 
                  onClick={() => handleAction('corriger')}
                  disabled={statut !== 'pret' || !texteEditeur.trim() || generationEnCours}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generationEnCours ? '⏳' : '✓'} Corriger
                </button>
                <button 
                  onClick={() => handleAction('raccourcir')}
                  disabled={statut !== 'pret' || !texteEditeur.trim() || generationEnCours}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generationEnCours ? '⏳' : '📏'} Raccourcir
                </button>
                <button 
                  onClick={() => handleAction('allonger')}
                  disabled={statut !== 'pret' || !texteEditeur.trim() || generationEnCours}
                  className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generationEnCours ? '⏳' : '📝'} Allonger
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
    </div>
  );
}

export default App;