import React from 'react';
import { Plus, Users, Edit, TrendingUp } from 'lucide-react';

interface InitiatorDashboardProps {
  onCreateTontine: () => void;
  onViewTontine: () => void;
  onEditTontine: () => void;
  onInviteParticipants: () => void;
}

export const InitiatorDashboard: React.FC<InitiatorDashboardProps> = ({
  onCreateTontine,
  onViewTontine,
  onEditTontine,
  onInviteParticipants
}) => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600">Choisissez une opération</p>
      </div>

      {/* Big Action Buttons (style ANIP) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        <button
          onClick={onCreateTontine}
          className="flex flex-col items-center justify-center p-8 rounded-2xl shadow-md bg-green-600 text-white hover:bg-green-700 transition-all"
        >
          <Plus className="h-8 w-8 mb-3" />
          <span className="text-lg font-semibold">Créer une tontine</span>
        </button>

        <button
          onClick={onEditTontine}
          className="flex flex-col items-center justify-center p-8 rounded-2xl shadow-md bg-yellow-500 text-white hover:bg-yellow-600 transition-all"
        >
          <Edit className="h-8 w-8 mb-3" />
          <span className="text-lg font-semibold">Modifier une tontine</span>
        </button>

        <button
          onClick={onViewTontine}
          className="flex flex-col items-center justify-center p-8 rounded-2xl shadow-md bg-red-500 text-white hover:bg-red-600 transition-all"
        >
          <TrendingUp className="h-8 w-8 mb-3" />
          <span className="text-lg font-semibold">Voir mes tontines</span>
        </button>

        <button
          onClick={onInviteParticipants}
          className="flex flex-col items-center justify-center p-8 rounded-2xl shadow-md bg-blue-600 text-white hover:bg-blue-700 transition-all"
        >
          <Users className="h-8 w-8 mb-3" />
          <span className="text-lg font-semibold">Inviter des participants</span>
        </button>

      </div>
    </div>
  );
};
