// src/components/Controls/PanneauParametres.tsx
// Panneau de personnalisation avec selects déroulants

import type { StyleEcriture, Ton, Longueur } from '../../lib/prompts/templates';
import { useStorePersonas } from '@/stroe/storePersonas'; 
import {SelecteurPersonas} from '../../lib/personas/SelecteurPersonas';
import { useTranslation } from 'react-i18next';

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

  return (
    <div className="space-y-1  ">
      {/* En-tête */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">⚙️ {t("labels.parametres")}</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t("texte.personnalisez_le_style_de_generation")}
        </p>
      </div>

     

      {/* Section : Style d'écriture */}
      <div className="space-y-1 mb-6">
         {/*  NOUVEAU : Sélecteur de Personas */}
          <SelecteurPersonas />
        <label htmlFor="style-select" className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
          📝 {t("labels.style_ecriture")}
        </label>
        <select
          id="style-select"
          value={style}
          onChange={(e) => onStyleChange(e.target.value as StyleEcriture)}
          className="w-full px-2 py-0.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-pointer hover:border-gray-200 dark:hover:border-gray-600 transition-colors"
        >
          {(Object.keys(optionsStyle) as StyleEcriture[]).map((key) => (
            <option key={key} value={key}>
               {optionsStyle[key].label} - {optionsStyle[key].description}
            </option>
          ))}
        </select>
      </div>

      {/* Section : Ton */}
      <div className="space-y-1 mb-6">
        <label htmlFor="ton-select" className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
          💬 {t("labels.ton")}
        </label>
        <select
          id="ton-select"
          value={ton}
          onChange={(e) => onTonChange(e.target.value as Ton)}
          className="w-full px-2 py-0.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-pointer hover:border-gray-200 dark:hover:border-gray-600 transition-colors"
        >
          {(Object.keys(optionsTon) as Ton[]).map((key) => (
            <option key={key} value={key}>
              {optionsTon[key].label} - {optionsTon[key].description}
            </option>
          ))}
        </select>
      </div>

      {/* Section : Longueur cible */}
      <div className="space-y-1 mb-3">
        <label htmlFor="longueur-select" className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
          📏 {t("labels.longueur_cible")}
        </label>
        <select
          id="longueur-select"
          value={longueur}
          onChange={(e) => onLongueurChange(e.target.value as Longueur)}
                className="w-full  px-2 py-0.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-pointer hover:border-gray-200 dark:hover:border-gray-600 transition-colors"
        >
          {(Object.keys(optionsLongueur) as Longueur[]).map((key) => (
            <option key={key} value={key}>
              {optionsLongueur[key].label} ({optionsLongueur[key].description})
            </option>
          ))}
        </select>
      </div>

      {/* Résumé visuel des paramètres sélectionnés */}
      <div className="pt-1 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          {t("texte.selection_actuelle")}
        </h3>
        
        {/* Cartes résumé */}
        <div className="space-y-1 mb-3 ">
          {/* Style */}
          <div className="flex items-center gap-1 p-1 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <span className="text-xl"></span>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{optionsStyle[style].label}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{optionsStyle[style].description}</p>
            </div>
          </div>

          {/* Ton */}
          <div className="flex items-center gap-1 p-1 bg-purple-50 dark:bg-purple-900 rounded-lg">
            <span className="text-xl"></span>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{optionsTon[ton].label}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{optionsTon[ton].description}</p>
            </div>
          </div>

          {/* Longueur */}
          <div className="flex items-center gap-2 p-1 bg-green-50 dark:bg-green-900 rounded-lg">
            <span className="text-xl"></span>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{optionsLongueur[longueur].label}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{optionsLongueur[longueur].description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info bulle */}
      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          💡 <span className="font-medium">{t("texte.astuce")} </span> {t("texte.parametres_influencent_generation")}
            <br />
          {t("texte.experimenter_pour_trouver_ce_qui_vous_convient")}
        </p>
      </div>

    </div>
  );
}