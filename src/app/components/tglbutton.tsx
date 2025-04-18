import React from 'react';
import './toggleBtn.css';

// Iconos como componentes memoizados separados para evitar re-renders innecesarios
const SunIcon = React.memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    enableBackground="new 0 0 24 24"
    height="24px"
    viewBox="0 0 24 24"
    width="24px"
    fill="#FFD700" // Color amarillo dorado para el sol
    className="sun-icon" // Clase para animación
  >
    <rect fill="none" height="24" width="24" />
    <path d="M12,7c-2.76,0-5,2.24-5,5s2.24,5,5,5s5-2.24,5-5S14.76,7,12,7L12,7z M2,13l2,0c0.55,0,1-0.45,1-1s-0.45-1-1-1l-2,0 c-0.55,0-1,0.45-1,1S1.45,13,2,13z M20,13l2,0c0.55,0,1-0.45,1-1s-0.45-1-1-1l-2,0c-0.55,0-1,0.45-1,1S19.45,13,20,13z M11,2v2 c0,0.55,0.45,1,1,1s1-0.45,1-1V2c0-0.55-0.45-1-1-1S11,1.45,11,2z M11,20v2c0,0.55,0.45,1,1,1s1-0.45,1-1v-2c0-0.55-0.45-1-1-1 C11.45,19,11,19.45,11,20z M5.99,4.58c-0.39-0.39-1.03-0.39-1.41,0c-0.39,0.39-0.39,1.03,0,1.41l1.06,1.06 c0.39,0.39,1.03,0.39,1.41,0s0.39-1.03,0-1.41L5.99,4.58z M18.36,16.95c-0.39-0.39-1.03-0.39-1.41,0c-0.39,0.39-0.39,1.03,0,1.41 l1.06,1.06c0.39,0.39,1.03,0.39,1.41,0c0.39-0.39,0.39-1.03,0-1.41L18.36,16.95z M19.42,5.99c0.39-0.39,0.39-1.03,0-1.41 c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06c-0.39,0.39-0.39,1.03,0,1.41s1.03,0.39,1.41,0L19.42,5.99z M7.05,18.36 c0.39-0.39,0.39-1.03,0-1.41c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06c-0.39,0.39-0.39,1.03,0,1.41s1.03,0.39,1.41,0L7.05,18.36z" />
  </svg>
));

const MoonIcon = React.memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    enableBackground="new 0 0 24 24"
    height="24px"
    viewBox="0 0 24 24"
    width="24px"
    fill="#E1E1FF" // Color azul claro para la luna
    className="moon-icon" // Clase para animación
  >
    <rect fill="none" height="24" width="24" />
    <path d="M11.01,3.05C6.51,3.54,3,7.36,3,12c0,4.97,4.03,9,9,9c4.63,0,8.45-3.5,8.95-8c0.09-0.79-0.78-1.42-1.54-0.95 c-0.84,0.54-1.84,0.85-2.91,0.85c-2.98,0-5.4-2.42-5.4-5.4c0-1.06,0.31-2.06,0.84-2.89C12.39,3.94,11.9,2.98,11.01,3.05z" />
  </svg>
));

interface ToggleBtnProps {
  onChange: (value: boolean) => void;
  checked: boolean;
  className: string;
}

// Componente memoizado para evitar re-renders innecesarios
const ToggleBtn = React.memo(({ onChange, checked, className }: ToggleBtnProps): JSX.Element => {
  // Función para manejar el clic - usamos useCallback si este componente tuviera estado
  const handleClick = React.useCallback(() => {
    onChange(!checked);
  }, [onChange, checked]);
  
  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${className} btn btn--icon theme-toggle-btn ${checked ? 'dark-mode' : 'light-mode'}`}
      aria-label="Cambiar tema"
      title={checked ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      <span className="toggle-icon-wrapper">
        {checked ? <SunIcon /> : <MoonIcon />}
      </span>
    </button>
  );
}, (prevProps, nextProps) => {
  // Función personalizada de comparación para controlar exactamente cuándo se debe re-renderizar
  return (
    prevProps.checked === nextProps.checked && 
    prevProps.className === nextProps.className
    // No incluimos onChange en la comparación ya que suele ser una nueva función en cada render del padre
  );
});

// Nombre para las DevTools
ToggleBtn.displayName = 'ToggleBtn';

export default ToggleBtn;