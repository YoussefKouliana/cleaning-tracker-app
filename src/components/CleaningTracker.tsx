// src/components/CleaningTracker.tsx

import React, { useEffect, useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { loginUser, logoutUser, onAuthChange } from '../firebase/auth';
import {
  addCleaning,
  getCleanings,
  getPaymentRate,
  setPaymentRate,
  archiveAndResetCleanings,
  getArchiveEntries
} from '../firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import type { Cleaning, ArchiveEntry } from '../types';
import AdminDashboard from './AdminDashboard';
import ArchiveTable from './ArchiveTable';
import { LogIn, LogOut, CheckCircle } from 'lucide-react';

const CleaningTracker: React.FC = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cleanings, setCleanings] = useState<Cleaning[]>([]);
  const [paymentRate, setPaymentRateState] = useState<number>(10);
  const [newRate, setNewRate] = useState('');
  const [message, setMessage] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [showArchive, setShowArchive] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<ArchiveEntry[]>([]);

  const isAdmin = user?.email === 'admin@yourdomain.com';

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      setInitialLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [data, rate, archive] = await Promise.all([
        getCleanings(),
        getPaymentRate(),
        getArchiveEntries()
      ]);
      setCleanings(data);
      setPaymentRateState(rate);
      setPaymentHistory(archive);
    } catch (err: any) {
      setMessage('Failed to load data: ' + err.message);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) return setMessage('Email and password required');
    try {
      await loginUser(email, password);
      setMessage('Logged in!');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setMessage('Login failed: ' + err.message);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setCleanings([]);
    setPaymentRateState(10);
  };

  const handleCleaning = async () => {
    if (!user) return;
    const confirmed = window.confirm('Are you sure you cleaned the machine?');
    if (!confirmed) return;
    try {
      await addCleaning({
        cleanerId: user.uid,
        cleanerName: user.displayName || user.email || 'Unknown',
        machine: 'Fluffy Candy Machine #1'
      });
      const updated = await getCleanings();
      setCleanings(updated);
      setMessage('Cleaning recorded!');
    } catch (err: any) {
      setMessage('Failed to log cleaning: ' + err.message);
    }
  };

  const handleRateSubmit = async () => {
    const value = parseFloat(newRate);
    if (isNaN(value) || value <= 0) return setMessage('Enter a valid rate');
    try {
      await setPaymentRate(value);
      setPaymentRateState(value);
      setNewRate('');
      setMessage('Rate updated');
    } catch (err: any) {
      setMessage('Error: ' + err.message);
    }
  };

  const handleReset = async () => {
    const confirmed = window.confirm('Reset all cleanings and archive as paid?');
    if (!confirmed) return;
    try {
      await archiveAndResetCleanings(user?.email || 'admin', paymentRate);
      const updated = await getCleanings();
      const archive = await getArchiveEntries();
      setCleanings(updated);
      setPaymentHistory(archive);
      setMessage('Cleanings archived and reset');
    } catch (err: any) {
      setMessage('Error during reset: ' + err.message);
    }
  };

  if (initialLoading) return <div className="p-10 text-center">Loading...</div>;

  if (!user) {
    return (
      <div className="max-w-sm mx-auto p-6 bg-white rounded shadow mt-10">
        <h1 className="text-xl font-bold mb-4 text-center">Login to Fluffy Candy</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-2 w-full p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-2 w-full p-2 border rounded"
        />
        <button onClick={handleLogin} className="bg-pink-600 text-white w-full py-2 rounded">
          <LogIn className="inline w-4 h-4 mr-1" /> Login
        </button>
        <button
          onClick={() => {
            createUserWithEmailAndPassword(auth, 'cleaner@yourdomain.com', 'password123');
            createUserWithEmailAndPassword(auth, 'admin@yourdomain.com', 'password123');
          }}
          className="text-sm text-gray-600 mt-3 underline"
        >
          Create test users
        </button>
        {message && <p className="text-red-500 mt-2">{message}</p>}
      </div>
    );
  }

  const totalPayment = cleanings.length * paymentRate;

  const todaysCleanings = cleanings.filter(c => {
    const now = new Date();
    const ts = typeof c.timestamp === 'object' && 'toDate' in c.timestamp
      ? c.timestamp.toDate()
      : new Date(c.timestamp as string);
    return c.cleanerId === user.uid && ts.toDateString() === now.toDateString();
  });

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Fluffy Candy Dashboard</h1>
        <button onClick={handleLogout} className="text-gray-600 hover:text-black">
          <LogOut className="inline w-4 h-4 mr-1" /> Logout
        </button>
      </div>

      {message && <p className="text-center text-pink-600 mb-4">{message}</p>}

      {isAdmin && (
        <div className="text-right mb-4">
          <button
            onClick={() => setShowArchive(prev => !prev)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
          >
            {showArchive ? '⬅️ Back to Dashboard' : '📜 View Archive Payments'}
          </button>
        </div>
      )}

      {isAdmin ? (
        showArchive ? (
          <ArchiveTable paymentHistory={paymentHistory} />
        ) : (
          <AdminDashboard
            cleanings={cleanings}
            paymentRate={paymentRate}
            totalPayment={totalPayment}
            newRate={newRate}
            onRateChange={setNewRate}
            onRateSubmit={handleRateSubmit}
            onResetCleanings={handleReset}
          />
        )
      ) : (
        <div className="bg-white p-6 rounded shadow text-center">
          <h2 className="text-lg font-semibold mb-4">Cleaner Dashboard</h2>
          <p className="mb-2">Your cleanings today: {todaysCleanings.length}</p>
          <button
            onClick={handleCleaning}
            className="bg-pink-600 text-white px-4 py-2 rounded"
          >
            <CheckCircle className="inline w-4 h-4 mr-2" />
            I cleaned the machine
          </button>
        </div>
      )}
    </div>
  );
};

export default CleaningTracker;
