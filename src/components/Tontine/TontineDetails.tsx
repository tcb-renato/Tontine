import React, { useState } from 'react';
import { ArrowLeft, Users, Calendar, DollarSign, CheckCircle, X, Copy, Play, Pause, Mail, Plus, Trash2, Edit } from 'lucide-react';
import { Tontine, Participant } from '../../types';
import { formatCurrency, formatDate, getNextPaymentDate, shuffleArray } from '../../utils/dateUtils';

interface TontineDetailsProps {
  tontine: Tontine;
  onBack: () => void;
  onStartTontine: (tontineId: string) => void;
  onValidatePayment: (tontineId: string, participantId: string) => void;
  onAddParticipant: (tontineId: string, email: string) => void;
  onRemoveParticipant: (tontineId: string, participantId: string) => void;
  onEditTontine: (tontineId: string) => void;
  onDeleteTontine: (tontineId: string) => void;
  currentUser: any;
}

export const TontineDetails: React.FC<TontineDetailsProps> = ({
  tontine,
  onBack,
  onStartTontine,
  onValidatePayment,
  onAddParticipant,
  onRemoveParticipant,
  onEditTontine,
  onDeleteTontine,
  currentUser
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [newParticipantEmail, setNewParticipantEmail] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isInitiator = currentUser.id === tontine.initiatorId;
  const nextPaymentDate = getNextPaymentDate(tontine.startDate, tontine.frequency, tontine.customDays, tontine.currentCycle);
  const currentBeneficiary = tontine.participants.find(p => p.position === tontine.currentCycle);

  const copyInviteCode = () => {
    navigator.clipboard.writeText(tontine.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getFrequencyText = () => {
    switch (tontine.frequency) {
      case 'daily': return 'Quotidien';
      case 'weekly': return 'Hebdomadaire';
      case 'monthly': return 'Mensuel';
      case 'custom': return `Tous les ${tontine.customDays} jours`;
      default: return tontine.frequency;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (newParticipantEmail.trim()) {
      onAddParticipant(tontine.id, newParticipantEmail.trim());
      setNewParticipantEmail('');
      setShowAddParticipant(false);
    }
  };

  const handleStartTontine = () => {
    if (tontine.orderType === 'random') {
      // Shuffle participants for random order
      const shuffledParticipants = shuffleArray([...tontine.participants]);
      shuffledParticipants.forEach((participant, index) => {
        participant.position = index + 1;
      });
    }
    onStartTontine(tontine.id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{tontine.name}</h1>
            <p className="text-gray-600">{tontine.description}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(tontine.status)}`}>
          {tontine.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tontine Info */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Informations générales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Montant par cycle</p>
                  <p className="font-medium">{formatCurrency(tontine.amount)}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Fréquence</p>
                  <p className="font-medium">{getFrequencyText()}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Participants</p>
                  <p className="font-medium">{tontine.participants.length}/{tontine.maxParticipants}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Date de début</p>
                  <p className="font-medium">{formatDate(tontine.startDate)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Participants List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Participants ({tontine.participants.length}/{tontine.maxParticipants})</h3>
              {isInitiator && tontine.status === 'draft' && (
                <button
                  onClick={() => setShowAddParticipant(true)}
                  className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </button>
              )}
            </div>

            {/* Add Participant Form */}
            {showAddParticipant && (
              <div className="px-6 py-4 bg-green-50 border-b border-gray-200">
                <form onSubmit={handleAddParticipant} className="flex space-x-3">
                  <input
                    type="email"
                    value={newParticipantEmail}
                    onChange={(e) => setNewParticipantEmail(e.target.value)}
                    placeholder="email@exemple.com"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    <Mail className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddParticipant(false);
                      setNewParticipantEmail('');
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </form>
              </div>
            )}

            <div className="overflow-x-auto">
              {tontine.participants.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Aucun participant pour le moment</p>
                  {isInitiator && tontine.status === 'draft' && (
                    <button
                      onClick={() => setShowAddParticipant(true)}
                      className="mt-4 text-green-600 hover:text-green-700 font-medium"
                    >
                      Ajouter le premier participant
                    </button>
                  )}
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nom
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status Cycle {tontine.currentCycle || 1}
                      </th>
                      {isInitiator && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tontine.participants.map((participant) => (
                      <tr key={participant.id} className={participant.position === tontine.currentCycle ? 'bg-green-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900">#{participant.position}</span>
                            {participant.position === tontine.currentCycle && (
                              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                Tour actuel
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{participant.name}</div>
                            <div className="text-sm text-gray-500">{participant.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Payé
                          </span>
                        </td>
                        {isInitiator && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            {tontine.status === 'active' && (
                              <button
                                onClick={() => onValidatePayment(tontine.id, participant.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Valider
                              </button>
                            )}
                            {tontine.status === 'draft' && (
                              <button
                                onClick={() => onRemoveParticipant(tontine.id, participant.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Invite Code */}
          {isInitiator && tontine.status === 'draft' && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Code d'invitation</h3>
              <div className="flex items-center space-x-2">
                <code className="flex-1 bg-gray-100 px-3 py-2 rounded-md text-sm font-mono">
                  {tontine.inviteCode}
                </code>
                <button
                  onClick={copyInviteCode}
                  className="p-2 text-gray-500 hover:text-gray-700"
                  title="Copier le code"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              {copiedCode && (
                <p className="text-sm text-green-600 mt-2">Code copié !</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Partagez ce code pour inviter des participants
              </p>
            </div>
          )}

          {/* Current Status */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Status actuel</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Cycle en cours</p>
                <p className="font-medium">{tontine.currentCycle}/{tontine.participants.length}</p>
              </div>
              {currentBeneficiary && (
                <div>
                  <p className="text-sm text-gray-500">Bénéficiaire actuel</p>
                  <p className="font-medium">{currentBeneficiary.name}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Prochain paiement</p>
                <p className="font-medium">{formatDate(nextPaymentDate)}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {isInitiator && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                {tontine.status === 'draft' && (
                  <>
                    <button
                      onClick={handleStartTontine}
                      disabled={tontine.participants.length < 2}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Démarrer la tontine
                    </button>
                    <button
                      onClick={() => onEditTontine(tontine.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </button>
                  </>
                )}
                {tontine.status === 'active' && (
                  <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center">
                    <Pause className="h-4 w-4 mr-2" />
                    Suspendre
                  </button>
                )}
              </div>
              {tontine.status === 'draft' && tontine.participants.length < 2 && (
                <p className="text-xs text-gray-500 mt-2">
                  Minimum 2 participants requis pour démarrer
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer la tontine "{tontine.name}" ? Cette action est irréversible.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  onDeleteTontine(tontine.id);
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};