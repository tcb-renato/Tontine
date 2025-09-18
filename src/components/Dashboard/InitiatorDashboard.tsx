// components/dashboard/InitiatorDashboard.tsx
import React from 'react';
import { Plus, Users, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { Tontine } from '../../types';
import { formatCurrency } from '../../utils/dateUtils';

interface DashboardProps {
  tontines: Tontine[];
  onCreateTontine: () => void;
}

export const InitiatorDashboard: React.FC<DashboardProps> = ({ tontines, onCreateTontine }) => {
  const activeTontines = tontines.filter(t => t.status === 'active');
  const draftTontines = tontines.filter(t => t.status === 'draft');
  const completedTontines = tontines.filter(t => t.status === 'completed');
  const totalAmount = activeTontines.reduce((sum, t) => sum + (t.amount * t.participants.length), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Tableau de bord</h1>
      <p className="text-gray-600 mb-8">Vue d’ensemble de vos tontines</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border-2 border-double border-gray-300 shadow-md">
          <CheckCircle className="h-8 w-8 text-green-600" />
          <p className="text-sm text-gray-500 mt-2">Tontines actives</p>
          <p className="text-2xl font-bold">{activeTontines.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border-2 border-double border-gray-300 shadow-md">
          <Clock className="h-8 w-8 text-yellow-600" />
          <p className="text-sm text-gray-500 mt-2">Brouillons</p>
          <p className="text-2xl font-bold">{draftTontines.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border-2 border-double border-gray-300 shadow-md">
          <TrendingUp className="h-8 w-8 text-blue-600" />
          <p className="text-sm text-gray-500 mt-2">Montant total</p>
          <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border-2 border-double border-gray-300 shadow-md">
          <Users className="h-8 w-8 text-purple-600" />
          <p className="text-sm text-gray-500 mt-2">Terminées</p>
          <p className="text-2xl font-bold">{completedTontines.length}</p>
        </div>
      </div>

      <button
        onClick={onCreateTontine}
        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center"
      >
        <Plus className="w-5 h-5 mr-2" />
        Créer une nouvelle tontine
      </button>
    </div>
  );
};
