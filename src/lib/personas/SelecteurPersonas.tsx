// src/components/Personas/SelecteurPersonas.tsx
import { useEffect, useState } from 'react';
import { useStorePersonas } from '../../stroe/storePersonas';
import { ModalCreerPersona } from './ModalCreerPersona';
import { ModalEditerPersona } from './ModalEditerPersona';  
import { useTranslation } from 'react-i18next';

interface SelecteurPersonasProps {
  isInModal?: boolean;
}

export function SelecteurPersonas({ isInModal = false }: SelecteurPersonasProps) {
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

    try {
      await supprimerPersona(personaPourDetails.id);
      setModalDetailsOuvert(false);
      setPersonaPourDetails(null);
    } catch (erreur) {
      alert(`${t("personas.erreur_suppression")}`);
    }
  };

  if (isInModal) {
    // Version pour le modal - Liste verticale
    return (
      <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
       

        <div className="space-y-1  ">
          {/* Prédéfinis */}
          <div className="space-y-1 ">
            <p className="text-sm  text-gray-500 dark:text-gray-400 uppercase tracking-wide px-1">
              {t("labels.predefinis")}
            </p>
            {personas.filter(p => p.estPredefini).map(persona => (
              <button
                key={persona.id}
                onClick={() => selectionnerPersona(persona.id)}
                className={`w-full p-2 rounded-xl border-2 transition-all duration-200 text-left ${
                  personaActif?.id === persona.id
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 shadow-md'
                    : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 bg-white dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-1">
                  <div className="flex-1">
                    <p className={`text-xs font-semibold ${
                      personaActif?.id === persona.id
                        ? 'text-indigo-700 dark:text-indigo-300'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {t(`personas.${persona.id}.nom`)}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                      {t(`personas.${persona.id}.description`)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Personnalisés */}
          {personas.some(p => !p.estPredefini) && (
            <div className="space-y-2  border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide px-2">
                {t("labels.personnalises")}
              </p>
              {personas.filter(p => !p.estPredefini).map(persona => (
                <button
                  key={persona.id}
                  onClick={() => selectionnerPersona(persona.id)}
                  className={`w-full p-1 rounded-xl border-2 transition-all duration-200 text-left ${
                    personaActif?.id === persona.id
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 bg-white dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <div className="flex-1">
                      <p className={`text-xs font-semibold ${
                        personaActif?.id === persona.id
                          ? 'text-indigo-700 dark:text-indigo-300'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {persona.nom}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                        {persona.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modals */}
        <ModalCreerPersona 
          ouvert={modalCreerOuvert}
          onFermer={() => setModalCreerOuvert(false)}
        />

        <ModalEditerPersona 
          ouvert={modalEditerOuvert}
          persona={personaPourDetails}
          onFermer={() => setModalEditerOuvert(false)}
        />
      </div>
    );
  }

  // Version normale - Compacte avec bouton créer et persona actif
  return (
    <div className="space-y-3">
      {/* Bouton Créer Persona */}
      <button
        onClick={() => setModalCreerOuvert(true)}
        className="group w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 hover:from-emerald-100 hover:to-green-100 dark:hover:from-emerald-900/30 dark:hover:to-green-900/30 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
        title={t("buttons.creer_nouveau_persona")}
      >
        <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="16"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
        <span>{t("buttons.creer_nouveau_persona")}</span>
      </button>

      {/* Persona Actif avec bouton détails à côté */}
      {personaActif && (
        <div className="p-2 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-700 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{t("labels.persona_actif")}</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {personaActif.estPredefini 
                  ? t(`personas.${personaActif.id}.nom`)
                  : personaActif.nom
                }
              </p>
            </div>
            <button
              onClick={() => ouvrirDetails(personaActif)}
              className="group flex items-center gap-1.5 px-3 py-2 bg-gray-300 dark:bg-gray-500 hover:bg-gray-700 hover:text-white border border-indigo-200 dark:border-indigo-700 text-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-blue -700 rounded-lg text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md flex-shrink-0"
              title={t("buttons.voir_details")}
            >
              <svg className="w-3 h-3 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ModalCreerPersona 
        ouvert={modalCreerOuvert}
        onFermer={() => setModalCreerOuvert(false)}
      />

      <ModalEditerPersona 
        ouvert={modalEditerOuvert}
        persona={personaPourDetails}
        onFermer={() => setModalEditerOuvert(false)}
      />

      {/* Modal pour les détails */}
      {modalDetailsOuvert && personaPourDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[70vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {personaPourDetails.estPredefini 
                      ? t(`personas.${personaPourDetails.id}.nom`)
                      : personaPourDetails.nom
                    }
                  </h2>
                </div>
                <button
                  onClick={() => setModalDetailsOuvert(false)}
                  className="group p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200"
                >
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenu */}
            <div className="p-6 space-y-5">
              {/* Description */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {t("personas.description")}
                  </h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {personaPourDetails.estPredefini 
                    ? t(`personas.${personaPourDetails.id}.description`)
                    : personaPourDetails.description
                  }
                </p>
              </div>

              {/* Expertises */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {t("personas.expertises")}
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {personaPourDetails.expertise.map((exp: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 text-sm rounded-lg font-medium"
                    >
                      {exp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Exemple de texte */}
              {personaPourDetails.exempleTexte && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {t("personas.exemple_texte")}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl leading-relaxed">
                    {personaPourDetails.exempleTexte}
                  </p>
                </div>
              )}

              {/* Boutons Modifier/Supprimer - SEULEMENT pour personnalisés */}
              {!personaPourDetails.estPredefini && (
                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setModalDetailsOuvert(false);
                      setModalEditerOuvert(true);
                    }}
                    className="group flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    {t("buttons.modifier")}
                  </button>
                  <button
                    onClick={handleSupprimer}
                    className="group flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 hover:from-red-100 hover:to-red-200 dark:hover:from-red-900/30 dark:hover:to-red-800/30 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md border border-red-200 dark:border-red-700"
                  >
                    <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      <line x1="10" y1="11" x2="10" y2="17"/>
                      <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                    {t("buttons.supprimer")}
                  </button>
                </div>
              )}

              {/* Bouton Fermer */}
              <button
                onClick={() => setModalDetailsOuvert(false)}
                className="w-full px-4 py-2.5 bg-gradient-to-br from-gray-600 to-gray-700 dark:from-gray-500 dark:to-gray-600 hover:from-gray-500 hover:to-gray-600 dark:hover:from-gray-400 dark:hover:to-gray-500 text-white rounded-xl text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                {t("buttons.fermer")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}