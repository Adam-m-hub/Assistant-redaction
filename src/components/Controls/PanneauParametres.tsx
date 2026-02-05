// src/components/Controls/PanneauParametres.tsx
// Panneau de personnalisation avec selects déroulants

import type { StyleEcriture, Ton, Longueur } from '../../lib/prompts/templates';
import { useStorePersonas } from '@/stroe/storePersonas'; 
import {SelecteurPersonas} from '../../lib/personas/SelecteurPersonas';

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

  /**
   * Options de style avec icônes
   */
  const optionsStyle: Record<StyleEcriture, { label: string; description: string }> = {
    formel: { label: 'Formel', description: 'Professionnel et structuré' },
    creatif: { label: 'Créatif', description: 'Original et imaginatif' },
    concis: { label: 'Concis', description: 'Direct et précis' },
    technique: { label: 'Technique', description: 'Détaillé et spécialisé' }
  };

  /**
   * Options de ton avec icônes
   */
  const optionsTon: Record<Ton, { label: string; description: string }> = {
    neutre: { label: 'Neutre', description: 'Objectif et équilibré' },
    enthousiaste: { label: 'Enthousiaste', description: 'Positif et dynamique' },
    serieux: { label: 'Sérieux', description: 'Posé et réfléchi' },
    amical: { label: 'Amical', description: 'Chaleureux et accessible' }
  };

  /**
   * Options de longueur
   */
  const optionsLongueur: Record<Longueur, { label: string; description: string }> = {
    court: { label: 'Court', description: '30-50 mots' },
    moyen: { label: 'Moyen', description: '100-200 mots' },
    long: { label: 'Long', description: '300-500 mots' }
  };

  return (
    <div className="space-y-2">
      
      {/* En-tête */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">⚙️ Paramètres</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Personnalisez le style de génération
        </p>
      </div>

     

      {/* Section : Style d'écriture */}
      <div className="space-y-1 mb-6">
         {/*  NOUVEAU : Sélecteur de Personas */}
          <SelecteurPersonas />
        <label htmlFor="style-select" className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
          📝 Style d'écriture
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
          💬 Ton
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
          📏 Longueur cible
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
          Sélection actuelle
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
          💡 <span className="font-medium">Astuce :</span> Ces paramètres influencent la génération de texte. 
          Expérimentez pour trouver ce qui vous convient !
        </p>
      </div>

    </div>
  );
}