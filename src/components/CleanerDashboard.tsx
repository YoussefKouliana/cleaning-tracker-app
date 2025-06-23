import React from 'react';
import { CheckCircle, User } from 'lucide-react';
import type { Cleaning } from '../types';
import CleaningTable from './CleaningTable';

interface Props {
  onClean: () => void;
  cleaningsToday: number;
  userCleanings: Cleaning[];
  paymentRate: number;
}

const CleanerDashboard: React.FC<Props> = ({ onClean, cleaningsToday, userCleanings, paymentRate }) => (
  <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6">
    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
      <User className="w-5 h-5" />
      Fluffy Candy Cleaner Dashboard
    </h2>

    <div className="text-center mb-6">
      <button
        onClick={onClean}
        className="w-full sm:w-auto bg-pink-600 hover:bg-pink-700 text-white text-base sm:text-lg font-semibold py-3 px-6 sm:px-8 rounded-lg shadow transition-all duration-200 flex items-center justify-center gap-2"
      >
        <CheckCircle className="w-5 h-5" />
        I Cleaned the Machine
      </button>

      <p className="text-gray-600 mt-3 text-sm">
        Tap this after every cleaning!
      </p>

      <div className="mt-5 p-3 bg-pink-50 rounded-md">
        <p className="text-pink-800 font-semibold text-sm">
          Today's cleanings: {cleaningsToday}
        </p>
      </div>
    </div>

    <div className="mt-6">
      <h3 className="font-semibold text-gray-900 mb-3">My Cleanings</h3>
      <CleaningTable cleanings={userCleanings} paymentRate={paymentRate} />
    </div>
  </div>
);

export default CleanerDashboard;
