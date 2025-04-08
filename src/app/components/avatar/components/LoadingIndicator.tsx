import React from 'react';
import { motion } from 'framer-motion';

interface LoadingIndicatorProps {
  theme: "dark" | "light";
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ theme }) => {
  const isLight = theme === "light";
//   const primaryColor = isLight ? "#3b82f6" : "#60a5fa"; // Blue shade based on theme
  const backgroundColor = isLight ? "#f1f5f9" : "#1e293b";
  
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-50" 
      style={{ backgroundColor }}>
      {/* Elevator loading animation */}
      <div className="relative w-24 h-40 mb-4">
        {/* Elevator shaft */}
        <div className={`absolute inset-0 rounded-lg ${isLight ? "border-gray-300 bg-gray-100" : "border-gray-700 bg-gray-800"} border-2`}></div>
        
        {/* Moving elevator car */}
        <motion.div 
          className={`absolute left-2 right-2 h-12 rounded ${isLight ? "bg-gray-300" : "bg-gray-600"} shadow-md`}
          initial={{ y: 0 }}
          animate={{ y: [0, 24, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Elevator door line */}
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-gray-500"></div>
        </motion.div>
        
        {/* Floor indicators */}
        {[0, 1, 2].map((floor) => (
          <div 
            key={floor} 
            className={`absolute right-0 h-1 w-4 ${isLight ? "bg-gray-400" : "bg-gray-500"}`}
            style={{ top: `${floor * 12 + 6}px` }}
          ></div>
        ))}
      </div>
      
      {/* Loading text */}
      <div className="text-center">
        <motion.div 
          className={`text-lg font-medium ${isLight ? "text-gray-800" : "text-white"}`}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
        >
          Loading Elevator
        </motion.div>
        <div className="flex justify-center mt-2">
          <motion.div 
            className={`h-2 w-2 rounded-full ${isLight ? "bg-blue-500" : "bg-blue-400"} mx-1`}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
          />
          <motion.div 
            className={`h-2 w-2 rounded-full ${isLight ? "bg-blue-500" : "bg-blue-400"} mx-1`}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div 
            className={`h-2 w-2 rounded-full ${isLight ? "bg-blue-500" : "bg-blue-400"} mx-1`}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;