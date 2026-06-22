import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  collection, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  limit,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { User, Appointment, WeeklySchedule, AppNotification } from './types';

// Load app configuration
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId); /* CRITICAL: The app will break without this line */

// Validate Connection to Firestore on startup
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

// Define Error Handling according to guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Collections helpers
export async function loadUsersFromDb(): Promise<User[]> {
  const collectionName = 'users';
  try {
    const q = query(collection(db, collectionName));
    const snapshot = await getDocs(q);
    const users: User[] = [];
    snapshot.forEach((doc) => {
      users.push(doc.data() as User);
    });
    return users;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, collectionName);
    return [];
  }
}

export async function saveUserToDb(user: User): Promise<void> {
  const collectionName = 'users';
  try {
    const docRef = doc(db, collectionName, user.id);
    await setDoc(docRef, user);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${user.id}`);
  }
}

export async function updateUserVerificationInDb(userId: string, isVerified: boolean): Promise<void> {
  const collectionName = 'users';
  try {
    const docRef = doc(db, collectionName, userId);
    await updateDoc(docRef, { isVerified });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${userId}`);
  }
}

export async function loadAppointmentsFromDb(): Promise<Appointment[]> {
  const collectionName = 'appointments';
  try {
    const q = query(collection(db, collectionName));
    const snapshot = await getDocs(q);
    const appointments: Appointment[] = [];
    snapshot.forEach((doc) => {
      appointments.push(doc.data() as Appointment);
    });
    return appointments;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, collectionName);
    return [];
  }
}

export async function saveAppointmentToDb(apt: Appointment): Promise<void> {
  const collectionName = 'appointments';
  try {
    const docRef = doc(db, collectionName, apt.id);
    await setDoc(docRef, apt);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${apt.id}`);
  }
}

export async function updateAppointmentInDb(aptId: string, updates: Partial<Appointment>): Promise<void> {
  const collectionName = 'appointments';
  try {
    const docRef = doc(db, collectionName, aptId);
    await updateDoc(docRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${aptId}`);
  }
}

export async function loadSchedulesFromDb(): Promise<WeeklySchedule[]> {
  const collectionName = 'schedules';
  try {
    const q = query(collection(db, collectionName));
    const snapshot = await getDocs(q);
    const schedules: WeeklySchedule[] = [];
    snapshot.forEach((doc) => {
      schedules.push(doc.data() as WeeklySchedule);
    });
    return schedules;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, collectionName);
    return [];
  }
}

export async function saveSchedulesToDb(schedules: WeeklySchedule[]): Promise<void> {
  const collectionName = 'schedules';
  try {
    const batch = writeBatch(db);
    // Write each schedule
    schedules.forEach((schedule) => {
      const docRef = doc(db, collectionName, schedule.id);
      batch.set(docRef, schedule);
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, collectionName);
  }
}

export async function loadNotificationsFromDb(): Promise<AppNotification[]> {
  const collectionName = 'notifications';
  try {
    const q = query(collection(db, collectionName));
    const snapshot = await getDocs(q);
    const notifications: AppNotification[] = [];
    snapshot.forEach((doc) => {
      notifications.push(doc.data() as AppNotification);
    });
    return notifications;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, collectionName);
    return [];
  }
}

export async function saveNotificationToDb(notification: AppNotification): Promise<void> {
  const collectionName = 'notifications';
  try {
    const docRef = doc(db, collectionName, notification.id);
    await setDoc(docRef, notification);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${notification.id}`);
  }
}

export async function clearNotificationsInDb(notifications: AppNotification[]): Promise<void> {
  const collectionName = 'notifications';
  try {
    const batch = writeBatch(db);
    notifications.forEach((notif) => {
      const docRef = doc(db, collectionName, notif.id);
      batch.delete(docRef);
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, collectionName);
  }
}
