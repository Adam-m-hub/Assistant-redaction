// src/utils/export.ts
// Fonctions d'export de documents en PDF

import jsPDF from 'jspdf';

/**
 * Nettoyer le HTML pour extraire le texte brut
 */
function extraireTexte(html: string): string {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
}

/**
 * Générer un nom de fichier basé sur le contenu
 */
function genererNomFichier(contenu: string): string {
  // Extraire les premiers mots comme titre
  const premiersMots = contenu
    .trim()
    .split(/\s+/)
    .slice(0, 5)
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .substring(0, 50);
  
  if (premiersMots) {
    return `${premiersMots}.pdf`;
  }
  
  // Sinon, utiliser la date
  const date = new Date().toISOString().split('T')[0];
  return `document-${date}.pdf`;
}

/**
 * Exporter le contenu en PDF et le télécharger
 * 
 * @param html - Contenu HTML à exporter
 * @param titrePersonnalise - Titre personnalisé optionnel pour le fichier
 * 
 * @example
 * exporterEnPDF(editor.getHTML());
 * exporterEnPDF(editor.getHTML(), "mon-article");
 */
export function exporterEnPDF(html: string, titrePersonnalise?: string): void {
  // Vérifier que le contenu n'est pas vide
  if (!html || html.trim() === '<p></p>' || html.trim() === '') {
    alert('⚠️ Aucun contenu à exporter');
    return;
  }

  try {
    // 1. Extraire le texte du HTML
    const texte = extraireTexte(html);
    
    if (!texte || texte.trim() === '') {
      alert('⚠️ Aucun contenu textuel à exporter');
      return;
    }

    // 2. Créer le PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // 3. Configuration du texte
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    
    // 4. Ajouter le texte avec gestion des retours à la ligne
    const margeGauche = 20;
    const margeDroite = 20;
    const margeHaut = 20;
    const largeurTexte = 210 - margeGauche - margeDroite; // A4 = 210mm
    
    // Diviser le texte en lignes qui tiennent dans la largeur
    const lignes = doc.splitTextToSize(texte, largeurTexte);
    
    // Ajouter les lignes au PDF
    doc.text(lignes, margeGauche, margeHaut);

    // 5. Générer le nom du fichier
    let nomFichier: string;
    if (titrePersonnalise) {
      nomFichier = titrePersonnalise
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50) + '.pdf';
    } else {
      nomFichier = genererNomFichier(texte);
    }
    
    // 6. Télécharger le PDF
    doc.save(nomFichier);
    
    console.log(`✅ PDF exporté : ${nomFichier}`);
    
  } catch (erreur) {
    console.error('❌ Erreur lors de l\'export PDF :', erreur);
    alert('❌ Erreur lors de l\'export du fichier PDF');
  }
}

/**
 * Alias pour compatibilité (remplace exporterEnMarkdown)
 */
export function exporterEnMarkdown(html: string, titrePersonnalise?: string): void {
  exporterEnPDF(html, titrePersonnalise);
}

/**
 * Exporter en texte brut (sans formatage)
 */
export function exporterEnTexte(texte: string, nomFichier: string = 'document.txt'): void {
  if (!texte || texte.trim() === '') {
    alert('⚠️ Aucun contenu à exporter');
    return;
  }

  try {
    const blob = new Blob([texte], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const lien = document.createElement('a');
    lien.href = url;
    lien.download = nomFichier;
    lien.style.display = 'none';
    document.body.appendChild(lien);
    lien.click();
    document.body.removeChild(lien);
    setTimeout(() => URL.revokeObjectURL(url), 100);
    console.log(`✅ Fichier texte exporté : ${nomFichier}`);
  } catch (erreur) {
    console.error('❌ Erreur lors de l\'export texte :', erreur);
    alert('❌ Erreur lors de l\'export du fichier');
  }
}