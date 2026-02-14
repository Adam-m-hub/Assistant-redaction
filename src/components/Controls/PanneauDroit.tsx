// src/components/UI/PanneauDroit.tsx
import ModalDocuments from '../UI/ModalDocuments';
import type { DocumentSauvegarde } from '../../lib/storage/db';
import type { ReponseModele } from '../../lib/webllm/types';
import TabStatistiques from './TabStatistiques';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  return (
    <div className="col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:text-gray-100 flex flex-col h-[540px]">
      
      {/* Tabs - FIXE en haut */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          <button
            onClick={() => onTabChange('suggestions')}
            className={`flex-1 px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2
                       ${tabActif === 'suggestions'
                         ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                         : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                       }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            {t("buttons.suggestions")}
          </button>
          <button
            onClick={() => onTabChange('statistiques')}
            className={`flex-1 px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2
                       ${tabActif === 'statistiques'
                         ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                         : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                       }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            {t("buttons.statistiques")}
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
                  <div className="relative w-4 h-4">
                    <div className="absolute inset-0 border-2 border-blue-200 dark:border-blue-800 rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-blue-600 dark:border-blue-400 rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <span className="text-sm font-medium">{t("texte.generation_en_cours")}</span>
                </div>
                
                {texteEnCours && (
                  <div className="flex-1 min-h-[150px] border border-blue-200 w-full rounded-lg p-4 dark:bg-blue-900/20 dark:border-blue-800 overflow-y-auto">
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
                
                <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 overflow-y-auto">
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap dark:text-gray-100">
                    {derniereReponse.texte}
                  </p>
                </div>

                <div className="flex-shrink-0 space-y-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <p className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      {t("texte.temps")} : {(derniereReponse.tempsGeneration / 1000).toFixed(2)}s
                    </p>
                    <p className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="20" x2="18" y2="10"/>
                        <line x1="12" y1="20" x2="12" y2="4"/>
                        <line x1="6" y1="20" x2="6" y2="14"/>
                      </svg>
                      {t("texte.tokens_utilises")} : {derniereReponse.tokensUtilises}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={onAppliquerSuggestion}
                      className="group flex-1 px-3 py-2 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 hover:from-blue-500 hover:to-blue-600 dark:hover:from-blue-400 dark:hover:to-blue-500 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {t("buttons.appliquer")}
                    </button>
                    <button
                      onClick={onRegenererer}
                      className="group px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                      title={t("buttons.regenerer")}
                    >
                      <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* État initial */}
            {!generationEnCours && !derniereReponse && statut === 'pret' && (
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center shadow-sm">
                  <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <p className="font-medium">{t("texte.les_suggestions_apparaitront_ici")}</p>
              </div>
            )}

            {/* Modèle non chargé */}
            {statut !== 'pret' && (
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center shadow-sm">
                  <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <p className="font-medium">{t("texte.chargez_d_abord_le_modele_pour_commencer")}</p>
              </div>
            )}
          </div>
        )}

        {/* ===== TAB STATISTIQUES ===== */}
        {tabActif === 'statistiques' && (
          <div className="flex-1 flex flex-col p-6 overflow-y-auto">
            <TabStatistiques texteEditeur={texteEditeur} />
          </div>
        )}
      </div>
    </div>
  );
}