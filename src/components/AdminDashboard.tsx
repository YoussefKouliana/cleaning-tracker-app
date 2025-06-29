// src/components/AdminDashboard.tsx (Enhanced with Multi-language Support)
import React, { useState } from 'react';
import type { Cleaning } from '../types';
import { 
  BarChart3, 
  CheckCircle, 
  Clock, 
  Coins, 
  Settings,
  Users,
  Archive,
  Activity,
  User,
  Calendar
} from 'lucide-react';
import PaymentRateForm from './PaymentRateForm';
import CleaningTable from './CleaningTable';
import MachineManagementDashboard from './MachineManagement';
import EnhancedCleanerManagementDashboard from './EnhancedCleanerManagementDashboard';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  cleanings: Cleaning[];
  paymentRate: number;
  totalPayment: number;
  newRate: string;
  onRateChange: (val: string) => void;
  onRateSubmit: () => void;
  onResetCleanings: () => void;
  isSuperAdmin?: boolean;
  currentUserEmail: string;
  currentUserUid: string;
  // Archive props
  paymentHistory: any[];
  filteredArchive: any[];
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  onApplyDateFilter: () => void;
  onClearFilter: () => void;
}

type TabType = 'overview' | 'machines' | 'cleaners' | 'archive';

const AdminDashboard: React.FC<Props> = ({
  cleanings,
  paymentRate,
  totalPayment,
  newRate,
  onRateChange,
  onRateSubmit,
  onResetCleanings,
  isSuperAdmin = false,
  currentUserEmail,
  currentUserUid,
  paymentHistory,
  filteredArchive,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  onApplyDateFilter,
  onClearFilter,
}) => {
  const { language } = useLanguage(); // Get current language
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Translations for admin interface
  const translations = {
    en: {
      dashboard: 'Dashboard',
      welcome: 'Welcome back',
      overview: 'Overview',
      machines: 'Machines',
      cleaners: 'Cleaners',
      archive: 'Archive',
      totalCleanings: 'Total Cleanings',
      totalPayment: 'Total Payment',
      defaultRate: 'Default Rate',
      recentCleanings: 'Recent Cleanings',
      resetCleanings: 'Reset Cleanings (Paid)',
      machineManagement: 'Machine management',
      cleanerManagement: 'Cleaner management',
      paymentHistory: 'Payment history',
      paymentArchive: 'Payment Archive',
      filterByDate: 'Filter by Date Range',
      startDate: 'Start Date',
      endDate: 'End Date',
      applyFilter: 'Apply Filter',
      clearFilter: 'Clear Filter',
      paidBy: 'Paid by',
      cleaningsArchived: 'cleanings archived',
      noPaymentHistory: 'No payment history found',
      activeTab: 'Active Tab',
      lastUpdated: 'Last updated',
      superiorAdmin: 'Superior Admin',
      admin: 'Admin'
    },
    sv: {
      dashboard: 'Instrumentpanel',
      welcome: 'Välkommen tillbaka',
      overview: 'Översikt',
      machines: 'Maskiner',
      cleaners: 'Städare',
      archive: 'Arkiv',
      totalCleanings: 'Totala Städningar',
      totalPayment: 'Total Betalning',
      defaultRate: 'Standardpris',
      recentCleanings: 'Senaste Städningar',
      resetCleanings: 'Återställ Städningar (Betald)',
      machineManagement: 'Maskinhantering',
      cleanerManagement: 'Städarhantering',
      paymentHistory: 'Betalningshistorik',
      paymentArchive: 'Betalningsarkiv',
      filterByDate: 'Filtrera efter Datumintervall',
      startDate: 'Startdatum',
      endDate: 'Slutdatum',
      applyFilter: 'Tillämpa Filter',
      clearFilter: 'Rensa Filter',
      paidBy: 'Betald av',
      cleaningsArchived: 'städningar arkiverade',
      noPaymentHistory: 'Ingen betalningshistorik hittades',
      activeTab: 'Aktiv Flik',
      lastUpdated: 'Senast uppdaterad',
      superiorAdmin: 'Överordnad Admin',
      admin: 'Admin'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const tabs = [
    {
      id: 'overview' as TabType,
      label: t.overview,
      icon: BarChart3,
      description: t.dashboard
    },
    {
      id: 'machines' as TabType,
      label: t.machines,
      icon: Settings,
      description: t.machineManagement
    },
    {
      id: 'cleaners' as TabType,
      label: t.cleaners,
      icon: Users,
      description: t.cleanerManagement
    },
    {
      id: 'archive' as TabType,
      label: t.archive,
      icon: Archive,
      description: t.paymentHistory
    }
  ];

  // All admins can see all tabs now
  const availableTabs = tabs;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-pink-50 p-4 rounded-lg text-center">
                <CheckCircle className="w-6 h-6 text-pink-600 mx-auto mb-1" />
                <p className="text-xl font-bold text-pink-900">{cleanings.length}</p>
                <p className="text-sm text-pink-700">{t.totalCleanings}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <Coins className="w-6 h-6 text-green-600 mx-auto mb-1" />
                <p className="text-xl font-bold text-green-900">{totalPayment.toFixed(2)} SEK</p>
                <p className="text-sm text-green-700">{t.totalPayment}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <Clock className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                <p className="text-xl font-bold text-purple-900">{paymentRate} SEK</p>
                <p className="text-sm text-purple-700">{t.defaultRate}</p>
              </div>
            </div>

            {/* Payment Rate Management */}
            <PaymentRateForm
              newRate={newRate}
              onRateChange={onRateChange}
              onRateSubmit={onRateSubmit}
            />

            {/* Recent Cleanings */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                {t.recentCleanings}
              </h3>
              <CleaningTable cleanings={cleanings} paymentRate={paymentRate} />
            </div>

            {/* Reset Button */}
            <div className="text-right">
              <button
                onClick={onResetCleanings}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm transition-colors"
              >
                {t.resetCleanings}
              </button>
            </div>
          </div>
        );

      case 'machines':
        return <MachineManagementDashboard isSuperAdmin={isSuperAdmin} currentUserUid={currentUserUid} />;

      case 'cleaners':
        return isSuperAdmin ? (
          <EnhancedCleanerManagementDashboard currentUserUid={currentUserUid} />
        ) : (
          <EnhancedCleanerManagementDashboard currentUserUid={currentUserUid} readOnly={true} />
        );

      case 'archive':
        return (
          <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
              <Archive className="w-5 h-5" />
              {t.paymentArchive}
            </h3>
            
            {/* Archive Filter Controls */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium text-gray-700 mb-3">{t.filterByDate}</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {t.startDate}
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {t.endDate}
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={onApplyDateFilter}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                  >
                    {t.applyFilter}
                  </button>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={onClearFilter}
                    className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 text-sm"
                  >
                    {t.clearFilter}
                  </button>
                </div>
              </div>
            </div>

            {/* Archive Display */}
            <div className="space-y-3">
              {(filteredArchive.length > 0 ? filteredArchive : paymentHistory).map((entry, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-gray-900">
                        {t.paidBy}: {entry.paidBy}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <Coins className="w-4 h-4" />
                      <span className="font-bold">{entry.totalAmount} SEK</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(entry.timestamp.toDate ? entry.timestamp.toDate() : entry.timestamp).toLocaleString()}</span>
                  </div>

                  <div className="text-sm">
                    <span className="text-gray-600">
                      {entry.logs.length} {t.cleaningsArchived}
                    </span>
                  </div>
                </div>
              ))}
              
              {paymentHistory.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Archive className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t.noPaymentHistory}</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg lg:col-span-2">
      {/* Header */}
      <div className="border-b border-gray-200 p-5 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Fluffy Candy {isSuperAdmin ? t.superiorAdmin : t.admin} {t.dashboard}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {t.welcome}, {currentUserEmail}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-5 sm:px-6" aria-label="Tabs">
          {availableTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.charAt(0)}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-5 sm:p-6">
        {renderTabContent()}
      </div>

      {/* Quick Stats Footer */}
      <div className="border-t border-gray-200 bg-gray-50 px-5 sm:px-6 py-4 rounded-b-xl">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>{t.activeTab}: <strong>{availableTabs.find(t => t.id === activeTab)?.label}</strong></span>
            {isSuperAdmin && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {t.superiorAdmin}
              </span>
            )}
          </div>
          <div className="hidden sm:block">
            <span>{t.lastUpdated}: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;