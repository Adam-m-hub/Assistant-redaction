// src/utils/export.ts
// Fonctions d'export de documents

import TurndownService from 'turndown';

/**
 * Convertir HTML en Markdown
 * 
 * @param html - Contenu HTML à convertir
 * @returns Contenu en Markdown
 */
function convertirHtmlEnMarkdown(html: string): string {
  // Créer une instance de Turndown
  const turndown = new TurndownService({
    headingStyle: 'atx',           // Utiliser # pour les titres
    bulletListMarker: '-',          // Utiliser - pour les listes
    codeBlockStyle: 'fenced',       // Utiliser ``` pour le code
    emDelimiter: '*',               // Utiliser * pour l'italique
    strongDelimiter: '**',          // Utiliser ** pour le gras
  });

  // Convertir
  const markdown = turndown.turndown(html);
  
  return markdown;
}

/**
 * Générer un nom de fichier basé sur le contenu
 * 
 * @param contenu - Contenu du document
 * @returns Nom de fichier
 */
function genererNomFichier(contenu: string): string {
  // Essayer d'extraire le premier titre (H1)
  const match = contenu.match(/^#\s+(.+)$/m);
  
  if (match && match[1]) {
    // Utiliser le titre, en nettoyant les caractères spéciaux
    const titre = match[1]
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')  // Remplacer caractères spéciaux par -
      .replace(/^-+|-+$/g, '')       // Enlever - au début/fin
      .substring(0, 50);              // Limiter à 50 caractères
    
    return `${titre}.md`;
  }
  
  // Sinon, utiliser la date
  const date = new Date().toISOString().split('T')[0]; // Format: 2026-01-19
  return `document-${date}.md`;
}

/**
 * Télécharger un fichier
 * 
 * @param contenu - Contenu du fichier
 * @param nomFichier - Nom du fichier
 */
function telechargerFichier(contenu: string, nomFichier: string): void {
  // Créer un Blob (fichier virtuel)
  const blob = new Blob([contenu], { type: 'text/markdown;charset=utf-8' });
  
  // Créer une URL temporaire pour le blob
  const url = URL.createObjectURL(blob);
  
  // Créer un lien de téléchargement invisible
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = nomFichier;
  lien.style.display = 'none';
  
  // Ajouter au DOM, cliquer, puis retirer
  document.body.appendChild(lien);
  lien.click();
  document.body.removeChild(lien);
  
  // Libérer la mémoire
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
  
  console.log(`✅ Fichier exporté : ${nomFichier}`);
}

/**
 * Exporter le contenu HTML en Markdown et le télécharger
 * 
 * @param html - Contenu HTML à exporter
 * @param titrePersonnalise - Titre personnalisé optionnel pour le fichier
 * 
 * @example
 * exporterEnMarkdown(editor.getHTML());
 * exporterEnMarkdown(editor.getHTML(), "mon-article");
 */
export function exporterEnMarkdown(html: string, titrePersonnalise?: string): void {
  // Vérifier que le contenu n'est pas vide
  if (!html || html.trim() === '<p></p>' || html.trim() === '') {
    alert('⚠️ Aucun contenu à exporter');
    return;
  }

  try {
    // 1. Convertir HTML → Markdown
    const markdown = convertirHtmlEnMarkdown(html);
    
    // 2. Générer le nom du fichier
    let nomFichier: string;
    if (titrePersonnalise) {
      // Nettoyer le titre personnalisé
      nomFichier = titrePersonnalise
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50) + '.md';
    } else {
      nomFichier = genererNomFichier(markdown);
    }
    
    // 3. Télécharger le fichier
    telechargerFichier(markdown, nomFichier);
    
  } catch (erreur) {
    console.error('❌ Erreur lors de l\'export :', erreur);
    alert('❌ Erreur lors de l\'export du fichier');
  }
}

/**
 * Exporter en texte brut (sans formatage)
 * 
 * @param texte - Contenu texte
 * @param nomFichier - Nom du fichier
 */
export function exporterEnTexte(texte: string, nomFichier: string = 'document.txt'): void {
  if (!texte || texte.trim() === '') {
    alert('⚠️ Aucun contenu à exporter');
    return;
  }

  try {
    telechargerFichier(texte, nomFichier);
  } catch (erreur) {
    console.error('❌ Erreur lors de l\'export :', erreur);
    alert('❌ Erreur lors de l\'export du fichier');
  }
}