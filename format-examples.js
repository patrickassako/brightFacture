// Exemple d'utilisation des nouvelles fonctions de formatage
import { formatEuro, formatXaf } from './src/utils/validation';

// Formatage Euro
console.log(formatEuro("166.16"));    // "166,16 €"
console.log(formatEuro(166.16));      // "166,16 €"
console.log(formatEuro("1500"));      // "1 500,00 €"

// Formatage XAF (Franc CFA)
console.log(formatXaf("110000"));     // "110 000 F"
console.log(formatXaf(110000));       // "110 000 F"
console.log(formatXaf("1500.50"));    // "1 501 F" (arrondi, pas de décimales)
