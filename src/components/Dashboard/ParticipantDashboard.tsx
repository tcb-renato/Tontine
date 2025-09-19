import React from 'react';
import { Calendar, Clock, CreditCard, TrendingUp, AlertCircle, CheckCircle, Plus, Users, DollarSign } from 'lucide-react';
import { Tontine, DashboardStats } from '../../types';
import { formatCurrency, formatDate, getNextPaymentDate, isPaymentOverdue } from '../../utils/dateUtils';

interface ParticipantDashboardProps {
  tontines: Tontine[];
  currentUserId: string;
  onViewTontine: (tontineId: string) => void;
  onJoinTontine: () => void;
}

export const ParticipantDashboard: React.FC<ParticipantDashboardProps> = ({
  tontines,
  currentUserId,
  onViewTontine,
  onJoinTontine
}) => {
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
    const pendingPayment = myParticipation?.paymentHistory.find(p => p.cycle === tontine.currentCycle && p.status === 'pending');
    
    return {
      tontine,
      dueDate: nextPaymentDate,
      isOverdue: isPaymentOverdue(nextPaymentDate),
      hasPendingPayment: !!pendingPayment,
      myPosition: myParticipation?.position || 0
    };
  }).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  const overduePayments = upcomingPayments.filter(p => p.isOverdue && !p.hasPendingPayment);
  const pendingValidations = upcomingPayments.filter(p => p.hasPendingPayment);

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
            onClick={() => activeTontines.length > 0 && onViewTontine(activeTontines[0].id)}
            disabled={activeTontines.length === 0}
            className="flex items-center justify-center p-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200"
          >
            <CreditCard className="h-5 w-5 mr-2" />
            Marquer paiement
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
            <h3 className="text-lg font-semibold text-gray-900">Prochains Paiements</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {upcomingPayments.slice(0, 5).map((payment, index) => (
              <div key={`${payment.tontine.id}-${index}`} className={`px-6 py-4 ${
                payment.isOverdue ? 'bg-red-50 border-l-4 border-red-400' : 
                payment.hasPendingPayment ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900">{payment.tontine.name}</h4>
                    <p className="text-sm text-gray-500">
                      Cycle {payment.tontine.currentCycle} • Position #{payment.myPosition} • {formatCurrency(payment.tontine.amount)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {payment.tontine.type === 'savings' ? 'Tontine épargne' : 'Tontine traditionnelle'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      payment.isOverdue ? 'text-red-600' : 
                      payment.hasPendingPayment ? 'text-yellow-600' : 'text-gray-900'
                    }`}>
                      {formatDate(payment.dueDate)}
                    </p>
                    {payment.isOverdue && !payment.hasPendingPayment && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        En retard
                      </span>
                    )}
                    {payment.hasPendingPayment && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="h-3 w-3 mr-1" />
                        En attente
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
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
    </div>
  );
};