// AdminDashboard.tsx
import React from 'react';
import type { Cleaning } from '../types';
import { BarChart3, CheckCircle, Clock, DollarSign } from 'lucide-react';
import PaymentRateForm from './PaymentRateForm';
import CleaningTable from './CleaningTable';

interface Props {
  cleanings: Cleaning[];
  paymentRate: number;
  totalPayment: number;
  newRate: string;
  onRateChange: (val: string) => void;
  onRateSubmit: () => void;
  onResetCleanings: () => void;
}

const AdminDashboard: React.FC<Props> = ({
  cleanings,
  paymentRate,
  totalPayment,
  newRate,
  onRateChange,
  onRateSubmit,
  onResetCleanings, 
}) => (
  <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 lg:col-span-2">
    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
      <BarChart3 className="w-5 h-5" />
      Fluffy Candy Admin Dashboard
    </h2>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <div className="bg-pink-50 p-4 rounded-lg text-center">
        <CheckCircle className="w-6 h-6 text-pink-600 mx-auto mb-1" />
        <p className="text-xl font-bold text-pink-900">{cleanings.length}</p>
        <p className="text-sm text-pink-700">Total Cleanings</p>
      </div>
      <div className="bg-green-50 p-4 rounded-lg text-center">
        <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-1" />
        <p className="text-xl font-bold text-green-900">${totalPayment.toFixed(2)}</p>
        <p className="text-sm text-green-700">Total Payment</p>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg text-center">
        <Clock className="w-6 h-6 text-purple-600 mx-auto mb-1" />
        <p className="text-xl font-bold text-purple-900">${paymentRate}</p>
        <p className="text-sm text-purple-700">Rate per Cleaning</p>
      </div>
    </div>

    <PaymentRateForm
      newRate={newRate}
      onRateChange={onRateChange}
      onRateSubmit={onRateSubmit}
    />

    <CleaningTable cleanings={cleanings} paymentRate={paymentRate} />

    {/* ✅ Reset Button */}
    <div className="mt-6 text-right">
      <button
        onClick={onResetCleanings}
        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
      >
        Reset Cleanings (Paid)
      </button>
    </div>
  </div>
);

export default AdminDashboard;
