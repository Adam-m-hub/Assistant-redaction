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
    effacerSuggestion
  } = useStoreModele();

  // État local pour le texte de l'éditeur
  const [texteEditeur, setTexteEditeur] = useState('');
  
  // État local pour les paramètres de génération
  const [style, setStyle] = useState<StyleEcriture>('formel');
  const [ton, setTon] = useState<Ton>('neutre');
  const [longueur, setLongueur] = useState<Longueur>('moyen');
  
  // État pour la modale des documents
  const [modaleDocumentsOuverte, setModaleDocumentsOuverte] = useState(false);
  
  // Référence pour le timer de sauvegarde automatique
  const timerSauvegardeRef = useRef<NodeJS.Timeout | null>(null);

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
      // Construire le prompt pour l'action
      const prompt = construirePrompt({
        action,
        texte: texteEditeur,
        style,      // Dynamique !
        ton,        // Dynamique !
        longueur    // Dynamique !
      });

      // Générer le texte
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
    
    // Restaurer les paramètres si disponibles
    if (doc.parametres) {
      setStyle(doc.parametres.style);
      setTon(doc.parametres.ton);
      setLongueur(doc.parametres.longueur);
    }
    
    console.log('✅ Document chargé :', doc.id);
  };

  /**
   * Sauvegarder automatiquement après 2 secondes sans modification
   */
  const sauvegarderAuto = async () => {
    if (!texteEditeur.trim()) return; // Ne pas sauvegarder si vide

    try {
      await sauvegarderDocument({
        id: ID_BROUILLON_AUTO,
        contenu: texteEditeur,
        dateCreation: new Date(),
        dateModification: new Date(),
        parametres: { style, ton, longueur }
      });
      console.log('💾 Sauvegarde automatique effectuée');
    } catch (erreur) {
      console.error('Erreur sauvegarde auto :', erreur);
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

  /**
   * Détecter les changements et sauvegarder après 2 secondes
   */
  useEffect(() => {
    // Annuler le timer précédent
    if (timerSauvegardeRef.current) {
      clearTimeout(timerSauvegardeRef.current);
    }

    // Lancer un nouveau timer de 2 secondes
    timerSauvegardeRef.current = setTimeout(() => {
      sauvegarderAuto();
    }, 2000);

    // Cleanup : annuler le timer si le composant est démonté
    return () => {
      if (timerSauvegardeRef.current) {
        clearTimeout(timerSauvegardeRef.current);
      }
    };
  }, [texteEditeur, style, ton, longueur]); // Relancer quand ces valeurs changent

  return (
    <div className="min-h-screen bg-gray-60 space-y-1">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Assistant de Rédaction IA</h1>
                <p className="text-sm text-gray-500">Propulsé par WebLLM - 100% Local</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Statut du modèle */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100">
                <div className={`w-2 h-2 rounded-full ${infoStatut.couleur}`} />
                <span className="text-sm font-medium text-gray-700">
                  {infoStatut.texte}
                </span>
              </div>
              
              {/* Boutons d'action */}
              {statut === 'inactif' && (
                <button 
                  onClick={handleChargerModele}
                  className="px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Charger le modèle IA
                </button>
              )}
              
              {statut === 'pret' && (
                <>
                  <button 
                    onClick={() => setModaleDocumentsOuverte(true)}
                    className="px-4 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    📁 Mes documents
                  </button>
                  <button 
                    onClick={dechargerModele}
                    className="px-4 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                  >
                    Décharger le modèle
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Barre de progression */}
          {statut === 'chargement' && progression && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>{progression.etape}</span>
                <span>{Math.round(progression.pourcentage)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progression.pourcentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Affichage des erreurs */}
          {erreur && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800">{erreur.message}</h3>
                  {erreur.details && (
                    <p className="text-sm text-red-600 mt-1">{erreur.details}</p>
                  )}
                </div>
                <button
                  onClick={effacerErreur}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Zone principale - 3 colonnes */}
      <main className="max-w-full mx-auto p-1">
        <div className="grid grid-cols-12 gap-3 min-h-[calc(100vh-160px)]">
          
              {/* Panneau gauche - Paramètres et contrôles */}
        <div className="col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 p-6 overflow-y-auto">
          <PanneauParametres
            style={style}
            ton={ton}
            longueur={longueur}
            onStyleChange={setStyle}
            onTonChange={setTon}
            onLongueurChange={setLongueur}
          />
        </div>

          {/* Zone centrale - Éditeur de texte */}
          <div className="col-span-6  bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
            
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
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex items-center gap-2 flex-wrap">
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

          {/* Panneau droit - Résultats et suggestions */}
          <div className="col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 p-6 overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Suggestions</h2>
            
            {/* Génération en cours */}
            {generationEnCours && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-sm text-gray-600">Génération en cours...</p>
              </div>
            )}

             {/* Modale des documents */}
            <ModalDocuments
              ouvert={modaleDocumentsOuverte}
              onFermer={() => setModaleDocumentsOuverte(false)}
              onCharger={handleChargerDocument}
            />

            {/* Résultat disponible */}
            {!generationEnCours && derniereReponse && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {derniereReponse.texte}
                  </p>
                </div>

                {/* Informations sur la génération */}
                <div className="text-xs text-gray-500 space-y-1">
                  <p>🕐 Temps : {(derniereReponse.tempsGeneration / 1000).toFixed(2)}s</p>
                  <p>📊 Tokens : {derniereReponse.tokensUtilises}</p>
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-2">
                  <button
                    onClick={handleAppliquerSuggestion}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    ✓ Appliquer
                  </button>
                  <button
                    onClick={() => handleAction('ameliorer')}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                    title="Régénérer"
                  >
                    ↻
                  </button>
                </div>
              </div>
            )}

            {/* État initial */}
            {!generationEnCours && !derniereReponse && statut === 'pret' && (
              <div className="text-sm text-gray-500 text-center py-8">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <p>Les suggestions apparaîtront ici</p>
              </div>
            )}

            {/* Modèle non chargé */}
            {statut !== 'pret' && (
              <div className="text-sm text-gray-500 text-center py-8">
                <p>Chargez d'abord le modèle pour commencer</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;