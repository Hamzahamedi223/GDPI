import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  BarChart2, 
  AlertTriangle, 
  Clock, 
  Building2, 
  Wrench,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const SystemChat = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [showCategories, setShowCategories] = useState(true);

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Configure axios defaults
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  const categories = {
    equipment: {
      title: "Équipements",
      icon: <BarChart2 size={16} />,
      questions: [
    "Quel département a le moins d'équipements ?",
    "Combien d'équipements y a-t-il dans chaque département ?",
    "Quel est l'état des équipements ?",
    "Quel département a le plus d'équipements ?",
    "Quels sont les équipements qui nécessitent une maintenance ?",
    "Quels sont les équipements les plus récents ?",
    "Quels sont les équipements qui arrivent en fin de vie ?"
      ]
    },
    maintenance: {
      title: "Maintenance",
      icon: <Wrench size={16} />,
      questions: [
        "Quels sont les équipements en maintenance actuellement ?",
        "Quelles sont les maintenances préventives à venir ?",
        "Quel est le coût total des maintenances ce mois-ci ?",
        "Quels sont les équipements qui nécessitent une maintenance urgente ?"
      ]
    },
    departments: {
      title: "Départements",
      icon: <Building2 size={16} />,
      questions: [
        "Quels sont les départements les plus actifs ?",
        "Quelle est la répartition des équipements par département ?"
      ]
    },
    incidents: {
      title: "Incidents",
      icon: <AlertTriangle size={16} />,
      questions: [
        "Quels sont les incidents récents ?",
        "Quel est le taux de résolution des incidents ?",
        "Quels sont les types d'incidents les plus fréquents ?"
      ]
    }
  };

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = {
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await axios.post(`${backendUrl}/api/chat/query`, 
        { query: message },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const botMessage = {
        type: 'bot',
        content: response.data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting response:', error);
      const errorMessage = {
        type: 'bot',
        content: error.message === 'No authentication token found' 
          ? 'Veuillez vous connecter pour utiliser le chat.'
          : 'Désolé, une erreur est survenue lors du traitement de votre demande. Veuillez réessayer.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setMessages([{
      type: 'bot',
      content: 'Bonjour ! Je suis votre assistant intelligent. Je peux vous aider avec :\n\n' +
        '• Informations sur les équipements et leur état\n' +
        '• Suivi des maintenances et incidents\n' +
        '• Statistiques par département\n\n' +
        'Sélectionnez une catégorie ci-dessous pour commencer.',
      timestamp: new Date()
    }]);
  }, []);

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg">
      {/* Chat header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-blue-600">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Assistant Informatique</h2>
            <button
            onClick={() => setShowCategories(!showCategories)}
            className="text-white hover:text-blue-100 transition-colors"
            >
            {showCategories ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
        </div>
        </div>

        {/* Messages container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
          <motion.div
              key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
              className={`flex ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="whitespace-pre-line">{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
          </motion.div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

      {/* Categories and Questions section */}
      <div className="border-t bg-gray-50">
        {showCategories && (
          <div className="p-4 border-b">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(categories).map(([key, category]) => (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveCategory(key)}
                  className={`flex items-center gap-2 p-3 rounded-lg shadow-sm transition-all duration-200 ${
                    activeCategory === key
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  {category.icon}
                  <span className="text-sm font-medium">{category.title}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Questions grid */}
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeCategory && categories[activeCategory].questions.map((question, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSendMessage(question)}
                className="flex items-center gap-2 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              >
                <MessageCircle size={16} className="flex-shrink-0" />
                <span className="line-clamp-2">{question}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemChat; 