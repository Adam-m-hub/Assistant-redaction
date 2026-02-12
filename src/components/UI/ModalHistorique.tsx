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
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
      {/* En-tête */}
      <div className="mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">📅 {dateFormatee}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                🎯 {actionsTraduction[entree.action]}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                👤 {entree.personaNom}
              </span>
            </div>
          </div>
          <button
            onClick={onSupprimer}
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title={t('title.supprimer')}
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Contenus côte à côte */}
      <div className="grid grid-cols-2 gap-4">
        {/* Texte initial */}
        <div className="flex flex-col">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            📝 {t('texte.texte_initial')}
          </h4>
          <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 overflow-auto max-h-32 mb-2">
            <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {entree.texteInitial}
            </p>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            📊 {entree.statsInitial.mots} {t('texte.mots')} • {entree.statsInitial.caracteres} {t('texte.caracteres')}
          </div>
          <button
            onClick={() => onRecuperer(entree.texteInitial, 'initial')}
            className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors"
          >
            ↩️ {t('buttons.recuperer_texte_initial')}
          </button>
        </div>

        {/* Texte modifié */}
        <div className="flex flex-col">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            ✨ {t('texte.texte_modifie')}
          </h4>
          <div className="flex-1 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700 overflow-auto max-h-32 mb-2">
            <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {entree.texteModifie}
            </p>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            📊 {entree.statsFinal.mots} {t('texte.mots')} • {entree.statsFinal.caracteres} {t('texte.caracteres')}
          </div>
          <button
            onClick={() => onRecuperer(entree.texteModifie, 'modifie')}
            className="w-full px-3 py-2 bg-green-100 hover:bg-green-200 dark:bg-green-700 dark:hover:bg-green-600 text-green-700 dark:text-green-200 rounded-lg text-sm font-medium transition-colors"
          >
            ✅ {t('buttons.recuperer_texte_modifie')}
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              📜 {t('texte.historique_modifications')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {historique.length} {historique.length === 1 ? t('texte.entree') : t('texte.entrees')} • {t('texte.maximum_50')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {historique.length > 0 && (
              <button
                onClick={handleSupprimerTout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                🗑️ {t('buttons.supprimer_tout')}
              </button>
            )}
            <button
              onClick={fermerModale}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-6">
          {historique.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
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
