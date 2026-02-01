// src/components/UI/PanneauDroit.tsx
import ModalDocuments from '../UI/ModalDocuments';
import type { DocumentSauvegarde } from '../../lib/storage/db';
import type { ReponseModele } from '../../lib/webllm/types';
import TabStatistiques from './TabStatistiques';

interface PanneauDroitProps {
  // Tab
  tabActif: 'suggestions' | 'statistiques';
  onTabChange: (tab: 'suggestions' | 'statistiques') => void;

  // Suggestions
  generationEnCours: boolean;
  texteEnCours: string;
  derniereReponse: ReponseModele | null;
  statut: string;
  onAppliquerSuggestion: () => void;
  onRegenererer: () => void;

  // Documents
  modaleDocumentsOuverte: boolean;
  onFermerModalDocuments: () => void;
  onChargerDocument: (doc: DocumentSauvegarde) => void;

  // Statistiques
  texteEditeur: string;
}

export default function PanneauDroit({
  tabActif,
  onTabChange,
  generationEnCours,
  texteEnCours,
  derniereReponse,
  statut,
  onAppliquerSuggestion,
  onRegenererer,
  modaleDocumentsOuverte,
  onFermerModalDocuments,
  onChargerDocument,
  texteEditeur,
}: PanneauDroitProps) {
  return (
    <div className="col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:text-gray-100 flex flex-col h-[750px]">
      
      {/* Tabs - FIXE en haut */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          <button
            onClick={() => onTabChange('suggestions')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors
                       ${tabActif === 'suggestions'
                         ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                         : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                       }`}
          >
            ✨ Suggestions
          </button>
          <button
            onClick={() => onTabChange('statistiques')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors
                       ${tabActif === 'statistiques'
                         ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                         : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                       }`}
          >
            📊 Statistiques
          </button>
        </div>
      </div>

      {/* Contenu du Tab */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ===== TAB SUGGESTIONS ===== */}
        {tabActif === 'suggestions' && (
          <div className="flex-1 flex flex-col p-4 overflow-hidden justify-center items-center">
            
            {/* Génération en cours avec streaming */}
            {generationEnCours && (
              <div className="flex flex-col h-full space-y-4">
                <div className="flex-shrink-0 flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm font-medium">Génération en cours...</span>
                </div>
                
                {texteEnCours && (
                  <div className="flex-1 min-h-[150px] border border-blue-200 w-full rounded-lg p-4 dark:bg-blue-900 dark:border-blue-800 overflow-y-auto">
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap dark:text-gray-100">
                      {texteEnCours}
                      <span className="inline-block w-1 h-4 bg-blue-600 animate-pulse ml-1"></span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Modale des documents */}
            <ModalDocuments
              ouvert={modaleDocumentsOuverte}
              onFermer={onFermerModalDocuments}
              onCharger={onChargerDocument}
            />

            {/* Résultat disponible */}
            {!generationEnCours && derniereReponse && (
              <div className="flex flex-col h-full space-y-4">
                
                <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900 dark:border-blue-800 overflow-y-auto">
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap dark:text-gray-100">
                    {derniereReponse.texte}
                  </p>
                </div>

                <div className="flex-shrink-0 space-y-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <p>🕐 Temps : {(derniereReponse.tempsGeneration / 1000).toFixed(2)}s</p>
                    <p>📊 Tokens : {derniereReponse.tokensUtilises}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={onAppliquerSuggestion}
                      className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      ✓ Appliquer
                    </button>
                    <button
                      onClick={onRegenererer}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                      title="Régénérer"
                    >
                      ↻
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* État initial */}
            {!generationEnCours && !derniereReponse && statut === 'pret' && (
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <p>Les suggestions apparaîtront ici</p>
              </div>
            )}

            {/* Modèle non chargé */}
            {statut !== 'pret' && (
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                <p>Chargez d'abord le modèle pour commencer</p>
              </div>
            )}
          </div>
        )}

        {/* ===== TAB STATISTIQUES ===== */}
       <TabStatistiques texteEditeur={texteEditeur} />

      </div>
    </div>
  );
}