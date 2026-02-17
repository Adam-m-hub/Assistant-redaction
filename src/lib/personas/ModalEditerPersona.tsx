// src/components/Personas/ModalEditerPersona.tsx
import { useState, useEffect } from 'react';
import { useStorePersonas } from '../../stroe/storePersonas';
import type { Persona } from '../../types/personas';
import { useTranslation } from 'react-i18next';

interface ModalEditerPersonaProps {
  ouvert: boolean;
  persona: Persona | null;
  onFermer: () => void;
}

export function ModalEditerPersona({ ouvert, persona, onFermer }: ModalEditerPersonaProps) {
  const { modifierPersona } = useStorePersonas();
  const { t } = useTranslation();

  //  État du formulaire 
  const [formulaire, setFormulaire] = useState({
    nom: '',
    description: '',
    expertise: [] as string[],
    temperature: 0.7,
  });

  const [expertiseInput, setExpertiseInput] = useState('');
  const [enCours, setEnCours] = useState(false);

  // Charger les données du persona
  useEffect(() => {
    if (persona) {
      setFormulaire({
        nom: persona.nom,
        description: persona.description,
        expertise: [...persona.expertise],
        temperature: persona.temperature,
      });
    }
  }, [persona]);

  // Ajouter une expertise
  const ajouterExpertise = () => {
    const expertise = expertiseInput.trim();
    
    if (expertise && !formulaire.expertise.includes(expertise)) {
      setFormulaire({
        ...formulaire,
        expertise: [...formulaire.expertise, expertise],
      });
      setExpertiseInput('');
    }
  };

  // Supprimer une expertise
  const supprimerExpertise = (index: number) => {
    setFormulaire({
      ...formulaire,
      expertise: formulaire.expertise.filter((_, i) => i !== index),
    });
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!persona) return;

    setEnCours(true);

    try {
      await modifierPersona(persona.id, formulaire);
      
      onFermer();
      alert('✅ Persona modifié avec succès !');
      
    } catch (erreur) {
      console.error('❌ Erreur modification persona:', erreur);
      alert('❌ Erreur lors de la modification du persona');
    } finally {
      setEnCours(false);
    }
  };

  if (!ouvert || !persona) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('personas.modifier_le_persona')}
            </h2>
          </div>
          <button
            onClick={onFermer}
            className="group p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200"
            aria-label="Fermer"
          >
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nom */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              {t('personas.nom_du_persona')}
            </label>
            <input
              type="text"
              value={formulaire.nom}
              onChange={(e) => setFormulaire({ ...formulaire, nom: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                         transition-all duration-200"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              {t('personas.description')}
            </label>
            <textarea
              value={formulaire.description}
              onChange={(e) => setFormulaire({ ...formulaire, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                         transition-all duration-200 resize-none"
            />
          </div>

          {/* Expertises */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              {t('personas.expertises')}
            </label>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={expertiseInput}
                onChange={(e) => setExpertiseInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), ajouterExpertise())}
                placeholder={t('personas.exemples_de_expertise')}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                           transition-all duration-200"
              />
              <button
                type="button"
                onClick={ajouterExpertise}
                className="group px-4 py-2.5 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white rounded-xl flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                {t('buttons.ajouter')}
              </button>
            </div>

            {formulaire.expertise.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formulaire.expertise.map((exp, index) => (
                  <span
                    key={index}
                    className="group inline-flex items-center gap-2 px-3 py-1.5 
                               bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20
                               text-green-700 dark:text-green-300
                               border border-green-200 dark:border-green-700
                               rounded-lg text-sm font-medium"
                  >
                    {exp}
                    <button
                      type="button"
                      onClick={() => supprimerExpertise(index)}
                      className="hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Température */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
              </svg>
              {t('personas.creativite_temperature', { temperature: formulaire.temperature })}
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={formulaire.temperature}
              onChange={(e) => setFormulaire({ ...formulaire, temperature: parseFloat(e.target.value) })}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none
                         [&::-webkit-slider-thumb]:w-5
                         [&::-webkit-slider-thumb]:h-5
                         [&::-webkit-slider-thumb]:bg-gradient-to-br
                         [&::-webkit-slider-thumb]:from-purple-500
                         [&::-webkit-slider-thumb]:to-pink-600
                         [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:cursor-pointer
                         [&::-webkit-slider-thumb]:shadow-md
                         [&::-webkit-slider-thumb]:hover:shadow-lg
                         [&::-webkit-slider-thumb]:transition-all"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Conservateur (0.1)
              </span>
              <span className="flex items-center gap-1">
                Créatif (1.0)
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </span>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onFermer}
              className="flex-1 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600
                         text-gray-700 dark:text-gray-300 rounded-xl font-medium
                         hover:bg-gray-50 dark:hover:bg-gray-700
                         transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {t('buttons.annuler')}
            </button>
            <button
              type="submit"
              disabled={enCours}
              className="group flex-1 px-4 py-2.5 bg-gradient-to-br from-purple-600 to-pink-600
                         hover:from-purple-500 hover:to-pink-500
                         text-white rounded-xl font-medium
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200 shadow-md hover:shadow-lg
                         flex items-center justify-center gap-2"
            >
              {enCours ? (
                <>
                  <div className="relative w-4 h-4">
                    <div className="absolute inset-0 border-2 border-purple-200 rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  {t('buttons.modification_en_cours')}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                  {t('buttons.enregistrer')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}