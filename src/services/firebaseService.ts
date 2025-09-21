import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut
} from 'firebase/auth';
import { db, storage, auth } from '../config/firebase';
import { User, Tontine, Participant, Payment, Notification, PaymentProof } from '../types';

// Auth Services
export const authService = {
  async signUp(email: string, password: string, userData: Partial<User>) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const newUser: User = {
      id: user.uid,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    } as User;
    
    await addDoc(collection(db, 'users'), newUser);
    return newUser;
  },

  async signIn(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    return userDoc.data() as User;
  },

  async signOut() {
    await signOut(auth);
  },

  async getCurrentUser(): Promise<User | null> {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    return userDoc.exists() ? userDoc.data() as User : null;
  }
};

// User Services
export const userService = {
  async createUser(userData: Partial<User>): Promise<User> {
    const docRef = await addDoc(collection(db, 'users'), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    const userDoc = await getDoc(docRef);
    return { id: docRef.id, ...userDoc.data() } as User;
  },

  async getUserById(userId: string): Promise<User | null> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } as User : null;
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    await updateDoc(doc(db, 'users', userId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }
};

// Tontine Services
export const tontineService = {
  async createTontine(tontineData: Partial<Tontine>): Promise<Tontine> {
    // Générer un code d'invitation unique
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const inviteLink = `${window.location.origin}/join/${inviteCode}`;
    
    const docRef = await addDoc(collection(db, 'tontines'), {
      ...tontineData,
      inviteCode,
      inviteLink,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    const tontineDoc = await getDoc(docRef);
    const data = tontineDoc.data();
    return { 
      id: docRef.id, 
      ...data,
      startDate: data?.startDate?.toDate(),
      endDate: data?.endDate?.toDate(),
      collectionDate: data?.collectionDate?.toDate(),
      createdAt: data?.createdAt?.toDate(),
      updatedAt: data?.updatedAt?.toDate()
    } as Tontine;
  },

  async joinTontineByCode(inviteCode: string, userId: string): Promise<Tontine | null> {
    const q = query(
      collection(db, 'tontines'),
      where('inviteCode', '==', inviteCode.toUpperCase())
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    
    const tontineDoc = querySnapshot.docs[0];
    const tontine = { id: tontineDoc.id, ...tontineDoc.data() } as Tontine;
    
    // Vérifier si l'utilisateur peut rejoindre
    if (tontine.status !== 'draft') return null;
    if (!tontine.unlimitedParticipants && tontine.maxParticipants && 
        tontine.participants.length >= tontine.maxParticipants) return null;
    if (tontine.participants.some(p => p.userId === userId)) return null;
    
    return tontine;
  },

  async addParticipantToTontine(tontineId: string, participantData: Partial<Participant>): Promise<void> {
    const tontineRef = doc(db, 'tontines', tontineId);
    const tontineDoc = await getDoc(tontineRef);
    
    if (!tontineDoc.exists()) throw new Error('Tontine not found');
    
    const tontine = tontineDoc.data() as Tontine;
    const newParticipant: Participant = {
      id: Date.now().toString(),
      ...participantData,
      position: tontine.participants.length + 1,
      hasReceivedPayout: false,
      paymentHistory: [],
      addedAt: new Date()
    } as Participant;
    
    await updateDoc(tontineRef, {
      participants: [...tontine.participants, newParticipant],
      updatedAt: serverTimestamp()
    });
  },

  async getTontinesByInitiator(initiatorId: string): Promise<Tontine[]> {
    const q = query(
      collection(db, 'tontines'),
      where('initiatorId', '==', initiatorId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Tontine[];
  },

  async getTontineById(tontineId: string): Promise<Tontine | null> {
    const tontineDoc = await getDoc(doc(db, 'tontines', tontineId));
    return tontineDoc.exists() ? { id: tontineDoc.id, ...tontineDoc.data() } as Tontine : null;
  },

  async updateTontine(tontineId: string, updates: Partial<Tontine>): Promise<void> {
    await updateDoc(doc(db, 'tontines', tontineId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  async deleteTontine(tontineId: string): Promise<void> {
    await deleteDoc(doc(db, 'tontines', tontineId));
  },

  async getTontinesByParticipant(participantId: string): Promise<Tontine[]> {
    const q = query(collection(db, 'tontines'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Tontine))
      .filter(tontine => 
        tontine.participants.some(p => p.userId === participantId)
      );
  }
};

// Payment Services
export const paymentService = {
  async createPayment(paymentData: Partial<Payment>): Promise<Payment> {
    const docRef = await addDoc(collection(db, 'payments'), {
      ...paymentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    const paymentDoc = await getDoc(docRef);
    return { id: docRef.id, ...paymentDoc.data() } as Payment;
  },

  async updatePayment(paymentId: string, updates: Partial<Payment>): Promise<void> {
    await updateDoc(doc(db, 'payments', paymentId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  async getPaymentsByTontine(tontineId: string): Promise<Payment[]> {
    const q = query(
      collection(db, 'payments'),
      where('tontineId', '==', tontineId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Payment[];
  },

  async uploadPaymentProof(file: File, paymentId: string): Promise<string> {
    const storageRef = ref(storage, `payment-proofs/${paymentId}/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  },

  async uploadPaymentScreenshot(file: File, tontineId: string, participantId: string): Promise<string> {
    const fileName = `${Date.now()}-${file.name}`;
    const storageRef = ref(storage, `screenshots/${tontineId}/${participantId}/${fileName}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  },

  async markPaymentAsPaid(tontineId: string, participantId: string, screenshotUrl: string, amount: number): Promise<void> {
    const paymentData = {
      id: Date.now().toString(),
      participantId,
      tontineId,
      cycle: 1, // À adapter selon le cycle actuel
      amount,
      dueDate: new Date(),
      paidDate: new Date(),
      participantValidated: true,
      participantValidatedAt: new Date(),
      initiatorValidated: false,
      status: 'participant_paid' as const,
      screenshotUrl,
      validatedByInitiator: false,
      auditLog: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await addDoc(collection(db, 'payments'), {
      ...paymentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  },

  async validatePaymentByInitiator(paymentId: string): Promise<void> {
    await updateDoc(doc(db, 'payments', paymentId), {
      status: 'confirmed',
      initiatorValidated: true,
      initiatorValidatedAt: serverTimestamp(),
      validatedByInitiator: true,
      updatedAt: serverTimestamp()
    });
  }
};

// Notification Services
export const notificationService = {
  async createNotification(notificationData: Partial<Notification>): Promise<void> {
    await addDoc(collection(db, 'notifications'), {
      ...notificationData,
      createdAt: serverTimestamp()
    });
  },

  async getUserNotifications(userId: string): Promise<Notification[]> {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Notification[];
  },

  async markAsRead(notificationId: string): Promise<void> {
    await updateDoc(doc(db, 'notifications', notificationId), {
      read: true
    });
  }
};

// Real-time listeners
export const subscribeToTontines = (initiatorId: string, callback: (tontines: Tontine[]) => void) => {
  const q = query(
    collection(db, 'tontines'),
    where('initiatorId', '==', initiatorId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const tontines = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Tontine[];
    callback(tontines);
  });
};

export const subscribeToNotifications = (userId: string, callback: (notifications: Notification[]) => void) => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const notifications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Notification[];
    callback(notifications);
  });
};