"use client";

import React, { useState, useEffect } from 'react';

interface HideUIButtonProps {
  onToggle: () => void;
  isUIHidden: boolean;
}

const HideUIButton: React.FC<HideUIButtonProps> = ({ onToggle, isUIHidden }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ top: 16, right: 16 });
  const [startDragPos, setStartDragPos] = useState({ x: 0, y: 0 });

  // Efecto para animación de entrada
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 800); // Aparecer un poco después de la página
    
    return () => clearTimeout(timer);
  }, []);

  // Gestión del drag del botón para posicionarlo donde quiera el usuario
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartDragPos({
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = startDragPos.x - e.clientX;
      const deltaY = startDragPos.y - e.clientY;
      
      setPosition(prev => ({
        top: Math.max(10, prev.top + deltaY),
        right: Math.max(10, prev.right + deltaX)
      }));
      
      setStartDragPos({
        x: e.clientX,
        y: e.clientY
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mousemove', handleMouseMove as any);
    }
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove as any);
    };
  }, [isDragging]);

  return (
    <div 
      className={`fixed z-50 flex items-center gap-2 cursor-move select-none transition-all duration-500 
        ${isUIHidden ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-800/80 hover:bg-gray-700'} 
        text-white rounded-full py-2 px-3 shadow-lg hover:shadow-xl transform 
        ${isHovering ? 'scale-105' : ''} ${isVisible ? 'opacity-100' : 'opacity-0 translate-y-3'}
        ${isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab'}`}
      style={{
        top: `${position.top}px`,
        right: `${position.right}px`,
        backdropFilter: 'blur(4px)',
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseDown={handleMouseDown}
    >
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="flex items-center gap-2 outline-none focus:outline-none"
        title={isUIHidden ? "Mostrar interfaz" : "Ocultar interfaz"}
      >
        {isUIHidden ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="text-xs font-medium">Exit VR</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <span className="text-xs font-medium">360° View</span>
          </>
        )}
      </button>
      
      {/* Decoración de agarre para indicar que se puede arrastrar */}
      <div className="w-3 h-3 flex flex-col justify-between opacity-70 ml-1">
        <div className="bg-current h-0.5 w-full rounded-full"></div>
        <div className="bg-current h-0.5 w-full rounded-full"></div>
        <div className="bg-current h-0.5 w-full rounded-full"></div>
      </div>
    </div>
  );
};

export default HideUIButton;
