import React from 'react';
import { Plus, Users, TrendingUp, Clock, CheckCircle, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { Tontine } from '../../types';
import { formatCurrency, formatDate } from '../../utils/dateUtils';

interface InitiatorDashboardProps {
  tontines: Tontine[];
  onCreateTontine: () => void;
  onViewTontine: (tontineId: string) => void;
  onEditTontine: (tontineId: string) => void;
  onDeleteTontine: (tontineId: string) => void;
}

export const InitiatorDashboard: React.FC<InitiatorDashboardProps> = ({
  tontines,
  onCreateTontine,
  onViewTontine,
  onEditTontine,
  onDeleteTontine
}) => {
  const activeTontines = tontines.filter(t => t.status === 'active');
  const draftTontines = tontines.filter(t => t.status === 'draft');
  const completedTontines = tontines.filter(t => t.status === 'completed');
  const totalAmount = activeTontines.reduce((sum, t) => sum + (t.amount * t.participants.length), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'draft': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'paused': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de bord</h1>
        <p className="text-gray-600">Gérez vos tontines et suivez les paiements</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border-2 border-double border-gray-300 shadow-md transition-all duration-300 hover:scale-105">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tontines Actives</p>
              <p className="text-2xl font-bold text-gray-900">{activeTontines.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border-2 border-double border-gray-300 shadow-md transition-all duration-300 hover:scale-105">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Brouillons</p>
              <p className="text-2xl font-bold text-gray-900">{draftTontines.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border-2 border-double border-gray-300 shadow-md transition-all duration-300 hover:scale-105">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Montant Total</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border-2 border-double border-gray-300 shadow-md transition-all duration-300 hover:scale-105">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Terminées</p>
              <p className="text-2xl font-bold text-gray-900">{completedTontines.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mb-8">
        <button
          onClick={onCreateTontine}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-xl shadow-sm transition-all duration-200 flex items-center hover:shadow-md"
        >
          <Plus className="h-5 w-5 mr-2" />
          Créer une nouvelle tontine
        </button>
      </div>

      {/* Tontines List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Mes Tontines</h3>
        </div>

        {tontines.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune tontine créée</h3>
            <p className="text-gray-500 text-sm mb-6">
              Commencez par créer votre première tontine pour gérer vos épargnes collectives
            </p>
            <button
              onClick={onCreateTontine}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Créer une tontine
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {tontines.map((tontine) => (
              <div key={tontine.id} className="px-6 py-6 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-3">
                      <h4 className="text-lg font-semibold text-gray-900 truncate">{tontine.name}</h4>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          tontine.status
                        )}`}
                      >
                        {getStatusIcon(tontine.status)}
                        <span className="ml-1 capitalize">
                          {tontine.status === 'draft' ? 'Brouillon' : tontine.status}
                        </span>
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{tontine.description}</p>
                    <div className="flex flex-wrap items-center text-sm text-gray-500 space-x-6">
                      <span className="flex items-center">
                        <span className="font-medium">{formatCurrency(tontine.amount)}</span>
                        <span className="ml-1">/ participant</span>
                      </span>
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {tontine.participants.length}/{tontine.maxParticipants}
                      </span>
                      <span>Début: {formatDate(tontine.startDate)}</span>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0 sm:ml-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <button
                      onClick={() => onViewTontine(tontine.id)}
                      className="w-full sm:w-auto bg-green-100 hover:bg-green-200 text-green-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      Gérer
                    </button>
                    {tontine.status === 'draft' && (
                      <>
                        <button
                          onClick={() => onEditTontine(tontine.id)}
                          className="w-full sm:w-auto bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Modifier
                        </button>
                        <button
                          onClick={() => onDeleteTontine(tontine.id)}
                          className="w-full sm:w-auto bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Supprimer
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
