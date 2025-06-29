// src/components/MachineManagementDashboard.tsx (Clean Production Version)
import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Plus, 
  MapPin, 
  Activity, 
  BarChart3,
  Power,
  PowerOff,
  AlertCircle
} from 'lucide-react';
import { 
  getMachines, 
  createMachine, 
  toggleMachineStatus,
  getMachineStats 
} from '../firebase/firestore';
import type { Machine, CreateMachineData, MachineStats } from '../types';

interface MachineManagementDashboardProps {
  isSuperAdmin: boolean;
  currentUserUid: string;
}

const MachineManagementDashboard: React.FC<MachineManagementDashboardProps> = ({ 
  isSuperAdmin,
  currentUserUid 
}) => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [machineStats, setMachineStats] = useState<MachineStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [message, setMessage] = useState('');
  const [newMachine, setNewMachine] = useState<CreateMachineData>({
    name: '',
    location: '',
    city: '',
  });

  useEffect(() => {
    loadMachines();
    loadMachineStats();
  }, []);

  const loadMachines = async () => {
    try {
      const machinesData = await getMachines();
      setMachines(machinesData);
    } catch (error) {
      setMessage('Error loading machines');
    }
  };

  const loadMachineStats = async () => {
    try {
      const stats = await getMachineStats();
      setMachineStats(stats);
    } catch (error) {
      console.error('Error loading machine stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMachine = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSuperAdmin) {
      setMessage('Only Superior Admins can create machines');
      return;
    }

    if (!newMachine.name.trim() || !newMachine.city.trim() || !newMachine.location.trim()) {
      setMessage('All fields are required');
      return;
    }

    setLoading(true);
    setMessage('Creating machine...');

    try {
      const result = await createMachine(newMachine, currentUserUid);
      
      if (result.success) {
        setMessage('Machine created successfully!');
        setNewMachine({ name: '', location: '', city: '' });
        setShowCreateForm(false);
        await loadMachines();
        await loadMachineStats();
        
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(result.message || 'Failed to create machine');
      }
    } catch (error: any) {
      setMessage('Error creating machine: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (machineId: string, currentStatus: boolean) => {
    if (!isSuperAdmin) {
      setMessage('Only Superior Admins can modify machine status');
      return;
    }

    try {
      const result = await toggleMachineStatus(machineId, !currentStatus);
      
      if (result.success) {
        setMessage(result.message || 'Machine status updated');
        await loadMachines();
        await loadMachineStats();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(result.message || 'Failed to update machine status');
      }
    } catch (error) {
      setMessage('Error updating machine status');
    }
  };

  const getStatsForMachine = (machineId: string) => {
    return machineStats.find(stat => stat.machineId === machineId);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Machine Management
        </h2>
        
        {isSuperAdmin && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Machine
          </button>
        )}
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.includes('successfully') || message.includes('updated')
            ? 'bg-green-100 text-green-700 border border-green-200'
            : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Create Machine Form */}
      {showCreateForm && isSuperAdmin && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
          <h3 className="font-medium text-blue-900 mb-3">Create New Machine</h3>
          <form onSubmit={handleCreateMachine} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Machine Name *
                </label>
                <input
                  type="text"
                  value={newMachine.name}
                  onChange={(e) => setNewMachine({...newMachine, name: e.target.value})}
                  placeholder="e.g. Uppsala Machine #4"
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={newMachine.city}
                  onChange={(e) => setNewMachine({...newMachine, city: e.target.value})}
                  placeholder="e.g. Uppsala"
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Location *
              </label>
              <input
                type="text"
                value={newMachine.location}
                onChange={(e) => setNewMachine({...newMachine, location: e.target.value})}
                placeholder="e.g. Uppsala, Sweden"
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Machine'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Machines Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <Settings className="w-6 h-6 text-blue-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-blue-900">{machines.length}</p>
          <p className="text-sm text-blue-700">Total Machines</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <Activity className="w-6 h-6 text-green-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-green-900">
            {machines.filter(m => m.isActive).length}
          </p>
          <p className="text-sm text-green-700">Active Machines</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <BarChart3 className="w-6 h-6 text-purple-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-purple-900">
            {machineStats.reduce((sum, stat) => sum + stat.totalCleanings, 0)}
          </p>
          <p className="text-sm text-purple-700">Total Cleanings</p>
        </div>
      </div>

      {/* Machines List */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-800">All Machines</h3>
        
        {machines.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No machines found</p>
            {isSuperAdmin && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
              >
                Create your first machine
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {machines.map((machine) => {
              const stats = getStatsForMachine(machine.id);
              return (
                <div
                  key={machine.id}
                  className={`border rounded-lg p-4 transition-all ${
                    machine.isActive 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        {machine.isActive ? (
                          <Power className="w-4 h-4 text-green-600" />
                        ) : (
                          <PowerOff className="w-4 h-4 text-red-600" />
                        )}
                        {machine.name}
                      </h4>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                        <MapPin className="w-3 h-3" />
                        {machine.location}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        machine.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {machine.isActive ? 'Active' : 'Inactive'}
                      </span>
                      
                      {isSuperAdmin && (
                        <button
                          onClick={() => handleToggleStatus(machine.id, machine.isActive)}
                          className={`p-1 rounded hover:bg-white transition-colors ${
                            machine.isActive ? 'text-red-600' : 'text-green-600'
                          }`}
                          title={machine.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {machine.isActive ? (
                            <PowerOff className="w-4 h-4" />
                          ) : (
                            <Power className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Machine Statistics */}
                  {stats && (
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-lg font-bold text-blue-600">
                          {stats.totalCleanings}
                        </p>
                        <p className="text-xs text-gray-600">Cleanings</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-green-600">
                          {stats.totalEarnings} SEK
                        </p>
                        <p className="text-xs text-gray-600">Earnings</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-purple-600">
                          {stats.assignedCleaners.length}
                        </p>
                        <p className="text-xs text-gray-600">Cleaners</p>
                      </div>
                    </div>
                  )}

                  {/* Last Cleaning Info */}
                  {stats?.lastCleaning && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Last cleaned: {new Date(stats.lastCleaning as string).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Permission Notice */}
      {!isSuperAdmin && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm">
              Only Superior Admins can create and modify machines. Contact a Superior Admin for machine management.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MachineManagementDashboard;