import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SystemChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const predefinedQuestions = [
    "Quel département a le moins d'équipements ?",
    "Combien d'équipements y a-t-il dans chaque département ?",
    "Quel est l'état des équipements ?",
    "Quel département a le plus d'équipements ?",
    "Quels sont les équipements qui nécessitent une maintenance ?",
    "Quel est le taux d'utilisation des équipements ?",
    "Quels sont les équipements les plus récents ?",
    "Quels sont les équipements qui arrivent en fin de vie ?"
  ];

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = {
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      console.log('Sending request to:', `${backendUrl}/api/chat/query`);
      
      const response = await axios.post(`${backendUrl}/api/chat/query`, {
        query: message
      });

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
        content: 'Désolé, une erreur est survenue lors du traitement de votre demande. Veuillez réessayer.',
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
      content: 'Bonjour ! Je peux vous aider avec les informations suivantes :\n\n' +
        '• Nombre d\'équipements par département\n' +
        '• État des équipements\n' +
        '• Départements avec le plus/moins d\'équipements\n' +
        '• Équipements nécessitant une maintenance\n\n' +
        'Que souhaitez-vous savoir ?',
      timestamp: new Date()
    }]);
  }, []);

  return (
    <div className="flex h-[600px] bg-white rounded-lg shadow-lg">
      {/* Question selector sidebar */}
      <div className="w-64 border-r bg-gray-50 p-4 flex flex-col">
        <h3 className="text-sm font-semibold text-gray-600 mb-3">Questions suggérées</h3>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {predefinedQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleSendMessage(question)}
              className="w-full text-left p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors text-sm"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-blue-600">
          <h2 className="text-xl font-semibold text-white">Assistant Informatique</h2>
        </div>

        {/* Messages container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
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
            </div>
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

        {/* Message input */}
        <form onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }} className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Envoyer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SystemChat; 