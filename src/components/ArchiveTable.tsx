import React from 'react';
import type { ArchiveEntry } from '../types';

interface Props {
  paymentHistory: ArchiveEntry[];
}

const ArchiveTable: React.FC<Props> = ({ paymentHistory }) => {
  if (paymentHistory.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Payment History Archive</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-2">Paid By</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2"># of Cleanings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-800">
            {paymentHistory.map((entry, index) => (
              <tr key={index}>
                <td className="px-4 py-2 font-medium">{entry.paidBy}</td>
                <td className="px-4 py-2">{new Date(
  entry.timestamp instanceof Date ? entry.timestamp : (entry.timestamp as any).toDate()
).toLocaleString()}</td>
                <td className="px-4 py-2">{entry.logs.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ArchiveTable;
