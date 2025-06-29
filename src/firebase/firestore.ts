// src/firebase/firestore.ts (Enhanced with Machine Management)
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import type { Timestamp } from 'firebase/firestore';
import { db } from './config';
import type { 
  ArchiveEntry, 
  Machine, 
  CreateMachineData, 
  CleaningFilter,
  MachineStats,
  ApiResponse 
} from '../types';

// === Types ===
export interface CleaningData {
  cleanerId: string;
  cleanerName: string;
  machine: string; // Keep for backward compatibility
  // NEW: Enhanced machine tracking
  machineId?: string;
  machineName?: string;
  paymentRate?: number;
}

export interface CleaningDocument extends CleaningData {
  id: string;
  timestamp: Timestamp | Date | string;
}

// === Collections ===
const CLEANINGS_COLLECTION = 'cleanings';
const SETTINGS_COLLECTION = 'settings';
const ARCHIVE_COLLECTION = 'paymentHistory';
const MACHINES_COLLECTION = 'machines'; // NEW

// === Machine Management ===
export const createMachine = async (
  machineData: CreateMachineData,
  createdBy: string
): Promise<ApiResponse<string>> => {
  try {
    // Check if machine name already exists
    const existingQuery = query(
      collection(db, MACHINES_COLLECTION),
      where('name', '==', machineData.name)
    );
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      return {
        success: false,
        message: 'Machine with this name already exists'
      };
    }

    const docRef = await addDoc(collection(db, MACHINES_COLLECTION), {
      ...machineData,
      isActive: true,
      createdAt: serverTimestamp(),
      createdBy,
    });

    return {
      success: true,
      message: 'Machine created successfully',
      data: docRef.id
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to create machine'
    };
  }
};

export const getMachines = async (): Promise<Machine[]> => {
  try {
    const q = query(
      collection(db, MACHINES_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Machine));
  } catch (error) {
    throw error;
  }
};

export const getMachine = async (machineId: string): Promise<Machine | null> => {
  try {
    const docRef = doc(db, MACHINES_COLLECTION, machineId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Machine;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

export const updateMachine = async (
  machineId: string,
  updates: Partial<Machine>
): Promise<ApiResponse> => {
  try {
    const docRef = doc(db, MACHINES_COLLECTION, machineId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: 'Machine updated successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to update machine'
    };
  }
};

export const toggleMachineStatus = async (
  machineId: string,
  isActive: boolean
): Promise<ApiResponse> => {
  try {
    const docRef = doc(db, MACHINES_COLLECTION, machineId);
    await updateDoc(docRef, {
      isActive,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: `Machine ${isActive ? 'activated' : 'deactivated'} successfully`
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to update machine status'
    };
  }
};

// === Enhanced Cleanings ===
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

export const getCleanings = async (filter?: CleaningFilter): Promise<CleaningDocument[]> => {
  try {
    let q = query(
      collection(db, CLEANINGS_COLLECTION),
      orderBy('timestamp', 'desc')
    );

    // Apply filters if provided
    if (filter?.machineId) {
      q = query(q, where('machineId', '==', filter.machineId));
    }
    
    if (filter?.cleanerId) {
      q = query(q, where('cleanerId', '==', filter.cleanerId));
    }

    const querySnapshot = await getDocs(q);
    let cleanings = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as CleaningDocument));

    // Apply date filters (client-side for now)
    if (filter?.startDate || filter?.endDate) {
      cleanings = cleanings.filter(cleaning => {
        const cleaningDate = cleaning.timestamp instanceof Date 
          ? cleaning.timestamp 
          : new Date(cleaning.timestamp as string);
        
        if (filter.startDate && cleaningDate < filter.startDate) return false;
        if (filter.endDate && cleaningDate > filter.endDate) return false;
        return true;
      });
    }

    return cleanings;
  } catch (error) {
    throw error;
  }
};

export const getCleaningsByMachine = async (machineId: string): Promise<CleaningDocument[]> => {
  return getCleanings({ machineId });
};

export const getCleaningsByCleaner = async (cleanerId: string): Promise<CleaningDocument[]> => {
  return getCleanings({ cleanerId });
};

// === Machine Statistics ===
export const getMachineStats = async (): Promise<MachineStats[]> => {
  try {
    const machines = await getMachines();
    const cleanings = await getCleanings();
    
    return machines.map(machine => {
      const machineCleanings = cleanings.filter(
        cleaning => cleaning.machineId === machine.id || 
                   cleaning.machine === machine.name // Backward compatibility
      );
      
      const totalEarnings = machineCleanings.reduce(
        (sum, cleaning) => sum + (cleaning.paymentRate || 100), // Default rate fallback
        0
      );
      
      const lastCleaning = machineCleanings.length > 0 
        ? machineCleanings[0].timestamp 
        : undefined;
      
      const assignedCleaners = [...new Set(
        machineCleanings.map(cleaning => cleaning.cleanerId)
      )];
      
      return {
        machineId: machine.id,
        machineName: machine.name,
        totalCleanings: machineCleanings.length,
        totalEarnings,
        lastCleaning,
        assignedCleaners,
      };
    });
  } catch (error) {
    throw error;
  }
};

// === Payment Rate Management ===
export const getPaymentRate = async (): Promise<number> => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'payment');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().rate || 100; // Updated default to 100 SEK
    } else {
      await setDoc(docRef, { rate: 100 });
      return 100;
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
      totalAmount: entry.totalAmount,
      machineId: entry.machineId || null, // NEW: Machine-specific archiving
    });
  } catch (error) {
    throw error;
  }
};

export const getArchiveEntries = async (machineId?: string): Promise<ArchiveEntry[]> => {
  try {
    let q = query(collection(db, ARCHIVE_COLLECTION), orderBy('timestamp', 'desc'));
    
    if (machineId) {
      q = query(q, where('machineId', '==', machineId));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        paidBy: data.paidBy,
        timestamp: data.timestamp,
        logs: data.logs,
        totalAmount: data.totalAmount,
        machineId: data.machineId,
      } as ArchiveEntry;
    });
  } catch (error) {
    throw error;
  }
};

// === Enhanced Archive and Reset ===
export const archiveAndResetCleanings = async (
  paidBy: string,
  ratePerCleaning?: number, // Made optional - will use individual rates
  machineId?: string // NEW: Optional machine-specific reset
): Promise<void> => {
  try {
    let cleaningsQuery = collection(db, CLEANINGS_COLLECTION);
    
    // If machineId provided, only archive that machine's cleanings
    if (machineId) {
      cleaningsQuery = query(cleaningsQuery, where('machineId', '==', machineId)) as any;
    }
    
    const cleaningsSnapshot = await getDocs(cleaningsQuery);

    const logs = cleaningsSnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        cleanerId: data.cleanerId,
        cleanerName: data.cleanerName,
        machine: data.machine,
        machineId: data.machineId,
        machineName: data.machineName,
        paymentRate: data.paymentRate,
        timestamp: data.timestamp,
      };
    });

    if (logs.length === 0) return;

    // Calculate total using individual rates or fallback
    const totalAmount = logs.reduce((sum, log) => {
      return sum + (log.paymentRate || ratePerCleaning || 100);
    }, 0);

    // Create archive entry
    await addArchiveEntry({
      paidBy,
      timestamp: new Date(),
      logs,
      totalAmount,
      machineId, // NEW: Include machine ID in archive
    });

    // Delete all selected cleanings
    await Promise.all(
      cleaningsSnapshot.docs.map((docSnap) =>
        deleteDoc(doc(db, CLEANINGS_COLLECTION, docSnap.id))
      )
    );
  } catch (error) {
    throw error;
  }
};