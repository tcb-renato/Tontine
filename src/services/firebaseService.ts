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
  Timestamp
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
  signOut,
  User as FirebaseUser
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
    const docRef = await addDoc(collection(db, 'tontines'), {
      ...tontineData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    const tontineDoc = await getDoc(docRef);
    return { id: docRef.id, ...tontineDoc.data() } as Tontine;
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