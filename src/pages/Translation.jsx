import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Session } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, ArrowLeft, BookOpen, Square } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import SpeechButton from "../components/translation/SpeechButton";
import TranslationDisplay from "../components/translation/TranslationDisplay";

const SUPPORTED_LANGUAGES = {
  "Polish": { flag: "🇵🇱", code: "pl" },
  "Punjabi": { flag: "🇮🇳", code: "pa" },
  "Urdu": { flag: "🇵🇰", code: "ur" },
  "Romanian": { flag: "🇷🇴", code: "ro" },
  "Arabic": { flag: "🇸🇦", code: "ar" },
};

export default function Translation() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('sessionId');
  const selectedLanguage = urlParams.get('language');
  
  const [session, setSession] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [activeUser, setActiveUser] = useState(null); // 'clinician' or 'patient'
  const [clinicianText, setClinicianText] = useState("");
  const [patientText, setPatientText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [sessionActive, setSessionActive] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const sessionData = await Session.get(sessionId);
        setSession(sessionData);
      } catch (error) {
        navigate(createPageUrl("Dashboard"));
      }
    };

    if (sessionId) {
      loadSession();
    } else {
      navigate(createPageUrl("Dashboard"));
    }
  }, [sessionId, navigate]);

  const translateText = async (text, fromLang, toLang) => {
    setIsTranslating(true);
    try {
      const prompt = `Translate the following ${fromLang} text to ${toLang}. Only return the translation, nothing else: "${text}"`;
      
      const response = await InvokeLLM({
        prompt: prompt,
      });
      
      return response;
    } catch (error) {
      console.error("Translation error:", error);
      return "Translation unavailable";
    } finally {
      setIsTranslating(false);
    }
  };

  const speakText = (text, language) => {
    // In a real implementation, this would use text-to-speech
    // For POC, we'll simulate with a visual indicator
    console.log(`Speaking in ${language}: ${text}`);
  };

  const handleSpeechStart = (userType) => {
    setIsListening(true);
    setActiveUser(userType);
  };

  const handleSpeechEnd = async (userType, spokenText) => {
    setIsListening(false);
    setActiveUser(null);
    
    if (!spokenText.trim()) return;

    if (userType === 'clinician') {
      setClinicianText(spokenText);
      // Translate to patient's language
      const translated = await translateText(spokenText, 'English', selectedLanguage);
      setPatientText(translated);
      speakText(translated, selectedLanguage);
    } else {
      setPatientText(spokenText);
      // Translate to English
      const translated = await translateText(spokenText, selectedLanguage, 'English');
      setClinicianText(translated);
      speakText(translated, 'English');
    }
  };

  const handleEndSession = async () => {
    if (sessionId) {
      try {
        await Session.update(sessionId, {
          session_status: "ended",
          end_time: new Date().toISOString()
        });
      } catch (error) {
        console.error("Error ending session:", error);
      }
    }
    setSessionActive(false);
    navigate(createPageUrl("Dashboard"));
  };

  const handleOpenPhrases = () => {
    navigate(createPageUrl(`Phrases?sessionId=${sessionId}&language=${selectedLanguage}`));
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const languageInfo = SUPPORTED_LANGUAGES[selectedLanguage];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-blue-100 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(createPageUrl("Dashboard"))}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Live Translation</h1>
              <div className="flex items-center gap-2">
                <span className="text-lg">{languageInfo?.flag}</span>
                <span className="text-sm text-gray-600">English ↔ {selectedLanguage}</span>
                <Badge variant={sessionActive ? "default" : "secondary"}>
                  {sessionActive ? "Active" : "Ended"}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleOpenPhrases}
              className="flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Phrases
            </Button>
            <Button
              onClick={handleEndSession}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Square className="w-4 h-4" />
              End Session
            </Button>
          </div>
        </div>
      </div>

      {/* Translation Interface */}
      <div className="p-4 max-w-4xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          {/* Clinician Interface */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <Card className="medical-shadow border-0 h-full flex flex-col">
              <div className="p-4 border-b border-gray-100 bg-blue-50">
                <h2 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                  🩺 Clinician (English)
                </h2>
              </div>
              
              <CardContent className="flex-1 flex flex-col p-6">
                <div className="flex-1">
                  <TranslationDisplay 
                    text={clinicianText}
                    isActive={activeUser === 'clinician'}
                    isTranslating={isTranslating && activeUser === 'patient'}
                  />
                </div>
                
                <div className="pt-4">
                  <SpeechButton
                    userType="clinician"
                    isListening={isListening && activeUser === 'clinician'}
                    onSpeechStart={handleSpeechStart}
                    onSpeechEnd={handleSpeechEnd}
                    label="Tap and Speak"
                    disabled={isListening && activeUser !== 'clinician'}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Patient Interface */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <Card className="medical-shadow border-0 h-full flex flex-col">
              <div className="p-4 border-b border-gray-100 bg-green-50">
                <h2 className="text-lg font-semibold text-green-900 flex items-center gap-2">
                  {languageInfo?.flag} Patient ({selectedLanguage})
                </h2>
              </div>
              
              <CardContent className="flex-1 flex flex-col p-6">
                <div className="flex-1">
                  <TranslationDisplay 
                    text={patientText}
                    isActive={activeUser === 'patient'}
                    isTranslating={isTranslating && activeUser === 'clinician'}
                    language={selectedLanguage}
                  />
                </div>
                
                <div className="pt-4">
                  <SpeechButton
                    userType="patient"
                    isListening={isListening && activeUser === 'patient'}
                    onSpeechStart={handleSpeechStart}
                    onSpeechEnd={handleSpeechEnd}
                    label="Tap and Speak" // In real app, this would be translated
                    disabled={isListening && activeUser !== 'patient'}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Status Bar */}
        <AnimatePresence>
          {(isListening || isTranslating) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-6 left-1/2 transform -translate-x-1/2"
            >
              <div className="bg-white rounded-full px-6 py-3 shadow-lg border border-blue-100 flex items-center gap-3">
                {isListening ? (
                  <>
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">
                      Listening to {activeUser}...
                    </span>
                  </>
                ) : isTranslating ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600" />
                    <span className="text-sm font-medium">Translating...</span>
                  </>
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}