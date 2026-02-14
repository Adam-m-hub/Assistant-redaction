// src/components/Editor/EditorTipTap.tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState } from 'react';
import CharacterCount from '@tiptap/extension-character-count';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import {TextStyle} from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { useTranslation } from 'react-i18next';
import OrderedList from '@tiptap/extension-ordered-list';
import BulletList from '@tiptap/extension-bullet-list';
import ListItem from '@tiptap/extension-list-item';

// ✅ Extension personnalisée pour OrderedList avec VRAIE continuité de numérotation
const CustomOrderedList = OrderedList.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      listStyleType: {
        default: 'decimal',
        parseHTML: element => element.style.listStyleType || 'decimal',
        renderHTML: attributes => {
          if (!attributes.listStyleType) {
            return {};
          }
          return {
            style: `list-style-type: ${attributes.listStyleType}`
          };
        },
      },
      // ✅ Ajouter l'attribut start pour la numérotation
      start: {
        default: 1,
        parseHTML: element => {
          return element.hasAttribute('start')
            ? parseInt(element.getAttribute('start') || '1', 10)
            : 1;
        },
        renderHTML: attributes => {
          if (attributes.start === 1) {
            return {};
          }
          return {
            start: attributes.start,
          };
        },
      },
    };
  },
  
  // ✅ Préserver les attributs lors du split
  addKeyboardShortcuts() {
    return {
      Enter: () => {
        const { state } = this.editor;
        const { $from } = state.selection;
        const listAttributes = $from.node(-1)?.attrs;
        
        // Si on est dans une liste ordonnée, préserver les attributs
        if (this.editor.isActive('orderedList') && listAttributes) {
          return this.editor
            .chain()
            .splitListItem('listItem')
            .run();
        }
        return false;
      },
    };
  },
});

// ✅ Extension personnalisée pour BulletList
const CustomBulletList = BulletList.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      listStyleType: {
        default: 'disc',
        parseHTML: element => element.style.listStyleType || 'disc',
        renderHTML: attributes => {
          if (!attributes.listStyleType) {
            return {};
          }
          return {
            style: `list-style-type: ${attributes.listStyleType}`
          };
        },
      },
    };
  },
  
  // ✅ Préserver les attributs lors du split
  addKeyboardShortcuts() {
    return {
      Enter: () => {
        const { state } = this.editor;
        const { $from } = state.selection;
        const listAttributes = $from.node(-1)?.attrs;
        
        // Si on est dans une liste à puces, préserver les attributs
        if (this.editor.isActive('bulletList') && listAttributes) {
          return this.editor
            .chain()
            .splitListItem('listItem')
            .run();
        }
        return false;
      },
    };
  },
});

interface EditorTipTapProps {
  contenu: string;
  onChange: (texte: string) => void;
  placeholder?: string;
  desactive?: boolean;
  className?: string;
  onEditorReady?: (editor: any) => void;
}

export default function EditorTipTap({
  contenu,
  onChange,
  placeholder = 'Commencez à écrire...',
  desactive = false,
  className = ''
}: EditorTipTapProps) {
  const { t } = useTranslation();
  const [showBulletOptions, setShowBulletOptions] = useState(false);
  const [showNumberOptions, setShowNumberOptions] = useState(false);
  const [showAlphaOptions, setShowAlphaOptions] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        orderedList: false,
        bulletList: false,
        listItem: false,
      }),
      CustomOrderedList,
      CustomBulletList,
      ListItem,
      CharacterCount,
      Underline,
      TextStyle,
      FontFamily,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: contenu,
    editable: !desactive,
    editorProps: {
      attributes: {
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

  // ✅ Fonction corrigée pour créer des listes indépendantes
  const changeListStyle = (type: 'decimal' | 'upper-roman' | 'lower-roman' | 'upper-alpha' | 'lower-alpha' | 'disc' | 'circle' | 'square') => {
    if (!editor) return;
    
    const isOrdered = ['decimal', 'upper-roman', 'lower-roman', 'upper-alpha', 'lower-alpha'].includes(type);
    const isInBulletList = editor.isActive('bulletList');
    const isInOrderedList = editor.isActive('orderedList');
    
    // Obtenir le style actuel
    let currentStyle = null;
    if (isInOrderedList) {
      currentStyle = editor.getAttributes('orderedList').listStyleType;
    } else if (isInBulletList) {
      currentStyle = editor.getAttributes('bulletList').listStyleType;
    }
    
    // Si même style, toggle
    if (currentStyle === type) {
      if (isOrdered) {
        editor.chain().focus().toggleOrderedList().run();
      } else {
        editor.chain().focus().toggleBulletList().run();
      }
      setShowBulletOptions(false);
      setShowNumberOptions(false);
      setShowAlphaOptions(false);
      return;
    }
    
    // Si on est dans une liste et qu'on change de style
    if (isInBulletList || isInOrderedList) {
      // Vérifier si on peut couper la liste
      if (editor.can().splitListItem('listItem')) {
        editor.chain().focus().splitListItem('listItem').run();
      }
      
      // Sortir de la liste
      if (editor.can().liftListItem('listItem')) {
        editor.chain().focus().liftListItem('listItem').run();
      }
      
      // Créer une nouvelle liste
      if (isOrdered) {
        editor
          .chain()
          .focus()
          .toggleOrderedList()
          .updateAttributes('orderedList', { listStyleType: type, start: 1 })
          .run();
      } else {
        editor
          .chain()
          .focus()
          .toggleBulletList()
          .updateAttributes('bulletList', { listStyleType: type })
          .run();
      }
    } 
    // Si on n'est pas dans une liste
    else {
      if (isOrdered) {
        editor
          .chain()
          .focus()
          .toggleOrderedList()
          .updateAttributes('orderedList', { listStyleType: type, start: 1 })
          .run();
      } else {
        editor
          .chain()
          .focus()
          .toggleBulletList()
          .updateAttributes('bulletList', { listStyleType: type })
          .run();
      }
    }
    
    setShowBulletOptions(false);
    setShowNumberOptions(false);
    setShowAlphaOptions(false);
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 border-2 border-blue-200 dark:border-blue-800 rounded-full"></div>
          <div className="absolute inset-0 border-2 border-blue-600 dark:border-blue-400 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-[465px] bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 ${className}`}>
      
      {/* Barre d'outils */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 p-3 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        
        <div className="flex items-center gap-1 flex-wrap">
          {/* Police */}
          <select
            onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
            disabled={desactive}
            className="px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
            title={t('title.police')}
          >
            <option value="">{t('title.police_par_defaut')}</option>
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Georgia">Georgia</option>
            <option value="Verdana">Verdana</option>
            <option value="Comic Sans MS">Comic Sans MS</option>
          </select>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

          {/* Gras */}
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={desactive}
            className={`group p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              editor.isActive('bold') ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
            }`}
            title="Gras (Ctrl+B)"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 4v12h4.5c1.9 0 3.5-1.6 3.5-3.5 0-1.3-.7-2.4-1.8-3 .6-.5 1-1.3 1-2.2C13.2 5.6 11.9 4 10.2 4H6zm2 5V6h2.2c.8 0 1.5.7 1.5 1.5S11 9 10.2 9H8zm0 2h2.5c1 0 1.8.8 1.8 1.8s-.8 1.7-1.8 1.7H8v-3.5z"/>
            </svg>
          </button>

          {/* Italique */}
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={desactive}
            className={`group p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              editor.isActive('italic') ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
            }`}
            title="Italique (Ctrl+I)"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z"/>
            </svg>
          </button>

          {/* Souligné */}
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            disabled={desactive}
            className={`group p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              editor.isActive('underline') ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
            }`}
            title="Souligné (Ctrl+U)"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/>
              <line x1="4" y1="21" x2="20" y2="21"/>
            </svg>
          </button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

          {/* Alignements */}
          <button onClick={() => editor.chain().focus().setTextAlign('left').run()} disabled={desactive} className={`group p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`} title="Aligner à gauche">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
          </button>

          <button onClick={() => editor.chain().focus().setTextAlign('center').run()} disabled={desactive} className={`group p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`} title="Centrer">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/></svg>
          </button>

          <button onClick={() => editor.chain().focus().setTextAlign('right').run()} disabled={desactive} className={`group p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`} title="Aligner à droite">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/></svg>
          </button>

          <button onClick={() => editor.chain().focus().setTextAlign('justify').run()} disabled={desactive} className={`group p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${editor.isActive({ textAlign: 'justify' }) ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`} title="Justifier">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg>
          </button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

          {/* LISTES - Le reste du code reste identique... */}
          {/* Je garde la même structure pour les boutons de listes */}
          
          {/* Liste à puces */}
          <div className="relative">
            <button onClick={() => { setShowBulletOptions(!showBulletOptions); setShowNumberOptions(false); setShowAlphaOptions(false); }} disabled={desactive} className={`group flex items-center gap-1 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${editor.isActive('bulletList') ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`} title="Liste à puces">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {showBulletOptions && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
                <button onClick={() => changeListStyle('disc')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"><span>•</span><span>Points</span></button>
                <button onClick={() => changeListStyle('circle')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"><span>○</span><span>Cercles</span></button>
                <button onClick={() => changeListStyle('square')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"><span>▪</span><span>Carrés</span></button>
              </div>
            )}
          </div>

          {/* Liste numérotée */}
          <div className="relative">
            <button onClick={() => { setShowNumberOptions(!showNumberOptions); setShowBulletOptions(false); setShowAlphaOptions(false); }} disabled={desactive} className={`group flex items-center gap-1 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${editor.isActive('orderedList') ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`} title="Liste numérotée">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {showNumberOptions && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
                <button onClick={() => changeListStyle('decimal')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">1, 2, 3...</button>
                <button onClick={() => changeListStyle('upper-roman')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">I, II, III...</button>
                <button onClick={() => changeListStyle('lower-roman')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">i, ii, iii...</button>
              </div>
            )}
          </div>

          {/* Liste alphabétique */}
          <div className="relative">
            <button onClick={() => { setShowAlphaOptions(!showAlphaOptions); setShowBulletOptions(false); setShowNumberOptions(false); }} disabled={desactive} className={`group flex items-center gap-1 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300`} title="Liste alphabétique">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><text x="3" y="9" fontSize="10" fontWeight="bold">A</text></svg>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {showAlphaOptions && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
                <button onClick={() => changeListStyle('upper-alpha')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">A, B, C...</button>
                <button onClick={() => changeListStyle('lower-alpha')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">a, b, c...</button>
              </div>
            )}
          </div>

          <div className="flex-1"></div>

          {/* Annuler / Rétablir */}
          <button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo() || desactive} className="group p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300" title="Annuler (Ctrl+Z)">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
          </button>
          <button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo() || desactive} className="group p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300" title="Rétablir (Ctrl+Shift+Z)">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
          </button>
        </div>
      </div>

      {/* Zone d'édition */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
        <EditorContent editor={editor} />
      </div>

      {/* Compteur */}
      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 px-4 py-2 bg-gradient-to-t from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              {editor.storage.characterCount?.words() || 0} {t("texte.mots")}
            </span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
              {editor.getText().length} {t("texte.caracteres")}
            </span>
          </div>
          <span className="flex items-center gap-1.5">
            {desactive ? (
              <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>{t("texte.lecture_seule")}</>
            ) : (
              <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>{t("texte.edition")}</>
            )}
          </span>
        </div>
      </div>

      {/* Overlay */}
      {(showBulletOptions || showNumberOptions || showAlphaOptions) && (
        <div className="fixed inset-0 z-0" onClick={() => { setShowBulletOptions(false); setShowNumberOptions(false); setShowAlphaOptions(false); }} />
      )}
    </div>
  );
}
 