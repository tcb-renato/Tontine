import { User, Tontine, Participant, Payment, Notification, PaymentProof } from '../types';
import { generateInviteCode, generateInviteLink } from '../utils/dateUtils';

// Keys for localStorage
const STORAGE_KEYS = {
  USERS: 'tontine_users',
  TONTINES: 'tontine_tontines',
  NOTIFICATIONS: 'tontine_notifications',
  AUTH: 'tontine_auth'
};

// Helper functions for localStorage
const getFromStorage = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading from localStorage key ${key}:`, error);
    return [];
  }
};

const saveToStorage = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage key ${key}:`, error);
  }
};

// User Services
export const userService = {
  async createUser(userData: Partial<User>): Promise<User> {
    const users = getFromStorage<User>(STORAGE_KEYS.USERS);
    const newUser: User = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    } as User;
    
    users.push(newUser);
    saveToStorage(STORAGE_KEYS.USERS, users);
    return newUser;
  },

  async getUserById(userId: string): Promise<User | null> {
    const users = getFromStorage<User>(STORAGE_KEYS.USERS);
    return users.find(u => u.id === userId) || null;
  },

  async getUserByCode(code: string): Promise<User | null> {
    const users = getFromStorage<User>(STORAGE_KEYS.USERS);
    return users.find(u => u.code === code.toUpperCase()) || null;
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    const users = getFromStorage<User>(STORAGE_KEYS.USERS);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates, updatedAt: new Date() };
      saveToStorage(STORAGE_KEYS.USERS, users);
    }
  },

  async getAllUsers(): Promise<User[]> {
    return getFromStorage<User>(STORAGE_KEYS.USERS);
  }
};

// Tontine Services
export const tontineService = {
  async createTontine(tontineData: Partial<Tontine>): Promise<Tontine> {
    const tontines = getFromStorage<Tontine>(STORAGE_KEYS.TONTINES);
    const inviteCode = generateInviteCode();
    const tontineId = Date.now().toString();
    const inviteLink = generateInviteLink(tontineId, inviteCode);
    
    const newTontine: Tontine = {
      id: tontineId,
      inviteCode,
      inviteLink,
      participants: [],
      currentCycle: 0,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...tontineData
    } as Tontine;
    
    tontines.push(newTontine);
    saveToStorage(STORAGE_KEYS.TONTINES, tontines);
    return newTontine;
  },

  async getTontineById(tontineId: string): Promise<Tontine | null> {
    const tontines = getFromStorage<Tontine>(STORAGE_KEYS.TONTINES);
    const tontine = tontines.find(t => t.id === tontineId);
    return tontine ? this.parseTontineDates(tontine) : null;
  },

  async getTontineByCode(inviteCode: string): Promise<Tontine | null> {
    const tontines = getFromStorage<Tontine>(STORAGE_KEYS.TONTINES);
    const tontine = tontines.find(t => t.inviteCode === inviteCode.toUpperCase());
    return tontine ? this.parseTontineDates(tontine) : null;
  },

  async getTontinesByInitiator(initiatorId: string): Promise<Tontine[]> {
    const tontines = getFromStorage<Tontine>(STORAGE_KEYS.TONTINES);
    return tontines
      .filter(t => t.initiatorId === initiatorId)
      .map(t => this.parseTontineDates(t))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getTontinesByParticipant(participantId: string): Promise<Tontine[]> {
    const tontines = getFromStorage<Tontine>(STORAGE_KEYS.TONTINES);
    return tontines
      .filter(t => t.participants.some(p => p.userId === participantId))
      .map(t => this.parseTontineDates(t));
  },

  async updateTontine(tontineId: string, updates: Partial<Tontine>): Promise<void> {
    const tontines = getFromStorage<Tontine>(STORAGE_KEYS.TONTINES);
    const tontineIndex = tontines.findIndex(t => t.id === tontineId);
    
    if (tontineIndex !== -1) {
      tontines[tontineIndex] = { 
        ...tontines[tontineIndex], 
        ...updates, 
        updatedAt: new Date() 
      };
      saveToStorage(STORAGE_KEYS.TONTINES, tontines);
    }
  },

  async deleteTontine(tontineId: string): Promise<void> {
    const tontines = getFromStorage<Tontine>(STORAGE_KEYS.TONTINES);
    const filteredTontines = tontines.filter(t => t.id !== tontineId);
    saveToStorage(STORAGE_KEYS.TONTINES, filteredTontines);
  },

  async addParticipantToTontine(tontineId: string, participantData: Partial<Participant>): Promise<void> {
    const tontines = getFromStorage<Tontine>(STORAGE_KEYS.TONTINES);
    const tontineIndex = tontines.findIndex(t => t.id === tontineId);
    
    if (tontineIndex !== -1) {
      const tontine = tontines[tontineIndex];
      const newParticipant: Participant = {
        id: Date.now().toString(),
        position: tontine.participants.length + 1,
        hasReceivedPayout: false,
        paymentHistory: [],
        addedAt: new Date(),
        ...participantData
      } as Participant;
      
      tontine.participants.push(newParticipant);
      tontine.updatedAt = new Date();
      saveToStorage(STORAGE_KEYS.TONTINES, tontines);
    }
  },

  async removeParticipantFromTontine(tontineId: string, participantId: string): Promise<void> {
    const tontines = getFromStorage<Tontine>(STORAGE_KEYS.TONTINES);
    const tontineIndex = tontines.findIndex(t => t.id === tontineId);
    
    if (tontineIndex !== -1) {
      const tontine = tontines[tontineIndex];
      tontine.participants = tontine.participants
        .filter(p => p.id !== participantId)
        .map((p, index) => ({ ...p, position: index + 1 }));
      tontine.updatedAt = new Date();
      saveToStorage(STORAGE_KEYS.TONTINES, tontines);
    }
  },

  async updateParticipantOrder(tontineId: string, participants: Participant[]): Promise<void> {
    const tontines = getFromStorage<Tontine>(STORAGE_KEYS.TONTINES);
    const tontineIndex = tontines.findIndex(t => t.id === tontineId);
    
    if (tontineIndex !== -1) {
      tontines[tontineIndex].participants = participants;
      tontines[tontineIndex].updatedAt = new Date();
      saveToStorage(STORAGE_KEYS.TONTINES, tontines);
    }
  },

  async getAllTontines(): Promise<Tontine[]> {
    const tontines = getFromStorage<Tontine>(STORAGE_KEYS.TONTINES);
    return tontines.map(t => this.parseTontineDates(t));
  },

  // Helper to parse date strings back to Date objects
  parseTontineDates(tontine: any): Tontine {
    return {
      ...tontine,
      startDate: new Date(tontine.startDate),
      endDate: tontine.endDate ? new Date(tontine.endDate) : undefined,
      collectionDate: tontine.collectionDate ? new Date(tontine.collectionDate) : undefined,
      createdAt: new Date(tontine.createdAt),
      updatedAt: new Date(tontine.updatedAt),
      participants: tontine.participants.map((p: any) => ({
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
    };
  }
};

// Payment Services
export const paymentService = {
  async createPayment(paymentData: Partial<Payment>): Promise<Payment> {
    // This would typically create a payment record
    // For now, we'll handle payments within tontine participants
    const newPayment: Payment = {
      id: Date.now().toString(),
      status: 'pending',
      participantValidated: false,
      initiatorValidated: false,
      auditLog: [],
      ...paymentData
    } as Payment;
    
    return newPayment;
  },

  async markPaymentAsPaid(tontineId: string, participantId: string, screenshotUrl: string, amount: number): Promise<void> {
    const tontines = getFromStorage<Tontine>(STORAGE_KEYS.TONTINES);
    const tontineIndex = tontines.findIndex(t => t.id === tontineId);
    
    if (tontineIndex !== -1) {
      const tontine = tontines[tontineIndex];
      const participantIndex = tontine.participants.findIndex(p => p.id === participantId);
      
      if (participantIndex !== -1) {
        const participant = tontine.participants[participantIndex];
        const existingPayment = participant.paymentHistory.find(p => p.cycle === tontine.currentCycle);
        
        if (!existingPayment) {
          const newPayment: Payment = {
            id: Date.now().toString(),
            participantId,
            tontineId,
            cycle: tontine.currentCycle,
            amount,
            dueDate: new Date(),
            paidDate: new Date(),
            participantValidated: true,
            participantValidatedAt: new Date(),
            initiatorValidated: false,
            status: 'participant_paid',
            screenshotUrl,
            validatedByInitiator: false,
            auditLog: [{
              id: Date.now().toString(),
              action: 'participant_marked_paid',
              userId: participantId,
              userName: `${participant.firstName} ${participant.lastName}`,
              timestamp: new Date(),
              notes: 'Participant a marqué le paiement comme effectué'
            }]
          };
          
          participant.paymentHistory.push(newPayment);
          tontine.updatedAt = new Date();
          saveToStorage(STORAGE_KEYS.TONTINES, tontines);
        }
      }
    }
  },

  async validatePaymentByInitiator(tontineId: string, participantId: string, cycle: number): Promise<void> {
    const tontines = getFromStorage<Tontine>(STORAGE_KEYS.TONTINES);
    const tontineIndex = tontines.findIndex(t => t.id === tontineId);
    
    if (tontineIndex !== -1) {
      const tontine = tontines[tontineIndex];
      const participantIndex = tontine.participants.findIndex(p => p.id === participantId);
      
      if (participantIndex !== -1) {
        const participant = tontine.participants[participantIndex];
        const paymentIndex = participant.paymentHistory.findIndex(p => p.cycle === cycle);
        
        if (paymentIndex !== -1) {
          const payment = participant.paymentHistory[paymentIndex];
          payment.status = 'confirmed';
          payment.initiatorValidated = true;
          payment.initiatorValidatedAt = new Date();
          payment.validatedByInitiator = true;
          
          payment.auditLog.push({
            id: Date.now().toString(),
            action: 'initiator_validated',
            userId: tontine.initiatorId,
            userName: 'Initiateur',
            timestamp: new Date(),
            notes: 'Paiement validé par l\'initiateur'
          });
          
          tontine.updatedAt = new Date();
          saveToStorage(STORAGE_KEYS.TONTINES, tontines);
        }
      }
    }
  },

  async rejectPayment(tontineId: string, participantId: string, cycle: number, reason: string): Promise<void> {
    const tontines = getFromStorage<Tontine>(STORAGE_KEYS.TONTINES);
    const tontineIndex = tontines.findIndex(t => t.id === tontineId);
    
    if (tontineIndex !== -1) {
      const tontine = tontines[tontineIndex];
      const participantIndex = tontine.participants.findIndex(p => p.id === participantId);
      
      if (participantIndex !== -1) {
        const participant = tontine.participants[participantIndex];
        const paymentIndex = participant.paymentHistory.findIndex(p => p.cycle === cycle);
        
        if (paymentIndex !== -1) {
          const payment = participant.paymentHistory[paymentIndex];
          payment.status = 'rejected';
          payment.rejectionReason = reason;
          
          payment.auditLog.push({
            id: Date.now().toString(),
            action: 'initiator_rejected',
            userId: tontine.initiatorId,
            userName: 'Initiateur',
            timestamp: new Date(),
            notes: `Paiement rejeté: ${reason}`
          });
          
          tontine.updatedAt = new Date();
          saveToStorage(STORAGE_KEYS.TONTINES, tontines);
        }
      }
    }
  },

  // Simulate file upload (in real app, this would upload to a service)
  async uploadPaymentScreenshot(file: File, tontineId: string, participantId: string): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        resolve(dataUrl);
      };
      reader.readAsDataURL(file);
    });
  }
};

// Notification Services
export const notificationService = {
  async createNotification(notificationData: Partial<Notification>): Promise<void> {
    const notifications = getFromStorage<Notification>(STORAGE_KEYS.NOTIFICATIONS);
    const newNotification: Notification = {
      id: Date.now().toString(),
      read: false,
      createdAt: new Date(),
      ...notificationData
    } as Notification;
    
    notifications.push(newNotification);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
  },

  async getUserNotifications(userId: string): Promise<Notification[]> {
    const notifications = getFromStorage<Notification>(STORAGE_KEYS.NOTIFICATIONS);
    return notifications
      .filter(n => n.userId === userId)
      .map(n => ({ ...n, createdAt: new Date(n.createdAt) }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  async markAsRead(notificationId: string): Promise<void> {
    const notifications = getFromStorage<Notification>(STORAGE_KEYS.NOTIFICATIONS);
    const notificationIndex = notifications.findIndex(n => n.id === notificationId);
    
    if (notificationIndex !== -1) {
      notifications[notificationIndex].read = true;
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
    }
  },

  async markAllAsRead(userId: string): Promise<void> {
    const notifications = getFromStorage<Notification>(STORAGE_KEYS.NOTIFICATIONS);
    const updatedNotifications = notifications.map(n => 
      n.userId === userId ? { ...n, read: true } : n
    );
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updatedNotifications);
  }
};

// Auth Services
export const authService = {
  async signUp(userData: Partial<User>): Promise<User> {
    return await userService.createUser(userData);
  },

  async signIn(code: string): Promise<User | null> {
    return await userService.getUserByCode(code);
  },

  async signOut(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  },

  getCurrentUser(): User | null {
    try {
      const authData = localStorage.getItem(STORAGE_KEYS.AUTH);
      if (authData) {
        const auth = JSON.parse(authData);
        return auth.user;
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
    return null;
  },

  saveAuthState(user: User): void {
    const authState = {
      isAuthenticated: true,
      user,
      loading: false
    };
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(authState));
  }
};