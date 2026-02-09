// src/components/Personas/ModalEditerPersona.tsx
import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
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
    exempleTexte: '',
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
        exempleTexte: persona.exempleTexte || '',
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            ✏️ {t('personas.modifier_le_persona')}
          </h2>
          <button
            onClick={onFermer}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('personas.nom_du_persona')}
            </label>
            <input
              type="text"
              value={formulaire.nom}
              onChange={(e) => setFormulaire({ ...formulaire, nom: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('personas.description')}
            </label>
            <textarea
              value={formulaire.description}
              onChange={(e) => setFormulaire({ ...formulaire, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
            />
          </div>

          {/* Expertises */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('personas.expertises')}
            </label>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={expertiseInput}
                onChange={(e) => setExpertiseInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), ajouterExpertise())}
                placeholder={t('personas.exemples_de_expertise')}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              <button
                type="button"
                onClick={ajouterExpertise}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
                           flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </div>

            {formulaire.expertise.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formulaire.expertise.map((exp, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 
                               bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 
                               rounded-full text-sm"
                  >
                    {exp}
                    <button
                      type="button"
                      onClick={() => supprimerExpertise(index)}
                      className="hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Exemple de texte */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('personas.exemple_de_texte')}
            </label>
            <textarea
              value={formulaire.exempleTexte}
              onChange={(e) => setFormulaire({ ...formulaire, exempleTexte: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
            />
          </div>

          {/* Température */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                         [&::-webkit-slider-thumb]:w-4
                         [&::-webkit-slider-thumb]:h-4
                         [&::-webkit-slider-thumb]:bg-blue-600
                         [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Conservateur (0.1)</span>
              <span>Créatif (1.0)</span>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onFermer}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600
                         text-gray-700 dark:text-gray-300 rounded-lg
                         hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t('buttons.annuler')}
            </button>
            <button
              type="submit"
              disabled={enCours}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600
                         hover:from-blue-700 hover:to-purple-700
                         text-white rounded-lg font-medium
                         disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {enCours ? t('buttons.modification_en_cours') : t('buttons.enregistrer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}