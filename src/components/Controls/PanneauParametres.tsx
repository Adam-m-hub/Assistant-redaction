// src/components/Controls/PanneauParametres.tsx
// Panneau de personnalisation avec selects déroulants

import type { StyleEcriture, Ton, Longueur } from '../../lib/prompts/templates';
//import { useStorePersonas } from '@/store/storePersonas'; 
import { SelecteurPersonas } from '../../lib/personas/SelecteurPersonas';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

/**
 * Props du composant
 */
interface PanneauParametresProps {
  style: StyleEcriture;
  ton: Ton;
  longueur: Longueur;
  onStyleChange: (style: StyleEcriture) => void;
  onTonChange: (ton: Ton) => void;
  onLongueurChange: (longueur: Longueur) => void;
}

/**
 * Composant Panneau de Paramètres
 * Version compacte avec selects déroulants
 */
export default function PanneauParametres({
  style,
  ton,
  longueur,
  onStyleChange,
  onTonChange,
  onLongueurChange
}: PanneauParametresProps) {
  const { t } = useTranslation();
  const [modalOuvert, setModalOuvert] = useState(false);
  const [styleTemp, setStyleTemp] = useState(style);
  const [tonTemp, setTonTemp] = useState(ton);
  const [longueurTemp, setLongueurTemp] = useState(longueur);
  const [modalCreerOuvert, setModalCreerOuvert] = useState(false);

  /**
   * Options de style avec icônes
   */
  const optionsStyle: Record<StyleEcriture, { label: string; description: string }> = {
    formel: { label: t("style.formel"), description: t("descStyle.professionnel_et_structure") },
    creatif: { label: t("style.creatif"), description: t("descStyle.original_et_imaginatif") },
    concis: { label: t("style.concis"), description: t("descStyle.concis_et_direct") },
    technique: { label: t("style.technique"), description: t("descStyle.technique_et_detaille") }
  };

  /**
   * Options de ton avec icônes
   */
  const optionsTon: Record<Ton, { label: string; description: string }> = {
    neutre: { label: t("ton.neutre"), description: t("descTon.objectif_et_equilibre") },
    enthousiaste: { label: t("ton.enthousiaste"), description: t("descTon.positif_et_dynamique") },
    serieux: { label: t("ton.serieux"), description: t("descTon.pose_et_reflechi") },
    amical: { label: t("ton.amical"), description: t("descTon.chaleureux_et_accessible") }
  };

  /**
   * Options de longueur
   */
  const optionsLongueur: Record<Longueur, { label: string; description: string }> = {
    court: { label: t("labels.court"), description: t("texte.description_court") },
    moyen: { label: t("labels.moyen"), description: t("texte.description_moyen") },
    long: { label: t("labels.long"), description: t("texte.description_long") }
  };

  const handleOuvrirModal = () => {
    setStyleTemp(style);
    setTonTemp(ton);
    setLongueurTemp(longueur);
    setModalOuvert(true);
  };

  const handleAppliquer = () => {
    onStyleChange(styleTemp);
    onTonChange(tonTemp);
    onLongueurChange(longueurTemp);
    setModalOuvert(false);
  };

  const getStyleIcon = (key: StyleEcriture) => {
    const icons = {
      formel: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
      creatif: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
      concis: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/></svg>,
      technique: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
    };
    return icons[key];
  };

  const getTonIcon = (key: Ton) => {
    const icons = {
      neutre: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
      enthousiaste: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
      serieux: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="15" x2="16" y2="15"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
      amical: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    };
    return icons[key];
  };

  const getLongueurIcon = (key: Longueur) => {
    const icons = {
      court: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/></svg>,
      moyen: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/></svg>,
      long: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg>
    };
    return icons[key];
  };

  return (
    <div className="space-y-4 ">
      {/* En-tête avec bouton paramètres */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t("labels.parametres")}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("texte.personnalisez_le_style_de_generation")}
            </p>
          </div>
        </div>

        {/* Bouton Paramètres (3 tirets) */}
        <button
          onClick={handleOuvrirModal}
          className="group p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200"
          title={t("buttons.configurer_parametres")}
        >
          <svg className="w-6 h-6 text-gray-600 dark:text-gray-400 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Sélecteur de Personas - Sans cadre */}
      <SelecteurPersonas />
              {/* Sélection actuelle - Version compacte et centrée */}
        <div className="space-y-1 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            {t("texte.selection_actuelle")}
          </h3>

          <div className="space-y-1">
            {/* Style */}
            <div>
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider ml-1">
                {t("labels.style")}
              </span>
              <div className="flex items-center gap-2 p-2 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-700">
                <div className="flex-shrink-0 w-7 h-7 bg-blue-500 dark:bg-blue-600 rounded-lg flex items-center justify-center text-white">
                  {getStyleIcon(style)}
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {optionsStyle[style].label}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {optionsStyle[style].description}
                  </p>
                </div>
              </div>
            </div>

            {/* Ton */}
            <div>
              <span className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wider ml-1">
                {t("labels.ton")}
              </span>
              <div className="flex items-center gap-2 p-2 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-700">
                <div className="flex-shrink-0 w-7 h-7 bg-purple-500 dark:bg-purple-600 rounded-lg flex items-center justify-center text-white">
                  {getTonIcon(ton)}
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {optionsTon[ton].label}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {optionsTon[ton].description}
                  </p>
                </div>
              </div>
            </div>

            {/* Longueur */}
            <div>
              <span className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider ml-1">
                {t("labels.longueur")}
              </span>
              <div className="flex items-center gap-2 p-2 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-700">
                <div className="flex-shrink-0 w-7 h-7 bg-green-500 dark:bg-green-600 rounded-lg flex items-center justify-center text-white">
                  {getLongueurIcon(longueur)}
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {optionsLongueur[longueur].label}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {optionsLongueur[longueur].description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Modal de configuration - VERSION OPTIMISÉE */}
      {modalOuvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl border border-gray-200 dark:border-gray-700 flex flex-col" style={{ maxHeight: '80vh' }}>
            {/* Header - Fixe */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {t("buttons.configurer_parametres")}
                </h2>
              </div>
              <button
                onClick={() => setModalOuvert(false)}
                className="group p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200"
              >
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Contenu avec scroll uniquement sur la partie persona */}
            <div className="flex-1 overflow-hidden p-6">
              <div className="grid grid-cols-3 gap-6 h-full">
                {/* Colonne gauche: Style, Ton, Longueur - Fixe */}
                <div className="col-span-2 space-y-4 overflow-y-auto pr-2" style={{ maxHeight: 'calc(80vh - 120px)' }}>
                  {/* Style - Disposition horizontale */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                      {t("labels.style_ecriture")}
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                      {(Object.keys(optionsStyle) as StyleEcriture[]).map((key) => (
                        <button
                          key={key}
                          onClick={() => setStyleTemp(key)}
                          className={`p-2 rounded-xl border-2 transition-all duration-200 ${
                            styleTemp === key
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md'
                              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-gray-800'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                              styleTemp === key
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            }`}>
                              {getStyleIcon(key)}
                            </div>
                            <span className={`text-xs font-medium ${
                              styleTemp === key
                                ? 'text-blue-700 dark:text-blue-300'
                                : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {optionsStyle[key].label}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ton */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      {t("labels.ton")}
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                      {(Object.keys(optionsTon) as Ton[]).map((key) => (
                        <button
                          key={key}
                          onClick={() => setTonTemp(key)}
                          className={`p-2 rounded-xl border-2 transition-all duration-200 ${
                            tonTemp === key
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 shadow-md'
                              : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 bg-white dark:bg-gray-800'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                              tonTemp === key
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            }`}>
                              {getTonIcon(key)}
                            </div>
                            <span className={`text-xs font-medium ${
                              tonTemp === key
                                ? 'text-purple-700 dark:text-purple-300'
                                : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {optionsTon[key].label}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Longueur */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="21" y1="10" x2="3" y2="10"/>
                        <line x1="21" y1="6" x2="3" y2="6"/>
                        <line x1="21" y1="14" x2="3" y2="14"/>
                        <line x1="21" y1="18" x2="3" y2="18"/>
                      </svg>
                      {t("labels.longueur_cible")}
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.keys(optionsLongueur) as Longueur[]).map((key) => (
                        <button
                          key={key}
                          onClick={() => setLongueurTemp(key)}
                          className={`p-2 rounded-xl border-2 transition-all duration-200 ${
                            longueurTemp === key
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/30 shadow-md'
                              : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 bg-white dark:bg-gray-800'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                              longueurTemp === key
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            }`}>
                              {getLongueurIcon(key)}
                            </div>
                            <span className={`text-xs font-medium ${
                              longueurTemp === key
                                ? 'text-green-700 dark:text-green-300'
                                : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {optionsLongueur[key].label}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Colonne droite: Personas - Avec scroll */}
                <div className="col-span-1 border-l border-gray-200 dark:border-gray-700 pl-4">
                      <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  {t("labels.personas")}
                </h3>
              <button
                onClick={() => setModalCreerOuvert(true)}
                className="group p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all duration-200"
                title={t("buttons.creer_nouveau_persona")}
              >
                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="16"/>
                  <line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
              </button>
            </div>
                <div className="overflow-y-auto pr-1" style={{ maxHeight: 'calc(80vh - 180px)' }}>
                  <SelecteurPersonas isInModal={true} />
                </div>
            </div>
          </div>
        </div>

            {/* Footer - Fixe */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3 rounded-b-2xl">
              <button
                onClick={() => setModalOuvert(false)}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition-all duration-200"
              >
                {t("buttons.annuler")}
              </button>
              <button
                onClick={handleAppliquer}
                className="flex-1 px-4 py-2 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-400 dark:hover:to-blue-500 text-white rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {t("buttons.appliquer")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}