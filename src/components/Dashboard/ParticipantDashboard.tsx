import React, { useState } from 'react';
import { Calendar, Clock, CreditCard, TrendingUp, AlertCircle, CheckCircle, Plus, Users, DollarSign, Upload, FileText, Eye } from 'lucide-react';
import { Tontine, DashboardStats, Payment } from '../../types';
import { formatCurrency, formatDate, getNextPaymentDate, isPaymentOverdue } from '../../utils/dateUtils';
import { PaymentProofUpload } from '../Payment/PaymentProofUpload';
import { PaymentProofViewer } from '../Payment/PaymentProofViewer';

interface ParticipantDashboardProps {
  tontines: Tontine[];
  currentUserId: string;
  onViewTontine: (tontineId: string) => void;
  onJoinTontine: () => void;
  onMarkPayment: (tontineId: string, participantId: string, proof: any) => void;
}

export const ParticipantDashboard: React.FC<ParticipantDashboardProps> = ({
  tontines,
  currentUserId,
  onViewTontine,
  onJoinTontine,
  onMarkPayment
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showProofViewer, setShowProofViewer] = useState(false);
  const [uploadingPayment, setUploadingPayment] = useState<{
    tontineId: string;
    participantId: string;
    amount: number;
  } | null>(null);

  const myTontines = tontines.filter(t => 
    t.participants.some(p => p.userId === currentUserId)
  );

  const activeTontines = myTontines.filter(t => t.status === 'active');
  const completedTontines = myTontines.filter(t => t.status === 'completed');
  const suspendedTontines = myTontines.filter(t => t.status === 'suspended');
  const totalMonthlyAmount = activeTontines.reduce((sum, t) => sum + t.amount, 0);
  
  // Calculate upcoming payments
  const upcomingPayments = activeTontines.map(tontine => {
    const nextPaymentDate = getNextPaymentDate(tontine.startDate, tontine.frequency, tontine.customDays, tontine.currentCycle, tontine.paymentDay);
    const myParticipation = tontine.participants.find(p => p.userId === currentUserId);
    const currentPayment = myParticipation?.paymentHistory.find(p => p.cycle === tontine.currentCycle);
    
    return {
      tontine,
      dueDate: nextPaymentDate,
      isOverdue: isPaymentOverdue(nextPaymentDate),
      payment: currentPayment,
      myPosition: myParticipation?.position || 0,
      participantId: myParticipation?.id || ''
    };
  }).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  const overduePayments = upcomingPayments.filter(p => p.isOverdue && (!p.payment || p.payment.status === 'pending'));
  const pendingValidations = upcomingPayments.filter(p => p.payment?.status === 'participant_paid');
  const confirmedPayments = upcomingPayments.filter(p => p.payment?.status === 'confirmed');

  // Recent activity
  const recentActivity = [
    ...activeTontines.slice(0, 3).map(t => {
      const myParticipation = t.participants.find(p => p.userId === currentUserId);
      return {
        id: t.id,
        type: 'active',
        title: `${t.name} - Position #${myParticipation?.position}`,
        description: `Cycle ${t.currentCycle} en cours`,
        time: formatDate(t.updatedAt),
        color: 'text-green-600'
      };
    }),
    ...pendingValidations.slice(0, 2).map(p => ({
      id: p.tontine.id,
      type: 'pending',
      title: `${p.tontine.name} - Paiement en attente`,
      description: 'En attente de validation',
      time: formatDate(new Date()),
      color: 'text-yellow-600'
    }))
  ].slice(0, 5);

  const handleUploadPayment = (tontineId: string, participantId: string, amount: number) => {
    setUploadingPayment({ tontineId, participantId, amount });
    setShowUploadModal(true);
  };

  const handleUploadComplete = (proof: any) => {
    if (uploadingPayment) {
      onMarkPayment(uploadingPayment.tontineId, uploadingPayment.participantId, proof);
      setShowUploadModal(false);
      setUploadingPayment(null);
    }
  };

  const handleViewPaymentProof = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowProofViewer(true);
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-700 bg-green-100 border-green-200';
      case 'participant_paid': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'rejected': return 'text-red-700 bg-red-100 border-red-200';
      case 'overdue': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Payé confirmé';
      case 'participant_paid': return 'En attente de validation';
      case 'rejected': return 'Paiement rejeté';
      case 'overdue': return 'En retard';
      default: return 'Non payé';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon tableau de bord</h1>
        <p className="text-gray-600">Suivez vos participations et gérez vos paiements</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-solid border-green-200 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Mes Tontines</p>
              <p className="text-3xl font-bold text-gray-900">{myTontines.length}</p>
              <p className="text-xs text-green-600 mt-1">Participations</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CreditCard className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-solid border-blue-200 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Actives</p>
              <p className="text-3xl font-bold text-gray-900">{activeTontines.length}</p>
              <p className="text-xs text-blue-600 mt-1">En cours</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-solid border-purple-200 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Montant Total</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalMonthlyAmount)}</p>
              <p className="text-xs text-purple-600 mt-1">Par cycle</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-solid border-red-200 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">En Retard</p>
              <p className="text-3xl font-bold text-gray-900">{overduePayments.length}</p>
              <p className="text-xs text-red-600 mt-1">Paiements</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              {overduePayments.length > 0 ? (
                <AlertCircle className="h-8 w-8 text-red-600" />
              ) : (
                <CheckCircle className="h-8 w-8 text-green-600" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Payments Alert */}
      {overduePayments.length > 0 && (
        <div className="bg-red-50 border-2 border-solid border-red-200 rounded-xl p-6 mb-8">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-red-600 mt-1 mr-3" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                {overduePayments.length} paiement{overduePayments.length > 1 ? 's' : ''} en retard
              </h3>
              <div className="space-y-2">
                {overduePayments.map(payment => (
                  <div key={payment.tontine.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{payment.tontine.name}</p>
                      <p className="text-xs text-gray-600">
                        {formatCurrency(payment.tontine.amount)} • Échéance: {formatDate(payment.dueDate)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleUploadPayment(payment.tontine.id, payment.participantId, payment.tontine.amount)}
                      className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      Payer maintenant
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={onJoinTontine}
            className="flex items-center justify-center p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Rejoindre une tontine
          </button>
          
          <button
            onClick={() => {
              const nextPayment = upcomingPayments.find(p => !p.payment || p.payment.status === 'pending');
              if (nextPayment) {
                handleUploadPayment(nextPayment.tontine.id, nextPayment.participantId, nextPayment.tontine.amount);
              }
            }}
            disabled={!upcomingPayments.some(p => !p.payment || p.payment.status === 'pending')}
            className="flex items-center justify-center p-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200"
          >
            <Upload className="h-5 w-5 mr-2" />
            Télécharger justificatif
          </button>
          
          <button
            onClick={() => myTontines.length > 0 && onViewTontine(myTontines[0].id)}
            disabled={myTontines.length === 0}
            className="flex items-center justify-center p-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200"
          >
            <Users className="h-5 w-5 mr-2" />
            Voir détails
          </button>
        </div>
      </div>

      {/* Upcoming Payments */}
      {upcomingPayments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm mb-8 border-2 border-solid border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Mes Paiements</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {upcomingPayments.slice(0, 5).map((payment, index) => {
              const status = payment.payment?.status || 'pending';
              const isOverdue = payment.isOverdue && status === 'pending';
              
              return (
                <div key={`${payment.tontine.id}-${index}`} className={`px-6 py-4 ${
                  isOverdue ? 'bg-red-50 border-l-4 border-red-400' : 
                  status === 'participant_paid' ? 'bg-yellow-50 border-l-4 border-yellow-400' :
                  status === 'confirmed' ? 'bg-green-50 border-l-4 border-green-400' : ''
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900">{payment.tontine.name}</h4>
                      <p className="text-sm text-gray-500">
                        Cycle {payment.tontine.currentCycle} • Position #{payment.myPosition} • {formatCurrency(payment.tontine.amount)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Échéance: {formatDate(payment.dueDate)} • {payment.tontine.type === 'savings' ? 'Tontine épargne' : 'Tontine traditionnelle'}
                      </p>
                    </div>
                    <div className="text-right flex items-center space-x-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPaymentStatusColor(isOverdue ? 'overdue' : status)}`}>
                        {isOverdue && <AlertCircle className="h-3 w-3 mr-1" />}
                        {status === 'participant_paid' && <Clock className="h-3 w-3 mr-1" />}
                        {status === 'confirmed' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {getPaymentStatusText(isOverdue ? 'overdue' : status)}
                      </span>
                      
                      {status === 'pending' && (
                        <button
                          onClick={() => handleUploadPayment(payment.tontine.id, payment.participantId, payment.tontine.amount)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1 px-3 rounded-lg transition-colors duration-200"
                        >
                          J'ai payé
                        </button>
                      )}
                      
                      {payment.payment?.paymentProof && (
                        <button
                          onClick={() => handleViewPaymentProof(payment.payment!)}
                          className="text-gray-600 hover:text-gray-700 p-1"
                          title="Voir le justificatif"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
                <button
                  onClick={onJoinTontine}
                  className="mt-4 text-green-600 hover:text-green-700 font-medium"
                >
                  Rejoindre une tontine
                </button>
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
                <span className="text-sm font-medium text-red-600">{overduePayments.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">En attente</span>
                <span className="text-sm font-medium text-yellow-600">{pendingValidations.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Confirmés</span>
                <span className="text-sm font-medium text-green-600">{confirmedPayments.length}</span>
              </div>
            </div>
          </div>

          {activeTontines.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-solid border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mes positions</h3>
              <div className="space-y-3">
                {activeTontines.slice(0, 3).map((tontine) => {
                  const myParticipation = tontine.participants.find(p => p.userId === currentUserId);
                  const isMyTurn = myParticipation?.position === tontine.currentCycle;
                  
                  return (
                    <div key={tontine.id} className={`p-3 rounded-lg border ${
                      isMyTurn ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <p className="text-sm font-medium text-gray-900">{tontine.name}</p>
                      <p className="text-xs text-gray-500">
                        Position #{myParticipation?.position} • {isMyTurn ? 'Votre tour!' : `Cycle ${tontine.currentCycle}`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* My Tontines */}
      <div className="mt-8 bg-white rounded-xl shadow-sm overflow-hidden border-2 border-solid border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Mes Participations</h3>
        </div>

        {myTontines.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune participation</h3>
            <p className="text-gray-500 text-sm mb-6">Rejoignez une tontine avec un code d'invitation ou un lien</p>
            <button
              onClick={onJoinTontine}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Rejoindre une tontine
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {myTontines.map((tontine) => {
              const myParticipation = tontine.participants.find(p => p.userId === currentUserId);
              const nextPaymentDate = getNextPaymentDate(tontine.startDate, tontine.frequency, tontine.customDays, tontine.currentCycle, tontine.paymentDay);
              const isMyTurn = myParticipation?.position === tontine.currentCycle;
              
              return (
                <div key={tontine.id} className="px-6 py-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-3">
                        <h4 className="text-lg font-semibold text-gray-900 truncate">
                          {tontine.name}
                        </h4>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                          tontine.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : 
                          tontine.status === 'completed' ? 'bg-blue-100 text-blue-800 border-blue-200' : 
                          tontine.status === 'suspended' ? 'bg-red-100 text-red-800 border-red-200' :
                          'bg-gray-100 text-gray-800 border-gray-200'
                        }`}>
                          {tontine.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {tontine.status === 'suspended' && <AlertCircle className="h-3 w-3 mr-1" />}
                          <span>
                            {tontine.status === 'active' ? 'Active' : 
                             tontine.status === 'completed' ? 'Terminée' : 
                             tontine.status === 'suspended' ? 'Suspendue' : tontine.status}
                          </span>
                        </span>
                        {isMyTurn && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Votre tour!
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{tontine.description}</p>
                      <div className="flex flex-wrap items-center text-sm text-gray-500 space-x-6">
                        <span className="font-medium">{formatCurrency(tontine.amount)} / cycle</span>
                        <span>Position: #{myParticipation?.position}</span>
                        <span>Type: {tontine.type === 'savings' ? 'Épargne' : 'Traditionnelle'}</span>
                        {tontine.status === 'active' && (
                          <span>Prochain: {formatDate(nextPaymentDate)}</span>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-6">
                      <button
                        onClick={() => onViewTontine(tontine.id)}
                        className="w-full sm:w-auto bg-green-100 hover:bg-green-200 text-green-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        Voir Détails
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Upload Modal */}
      {showUploadModal && uploadingPayment && (
        <PaymentProofUpload
          paymentId={`${uploadingPayment.tontineId}-${uploadingPayment.participantId}-${Date.now()}`}
          expectedAmount={uploadingPayment.amount}
          onUploadComplete={handleUploadComplete}
          onCancel={() => {
            setShowUploadModal(false);
            setUploadingPayment(null);
          }}
        />
      )}

      {/* Payment Proof Viewer */}
      {showProofViewer && selectedPayment && (
        <PaymentProofViewer
          payment={selectedPayment}
          onClose={() => {
            setShowProofViewer(false);
            setSelectedPayment(null);
          }}
          canValidate={false}
        />
      )}
    </div>
  );
};