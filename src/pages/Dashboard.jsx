import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Session } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Languages, Play, Clock, Users } from "lucide-react";
import { motion } from "framer-motion";

const SUPPORTED_LANGUAGES = [
  { code: "Polish", name: "Polish", flag: "🇵🇱" },
  { code: "Punjabi", name: "Punjabi", flag: "🇮🇳" },
  { code: "Urdu", name: "Urdu", flag: "🇵🇰" },
  { code: "Romanian", name: "Romanian", flag: "🇷🇴" },
  { code: "Arabic", name: "Arabic", flag: "🇸🇦" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startingSession, setStartingSession] = useState(false);

  useEffect(() => {
    const loadUserAndSessions = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        
        const sessions = await Session.filter(
          { clinician_id: currentUser.id }, 
          '-created_date', 
          5
        );
        setRecentSessions(sessions);
      } catch (error) {
        navigate(createPageUrl("Dashboard"));
      }
      setLoading(false);
    };

    loadUserAndSessions();
  }, [navigate]);

  const handleBeginSession = async () => {
    if (!selectedLanguage) return;
    
    setStartingSession(true);
    
    try {
      const session = await Session.create({
        clinician_id: user.id,
        patient_language: selectedLanguage,
        start_time: new Date().toISOString(),
      });
      
      navigate(createPageUrl(`Translation?sessionId=${session.id}&language=${selectedLanguage}`));
    } catch (error) {
      console.error("Error creating session:", error);
    }
    
    setStartingSession(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, Dr. {user?.clinician_name || user?.full_name}
          </h1>
          <p className="text-gray-600">
            Ready to start a new consultation session?
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Start New Session */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="medical-shadow border-0 h-full">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                    <Languages className="w-5 h-5 text-white" />
                  </div>
                  Start New Consultation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">
                    Select Patient's Language
                  </label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="h-12 border-gray-200">
                      <SelectValue placeholder="Choose a language..." />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{lang.flag}</span>
                            <span>{lang.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleBeginSession}
                  disabled={!selectedLanguage || startingSession}
                  className="w-full h-12 medical-button text-white font-medium text-lg"
                >
                  {startingSession ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Starting Session...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Begin Session
                    </>
                  )}
                </Button>

                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    <strong>How it works:</strong> Once you select a language and begin the session, 
                    you'll access the live translation interface where both you and your patient 
                    can communicate in real-time.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Sessions & Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6"
          >
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="medical-shadow border-0">
                <CardContent className="p-4 text-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{recentSessions.length}</p>
                  <p className="text-sm text-gray-600">Sessions Today</p>
                </CardContent>
              </Card>
              
              <Card className="medical-shadow border-0">
                <CardContent className="p-4 text-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">5</p>
                  <p className="text-sm text-gray-600">Languages Available</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Sessions */}
            <Card className="medical-shadow border-0">
              <CardHeader>
                <CardTitle className="text-lg">Recent Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                {recentSessions.length > 0 ? (
                  <div className="space-y-3">
                    {recentSessions.map((session) => {
                      const language = SUPPORTED_LANGUAGES.find(l => l.code === session.patient_language);
                      return (
                        <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{language?.flag || "🌐"}</span>
                            <div>
                              <p className="font-medium text-gray-900">{session.patient_language}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(session.created_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant={session.session_status === "active" ? "default" : "secondary"}>
                            {session.session_status}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No recent sessions</p>
                    <p className="text-sm text-gray-400">Start your first consultation above</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}