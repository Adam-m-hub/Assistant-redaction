// src/components/Editor/EditorTipTap.tsx
// Composant éditeur de texte riche avec TipTap

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';
import CharacterCount from '@tiptap/extension-character-count';

/**
 * Props du composant EditorTipTap
 */
interface EditorTipTapProps {
  contenu: string;
  onChange: (texte: string) => void;
  placeholder?: string;
  desactive?: boolean;
  className?: string;
}

/**
 * Composant TipTap - Éditeur de texte riche
 */
export default function EditorTipTap({
  contenu,
  onChange,
  placeholder = 'Commencez à écrire...',
  desactive = false,
  className = ''
}: EditorTipTapProps) {

  // Initialiser l'éditeur TipTap
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      CharacterCount,
    ],
    content: contenu,
    editable: !desactive,
    editorProps: {
      attributes: {
        // ✅ MODIFIÉ : Retiré min-h-[400px] pour éviter débordement
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none px-6 py-4',
      },
    },
    onUpdate: ({ editor }) => {
      const texte = editor.getText();
      onChange(texte);
    },
  });

  useEffect(() => {
    if (editor && contenu !== editor.getText()) {
      editor.commands.setContent(contenu);
    }
  }, [contenu, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(!desactive);
    }
  }, [desactive, editor]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    // ✅ MODIFIÉ : Hauteur fixe + flex column
    <div className={`flex flex-col h-[675px] bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 ${className}`}>
      
      {/* Barre d'outils - FIXE en haut */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900 flex items-center gap-1 flex-wrap">
        
        {/* Bouton Gras */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={desactive}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            editor.isActive('bold') ? 'bg-gray-300 dark:bg-gray-600' : ''
          }`}
          title="Gras (Ctrl+B)"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 4v12h4.5c1.9 0 3.5-1.6 3.5-3.5 0-1.3-.7-2.4-1.8-3 .6-.5 1-1.3 1-2.2C13.2 5.6 11.9 4 10.2 4H6zm2 5V6h2.2c.8 0 1.5.7 1.5 1.5S11 9 10.2 9H8zm0 2h2.5c1 0 1.8.8 1.8 1.8s-.8 1.7-1.8 1.7H8v-3.5z"/>
          </svg>
        </button>

        {/* Bouton Italique */}
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={desactive}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            editor.isActive('italic') ? 'bg-gray-300 dark:bg-gray-600' : ''
          }`}
          title="Italique (Ctrl+I)"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z"/>
          </svg>
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>

        {/* Bouton H1 */}
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          disabled={desactive}
          className={`px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
            editor.isActive('heading', { level: 1 }) ? 'bg-gray-300 dark:bg-gray-600' : ''
          }`}
          title="Titre 1"
        >
          H1
        </button>

        {/* Bouton H2 */}
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          disabled={desactive}
          className={`px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
            editor.isActive('heading', { level: 2 }) ? 'bg-gray-300 dark:bg-gray-600' : ''
          }`}
          title="Titre 2"
        >
          H2
        </button>

        {/* Bouton H3 */}
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          disabled={desactive}
          className={`px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
            editor.isActive('heading', { level: 3 }) ? 'bg-gray-300 dark:bg-gray-600' : ''
          }`}
          title="Titre 3"
        >
          H3
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>

        {/* Bouton Liste à puces */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={desactive}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            editor.isActive('bulletList') ? 'bg-gray-300 dark:bg-gray-600' : ''
          }`}
          title="Liste à puces"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
          </svg>
        </button>

        {/* Bouton Liste numérotée */}
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={desactive}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            editor.isActive('orderedList') ? 'bg-gray-300 dark:bg-gray-600' : ''
          }`}
          title="Liste numérotée"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
          </svg>
        </button>

        {/* Bouton Citation */}
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          disabled={desactive}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            editor.isActive('blockquote') ? 'bg-gray-300 dark:bg-gray-600' : ''
          }`}
          title="Citation"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
          </svg>
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>

        {/* Bouton Annuler */}
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo() || desactive}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Annuler (Ctrl+Z)"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd"/>
          </svg>
        </button>

        {/* Bouton Rétablir */}
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo() || desactive}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Rétablir (Ctrl+Shift+Z)"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10.293 14.707a1 1 0 001.414 0l4-4a1 1 0 000-1.414l-4-4a1 1 0 00-1.414 1.414L12.586 9H5a1 1 0 100 2h7.586l-2.293 2.293a1 1 0 000 1.414z" clipRule="evenodd"/>
          </svg>
        </button>
      </div>

      {/* ✅ Zone d'édition - AVEC SCROLL INTERNE */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
        <EditorContent editor={editor} />
      </div>

      {/* Compteur - FIXE en bas */}
      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            📝 {editor.storage.characterCount?.words() || 0} mots
            <span className="mx-2">•</span>
            {editor.getText().length} caractères
          </span>
          <span className="text-gray-400">
            {desactive ? '🔒 Lecture seule' : '✏️ Édition'}
          </span>
        </div>
      </div>
    </div>
  );
}