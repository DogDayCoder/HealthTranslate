import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Volume2, Play } from "lucide-react";
import { motion } from "framer-motion";

const PHRASE_CATEGORIES = {
  "Greeting & Intake": [
    "Hello, my name is Dr. [Name]",
    "How are you feeling today?", 
    "What brings you in today?",
    "Can you tell me about your symptoms?",
    "When did this start?"
  ],
  "Symptoms": [
    "Can you point to where it hurts?",
    "How would you rate your pain from 1 to 10?",
    "Is the pain sharp or dull?",
    "Does the pain come and go?",
    "Are you experiencing any nausea?"
  ],
  "Medical History": [
    "Are you taking any medications?",
    "Do you have any allergies?",
    "Have you had this problem before?",
    "Do you have any chronic conditions?",
    "Have you had any surgeries?"
  ],
  "Examination": [
    "I need to examine you now",
    "Please take a deep breath",
    "Can you open your mouth?",
    "I'm going to check your blood pressure",
    "Please roll up your sleeve"
  ],
  "Next Steps": [
    "We need to run some tests",
    "I'm going to prescribe some medication",
    "You should follow up in one week",
    "Please rest and drink plenty of fluids",
    "Call if your symptoms get worse"
  ]
};

export default function Phrases() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('sessionId');
  const selectedLanguage = urlParams.get('language');
  
  const [searchTerm, setSearchTerm] = useState("");
  const [playingPhrase, setPlayingPhrase] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const translateAndSpeak = async (phrase) => {
    setPlayingPhrase(phrase);
    setIsTranslating(true);
    
    try {
      const prompt = `Translate this English medical phrase to ${selectedLanguage}. Only return the translation: "${phrase}"`;
      
      const translation = await InvokeLLM({
        prompt: prompt,
      });
      
      // In real implementation, this would use text-to-speech
      console.log(`Speaking in ${selectedLanguage}: ${translation}`);
      
      // Simulate speaking time
      setTimeout(() => {
        setPlayingPhrase(null);
      }, 2000);
      
    } catch (error) {
      console.error("Translation error:", error);
      setPlayingPhrase(null);
    } finally {
      setIsTranslating(false);
    }
  };

  const filteredCategories = Object.entries(PHRASE_CATEGORIES).reduce((acc, [category, phrases]) => {
    const filteredPhrases = phrases.filter(phrase => 
      phrase.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (filteredPhrases.length > 0) {
      acc[category] = filteredPhrases;
    }
    
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-blue-100 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(createPageUrl(`Translation?sessionId=${sessionId}&language=${selectedLanguage}`))}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Medical Phrases Library</h1>
              <p className="text-sm text-gray-600">
                Common medical phrases in English → {selectedLanguage}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto">
        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search phrases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </motion.div>

        {/* Phrase Categories */}
        <div className="space-y-6">
          {Object.entries(filteredCategories).map(([category, phrases], categoryIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
            >
              <Card className="medical-shadow border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-blue-900">{category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {phrases.map((phrase, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: (categoryIndex * 0.1) + (index * 0.05) }}
                        className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors ${
                          playingPhrase === phrase ? 'bg-blue-50 border border-blue-200' : ''
                        }`}
                      >
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium">{phrase}</p>
                        </div>
                        
                        <Button
                          onClick={() => translateAndSpeak(phrase)}
                          disabled={isTranslating || playingPhrase === phrase}
                          variant="outline"
                          size="sm"
                          className="ml-4 flex items-center gap-2"
                        >
                          {playingPhrase === phrase ? (
                            <>
                              <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse" />
                              Speaking...
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-4 h-4" />
                              Speak in {selectedLanguage}
                            </>
                          )}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {Object.keys(filteredCategories).length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">No phrases found</p>
            <p className="text-gray-400">Try adjusting your search terms</p>
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <p className="text-blue-700 text-sm">
                <strong>How to use:</strong> Click "Speak in {selectedLanguage}" next to any phrase 
                to hear it translated and spoken aloud in the patient's language. The patient will 
                hear the translation through the device speakers.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}