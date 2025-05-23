import React from 'react';
import SystemChat from '@/components/SystemChat';

const SupportChat = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Assistant d'Information Système</h2>
          <p className="text-gray-600 mt-2">
            Posez-moi des questions sur les statistiques des équipements, les informations des départements ou l'état du système.
          </p>
        </div>
        <SystemChat />
      </div>
    </div>
  );
};

export default SupportChat; 