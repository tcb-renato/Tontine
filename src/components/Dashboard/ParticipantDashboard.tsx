import React from 'react';
import { Calendar, Clock, CreditCard, TrendingUp, AlertCircle, CheckCircle, Plus } from 'lucide-react';
import { Tontine } from '../../types';
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
  const totalMonthlyAmount = activeTontines.reduce((sum, t) => sum + t.amount, 0);
  
  // Calculate upcoming payments
  const upcomingPayments = activeTontines.map(tontine => {
    const nextPaymentDate = getNextPaymentDate(tontine.startDate, tontine.frequency, tontine.customDays, tontine.currentCycle);
    return {
      tontine,
      dueDate: nextPaymentDate,
      isOverdue: isPaymentOverdue(nextPaymentDate)
    };
  }).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  const overduePayments = upcomingPayments.filter(p => p.isOverdue);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon tableau de bord</h1>
        <p className="text-gray-600">Suivez vos participations et paiements</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CreditCard className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Mes Tontines</p>
              <p className="text-2xl font-bold text-gray-900">{myTontines.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Actives</p>
              <p className="text-2xl font-bold text-gray-900">{activeTontines.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Montant Total</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalMonthlyAmount)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {overduePayments.length > 0 ? (
                <AlertCircle className="h-8 w-8 text-red-600" />
              ) : (
                <CheckCircle className="h-8 w-8 text-green-600" />
              )}
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">En Retard</p>
              <p className="text-2xl font-bold text-gray-900">{overduePayments.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mb-8">
        <button
          onClick={onJoinTontine}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-xl shadow-sm transition-all duration-200 flex items-center hover:shadow-md"
        >
          <Plus className="h-5 w-5 mr-2" />
          Rejoindre une tontine
        </button>
      </div>

      {/* Upcoming Payments */}
      {upcomingPayments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm mb-8 border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Prochains Paiements</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {upcomingPayments.slice(0, 3).map((payment, index) => (
              <div key={payment.tontine.id} className={`px-6 py-4 ${payment.isOverdue ? 'bg-red-50 border-l-4 border-red-400' : ''}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{payment.tontine.name}</h4>
                    <p className="text-sm text-gray-500">
                      Cycle {payment.tontine.currentCycle} • {formatCurrency(payment.tontine.amount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      payment.isOverdue ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {formatDate(payment.dueDate)}
                    </p>
                    {payment.isOverdue && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        En retard
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Tontines */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
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
              const nextPaymentDate = getNextPaymentDate(tontine.startDate, tontine.frequency, tontine.customDays, tontine.currentCycle);
              
              return (
                <div key={tontine.id} className="px-6 py-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-3">
                        <h4 className="text-lg font-semibold text-gray-900 truncate">
                          {tontine.name}
                        </h4>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          tontine.status === 'active' ? 'bg-green-100 text-green-800' : 
                          tontine.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {tontine.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                          <span className="capitalize">
                            {tontine.status === 'active' ? 'Active' : 
                             tontine.status === 'completed' ? 'Terminée' : tontine.status}
                          </span>
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{tontine.description}</p>
                      <div className="flex flex-wrap items-center text-sm text-gray-500 space-x-6">
                        <span className="font-medium">{formatCurrency(tontine.amount)} / cycle</span>
                        <span>Position: #{myParticipation?.position}</span>
                        <span>Prochain: {formatDate(nextPaymentDate)}</span>
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