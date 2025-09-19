import React from 'react';
import { Tontine } from '../../types';
import { Eye, Edit, Trash2 } from 'lucide-react';

interface Props {
  tontines: Tontine[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TontineList: React.FC<Props> = ({ tontines, onView, onEdit, onDelete }) => {
  return (
    <div className="max-w-5xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">Liste des Tontines</h2>
      <div className="space-y-4">
        {tontines.map((tontine) => (
          <div
            key={tontine.id}
            className="bg-white p-4 rounded-xl shadow-md flex justify-between items-center hover:shadow-lg transition"
          >
            <div>
              <h3 className="text-lg font-semibold">{tontine.name}</h3>
              <p className="text-gray-500 text-sm">{tontine.description}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onView(tontine.id)}
                className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                <Eye size={16} /> Voir
              </button>
              <button
                onClick={() => onEdit(tontine.id)}
                className="flex items-center gap-1 px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
              >
                <Edit size={16} /> Modifier
              </button>
              <button
                onClick={() => onDelete(tontine.id)}
                className="flex items-center gap-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                <Trash2 size={16} /> Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
