import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function TranslationDisplay({ 
  text, 
  isActive, 
  isTranslating,
  language = "English" 
}) {
  const speakText = () => {
    // In real implementation, this would use text-to-speech
    console.log(`Speaking: ${text}`);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 relative">
        <Card className={`h-full transition-all duration-300 ${
          isActive ? 'border-blue-500 shadow-lg bg-blue-50' : 'border-gray-200'
        }`}>
          <CardContent className="p-6 h-full flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {isTranslating ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
                  <p className="text-gray-500">Translating...</p>
                </motion.div>
              ) : text ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className={`text-lg leading-relaxed ${
                    language === 'Arabic' || language === 'Urdu' ? 'text-right' : 'text-left'
                  }`} style={{ 
                    direction: language === 'Arabic' || language === 'Urdu' ? 'rtl' : 'ltr' 
                  }}>
                    {text}
                  </div>
                  
                  {text && (
                    <div className="flex justify-end">
                      <Button
                        onClick={speakText}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Volume2 className="w-4 h-4" />
                        Replay
                      </Button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-gray-400"
                >
                  <p>Waiting for speech...</p>
                  <p className="text-sm mt-1">Tap and hold the microphone to speak</p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}