// src/contexts/LanguageContext.tsx
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

// Define the translations
const translations = {
  en: {
    // Header
    dashboard: 'Fluffy Candy Dashboard',
    logout: 'Logout',
    
    // Admin Dashboard
    adminDashboard: 'Fluffy Candy Admin Dashboard',
    totalCleanings: 'Total Cleanings',
    totalPayment: 'Total Payment',
    ratePerCleaning: 'Rate per Cleaning',
    resetCleanings: 'Reset Cleanings (Paid)',
    
    // Cleaner Dashboard
    cleanerDashboard: 'Cleaner Dashboard',
    todaysCleanings: "Today's Cleanings",
    totalThisPeriod: 'Total This Period',
    cleanedMachine: 'I cleaned the machine',
    myRecentCleanings: 'My Recent Cleanings',
    totalEarnings: 'Total earnings this period',
    
    // Tables
    cleaner: 'Cleaner',
    time: 'Time',
    machine: 'Machine',
    payment: 'Payment',
    recentCleanings: 'Recent Cleanings',
    noCleanings: 'No cleanings recorded yet',
    
    // Archive
    archivePayments: 'View Archive Payments',
    backToDashboard: 'Back to Dashboard',
    paymentHistoryArchive: 'Payment History Archive',
    paidBy: 'Paid By',
    date: 'Date',
    numCleanings: '# of Cleanings',
    totalAmount: 'Total Amount',
    startDate: 'Start Date',
    endDate: 'End Date',
    applyFilter: 'Apply Filter',
    clearFilter: 'Clear Filter',
    selectDateRange: 'Select a date range and click "Apply Filter" to view payment history.',
    
    // Forms and Actions
    newRate: 'New Rate',
    updateRate: 'Update Rate',
    confirmCleaning: 'Are you sure you cleaned the machine?',
    
    // Reset Modal
    whoPaid: 'Who paid for the cleanings?',
    selectPerson: 'Select a person...',
    confirmReset: 'Confirm Reset',
    cancel: 'Cancel',
    pleaseSelect: 'Please select who paid for the cleanings.',
    
    // Messages
    loginRequired: 'Email and password required',
    loggedIn: 'Logged in!',
    loginFailed: 'Login failed',
    cleaningRecorded: 'Cleaning recorded!',
    failedToLog: 'Failed to log cleaning',
    rateUpdated: 'Rate updated',
    enterValidRate: 'Enter a valid rate',
    selectBothDates: 'Please select both start and end dates.',
    filterCleared: 'Filter cleared - table is now empty',
    cleaningsArchived: 'Cleanings archived and reset - Paid by',
    errorDuringReset: 'Error during reset',
    loadingData: 'Loading...',
    failedToLoad: 'Failed to load data',
    
    // Login
    email: 'Email',
    password: 'Password',
    login: 'Login',
    createTestUsers: 'Create Test Users'
  },
  sv: {
    // Header
    dashboard: 'Fluffy Candy Instrumentpanel',
    logout: 'Logga ut',
    
    // Admin Dashboard
    adminDashboard: 'Fluffy Candy Admin Instrumentpanel',
    totalCleanings: 'Totala Rengöringar',
    totalPayment: 'Total Betalning',
    ratePerCleaning: 'Pris per Rengöring',
    resetCleanings: 'Återställ Rengöringar (Betalda)',
    
    // Cleaner Dashboard
    cleanerDashboard: 'Städare Instrumentpanel',
    todaysCleanings: 'Dagens Rengöringar',
    totalThisPeriod: 'Totalt Denna Period',
    cleanedMachine: 'Jag rengörde maskinen',
    myRecentCleanings: 'Mina Senaste Rengöringar',
    totalEarnings: 'Totala intäkter denna period',
    
    // Tables
    cleaner: 'Städare',
    time: 'Tid',
    machine: 'Maskin',
    payment: 'Betalning',
    recentCleanings: 'Senaste Rengöringar',
    noCleanings: 'Inga rengöringar registrerade än',
    
    // Archive
    archivePayments: 'Visa Arkivbetalningar',
    backToDashboard: 'Tillbaka till Instrumentpanel',
    paymentHistoryArchive: 'Betalningshistorik Arkiv',
    paidBy: 'Betald Av',
    date: 'Datum',
    numCleanings: '# av Rengöringar',
    totalAmount: 'Totalt Belopp',
    startDate: 'Startdatum',
    endDate: 'Slutdatum',
    applyFilter: 'Tillämpa Filter',
    clearFilter: 'Rensa Filter',
    selectDateRange: 'Välj ett datumintervall och klicka på "Tillämpa Filter" för att visa betalningshistorik.',
    
    // Forms and Actions
    newRate: 'Nytt Pris',
    updateRate: 'Uppdatera Pris',
    confirmCleaning: 'Är du säker på att du rengör maskinen?',
    
    // Reset Modal
    whoPaid: 'Vem betalade för rengöringarna?',
    selectPerson: 'Välj en person...',
    confirmReset: 'Bekräfta Återställning',
    cancel: 'Avbryt',
    pleaseSelect: 'Vänligen välj vem som betalade för rengöringarna.',
    
    // Messages
    loginRequired: 'E-post och lösenord krävs',
    loggedIn: 'Inloggad!',
    loginFailed: 'Inloggning misslyckades',
    cleaningRecorded: 'Rengöring registrerad!',
    failedToLog: 'Misslyckades med att logga rengöring',
    rateUpdated: 'Pris uppdaterat',
    enterValidRate: 'Ange ett giltigt pris',
    selectBothDates: 'Vänligen välj både start- och slutdatum.',
    filterCleared: 'Filter rensat - tabellen är nu tom',
    cleaningsArchived: 'Rengöringar arkiverade och återställda - Betald av',
    errorDuringReset: 'Fel under återställning',
    loadingData: 'Laddar...',
    failedToLoad: 'Misslyckades med att ladda data',
    
    // Login
    email: 'E-post',
    password: 'Lösenord',
    login: 'Logga in',
    createTestUsers: 'Skapa Testanvändare'
  },
  uz: {
    // Header
    dashboard: 'Fluffy Candy Boshqaruv Paneli',
    logout: 'Chiqish',
    
    // Admin Dashboard
    adminDashboard: 'Fluffy Candy Admin Boshqaruv Paneli',
    totalCleanings: 'Jami Tozalashlar',
    totalPayment: 'Jami To\'lov',
    ratePerCleaning: 'Har bir tozalash uchun narx',
    resetCleanings: 'Tozalashlarni qayta o\'rnatish (To\'langan)',
    
    // Cleaner Dashboard
    cleanerDashboard: 'Tozalovchi Boshqaruv Paneli',
    todaysCleanings: 'Bugungi Tozalashlar',
    totalThisPeriod: 'Bu Davr Jami',
    cleanedMachine: 'Men mashinani tozaladim',
    myRecentCleanings: 'Mening So\'nggi Tozalashlarim',
    totalEarnings: 'Bu davrdagi jami daromad',
    
    // Tables
    cleaner: 'Tozalovchi',
    time: 'Vaqt',
    machine: 'Mashina',
    payment: 'To\'lov',
    recentCleanings: 'So\'nggi Tozalashlar',
    noCleanings: 'Hali hech qanday tozalash qayd etilmagan',
    
    // Archive
    archivePayments: 'Arxiv To\'lovlarini Ko\'rish',
    backToDashboard: 'Boshqaruv Paneliga Qaytish',
    paymentHistoryArchive: 'To\'lov Tarixi Arxivi',
    paidBy: 'Tomonidan To\'langan',
    date: 'Sana',
    numCleanings: 'Tozalashlar Soni',
    totalAmount: 'Jami Miqdor',
    startDate: 'Boshlanish Sanasi',
    endDate: 'Tugash Sanasi',
    applyFilter: 'Filtrni Qo\'llash',
    clearFilter: 'Filtrni Tozalash',
    selectDateRange: 'To\'lov tarixini ko\'rish uchun sana oralig\'ini tanlang va "Filtrni Qo\'llash" tugmasini bosing.',
    
    // Forms and Actions
    newRate: 'Yangi Narx',
    updateRate: 'Narxni Yangilash',
    confirmCleaning: 'Haqiqatan ham mashinani tozaladingizmi?',
    
    // Reset Modal
    whoPaid: 'Tozalash uchun kim to\'ladi?',
    selectPerson: 'Odamni tanlang...',
    confirmReset: 'Qayta O\'rnatishni Tasdiqlash',
    cancel: 'Bekor Qilish',
    pleaseSelect: 'Iltimos, tozalash uchun kim to\'laganini tanlang.',
    
    // Messages
    loginRequired: 'Email va parol talab qilinadi',
    loggedIn: 'Kirildi!',
    loginFailed: 'Kirish muvaffaqiyatsiz',
    cleaningRecorded: 'Tozalash qayd etildi!',
    failedToLog: 'Tozalashni qayd etishda xatolik',
    rateUpdated: 'Narx yangilandi',
    enterValidRate: 'To\'g\'ri narxni kiriting',
    selectBothDates: 'Iltimos, boshlanish va tugash sanalarini tanlang.',
    filterCleared: 'Filtr tozalandi - jadval endi bo\'sh',
    cleaningsArchived: 'Tozalashlar arxivlandi va qayta o\'rnatildi - Tomonidan to\'langan',
    errorDuringReset: 'Qayta o\'rnatishda xatolik',
    loadingData: 'Yuklanmoqda...',
    failedToLoad: 'Ma\'lumotlarni yuklashda xatolik',
    
    // Login
    email: 'Email',
    password: 'Parol',
    login: 'Kirish',
    createTestUsers: 'Test Foydalanuvchilarini Yaratish'
  }
};

type Language = 'en' | 'sv' | 'uz';
type Translations = typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const value = {
    language,
    setLanguage,
    t: translations[language]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};