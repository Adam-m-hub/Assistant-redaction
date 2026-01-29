// src/components/Personas/SelecteurPersonas.tsx
import { useEffect, useState } from 'react';
import { useStorePersonas } from '../../stroe/storePersonas';
import { Plus, Info } from 'lucide-react';
import { ModalCreerPersona } from './ModalCreerPersona';
//import { ModalDetailsPersona } from './ModalDetailsPersona';

export function SelecteurPersonas() {
  const {
    personas,
    personaActif,
    chargerPersonas,
    selectionnerPersona,
  } = useStorePersonas();

  const [modalDetailsOuvert, setModalDetailsOuvert] = useState(false);
  const [modalCreerOuvert, setModalCreerOuvert] = useState(false);
  const [personaPourDetails, setPersonaPourDetails] = useState<any>(null);

  // Charger les personas au montage
  useEffect(() => {
    chargerPersonas();
  }, [chargerPersonas]);

  const ouvrirDetails = (persona: any) => {
    setPersonaPourDetails(persona);
    setModalDetailsOuvert(true);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Personas
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Sélectionnez un persona pour guider la génération
        </p>
      </div>

      {/* Sélecteur */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
          Sélectionner un Persona
        </label>
        <select
          value={personaActif?.id || ''}
          onChange={(e) => {
            const personaId = e.target.value;
            const persona = personas.find(p => p.id === personaId);
            selectionnerPersona(personaId);
            if (persona) {
              setPersonaPourDetails(persona);
            }
          }}
          className="w-full px-2 py-0.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                     focus:border-blue-500 focus:outline-none 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                     cursor-pointer transition-colors"
        >
          {/* Prédéfinis */}
          <optgroup label="Prédéfinis">
            {personas.filter(p => p.estPredefini).map(persona => (
              <option key={persona.id} value={persona.id}>
                {persona.nom}
              </option>
            ))}
          </optgroup>

          {/* Personnalisés */}
          {personas.some(p => !p.estPredefini) && (
            <optgroup label="Personnalisés">
              {personas.filter(p => !p.estPredefini).map(persona => (
                <option key={persona.id} value={persona.id}>
                  {persona.nom}
                </option>
              ))}
            </optgroup>
          )}
        </select>

        {/* Persona sélectionné - juste le nom en bas du select */}
        {personaActif && (
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-900 dark:text-gray-100">
              {personaActif.nom}
            </span>
            <button
              onClick={() => ouvrirDetails(personaActif)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <Info className="w-3 h-3" />
              Détails
            </button>
          </div>
        )}
      </div>

      {/* Bouton + pour créer persona */}
      <button
        onClick={() => setModalCreerOuvert(true)}
        className="w-full flex items-center justify-center gap-1 px-2 py-1
                   border border-gray-300 dark:border-gray-600 
                   hover:border-blue-500 dark:hover:border-blue-500
                   text-gray-600 dark:text-gray-400 
                   hover:text-blue-600 dark:hover:text-blue-400
                   rounded-lg text-sm transition-all hover:shadow-sm"
        title="Créer un nouveau persona"
      >
        <Plus className="w-4 h-4" />
        <span>Créer un Persona</span>
      </button>

      {/* Modals */}
      <ModalCreerPersona 
        ouvert={modalCreerOuvert}
        onFermer={() => setModalCreerOuvert(false)}
      />

      {/* Modal pour les détails */}
      {modalDetailsOuvert && personaPourDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full max-h-[70vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {personaPourDetails.nom}
                </h2>
                <button
                  onClick={() => setModalDetailsOuvert(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <span className="text-gray-500 dark:text-gray-400">✕</span>
                </button>
              </div>
            </div>

            {/* Contenu */}
            <div className="p-6 space-y-5">
              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Description
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {personaPourDetails.description}
                </p>
              </div>

              {/* Style et Ton */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Style
                  </span>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {personaPourDetails.style}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Ton
                  </span>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {personaPourDetails.ton}
                  </p>
                </div>
              </div>

              {/* Expertises */}
              <div className="space-y-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Expertises
                </span>
                <div className="flex flex-wrap gap-2">
                  {personaPourDetails.expertise.map((exp: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 
                                 text-gray-700 dark:text-gray-300 text-sm rounded"
                    >
                      {exp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Exemple de texte */}
              {personaPourDetails.exempleTexte && (
                <div className="space-y-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Exemple
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic p-3 
                               border border-gray-200 dark:border-gray-700 rounded">
                    {personaPourDetails.exempleTexte}
                  </p>
                </div>
              )}

              {/* Bouton de fermeture */}
              <button
                onClick={() => setModalDetailsOuvert(false)}
                className="w-full mt-4 px-4 py-2.5 
                           border border-gray-300 dark:border-gray-600 
                           text-gray-700 dark:text-gray-300 
                           hover:bg-gray-50 dark:hover:bg-gray-700 
                           rounded-lg text-sm font-medium transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}