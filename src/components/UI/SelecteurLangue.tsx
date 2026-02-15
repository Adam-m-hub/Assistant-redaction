import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { File, Folder, History, Save, Upload, Languages } from 'lucide-react';

export default function SelecteurLangue() {
  const { i18n } = useTranslation();
  const [menuOuvert, setMenuOuvert] = useState(false);

  const changerLangue = (langue: string) => {
    i18n.changeLanguage(langue);
    localStorage.setItem('langue', langue);
    setMenuOuvert(false);
  };

  const langues = [
    { code: 'fr', nom: 'FR' },
    { code: 'en', nom: 'EN' },
    { code: 'ar', nom: 'AR' } // ← SEULEMENT CETTE LIGNE AJOUTÉE
  ];

  const langueActuelle = langues.find(lang => lang.code === i18n.language) || langues[0];

  return (
    <div className="relative">
      {/* Bouton principal compact */}
      <button
        onClick={() => setMenuOuvert(!menuOuvert)}
        className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors p-1"
        aria-label="Changer la langue"
        title='changer langue'
      >
        <Languages className="h-5 w-5" />
        <span className="text-xs font-medium text-gray-800 dark:text-white">{langueActuelle.nom}</span>
        <span className={`text-xs transition-transform ${menuOuvert ? 'rotate-180' : ''}`}></span>
      </button>

      {/* Menu déroulant compact */}
      {menuOuvert && (
        <div className="absolute bg-gray-200 mt-1 right-0 rounded-md shadow-lg overflow-hidden min-w-[80px] z-10 border dark:bg-gray-700">
          {langues.map((langue) => (
            <button
              key={langue.code}
              onClick={() => changerLangue(langue.code)}
              className={`w-full text-center px-3 py-2 text-xs font-medium transition-colors ${
                i18n.language === langue.code
                  ? 'bg-gray-700 text-white cursor-default dark:bg-blue-500 dark:text-white'
                  : 'text-gray-800 hover:text-white dark:hover:bg-gray-600'
              }`}
            >
              {langue.nom}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}