import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { track } from '../../../utils/umami-analytics';
// import '../elevator-doors.css';

type ElevatorDoorsProps = {
  isOpen: boolean;
  theme: "dark" | "light";
};

type DoorState = 'closed' | 'opening' | 'closing' | 'open';

const ElevatorDoors: React.FC<ElevatorDoorsProps> = ({ isOpen, theme }) => {
  const [doorState, setDoorState] = useState<DoorState>(isOpen ? 'open' : 'closed');
  const previousOpenState = useRef(isOpen);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const doorMovementKey = useRef(0);
  const transitionInProgressRef = useRef(false);
  
  // Force animation rerender each time isOpen changes
  useEffect(() => {
    doorMovementKey.current += 1;
  }, [isOpen]);

  // Handle door state changes with improved transitions
  useEffect(() => {
    // Always clean up any running animations on prop change
    const cleanupTimeouts = () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
    };
    
    // Only trigger a new animation sequence if the open state has changed
    if (previousOpenState.current !== isOpen || transitionInProgressRef.current) {
      cleanupTimeouts();
      
      transitionInProgressRef.current = true;
      
      if (isOpen) {
        // Door opening sequence
        setDoorState('opening');
        
        animationTimeoutRef.current = setTimeout(() => {
          setDoorState('open');
          transitionInProgressRef.current = false;
          console.log('Doors fully opened');
        }, 1600);
      } else {
        // Door closing sequence
        setDoorState('closing');
        
        animationTimeoutRef.current = setTimeout(() => {
          setDoorState('closed');
          transitionInProgressRef.current = false;
          console.log('Doors fully closed');
        }, 1600);
      }
      
      previousOpenState.current = isOpen;
    }
    
    return cleanupTimeouts;
  }, [isOpen]);
  
  // Track analytics for door animations
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
  
  // Colors based on theme
  const doorBgColor = isLight ? 'bg-gray-200' : 'bg-gray-800';
  const doorBorderColor = isLight ? 'border-gray-300' : 'border-gray-600';
  const doorFrameColor = isLight ? 'bg-gray-400' : 'bg-gray-900';
  const panelBgColor = isLight ? 'bg-gray-100' : 'bg-gray-700';
  
  // Helper function for determining door positions based on state
  const getDoorPosition = (side: 'left' | 'right', state: DoorState) => {
    if (side === 'left') {
      if (state === 'opening' || state === 'open') {
        return "-100%";
      }
      return "0%";
    } else {
      if (state === 'opening' || state === 'open') {
        return "100%";
      }
      return "0%";
    }
  };
  
  // Door state text
  const getDoorStateText = (state: DoorState) => {
    switch (state) {
      case 'closing': return 'DOORS CLOSING';
      case 'opening': return 'DOORS OPENING';
      case 'closed': return 'DOORS CLOSED';
      case 'open': return 'DOORS OPEN';
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex overflow-hidden pointer-events-none">
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
            className={`w-1/2 h-full ${doorBgColor} border-r ${doorBorderColor} relative shadow-lg`}
            initial={{ x: "0%" }}
            animate={{ x: getDoorPosition('left', doorState) }}
            transition={{ duration: 1.6, ease: "easeInOut" }}
          >
            <div className={`absolute inset-[20px] border ${doorBorderColor} ${panelBgColor}`}></div>
          </motion.div>
          
          {/* Right door */}
          <motion.div 
            className={`w-1/2 h-full ${doorBgColor} border-l ${doorBorderColor} relative shadow-lg`}
            initial={{ x: "0%" }}
            animate={{ x: getDoorPosition('right', doorState) }}
            transition={{ duration: 1.6, ease: "easeInOut" }}
          >
            <div className={`absolute inset-[20px] border ${doorBorderColor} ${panelBgColor}`}></div>
          </motion.div>
          
          {/* Door indicator */}
          <div className={`absolute top-4 right-4 ${isLight ? 'bg-amber-500' : 'bg-amber-600'} text-black px-3 py-1 rounded shadow-md`}>
            <div className={`text-xs font-mono font-bold`}>
              {getDoorStateText(doorState)}
            </div>
          </div>
          
          {/* Floor indicator when moving */}
          {isMoving && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[60]">
              <div className={`text-center p-3 rounded-lg ${isLight ? 'bg-white/90' : 'bg-black/90'} shadow-lg border`}>
                <div className={`text-xs font-mono ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                  {doorState === 'closing' ? 'CLOSING DOORS' : 'OPENING DOORS'}
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
