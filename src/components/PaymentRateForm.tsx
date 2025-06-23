// PaymentRateForm.tsx
import React from 'react';

interface Props {
  newRate: string;
  onRateChange: (val: string) => void;
  onRateSubmit: () => void;
}

const PaymentRateForm: React.FC<Props> = ({ newRate, onRateChange, onRateSubmit }) => (
  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
    <h3 className="text-base font-semibold text-gray-900 mb-2">Update Payment Rate</h3>
    <div className="flex flex-col sm:flex-row gap-2">
      <input
        type="number"
        value={newRate}
        onChange={(e) => onRateChange(e.target.value)}
        placeholder="e.g. 10"
        className="w-full sm:flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500"
        step="0.01"
        min="0"
      />
      <button
        onClick={onRateSubmit}
        className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 text-sm font-medium"
      >
        Update
      </button>
    </div>
  </div>
);

export default PaymentRateForm;
