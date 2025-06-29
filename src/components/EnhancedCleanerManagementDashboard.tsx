// src/components/EnhancedCleanerManagementDashboard.tsx (With Read-Only Support)
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Edit, 
  MapPin, 
  Coins, 
  ToggleLeft, 
  ToggleRight,
  Settings,
  Mail,
  Calendar,
  Activity,
  Trash2
} from 'lucide-react';
import { getAllCleaners, getAllCleanerStats, updateCleanerStatus } from '../firebase/userManagement';
import { getMachines } from '../firebase/firestore';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { CleanerProfile, Machine, CleanerStats } from '../types';
import CreateCleanerForm from './CreateCleanerForm';
import EditCleanerModal from './EditCleanerModal';

interface EnhancedCleanerManagementDashboardProps {
  currentUserUid: string;
  readOnly?: boolean;
}

const EnhancedCleanerManagementDashboard: React.FC<EnhancedCleanerManagementDashboardProps> = ({
  currentUserUid,
  readOnly = false,
}) => {
  const [cleaners, setCleaners] = useState<CleanerProfile[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [cleanerStats, setCleanerStats] = useState<CleanerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCleaner, setEditingCleaner] = useState<CleanerProfile | null>(null);
  const [deletingCleaner, setDeletingCleaner] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load data separately to avoid complex queries
      const [cleanersData, machinesData] = await Promise.all([
        getAllCleaners(),
        getMachines()
      ]);
      
      setCleaners(cleanersData);
      setMachines(machinesData);

      // Load stats individually to avoid index issues
      try {
        const statsData = await getAllCleanerStats();
        setCleanerStats(statsData);
      } catch (statsError) {
        console.log('Stats loading failed, continuing without stats:', statsError);
        setCleanerStats([]); // Continue without stats if there's an issue
      }
      
    } catch (error) {
      setMessage('Error loading cleaner data');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    loadData();
    setMessage('Cleaner created successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleEditSuccess = () => {
    loadData();
    setMessage('Cleaner updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteCleaner = async (cleaner: CleanerProfile) => {
    const confirmMessage = `Are you sure you want to DELETE ${cleaner.name}?\n\nThis will:\n• Delete their account permanently\n• Remove all their data\n• This CANNOT be undone!\n\nType "DELETE" to confirm:`;
    
    const confirmation = prompt(confirmMessage);
    if (confirmation !== 'DELETE') {
      return;
    }

    setDeletingCleaner(cleaner.uid);
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'users', cleaner.uid));
      
      // Note: Can't delete from Firebase Auth from client side
      // That requires admin SDK
      
      setMessage(`✅ ${cleaner.name} deleted from database. Note: Email may still be registered in Firebase Auth - delete manually from console if needed.`);
      loadData();
    } catch (error: any) {
      setMessage(`❌ Failed to delete cleaner: ${error.message}`);
    } finally {
      setDeletingCleaner(null);
    }
  };

  const handleToggleStatus = async (cleaner: CleanerProfile) => {
    try {
      await updateCleanerStatus(cleaner.uid, !cleaner.isActive);
      setMessage(`${cleaner.name} ${!cleaner.isActive ? 'activated' : 'deactivated'} successfully!`);
      loadData();
    } catch (error: any) {
      setMessage(`Failed to update status: ${error.message}`);
    }
  };

  const getMachineForCleaner = (cleanerId: string) => {
    const cleaner = cleaners.find(c => c.uid === cleanerId);
    if (!cleaner?.assignedMachineId) return null;
    return machines.find(m => m.id === cleaner.assignedMachineId);
  };

  const getStatsForCleaner = (cleanerId: string) => {
    return cleanerStats.find(stats => stats.cleanerId === cleanerId);
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Cleaner Management {readOnly && '(Read-Only)'}
        </h2>
        
        {!readOnly && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Cleaner
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

      {/* Read-Only Notice */}
      {readOnly && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800">
            <Users className="w-4 h-4" />
            <span className="font-medium">Read-Only Mode:</span>
          </div>
          <p className="text-blue-700 text-sm mt-1">
            You can view all cleaner information but cannot edit, create, or delete cleaners. Contact a Superior Admin for cleaner management.
          </p>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <Users className="w-6 h-6 text-blue-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-blue-900">{cleaners.length}</p>
          <p className="text-sm text-blue-700">Total Cleaners</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <Activity className="w-6 h-6 text-green-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-green-900">
            {cleaners.filter(c => c.isActive).length}
          </p>
          <p className="text-sm text-green-700">Active Cleaners</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <Settings className="w-6 h-6 text-purple-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-purple-900">
            {cleaners.filter(c => c.assignedMachineId).length}
          </p>
          <p className="text-sm text-purple-700">Assigned to Machines</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg text-center">
          <Coins className="w-6 h-6 text-orange-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-orange-900">
            {cleanerStats.reduce((sum, stats) => sum + stats.totalCleanings, 0)}
          </p>
          <p className="text-sm text-orange-700">Total Cleanings</p>
        </div>
      </div>

      {/* Cleaners List */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-800">All Cleaners</h3>
        
        {cleaners.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">No cleaners found</p>
            {!readOnly && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
              >
                Create your first cleaner
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {cleaners.map((cleaner) => {
              const assignedMachine = getMachineForCleaner(cleaner.uid);
              const stats = getStatsForCleaner(cleaner.uid);
              
              return (
                <div
                  key={cleaner.uid}
                  className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                    cleaner.isActive 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        {cleaner.isActive ? (
                          <ToggleRight className="w-4 h-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-4 h-4 text-red-600" />
                        )}
                        {cleaner.name}
                      </h4>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                        <Mail className="w-3 h-3" />
                        {cleaner.email}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        cleaner.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {cleaner.isActive ? 'Active' : 'Inactive'}
                      </span>
                      
                      {!readOnly && (
                        <>
                          <button
                            onClick={() => handleToggleStatus(cleaner)}
                            className="p-1 rounded hover:bg-white transition-colors text-blue-600 hover:text-blue-800"
                            title={cleaner.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {cleaner.isActive ? (
                              <ToggleRight className="w-4 h-4" />
                            ) : (
                              <ToggleLeft className="w-4 h-4" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => setEditingCleaner(cleaner)}
                            className="p-1 rounded hover:bg-white transition-colors text-blue-600 hover:text-blue-800"
                            title="Edit cleaner"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteCleaner(cleaner)}
                            disabled={deletingCleaner === cleaner.uid}
                            className="p-1 rounded hover:bg-white transition-colors text-red-600 hover:text-red-800 disabled:opacity-50"
                            title="Delete cleaner permanently"
                          >
                            {deletingCleaner === cleaner.uid ? (
                              <div className="w-4 h-4 border border-red-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Machine Assignment */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-3 h-3 text-gray-500" />
                      <span className="font-medium">Machine:</span>
                      {assignedMachine ? (
                        <span className="text-blue-600">{assignedMachine.name}</span>
                      ) : (
                        <span className="text-red-500">No assignment</span>
                      )}
                    </div>
                    {assignedMachine && (
                      <p className="text-xs text-gray-500 ml-5">
                        {assignedMachine.location}
                      </p>
                    )}
                  </div>

                  {/* Payment Rate */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Coins className="w-3 h-3 text-gray-500" />
                      <span className="font-medium">Rate:</span>
                      <span className="text-green-600 font-bold">
                        {cleaner.paymentRate || 100} SEK
                      </span>
                    </div>
                  </div>

                  {/* Statistics */}
                  {stats && (
                    <div className="grid grid-cols-3 gap-3 text-center pt-3 border-t border-gray-200">
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
                          {stats.paymentRate} SEK
                        </p>
                        <p className="text-xs text-gray-600">Per Cleaning</p>
                      </div>
                    </div>
                  )}

                  {/* Created Date */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>Created: {new Date(cleaner.createdAt as string).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {!readOnly && (
        <>
          {showCreateForm && (
            <CreateCleanerForm
              onClose={() => setShowCreateForm(false)}
              onSuccess={handleCreateSuccess}
              currentUserUid={currentUserUid}
            />
          )}

          {editingCleaner && (
            <EditCleanerModal
              cleaner={editingCleaner}
              onClose={() => setEditingCleaner(null)}
              onSuccess={handleEditSuccess}
            />
          )}
        </>
      )}
    </div>
  );
};

export default EnhancedCleanerManagementDashboard;