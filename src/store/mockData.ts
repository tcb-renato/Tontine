import { Tontine, User, Participant, Payment, Notification } from '../types';
import { generateInviteCode } from '../utils/dateUtils';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Rénato TCHOBO',
    email: 'tcb@email.com',
    phone: '+33123456789',
    type: 'initiator'
  },
  {
    id: '2',
    name: 'Jean Martin',
    email: 'jean.martin@email.com',
    phone: '+33123456790',
    type: 'participant'
  },
  {
    id: '3',
    name: 'Sophie Laurent',
    email: 'sophie.laurent@email.com',
    phone: '+33123456791',
    type: 'participant'
  }
];

export const mockTontines: Tontine[] = [
  {
    id: '1',
    name: 'Tontine Familiale 2024',
    description: 'Tontine mensuelle pour épargner ensemble',
    amount: 50000,
    frequency: 'monthly',
    participants: [
      {
        id: '1',
        userId: '1',
        name: 'Marie Dubois',
        email: 'marie.dubois@email.com',
        phone: '+33123456789',
        position: 1,
        hasReceivedPayout: false,
        paymentHistory: []
      },
      {
        id: '2',
        userId: '2',
        name: 'Jean Martin',
        email: 'jean.martin@email.com',
        phone: '+33123456790',
        position: 2,
        hasReceivedPayout: false,
        paymentHistory: []
      }
    ],
    maxParticipants: 8,
    startDate: new Date('2024-01-15'),
    currentCycle: 1,
    status: 'active',
    initiatorId: '1',
    inviteCode: generateInviteCode(),
    orderType: 'manual',
    gainType: 'money',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  }
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    type: 'payment_due',
    title: 'Paiement en attente',
    message: 'Jean Martin doit effectuer son paiement pour le cycle 1',
    read: false,
    createdAt: new Date(),
    tontineId: '1'
  }
];