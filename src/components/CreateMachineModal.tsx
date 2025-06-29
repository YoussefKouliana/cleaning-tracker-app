// src/components/CreateMachineModal.tsx
import React, { useState } from 'react';
import { Settings, X, MapPin, Building } from 'lucide-react';
import { createMachine } from '../firebase/firestore';
import type { CreateMachineData, ApiResponse } from '../types';

interface CreateMachineModalProps {
  onClose: () => void;
  onSuccess: () => void;
  currentUserUid: string;
}

const CreateMachineModal: React.FC<CreateMachineModalProps> = ({
  onClose,
  onSuccess,
  currentUserUid,
}) => {
  const [formData, setFormData] = useState<CreateMachineData>({
    name: '',
    location: '',
    city: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      setMessage('Machine name is required');
      return;
    }
    
    if (!formData.city.trim()) {
      setMessage('City is required');
      return;
    }
    
    if (!formData.location.trim()) {
      setMessage('Location is required');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const result: ApiResponse<string> = await createMachine(formData, currentUserUid);

      if (result.success) {
        setMessage('Machine created successfully!');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        setMessage(result.message || 'Failed to create machine');
      }
    } catch (error: any) {
      setMessage('Error creating machine: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Auto-generate location suggestion when city changes
  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const city = e.target.value;
    setFormData(prev => ({
      ...prev,
      city,
      location: city ? `${city}, Sweden` : '',
    }));
  };

  // Auto-generate machine name suggestion
  const handleNameSuggestion = () => {
    if (formData.city) {
      const machineNumber = Math.floor(Math.random() * 10) + 1;
      setFormData(prev => ({
        ...prev,
        name: `${formData.city} Machine #${machineNumber}`,
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            Create New Machine
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Machine Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Machine Name *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. Uppsala Machine #1"
              />
              <button
                type="button"
                onClick={handleNameSuggestion}
                className="px-3 py-2 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                title="Auto-generate name"
              >
                Auto
              </button>
            </div>
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <div className="relative">
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleCityChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. Uppsala"
              />
              <Building className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          {/* Full Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Location *
            </label>
            <div className="relative">
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. Uppsala, Sweden"
              />
              <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This will be displayed to users and cleaners
            </p>
          </div>

          {/* Preview */}
          {formData.name && formData.location && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900 mb-1">Preview:</p>
              <div className="text-sm text-blue-700">
                <div className="flex items-center gap-1">
                  <Settings className="w-3 h-3" />
                  <span className="font-medium">{formData.name}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  <span>{formData.location}</span>
                </div>
              </div>
            </div>
          )}

          {/* Message Display */}
          {message && (
            <div className={`text-sm p-3 rounded-lg ${
              message.includes('successfully') 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Creating...' : 'Create Machine'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-4 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <p className="font-medium mb-1">💡 Tips:</p>
          <ul className="space-y-1">
            <li>• Use descriptive names like "City Machine #Number"</li>
            <li>• Include full location for clarity</li>
            <li>• Machine will be created as active by default</li>
            <li>• You can assign cleaners after creation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateMachineModal;