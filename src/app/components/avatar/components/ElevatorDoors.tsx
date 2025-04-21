import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import { track } from '../../../utils/umami-analytics';
import { useTranslation } from 'react-i18next';
import '../elevator-doors.css';

type ElevatorDoorsProps = {
  isOpen: boolean;
  theme: "dark" | "light";
};

type DoorState = 'closed' | 'opening' | 'closing' | 'open';

const ElevatorDoors: React.FC<ElevatorDoorsProps> = ({ isOpen, theme }) => {
  const { t } = useTranslation();
  const [doorState, setDoorState] = useState<DoorState>(isOpen ? 'open' : 'closed');
  const previousOpenState = useRef(isOpen);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const doorMovementKey = useRef(Math.random()); // Use random key to force re-renders
  const transitionInProgressRef = useRef(false);
  
  // Force visible log to help debug
  useEffect(() => {
    console.log(`ElevatorDoors rendered - isOpen: ${isOpen}, doorState: ${doorState}`);
  }, [isOpen, doorState]);
  
  // This function manages the door state changes without debounce
  const handleDoorStateChange = (newIsOpen: boolean) => {
    console.log(`Door state change requested: ${newIsOpen ? 'open' : 'close'}`);
    
    // Always create a new key to force Framer Motion to recreate animations
    doorMovementKey.current = Math.random();
    
    // Clear previous animations
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    
    // Mark that a transition is in progress
    transitionInProgressRef.current = true;
    
    // Set the new door state
    if (newIsOpen) {
      setDoorState('opening');
      
      // Set a timer to complete the animation
      animationTimeoutRef.current = setTimeout(() => {
        setDoorState('open');
        previousOpenState.current = newIsOpen;
        transitionInProgressRef.current = false;
      }, 1600); // Animation duration
    } else {
      setDoorState('closing');
      
      // Set a timer to complete the animation
      animationTimeoutRef.current = setTimeout(() => {
        setDoorState('closed');
        previousOpenState.current = newIsOpen;
        transitionInProgressRef.current = false;
      }, 1600); // Animation duration
    }
  };

  // Handle changes to the isOpen prop - use layout effect for synchronous updates
  useLayoutEffect(() => {
    console.log(`isOpen changed to: ${isOpen}`);
    
    // Always update when isOpen changes
    handleDoorStateChange(isOpen);
    
  }, [isOpen]);
  
  // Track door animation events for analytics
  useEffect(() => {
    track({
      category: 'ElevatorDoors',
      action: `Doors${doorState.charAt(0).toUpperCase() + doorState.slice(1)}`,
      label: `Theme: ${theme}`
    });
  }, [doorState, theme]);
  
  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);
  
  const isMoving = doorState === 'opening' || doorState === 'closing';
  const isLight = theme === "light";
  
  // Theme-based colors
  const doorBgColor = isLight ? 'bg-gray-200' : 'bg-gray-800';
  const doorBorderColor = isLight ? 'border-gray-300' : 'border-gray-600';
  const doorFrameColor = isLight ? 'bg-gray-400' : 'bg-gray-900';
  const panelBgColor = isLight ? 'bg-gray-100' : 'bg-gray-700';
  
  // Function to determine door position based on state
  const getDoorPosition = (side: 'left' | 'right', state: DoorState) => {
    if (side === 'left') {
      return (state === 'opening' || state === 'open') ? "-100%" : "0%";
    } else {
      return (state === 'opening' || state === 'open') ? "100%" : "0%";
    }
  };

  // Door state text for accessibility
  const getDoorStateText = (state: DoorState) => {
    switch (state) {
      case 'closing': return t('elevator.doors.closing');
      case 'opening': return t('elevator.doors.opening');
      case 'closed': return t('elevator.doors.closed');
      case 'open': return t('elevator.doors.open');
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex overflow-hidden pointer-events-none elevator-doors-container">
      {/* Door frame */}
      <div className={`absolute inset-0 p-[3px] ${isMoving ? 'frame-glow' : ''}`}>
        <div className="absolute inset-0 flex">
          {/* Frame borders */}
          <div className={`absolute top-0 left-0 right-0 h-3 ${doorFrameColor} border-b ${doorBorderColor}`}></div>
          <div className={`absolute bottom-0 left-0 right-0 h-3 ${doorFrameColor} border-t ${doorBorderColor}`}></div>
          <div className={`absolute top-0 bottom-0 left-0 w-2 ${doorFrameColor} border-r ${doorBorderColor}`}></div>
          <div className={`absolute top-0 bottom-0 right-0 w-2 ${doorFrameColor} border-l ${doorBorderColor}`}></div>
          
          {/* Left door */}
          <motion.div 
            key={`left-door-${doorMovementKey.current}`}
            className={`w-1/2 h-full ${doorBgColor} border-r ${doorBorderColor} relative shadow-lg`}
            initial={{ x: isOpen ? "-100%" : "0%" }}
            animate={{ x: getDoorPosition('left', doorState) }}
            transition={{ duration: 1.6, ease: "easeInOut" }}
          >
            <div className={`absolute inset-[20px] border ${doorBorderColor} ${panelBgColor}`}></div>
          </motion.div>
          
          {/* Right door */}
          <motion.div
            key={`right-door-${doorMovementKey.current}`} 
            className={`w-1/2 h-full ${doorBgColor} border-l ${doorBorderColor} relative shadow-lg`}
            initial={{ x: isOpen ? "100%" : "0%" }}
            animate={{ x: getDoorPosition('right', doorState) }}
            transition={{ duration: 1.6, ease: "easeInOut" }}
          >
            <div className={`absolute inset-[20px] border ${doorBorderColor} ${panelBgColor}`}></div>
          </motion.div>
          
          {/* Floor indicator when doors are moving */}
          {isMoving && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[60]">
              <div className={`text-center p-3 rounded-lg ${isLight ? 'bg-white/90' : 'bg-black/90'} shadow-lg border`}>
                <div className={`text-xs font-mono ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                  {getDoorStateText(doorState)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ElevatorDoors;
