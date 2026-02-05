import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Patterns pour détecter les textes UI
 */
const PATTERNS = [
  // Texte dans les éléments HTML
  />([A-ZÀ-ÿ][^<]{2,})</g,
  
  // Attributs title, placeholder, aria-label
  /(?:title|placeholder|aria-label)=["']([^"']+)["']/g,
  
  // Texte entre guillemets (au moins 3 caractères, commence par majuscule)
  /["']([A-ZÀ-ÿ][^"']{2,})["']/g,
];

/**
 * Mots-clés à ignorer (code, variables, etc.)
 */
const MOTS_IGNORES = [
  'import', 'export', 'const', 'let', 'var', 'function', 'return',
  'className', 'onClick', 'onChange', 'useState', 'useEffect',
  'interface', 'type', 'string', 'number', 'boolean', 'void',
  'true', 'false', 'null', 'undefined', 'async', 'await',
  'tsx', 'jsx', 'css', 'html', 'json', 'svg', 'png', 'jpg'
];

/**
 * Vérifie si un texte est pertinent pour l'UI
 */
function estTexteUI(texte) {
  // Trop court
  if (texte.length < 3) return false;
  
  // Tout en minuscules (probablement une variable)
  if (texte === texte.toLowerCase() && !/[éèêëàâäôöùûüç]/i.test(texte)) return false;
  
  // Contient des mots-clés de code
  if (MOTS_IGNORES.some(mot => texte.toLowerCase().includes(mot))) return false;
  
  // Contient trop de caractères spéciaux
  const special = (texte.match(/[{}[\]();<>=/\\]/g) || []).length;
  if (special > 2) return false;
  
  // Commence par une minuscule et pas d'accents (probablement camelCase)
  if (/^[a-z]/.test(texte) && !/[éèêëàâäôöùûüç]/i.test(texte)) return false;
  
  return true;
}

/**
 * Scanne récursivement un dossier
 */
function scannerDossier(dossier) {
  const textesTrouves = new Map(); // Map pour dédupliquer
  
  function scannerRecursif(dir) {
    const fichiers = fs.readdirSync(dir);
    
    for (const fichier of fichiers) {
      const cheminComplet = path.join(dir, fichier);
      const stats = fs.statSync(cheminComplet);
      
      // Dossiers à ignorer
      if (stats.isDirectory()) {
        if (fichier.startsWith('.') || 
            fichier === 'node_modules' || 
            fichier === 'dist' ||
            fichier === 'build') {
          continue;
        }
        scannerRecursif(cheminComplet);
      } 
      // Fichiers à scanner
      else if (fichier.endsWith('.tsx') || fichier.endsWith('.ts')) {
        const contenu = fs.readFileSync(cheminComplet, 'utf-8');
        
        // Appliquer tous les patterns
        PATTERNS.forEach(pattern => {
          const matches = contenu.matchAll(pattern);
          for (const match of matches) {
            const texte = match[1]?.trim();
            
            if (texte && estTexteUI(texte)) {
              // Nettoyer le texte
              const texteNettoye = texte
                .replace(/\\n/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
              
              if (texteNettoye.length >= 3) {
                textesTrouves.set(texteNettoye, true);
              }
            }
          }
        });
      }
    }
  }
  
  scannerRecursif(dossier);
  return Array.from(textesTrouves.keys()).sort();
}

/**
 * Génère une structure JSON organisée
 */
function genererStructureJSON(textes) {
  const structure = {
    common: {},
    header: {},
    editor: {},
    actions: {},
    personas: {},
    settings: {},
    stats: {},
    loading: {},
    messages: {},
    modals: {}
  };
  
  textes.forEach(texte => {
    // Générer une clé basée sur le texte
    const cle = texte
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Enlever accents
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
      .substring(0, 40);
    
    // Catégoriser automatiquement
    let categorie = 'common';
    
    if (texte.includes('chargement') || texte.includes('Chargement')) {
      categorie = 'loading';
    } else if (texte.includes('Erreur') || texte.includes('succès')) {
      categorie = 'messages';
    } else if (/améliorer|corriger|raccourcir|allonger/i.test(texte)) {
      categorie = 'actions';
    } else if (/persona|journaliste|scientifique|marketeur|poète/i.test(texte)) {
      categorie = 'personas';
    } else if (/style|ton|longueur|paramètre/i.test(texte)) {
      categorie = 'settings';
    } else if (/statistique|mots|caractère|phrase/i.test(texte)) {
      categorie = 'stats';
    } else if (/document|sauvegarder|charger|exporter/i.test(texte)) {
      categorie = 'header';
    } else if (/éditeur|écrire|texte/i.test(texte)) {
      categorie = 'editor';
    } else if (/modal|confirmer|annuler/i.test(texte)) {
      categorie = 'modals';
    }
    
    structure[categorie][cle] = texte;
  });
  
  // Nettoyer les catégories vides
  Object.keys(structure).forEach(key => {
    if (Object.keys(structure[key]).length === 0) {
      delete structure[key];
    }
  });
  
  return structure;
}

/**
 * Script principal
 */
console.log('🔍 Extraction des textes UI...\n');

const srcPath = path.join(__dirname, '../src');
const textes = scannerDossier(srcPath);

console.log(`✅ ${textes.length} textes uniques trouvés\n`);

// Générer la structure JSON
const structureJSON = genererStructureJSON(textes);

// Créer le dossier si nécessaire
const localesPath = path.join(__dirname, '../src/i18n/locales');
if (!fs.existsSync(localesPath)) {
  fs.mkdirSync(localesPath, { recursive: true });
}

// Écrire fr.json
const frPath = path.join(localesPath, 'fr.json');
fs.writeFileSync(frPath, JSON.stringify(structureJSON, null, 2), 'utf-8');

console.log('✅ Fichier généré : src/i18n/locales/fr.json');
console.log('\n📊 Statistiques par catégorie:');

Object.entries(structureJSON).forEach(([categorie, textes]) => {
  console.log(`  ${categorie}: ${Object.keys(textes).length} textes`);
});

console.log('\n📋 Exemples de textes extraits:');
const premiers = textes.slice(0, 10);
premiers.forEach(t => console.log(`  - "${t}"`));

if (textes.length > 10) {
  console.log(`  ... et ${textes.length - 10} autres`);
}

console.log('\n✨ Prochaine étape: Envoyez fr.json à Claude pour traduction !');