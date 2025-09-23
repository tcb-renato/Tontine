import React, { useState, useEffect } from 'react';
import { Header } from './components/Layout/Header';
import { LoginForm } from './components/Auth/LoginForm';
import { InitiatorDashboard } from './components/Dashboard/InitiatorDashboard';
import { ParticipantDashboard } from './components/Dashboard/ParticipantDashboard';
import { TontineList } from "./components/Tontine/TontineList";
import { CreateTontine } from './components/Tontine/CreateTontine';
import { TontineDetails } from './components/Tontine/TontineDetails';
import { JoinTontine } from './components/Tontine/JoinTontine';
import { PaymentScreenshotUpload } from './components/Payment/PaymentScreenshotUpload';
import { Tontine, User, AuthState, Participant, Payment, PaymentAudit, Notification } from './types';
import { generateUserCode, generateInviteLink } from './utils/dateUtils';
import { 
  tontineService, 
  userService, 
  paymentService, 
  notificationService,
  authService
} from './services/localStorageService';

function App() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true
  });
  const [tontines, setTontines] = useState<Tontine[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTontineId, setSelectedTontineId] = useState<string | null>(null);
  const [editingTontineId, setEditingTontineId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingPayment, setUploadingPayment] = useState<{
    tontineId: string;
    participantId: string;
    amount: number;
  } | null>(null);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if user is already authenticated
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setAuthState({
            isAuthenticated: true,
            user: currentUser,
            loading: false
          });
          
          // Load user's data
          await loadUserData(currentUser);
        } else {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    loadData();
  }, []);

  const loadUserData = async (user: User) => {
    try {
      let userTontines: Tontine[] = [];
      
      if (user.type === 'initiator') {
        userTontines = await tontineService.getTontinesByInitiator(user.id);
      } else {
        userTontines = await tontineService.getTontinesByParticipant(user.id);
      }
      
      setTontines(userTontines);
      
      const userNotifications = await notificationService.getUserNotifications(user.id);
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleLogin = async (user: User) => {
    try {
      authService.saveAuthState(user);
      setAuthState({
        isAuthenticated: true,
        user,
        loading: false
      });
      
      await loadUserData(user);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false
      });
      setActiveTab('dashboard');
      setSelectedTontineId(null);
      setEditingTontineId(null);
      setTontines([]);
      setNotifications([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const handleCreateTontine = () => {
    setEditingTontineId(null);
    setActiveTab('create-tontine');
  };

  const handleEditTontine = (tontineId: string) => {
    setEditingTontineId(tontineId);
    setActiveTab('create-tontine');
  };

  const handleSaveTontine = async (tontineData: Partial<Tontine>) => {
    try {
      if (editingTontineId) {
        // Update existing tontine
        await tontineService.updateTontine(editingTontineId, {
          ...tontineData,
          updatedAt: new Date()
        });
        
        // Reload tontines
        if (authState.user) {
          await loadUserData(authState.user);
        }
      } else {
        // Create new tontine
        const newTontine = await tontineService.createTontine({
          ...tontineData,
          initiatorId: authState.user!.id
        });
        
        setTontines(prev => [...prev, newTontine]);
      }
      
      setEditingTontineId(null);
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Error saving tontine:', error);
    }
  };

  const handleDeleteTontine = async (tontineId: string) => {
    try {
      await tontineService.deleteTontine(tontineId);
      setTontines(prev => prev.filter(t => t.id !== tontineId));
      
      if (selectedTontineId === tontineId) {
        setSelectedTontineId(null);
        setActiveTab('dashboard');
      }
    } catch (error) {
      console.error('Error deleting tontine:', error);
    }
  };

  const handleViewTontine = (tontineId: string) => {
    setSelectedTontineId(tontineId);
    setActiveTab('tontine-details');
  };

  const handleBackToDashboard = () => {
    setSelectedTontineId(null);
    setEditingTontineId(null);
    setActiveTab('dashboard');
  };

  const handleStartTontine = async (tontineId: string) => {
    try {
      await tontineService.updateTontine(tontineId, {
        status: 'active',
        currentCycle: 1,
        updatedAt: new Date()
      });
      
      // Reload tontines
      if (authState.user) {
        await loadUserData(authState.user);
      }
    } catch (error) {
      console.error('Error starting tontine:', error);
    }
  };

  const handleSuspendTontine = async (tontineId: string) => {
    try {
      const tontine = tontines.find(t => t.id === tontineId);
      const newStatus = tontine?.status === 'suspended' ? 'active' : 'suspended';
      
      await tontineService.updateTontine(tontineId, {
        status: newStatus,
        updatedAt: new Date()
      });
      
      // Reload tontines
      if (authState.user) {
        await loadUserData(authState.user);
      }
    } catch (error) {
      console.error('Error suspending tontine:', error);
    }
  };

  const handleValidatePayment = async (tontineId: string, participantId: string) => {
    try {
      const tontine = tontines.find(t => t.id === tontineId);
      if (tontine) {
        await paymentService.validatePaymentByInitiator(tontineId, participantId, tontine.currentCycle);
        
        // Send notification to participant
        const participant = tontine.participants.find(p => p.id === participantId);
        if (participant) {
          await notificationService.createNotification({
            userId: participant.userId,
            type: 'payment_validated',
            title: 'Paiement validé',
            message: 'Votre paiement a été validé par l\'initiateur',
            tontineId
          });
        }
        
        // Reload tontines
        if (authState.user) {
          await loadUserData(authState.user);
        }
      }
    } catch (error) {
      console.error('Error validating payment:', error);
    }
  };

  const handleRejectPayment = async (paymentId: string, reason: string) => {
    try {
      // Find the payment and reject it
      const tontine = tontines.find(t => 
        t.participants.some(p => 
          p.paymentHistory.some(payment => payment.id === paymentId)
        )
      );
      
      if (tontine) {
        const participant = tontine.participants.find(p => 
          p.paymentHistory.some(payment => payment.id === paymentId)
        );
        
        if (participant) {
          const payment = participant.paymentHistory.find(p => p.id === paymentId);
          if (payment) {
            await paymentService.rejectPayment(tontine.id, participant.id, payment.cycle, reason);
            
            // Send notification to participant
            await notificationService.createNotification({
              userId: participant.userId,
              type: 'payment_rejected',
              title: 'Paiement rejeté',
              message: `Votre paiement a été rejeté: ${reason}`,
              tontineId: tontine.id
            });
            
            // Reload tontines
            if (authState.user) {
              await loadUserData(authState.user);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
    }
  };

  const handleMarkPayment = (tontineId: string, participantId: string, amount: number) => {
    setUploadingPayment({ tontineId, participantId, amount });
    setShowUploadModal(true);
  };

  const handleUploadComplete = async (screenshotUrl: string) => {
    try {
      if (uploadingPayment) {
        // Send notification to initiator
        const tontine = tontines.find(t => t.id === uploadingPayment.tontineId);
        if (tontine) {
          await notificationService.createNotification({
            userId: tontine.initiatorId,
            type: 'payment_received',
            title: 'Nouveau paiement reçu',
            message: `${authState.user!.firstName} ${authState.user!.lastName} a effectué un paiement`,
            tontineId: tontine.id,
            actionUrl: `/tontine/${tontine.id}`
          });
        }
        
        // Reload tontines
        if (authState.user) {
          await loadUserData(authState.user);
        }
      }
      
      setShowUploadModal(false);
      setUploadingPayment(null);
    } catch (error) {
      console.error('Error completing upload:', error);
    }
  };

  const handleAddParticipant = async (tontineId: string, participantData: Partial<Participant>) => {
    try {
      await tontineService.addParticipantToTontine(tontineId, participantData);
      
      // Reload tontines
      if (authState.user) {
        await loadUserData(authState.user);
      }
    } catch (error) {
      console.error('Error adding participant:', error);
    }
  };

  const handleRemoveParticipant = async (tontineId: string, participantId: string) => {
    try {
      await tontineService.removeParticipantFromTontine(tontineId, participantId);
      
      // Reload tontines
      if (authState.user) {
        await loadUserData(authState.user);
      }
    } catch (error) {
      console.error('Error removing participant:', error);
    }
  };

  const handleReorderParticipants = async (tontineId: string, participants: Participant[]) => {
    try {
      await tontineService.updateParticipantOrder(tontineId, participants);
      
      // Reload tontines
      if (authState.user) {
        await loadUserData(authState.user);
      }
    } catch (error) {
      console.error('Error reordering participants:', error);
    }
  };

  const handleJoinTontine = () => {
    setActiveTab('join-tontine');
  };

  const handleJoinTontineSubmit = async (tontineId: string, participantData: any) => {
    try {
      // Reload tontines to get the updated data
      if (authState.user) {
        await loadUserData(authState.user);
      }
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Error joining tontine:', error);
    }
  };

  if (authState.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const selectedTontine = selectedTontineId ? tontines.find(t => t.id === selectedTontineId) : null;
  const editingTontine = editingTontineId ? tontines.find(t => t.id === editingTontineId) : undefined;

  const renderContent = () => {
    switch (activeTab) {
      case 'create-tontine':
        return (
          <CreateTontine
            onBack={handleBackToDashboard}
            onSave={handleSaveTontine}
            editingTontine={editingTontine}
          />
        );
      
      case 'join-tontine':
        return (
          <JoinTontine
            onBack={handleBackToDashboard}
            onJoin={handleJoinTontineSubmit}
            tontines={tontines}
            currentUser={authState.user!}
          />
        );
      
      case 'tontine-details':
        return selectedTontine ? (
          <TontineDetails
            tontine={selectedTontine}
            onBack={handleBackToDashboard}
            onStartTontine={handleStartTontine}
            onSuspendTontine={handleSuspendTontine}
            onValidatePayment={handleValidatePayment}
            onMarkPayment={handleMarkPayment}
            onAddParticipant={handleAddParticipant}
            onRemoveParticipant={handleRemoveParticipant}
            onReorderParticipants={handleReorderParticipants}
            onEditTontine={handleEditTontine}
            onDeleteTontine={handleDeleteTontine}
            currentUser={authState.user!}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Tontine non trouvée</p>
            <button
              onClick={handleBackToDashboard}
              className="mt-4 text-green-600 hover:text-green-700"
            >
              Retour au tableau de bord
            </button>
          </div>
        );

      case 'tontines':
        return (
          <TontineList
            tontines={tontines}
            role={authState.user!.type}
            onView={handleViewTontine}
            onEdit={handleEditTontine}
            onDelete={handleDeleteTontine}
          />
        );

      case 'notifications':
        return (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h1>
            <div className="bg-white rounded-xl shadow-sm border-2 border-solid border-gray-200">
              {notifications.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M9 11h.01M9 8h.01" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune notification</h3>
                  <p className="text-gray-500 text-sm">Vous recevrez ici les notifications concernant vos tontines</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map(notification => (
                    <div key={notification.id} className={`px-6 py-4 ${!notification.read ? 'bg-blue-50' : ''}`}>
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${!notification.read ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(notification.createdAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Mon Profil</h1>
            <div className="bg-white rounded-xl shadow-sm p-8 border-2 border-solid border-gray-200">
              <div className="space-y-6">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-green-600">
                      {authState.user.firstName.charAt(0).toUpperCase()}{authState.user.lastName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{authState.user.firstName} {authState.user.lastName}</h2>
                    <p className="text-gray-500 capitalize">{authState.user.type === 'initiator' ? 'Initiatrice' : 'Participant'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                    <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{authState.user.firstName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                    <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{authState.user.lastName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{authState.user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                    <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{authState.user.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                    <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{authState.user.address}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Code de connexion</label>
                    <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg font-mono">{authState.user.code}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type de compte</label>
                    <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {authState.user.type === 'initiator' ? 'Initiatrice' : 'Participant'}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
                  >
                    Se déconnecter
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return authState.user.type === 'initiator' ? (
          <InitiatorDashboard
            tontines={tontines.filter(t => t.initiatorId === authState.user!.id)}
            notifications={notifications}
            onCreateTontine={handleCreateTontine}
            onViewTontine={handleViewTontine}
            onEditTontine={handleEditTontine}
            onDeleteTontine={handleDeleteTontine}
            onValidatePayment={() => {}}
            onRejectPayment={handleRejectPayment}
          />
        ) : (
          <ParticipantDashboard
            tontines={tontines}
            currentUserId={authState.user.id}
            onViewTontine={handleViewTontine}
            onJoinTontine={handleJoinTontine}
            onMarkPayment={handleMarkPayment}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentUser={authState.user!}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        notificationCount={notifications.filter(n => !n.read).length}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        onLogout={handleLogout}
      />
      
      <main>
        {renderContent()}
      </main>

      {/* Payment Upload Modal */}
      {showUploadModal && uploadingPayment && (
        <PaymentScreenshotUpload
          tontineId={uploadingPayment.tontineId}
          participantId={uploadingPayment.participantId}
          expectedAmount={uploadingPayment.amount}
          onUploadComplete={handleUploadComplete}
          onCancel={() => {
            setShowUploadModal(false);
            setUploadingPayment(null);
          }}
        />
      )}
    </div>
  );
}

export default App;