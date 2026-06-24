import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'hi';

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

const translations: Translations = {
  // Role switcher
  owner: { en: 'Owner', hi: 'मालिक' },
  supervisor: { en: 'Supervisor', hi: 'पर्यवेक्षक' },
  driver: { en: 'Driver', hi: 'चालक' },
  roleLabel: { en: 'Select Role:', hi: 'भूमिका चुनें:' },
  
  // Navigation / Tabs
  dashboard: { en: 'Dashboard', hi: 'डैशबोर्ड' },
  tracking: { en: 'Live Tracking', hi: 'लाइव ट्रैकिंग' },
  maintenance: { en: 'Maintenance', hi: 'रखरखाव' },
  vendors: { en: 'Vendors', hi: 'विक्रेता' },
  insurance: { en: 'Insurance', hi: 'बीमा' },
  reports: { en: 'Reports & Fuel', hi: 'रिपोर्ट और ईंधन' },
  integrations: { en: 'Integrations', hi: 'एकीकरण' },
  backups: { en: 'Backups', hi: 'बैकअप' },
  auditLog: { en: 'Audit Logs', hi: 'ऑडिट लॉग' },
  sqlPlayground: { en: 'SQL Console', hi: 'एसक्यूएल कंसोल' },

  // Metrics
  activeVehicles: { en: 'Active Vehicles', hi: 'सक्रिय वाहन' },
  averageFuel: { en: 'Avg Fuel Economy', hi: 'औसत ईंधन खपत' },
  maintenanceCosts: { en: 'Total Service Costs', hi: 'कुल सेवा लागत' },
  pendingAlerts: { en: 'Pending Alerts', hi: 'लंबित अलर्ट' },

  // Operations / UI
  online: { en: 'Online', hi: 'ऑनलाइन' },
  offline: { en: 'Offline Mode', hi: 'ऑफलाइन मोड' },
  exportCsv: { en: 'Export CSV', hi: 'सीएसवी निर्यात करें' },
  exportPdf: { en: 'Export Report', hi: 'रिपोर्ट निर्यात करें' },
  darkMode: { en: 'Dark Mode', hi: 'डार्क मोड' },
  lightMode: { en: 'Light Mode', hi: 'लाइट मोड' },
  biometrics: { en: 'Biometrics', hi: 'बायोमेट्रिक्स' },
  backupNow: { en: 'Trigger Backup', hi: 'बैकअप शुरू करें' },

  // Forms / Actions
  scheduleService: { en: 'Schedule Service', hi: 'सेवा निर्धारित करें' },
  addVehicle: { en: 'Add Vehicle', hi: 'वाहन जोड़ें' },
  addDriver: { en: 'Add Driver', hi: 'चालक जोड़ें' },
  addVendor: { en: 'Add Vendor', hi: 'विक्रेता जोड़ें' },
  logFuelReceipt: { en: 'Log Fuel Receipt', hi: 'ईंधन रसीद दर्ज करें' },
  
  // Status Labels
  statusActive: { en: 'Active', hi: 'सक्रिय' },
  statusInService: { en: 'In Service', hi: 'सेवा में' },
  statusOnTrip: { en: 'On Trip', hi: 'यात्रा पर' },
  statusInactive: { en: 'Inactive', hi: 'निष्क्रिय' },

  // Explanatory headings
  welcome: { en: 'Welcome back', hi: 'वापसी पर स्वागत है' },
  fleetOverview: { en: 'Fleet Analytics & Management', hi: 'बेड़ा विश्लेषण और प्रबंधन' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('fleetcore_lang');
    return (saved as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('fleetcore_lang', lang);
  };

  const t = (key: string): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
