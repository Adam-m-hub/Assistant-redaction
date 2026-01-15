// src/App.tsx
import { useState } from 'react';

function App() {
  const [modelStatus, setModelStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');

  return (
    
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Assistant de Rédaction IA</h1>
                <p className="text-sm text-gray-500">Propulsé par WebLLM - 100% Local</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Status du modèle */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100">
                <div className={`w-2 h-2 rounded-full ${
                  modelStatus === 'loaded' ? 'bg-green-500' :
                  modelStatus === 'loading' ? 'bg-yellow-500 animate-pulse' :
                  modelStatus === 'error' ? 'bg-red-500' :
                  'bg-gray-400'
                }`} />
                <span className="text-sm font-medium text-gray-700">
                  {modelStatus === 'loaded' ? 'Modèle prêt' :
                   modelStatus === 'loading' ? 'Chargement...' :
                   modelStatus === 'error' ? 'Erreur' :
                   'Hors ligne'}
                </span>
              </div>
              
              {/* Boutons d'action */}
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Nouveau document
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Zone principale - 3 colonnes */}
      <main className="max-w-full mx-auto p-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)]">
          
          {/* Panneau gauche - Paramètres et contrôles */}
          <div className="col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 p-6 overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Paramètres</h2>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Panneau de contrôle à venir...</p>
            </div>
          </div>

          {/* Zone centrale - Éditeur de texte */}
          <div className="col-span-6 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
            {/* Barre d'outils de l'éditeur */}
            <div className="border-b border-gray-200 p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-200 rounded transition-colors" title="Gras">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6 4v12h4.5c1.9 0 3.5-1.6 3.5-3.5 0-1.3-.7-2.4-1.8-3 .6-.5 1-1.3 1-2.2C13.2 5.6 11.9 4 10.2 4H6zm2 5V6h2.2c.8 0 1.5.7 1.5 1.5S11 9 10.2 9H8zm0 2h2.5c1 0 1.8.8 1.8 1.8s-.8 1.7-1.8 1.7H8v-3.5z"/>
                    </svg>
                  </button>
                  <button className="p-2 hover:bg-gray-200 rounded transition-colors" title="Italique">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z"/>
                    </svg>
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  <span>0 mots</span>
                  <span className="mx-2">•</span>
                  <span>0 caractères</span>
                </div>
              </div>
            </div>

            {/* Zone d'édition */}
            <div className="flex-1 p-6 overflow-y-auto">
              <textarea
                className="w-full h-full resize-none focus:outline-none text-gray-900 text-base leading-relaxed"
                placeholder="Commencez à écrire ou demandez à l'IA de vous aider..."
              />
            </div>

            {/* Boutons d'action rapide */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex items-center gap-2 flex-wrap">
                <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium">
                  ✨ Améliorer
                </button>
                <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium">
                  ✓ Corriger
                </button>
                <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium">
                  📏 Raccourcir
                </button>
                <button className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium">
                  📝 Allonger
                </button>
              </div>
            </div>
          </div>

          {/* Panneau droit - Résultats et suggestions */}
          <div className="col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 p-6 overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Suggestions</h2>
            <div className="space-y-4">
              <div className="text-sm text-gray-500 text-center py-8">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <p>Les suggestions apparaîtront ici</p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;