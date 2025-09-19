import React, { useState } from 'react';
import { ArrowLeft, Users, Calendar, DollarSign, CheckCircle, X, Copy, Play, Pause, Mail, Plus, Trash2, Edit, Share2, MessageCircle, AlertCircle, Clock, GripVertical } from 'lucide-react';
import { Tontine, Participant } from '../../types';
import { formatCurrency, formatDate, getNextPaymentDate, shuffleArray, copyToClipboard, shareViaWhatsApp, shareViaSMS, shareViaEmail, getCollectWindowText } from '../../utils/dateUtils';

interface TontineDetailsProps {
  tontine: Tontine;
  onBack: () => void;
  onStartTontine: (tontineId: string) => void;
  onSuspendTontine: (tontineId: string) => void;
  onValidatePayment: (tontineId: string, participantId: string) => void;
  onMarkPayment: (tontineId: string, participantId: string) => void;
  onAddParticipant: (tontineId: string, participantData: Partial<Participant>) => void;
  onRemoveParticipant: (tontineId: string, participantId: string) => void;
  onReorderParticipants: (tontineId: string, participants: Participant[]) => void;
  onEditTontine: (tontineId: string) => void;
  onDeleteTontine: (tontineId: string) => void;
  currentUser: any;
}

export const TontineDetails: React.FC<TontineDetailsProps> = ({
  tontine,
  onBack,
  onStartTontine,
  onSuspendTontine,
  onValidatePayment,
  onMarkPayment,
  onAddParticipant,
  onRemoveParticipant,
  onReorderParticipants,
  onEditTontine,
  onDeleteTontine,
  currentUser
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  
  const [newParticipant, setNewParticipant] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  });

  const isInitiator = currentUser.id === tontine.initiatorId;
  const isParticipant = tontine.participants.some(p => p.userId === currentUser.id);
  const myParticipation = tontine.participants.find(p => p.userId === currentUser.id);
  const nextPaymentDate = getNextPaymentDate(tontine.startDate, tontine.frequency, tontine.customDays, tontine.currentCycle, tontine.paymentDay);
  const currentBeneficiary = tontine.participants.find(p => p.position === tontine.currentCycle);

  const copyInviteCode = async () => {
    const success = await copyToClipboard(tontine.inviteCode);
    if (success) {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const copyInviteLink = async () => {
    const success = await copyToClipboard(tontine.inviteLink);
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const shareInvite = (method: 'whatsapp' | 'sms' | 'email') => {
    const message = `Rejoignez ma tontine "${tontine.name}"!\n\nCode: ${tontine.inviteCode}`;
    
    switch (method) {
      case 'whatsapp':
        shareViaWhatsApp(message, tontine.inviteLink);
        break;
      case 'sms':
        shareViaSMS(message, tontine.inviteLink);
        break;
      case 'email':
        shareViaEmail(`Invitation - ${tontine.name}`, message, tontine.inviteLink);
        break;
    }
    setShowShareMenu(false);
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
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
      case 'paused': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'draft': return 'Brouillon';
      case 'completed': return 'Terminée';
      case 'suspended': return 'Suspendue';
      case 'paused': return 'En pause';
      default: return status;
    }
  };

  const getPaymentStatus = (participant: Participant) => {
    const currentPayment = participant.paymentHistory.find(p => p.cycle === tontine.currentCycle);
    if (!currentPayment) return 'pending';
    return currentPayment.status;
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'participant_paid': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Payé confirmé';
      case 'participant_paid': return 'En attente';
      case 'pending': return 'Non payé';
      case 'overdue': return 'En retard';
      default: return status;
    }
  };

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (newParticipant.firstName && newParticipant.lastName && newParticipant.email && newParticipant.phone && newParticipant.address) {
      onAddParticipant(tontine.id, {
        ...newParticipant,
        position: tontine.participants.length + 1,
        addedBy: 'manual',
        addedAt: new Date()
      });
      setNewParticipant({ firstName: '', lastName: '', email: '', phone: '', address: '' });
      setShowAddParticipant(false);
    }
  };

  const handleStartTontine = () => {
    if (tontine.orderType === 'random') {
      const shuffledParticipants = shuffleArray([...tontine.participants]);
      shuffledParticipants.forEach((participant, index) => {
        participant.position = index + 1;
      });
      onReorderParticipants(tontine.id, shuffledParticipants);
    }
    onStartTontine(tontine.id);
  };

  const handleSuspendTontine = () => {
    onSuspendTontine(tontine.id);
    setShowSuspendConfirm(false);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedItem === null) return;

    const newParticipants = [...tontine.participants];
    const draggedParticipant = newParticipants[draggedItem];
    
    newParticipants.splice(draggedItem, 1);
    newParticipants.splice(dropIndex, 0, draggedParticipant);
    
    // Update positions
    newParticipants.forEach((participant, index) => {
      participant.position = index + 1;
    });

    onReorderParticipants(tontine.id, newParticipants);
    setDraggedItem(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
      {/* Suspended Banner */}
      {tontine.status === 'suspended' && (
        <div className="mb-6 bg-red-100 border-2 border-solid border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span className="font-medium">Tontine suspendue</span>
            <span className="ml-2">- Les paiements sont bloqués</span>
          </div>
        </div>
      )}

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
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(tontine.status)}`}>
            {getStatusText(tontine.status)}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            tontine.type === 'savings' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {tontine.type === 'savings' ? 'Épargne' : 'Traditionnelle'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tontine Info */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-solid border-gray-200">
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
                  <p className="font-medium">
                    {tontine.participants.length}
                    {!tontine.unlimitedParticipants && `/${tontine.maxParticipants}`}
                    {tontine.unlimitedParticipants && ' (illimité)'}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Date de début</p>
                  <p className="font-medium">{formatDate(tontine.startDate)}</p>
                </div>
              </div>
              {tontine.endDate && (
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Date de fin</p>
                    <p className="font-medium">{formatDate(tontine.endDate)}</p>
                  </div>
                </div>
              )}
              {tontine.collectWindow && (
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Tranche de ramassage</p>
                    <p className="font-medium">{getCollectWindowText(tontine.collectWindow)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Participants List */}
          <div className="bg-white rounded-xl shadow-sm border-2 border-solid border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Participants ({tontine.participants.length}
                {!tontine.unlimitedParticipants && `/${tontine.maxParticipants}`})
              </h3>
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
                <form onSubmit={handleAddParticipant} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={newParticipant.firstName}
                      onChange={(e) => setNewParticipant(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Prénom"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                    <input
                      type="text"
                      value={newParticipant.lastName}
                      onChange={(e) => setNewParticipant(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Nom"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                    <input
                      type="email"
                      value={newParticipant.email}
                      onChange={(e) => setNewParticipant(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Email"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                    <input
                      type="tel"
                      value={newParticipant.phone}
                      onChange={(e) => setNewParticipant(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Téléphone"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  <input
                    type="text"
                    value={newParticipant.address}
                    onChange={(e) => setNewParticipant(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Adresse de résidence"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                      <Plus className="h-4 w-4 mr-1 inline" />
                      Ajouter
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddParticipant(false);
                        setNewParticipant({ firstName: '', lastName: '', email: '', phone: '', address: '' });
                      }}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                      <X className="h-4 w-4 mr-1 inline" />
                      Annuler
                    </button>
                  </div>
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
                      {isInitiator && tontine.status === 'draft' && tontine.type === 'traditional' && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ordre
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {tontine.type === 'traditional' ? 'Position' : 'Participant'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nom
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      {tontine.status === 'active' && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status Cycle {tontine.currentCycle}
                        </th>
                      )}
                      {isInitiator && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tontine.participants.map((participant, index) => {
                      const paymentStatus = getPaymentStatus(participant);
                      const isCurrentBeneficiary = tontine.type === 'traditional' && participant.position === tontine.currentCycle;
                      
                      return (
                        <tr 
                          key={participant.id} 
                          className={`${isCurrentBeneficiary ? 'bg-green-50' : ''} ${draggedItem === index ? 'opacity-50' : ''}`}
                          draggable={isInitiator && tontine.status === 'draft' && tontine.type === 'traditional'}
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, index)}
                        >
                          {isInitiator && tontine.status === 'draft' && tontine.type === 'traditional' && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {tontine.type === 'traditional' ? (
                                <>
                                  <span className="text-sm font-medium text-gray-900">#{participant.position}</span>
                                  {isCurrentBeneficiary && (
                                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                      Tour actuel
                                    </span>
                                  )}
                                </>
                              ) : (
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-green-600">
                                    {participant.firstName.charAt(0)}{participant.lastName.charAt(0)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {participant.firstName} {participant.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{participant.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{participant.phone}</div>
                            <div className="text-sm text-gray-500">{participant.address}</div>
                          </td>
                          {tontine.status === 'active' && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(paymentStatus)}`}>
                                {paymentStatus === 'confirmed' && <CheckCircle className="h-3 w-3 mr-1" />}
                                {paymentStatus === 'participant_paid' && <Clock className="h-3 w-3 mr-1" />}
                                {paymentStatus === 'overdue' && <AlertCircle className="h-3 w-3 mr-1" />}
                                {getPaymentStatusText(paymentStatus)}
                              </span>
                            </td>
                          )}
                          {isInitiator && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              {tontine.status === 'active' && paymentStatus === 'participant_paid' && (
                                <button
                                  onClick={() => onValidatePayment(tontine.id, participant.id)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Valider paiement
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
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Participant Payment Action */}
            {isParticipant && tontine.status === 'active' && myParticipation && (
              <div className="px-6 py-4 bg-blue-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Cycle {tontine.currentCycle}</p>
                    <p className="text-sm text-gray-500">Montant: {formatCurrency(tontine.amount)}</p>
                  </div>
                  {getPaymentStatus(myParticipation) === 'pending' && (
                    <button
                      onClick={() => onMarkPayment(tontine.id, myParticipation.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      J'ai payé
                    </button>
                  )}
                  {getPaymentStatus(myParticipation) === 'participant_paid' && (
                    <span className="text-yellow-600 font-medium">En attente de validation</span>
                  )}
                  {getPaymentStatus(myParticipation) === 'confirmed' && (
                    <span className="text-green-600 font-medium">Paiement confirmé</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Invite Code & Link */}
          {isInitiator && tontine.status === 'draft' && (
            <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-solid border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Invitation</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Code d'invitation</label>
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
                  {copiedCode && <p className="text-sm text-green-600 mt-1">Code copié !</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lien d'invitation</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={tontine.inviteLink}
                      readOnly
                      className="flex-1 bg-gray-100 px-3 py-2 rounded-md text-sm"
                    />
                    <button
                      onClick={copyInviteLink}
                      className="p-2 text-gray-500 hover:text-gray-700"
                      title="Copier le lien"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  {copiedLink && <p className="text-sm text-green-600 mt-1">Lien copié !</p>}
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Partager
                  </button>
                  
                  {showShareMenu && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <button
                        onClick={() => shareInvite('whatsapp')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
                      >
                        <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
                        WhatsApp
                      </button>
                      <button
                        onClick={() => shareInvite('sms')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
                      >
                        <MessageCircle className="h-4 w-4 mr-2 text-blue-600" />
                        SMS
                      </button>
                      <button
                        onClick={() => shareInvite('email')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
                      >
                        <Mail className="h-4 w-4 mr-2 text-gray-600" />
                        Email
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Current Status */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-solid border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Status actuel</h3>
            <div className="space-y-3">
              {tontine.type === 'traditional' && (
                <div>
                  <p className="text-sm text-gray-500">Cycle en cours</p>
                  <p className="font-medium">{tontine.currentCycle}/{tontine.participants.length}</p>
                </div>
              )}
              {currentBeneficiary && tontine.type === 'traditional' && (
                <div>
                  <p className="text-sm text-gray-500">Bénéficiaire actuel</p>
                  <p className="font-medium">{currentBeneficiary.firstName} {currentBeneficiary.lastName}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">
                  {tontine.type === 'savings' ? 'Prochaine collecte' : 'Prochain paiement'}
                </p>
                <p className="font-medium">{formatDate(nextPaymentDate)}</p>
              </div>
              {tontine.type === 'savings' && tontine.collectWindow && (
                <div>
                  <p className="text-sm text-gray-500">Fenêtre de collecte</p>
                  <p className="font-medium">{getCollectWindowText(tontine.collectWindow)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {isInitiator && (
            <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-solid border-gray-200">
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
                  <button
                    onClick={() => setShowSuspendConfirm(true)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Suspendre la tontine
                  </button>
                )}
                {tontine.status === 'suspended' && (
                  <button
                    onClick={() => onStartTontine(tontine.id)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Réactiver la tontine
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

      {/* Suspend Confirmation Modal */}
      {showSuspendConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Suspendre la tontine</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir suspendre la tontine "{tontine.name}" ? Les paiements seront bloqués et les participants seront notifiés.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSuspendConfirm(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Annuler
              </button>
              <button
                onClick={handleSuspendTontine}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Suspendre
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};