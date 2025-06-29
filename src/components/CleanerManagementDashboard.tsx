// src/components/CleanerManagementDashboard.tsx
import { useState, useEffect } from 'react';
import { Users, UserPlus, UserCheck, UserX } from 'lucide-react';
import { getAllCleaners, updateCleanerStatus } from '../firebase/userManagement';
import type { CleanerProfile } from '../types';
import CreateCleanerForm from './CreateCleanerForm';

interface Props {
  currentUserUid: string;
}

const CleanerManagementDashboard: React.FC<Props> = ({ currentUserUid }) => {
  const [cleaners, setCleaners] = useState<CleanerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadCleaners();
  }, []);

  const loadCleaners = async () => {
    try {
      setLoading(true);
      const cleanersList = await getAllCleaners();
      setCleaners(cleanersList);
    } catch (error: any) {
      setMessage('Failed to load cleaners: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (uid: string, currentStatus: boolean) => {
    try {
      await updateCleanerStatus(uid, !currentStatus);
      await loadCleaners(); // Refresh the list
      setMessage(`Cleaner ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage('Failed to update cleaner status: ' + error.message);
    }
  };

  const formatDate = (timestamp: any): string => {
    if (typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp) {
      return timestamp.toDate().toLocaleDateString();
    } else if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString();
    } else {
      return new Date(timestamp as string).toLocaleDateString();
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading cleaners...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Cleaner Management
        </h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Add New Cleaner
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.includes('successfully') 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Created</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {cleaners.map((cleaner) => (
              <tr key={cleaner.uid} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {cleaner.name}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {cleaner.email}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {formatDate(cleaner.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    cleaner.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {cleaner.isActive ? (
                      <>
                        <UserCheck className="w-3 h-3 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <UserX className="w-3 h-3 mr-1" />
                        Inactive
                      </>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleStatusToggle(cleaner.uid, cleaner.isActive)}
                    className={`text-sm px-3 py-1 rounded ${
                      cleaner.isActive
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {cleaner.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {cleaners.length === 0 && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No cleaners found</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Your First Cleaner
            </button>
          </div>
        )}
      </div>

      {showCreateForm && (
        <CreateCleanerForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            loadCleaners(); // This returns Promise<void> but we don't need to await it here
            setShowCreateForm(false);
          }}
          currentUserUid={currentUserUid}
        />
      )}
    </div>
  );
};

export default CleanerManagementDashboard;