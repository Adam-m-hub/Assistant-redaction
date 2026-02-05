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
    { code: 'fr', nom: 'FR' },
    { code: 'en', nom: 'EN' }
  ];

  const langueActuelle = langues.find(lang => lang.code === i18n.language) || langues[0];

  return (
    <div className="relative">
      {/* Bouton principal compact */}
      <button
        onClick={() => setMenuOuvert(!menuOuvert)}
        className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors p-1"
        aria-label="Changer la langue"
      >
        <span className="text-lg">🌐</span>
        <span className="text-xs font-medium">{langueActuelle.nom}</span>
        <span className={`text-xs transition-transform ${menuOuvert ? 'rotate-180' : ''}`}></span>
      </button>

      {/* Menu déroulant compact */}
      {menuOuvert && (
        <div className="absolute top-full mt-1 right-0 bg-gray-800 rounded-md shadow-lg overflow-hidden min-w-[80px] z-10 border border-gray-700">
          {langues.map((langue) => (
            <button
              key={langue.code}
              onClick={() => changerLangue(langue.code)}
              className={`w-full text-center px-3 py-2 text-xs font-medium transition-colors ${
                i18n.language === langue.code
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
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