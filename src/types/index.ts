export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'initiator' | 'participant';
  code: string;
}

export interface Participant {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  position: number;
  hasReceivedPayout: boolean;
  paymentHistory: Payment[];
}

export interface Payment {
  id: string;
  participantId: string;
  cycle: number;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  initiatorValidated: boolean;
  participantValidated: boolean;
  status: 'pending' | 'paid' | 'overdue';
}

export interface Tontine {
  id: string;
  name: string;
  description: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  customDays?: number;
  participants: Participant[];
  maxParticipants: number;
  startDate: Date;
  currentCycle: number;
  status: 'draft' | 'active' | 'completed' | 'paused';
  initiatorId: string;
  inviteCode: string;
  orderType: 'manual' | 'random';
  gainType: 'money' | 'pack';
  packDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'payment_due' | 'payment_received' | 'payout_ready' | 'tontine_started';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  tontineId?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}