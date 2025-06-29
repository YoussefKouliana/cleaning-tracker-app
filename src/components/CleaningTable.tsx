// src/components/CleaningTable.tsx
import React from 'react';
import type { Cleaning } from '../types';

interface Props {
  cleanings: Cleaning[];
  paymentRate: number;
}

// Helper function to safely convert timestamps to Date
const convertTimestampToDate = (timestamp: any): Date => {
  if (typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp) {
    // Firestore Timestamp
    return timestamp.toDate();
  } else if (timestamp instanceof Date) {
    // JavaScript Date
    return timestamp;
  } else {
    // String timestamp
    return new Date(timestamp as string);
  }
};

const CleaningTable: React.FC<Props> = ({ cleanings, paymentRate }) => (
  <div>
    <h3 className="text-base font-semibold text-gray-900 mb-3">Recent Cleanings</h3>
    <div className="overflow-x-auto w-full">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b bg-pink-50 text-gray-700">
            <th className="text-left py-2 px-2">Cleaner</th>
            <th className="text-left py-2 px-2">Time</th>
            <th className="text-left py-2 px-2">Machine</th>
            <th className="text-right py-2 px-2">Payment</th>
          </tr>
        </thead>
        <tbody>
          {cleanings.slice(0, 10).map((c) => (
            <tr key={c.id} className="border-b hover:bg-pink-50 transition">
              <td className="py-2 px-2">{c.cleanerName}</td>
              <td className="py-2 px-2">{convertTimestampToDate(c.timestamp).toLocaleString()}</td>
              <td className="py-2 px-2">{c.machine}</td>
              <td className="py-2 px-2 text-right">{paymentRate.toFixed(2)} SEK</td>
            </tr>
          ))}
        </tbody>
      </table>
      {cleanings.length === 0 && (
        <p className="text-gray-500 text-center py-6 text-sm">No cleanings recorded yet</p>
      )}
    </div>
  </div>
);

export default CleaningTable;