import React from 'react';
import { Tontine } from '../../types';

interface Props {
  tontines: Tontine[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TontineList: React.FC<Props> = ({ tontines, onView, onEdit, onDelete }) => {
  return (
    <div className="max-w-5xl mx-auto py-8">
      <h2 className="text-xl font-bold mb-6">Liste des Tontines</h2>
      <div className="space-y-4">
        {tontines.map((tontine) => (
          <div key={tontine.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">{tontine.name}</h3>
              <p className="text-gray-500 text-sm">{tontine.description}</p>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => onView(tontine.id)} className="text-blue-600 hover:underline">Voir</button>
              <button onClick={() => onEdit(tontine.id)} className="text-yellow-600 hover:underline">Modifier</button>
              <button onClick={() => onDelete(tontine.id)} className="text-red-600 hover:underline">Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
