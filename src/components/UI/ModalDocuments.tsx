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
    if (!confirm(t("texte.confirmation_suppression_document"))) {
      return;
    }

    try {
      await supprimerDocument(id);
      // Recharger la liste
      await chargerListe();
    } catch (erreur) {
      console.error('Erreur suppression :', erreur);
      alert(t("texte.erreur_suppression_document"));
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
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
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
              className="group p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200"
            >
              <svg className="w-6 h-6 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Contenu - Liste des documents */}
          <div className="flex-1 overflow-y-auto p-6">
            
            {/* Chargement */}
            {chargement && (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-600 dark:border-blue-400 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Chargement...</p>
              </div>
            )}

            {/* Aucun document */}
            {!chargement && documents.length === 0 && (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center shadow-sm">
                  <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">{t("texte.aucun_document_sauvegarde")}</p>
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
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all dark:bg-gray-900"
                  >
                    <div className="flex items-start justify-between gap-4">
                      
                      {/* Informations du document */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {doc.titre || '📝 Brouillon sans titre'}
                        </h3>
                        
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"/>
                              <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            {formaterDate(doc.dateModification)}
                          </span>
                          
                          <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14 2 14 8 20 8"/>
                            </svg>
                            {compterMots(doc.contenu)} {t("texte.mots")}
                          </span>

                          {/* Paramètres si disponibles */}
                          {doc.parametres && (
                            <span className="flex items-center gap-1.5">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="3"/>
                                <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
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
                          className="group px-3 py-1.5 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 hover:from-blue-500 hover:to-blue-600 dark:hover:from-blue-400 dark:hover:to-blue-500 text-white text-sm rounded-lg transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                          </svg>
                          {t('buttons.charger')}
                        </button>
                        
                        {/* AJOUTER CE BOUTON */}
                        <button
                          onClick={() => {
                            // Convertir le contenu en HTML simple pour l'export
                            // (car IndexedDB stocke du texte brut)
                            const htmlSimple = `<p>${doc.contenu.replace(/\n/g, '</p><p>')}</p>`;
                            exporterEnMarkdown(htmlSimple, doc.titre || 'document');
                          }}
                          className="group px-3 py-1.5 bg-gradient-to-br from-green-600 to-green-700 dark:from-green-500 dark:to-green-600 hover:from-green-500 hover:to-green-600 dark:hover:from-green-400 dark:hover:to-green-500 text-white text-sm rounded-lg transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                          </svg>
                          {t('buttons.exporter')}
                        </button>
                        
                        <button
                          onClick={() => handleSupprimer(doc.id)}
                          className="group px-3 py-1.5 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 text-red-700 dark:text-red-200 text-sm rounded-lg hover:from-red-100 hover:to-red-200 dark:hover:from-red-800 dark:hover:to-red-700 transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            <line x1="10" y1="11" x2="10" y2="17"/>
                            <line x1="14" y1="11" x2="14" y2="17"/>
                          </svg>
                          {t('buttons.supprimer')}
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
              className="group w-full px-4 py-2.5 bg-gradient-to-br from-gray-600 to-gray-700 dark:from-gray-500 dark:to-gray-600 text-white rounded-xl hover:from-gray-500 hover:to-gray-600 dark:hover:from-gray-400 dark:hover:to-gray-500 transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              {t('buttons.fermer')}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}