import React from 'react';
import { track } from '../../../utils/umami-analytics';

interface ElevatorControlsProps {
  theme: "dark" | "light";
  currentFloor: number;
  floorDescription: string;
  isMuted: boolean;
  toggleMute: () => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  enableAudio: () => void;
}

const ElevatorControls: React.FC<ElevatorControlsProps> = ({
  theme,
  currentFloor,
  floorDescription,
  isMuted,
  toggleMute,
  isFullscreen,
  toggleFullscreen,
  enableAudio
}) => {
  // Handle mute button click with tracking
  const handleMuteToggle = () => {
    track({
      category: 'ElevatorControls',
      action: isMuted ? 'UnmuteSound' : 'MuteSound',
      label: `Floor ${currentFloor}: ${floorDescription}`
    });
    toggleMute();
    enableAudio();
  };

  // Handle fullscreen toggle with tracking
  const handleFullscreenToggle = () => {
    track({
      category: 'ElevatorControls',
      action: isFullscreen ? 'ExitFullscreen' : 'EnterFullscreen',
      label: `Floor ${currentFloor}: ${floorDescription}`
    });
    toggleFullscreen();
  };

  return (
    <>
      {/* Floor indicator */}
      <div className={`absolute top-4 right-4 ${theme === "dark" ? "bg-black/90" : "bg-white/90"} ${theme === "dark" ? "text-white" : "text-gray-800"} px-2 py-1 rounded-md border font-mono text-lg ${theme === "dark" ? "border-gray-700" : "border-gray-300"}`}>
        <span className={theme === "dark" ? "text-amber-500" : "text-blue-600"}>{currentFloor}</span>
        <span className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>F</span>
      </div>
      
      {/* Floor description */}
      <div className={`absolute top-4 left-4 ${theme === "dark" ? "bg-gray-900/90" : "bg-white/90"} px-3 py-2 rounded-md text-sm border ${theme === "dark" ? "border-gray-700 text-white" : "border-gray-300 text-gray-800"}`}>
        <div className={`text-xs ${theme === "dark" ? "text-blue-400" : "text-blue-600"} uppercase tracking-wider`}>Current Floor</div>
        <div className="font-bold">{floorDescription}</div>
      </div>

      {/* Sound button */}
      <div 
        className={`absolute bottom-16 left-4 ${theme === "dark" ? "bg-gray-900/80 border-gray-700" : "bg-white/80 border-gray-300"} px-2 py-1 rounded border cursor-pointer flex items-center gap-1`}
        onClick={handleMuteToggle}
        title={isMuted ? "Enable sound" : "Mute sound"}
      >
        <span className={theme === "dark" ? "text-white" : "text-gray-800"}>
          {isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
            </svg>
          )}
        </span>
        <span className={`text-xs ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
          {isMuted ? "Audio off" : "Audio on"}
        </span>
      </div>

      {/* Fullscreen button */}
      <div 
        className={`absolute bottom-4 right-4 ${theme === "dark" ? "bg-gray-900/80 border-gray-700" : "bg-white/80 border-gray-300"} px-2 py-1 rounded border cursor-pointer flex items-center gap-1 z-10`}
        onClick={handleFullscreenToggle}
        title={isFullscreen ? "Exit fullscreen" : "View in fullscreen"}
      >
        <span className={theme === "dark" ? "text-white" : "text-gray-800"}>
          {isFullscreen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a2 2 0 012-2h2a1 1 0 010 2H7v2a1 1 0 01-2 0zm10 0V7a1 1 0 00-1-1h-2a1 1 0 110-2h2a2 2 0 012 2v2a1 1 0 11-2 0zM5 11v2a2 2 0 002 2h2a1 1 0 110 2H7a4 4 0 01-4-4v-2a1 1 0 112 0zm10 0v2a1 1 0 001 1h2a1 1 0 110 2h-2a2 2 0 01-2-2v-2a1 1 0 112 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          )}
        </span>
        <span className={`text-xs ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
          {isFullscreen ? "Exit" : "Fullscreen"}
        </span>
      </div>

      {/* Instruction message for fullscreen visible only in that mode */}
      {isFullscreen && (
        <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 ${theme === "dark" ? "bg-gray-900/80 text-white border-gray-700" : "bg-white/80 text-gray-800 border-gray-300"} px-3 py-2 rounded-md text-sm border z-10 transition-opacity duration-300`} style={{ opacity: isFullscreen ? 1 : 0 }}>
          <p>Press <kbd className={`px-1.5 py-0.5 rounded ${theme === "dark" ? "bg-gray-800" : "bg-gray-200"} font-mono text-xs mx-1`}>ESC</kbd> or the button to exit fullscreen</p>
        </div>
      )}
    </>
  );
};

export default ElevatorControls;
