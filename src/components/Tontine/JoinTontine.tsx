import React, { useState } from 'react';
import { ArrowLeft, Users, Mail, Key } from 'lucide-react';
import { Tontine, User } from '../../types';

interface JoinTontineProps {
  onBack: () => void;
  onJoin: (tontineId: string, method: 'code' | 'email', value: string) => void;
  tontines: Tontine[];
  currentUser: User;
}

export const JoinTontine: React.FC<JoinTontineProps> = ({
  onBack,
  onJoin,
  tontines,
  currentUser
}) => {
  const [method, setMethod] = useState<'code' | 'email'>('code');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (method === 'code') {
      if (!code.trim()) {
        setError('Veuillez entrer un code d\'invitation');
        return;
      }
      
      const tontine = tontines.find(t => t.inviteCode === code.toUpperCase());
      if (!tontine) {
        setError('Code d\'invitation invalide');
        return;
      }

      if (tontine.participants.some(p => p.userId === currentUser.id)) {
        setError('Vous participez déjà à cette tontine');
        return;
      }

      if (tontine.participants.length >= tontine.maxParticipants) {
        setError('Cette tontine est complète');
        return;
      }

      if (tontine.status !== 'draft') {
        setError('Cette tontine a déjà commencé');
        return;
      }

      onJoin(tontine.id, 'code', code);
    } else {
      if (!email.trim()) {
        setError('Veuillez entrer une adresse email');
        return;
      }
      
      // For email method, we'll simulate finding a tontine by initiator email
      const tontine = tontines.find(t => {
        // In a real app, you'd have initiator email stored
        return t.status === 'draft' && t.participants.length < t.maxParticipants;
      });
      
      if (!tontine) {
        setError('Aucune tontine trouvée pour cet email');
        return;
      }

      onJoin(tontine.id, 'email', email);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={onBack}
          className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rejoindre une tontine</h1>
          <p className="text-gray-600">Utilisez un code d'invitation ou une adresse email</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
        {/* Method Selection */}
        <div className="mb-8">
          <div className="flex space-x-4">
            <button
              onClick={() => setMethod('code')}
              className={`flex-1 p-4 rounded-lg border-2 transition-colors duration-200 ${
                method === 'code'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Key className="h-6 w-6 mx-auto mb-2" />
              <p className="font-medium">Code d'invitation</p>
              <p className="text-sm text-gray-500">Entrez le code reçu</p>
            </button>
            <button
              onClick={() => setMethod('email')}
              className={`flex-1 p-4 rounded-lg border-2 transition-colors duration-200 ${
                method === 'email'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Mail className="h-6 w-6 mx-auto mb-2" />
              <p className="font-medium">Email de l'initiateur</p>
              <p className="text-sm text-gray-500">Recherche par email</p>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {method === 'code' ? (
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Code d'invitation
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError('');
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-center font-mono text-lg"
                placeholder="ABC123"
                maxLength={6}
              />
              <p className="mt-2 text-sm text-gray-500">
                Le code d'invitation est fourni par l'initiateur de la tontine
              </p>
            </div>
          ) : (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email de l'initiateur
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="initiateur@email.com"
              />
              <p className="mt-2 text-sm text-gray-500">
                Entrez l'adresse email de la personne qui a créé la tontine
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              <Users className="h-5 w-5 mr-2" />
              Rejoindre la tontine
            </button>
          </div>
        </form>

        {/* Available Tontines Preview */}
        {tontines.filter(t => t.status === 'draft' && t.participants.length < t.maxParticipants).length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tontines disponibles</h3>
            <div className="space-y-3">
              {tontines
                .filter(t => t.status === 'draft' && t.participants.length < t.maxParticipants)
                .slice(0, 3)
                .map(tontine => (
                  <div key={tontine.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{tontine.name}</h4>
                        <p className="text-sm text-gray-500">{tontine.description}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {tontine.participants.length}/{tontine.maxParticipants} participants
                        </p>
                      </div>
                      <span className="text-sm font-medium text-green-600">
                        Code: {tontine.inviteCode}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};