import React, { useState, useEffect } from 'react';
import { Plus, Users, TrendingUp, Clock, CheckCircle, AlertCircle, Edit, Trash2, Play, Pause, Calendar, DollarSign, Eye, Bell, FileText } from 'lucide-react';
import { Tontine, DashboardStats, Payment, Notification } from '../../types';
import { formatCurrency, formatDate } from '../../utils/dateUtils';
import { PaymentProofViewer } from '../Payment/PaymentProofViewer';

interface InitiatorDashboardProps {
  tontines: Tontine[];
  notifications: Notification[];
  onCreateTontine: () => void;
  onViewTontine: (tontineId: string) => void;
  onEditTontine: (tontineId: string) => void;
  onDeleteTontine: (tontineId: string) => void;
  onValidatePayment: (paymentId: string) => void;
  onRejectPayment: (paymentId: string, reason: string) => void;
}

export const InitiatorDashboard: React.FC<InitiatorDashboardProps> = ({
  tontines,
  notifications,
  onCreateTontine,
  onViewTontine,
  onEditTontine,
  onDeleteTontine,
  onValidatePayment,
  onRejectPayment
}) => {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showProofViewer, setShowProofViewer] = useState(false);

  const activeTontines = tontines.filter(t => t.status === 'active');
  const draftTontines = tontines.filter(t => t.status === 'draft');
  const suspendedTontines = tontines.filter(t => t.status === 'suspended');
  const completedTontines = tontines.filter(t => t.status === 'completed');
  
  // Calculate dashboard stats
  const totalAmount = activeTontines.reduce((sum, t) => sum + (t.amount * t.participants.length), 0);
  const pendingPayments = activeTontines.reduce((sum, t) => {
    return sum + t.participants.filter(p => 
      p.paymentHistory.some(payment => payment.status === 'participant_paid')
    ).length;
  }, 0);
  
  const upcomingPayouts = activeTontines.filter(t => {
    const currentBeneficiary = t.participants.find(p => p.position === t.currentCycle);
    return currentBeneficiary && !currentBeneficiary.hasReceivedPayout;
  }).length;

  const overduePayments = activeTontines.reduce((sum, t) => {
    return sum + t.participants.filter(p => 
      p.paymentHistory.some(payment => payment.status === 'overdue')
    ).length;
  }, 0);

  const unreadNotifications = notifications.filter(n => !n.read).length;

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'draft': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'suspended': return <AlertCircle className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
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

  // Get pending payment notifications
  const pendingPaymentNotifications = notifications
    .filter(n => n.type === 'payment_received' && !n.read)
    .slice(0, 5);

  const recentActivity = [
    ...activeTontines.slice(0, 3).map(t => ({
      id: t.id,
      type: 'active',
      title: `${t.name} - Cycle ${t.currentCycle}`,
      description: `${t.participants.length} participants actifs`,
      time: formatDate(t.updatedAt),
      color: 'text-green-600'
    })),
    ...draftTontines.slice(0, 2).map(t => ({
      id: t.id,
      type: 'draft',
      title: `${t.name} - En préparation`,
      description: `${t.participants.length}/${t.unlimitedParticipants ? '∞' : t.maxParticipants} participants`,
      time: formatDate(t.createdAt),
      color: 'text-yellow-600'
    }))
  ].slice(0, 5);

  const handleViewPaymentProof = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowProofViewer(true);
  };

  const handleValidatePayment = () => {
    if (selectedPayment) {
      onValidatePayment(selectedPayment.id);
      setShowProofViewer(false);
      setSelectedPayment(null);
    }
  };

  const handleRejectPayment = (reason: string) => {
    if (selectedPayment) {
      onRejectPayment(selectedPayment.id, reason);
      setShowProofViewer(false);
      setSelectedPayment(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de bord Initiatrice</h1>
        <p className="text-gray-600">Vue d'ensemble de vos tontines et activités récentes</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border-2 border-solid border-green-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Tontines Actives</p>
              <p className="text-3xl font-bold text-gray-900">{activeTontines.length}</p>
              <p className="text-xs text-green-600 mt-1">En cours</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border-2 border-solid border-yellow-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Paiements en attente</p>
              <p className="text-3xl font-bold text-gray-900">{pendingPayments}</p>
              <p className="text-xs text-yellow-600 mt-1">À valider</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border-2 border-solid border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Prochains ramassages</p>
              <p className="text-3xl font-bold text-gray-900">{upcomingPayouts}</p>
              <p className="text-xs text-blue-600 mt-1">À distribuer</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border-2 border-solid border-purple-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Montant Total</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
              <p className="text-xs text-purple-600 mt-1">En circulation</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Pending Payments Alert */}
      {pendingPaymentNotifications.length > 0 && (
        <div className="bg-yellow-50 border-2 border-solid border-yellow-200 rounded-xl p-6 mb-8">
          <div className="flex items-start">
            <Bell className="h-6 w-6 text-yellow-600 mt-1 mr-3" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                {pendingPaymentNotifications.length} paiement{pendingPaymentNotifications.length > 1 ? 's' : ''} en attente de validation
              </h3>
              <div className="space-y-2">
                {pendingPaymentNotifications.map(notification => (
                  <div key={notification.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="text-xs text-gray-600">{notification.message}</p>
                    </div>
                    <button
                      onClick={() => notification.actionUrl && onViewTontine(notification.tontineId!)}
                      className="text-yellow-600 hover:text-yellow-700 font-medium text-sm"
                    >
                      Voir
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border-2 border-solid border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={onCreateTontine}
            className="flex items-center justify-center p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Créer une tontine
          </button>
          
          <button
            onClick={() => draftTontines.length > 0 && onViewTontine(draftTontines[0].id)}
            disabled={draftTontines.length === 0}
            className="flex items-center justify-center p-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200"
          >
            <Edit className="h-5 w-5 mr-2" />
            Modifier brouillon
          </button>
          
          <button
            onClick={() => draftTontines.length > 0 && onViewTontine(draftTontines[0].id)}
            disabled={draftTontines.length === 0}
            className="flex items-center justify-center p-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200"
          >
            <Play className="h-5 w-5 mr-2" />
            Démarrer tontine
          </button>
          
          <button
            onClick={() => activeTontines.length > 0 && onViewTontine(activeTontines[0].id)}
            disabled={activeTontines.length === 0}
            className="flex items-center justify-center p-4 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200"
          >
            <Users className="h-5 w-5 mr-2" />
            Inviter participants
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border-2 border-solid border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Activité récente</h3>
            </div>
            
            {recentActivity.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Aucune activité récente</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentActivity.map((activity, index) => (
                  <div key={`${activity.id}-${index}`} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${activity.color.replace('text-', 'bg-')}`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-500">{activity.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-solid border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Brouillons</span>
                <span className="text-sm font-medium text-gray-900">{draftTontines.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Actives</span>
                <span className="text-sm font-medium text-green-600">{activeTontines.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Suspendues</span>
                <span className="text-sm font-medium text-red-600">{suspendedTontines.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Terminées</span>
                <span className="text-sm font-medium text-blue-600">{completedTontines.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">En retard</span>
                <span className="text-sm font-medium text-red-600">{overduePayments}</span>
              </div>
            </div>
          </div>

          {activeTontines.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-solid border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tontines actives</h3>
              <div className="space-y-3">
                {activeTontines.slice(0, 3).map((tontine) => (
                  <div key={tontine.id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-gray-900">{tontine.name}</p>
                    <p className="text-xs text-gray-500">
                      Cycle {tontine.currentCycle} • {tontine.participants.length} participants
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {unreadNotifications > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-solid border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Non lues</span>
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {unreadNotifications}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tontines List */}
      <div className="mt-8 bg-white rounded-xl shadow-sm overflow-hidden border-2 border-solid border-gray-200">
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
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(tontine.status)}`}>
                        {getStatusIcon(tontine.status)}
                        <span className="ml-1">{getStatusText(tontine.status)}</span>
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        tontine.type === 'savings' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {tontine.type === 'savings' ? 'Épargne' : 'Traditionnelle'}
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
                        {tontine.participants.length}/{tontine.unlimitedParticipants ? '∞' : tontine.maxParticipants}
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

      {/* Payment Proof Viewer */}
      {showProofViewer && selectedPayment && (
        <PaymentProofViewer
          payment={selectedPayment}
          onClose={() => {
            setShowProofViewer(false);
            setSelectedPayment(null);
          }}
          onValidate={handleValidatePayment}
          onReject={handleRejectPayment}
          canValidate={true}
        />
      )}
    </div>
  );
};