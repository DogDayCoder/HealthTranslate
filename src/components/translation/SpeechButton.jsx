import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { motion } from "framer-motion";

export default function SpeechButton({ 
  userType, 
  isListening, 
  onSpeechStart, 
  onSpeechEnd, 
  label,
  disabled 
}) {
  const [pressTime, setPressTime] = useState(null);
  
  // For POC purposes, we'll simulate speech recognition
  const handleMouseDown = () => {
    if (disabled) return;
    setPressTime(Date.now());
    onSpeechStart(userType);
    
    // Simulate speech recognition delay
    setTimeout(() => {
      // In real implementation, this would be actual speech-to-text
      const simulatedSpeech = userType === 'clinician' 
        ? "Hello, I'm Dr. Smith. What brings you in today?"
        : "I have been experiencing chest pain since yesterday.";
      
      onSpeechEnd(userType, simulatedSpeech);
      setPressTime(null);
    }, 2000); // 2 second simulated speech
  };

  const handleMouseUp = () => {
    if (pressTime) {
      const duration = Date.now() - pressTime;
      if (duration < 500) {
        // Too short, cancel
        setPressTime(null);
        return;
      }
    }
  };

  return (
    <div className="text-center">
      <motion.div
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
      >
        <Button
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          disabled={disabled}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-200 ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'medical-button'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isListening ? (
            <MicOff className="w-8 h-8 text-white" />
          ) : (
            <Mic className="w-8 h-8 text-white" />
          )}
        </Button>
      </motion.div>
      
      <p className="text-sm font-medium text-gray-700 mt-3">
        {isListening ? "Listening..." : label}
      </p>
      
      <p className="text-xs text-gray-500 mt-1">
        Hold to speak
      </p>
    </div>
  );
}