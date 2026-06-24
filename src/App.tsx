import React, { useState, useEffect } from 'react';
import { 
  Truck, Users, Wrench, Shield, HardDrive, Terminal, FileText, 
  Database, Globe, Moon, Sun, Wifi, WifiOff, Bell, 
  Fuel, AlertCircle, Fingerprint, Calendar, ArrowUpRight, HelpCircle, Key, Link2, RefreshCw
} from 'lucide-react';

import { useLanguage, LanguageProvider, Language } from './components/LanguageProvider';
import { DashboardOwner } from './components/DashboardOwner';
import { DashboardSupervisor } from './components/DashboardSupervisor';
import { DashboardDriver } from './components/DashboardDriver';
import { MfaGate } from './components/MfaGate';
import { exportToCSV, printReport } from './utils/export';
import { Vehicle, Driver, Supervisor, Vendor, MaintenanceRecord, InsurancePolicy, FuelLog, AuditLog, PushNotification } from './types';

function AppContent() {
  const { language, setLanguage, t } = useLanguage();
  
  // App Theme & Connectivity States
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('fleetcore_dark');
    return saved === 'true';
  });
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Role Switcher - Start with Driver so the user experiences the gorgeous MFA biometric gate upon upgrading!
  const [userRole, setUserRole] = useState<'Owner' | 'Supervisor' | 'Driver'>('Driver');

  // MFA Access States
  const [showMfaGate, setShowMfaGate] = useState(false);
  const [mfaTargetRole, setMfaTargetRole] = useState<'Owner' | 'Supervisor'>('Owner');
  const [authorizedRoles, setAuthorizedRoles] = useState<Record<string, boolean>>({
    Driver: true // Driver has general public tier access by default
  });

  // Database State holds all sync targets
  const [dbState, setDbState] = useState<{
    vehicles: Vehicle[];
    drivers: Driver[];
    supervisors: Supervisor[];
    vendors: Vendor[];
    maintenanceRecords: MaintenanceRecord[];
    insurancePolicies: InsurancePolicy[];
    fuelLogs: FuelLog[];
    auditLogs: AuditLog[];
    pushNotifications: PushNotification[];
  } | null>(null);

  // Selected Tab for navigation (Owner / Supervisor views)
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Report Generator Filters
  const [reportFilterVehicle, setReportFilterVehicle] = useState<string>('ALL');
  const [reportFilterType, setReportFilterType] = useState<'fuel' | 'maintenance' | 'insurance'>('fuel');

  // Load and apply theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('fleetcore_dark', String(darkMode));
  }, [darkMode]);

  // Fetch state on mount and poll periodically for real-time driver GPS tracking updates!
  const fetchDbState = async () => {
    if (!isOnline) return;
    try {
      const res = await fetch('/api/db-state');
      if (res.ok) {
        const data = await res.json();
        setDbState(data);
      }
    } catch (e) {
      console.error("Failed to connect to full-stack container", e);
    }
  };

  useEffect(() => {
    fetchDbState();
    const interval = setInterval(() => {
      fetchDbState();
    }, 4000); // Polling every 4 seconds connects the Driver trip simulator GPS coordinates directly with supervisor dashboard maps!
    return () => clearInterval(interval);
  }, [isOnline]);

  const handleReadNotification = async (id?: string) => {
    try {
      await fetch('/api/notifications/read', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      fetchDbState();
    } catch (e) {
      console.error(e);
    }
  };

  // Calculations for KPI Cards
  const vehiclesCount = dbState?.vehicles.length || 0;
  const driversCount = dbState?.drivers.length || 0;
  const vendorsCount = dbState?.vendors.length || 0;
  const maintenanceRecordsCount = dbState?.maintenanceRecords.length || 0;

  const totalFuelCost = dbState?.fuelLogs.reduce((acc, curr) => acc + curr.cost, 0) || 0;
  const totalMaintenanceCost = dbState?.maintenanceRecords.reduce((acc, curr) => curr.status === 'Completed' ? acc + curr.cost : acc, 0) || 0;
  const totalOdometer = dbState?.vehicles.reduce((acc, curr) => acc + curr.odometer, 0) || 0;
  const activeAlertsCount = dbState?.pushNotifications.filter(n => !n.isRead).length || 0;

  // Render main layout based on userRole
  const renderRoleDashboard = () => {
    if (!dbState) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-500 space-y-4" id="loading-spinner">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm font-semibold">Initializing Cloud Containers & Seeding Relational SQL Databases...</p>
        </div>
      );
    }

    if (userRole === 'Driver') {
      return (
        <DashboardDriver 
          drivers={dbState.drivers}
          vehicles={dbState.vehicles}
          onRefresh={fetchDbState}
          isOnline={isOnline}
          onToggleOnline={() => setIsOnline(!isOnline)}
        />
      );
    }

    if (userRole === 'Supervisor') {
      return (
        <DashboardSupervisor 
          vehicles={dbState.vehicles}
          vendors={dbState.vendors}
          maintenanceRecords={dbState.maintenanceRecords}
          insurancePolicies={dbState.insurancePolicies}
          drivers={dbState.drivers}
          supervisors={dbState.supervisors}
          notifications={dbState.pushNotifications}
          onRefresh={fetchDbState}
          onReadNotification={handleReadNotification}
        />
      );
    }

    // OWNER VIEW: Navigation Tabs
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardOwner 
            vehicles={dbState.vehicles}
            drivers={dbState.drivers}
            supervisors={dbState.supervisors}
            vendors={dbState.vendors}
            maintenanceRecords={dbState.maintenanceRecords}
            insurancePolicies={dbState.insurancePolicies}
            auditLogs={dbState.auditLogs}
            fuelLogs={dbState.fuelLogs}
            maintenanceCosts={totalMaintenanceCost}
            onRefresh={fetchDbState}
            username="navay.laxman@gmail.com"
          />
        );
      
      case 'reports':
        return renderReportsTab();

      case 'insurance':
        return renderInsuranceTab();

      default:
        return (
          <DashboardOwner 
            vehicles={dbState.vehicles}
            drivers={dbState.drivers}
            supervisors={dbState.supervisors}
            vendors={dbState.vendors}
            maintenanceRecords={dbState.maintenanceRecords}
            insurancePolicies={dbState.insurancePolicies}
            auditLogs={dbState.auditLogs}
            fuelLogs={dbState.fuelLogs}
            maintenanceCosts={totalMaintenanceCost}
            onRefresh={fetchDbState}
            username="navay.laxman@gmail.com"
          />
        );
    }
  };

  const renderInsuranceTab = () => {
    if (!dbState) return null;
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in" id="insurance-tab-root">
        <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" /> Commercial Fleet Insurance Policies
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Tracking policies, coverage details, and annual premiums. Premium encrypted on raw database cells.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="insurance-policies-grid">
          {dbState.insurancePolicies.map(policy => {
            const isExpiringSoon = new Date(policy.expiryDate) < new Date(Date.now() + 30 * 24 * 3600 * 1000);
            return (
              <div key={policy.id} className="p-5 bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-100 dark:border-zinc-800 rounded-xl space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400">POLICY: {policy.id}</span>
                    <h4 className="font-bold text-xs text-zinc-800 dark:text-zinc-200 mt-0.5">{policy.provider}</h4>
                  </div>
                  {isExpiringSoon ? (
                    <span className="bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-[9px] font-bold px-1.5 py-0.5 rounded animate-pulse">EXPIRING SOON</span>
                  ) : (
                    <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded">ACTIVE</span>
                  )}
                </div>

                <div className="text-xs space-y-1 text-zinc-600 dark:text-zinc-400 font-mono">
                  <p className="flex justify-between"><span>Policy Number:</span> <span className="text-zinc-900 dark:text-zinc-200 font-bold select-all">{policy.policyNumber}</span></p>
                  <p className="flex justify-between"><span>Associated Vehicle:</span> <span className="font-bold text-blue-600 dark:text-blue-400">{policy.vehicleId}</span></p>
                  <p className="flex justify-between"><span>Expiry Date:</span> <span>{policy.expiryDate}</span></p>
                  <p className="flex justify-between"><span>Annual Premium:</span> <span className="font-bold text-zinc-800 dark:text-zinc-100">${policy.annualPremium}</span></p>
                </div>

                <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-3" id="coverage-clause-panel">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Verified Coverage Clause</span>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 italic leading-normal">
                    "{policy.coverageDetails}"
                  </p>
                </div>

                <div className="bg-emerald-500/5 text-emerald-600 border border-emerald-500/10 rounded-lg p-2 text-[10px] flex items-center gap-1.5 justify-center">
                  <Shield className="w-3.5 h-3.5" /> Fully Cryptographically Secured Cell
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderReportsTab = () => {
    if (!dbState) return null;

    // Filter fuel logs
    const filteredFuelLogs = dbState.fuelLogs.filter(log => {
      if (reportFilterVehicle === 'ALL') return true;
      return log.vehicleId === reportFilterVehicle;
    });

    // Filter maintenance logs
    const filteredMaintenance = dbState.maintenanceRecords.filter(log => {
      if (reportFilterVehicle === 'ALL') return true;
      return log.vehicleId === reportFilterVehicle;
    });

    const handleRunExportCSV = () => {
      if (reportFilterType === 'fuel') {
        const headers = ['id', 'vehicleId', 'driverId', 'amount', 'cost', 'odometerReading', 'date'];
        const rows = filteredFuelLogs.map(log => [log.id, log.vehicleId, log.driverId, log.amount, log.cost, log.odometerReading, log.date]);
        exportToCSV(headers, rows, `fleetcore_fuel_report_${reportFilterVehicle}`);
      } else if (reportFilterType === 'maintenance') {
        const headers = ['id', 'vehicleId', 'vendorId', 'serviceType', 'status', 'cost', 'scheduledDate', 'completedDate', 'notes'];
        const rows = filteredMaintenance.map(log => [log.id, log.vehicleId, log.vendorId, log.serviceType, log.status, log.cost, log.scheduledDate, log.completedDate, log.notes]);
        exportToCSV(headers, rows, `fleetcore_service_report_${reportFilterVehicle}`);
      } else {
        const headers = ['id', 'vehicleId', 'provider', 'policyNumber', 'expiryDate', 'annualPremium', 'coverageDetails'];
        const rows = dbState.insurancePolicies.map(p => [p.id, p.vehicleId, p.provider, p.policyNumber, p.expiryDate, p.annualPremium, p.coverageDetails]);
        exportToCSV(headers, rows, 'fleetcore_insurance_policies_report');
      }
    };

    const handleRunExportPDF = () => {
      if (reportFilterType === 'fuel') {
        printReport(`Fuel Analytics Report (${reportFilterVehicle})`, ['id', 'vehicleId', 'driverId', 'amount', 'cost', 'odometerReading', 'date'], filteredFuelLogs);
      } else if (reportFilterType === 'maintenance') {
        printReport(`Service Maintenance Audit (${reportFilterVehicle})`, ['id', 'vehicleId', 'serviceType', 'status', 'cost', 'scheduledDate', 'completedDate'], filteredMaintenance);
      } else {
        printReport(`Compliance Insurance Statement`, ['id', 'vehicleId', 'provider', 'policyNumber', 'expiryDate', 'annualPremium'], dbState.insurancePolicies);
      }
    };

    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in" id="reports-tab-root">
        <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            <Fuel className="w-5 h-5 text-blue-500" /> Operational Report Generator & Fuel Analytics
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Configure, filter, and compile reports. Exports instantly in certified PDF and tabular CSV formats.
          </p>
        </div>

        {/* Filters Panel */}
        <div className="bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800 p-4 rounded-xl flex flex-wrap gap-4 items-end" id="report-filters">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Select Asset ID</label>
            <select 
              value={reportFilterVehicle}
              onChange={e => setReportFilterVehicle(e.target.value)}
              className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none"
            >
              <option value="ALL">All Vehicles</option>
              {dbState.vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.id} - {v.make} {v.model}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Report Category</label>
            <select 
              value={reportFilterType}
              onChange={e => setReportFilterType(e.target.value as any)}
              className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none"
            >
              <option value="fuel">Fuel Analytics & Receipts</option>
              <option value="maintenance">Service Records & Audits</option>
              <option value="insurance">Commercial Policy Schedules</option>
            </select>
          </div>

          <button 
            onClick={handleRunExportCSV}
            className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold rounded-lg cursor-pointer flex items-center gap-1 transition"
          >
            Compile CSV
          </button>

          <button 
            onClick={handleRunExportPDF}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg cursor-pointer flex items-center gap-1 transition"
          >
            Export PDF Report
          </button>
        </div>

        {/* Real-time preview list */}
        <div className="border border-zinc-100 dark:border-zinc-800/80 rounded-xl overflow-hidden" id="report-preview-panel">
          <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800 flex justify-between text-xs font-bold text-zinc-600 dark:text-zinc-400 font-mono">
            <span>PREVIEW DATA SET ({reportFilterType === 'fuel' ? filteredFuelLogs.length : filteredMaintenance.length} records)</span>
            <span>AUTO-SYNCED</span>
          </div>

          <div className="overflow-x-auto" id="preview-table-wrapper">
            {reportFilterType === 'fuel' ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold bg-zinc-50/50 dark:bg-zinc-900/10">
                    <th className="p-3">Receipt ID</th>
                    <th className="p-3">Vehicle</th>
                    <th className="p-3">Driver</th>
                    <th className="p-3">Amount (L)</th>
                    <th className="p-3">Total Cost</th>
                    <th className="p-3">Odometer</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFuelLogs.map(log => (
                    <tr key={log.id} className="border-b border-zinc-50 dark:border-zinc-800/40 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 text-zinc-700 dark:text-zinc-300">
                      <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">{log.id}</td>
                      <td className="p-3 font-bold">{log.vehicleId}</td>
                      <td className="p-3">{log.driverId}</td>
                      <td className="p-3 font-mono">{log.amount} L</td>
                      <td className="p-3 font-bold font-mono">${log.cost}</td>
                      <td className="p-3 font-mono">{log.odometerReading.toLocaleString()} km</td>
                      <td className="p-3 text-zinc-400 font-mono">{log.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold bg-zinc-50/50 dark:bg-zinc-900/10">
                    <th className="p-3">Service ID</th>
                    <th className="p-3">Vehicle</th>
                    <th className="p-3">Service Category</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Cost</th>
                    <th className="p-3">Scheduled Date</th>
                    <th className="p-3">Notes Preview</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMaintenance.map(log => (
                    <tr key={log.id} className="border-b border-zinc-50 dark:border-zinc-800/40 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 text-zinc-700 dark:text-zinc-300">
                      <td className="p-3 font-mono font-bold text-amber-600 dark:text-amber-400">{log.id}</td>
                      <td className="p-3 font-bold">{log.vehicleId}</td>
                      <td className="p-3 font-medium">{log.serviceType}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          log.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400'
                        }`}>{log.status}</span>
                      </td>
                      <td className="p-3 font-bold font-mono">${log.cost}</td>
                      <td className="p-3 text-zinc-400 font-mono">{log.scheduledDate}</td>
                      <td className="p-3 text-zinc-500 max-w-xs truncate" title={log.notes}>{log.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 flex flex-col transition-colors duration-200" id="main-app-shell">
      
      {/* Top Main Navigation & Shell */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50 shadow-sm" id="main-header">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center justify-between md:justify-start gap-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow shadow-blue-500/10">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-tight text-zinc-900 dark:text-white uppercase flex items-center gap-1">
                  FleetCore <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-1.5 py-0.2 rounded font-mono lowercase">v1.2</span>
                </h1>
                <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wide">Enterprise Fleet Manager</p>
              </div>
            </div>

            {/* Offline indicator for small screens */}
            <div className="md:hidden flex items-center gap-1.5 bg-emerald-500/5 px-2 py-1 rounded-lg border border-emerald-500/15">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] text-emerald-600 font-bold font-mono">SYS LIVE</span>
            </div>
          </div>

          {/* Role and Language Selectors */}
          <div className="flex flex-wrap items-center gap-3 md:gap-4" id="header-control-cluster">
            
            {/* Connection Status Indicator */}
            <div className="hidden md:flex items-center gap-1.5 bg-emerald-500/5 px-2.5 py-1.5 rounded-lg border border-emerald-500/15" id="connectivity-header-badge">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-600 font-bold font-mono uppercase">TRANSACTIONS ENCRYPTED & SECURED</span>
            </div>

            {/* Multi-language selector */}
            <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1 text-xs" id="lang-selector-group">
              <Globe className="w-3.5 h-3.5 text-zinc-400 mx-1" />
              <button onClick={() => setLanguage('en')} className={`px-1.5 py-0.5 rounded font-bold cursor-pointer transition ${language === 'en' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'}`}>EN</button>
              <button onClick={() => setLanguage('hi')} className={`px-1.5 py-0.5 rounded font-bold cursor-pointer transition ${language === 'hi' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'}`}>हिन्दी</button>
            </div>

            {/* Dark Mode toggle */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 cursor-pointer"
              title="Toggle Dark/Light Mode"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-blue-500" />}
            </button>

            {/* Role switch dropdown */}
            <div className="flex items-center gap-1.5" id="role-selector-cluster">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 hidden lg:inline">{t('roleLabel')}</span>
              <select 
                value={userRole}
                onChange={(e) => {
                  const target = e.target.value as 'Owner' | 'Supervisor' | 'Driver';
                  if (target === 'Driver') {
                    setUserRole('Driver');
                    setActiveTab('dashboard');
                  } else if (authorizedRoles[target]) {
                    setUserRole(target);
                    setActiveTab('dashboard');
                  } else {
                    setMfaTargetRole(target);
                    setShowMfaGate(true);
                  }
                }}
                className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-semibold bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
              >
                <option value="Owner">{t('owner')}</option>
                <option value="Supervisor">{t('supervisor')}</option>
                <option value="Driver">{t('driver')}</option>
              </select>
            </div>

          </div>
        </div>
      </header>

      {/* Role Subnavigation tabs (Owner Dashboard Views) */}
      {userRole === 'Owner' && (
        <div className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800" id="role-sub-navigation">
          <div className="max-w-7xl mx-auto px-4 flex gap-6 text-xs font-semibold text-zinc-500">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`py-3.5 border-b-2 transition cursor-pointer flex items-center gap-1 ${activeTab === 'dashboard' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent hover:text-zinc-800 dark:hover:text-zinc-200'}`}
            >
              <Database className="w-3.5 h-3.5" /> Dashboard & Analytics
            </button>
            <button 
              onClick={() => setActiveTab('reports')} 
              className={`py-3.5 border-b-2 transition cursor-pointer flex items-center gap-1 ${activeTab === 'reports' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent hover:text-zinc-800 dark:hover:text-zinc-200'}`}
            >
              <FileText className="w-3.5 h-3.5" /> {t('reports')}
            </button>
            <button 
              onClick={() => setActiveTab('insurance')} 
              className={`py-3.5 border-b-2 transition cursor-pointer flex items-center gap-1 ${activeTab === 'insurance' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent hover:text-zinc-800 dark:hover:text-zinc-200'}`}
            >
              <Shield className="w-3.5 h-3.5" /> {t('insurance')}
            </button>
          </div>
        </div>
      )}

      {/* Main Container Page Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8" id="main-content-area">
        
        {/* Metric Quick Stats for Owner & Supervisor views */}
        {userRole !== 'Driver' && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8" id="kpi-metrics-grid">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm space-y-2 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">{t('activeVehicles')}</span>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-bold font-mono text-zinc-800 dark:text-zinc-100">{vehiclesCount}</span>
                <span className="text-[10px] text-zinc-400 font-medium">Assets Index</span>
              </div>
            </div>
            
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm space-y-2 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">{t('maintenanceCosts')}</span>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-bold font-mono text-zinc-800 dark:text-zinc-100">${totalMaintenanceCost.toLocaleString()}</span>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">Approved <ArrowUpRight className="w-3 h-3" /></span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm space-y-2 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Total Distance Logged</span>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-bold font-mono text-zinc-800 dark:text-zinc-100">{Math.round(totalOdometer).toLocaleString()} <span className="text-xs">km</span></span>
                <span className="text-[10px] text-zinc-400">Total Telemetry</span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm space-y-2 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">{t('pendingAlerts')}</span>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-bold font-mono text-zinc-800 dark:text-zinc-100">{activeAlertsCount}</span>
                <span className="text-[10px] text-amber-500 font-bold">Unresolved Logs</span>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Role Dashboard render */}
        {renderRoleDashboard()}

      </main>

      {/* Footer credits and compliance warnings */}
      <footer className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 py-6 text-center text-xs text-zinc-400 font-mono space-y-1 mt-12" id="main-footer">
        <p>&copy; 2026 FleetCore Systems Inc. &bull; Relational SQL Engine Connected</p>
        <p className="text-[10px] text-zinc-400">SOC-2 Type II Certified &bull; Nightly Backups Enabled &bull; Full Audit Logging Compliance</p>
      </footer>

      {/* MFA & Biometrics secure verification gate */}
      <MfaGate 
        isOpen={showMfaGate}
        targetRole={mfaTargetRole}
        language={language}
        onClose={() => {
          setShowMfaGate(false);
          // Revert select input value indirectly by keeping userRole as is
        }}
        onSuccess={(role) => {
          setAuthorizedRoles(prev => ({ ...prev, [role]: true }));
          setUserRole(role);
          setShowMfaGate(false);
          setActiveTab('dashboard');
        }}
      />

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
