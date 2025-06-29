// src/utils/cleaningHelper.ts - Helper for enhanced cleaning tracking
import { addCleaning } from '../firebase/firestore';
import { getUserProfile } from '../firebase/userManagement';
import { getMachine } from '../firebase/firestore';

export const addEnhancedCleaning = async (cleanerId: string, cleanerName: string) => {
  try {
    // Get the cleaner's profile to find their assigned machine
    const cleanerProfile = await getUserProfile(cleanerId);
    
    if (!cleanerProfile) {
      throw new Error('Cleaner profile not found');
    }

    let machineId = cleanerProfile.assignedMachineId;
    let machineName = 'Fluffy Candy Machine #1'; // Default fallback
    let paymentRate = cleanerProfile.paymentRate || 100; // Default rate

    // If cleaner has assigned machine, get machine details
    if (machineId) {
      const machine = await getMachine(machineId);
      if (machine) {
        machineName = machine.name;
      }
    }

    // Create enhanced cleaning data
    const cleaningData = {
      cleanerId,
      cleanerName,
      machine: machineName, // Keep for backward compatibility
      // Enhanced fields:
      machineId: machineId || undefined,
      machineName: machineName,
      paymentRate: paymentRate,
    };

    console.log('🚀 Adding enhanced cleaning:', cleaningData);

    // Add the cleaning with enhanced data
    const result = await addCleaning(cleaningData);
    
    return {
      success: true,
      message: 'Cleaning logged successfully with machine tracking',
      cleaningId: result
    };

  } catch (error: any) {
    console.error('Error adding enhanced cleaning:', error);
    return {
      success: false,
      message: error.message || 'Failed to log cleaning'
    };
  }
};

// Helper to get cleaner's current machine info
export const getCleanerMachineInfo = async (cleanerId: string) => {
  try {
    const cleanerProfile = await getUserProfile(cleanerId);
    
    if (!cleanerProfile?.assignedMachineId) {
      return {
        hasAssignment: false,
        machineId: null,
        machineName: 'No machine assigned',
        paymentRate: 100
      };
    }

    const machine = await getMachine(cleanerProfile.assignedMachineId);
    
    return {
      hasAssignment: true,
      machineId: cleanerProfile.assignedMachineId,
      machineName: machine?.name || 'Unknown Machine',
      paymentRate: cleanerProfile.paymentRate || 100,
      machineLocation: machine?.location || 'Unknown Location'
    };

  } catch (error) {
    console.error('Error getting cleaner machine info:', error);
    return {
      hasAssignment: false,
      machineId: null,
      machineName: 'Error loading machine info',
      paymentRate: 100
    };
  }
};