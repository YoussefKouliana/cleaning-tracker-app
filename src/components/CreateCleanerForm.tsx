// src/components/CreateCleanerForm.tsx (Fully Featured with Machine Assignment)
import { useState, useEffect } from 'react';
import { UserPlus, X, MapPin, Coins, Settings } from 'lucide-react';
import { createCleaner } from '../firebase/userManagement';
import { getMachines } from '../firebase/firestore';
import type { Machine } from '../types';

interface CreateCleanerFormProps {
  onClose: () => void;
  onSuccess: () => void;
  currentUserUid: string;
}

const CreateCleanerForm: React.FC<CreateCleanerFormProps> = ({ 
  onClose, 
  onSuccess, 
  currentUserUid 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    assignedMachineId: '',
    paymentRate: 100,
  });
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMachines, setLoadingMachines] = useState(true);
  const [message, setMessage] = useState('');

  // Load available machines
  useEffect(() => {
    const loadMachines = async () => {
      try {
        const allMachines = await getMachines();
        setMachines(allMachines.filter(machine => machine.isActive));
      } catch (error) {
        console.error('Error loading machines:', error);
        setMessage('Error loading machines');
      } finally {
        setLoadingMachines(false);
      }
    };

    loadMachines();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }

    if (formData.paymentRate <= 0) {
      setMessage('Payment rate must be greater than 0 SEK');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Create cleaner with enhanced data
      const cleanerData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        assignedMachineId: formData.assignedMachineId || undefined,
        paymentRate: formData.paymentRate,
      };

      console.log('🚀 Creating cleaner with data:', cleanerData);

      const result = await createCleaner(cleanerData, currentUserUid);

      if (result && result.success) {
        const assignmentText = formData.assignedMachineId 
          ? ` and assigned to ${machines.find(m => m.id === formData.assignedMachineId)?.name}`
          : '';
        setMessage(`✅ Cleaner created successfully${assignmentText} with ${formData.paymentRate} SEK rate!`);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setMessage(result?.message || 'Failed to create cleaner');
      }
    } catch (error: any) {
      setMessage('Error creating cleaner: ' + error.message);
      console.error('Create cleaner error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'paymentRate') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 100,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const selectedMachine = machines.find(m => m.id === formData.assignedMachineId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            Create New Cleaner
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Personal Information Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Personal Information
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. Asliddin Karimov"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. asliddin@fluffycandy.se"
                />
                <p className="text-xs text-gray-500 mt-1">Recommended: @fluffycandy.se domain</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Min 6 characters"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm password"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Machine Assignment Section */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Machine Assignment
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned Machine
                </label>
                {loadingMachines ? (
                  <div className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500 bg-gray-100">
                    Loading machines...
                  </div>
                ) : (
                  <select
                    name="assignedMachineId"
                    value={formData.assignedMachineId}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">No machine assigned (can assign later)</option>
                    {machines.map((machine) => (
                      <option key={machine.id} value={machine.id}>
                        {machine.name} - {machine.location}
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
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Rate (SEK per cleaning) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="paymentRate"
                    value={formData.paymentRate}
                    onChange={handleInputChange}
                    required
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
                  Individual rate for this cleaner (recommended: Uppsala 100 SEK, Stockholm 120 SEK)
                </p>
              </div>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`text-sm p-3 rounded-lg ${
              message.includes('✅') || message.includes('successfully')
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
              disabled={loading || loadingMachines}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Creating...' : 'Create Cleaner'}
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

        {/* Help Text */}
        <div className="mt-4 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <p className="font-medium mb-1">💡 Features Now Available:</p>
          <ul className="space-y-1">
            <li>• ✅ Machine assignment during creation</li>
            <li>• ✅ Individual payment rates per cleaner</li>
            <li>• ✅ Enhanced UI with machine preview</li>
            <li>• ✅ Automatic profile setup</li>
          </ul>
          <p className="mt-2 text-green-600 font-medium">🎉 All features are now active!</p>
        </div>
      </div>
    </div>
  );
};

export default CreateCleanerForm;