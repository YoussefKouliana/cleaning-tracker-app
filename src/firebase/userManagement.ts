// src/firebase/userManagement.ts (Enhanced with Machine Assignment)
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from './config';
import type { 
  CleanerProfile, 
  UserRole, 
  CreateCleanerData,
  ApiResponse,
  CleanerStats 
} from '../types';
import { getMachine, getCleaningsByCleaner } from './firestore';

// === Collections ===
const USERS_COLLECTION = 'users';

// === Enhanced User Profile Management ===
export const createUserProfile = async (
  uid: string,
  email: string,
  name: string,
  role: UserRole,
  createdBy?: string,
  assignedMachineId?: string,
  paymentRate?: number
): Promise<void> => {
  try {
    await setDoc(doc(db, USERS_COLLECTION, uid), {
      email,
      name,
      role,
      createdAt: serverTimestamp(),
      createdBy: createdBy || null,
      isActive: true,
      // NEW: Machine assignment fields
      assignedMachineId: assignedMachineId || null,
      paymentRate: paymentRate || null,
    });
  } catch (error) {
    throw error;
  }
};

export const getUserProfile = async (uid: string): Promise<CleanerProfile | null> => {
  try {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        uid,
        name: data.name,
        email: data.email,
        role: data.role,
        createdAt: data.createdAt,
        createdBy: data.createdBy,
        isActive: data.isActive,
        // NEW: Machine assignment fields
        assignedMachineId: data.assignedMachineId,
        paymentRate: data.paymentRate,
      } as CleanerProfile;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

export const getAllCleaners = async (): Promise<CleanerProfile[]> => {
  try {
    const q = query(collection(db, USERS_COLLECTION), where('role', '==', 'cleaner'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        uid: doc.id,
        name: data.name,
        email: data.email,
        role: data.role,
        createdAt: data.createdAt,
        createdBy: data.createdBy,
        isActive: data.isActive,
        // NEW: Machine assignment fields
        assignedMachineId: data.assignedMachineId,
        paymentRate: data.paymentRate,
      } as CleanerProfile;
    });
  } catch (error) {
    throw error;
  }
};

export const getCleanersByMachine = async (machineId: string): Promise<CleanerProfile[]> => {
  try {
    const q = query(
      collection(db, USERS_COLLECTION), 
      where('role', '==', 'cleaner'),
      where('assignedMachineId', '==', machineId)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        uid: doc.id,
        name: data.name,
        email: data.email,
        role: data.role,
        createdAt: data.createdAt,
        createdBy: data.createdBy,
        isActive: data.isActive,
        assignedMachineId: data.assignedMachineId,
        paymentRate: data.paymentRate,
      } as CleanerProfile;
    });
  } catch (error) {
    throw error;
  }
};

// === Enhanced Cleaner Creation ===
export const createCleaner = async (
  cleanerData: CreateCleanerData,
  createdBy: string
): Promise<ApiResponse<string>> => {
  try {
    // Validate machine assignment if provided
    if (cleanerData.assignedMachineId) {
      const machine = await getMachine(cleanerData.assignedMachineId);
      if (!machine) {
        return {
          success: false,
          message: 'Selected machine does not exist'
        };
      }
      if (!machine.isActive) {
        return {
          success: false,
          message: 'Cannot assign cleaner to inactive machine'
        };
      }
    }

    // Validate payment rate
    if (cleanerData.paymentRate <= 0) {
      return {
        success: false,
        message: 'Payment rate must be greater than 0'
      };
    }

    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      cleanerData.email, 
      cleanerData.password
    );
    const uid = userCredential.user.uid;

    // Create enhanced user profile in Firestore
    await createUserProfile(
      uid, 
      cleanerData.email, 
      cleanerData.name, 
      'cleaner', 
      createdBy,
      cleanerData.assignedMachineId,
      cleanerData.paymentRate
    );

    return {
      success: true,
      message: 'Cleaner created successfully',
      data: uid,
    };
  } catch (error: any) {
    let message = 'Failed to create cleaner';
    
    if (error.code === 'auth/email-already-in-use') {
      message = 'Email is already in use';
    } else if (error.code === 'auth/weak-password') {
      message = 'Password is too weak';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Invalid email address';
    }

    return {
      success: false,
      message,
    };
  }
};

// === Cleaner Management ===
export const updateCleanerStatus = async (
  uid: string,
  isActive: boolean
): Promise<void> => {
  try {
    const docRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(docRef, {
      isActive,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw error;
  }
};

export const updateCleanerMachineAssignment = async (
  uid: string,
  assignedMachineId: string | null,
  paymentRate?: number
): Promise<ApiResponse> => {
  try {
    // Validate machine if assigning
    if (assignedMachineId) {
      const machine = await getMachine(assignedMachineId);
      if (!machine) {
        return {
          success: false,
          message: 'Selected machine does not exist'
        };
      }
      if (!machine.isActive) {
        return {
          success: false,
          message: 'Cannot assign cleaner to inactive machine'
        };
      }
    }

    const updateData: any = {
      assignedMachineId,
      updatedAt: serverTimestamp(),
    };

    if (paymentRate !== undefined) {
      if (paymentRate <= 0) {
        return {
          success: false,
          message: 'Payment rate must be greater than 0'
        };
      }
      updateData.paymentRate = paymentRate;
    }

    const docRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(docRef, updateData);

    return {
      success: true,
      message: 'Cleaner assignment updated successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to update cleaner assignment'
    };
  }
};

export const updateCleanerPaymentRate = async (
  uid: string,
  paymentRate: number
): Promise<ApiResponse> => {
  try {
    if (paymentRate <= 0) {
      return {
        success: false,
        message: 'Payment rate must be greater than 0'
      };
    }

    const docRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(docRef, {
      paymentRate,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: 'Payment rate updated successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to update payment rate'
    };
  }
};

// === Statistics ===
export const getCleanerStats = async (cleanerId: string): Promise<CleanerStats | null> => {
  try {
    const cleaner = await getUserProfile(cleanerId);
    if (!cleaner) return null;

    const cleanings = await getCleaningsByCleaner(cleanerId);
    
    const totalEarnings = cleanings.reduce(
      (sum, cleaning) => sum + (cleaning.paymentRate || cleaner.paymentRate || 100),
      0
    );

    let machineName = 'No Machine Assigned';
    if (cleaner.assignedMachineId) {
      const machine = await getMachine(cleaner.assignedMachineId);
      machineName = machine?.name || 'Unknown Machine';
    }

    return {
      cleanerId: cleaner.uid,
      cleanerName: cleaner.name,
      machineId: cleaner.assignedMachineId,
      machineName,
      totalCleanings: cleanings.length,
      totalEarnings,
      paymentRate: cleaner.paymentRate || 100,
    };
  } catch (error) {
    throw error;
  }
};

export const getAllCleanerStats = async (): Promise<CleanerStats[]> => {
  try {
    // Get cleaners first
    const cleaners = await getAllCleaners();
    
    // Get stats for each cleaner individually to avoid complex queries
    const statsPromises = cleaners.map(async (cleaner) => {
      try {
        return await getCleanerStats(cleaner.uid);
      } catch (error) {
        console.log(`Failed to get stats for cleaner ${cleaner.uid}:`, error);
        // Return basic stats if detailed stats fail
        return {
          cleanerId: cleaner.uid,
          cleanerName: cleaner.name,
          machineId: cleaner.assignedMachineId,
          machineName: cleaner.assignedMachineId ? 'Loading...' : 'No Machine',
          totalCleanings: 0,
          totalEarnings: 0,
          paymentRate: cleaner.paymentRate || 100,
        } as CleanerStats;
      }
    });
    
    const stats = await Promise.all(statsPromises);
    return stats.filter(stat => stat !== null) as CleanerStats[];
  } catch (error) {
    console.error('Error in getAllCleanerStats:', error);
    return []; // Return empty array instead of throwing
  }
};

// === Role Checking Utilities ===
export const getUserRole = async (uid: string): Promise<UserRole | null> => {
  try {
    const profile = await getUserProfile(uid);
    return profile?.role || null;
  } catch (error) {
    return null;
  }
};

export const isSuperiorAdmin = (email: string): boolean => {
  return email === 'superadmin@fluffycandy.se';
};

export const isAdmin = (email: string): boolean => {
  return email === 'admin@fluffycandy.se';
};

export const isAnyAdmin = (email: string): boolean => {
  return isSuperiorAdmin(email) || isAdmin(email);
};