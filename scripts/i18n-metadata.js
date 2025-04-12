// Importar la función para calcular la edad actual
import { getCurrentAge } from './age-calculator.js';

// Obtener la edad actual
const currentAge = getCurrentAge();

// Metadatos para cada idioma compatible
export const metadataByLang = {
  // Español
  "es": {
    "title": "Hola, soy Bruno Moya | Desarrollador y Emprendedor de AR/VR/MR",
    "description": `Un entusiasta de la tecnología de ${currentAge} años de Barcelona, fundador de Glassear, dedicado a hacer la tecnología de Realidad Aumentada accesible para todos.`,
    "language": "es",
    "ogTitle": "Hola, soy Bruno Moya.",
    "ogDescription": "Desarrollador y Emprendedor de AR/VR/MR.",
    "ogLocale": "es_ES",
    "twitterTitle": "Hola, soy Bruno Moya.",
    "twitterDescription": "Desarrollador y Emprendedor de AR/VR/MR.",
    "keywords": "Bruno Moya, Desarrollador AR, Desarrollador VR, Desarrollador MR, Emprendedor, Glassear, Realidad Aumentada, Realidad Mixta, Barcelona, Entusiasta Tecnológico"
  },
  // Inglés
  "en": {
    "title": "Hi, I'm Bruno Moya | AR/VR/MR Developer & Entrepreneur",
    "description": `A ${currentAge}-year-old tech enthusiast from Barcelona, founder of Glassear, dedicated to making Augmented-Reality technology accessible to everyone.`,
    "language": "en",
    "ogTitle": "Hi, I'm Bruno Moya.",
    "ogDescription": "AR/VR/MR Developer and Entrepreneur.",
    "ogLocale": "en_US",
    "twitterTitle": "Hi, I'm Bruno Moya.",
    "twitterDescription": "AR/VR/MR Developer and Entrepreneur.",
    "keywords": "Bruno Moya, AR Developer, VR Developer, MR Developer, Entrepreneur, Glassear, Augmented Reality, Mixed Reality, Barcelona, Tech Enthusiast"
  }
};