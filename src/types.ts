// src/types.ts (Enhanced with Machine Management)
import type { Timestamp } from 'firebase/firestore';

export type UserRole = 'superior_admin' | 'admin' | 'cleaner';

// === Machine Types ===
export type Machine = {
  id: string;
  name: string; // "Uppsala Machine #1"
  location: string; // "Uppsala, Sweden" 
  city: string; // "Uppsala"
  isActive: boolean;
  createdAt: Date | Timestamp | string;
  createdBy: string;
};

// === Enhanced User Types ===
export type User = {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  createdAt: Date | Timestamp | string;
  createdBy?: string;
  // NEW: Machine assignment fields
  assignedMachineId?: string;
  paymentRate?: number; // Per cleaner payment rate
};

export type CleanerProfile = {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date | Timestamp | string;
  createdBy: string;
  isActive: boolean;
  // NEW: Machine assignment fields
  assignedMachineId?: string;
  paymentRate?: number;
};

// === Enhanced Cleaning Types ===
export type Cleaning = {
  id: string;
  cleanerId: string;
  cleanerName: string;
  machine: string; // Keep for backward compatibility
  timestamp: Date | Timestamp | string;
  // NEW: Enhanced machine tracking
  machineId?: string; 
  machineName?: string;
  paymentRate?: number; // Rate at time of cleaning
};

export type CleaningDocument = Cleaning;

// === Archive Types ===
export interface ArchiveEntry {
  paidBy: string;
  timestamp: Timestamp | Date | string;
  logs: CleaningDocument[];
  totalAmount: number;
  // NEW: Machine-specific archiving support
  machineId?: string; // Optional: for machine-specific archiving
}

// === Machine Management Types ===
export type MachineWithCleaners = Machine & {
  assignedCleaners: CleanerProfile[];
  totalCleanings?: number;
  lastCleaning?: Date | Timestamp | string;
};

export type CreateMachineData = {
  name: string;
  location: string;
  city: string;
};

export type CreateCleanerData = {
  name: string;
  email: string;
  password: string;
  assignedMachineId?: string;
  paymentRate: number;
};

// === Statistics Types ===
export type MachineStats = {
  machineId: string;
  machineName: string;
  totalCleanings: number;
  totalEarnings: number;
  lastCleaning?: Date | Timestamp | string;
  assignedCleaners: string[];
};

export type CleanerStats = {
  cleanerId: string;
  cleanerName: string;
  machineId?: string;
  machineName?: string;
  totalCleanings: number;
  totalEarnings: number;
  paymentRate: number;
};

// === Filter Types ===
export type CleaningFilter = {
  machineId?: string;
  cleanerId?: string;
  startDate?: Date;
  endDate?: Date;
};

// === Response Types ===
export type ApiResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
};