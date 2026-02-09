// src/components/UI/TabStatistiques.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
interface TabStatistiquesProps {
  texteEditeur: string;
}

export default function TabStatistiques({ texteEditeur }: TabStatistiquesProps) {
  const { t } = useTranslation();
  
  if (!texteEditeur.trim()) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
        <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p>{t("texte.Écrivez_du_texte_pour_voir_les_statistiques")}</p>
      </div>
    );
  }

  // Calculs
  const mots = texteEditeur.trim().split(/\s+/).filter(Boolean);
  const caracteres = texteEditeur.length;
  const phrases = texteEditeur.split(/[.!?]+/).filter(s => s.trim());
  const moyenneMots = phrases.length > 0 ? Math.round(mots.length / phrases.length) : 0;

  // Mots les plus utilisés (enlève les mots courts)
  const frequence = mots
    .map(m => m.toLowerCase().replace(/[^a-zà-ù]/g, ''))
    .filter(m => m.length > 3)
    .reduce((acc: Record<string, number>, mot) => {
      acc[mot] = (acc[mot] || 0) + 1;
      return acc;
    }, {});

  const motsTries = Object.entries(frequence)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Score de lisibilité
  const scorePhrase = moyenneMots <= 15 ? 'Facile' : moyenneMots <= 25 ? 'Intermédiaire' : 'Difficile';
  const couleurScore = moyenneMots <= 15 ? 'text-green-600 dark:text-green-400' : moyenneMots <= 25 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400';

  return (
    <div className="space-y-4">
      {/* Compteurs principaux */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{mots.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t("texte.mots")}</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{caracteres}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t("texte.caracteres")}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{phrases.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t("texte.phrases")}</p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{moyenneMots}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t("texte.moyenne_mots_par_phrase")}</p>
        </div>
      </div>

      {/* Score de lisibilité */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-300">📖 {t("texte.lisibilite")}</span>
          <span className={`text-sm font-semibold ${couleurScore}`}>{scorePhrase}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mt-2">
          <div 
            className={`h-1.5 rounded-full ${moyenneMots <= 15 ? 'bg-green-500' : moyenneMots <= 25 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${Math.min((moyenneMots / 30) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Mots les plus utilisés */}
      {motsTries.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">🔤 {t("texte.mots_plus_utilises")}</p>
          <div className="space-y-2">
            {motsTries.map(([mot, nombre]) => (
              <div key={mot} className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400 w-24 truncate">{mot}</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(nombre / motsTries[0][1]) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 w-6 text-right">{nombre}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}