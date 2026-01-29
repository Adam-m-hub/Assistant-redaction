// src/components/UI/ToggleModeNuit.tsx
import { useStoreModele } from '../../stroe/storeModele';
import { Moon, Sun } from 'lucide-react';

export function ToggleModeNuit() {
  const { modeNuit, toggleModeNuit } = useStoreModele();
  return (
    <button
      onClick={toggleModeNuit}
      className="p-2 rounded-lg transition-all duration-300 hover:scale-110
                 bg-gray-200 dark:bg-gray-700 
                 text-gray-800 dark:text-gray-200
                 hover:bg-gray-300 dark:hover:bg-gray-600
                 border border-gray-300 dark:border-gray-600"
      title={modeNuit ? 'Passer en mode clair' : 'Passer en mode sombre'}
      aria-label={modeNuit ? 'Activer le mode clair' : 'Activer le mode sombre'}
    >
      {modeNuit ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}