// src/components/Layout/Header.tsx
import { ToggleModeNuit } from '../UI/ToggleModeNuit';
import { useTranslation } from 'react-i18next';
import SelecteurLangue from './SelecteurLangue';
import { useStoreHistorique } from '../../stroe/storeHistorique';
import { useEffect } from 'react';

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
    const { ouvrirModale, chargerHistorique } = useStoreHistorique();
    
    // Charger l'historique au montage
    useEffect(() => {
      chargerHistorique();
    }, []);

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
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('common.assistant_de_redaction_ia')}</h1>
              {/* <p className="text-sm text-gray-500 dark:text-gray-400">Propulsé par WebLLM - 100% Local</p> */}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Statut du modèle */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm">
              <div className={`w-2.5 h-2.5 rounded-full ${infoStatut.couleur} shadow-sm`} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {infoStatut.texte}
              </span>
            </div>
  
            {/* 🌙 Toggle Mode Sombre et bouton traduire */}
            <div className="flex items-center gap-3">
              <ToggleModeNuit />
              <SelecteurLangue /> 
            </div>
            
            {/* Boutons d'action */}
 {statut === 'inactif' && (
  <button 
    onClick={onChargerModele}
    className="group px-5 py-3 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 hover:from-blue-500 hover:to-blue-600 dark:hover:from-blue-400 dark:hover:to-blue-500 text-white rounded-xl transition-all duration-200 font-medium shadow-md hover:shadow-xl hover:scale-105 active:scale-95 flex items-center gap-3"
  >
    <svg className="w-5 h-5 transition-transform group-hover:translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 17l4 4 4-4"/>
      <line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/>
    </svg>
    {t('buttons.charger_le_modele_ia')}
  </button>
)}
            
            {/* Boutons après chargement du modèle */}
            {statut === 'pret' && (
              <div className="flex items-center gap-2">
                {/* NOUVEAU DOCUMENT */}
                <button 
                  onClick={onNouveauDocument}
                  title={t('boutons.nouveau_document')}
                  className="group relative p-2.5 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 text-slate-700 dark:text-slate-100 rounded-2xl hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-600 dark:hover:to-slate-700 transition-all duration-300 shadow-md hover:shadow-xl hover:scale-110 active:scale-95 border border-slate-300 dark:border-slate-600"
                >
                  <svg className="h-5 w-5 transition-transform group-hover:rotate-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="12" y1="18" x2="12" y2="12"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
                  </svg>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                
                {/* DOCUMENTS */}
                <button 
                  onClick={onOuvrirDocuments}
                  title={t('boutons.mes_documents')}
                  className="group relative p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white rounded-2xl hover:from-purple-400 hover:to-purple-500 dark:hover:from-purple-500 dark:hover:to-purple-600 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-purple-500/50 dark:hover:shadow-purple-700/50 hover:scale-110 active:scale-95"
                >
                  <svg className="h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    <path className="opacity-60 group-hover:opacity-100 transition-opacity" d="M2 9h20"/>
                  </svg>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>

                {/* HISTORIQUE */}
                <button 
                  onClick={ouvrirModale}
                  title={t('boutons.historique')}
                  className="group relative p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 text-white rounded-2xl hover:from-indigo-400 hover:to-indigo-500 dark:hover:from-indigo-500 dark:hover:to-indigo-600 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-indigo-500/50 dark:hover:shadow-indigo-700/50 hover:scale-110 active:scale-95"
                >
                  <svg className="h-5 w-5 transition-transform group-hover:-rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              
                {/* SAUVEGARDER */}
                <button 
                  onClick={onEnregistrer}
                  disabled={!texteEditeur.trim()}
                  title={t('boutons.sauvegarder')}
                  className={`group relative p-2.5 rounded-2xl transition-all duration-300 shadow-md hover:shadow-xl hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-md ${
                    estModifie 
                      ? 'bg-gradient-to-br from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600 hover:from-orange-400 hover:to-red-400 dark:hover:from-orange-500 dark:hover:to-red-500 hover:shadow-orange-500/50 dark:hover:shadow-orange-700/50' 
                      : 'bg-gradient-to-br from-emerald-500 to-green-600 dark:from-emerald-600 dark:to-green-700 hover:from-emerald-400 hover:to-green-500 dark:hover:from-emerald-500 dark:hover:to-green-600 hover:shadow-emerald-500/50 dark:hover:shadow-emerald-700/50'
                  } text-white`}
                >
                  <svg className="h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                  {estModifie && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-white dark:border-slate-900"></span>
                    </span>
                  )}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                
                {/* DÉCHARGER */}
                <button 
                  onClick={onDechargerModele}
                  title={t('boutons.decharger_modele')}
                  className="group relative p-2.5 bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600 text-white rounded-2xl hover:from-blue-400 hover:to-cyan-400 dark:hover:from-blue-500 dark:hover:to-cyan-500 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-blue-500/50 dark:hover:shadow-blue-700/50 hover:scale-110 active:scale-95"
                >
                  <svg className="h-5 w-5 transition-transform group-hover:translate-y-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Barre de progression */}
        {statut === 'chargement' && progression && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span className="font-medium">{progression.etape}</span>
              <span className="font-semibold">{Math.round(progression.pourcentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden shadow-inner">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${progression.pourcentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Affichage des erreurs */}
        {erreur && (
          <div className="mt-4 p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-700 rounded-xl shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">{erreur.message}</h3>
                {erreur.details && (
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{erreur.details}</p>
                )}
              </div>
              <button
                onClick={onEffacerErreur}
                className="group flex-shrink-0 p-1.5 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 hover:bg-red-200 dark:hover:bg-red-800/40 rounded-lg transition-all duration-200"
              >
                <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}