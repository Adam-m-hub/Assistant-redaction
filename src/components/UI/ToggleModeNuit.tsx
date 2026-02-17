// src/components/UI/ToggleModeNuit.tsx
import { useStoreModele } from '../../stroe/storeModele';

export function ToggleModeNuit() {
  const { modeNuit, toggleModeNuit } = useStoreModele();
  return (
    <button
      onClick={toggleModeNuit}
      className="group relative p-2.5 rounded-xl transition-all duration-300 hover:scale-105
                 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800
                 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-700
                 border border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md"
      title={modeNuit ? 'Passer en mode clair' : 'Passer en mode sombre'}
      aria-label={modeNuit ? 'Activer le mode clair' : 'Activer le mode sombre'}
    >
      {modeNuit ? (
        <svg className="w-5 h-5 text-yellow-500 transition-transform group-hover:rotate-180 duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        <svg className="w-5 h-5 text-indigo-600 transition-transform group-hover:-rotate-12 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  );
}