// src/components/UI/ModalDocuments.tsx
// Modale pour afficher et gérer les documents sauvegardés

import { useEffect, useState } from 'react';
import { listerDocuments, supprimerDocument, type DocumentSauvegarde } from '../../lib/storage/db';
import { exporterEnMarkdown } from '../../utils/export';
import { useTranslation } from 'react-i18next';

/**
 * Props du composant
 */
interface ModalDocumentsProps {
  ouvert: boolean;                                      // Modale ouverte ou fermée
  onFermer: () => void;                                 // Callback pour fermer
  onCharger: (document: DocumentSauvegarde) => void;    // Callback pour charger un doc
}

/**
 * Composant Modale des Documents
 * Affiche la liste des documents sauvegardés
 */
export default function ModalDocuments({
  ouvert,
  onFermer,
  onCharger
}: ModalDocumentsProps) {
  const { t } = useTranslation();
  // État local
  const [documents, setDocuments] = useState<DocumentSauvegarde[]>([]);
  const [chargement, setChargement] = useState(true);

  /**
   * Charger la liste des documents au montage
   */
  useEffect(() => {
    if (ouvert) {
      chargerListe();
    }
  }, [ouvert]);

  /**
   * Charger la liste des documents
   */
  const chargerListe = async () => {
    setChargement(true);
    try {
      const docs = await listerDocuments();
      setDocuments(docs);
    } catch (erreur) {
      console.error('Erreur chargement liste :', erreur);
    } finally {
      setChargement(false);
    }
  };

  /**
   * Supprimer un document
   */
  const handleSupprimer = async (id: string) => {
    // Confirmation
    if (!confirm('Voulez-vous vraiment supprimer ce document ?')) {
      return;
    }

    try {
      await supprimerDocument(id);
      // Recharger la liste
      await chargerListe();
    } catch (erreur) {
      console.error('Erreur suppression :', erreur);
      alert('Erreur lors de la suppression');
    }
  };

  /**
   * Charger un document
   */
  const handleCharger = (doc: DocumentSauvegarde) => {
    onCharger(doc);
    onFermer();
  };

  /**
   * Formater la date
   */
  const formaterDate = (date: Date): string => {
    const maintenant = new Date();
    const diff = maintenant.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const heures = Math.floor(minutes / 60);
    const jours = Math.floor(heures / 24);

    if (minutes < 1) return t("texte.a_l_instant");
    if (minutes < 60) return `${t("texte.il_y_a")} ${minutes} min`;
    if (heures < 24) return `${t("texte.il_y_a")} ${heures}h`;
    if (jours === 1) return t("texte.hier");
    if (jours < 7) return `${t("texte.il_y_a")} ${jours} jours`;
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== maintenant.getFullYear() ? 'numeric' : undefined
    });
  };

  /**
   * Compter les mots dans un texte
   */
  const compterMots = (texte: string): number => {
    return texte.trim().split(/\s+/).filter(Boolean).length;
  };

  // Ne pas afficher si fermé
  if (!ouvert) return null;

  return (
    <>
      {/* Overlay sombre */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onFermer}
      />

      {/* Modale */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
          
          {/* En-tête */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t("texte.documents_sauvegardes")}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {documents.length} {t("texte.document")} {documents.length > 1 ? t("texte.sauvegardes") : t("texte.sauvegarde")}
                </p>
              </div>
            </div>
            
            {/* Bouton fermer */}
            <button
              onClick={onFermer}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Contenu - Liste des documents */}
          <div className="flex-1 overflow-y-auto p-6">
            
            {/* Chargement */}
            {chargement && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Aucun document */}
            {!chargement && documents.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400">{t("texte.aucun_document_sauvegarde")}</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  {t("texte.vos_documents_apparaissent_ici")}
                </p>
              </div>
            )}

            {/* Liste des documents */}
            {!chargement && documents.length > 0 && (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm transition-all dark:bg-gray-900"
                  >
                    <div className="flex items-start justify-between gap-4">
                      
                      {/* Informations du document */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {doc.titre || '📝 Brouillon sans titre'}
                        </h3>
                        
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            {formaterDate(doc.dateModification)}
                          </span>
                          
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                            </svg>
                            {compterMots(doc.contenu)} {t("texte.mots")}
                          </span>

                          {/* Paramètres si disponibles */}
                          {doc.parametres && (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                              </svg>
                              {doc.parametres.style}
                            </span>
                          )}
                        </div>

                        {/* Aperçu du contenu */}
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                          {doc.contenu.substring(0, 120)}...
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleCharger(doc)}
                          className="px-3 py-1.5 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white text-sm rounded transition-colors whitespace-nowrap"
                        >
                          📂 {t('buttons.charger')}
                        </button>
                        
                        {/* AJOUTER CE BOUTON */}
                        <button
                          onClick={() => {
                            // Convertir le contenu en HTML simple pour l'export
                            // (car IndexedDB stocke du texte brut)
                            const htmlSimple = `<p>${doc.contenu.replace(/\n/g, '</p><p>')}</p>`;
                            exporterEnMarkdown(htmlSimple, doc.titre || 'document');
                          }}
                          className="px-3 py-1.5 bg-green-600 dark:bg-green-500 text-white text-sm rounded hover:bg-green-700 dark:hover:bg-green-600 transition-colors whitespace-nowrap"
                        >
                          📥 {t('buttons.exporter')}
                        </button>
                        
                        <button
                          onClick={() => handleSupprimer(doc.id)}
                          className="px-3 py-1.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 text-sm rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors whitespace-nowrap"
                        >
                          🗑️ {t('buttons.supprimer')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pied de page */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
            <button
              onClick={onFermer}
              className="w-full px-4 py-2 bg-gray-600 dark:bg-gray-500 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              {t('buttons.fermer')}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}