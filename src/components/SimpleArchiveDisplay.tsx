// src/components/SimpleArchiveDisplay.tsx
import React, { useState, useEffect } from 'react';
import { Archive, Calendar, Coins, User } from 'lucide-react';
import { getArchiveEntries } from '../firebase/firestore';
import type { ArchiveEntry } from '../types';

const SimpleArchiveDisplay: React.FC = () => {
  const [archives, setArchives] = useState<ArchiveEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadArchives();
  }, []);

  const loadArchives = async () => {
    try {
      const archiveData = await getArchiveEntries();
      setArchives(archiveData);
    } catch (err) {
      setError('Failed to load payment history');
      console.error('Error loading archives:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    
    let date: Date;
    if (timestamp.toDate) {
      // Firestore Timestamp
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }
    
    return date.toLocaleDateString('sv-SE') + ' ' + date.toLocaleTimeString('sv-SE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <Archive className="w-12 h-12 mx-auto mb-3 text-red-400" />
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (archives.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Archive className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-lg font-medium">No payment history found</p>
        <p className="text-sm mt-1">Payment archives will appear here after resetting cleanings</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-800">Payment History</h4>
        <span className="text-sm text-gray-500">{archives.length} payments</span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {archives.map((archive, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-gray-900">
                  Paid by: {archive.paidBy}
                </span>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <Coins className="w-4 h-4" />
                <span className="font-bold">{archive.totalAmount} SEK</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(archive.timestamp)}</span>
            </div>

            <div className="text-sm">
              <span className="text-gray-600">
                {archive.logs.length} cleaning{archive.logs.length !== 1 ? 's' : ''} archived
              </span>
              
              {/* Show breakdown if multiple machines */}
              {archive.logs.length > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  {Array.from(new Set(archive.logs.map(log => log.machine || log.machineName || 'Unknown Machine')))
                    .map(machine => {
                      const machineCleanings = archive.logs.filter(
                        log => (log.machine || log.machineName) === machine
                      );
                      return (
                        <div key={machine} className="flex justify-between">
                          <span>{machine}:</span>
                          <span>{machineCleanings.length} cleaning{machineCleanings.length !== 1 ? 's' : ''}</span>
                        </div>
                      );
                    })
                  }
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimpleArchiveDisplay;