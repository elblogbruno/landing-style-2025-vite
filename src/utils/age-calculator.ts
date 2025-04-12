/**
 * Calcula la edad actual basada en una fecha de nacimiento
 * @param birthdate Fecha de nacimiento en formato Date o string (YYYY-MM-DD)
 * @returns La edad actual en años
 */
export function calculateAge(birthdate: Date | string): number {
  const birthDate = birthdate instanceof Date ? birthdate : new Date(birthdate);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  
  // Si aún no ha pasado el mes de cumpleaños o si es el mes pero no ha llegado el día
  if (
    monthDifference < 0 || 
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  
  return age;
}

// Fecha de nacimiento constante
export const BIRTH_DATE = '2001-08-21'; // Formato YYYY-MM-DD

// Función para obtener la edad actual
export function getCurrentAge(): number {
  return calculateAge(BIRTH_DATE);
}