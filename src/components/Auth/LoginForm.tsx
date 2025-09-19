import React, { useState } from 'react';
import { User, LogIn, UserPlus } from 'lucide-react';
import { User as UserType } from '../../types';

interface LoginFormProps {
  onLogin: (user: UserType) => void;
  users: UserType[];
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, users }) => {
  const [code, setCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    type: 'participant' as 'initiator' | 'participant'
  });
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.code === code.toUpperCase());
    
    if (user) {
      onLogin(user);
    } else {
      setError('Code invalide');
    }
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.phone || !newUser.address) {
      setError('Tous les champs sont requis');
      return;
    }

    const user: UserType = {
      id: Date.now().toString(),
      ...newUser,
      code: Math.random().toString(36).substring(2, 10).toUpperCase()
    };

    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
              <User className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Tontine Pro</h1>
            <p className="text-gray-600 mt-2">Plateforme de gestion de tontines avec clarté et sécurité</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {!isCreating ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  Code de connexion
                </label>
                <input
                  type="text"
                  id="code"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setError('');
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-center font-mono text-lg"
                  placeholder="Entrez votre code"
                  maxLength={10}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                <LogIn className="h-5 w-5 mr-2" />
                Se connecter
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsCreating(true)}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Créer un compte
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCreateAccount} className="space-y-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Votre prénom"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Votre nom"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={newUser.phone}
                  onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="+237 6XX XXX XXX"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse de résidence
                </label>
                <input
                  type="text"
                  id="address"
                  value={newUser.address}
                  onChange={(e) => setNewUser(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Votre adresse complète"
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Type de compte
                </label>
                <select
                  id="type"
                  value={newUser.type}
                  onChange={(e) => setNewUser(prev => ({ ...prev, type: e.target.value as 'initiator' | 'participant' }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="participant">Participant</option>
                  <option value="initiator">Initiateur</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Créer le compte
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-gray-600 hover:text-gray-700 font-medium"
                >
                  Retour à la connexion
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};