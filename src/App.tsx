import React, { useState, useEffect } from 'react';
import { Header } from './components/Layout/Header';
import { LoginForm } from './components/Auth/LoginForm';
import { InitiatorDashboard } from './components/Dashboard/InitiatorDashboard';
import { ParticipantDashboard } from './components/Dashboard/ParticipantDashboard';
import { TontineList } from "./pages/tontine/TontineList";
import { CreateTontine } from './components/Tontine/CreateTontine';
import { TontineDetails } from './components/Tontine/TontineDetails';
import { JoinTontine } from './components/Tontine/JoinTontine';
import { Tontine, User, AuthState, Participant, Payment, PaymentAudit } from './types';
import { generateUserCode, generateInviteLink } from './utils/dateUtils';

function App() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null
  });
  const [users, setUsers] = useState<User[]>([]);
  const [tontines, setTontines] = useState<Tontine[]>([]);
  const [notifications] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTontineId, setSelectedTontineId] = useState<string | null>(null);
  const [editingTontineId, setEditingTontineId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedUsers = localStorage.getItem('tontine_users');
    const savedTontines = localStorage.getItem('tontine_tontines');
    const savedAuth = localStorage.getItem('tontine_auth');

    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
    if (savedTontines) {
      const parsedTontines = JSON.parse(savedTontines).map((t: any) => ({
        ...t,
        startDate: new Date(t.startDate),
        endDate: t.endDate ? new Date(t.endDate) : undefined,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt),
        participants: t.participants.map((p: any) => ({
          ...p,
          addedAt: new Date(p.addedAt),
          paymentHistory: p.paymentHistory?.map((payment: any) => ({
            ...payment,
            dueDate: new Date(payment.dueDate),
            paidDate: payment.paidDate ? new Date(payment.paidDate) : undefined,
            participantValidatedAt: payment.participantValidatedAt ? new Date(payment.participantValidatedAt) : undefined,
            initiatorValidatedAt: payment.initiatorValidatedAt ? new Date(payment.initiatorValidatedAt) : undefined,
            auditLog: payment.auditLog?.map((log: any) => ({
              ...log,
              timestamp: new Date(log.timestamp)
            })) || []
          })) || []
        }))
      }));
      setTontines(parsedTontines);
    }
    if (savedAuth) {
      setAuthState(JSON.parse(savedAuth));
    }
  }, []);

  // Save data to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('tontine_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('tontine_tontines', JSON.stringify(tontines));
  }, [tontines]);

  useEffect(() => {
    localStorage.setItem('tontine_auth', JSON.stringify(authState));
  }, [authState]);

  const handleLogin = (user: User) => {
    // If it's a new user, add to users list
    if (!users.find(u => u.id === user.id)) {
      setUsers(prev => [...prev, user]);
    }
    
    setAuthState({
      isAuthenticated: true,
      user
    });
  };

  const handleLogout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null
    });
    setActiveTab('dashboard');
    setSelectedTontineId(null);
    setEditingTontineId(null);
  };

  const handleCreateTontine = () => {
    setEditingTontineId(null);
    setActiveTab('create-tontine');
  };

  const handleEditTontine = (tontineId: string) => {
    setEditingTontineId(tontineId);
    setActiveTab('create-tontine');
  };

  const handleSaveTontine = (tontineData: Partial<Tontine>) => {
    if (editingTontineId) {
      // Update existing tontine
      setTontines(prev => prev.map(t => 
        t.id === editingTontineId 
          ? { ...t, ...tontineData, updatedAt: new Date() }
          : t
      ));
    } else {
      // Create new tontine
      const newTontine: Tontine = {
        id: Date.now().toString(),
        initiatorId: authState.user!.id,
        participants: [],
        inviteLink: generateInviteLink(Date.now().toString(), tontineData.inviteCode || ''),
        ...tontineData
      } as Tontine;

      setTontines(prev => [...prev, newTontine]);
    }
    
    setEditingTontineId(null);
    setActiveTab('dashboard');
  };

  const handleDeleteTontine = (tontineId: string) => {
    setTontines(prev => prev.filter(t => t.id !== tontineId));
    if (selectedTontineId === tontineId) {
      setSelectedTontineId(null);
      setActiveTab('dashboard');
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

  const handleStartTontine = (tontineId: string) => {
    setTontines(prev => prev.map(t => 
      t.id === tontineId 
        ? { ...t, status: 'active', currentCycle: 1, updatedAt: new Date() }
        : t
    ));
  };

  const handleSuspendTontine = (tontineId: string) => {
    setTontines(prev => prev.map(t => 
      t.id === tontineId 
        ? { 
            ...t, 
            status: t.status === 'suspended' ? 'active' : 'suspended', 
            updatedAt: new Date() 
          }
        : t
    ));
  };

  const handleValidatePayment = (tontineId: string, participantId: string) => {
    setTontines(prev => prev.map(t => {
      if (t.id === tontineId) {
        const updatedParticipants = t.participants.map(p => {
          if (p.id === participantId) {
            const updatedPaymentHistory = p.paymentHistory.map(payment => {
              if (payment.cycle === t.currentCycle && payment.status === 'participant_paid') {
                const auditEntry: PaymentAudit = {
                  id: Date.now().toString(),
                  action: 'initiator_validated',
                  userId: authState.user!.id,
                  userName: `${authState.user!.firstName} ${authState.user!.lastName}`,
                  timestamp: new Date(),
                  notes: 'Paiement validé par l\'initiateur'
                };

                return {
                  ...payment,
                  status: 'confirmed' as const,
                  initiatorValidated: true,
                  initiatorValidatedAt: new Date(),
                  auditLog: [...payment.auditLog, auditEntry]
                };
              }
              return payment;
            });

            return { ...p, paymentHistory: updatedPaymentHistory };
          }
          return p;
        });

        return { ...t, participants: updatedParticipants, updatedAt: new Date() };
      }
      return t;
    }));
  };

  const handleMarkPayment = (tontineId: string, participantId: string) => {
    setTontines(prev => prev.map(t => {
      if (t.id === tontineId) {
        const updatedParticipants = t.participants.map(p => {
          if (p.id === participantId) {
            const existingPayment = p.paymentHistory.find(payment => payment.cycle === t.currentCycle);
            
            if (!existingPayment) {
              const auditEntry: PaymentAudit = {
                id: Date.now().toString(),
                action: 'participant_marked_paid',
                userId: authState.user!.id,
                userName: `${authState.user!.firstName} ${authState.user!.lastName}`,
                timestamp: new Date(),
                notes: 'Participant a marqué le paiement comme effectué'
              };

              const newPayment: Payment = {
                id: Date.now().toString(),
                participantId: p.id,
                cycle: t.currentCycle,
                amount: t.amount,
                dueDate: new Date(), // Should be calculated based on tontine schedule
                paidDate: new Date(),
                participantValidated: true,
                participantValidatedAt: new Date(),
                initiatorValidated: false,
                status: 'participant_paid',
                auditLog: [auditEntry]
              };

              return { 
                ...p, 
                paymentHistory: [...p.paymentHistory, newPayment] 
              };
            }
            
            return p;
          }
          return p;
        });

        return { ...t, participants: updatedParticipants, updatedAt: new Date() };
      }
      return t;
    }));
  };

  const handleAddParticipant = (tontineId: string, participantData: Partial<Participant>) => {
    setTontines(prev => prev.map(t => {
      if (t.id === tontineId) {
        const newParticipant: Participant = {
          id: Date.now().toString(),
          userId: Date.now().toString(), // In real app, this would be the actual user ID
          firstName: participantData.firstName!,
          lastName: participantData.lastName!,
          email: participantData.email!,
          phone: participantData.phone!,
          address: participantData.address!,
          position: t.participants.length + 1,
          hasReceivedPayout: false,
          paymentHistory: [],
          addedBy: participantData.addedBy || 'manual',
          addedAt: new Date()
        };

        return {
          ...t,
          participants: [...t.participants, newParticipant],
          updatedAt: new Date()
        };
      }
      return t;
    }));
  };

  const handleRemoveParticipant = (tontineId: string, participantId: string) => {
    setTontines(prev => prev.map(t => {
      if (t.id === tontineId) {
        const updatedParticipants = t.participants
          .filter(p => p.id !== participantId)
          .map((p, index) => ({ ...p, position: index + 1 })); // Reorder positions
        
        return {
          ...t,
          participants: updatedParticipants,
          updatedAt: new Date()
        };
      }
      return t;
    }));
  };

  const handleReorderParticipants = (tontineId: string, participants: Participant[]) => {
    setTontines(prev => prev.map(t => 
      t.id === tontineId 
        ? { ...t, participants, updatedAt: new Date() }
        : t
    ));
  };

  const handleJoinTontine = () => {
    setActiveTab('join-tontine');
  };

  const handleJoinTontineSubmit = (tontineId: string, method: 'code' | 'email', value: string) => {
    const tontine = tontines.find(t => t.id === tontineId);
    if (!tontine || !authState.user) return;

    const newParticipant: Participant = {
      id: Date.now().toString(),
      userId: authState.user.id,
      firstName: authState.user.firstName,
      lastName: authState.user.lastName,
      email: authState.user.email,
      phone: authState.user.phone,
      address: authState.user.address,
      position: tontine.participants.length + 1,
      hasReceivedPayout: false,
      paymentHistory: [],
      addedBy: method,
      addedAt: new Date()
    };

    setTontines(prev => prev.map(t => 
      t.id === tontineId 
        ? { ...t, participants: [...t.participants, newParticipant], updatedAt: new Date() }
        : t
    ));

    setActiveTab('dashboard');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  if (!authState.isAuthenticated) {
    return <LoginForm onLogin={handleLogin} users={users} />;
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
        return authState.user.type === 'initiator' ? (
          <InitiatorDashboard
            tontines={tontines.filter(t => t.initiatorId === authState.user!.id)}
            onCreateTontine={handleCreateTontine}
            onViewTontine={handleViewTontine}
            onEditTontine={handleEditTontine}
            onDeleteTontine={handleDeleteTontine}
          />
        ) : (
          <ParticipantDashboard
            tontines={tontines}
            currentUserId={authState.user.id}
            onViewTontine={handleViewTontine}
            onJoinTontine={handleJoinTontine}
          />
        );

      case 'notifications':
        return (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h1>
            <div className="bg-white rounded-xl shadow-sm border-2 border-solid border-gray-200">
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
                    <p className="text-gray-500 capitalize">{authState.user.type === 'initiator' ? 'Initiateur' : 'Participant'}</p>
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
                      {authState.user.type === 'initiator' ? 'Initiateur' : 'Participant'}
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
            onCreateTontine={handleCreateTontine}
            onViewTontine={handleViewTontine}
            onEditTontine={handleEditTontine}
            onDeleteTontine={handleDeleteTontine}
          />
        ) : (
          <ParticipantDashboard
            tontines={tontines}
            currentUserId={authState.user.id}
            onViewTontine={handleViewTontine}
            onJoinTontine={handleJoinTontine}
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
        notificationCount={0}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        onLogout={handleLogout}
      />
      
      <main>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;