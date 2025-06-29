// src/components/EditCleanerModal.tsx
import React, { useState, useEffect } from 'react';
import { Edit, X, MapPin, Coins, Settings, User, ToggleLeft, ToggleRight } from 'lucide-react';
import { updateCleanerMachineAssignment, updateCleanerStatus } from '../firebase/userManagement';
import { getMachines } from '../firebase/firestore';
import type { CleanerProfile, Machine } from '../types';

interface EditCleanerModalProps {
  cleaner: CleanerProfile;
  onClose: () => void;
  onSuccess: () => void;
}

const EditCleanerModal: React.FC<EditCleanerModalProps> = ({
  cleaner,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    assignedMachineId: cleaner.assignedMachineId || '',
    paymentRate: cleaner.paymentRate || 100,
    isActive: cleaner.isActive,
  });
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMachines, setLoadingMachines] = useState(true);
  const [message, setMessage] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Load available machines
  useEffect(() => {
    const loadMachines = async () => {
      try {
        const allMachines = await getMachines();
        setMachines(allMachines);
      } catch (error) {
        console.error('Error loading machines:', error);
        setMessage('Error loading machines');
      } finally {
        setLoadingMachines(false);
      }
    };

    loadMachines();
  }, []);

  // Check for changes
  useEffect(() => {
    const originalAssignment = cleaner.assignedMachineId || '';
    const originalRate = cleaner.paymentRate || 100;
    const originalStatus = cleaner.isActive;

    const hasFormChanges = 
      formData.assignedMachineId !== originalAssignment ||
      formData.paymentRate !== originalRate ||
      formData.isActive !== originalStatus;

    setHasChanges(hasFormChanges);
  }, [formData, cleaner]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasChanges) {
      setMessage('No changes to save');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const updates: string[] = [];

      // Update machine assignment and payment rate
      if (formData.assignedMachineId !== (cleaner.assignedMachineId || '') || 
          formData.paymentRate !== (cleaner.paymentRate || 100)) {
        
        const assignmentResult = await updateCleanerMachineAssignment(
          cleaner.uid,
          formData.assignedMachineId || null,
          formData.paymentRate
        );

        if (assignmentResult.success) {
          if (formData.assignedMachineId !== (cleaner.assignedMachineId || '')) {
            updates.push('machine assignment');
          }
          if (formData.paymentRate !== (cleaner.paymentRate || 100)) {
            updates.push('payment rate');
          }
        } else {
          throw new Error(assignmentResult.message || 'Failed to update assignment');
        }
      }

      // Update active status
      if (formData.isActive !== cleaner.isActive) {
        await updateCleanerStatus(cleaner.uid, formData.isActive);
        updates.push(formData.isActive ? 'activated account' : 'deactivated account');
      }

      setMessage(`✅ Successfully updated: ${updates.join(', ')}`);
      
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);

    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name === 'paymentRate') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const selectedMachine = machines.find(m => m.id === formData.assignedMachineId);
  const currentMachine = machines.find(m => m.id === cleaner.assignedMachineId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Edit className="w-5 h-5 text-blue-600" />
            Edit Cleaner: {cleaner.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cleaner Info */}
        <div className="bg-gray-50 p-4 rounded-lg mb-5">
          <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
            <User className="w-4 h-4" />
            Cleaner Information
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Name:</span>
              <p className="text-gray-900">{cleaner.name}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Email:</span>
              <p className="text-gray-900">{cleaner.email}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">UID:</span>
              <p className="text-gray-900 font-mono text-xs">{cleaner.uid}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Created:</span>
              <p className="text-gray-900">
                {new Date(cleaner.createdAt as string).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Account Status */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Account Status
            </h4>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Status
                </label>
                <p className="text-xs text-gray-500">
                  {formData.isActive ? 'Active - cleaner can log cleanings' : 'Inactive - cleaner cannot log cleanings'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  formData.isActive 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                }`}
              >
                {formData.isActive ? (
                  <>
                    <ToggleRight className="w-5 h-5" />
                    Active
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-5 h-5" />
                    Inactive
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Machine Assignment */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Machine Assignment
            </h4>
            
            <div className="space-y-4">
              {/* Current Assignment Display */}
              {currentMachine && (
                <div className="bg-white p-3 rounded border border-purple-200">
                  <p className="text-sm font-medium text-purple-800 mb-1">Current Assignment:</p>
                  <div className="flex items-center gap-1 text-purple-700">
                    <MapPin className="w-3 h-3" />
                    <span>{currentMachine.name} - {currentMachine.location}</span>
                  </div>
                  <p className="text-xs text-purple-600 mt-1">
                    Rate: {cleaner.paymentRate || 100} SEK per cleaning
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned Machine
                </label>
                {loadingMachines ? (
                  <div className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500">
                    Loading machines...
                  </div>
                ) : (
                  <select
                    name="assignedMachineId"
                    value={formData.assignedMachineId}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">No machine assigned</option>
                    {machines.map((machine) => (
                      <option key={machine.id} value={machine.id}>
                        {machine.name} - {machine.location} {machine.isActive ? '' : '(Inactive)'}
                      </option>
                    ))}
                  </select>
                )}
                
                {selectedMachine && (
                  <div className="mt-2 p-2 bg-blue-100 rounded text-sm">
                    <div className="flex items-center gap-1 text-blue-800">
                      <MapPin className="w-3 h-3" />
                      <span className="font-medium">{selectedMachine.name}</span>
                    </div>
                    <p className="text-blue-600">{selectedMachine.location}</p>
                    <p className="text-xs text-blue-500 mt-1">
                      Status: {selectedMachine.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Rate (SEK per cleaning)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="paymentRate"
                    value={formData.paymentRate}
                    onChange={handleInputChange}
                    min="1"
                    step="1"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="100"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <Coins className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Individual rate for this cleaner
                </p>
              </div>
            </div>
          </div>

          {/* Changes Summary */}
          {hasChanges && (
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <p className="text-sm font-medium text-yellow-800 mb-1">Pending Changes:</p>
              <ul className="text-xs text-yellow-700 space-y-1">
                {formData.assignedMachineId !== (cleaner.assignedMachineId || '') && (
                  <li>• Machine assignment: {formData.assignedMachineId ? selectedMachine?.name : 'No assignment'}</li>
                )}
                {formData.paymentRate !== (cleaner.paymentRate || 100) && (
                  <li>• Payment rate: {formData.paymentRate} SEK</li>
                )}
                {formData.isActive !== cleaner.isActive && (
                  <li>• Status: {formData.isActive ? 'Activate' : 'Deactivate'} account</li>
                )}
              </ul>
            </div>
          )}

          {/* Message Display */}
          {message && (
            <div className={`text-sm p-3 rounded-lg ${
              message.includes('✅') || message.includes('Successfully')
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={loading || !hasChanges}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Saving...' : hasChanges ? 'Save Changes' : 'No Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCleanerModal;