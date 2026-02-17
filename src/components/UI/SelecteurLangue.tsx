// src/components/UI/SelecteurLangue.tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function SelecteurLangue() {
  const { i18n } = useTranslation();
  const [menuOuvert, setMenuOuvert] = useState(false);

  const changerLangue = (langue: string) => {
    i18n.changeLanguage(langue);
    localStorage.setItem('langue', langue);
    setMenuOuvert(false);
  };

  const langues = [
    { code: 'fr', nom: 'Français', court: 'FR' },
    { code: 'en', nom: 'English', court: 'EN' },
    { code: 'ar', nom: 'العربية', court: 'AR' }
  ];

  const langueActuelle = langues.find(lang => lang.code === i18n.language) || langues[0];

  return (
    <div className="relative">
      {/* Bouton principal */}
      <button
        onClick={() => setMenuOuvert(!menuOuvert)}
        className="group flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200
                   bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800
                   hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-700
                   border border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md"
        aria-label="Changer la langue"
        title="Changer la langue"
      >
        <svg className="w-3 h-3 text-gray-700 dark:text-gray-300 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
        <span className="text-sm font-semibold text-gray-800 dark:text-white">{langueActuelle.court}</span>
        <svg className={`w-2 h-2 text-gray-600 dark:text-gray-400 transition-transform duration-200 ${menuOuvert ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* Menu déroulant */}
      {menuOuvert && (
        <>
          {/* Overlay pour fermer */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setMenuOuvert(false)}
          />
          
          <div className="absolute mt-2 right-0 rounded-xl shadow-xl overflow-hidden min-w-[100px] z-20 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 animate-in slide-in-from-top-2 duration-200">
            {langues.map((langue) => (
              <button
                key={langue.code}
                onClick={() => changerLangue(langue.code)}
                className={`w-full flex items-center gap-1 px-2 py-1 text-xs font-medium transition-all duration-200 ${
                  i18n.language === langue.code
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
               
                <span className="flex-1 text-left">{langue.nom}</span>
                {i18n.language === langue.code && (
                  <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}