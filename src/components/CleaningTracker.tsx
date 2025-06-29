// src/components/CleaningTracker.tsx (Complete with EmailJS Integration)
import type { User as FirebaseUser } from 'firebase/auth';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { CheckCircle, LogOut, Mail, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { loginUser, logoutUser, onAuthChange } from '../firebase/auth';
import { auth } from '../firebase/config';
import {
  addCleaning,
  archiveAndResetCleanings,
  getArchiveEntries,
  getCleanings,
  getPaymentRate,
  setPaymentRate,
  getMachine // Machine lookup
} from '../firebase/firestore';
import { 
  isSuperiorAdmin, 
  isAnyAdmin, 
  getUserProfile // User profile lookup
} from '../firebase/userManagement';
import type { ArchiveEntry, Cleaning, CleanerProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import AdminDashboard from './AdminDashboard';
import LoginForm from './LoginForm';
import LanguageSwitcher from './LanguageSwitcher';
// 🚀 EmailJS Integration
import { FreeNotificationService } from '../services/emailJSService';

const CleaningTracker: React.FC = () => {
  const { t, language } = useLanguage();
  
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cleanings, setCleanings] = useState<Cleaning[]>([]);
  const [paymentRate, setPaymentRateState] = useState<number>(100);
  const [newRate, setNewRate] = useState('');
  const [message, setMessage] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [paymentHistory, setPaymentHistory] = useState<ArchiveEntry[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [filteredArchive, setFilteredArchive] = useState<ArchiveEntry[]>([]);
  const [userProfile, setUserProfile] = useState<CleanerProfile | null>(null);
  
  // 🚀 EmailJS states
  const [isLoggingCleaning, setIsLoggingCleaning] = useState(false);
  const [lastEmailStatus, setLastEmailStatus] = useState<'sent' | 'failed' | null>(null);
  const [assignedMachine, setAssignedMachine] = useState<any>(null);

  const isSuperAdmin = user?.email ? isSuperiorAdmin(user.email) : false;
  const isRegularAdmin = user?.email ? isAnyAdmin(user.email) : false;

  // Helper function to get user display name
  const getUserDisplayName = () => {
    if (userProfile?.name) {
      return userProfile.name;
    }
    
    if (user?.displayName) {
      return user.displayName;
    }
    
    if (user?.email) {
      const emailUsername = user.email.split('@')[0];
      return emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1);
    }
    
    return 'there';
  };

  // Helper function to safely convert timestamps to Date
  const convertTimestampToDate = (timestamp: any): Date => {
    if (typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp) {
      return timestamp.toDate();
    } else if (timestamp instanceof Date) {
      return timestamp;
    } else {
      return new Date(timestamp as string);
    }
  };

  // Apply date filter function
  const applyArchiveDateFilter = () => {
    if (!startDate || !endDate) {
      setMessage(t.selectBothDates);
      return;
    }

    const from = new Date(startDate);
    from.setHours(0, 0, 0, 0);
    
    const to = new Date(endDate);
    to.setHours(23, 59, 59, 999);

    const filtered = paymentHistory.filter((entry) => {
      const entryDate = convertTimestampToDate(entry.timestamp);
      return entryDate >= from && entryDate <= to;
    });

    setFilteredArchive(filtered);
    setMessage(`${t.applyFilter}: ${filtered.length} entries from ${startDate} to ${endDate}`);
  };

  // Clear filter function
  const clearArchiveFilter = () => {
    setStartDate('');
    setEndDate('');
    setFilteredArchive([]);
    setMessage(t.filterCleared);
  };

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      setInitialLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      loadData();
      loadUserProfile();
      // 🚀 Request notification permission
      FreeNotificationService.requestNotificationPermission();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    try {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
      
      // 🚀 Load assigned machine details
      if (profile?.assignedMachineId) {
        try {
          const machine = await getMachine(profile.assignedMachineId);
          setAssignedMachine(machine);
        } catch (error) {
          console.error('Failed to load assigned machine:', error);
        }
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

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
      setMessage(t.failedToLoad + ': ' + err.message);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) return setMessage(t.loginRequired);
    try {
      await loginUser(email, password);
      setMessage(t.loggedIn);
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setMessage(t.loginFailed + ': ' + err.message);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setCleanings([]);
    setPaymentRateState(100);
  };

  // 🚀 ENHANCED CLEANING FUNCTION - Now with EmailJS notifications
  const handleCleaning = async () => {
    if (!user) return;
    
    const confirmed = window.confirm(t.confirmCleaning);
    if (!confirmed) return;
    
    setIsLoggingCleaning(true);
    setLastEmailStatus(null);
    
    try {
      // Get the cleaner's profile to find their assigned machine
      const cleanerProfile = await getUserProfile(user.uid);
      
      let machineId = null;
      let machineName = 'Fluffy Candy Machine #1'; // Fallback
      let machineLocation = 'Uppsala, Sweden'; // Fallback
      let paymentRate = 100; // Default rate
      let machine = null;

      if (cleanerProfile) {
        // Use cleaner's assigned machine if available
        if (cleanerProfile.assignedMachineId) {
          machineId = cleanerProfile.assignedMachineId;
          paymentRate = cleanerProfile.paymentRate || 100;
          
          // Get machine details
          machine = await getMachine(cleanerProfile.assignedMachineId);
          if (machine) {
            machineName = machine.name;
            machineLocation = machine.location || 'Uppsala, Sweden';
          }
        } else {
          // Use cleaner's individual rate even if no machine assigned
          paymentRate = cleanerProfile.paymentRate || 100;
        }
      }

      // Create enhanced cleaning data
      const cleaningData = {
        cleanerId: user.uid,
        cleanerName: getUserDisplayName(),
        machine: machineName, // Keep for backward compatibility
        // Enhanced fields:
        machineId: machineId || undefined,
        machineName: machineName,
        paymentRate: paymentRate,
      };

      console.log('🚀 Adding enhanced cleaning:', cleaningData);

      // Add cleaning to database
      await addCleaning(cleaningData);
      
      // 🚀 Send EmailJS notification
      try {
        await FreeNotificationService.notifyCleaningLogged(
          getUserDisplayName(),
          machineName,
          machineLocation,
          paymentRate
        );
        setLastEmailStatus('sent');
        console.log('✅ Email notification sent successfully');
      } catch (emailError) {
        console.error('❌ Failed to send email notification:', emailError);
        setLastEmailStatus('failed');
      }

      // Reload cleanings data
      const updated = await getCleanings();
      setCleanings(updated);
      
      // Show success message with email status
      const emailStatusText = lastEmailStatus === 'sent' 
        ? '📧 Email notification sent to contact@fluffycandy.se'
        : lastEmailStatus === 'failed' 
        ? '⚠️ Email notification failed (cleaning still recorded)'
        : '📧 Sending email notification...';
        
      setMessage(`${t.cleaningRecorded} (${machineName} - ${paymentRate} SEK)\n${emailStatusText}`);
      
    } catch (err: any) {
      setMessage(t.failedToLog + ': ' + err.message);
      setLastEmailStatus('failed');
    } finally {
      setIsLoggingCleaning(false);
    }
  };

  const handleRateSubmit = async () => {
    const value = parseFloat(newRate);
    if (isNaN(value) || value <= 0) return setMessage(t.enterValidRate);
    try {
      await setPaymentRate(value);
      setPaymentRateState(value);
      setNewRate('');
      setMessage(t.rateUpdated);
    } catch (err: any) {
      setMessage('Error: ' + err.message);
    }
  };

  const handleReset = async () => {
    // Create modal with translated text
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
        <h3 class="text-lg font-semibold mb-4">${t.whoPaid}</h3>
        <select id="paidBySelect" class="w-full border rounded px-3 py-2 mb-4">
          <option value="">${t.selectPerson}</option>
          <option value="Youssef Kouliana">Youssef Kouliana</option>
          <option value="Paul Moses">Paul Moses</option>
          <option value="Maxim Moses">Maxim Moses</option>
        </select>
        <div class="flex gap-2">
          <button id="confirmBtn" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex-1">
            ${t.confirmReset}
          </button>
          <button id="cancelBtn" class="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 flex-1">
            ${t.cancel}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const handleModalResponse = () => {
      return new Promise<string | null>((resolve) => {
        const confirmBtn = modal.querySelector('#confirmBtn') as HTMLButtonElement;
        const cancelBtn = modal.querySelector('#cancelBtn') as HTMLButtonElement;
        const select = modal.querySelector('#paidBySelect') as HTMLSelectElement;

        confirmBtn.addEventListener('click', async () => {
          const selectedPerson = select.value;
          if (!selectedPerson) {
            alert(t.pleaseSelect);
            return;
          }
          
          // 🚀 Send payment notification before removing modal
          try {
            const uniqueCleaners = [...new Set(cleanings.map(c => c.cleanerName))];
            const totalAmount = cleanings.reduce((sum, c) => sum + (c.paymentRate || paymentRate), 0);
            
            await FreeNotificationService.notifyPaymentProcessed(
              selectedPerson,
              totalAmount,
              cleanings.length,
              uniqueCleaners
            );
            console.log('✅ Payment email notification sent');
          } catch (emailError) {
            console.error('❌ Failed to send payment email:', emailError);
          }
          
          document.body.removeChild(modal);
          resolve(selectedPerson);
        });

        cancelBtn.addEventListener('click', () => {
          document.body.removeChild(modal);
          resolve(null);
        });

        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            document.body.removeChild(modal);
            resolve(null);
          }
        });
      });
    };

    try {
      const selectedPerson = await handleModalResponse();
      if (!selectedPerson) return;

      await archiveAndResetCleanings(selectedPerson, paymentRate);
      const updated = await getCleanings();
      const archive = await getArchiveEntries();
      setCleanings(updated);
      setPaymentHistory(archive);
      setMessage(`${t.cleaningsArchived}: ${selectedPerson} - Email notification sent`);
    } catch (err: any) {
      setMessage(t.errorDuringReset + ': ' + err.message);
    }
  };

  if (initialLoading) return <div className="p-10 text-center">{t.loadingData}</div>;

  if (!user) {
    return (
      <div>
        <div className="flex justify-end p-4">
          <LanguageSwitcher />
        </div>
        <LoginForm
          email={email}
          password={password}
          loading={false}
          message={message}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onLogin={handleLogin}
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleLogin();
          }}
          onCreateTestUsers={() => {
            createUserWithEmailAndPassword(auth, 'cleaner@yourdomain.com', 'password123');
            createUserWithEmailAndPassword(auth, 'admin@yourdomain.com', 'password123');
          }}
        />
      </div>
    );
  }

  const totalPayment = cleanings.length * paymentRate;

  const todaysCleanings = cleanings.filter(c => {
    const now = new Date();
    const ts = convertTimestampToDate(c.timestamp);
    return c.cleanerId === user?.uid && ts.toDateString() === now.toDateString();
  });

  const userCleanings = cleanings.filter(c => c.cleanerId === user?.uid);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t.dashboard}</h1>
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          <button onClick={handleLogout} className="text-gray-600 hover:text-black">
            <LogOut className="inline w-4 h-4 mr-1" /> {t.logout}
          </button>
        </div>
      </div>

      {message && (
        <div className="mb-4 p-4 rounded-lg border">
          <p className="text-center text-pink-600 whitespace-pre-line">{message}</p>
        </div>
      )}

      {isRegularAdmin ? (
        <AdminDashboard
          cleanings={cleanings}
          paymentRate={paymentRate}
          totalPayment={totalPayment}
          newRate={newRate}
          onRateChange={setNewRate}
          onRateSubmit={handleRateSubmit}
          onResetCleanings={handleReset}
          isSuperAdmin={isSuperAdmin}
          currentUserEmail={user?.email || ''}
          currentUserUid={user?.uid || ''}
          paymentHistory={paymentHistory}
          filteredArchive={filteredArchive}
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          onApplyDateFilter={applyArchiveDateFilter}
          onClearFilter={clearArchiveFilter}
        />
      ) : (
        <div className="bg-white p-6 rounded shadow">
          {/* Enhanced Greeting Message with Machine Info */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg mb-6 text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              {language === 'sv' 
                ? `👋 Hej, ${getUserDisplayName()}!`
                : language === 'uz'
                ? `👋 Salom, ${getUserDisplayName()}!`
                : `👋 Hello, ${getUserDisplayName()}!`
              }
            </h2>
            <p className="text-sm text-gray-600">
              {language === 'sv' 
                ? 'Vi hoppas att du har en bra dag!' 
                : language === 'uz'
                ? 'Sizga yaxshi kun tilaymiz!'
                : 'Hope you have a wonderful day!'
              }
            </p>
            
            {/* 🚀 Enhanced machine info display */}
            {assignedMachine ? (
              <div className="mt-3 p-3 bg-blue-100 rounded-lg">
                <p className="text-sm text-blue-800 font-medium">
                  🏭 <strong>Your Machine:</strong> {assignedMachine.name}
                </p>
                <p className="text-xs text-blue-600">
                  📍 {assignedMachine.location} • 💰 {userProfile?.paymentRate || 100} SEK per cleaning
                </p>
              </div>
            ) : userProfile?.assignedMachineId ? (
              <div className="mt-3 p-3 bg-yellow-100 rounded-lg">
                <p className="text-sm text-yellow-800">
                  🔄 Loading machine details...
                </p>
              </div>
            ) : (
              <div className="mt-3 p-3 bg-orange-100 rounded-lg">
                <p className="text-sm text-orange-800">
                  ⚠️ No machine assigned. Contact administrator.
                </p>
              </div>
            )}
          </div>

          <h3 className="text-lg font-semibold mb-4 text-center">{t.cleanerDashboard}</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-pink-50 p-4 rounded-lg text-center">
              <CheckCircle className="w-6 h-6 text-pink-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-pink-900">{todaysCleanings.length}</p>
              <p className="text-sm text-pink-700">{t.todaysCleanings}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-xl font-bold text-green-900">{userCleanings.length}</p>
              <p className="text-sm text-green-700">{t.totalThisPeriod}</p>
            </div>
          </div>

          {/* 🚀 Enhanced cleaning button with email status */}
          <div className="text-center mb-6">
            <button
              onClick={handleCleaning}
              disabled={isLoggingCleaning}
              className={`
                px-6 py-3 rounded-lg font-semibold text-white transition-all
                ${isLoggingCleaning 
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-pink-600 hover:bg-pink-700 transform hover:scale-105'
                }
              `}
            >
              {isLoggingCleaning ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Logging & Sending Email...</span>
                </div>
              ) : (
                <>
                  <CheckCircle className="inline w-5 h-5 mr-2" />
                  {t.cleanedMachine} & Send Email
                </>
              )}
            </button>
            
            {/* 🚀 Email status indicator */}
            {lastEmailStatus && (
              <div className="mt-2 flex items-center justify-center space-x-1">
                {lastEmailStatus === 'sent' ? (
                  <>
                    <Mail className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">Email sent to contact@fluffycandy.se</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <span className="text-sm text-orange-600">Email failed (cleaning recorded)</span>
                  </>
                )}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-3">{t.myRecentCleanings}</h3>
            <div className="overflow-x-auto w-full">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b bg-pink-50 text-gray-700">
                    <th className="text-left py-2 px-2">{t.time}</th>
                    <th className="text-left py-2 px-2">{t.machine}</th>
                    <th className="text-right py-2 px-2">{t.payment}</th>
                    <th className="text-center py-2 px-2">📧</th>
                  </tr>
                </thead>
                <tbody>
                  {userCleanings.slice(0, 10).map((c) => (
                    <tr key={c.id} className="border-b hover:bg-pink-50 transition">
                      <td className="py-2 px-2">{convertTimestampToDate(c.timestamp).toLocaleString()}</td>
                      <td className="py-2 px-2">
                        {c.machineName || c.machine}
                        {c.machineId && (
                          <span className="ml-1 text-xs text-green-600">✓</span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-right">
                        {(c.paymentRate || paymentRate).toFixed(2)} SEK
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span className="text-xs text-green-600" title="Email notification sent">
                          ✓
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {userCleanings.length === 0 && (
                <p className="text-gray-500 text-center py-6 text-sm">{t.noCleanings}</p>
              )}
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-center text-sm text-gray-600">
              <span className="font-semibold">{t.totalEarnings}: </span>
              <span className="text-green-600 font-bold">
                {userCleanings.reduce((sum, c) => sum + (c.paymentRate || paymentRate), 0).toFixed(2)} SEK
              </span>
            </p>
            {/* 🚀 Email notification info */}
            <p className="text-center text-xs text-gray-500 mt-1">
              📧 All cleanings automatically notify contact@fluffycandy.se
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CleaningTracker;