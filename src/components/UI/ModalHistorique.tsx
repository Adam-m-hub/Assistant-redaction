// src/components/ModaleHistorique.tsx
// Modale pour afficher et gérer l'historique des modifications

import { useStoreHistorique } from '../../stroe/storeHistorique';
import { useStoreModele } from '../../stroe/storeModele';
import { useEditor } from '@tiptap/react';
import type { EntreeHistorique } from '../../types/historique';
import { useTranslation } from 'react-i18next';

/**
 * Carte d'une entrée d'historique
 */
function CarteHistorique({ 
  entree, 
  onRecuperer, 
  onSupprimer 
}: { 
  entree: EntreeHistorique;
  onRecuperer: (texte: string, type: 'initial' | 'modifie') => void;
  onSupprimer: () => void;
}) {
  const { t } = useTranslation();

  // Formater la date
  const dateFormatee = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(entree.dateModification);

  // Traductions des actions
  const actionsTraduction: Record<string, string> = {
    ameliorer: t('texte.ameliore') || 'Amélioré',
    corriger: t('texte.corrige') || 'Corrigé',
    raccourcir: t('texte.raccourci') || 'Raccourci',
    allonger: t('texte.allonge') || 'Allongé'
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200">
      {/* En-tête */}
      <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {dateFormatee}
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 text-blue-700 dark:text-blue-200 text-sm font-medium rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                  <line x1="9" y1="9" x2="9.01" y2="9"/>
                  <line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
                {actionsTraduction[entree.action]}
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                {entree.personaNom}
              </span>
            </div>
          </div>
          <button
            onClick={onSupprimer}
            className="group p-2.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
            title={t('title.supprimer')}
          >
            <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Contenus côte à côte */}
      <div className="grid grid-cols-2 gap-4">
        {/* Texte initial */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {t('texte.texte_initial')}
            </h4>
          </div>
          <div className="flex-1 p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-900/30 rounded-xl border border-gray-200 dark:border-gray-700 overflow-auto max-h-32 mb-3">
            <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
              {entree.texteInitial}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 7h16M4 12h16M4 17h10"/>
              </svg>
              {entree.statsInitial.mots} {t('texte.mots')}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 7 4 4 20 4 20 7"/>
                <line x1="9" y1="20" x2="15" y2="20"/>
                <line x1="12" y1="4" x2="12" y2="20"/>
              </svg>
              {entree.statsInitial.caracteres} {t('texte.caracteres')}
            </span>
          </div>
          <button
            onClick={() => onRecuperer(entree.texteInitial, 'initial')}
            className="group w-full px-3 py-2.5 bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 dark:from-gray-700 dark:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            {t('buttons.recuperer_texte_initial')}
          </button>
        </div>

        {/* Texte modifié */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <circle cx="12" cy="15" r="3"/>
              <path d="M12 12v3"/>
            </svg>
            <h4 className="text-sm font-semibold text-green-700 dark:text-green-300">
              {t('texte.texte_modifie')}
            </h4>
          </div>
          <div className="flex-1 p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 rounded-xl border border-green-200 dark:border-green-700 overflow-auto max-h-32 mb-3">
            <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
              {entree.texteModifie}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 7h16M4 12h16M4 17h10"/>
              </svg>
              {entree.statsFinal.mots} {t('texte.mots')}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 7 4 4 20 4 20 7"/>
                <line x1="9" y1="20" x2="15" y2="20"/>
                <line x1="12" y1="4" x2="12" y2="20"/>
              </svg>
              {entree.statsFinal.caracteres} {t('texte.caracteres')}
            </span>
          </div>
          <button
            onClick={() => onRecuperer(entree.texteModifie, 'modifie')}
            className="group w-full px-3 py-2.5 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 dark:from-green-600 dark:to-emerald-700 dark:hover:from-green-500 dark:hover:to-emerald-600 text-white rounded-xl text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {t('buttons.recuperer_texte_modifie')}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Composant principal de la modale d'historique
 */
export function ModaleHistorique({ 
  editor,
  texteEditeur,
  setTexteEditeur 
}: { 
  editor: ReturnType<typeof useEditor>;
  texteEditeur: string;
  setTexteEditeur: (texte: string) => void;
}) {
  const { t } = useTranslation();
  const { historique, modaleOuverte, fermerModale, supprimerEntree, supprimerTout } = useStoreHistorique();

  if (!modaleOuverte) return null;

  /**
   * Récupérer un texte dans l'éditeur
   */
  const handleRecuperer = (texteARecuperer: string, type: 'initial' | 'modifie') => {
    // Vérifier si l'éditeur est vide
    const editorEstVide = !texteEditeur.trim();

    if (!editorEstVide) {
      alert('⚠️ ' + t('alert.vider_editeur_avant_recuperer'));
      return;
    }

    // Charger le texte dans l'éditeur
    setTexteEditeur(texteARecuperer);
    console.log(`✅ Texte ${type} récupéré dans l'éditeur`);
    fermerModale();
  };

  /**
   * Supprimer une entrée
   */
  const handleSupprimer = async (id: string) => {
    if (confirm(t('alert.supprimer_entree_historique'))) {
      await supprimerEntree(id);
    }
  };

  /**
   * Supprimer tout l'historique
   */
  const handleSupprimerTout = async () => {
    if (confirm(t('alert.supprimer_tout_historique'))) {
      await supprimerTout();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-7 h-7 text-indigo-600 dark:text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('texte.historique_modifications')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"/>
                  <line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/>
                  <line x1="3" y1="12" x2="3.01" y2="12"/>
                  <line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
                {historique.length} {historique.length === 1 ? t('texte.entree') : t('texte.entrees')} • {t('texte.maximum_50')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {historique.length > 0 && (
              <button
                onClick={handleSupprimerTout}
                className="group px-4 py-2.5 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
              >
                <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                {t('buttons.supprimer_tout')}
              </button>
            )}
            <button
              onClick={fermerModale}
              className="group p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200"
            >
              <svg className="w-6 h-6 text-gray-500 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-6">
          {historique.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <p className="text-lg font-medium">{t('texte.aucun_historique')}</p>
              <p className="text-sm mt-1">{t('texte.modifications_apparaissent_ici')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historique.map((entree) => (
                <CarteHistorique
                  key={entree.id}
                  entree={entree}
                  onRecuperer={handleRecuperer}
                  onSupprimer={() => handleSupprimer(entree.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}