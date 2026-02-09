// src/components/Layout/Header.tsx
import { ToggleModeNuit } from '../UI/ToggleModeNuit';
import { useTranslation } from 'react-i18next';
import SelecteurLangue from './SelecteurLangue';

interface HeaderProps {
  statut: 'inactif' | 'chargement' | 'pret' | 'erreur';
  progression?: {
    etape: string;
    pourcentage: number;
  };
  erreur?: {
    message: string;
    details?: string;
  };
  texteEditeur: string;
  estModifie: boolean;
  onChargerModele: () => void;
  onDechargerModele: () => void;
  onNouveauDocument: () => void;
  onOuvrirDocuments: () => void;
  onEnregistrer: () => void;
  onEffacerErreur: () => void;
}

export default function Header({
  statut,
  progression,
  erreur,
  texteEditeur,
  estModifie,
  onChargerModele,
  onDechargerModele,
  onNouveauDocument,
  onOuvrirDocuments,
  onEnregistrer,
  onEffacerErreur
}: HeaderProps) {
    const { t } = useTranslation();
  /**
   * Obtenir le texte et la couleur du statut
   */
  const obtenirInfoStatut = () => {
    switch (statut) {
      case 'pret':
        return { texte: t('statut.modele_pret'), couleur: 'bg-green-500' };
      case 'chargement':
        return { texte: t('statut.chargement'), couleur: 'bg-yellow-500 animate-pulse' };
      case 'erreur':
        return { texte: t('statut.erreur'), couleur: 'bg-red-500' };
      default:
        return { texte: t('statut.hors_ligne'), couleur: 'bg-gray-400' };
    }
  };

  const infoStatut = obtenirInfoStatut();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="max-w-full mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('common.assistant_de_redaction_ia')}</h1>
              {/* <p className="text-sm text-gray-500 dark:text-gray-400">Propulsé par WebLLM - 100% Local</p> */}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Statut du modèle */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100">
              <div className={`w-2 h-2 rounded-full ${infoStatut.couleur}`} />
              <span className="text-sm font-medium text-gray-700">
                {infoStatut.texte}
              </span>
            </div>
  
            {/* 🌙 Toggle Mode Sombre  et boutton traduire*/}
            <div className="flex items-center gap-3">
              <ToggleModeNuit />
              <SelecteurLangue /> 
            </div>
            
            {/* Boutons d'action */}
            {statut === 'inactif' && (
              <button 
                onClick={onChargerModele}
                className="px-2 py-1 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
              >
                {t('buttons.charger_le_modele_ia')}
              </button>
            )}
            
            {/* Boutons après chargement du modèle */}
            {statut === 'pret' && (
              <>
                {/* NOUVEAU BOUTON */}
                <button 
                  onClick={onNouveauDocument}
                  className="px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  📄 {t('buttons.nouveau_document')}
                </button>
                
                <button 
                  onClick={onOuvrirDocuments}
                  className="px-2 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  📁 {t('buttons.mes_documents')}
                </button>
              
                {/* Bouton Enregistrer avec indicateur */}
                <button 
                  onClick={onEnregistrer}
                  disabled={!texteEditeur.trim()}
                  className={`px-2 py-1 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                    estModifie 
                      ? 'bg-orange-600 text-white hover:bg-orange-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {estModifie ? '● ' + t('buttons.enregistrer') : '✓ ' + t('buttons.sauvegarde')}
                </button>
                
                <button 
                  onClick={onDechargerModele}
                  className="px-2 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  {t('buttons.decharger_le_modele')}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Barre de progression */}
        {statut === 'chargement' && progression && (
          <div className="mt-1">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
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
              <svg className="w-3 h-3 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">{erreur.message}</h3>
                {erreur.details && (
                  <p className="text-sm text-red-600 mt-1">{erreur.details}</p>
                )}
              </div>
              <button
                onClick={onEffacerErreur}
                className="text-red-600 hover:text-red-800"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}