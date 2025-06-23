import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import type { Timestamp } from 'firebase/firestore';
import { db } from './config';
import type { ArchiveEntry } from '../types';

// === Types ===
export interface CleaningData {
  cleanerId: string;
  cleanerName: string;
  machine: string;
}

export interface CleaningDocument extends CleaningData {
  id: string;
  timestamp: Timestamp | Date | string;
}

// === Collections ===
const CLEANINGS_COLLECTION = 'cleanings';
const SETTINGS_COLLECTION = 'settings';
const ARCHIVE_COLLECTION = 'paymentHistory';

// === Cleanings ===
export const addCleaning = async (
  cleaningData: CleaningData
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, CLEANINGS_COLLECTION), {
      ...cleaningData,
      timestamp: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const getCleanings = async (): Promise<CleaningDocument[]> => {
  try {
    const q = query(
      collection(db, CLEANINGS_COLLECTION),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as CleaningDocument)
    );
  } catch (error) {
    throw error;
  }
};

// === Payment Rate ===
export const getPaymentRate = async (): Promise<number> => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'payment');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().rate || 10;
    } else {
      // Set default rate
      await setDoc(docRef, { rate: 10 });
      return 10;
    }
  } catch (error) {
    throw error;
  }
};

export const setPaymentRate = async (rate: number): Promise<void> => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'payment');
    await setDoc(docRef, { rate });
  } catch (error) {
    throw error;
  }
};

// === Payment Archive ===
export const addArchiveEntry = async (
  entry: ArchiveEntry
): Promise<void> => {
  try {
    await addDoc(collection(db, ARCHIVE_COLLECTION), {
      paidBy: entry.paidBy,
      timestamp: serverTimestamp(),
      logs: entry.logs,
    });
  } catch (error) {
    throw error;
  }
};

export const getArchiveEntries = async (): Promise<ArchiveEntry[]> => {
  try {
    const q = query(collection(db, ARCHIVE_COLLECTION), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        paidBy: data.paidBy,
        timestamp: data.timestamp,
        logs: data.logs,
      } as ArchiveEntry;
    });
  } catch (error) {
    throw error;
  }
};

// === Archive and Reset ===
import { deleteDoc } from 'firebase/firestore';
export const archiveAndResetCleanings = async (
  paidBy: string,
  ratePerCleaning: number
): Promise<void> => {
  try {
    const cleaningsSnapshot = await getDocs(collection(db, CLEANINGS_COLLECTION));

    const logs = cleaningsSnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        cleanerId: data.cleanerId,
        cleanerName: data.cleanerName,
        machine: data.machine,
        timestamp: data.timestamp,
      };
    });

    if (logs.length === 0) return;

    const totalAmount = logs.length * ratePerCleaning;

    await addArchiveEntry({
      paidBy,
      timestamp: new Date().toISOString(),
      logs,
      totalAmount,
    });

    await Promise.all(
      cleaningsSnapshot.docs.map((docSnap) =>
        deleteDoc(doc(db, CLEANINGS_COLLECTION, docSnap.id))
      )
    );
  } catch (error) {
    throw error;
  }
};



