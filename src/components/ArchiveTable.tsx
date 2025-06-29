// src/components/ArchiveTable.tsx
import React from 'react';
import type { ArchiveEntry } from '../types';

interface Props {
  paymentHistory: ArchiveEntry[];
  startDate: string;
  endDate: string;
  setStartDate: (val: string) => void;
  setEndDate: (val: string) => void;
  onApplyDateFilter: () => void;
  onClearFilter: () => void;
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

const ArchiveTable: React.FC<Props> = ({
  paymentHistory,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  onApplyDateFilter,
  onClearFilter,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
        Payment History Archive
      </h2>

      {/* ✅ Filter UI - Always visible */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={onApplyDateFilter}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
          >
            Apply Filter
          </button>
        </div>
        <div className="flex items-end">
           <button
             onClick={onClearFilter}
             className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 w-full"
           >
             Clear Filter
           </button>
         </div>
      </div>

      {/* ✅ Table or Empty State */}
      {paymentHistory.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            Select a date range and click "Apply Filter" to view payment history.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-2">Paid By</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2"># of Cleanings</th>
                <th className="px-4 py-2">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {paymentHistory.map((entry, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 font-medium">{entry.paidBy}</td>
                  <td className="px-4 py-2">
                    {convertTimestampToDate(entry.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">{entry.logs.length}</td>
                  <td className="px-4 py-2">{entry.totalAmount?.toFixed(2)} SEK</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ArchiveTable;