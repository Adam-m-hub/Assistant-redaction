// src/components/Personas/SelecteurPersonas.tsx
import { useEffect, useState } from 'react';
import { useStorePersonas } from '../../stroe/storePersonas';
import { Plus, Info } from 'lucide-react';
import { ModalCreerPersona } from './ModalCreerPersona';
//import { ModalDetailsPersona } from './ModalDetailsPersona';
import { ModalEditerPersona } from './ModalEditerPersona';  
import { useTranslation } from 'react-i18next';

export function SelecteurPersonas() {
  const {
    personas,
    personaActif,
    chargerPersonas,
    selectionnerPersona,
    supprimerPersona,  
  } = useStorePersonas();
  const { t } = useTranslation();
  const [modalDetailsOuvert, setModalDetailsOuvert] = useState(false);
  const [modalCreerOuvert, setModalCreerOuvert] = useState(false);
  const [personaPourDetails, setPersonaPourDetails] = useState<any>(null);
  const [modalEditerOuvert, setModalEditerOuvert] = useState(false);  

  // Charger les personas au montage
  useEffect(() => {
    chargerPersonas();
  }, [chargerPersonas]);

  const ouvrirDetails = (persona: any) => {
    setPersonaPourDetails(persona);
    setModalDetailsOuvert(true);
  };

   // Supprimer un persona personnalisé
  const handleSupprimer = async () => {
    if (!personaPourDetails) return;
    
    if (!confirm(`${t("personas.confirmation_suppression")} ${personaPourDetails.nom.toUpperCase()} ?`)) return;
   // if (!confirm(t("personas.suppression_avec_nom", { nom: personaPourDetails.nom }))) return;

    try {
      await supprimerPersona(personaPourDetails.id);
      setModalDetailsOuvert(false);
      setPersonaPourDetails(null);
    } catch (erreur) {
      alert(`${t("personas.erreur_suppression")}`);
    }
  };
 

  return (
    <div className="space-y-1">

      {/* Sélecteur */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
          {t("labels.choisir_un_persona")}
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
          <optgroup label={t("labels.predefinis")}>
            {personas.filter(p => p.estPredefini).map(persona => (
              <option key={persona.id} value={persona.id}>
                  {persona.estPredefini 
              ? t(`personas.${persona.id}.nom`)  // Traduction pour prédéfinis
              : persona.nom                      // Nom tel quel pour custom
            }
              </option>
            ))}
          </optgroup>

          {/* Personnalisés */}
          {personas.some(p => !p.estPredefini) && (
            <optgroup label={t("labels.personnalises")}>
              {personas.filter(p => !p.estPredefini).map(persona => (
                <option key={persona.id} value={persona.id}>
                    {persona.estPredefini 
              ? t(`personas.${persona.id}.nom`)  // Traduction pour prédéfinis
              : persona.nom                      // Nom tel quel pour custom
            }
                </option>
              ))}
            </optgroup>
          )}
        </select>

        {/* Persona sélectionné - juste le nom en bas du select */}
        {personaActif && (
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-900 dark:text-gray-100">
              {personaActif.estPredefini 
              ? t(`personas.${personaActif.id}.nom`)  // Traduction pour prédéfinis
              : personaActif.nom                      // Nom tel quel pour custom
            }
            </span>
            <button
              onClick={() => ouvrirDetails(personaActif)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <Info className="w-3 h-3" />
              {t("buttons.details_persona")}
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
        title={t("buttons.creer_nouveau_persona")}
      >
        <Plus className="w-4 h-4" />
        <span>{t("buttons.creer_nouveau_persona")}</span>
      </button>

      {/* Modals */}
      <ModalCreerPersona 
        ouvert={modalCreerOuvert}
        onFermer={() => setModalCreerOuvert(false)}
      />

        {/*  Modal d'édition */}
        <ModalEditerPersona 
          ouvert={modalEditerOuvert}
          persona={personaPourDetails}
          onFermer={() => setModalEditerOuvert(false)}
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
                    {t("personas.description")}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {personaPourDetails.description}
                  </p>
                </div>

                {/* Expertises */}
                <div className="space-y-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {t("personas.expertises")}
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
                      {t("personas.exemple_texte")}
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic p-3 
                                border border-gray-200 dark:border-gray-700 rounded">
                      {personaPourDetails.exempleTexte}
                    </p>
                  </div>
                )}

                {/* Boutons Modifier/Supprimer - SEULEMENT pour personnalisés */}
                {!personaPourDetails.estPredefini && (
                  <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        setModalDetailsOuvert(false);
                        setModalEditerOuvert(true);
                      }}
                      className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 
                                text-gray-700 dark:text-gray-300 
                                hover:bg-gray-200 dark:hover:bg-gray-600 
                                rounded-lg text-sm font-medium transition-colors"
                    >
                      ✏️ {t("buttons.modifier")}
                    </button>
                    <button
                      onClick={handleSupprimer}
                      className="flex-1 px-4 py-2 bg-red-50 dark:bg-red-900/20 
                                text-red-600 dark:text-red-400 
                                hover:bg-red-100 dark:hover:bg-red-900/30 
                                rounded-lg text-sm font-medium transition-colors"
                    >
                      🗑️ {t("buttons.supprimer")}
                    </button>
                  </div>
                )}

                {/* Bouton Fermer */}
                <button
                  onClick={() => setModalDetailsOuvert(false)}
                  className="w-full mt-2 px-4 py-2.5 
                            border border-gray-300 dark:border-gray-600 
                            text-gray-700 dark:text-gray-300 
                            hover:bg-gray-50 dark:hover:bg-gray-700 
                            rounded-lg text-sm font-medium transition-colors"
                >
                  {t("buttons.fermer")}
                </button>
              </div>
          </div>
        </div>
      )}
    </div>
  );
}