// src/types.ts
import type { Timestamp } from 'firebase/firestore';

export type Cleaning = {
  id: string;
  cleanerId: string;
  cleanerName: string;
  machine: string;
  timestamp: Date | Timestamp | string;
};

export type User = {
  uid: string;
  email: string;
  displayName?: string;
};

// Optional: define CleaningDocument if it differs from Cleaning.
// If it's the same structure, you can just alias it:
export type CleaningDocument = Cleaning;

export interface ArchiveEntry {
  paidBy: string;
  timestamp: Timestamp | Date | string;
  logs: CleaningDocument[];
  totalAmount: number;
}
