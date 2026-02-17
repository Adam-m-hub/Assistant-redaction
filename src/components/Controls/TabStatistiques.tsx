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
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center shadow-sm">
          <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
        </div>
        <p className="font-medium">{t("texte.Écrivez_du_texte_pour_voir_les_statistiques")}</p>
      </div>
    );
  }

  // Calculs
  const mots = texteEditeur.trim().split(/\s+/).filter(Boolean);
  const caracteres = texteEditeur.length;
const phrases = texteEditeur
  .split(/(?<=[.!?])\s+(?=[A-ZÀ-Ù])/)
  .filter(s => s.trim().length > 0);
  const moyenneMots = phrases.length > 0 ? Math.round(mots.length / phrases.length) : 0;

  // Mots les plus utilisés (enlève les mots courts)
const frequence = mots
  .map(m => {
    // Normalise les caractères Unicode fancy vers leurs équivalents normaux
    return m
      .normalize('NFKD')           // décompose les caractères Unicode
      .replace(/[^\p{L}]/gu, '')   // garde uniquement les vraies lettres (toutes langues)
      .toLowerCase();
  })
  .filter(m => m.length > 3)
  .reduce((acc: Record<string, number>, mot) => {
    acc[mot] = (acc[mot] || 0) + 1;
    return acc;
  }, {});

  // ✅ Filtrer uniquement les mots utilisés >= 2 fois
  const motsTries = Object.entries(frequence)
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Score de lisibilité
  const scorePhrase = moyenneMots <= 15 ? 'Facile' : moyenneMots <= 25 ? 'Intermédiaire' : 'Difficile';
  const couleurScore = moyenneMots <= 15 ? 'text-green-600 dark:text-green-400' : moyenneMots <= 25 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400';
  const couleurBg = moyenneMots <= 15 ? 'bg-green-500' : moyenneMots <= 25 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="space-y-4">
      {/* Compteurs principaux */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl p-3 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between mb-1">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{mots.length}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t("texte.mots")}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 rounded-xl p-3 border border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between mb-1">
            <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 7 4 4 20 4 20 7"/>
              <line x1="9" y1="20" x2="15" y2="20"/>
              <line x1="12" y1="4" x2="12" y2="20"/>
            </svg>
          </div>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{caracteres}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t("texte.caracteres")}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 rounded-xl p-3 border border-green-200 dark:border-green-700">
          <div className="flex items-center justify-between mb-1">
            <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{phrases.length}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t("texte.phrases")}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 rounded-xl p-3 border border-orange-200 dark:border-orange-700">
          <div className="flex items-center justify-between mb-1">
            <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </div>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{moyenneMots}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t("texte.moyenne_mots_par_phrase")}</p>
        </div>
      </div>

      {/* Score de lisibilité */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t("texte.lisibilite")}</span>
          <span className={`ml-auto text-xs font-bold ${couleurScore}`}>{scorePhrase}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
          <div 
            className={`h-1.5 rounded-full ${couleurBg} transition-all duration-500`}
            style={{ width: `${Math.min((moyenneMots / 30) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Mots les plus utilisés */}
      {motsTries.length > 0 && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t("texte.mots_plus_utilises")}</p>
          </div>
          <div className="space-y-2">
            {motsTries.map(([mot, nombre], index) => (
              <div key={mot} className="flex items-center gap-2">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold">
                  {index + 1}
                </div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-20 truncate">{mot}</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${(nombre / motsTries[0][1]) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 w-6 text-right">{nombre}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}