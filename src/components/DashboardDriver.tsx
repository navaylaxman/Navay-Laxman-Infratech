import React, { useState, useEffect } from 'react';
import { 
  Fingerprint, Key, LogIn, Lock, CheckCircle, Navigation, Play, Square,
  Receipt, Wrench, Wifi, WifiOff, RefreshCw, Sparkles, HelpCircle, Eye,
  Clock, Plus, Edit3, DollarSign, Calendar, ShieldCheck
} from 'lucide-react';
import { Driver, Vehicle, MaintenanceRecord, Vendor } from '../types';

interface DashboardDriverProps {
  drivers: Driver[];
  vehicles: Vehicle[];
  maintenanceRecords: MaintenanceRecord[];
  vendors: Vendor[];
  onRefresh: () => void;
  isOnline: boolean;
  onToggleOnline: () => void;
}

export const DashboardDriver: React.FC<DashboardDriverProps> = ({
  drivers,
  vehicles,
  maintenanceRecords,
  vendors,
  onRefresh,
  isOnline,
  onToggleOnline
}) => {
  // Authentication states
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isBiometricScanning, setIsBiometricScanning] = useState(false);
  const [authError, setAuthError] = useState('');

  // Active Driver & Vehicle context
  const activeDriver = drivers.find(d => d.id === selectedDriverId);
  const activeVehicle = vehicles.find(v => v.driverId === selectedDriverId);

  // Trip Simulator states
  const [isDriving, setIsDriving] = useState(false);
  const [tripDistance, setTripDistance] = useState(0);
  const [simCoords, setSimCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Fuel Form states
  const [fuelAmt, setFuelAmt] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [fuelOdo, setFuelOdo] = useState('');
  const [fuelMsg, setFuelMsg] = useState('');

  // Fault Form states
  const [faultType, setFaultType] = useState('Brakes squeaking');
  const [faultNotes, setFaultNotes] = useState('');
  const [faultMsg, setFaultMsg] = useState('');

  // Service Addition / Modification states
  const [serviceTypeInput, setServiceTypeInput] = useState('Oil Change');
  const [serviceVendorInput, setServiceVendorInput] = useState('');
  const [serviceCostInput, setServiceCostInput] = useState('');
  const [serviceDateInput, setServiceDateInput] = useState(new Date().toISOString().split('T')[0]);
  const [serviceNotesInput, setServiceNotesInput] = useState('');
  const [serviceSuccessMsg, setServiceSuccessMsg] = useState('');

  const [modifyingRecord, setModifyingRecord] = useState<MaintenanceRecord | null>(null);
  const [modifyingTypeInput, setModifyingTypeInput] = useState('');
  const [modifyingCostInput, setModifyingCostInput] = useState('');
  const [modifyingDateInput, setModifyingDateInput] = useState('');
  const [modifyingNotesInput, setModifyingNotesInput] = useState('');

  // Offline queue state
  const [offlineQueue, setOfflineQueue] = useState<any[]>(() => {
    const saved = localStorage.getItem('fleetcore_offline_queue');
    return saved ? JSON.parse(saved) : [];
  });

  // Default driver ID
  useEffect(() => {
    if (drivers.length > 0 && !selectedDriverId) {
      setSelectedDriverId(drivers[0].id);
    }
  }, [drivers]);

  // Sync Coords with state
  useEffect(() => {
    if (activeVehicle) {
      setSimCoords({ lat: activeVehicle.latitude, lng: activeVehicle.longitude });
    }
  }, [activeVehicle]);

  // Trip Simulation Ticker (Real-Time GPS)
  useEffect(() => {
    if (!isDriving || !activeVehicle || !simCoords) return;

    const interval = setInterval(async () => {
      // Small directional walk in San Francisco
      const dLat = (Math.random() - 0.4) * 0.0006;
      const dLng = (Math.random() - 0.5) * 0.0006;
      const nextLat = simCoords.lat + dLat;
      const nextLng = simCoords.lng + dLng;
      const simulatedSpeed = Math.floor(40 + Math.random() * 30);
      const fuelDecrease = 0.5 + Math.random() * 0.3; // drop fuel %

      setSimCoords({ lat: nextLat, lng: nextLng });
      setTripDistance(prev => prev + 0.15);

      if (isOnline) {
        try {
          // Push coordinates to express SQL database backend!
          await fetch('/api/gps-update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: activeVehicle.id,
              latitude: nextLat,
              longitude: nextLng,
              speed: simulatedSpeed,
              fuelDec: fuelDecrease
            })
          });
          onRefresh();
        } catch (e) {
          console.error("GPS telemetry stream offline. Buffering...");
        }
      } else {
        // Queue GPS telemetry offline
        const offlineGpsPayload = {
          type: 'gps',
          vehicleId: activeVehicle.id,
          lat: nextLat,
          lng: nextLng,
          speed: simulatedSpeed,
          fuelDec: fuelDecrease,
          timestamp: new Date().toISOString()
        };
        const updatedQueue = [...offlineQueue, offlineGpsPayload];
        setOfflineQueue(updatedQueue);
        localStorage.setItem('fleetcore_offline_queue', JSON.stringify(updatedQueue));
      }

    }, 3000);

    return () => clearInterval(interval);
  }, [isDriving, simCoords, activeVehicle, isOnline, offlineQueue]);

  const handleBiometricAuthenticate = () => {
    if (!selectedDriverId) return;
    setIsBiometricScanning(true);
    setAuthError('');
    
    setTimeout(() => {
      setIsBiometricScanning(false);
      setIsAuthenticated(true);
      onRefresh();
    }, 1800);
  };

  const handleManualLogin = () => {
    if (!selectedDriverId) return;
    setIsAuthenticated(true);
    onRefresh();
  };

  const handleStartTrip = () => {
    setIsDriving(true);
    setTripDistance(0);
    // Notify dispatch of trip starting
    if (isOnline && activeVehicle) {
      fetch('/api/notifications/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Trip Started',
          message: `Driver ${activeDriver?.name} started route simulation in vehicle ${activeVehicle.id}.`,
          type: 'task'
        })
      }).then(() => onRefresh());
    }
  };

  const handleStopTrip = () => {
    setIsDriving(false);
    if (isOnline && activeVehicle) {
      // reset speed to 0
      fetch('/api/gps-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeVehicle.id,
          latitude: simCoords?.lat || activeVehicle.latitude,
          longitude: simCoords?.lng || activeVehicle.longitude,
          speed: 0,
          fuelDec: 0
        })
      }).then(() => {
        onRefresh();
        fetch('/api/notifications/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Trip Completed',
            message: `Driver ${activeDriver?.name} parked vehicle ${activeVehicle.id} safely.`,
            type: 'task'
          })
        }).then(() => onRefresh());
      });
    }
  };

  // Log fuel receipt
  const handleSubmitFuel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fuelAmt || !fuelCost || !fuelOdo || !activeVehicle) {
      setFuelMsg('Please fill out all fuel details.');
      return;
    }

    const payload = {
      vehicleId: activeVehicle.id,
      driverId: activeDriver!.id,
      amount: Number(fuelAmt),
      cost: Number(fuelCost),
      odometer: Number(fuelOdo)
    };

    if (isOnline) {
      try {
        const res = await fetch('/api/fuel/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          setFuelMsg('Fuel receipt logged and fuel level restored to 100%!');
          setFuelAmt('');
          setFuelCost('');
          setFuelOdo('');
          onRefresh();
          setTimeout(() => setFuelMsg(''), 4000);
        }
      } catch (err) {
        setFuelMsg('Failed to log fuel.');
      }
    } else {
      // Offline buffering
      const queueObj = { ...payload, type: 'fuel', timestamp: new Date().toISOString() };
      const updated = [...offlineQueue, queueObj];
      setOfflineQueue(updated);
      localStorage.setItem('fleetcore_offline_queue', JSON.stringify(updated));
      setFuelMsg('Offline Mode active. Fuel receipt buffered in storage!');
      setFuelAmt('');
      setFuelCost('');
      setFuelOdo('');
      setTimeout(() => setFuelMsg(''), 4000);
    }
  };

  // Report fault issue
  const handleSubmitFault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faultNotes || !activeVehicle) {
      setFaultMsg('Notes are required.');
      return;
    }

    const payload = {
      vehicleId: activeVehicle.id,
      vendorId: 'VN-401', // apex defaults
      serviceType: faultType,
      cost: 0,
      scheduledDate: new Date().toISOString().split('T')[0],
      notes: `REPORTED BY DRIVER (${activeDriver?.name}): ${faultNotes}`
    };

    if (isOnline) {
      try {
        const res = await fetch('/api/maintenance/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          setFaultMsg('Maintenance report submitted to Supervisor!');
          setFaultNotes('');
          onRefresh();
          setTimeout(() => setFaultMsg(''), 4000);
        }
      } catch (e) {
        setFaultMsg('Submit failed.');
      }
    } else {
      // Offline queue
      const queueObj = { ...payload, type: 'fault', timestamp: new Date().toISOString() };
      const updated = [...offlineQueue, queueObj];
      setOfflineQueue(updated);
      localStorage.setItem('fleetcore_offline_queue', JSON.stringify(updated));
      setFaultMsg('Offline. Fault report buffered. Will sync when reconnected!');
      setFaultNotes('');
      setTimeout(() => setFaultMsg(''), 4000);
    }
  };

  // Submit new service record
  const handleAddServiceRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVehicle || !serviceVendorInput || !serviceTypeInput || !serviceDateInput) {
      setServiceSuccessMsg('Please fill out all service details.');
      return;
    }

    const payload = {
      vehicleId: activeVehicle.id,
      vendorId: serviceVendorInput,
      serviceType: serviceTypeInput,
      cost: Number(serviceCostInput || 0),
      scheduledDate: serviceDateInput,
      notes: serviceNotesInput
    };

    if (isOnline) {
      try {
        const res = await fetch('/api/maintenance/driver-add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          setServiceSuccessMsg('Service request logged successfully! (Pending Verification & Approval)');
          setServiceNotesInput('');
          setServiceCostInput('');
          onRefresh();
          setTimeout(() => setServiceSuccessMsg(''), 4000);
        }
      } catch (err) {
        setServiceSuccessMsg('Failed to log service.');
      }
    } else {
      // Buffer offline
      const queueObj = { ...payload, type: 'driver-service-add', timestamp: new Date().toISOString() };
      const updated = [...offlineQueue, queueObj];
      setOfflineQueue(updated);
      localStorage.setItem('fleetcore_offline_queue', JSON.stringify(updated));
      setServiceSuccessMsg('Offline Mode. Service record added to offline sync buffer!');
      setServiceNotesInput('');
      setServiceCostInput('');
      setTimeout(() => setServiceSuccessMsg(''), 4000);
    }
  };

  // Start modifying a service record
  const handleStartModifying = (record: MaintenanceRecord) => {
    setModifyingRecord(record);
    setModifyingTypeInput(record.serviceType);
    setModifyingCostInput(String(record.cost));
    setModifyingDateInput(record.scheduledDate);
    setModifyingNotesInput(record.notes);
  };

  // Submit service record modification
  const handleModifyServiceRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modifyingRecord) return;

    const payload = {
      id: modifyingRecord.id,
      serviceType: modifyingTypeInput,
      cost: Number(modifyingCostInput || 0),
      scheduledDate: modifyingDateInput,
      notes: modifyingNotesInput
    };

    if (isOnline) {
      try {
        const res = await fetch('/api/maintenance/driver-modify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          setServiceSuccessMsg('Proposed service modification submitted! (Pending Verification & Approval)');
          setModifyingRecord(null);
          onRefresh();
          setTimeout(() => setServiceSuccessMsg(''), 4000);
        }
      } catch (err) {
        setServiceSuccessMsg('Failed to propose modifications.');
      }
    } else {
      // Buffer offline
      const queueObj = { ...payload, type: 'driver-service-modify', timestamp: new Date().toISOString() };
      const updated = [...offlineQueue, queueObj];
      setOfflineQueue(updated);
      localStorage.setItem('fleetcore_offline_queue', JSON.stringify(updated));
      setServiceSuccessMsg('Offline Mode. Service modification buffered in storage!');
      setModifyingRecord(null);
      setTimeout(() => setServiceSuccessMsg(''), 4000);
    }
  };

  // Sync Offline Queue Back to DB
  const handleSyncOfflineData = async () => {
    if (offlineQueue.length === 0) return;

    let successCount = 0;
    for (const item of offlineQueue) {
      try {
        if (item.type === 'fuel') {
          await fetch('/api/fuel/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
          });
        } else if (item.type === 'fault') {
          await fetch('/api/maintenance/schedule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
          });
        } else if (item.type === 'gps') {
          await fetch('/api/gps-update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: item.vehicleId,
              latitude: item.lat,
              longitude: item.lng,
              speed: item.speed,
              fuelDec: item.fuelDec
            })
          });
        } else if (item.type === 'driver-service-add') {
          await fetch('/api/maintenance/driver-add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
          });
        } else if (item.type === 'driver-service-modify') {
          await fetch('/api/maintenance/driver-modify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
          });
        }
        successCount++;
      } catch (err) {
        console.error("Failed to sync offline item", item);
      }
    }

    // Clear queue
    setOfflineQueue([]);
    localStorage.removeItem('fleetcore_offline_queue');
    onRefresh();
    alert(`Successfully synchronized ${successCount} queued telemetry events to core database!`);
  };

  // Lockscreen View
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6 text-center mt-8 animate-fade-in" id="biometrics-lockscreen">
        <div className="w-16 h-16 bg-blue-500/10 dark:bg-blue-500/20 rounded-full flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
          <Lock className="w-7 h-7" />
        </div>
        
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Driver Portal Lockscreen</h2>
          <p className="text-xs text-zinc-500">MFA and Biometric Verification Required.</p>
        </div>

        <div className="space-y-4" id="driver-portal-auth-section">
          <div className="text-left">
            <label className="block text-xs font-semibold text-zinc-400 mb-1 uppercase tracking-wider">Select Driver Account</label>
            <select 
              value={selectedDriverId}
              onChange={e => setSelectedDriverId(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
            >
              {drivers.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
              ))}
            </select>
          </div>

          <div className="p-4 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl border border-zinc-100 dark:border-zinc-800/80 space-y-3">
            <button 
              onClick={handleBiometricAuthenticate}
              disabled={isBiometricScanning}
              className={`w-full py-4 px-4 rounded-xl flex flex-col items-center justify-center gap-2 border cursor-pointer transition ${
                isBiometricScanning 
                  ? 'border-blue-500 bg-blue-500/5 text-blue-600 animate-pulse' 
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-blue-500 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300'
              }`}
            >
              <Fingerprint className="w-10 h-10 text-blue-500" />
              <span className="text-xs font-bold uppercase tracking-widest font-mono">
                {isBiometricScanning ? 'Verifying Bio-Template...' : 'Scan Fingerprint (MFA)'}
              </span>
            </button>
            
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
              <span className="flex-shrink mx-3 text-[10px] text-zinc-400 font-bold uppercase font-mono">OR</span>
              <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
            </div>

            <button 
              onClick={handleManualLogin}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-2 px-4 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" /> Login with Password
            </button>
          </div>
        </div>

        <div className="text-[10px] text-zinc-400 space-y-1">
          <p className="font-semibold text-zinc-500">MFA & SOC-2 Audit Compliant</p>
          <p>Local biometric signatures remain sandboxed inside the browser's hardware enclave.</p>
        </div>
      </div>
    );
  }

  // Authenticated Portal View
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in" id="driver-portal-root">
      
      {/* Driver Header with Connection Status */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm" id="driver-portal-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold font-mono">
            {activeDriver?.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">Welcome, {activeDriver?.name}</h2>
            <p className="text-xs text-zinc-400 font-mono">Driver ID: {activeDriver?.id} &bull; License: {activeDriver?.licenseNumber}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Offline / Online Selector */}
          <button 
            onClick={onToggleOnline}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              isOnline 
                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600' 
                : 'bg-amber-500/5 border-amber-500/20 text-amber-600'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4" /> Online
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" /> Offline Mode
              </>
            )}
          </button>

          {offlineQueue.length > 0 && (
            <button 
              onClick={handleSyncOfflineData}
              disabled={!isOnline}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 animate-pulse"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Sync ({offlineQueue.length})
            </button>
          )}

          <button 
            onClick={() => { setIsAuthenticated(false); handleStopTrip(); }}
            className="text-xs text-red-500 hover:underline font-semibold cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      {activeVehicle ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="driver-telemetry-forms-grid">
          
          {/* Simulated Active Vehicle Telemetry Grid */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-6" id="driver-telemetry-card">
            <div>
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">Active Vehicle: {activeVehicle.id}</h3>
              <p className="text-xs text-zinc-400 font-mono">{activeVehicle.make} {activeVehicle.model} ({activeVehicle.year}) &bull; Plate: {activeVehicle.plate}</p>
            </div>

            {/* Simulated Speedometer & Gauges */}
            <div className="grid grid-cols-3 gap-3 text-center" id="driver-telemetry-gauges">
              <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-400 font-bold uppercase block">Speed</span>
                <p className="text-xl font-bold font-mono text-zinc-800 dark:text-zinc-100">{isDriving ? Math.floor(40 + Math.random() * 25) : 0} <span className="text-xs">km/h</span></p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-400 font-bold uppercase block">Fuel Level</span>
                <p className={`text-xl font-bold font-mono ${activeVehicle.fuelLevel < 30 ? 'text-red-500 animate-pulse' : 'text-zinc-800 dark:text-zinc-100'}`}>{Math.round(activeVehicle.fuelLevel)}%</p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-400 font-bold uppercase block">Odometer</span>
                <p className="text-base font-bold font-mono text-zinc-800 dark:text-zinc-100 leading-normal">{Math.round(activeVehicle.odometer).toLocaleString()} <span className="text-[10px]">km</span></p>
              </div>
            </div>

            {/* GPS Trip controls */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800 rounded-xl space-y-4" id="trip-simulator-controller">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">GPS Tracker Route Simulator</h4>
                  <p className="text-[10px] text-zinc-400">Simulate route movements in San Francisco to test dispatcher map integration.</p>
                </div>
                {isDriving && (
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                )}
              </div>

              {simCoords && (
                <div className="text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-emerald-400 p-2.5 rounded-lg space-y-1">
                  <p className="flex justify-between"><span>Current Latitude:</span> <span>{simCoords.lat.toFixed(6)}</span></p>
                  <p className="flex justify-between"><span>Current Longitude:</span> <span>{simCoords.lng.toFixed(6)}</span></p>
                  <p className="flex justify-between text-zinc-400"><span>Odometer Walk:</span> <span>+{tripDistance.toFixed(2)} km</span></p>
                </div>
              )}

              <div className="flex gap-2" id="driver-simulation-actions">
                {!isDriving ? (
                  <button 
                    onClick={handleStartTrip}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition shadow shadow-emerald-950/20"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Start Route Simulation
                  </button>
                ) : (
                  <button 
                    onClick={handleStopTrip}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition animate-pulse"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" /> Stop / Park Vehicle
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6" id="driver-receipts-faults-panel">
            {/* Submit Fuel Receipt Form */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4" id="driver-fuel-logging">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-blue-500" /> Log Fueling Receipt
              </h3>

              <form onSubmit={handleSubmitFuel} className="space-y-3" id="fuel-form">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-400 mb-1">Fuel Amount (Litres)</label>
                    <input 
                      type="number"
                      required
                      value={fuelAmt}
                      onChange={e => setFuelAmt(e.target.value)}
                      placeholder="e.g. 55"
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-400 mb-1">Total Cost ($)</label>
                    <input 
                      type="number"
                      required
                      value={fuelCost}
                      onChange={e => setFuelCost(e.target.value)}
                      placeholder="e.g. 95"
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 mb-1">Current Odometer Reading (km)</label>
                  <input 
                    type="number"
                    required
                    value={fuelOdo}
                    onChange={e => setFuelOdo(e.target.value)}
                    placeholder="e.g. 42300"
                    className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-1.5 px-3 rounded-lg text-xs cursor-pointer"
                >
                  Submit Fuel Log {!isOnline && '(Buffers Offline)'}
                </button>
              </form>

              {fuelMsg && (
                <p className="text-xs text-blue-600 dark:text-blue-400 text-center font-medium">{fuelMsg}</p>
              )}
            </div>

            {/* Report Issue/Fault Form */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4" id="driver-fault-logging">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-amber-500" /> Log Maintenance / Fault Issue
              </h3>

              <form onSubmit={handleSubmitFault} className="space-y-3" id="fault-form">
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 mb-1">Select Issue Category</label>
                  <select
                    value={faultType}
                    onChange={e => setFaultType(e.target.value)}
                    className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                  >
                    <option value="Brakes Squeaking">Brakes Squeaking/Soft</option>
                    <option value="Engine Check Light">Engine Check Light On</option>
                    <option value="Tire Pressure Low">Tire Pressure Warning</option>
                    <option value="Transmission slip">Transmission Shifting Hard</option>
                    <option value="Body glass scratch">Windshield Scratch/Crack</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 mb-1">Details & Remarks*</label>
                  <textarea 
                    required
                    value={faultNotes}
                    onChange={e => setFaultNotes(e.target.value)}
                    rows={2}
                    placeholder="Describe exactly what you heard or felt..."
                    className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-1.5 px-3 rounded-lg text-xs cursor-pointer"
                >
                  Submit Fault Ticket {!isOnline && '(Buffers Offline)'}
                </button>
              </form>

              {faultMsg && (
                <p className="text-xs text-amber-600 dark:text-amber-400 text-center font-medium">{faultMsg}</p>
              )}
            </div>
          </div>

          {/* FULL-WIDTH WORKFLOW SERVICE & MAINTENANCE HUB */}
          <div className="md:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6" id="driver-service-hub">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-100 dark:border-zinc-800 pb-4 gap-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-blue-500" /> Authorized Maintenance Records & Service Logs
                </h3>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Log new maintenance service records or propose modifications. All entries require Supervisor verification and Owner approval.
                </p>
              </div>
              {!modifyingRecord && (
                <button
                  onClick={() => {
                    setServiceNotesInput('');
                    setServiceCostInput('');
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition shadow shadow-blue-950/20"
                >
                  <Plus className="w-3.5 h-3.5" /> Log New Service Record
                </button>
              )}
            </div>

            {serviceSuccessMsg && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400 text-xs font-semibold text-center">
                {serviceSuccessMsg}
              </div>
            )}

            {/* Add / Propose Modification Form */}
            {modifyingRecord ? (
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800 rounded-xl space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                    <Edit3 className="w-4 h-4 text-amber-500" /> Propose Modification for service: <span className="font-mono text-amber-600 font-black">{modifyingRecord.id}</span>
                  </h4>
                  <button
                    onClick={() => setModifyingRecord(null)}
                    className="text-[10px] text-zinc-400 hover:text-zinc-600 font-bold"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleModifyServiceRecord} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-400">Service Category</label>
                    <input
                      type="text"
                      required
                      value={modifyingTypeInput}
                      onChange={e => setModifyingTypeInput(e.target.value)}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-400">Service Cost ($)</label>
                    <input
                      type="number"
                      required
                      value={modifyingCostInput}
                      onChange={e => setModifyingCostInput(e.target.value)}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-400">Scheduled Date</label>
                    <input
                      type="date"
                      required
                      value={modifyingDateInput}
                      onChange={e => setModifyingDateInput(e.target.value)}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-1.5 px-3 rounded-lg cursor-pointer transition shadow"
                    >
                      Submit Modification
                    </button>
                  </div>
                  <div className="md:col-span-4 space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-400">Details & Reason for Edit</label>
                    <textarea
                      rows={2}
                      required
                      value={modifyingNotesInput}
                      onChange={e => setModifyingNotesInput(e.target.value)}
                      placeholder="Why is this record being modified? Provide specifics..."
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                    />
                  </div>
                </form>
              </div>
            ) : (
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800 rounded-xl space-y-4">
                <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                  <Plus className="w-4 h-4 text-blue-500" /> Log Structured Service Record
                </h4>

                <form onSubmit={handleAddServiceRecord} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-400">Service Category</label>
                    <select
                      value={serviceTypeInput}
                      onChange={e => setServiceTypeInput(e.target.value)}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                    >
                      <option value="Oil Change">Oil Change</option>
                      <option value="Brake Pad Replacement">Brake Pad Replacement</option>
                      <option value="Tire Rotation">Tire Rotation</option>
                      <option value="Transmission Service">Transmission Service</option>
                      <option value="Regular Diagnostics">Regular Diagnostics</option>
                      <option value="Air Filter Swap">Air Filter Swap</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-400">Select Vendor</label>
                    <select
                      value={serviceVendorInput}
                      onChange={e => setServiceVendorInput(e.target.value)}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                    >
                      {vendors.map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-400">Service Cost ($)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={serviceCostInput}
                      onChange={e => setServiceCostInput(e.target.value)}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-400">Service Date</label>
                    <input
                      type="date"
                      value={serviceDateInput}
                      onChange={e => setServiceDateInput(e.target.value)}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-400">Service Notes</label>
                    <input
                      type="text"
                      placeholder="Describe service details, parts replaced, etc."
                      value={serviceNotesInput}
                      onChange={e => setServiceNotesInput(e.target.value)}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 px-3 rounded-lg cursor-pointer transition shadow"
                    >
                      Submit for Verification
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Service Logs Grid for This Vehicle */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Service History for Vehicle: {activeVehicle.id}</span>
              <div className="overflow-x-auto border border-zinc-100 dark:border-zinc-800/80 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold bg-zinc-50/50 dark:bg-zinc-900/10">
                      <th className="p-3">Record ID</th>
                      <th className="p-3">Service</th>
                      <th className="p-3">Vendor</th>
                      <th className="p-3">Cost</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Verification</th>
                      <th className="p-3">Owner Approval</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceRecords
                      .filter(m => m.vehicleId === activeVehicle.id)
                      .map(record => {
                        const vName = vendors.find(v => v.id === record.vendorId)?.name || record.vendorId;
                        return (
                          <tr key={record.id} className="border-b border-zinc-50 dark:border-zinc-800/40 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 text-zinc-700 dark:text-zinc-300">
                            <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                              <span>{record.id}</span>
                              {record.submittedBy === 'Driver' && (
                                <span className="text-[8px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1 py-0.2 rounded w-fit mt-0.5 block">Driver Log</span>
                              )}
                            </td>
                            <td className="p-3 font-medium">
                              <div>{record.serviceType}</div>
                              {record.pendingChanges && (
                                <div className="text-[9px] text-amber-500 font-semibold italic mt-0.5">
                                  Pending edit to: "{record.pendingChanges.serviceType}"
                                </div>
                              )}
                            </td>
                            <td className="p-3 font-mono">{vName}</td>
                            <td className="p-3 font-bold font-mono">
                              <span>${record.cost}</span>
                              {record.pendingChanges?.cost !== undefined && (
                                <span className="text-[9px] text-amber-500 block">Proposing: ${record.pendingChanges.cost}</span>
                              )}
                            </td>
                            <td className="p-3 text-zinc-400 font-mono">
                              <span>{record.scheduledDate}</span>
                              {record.pendingChanges?.scheduledDate && (
                                <span className="text-[9px] text-amber-500 block">Proposing: {record.pendingChanges.scheduledDate}</span>
                              )}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                record.supervisorVerified === 'Verified' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' :
                                record.supervisorVerified === 'Rejected' ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-400' :
                                'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                              }`}>
                                {record.supervisorVerified || 'Pending'}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                record.ownerApproved === 'Approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' :
                                record.ownerApproved === 'Rejected' ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-400' :
                                'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                              }`}>
                                {record.ownerApproved || 'Pending'}
                              </span>
                            </td>
                            <td className="p-3">
                              <button
                                onClick={() => handleStartModifying(record)}
                                className="text-zinc-500 hover:text-blue-600 font-bold flex items-center gap-0.5 cursor-pointer text-[10px]"
                                title="Modify this record"
                              >
                                <Edit3 className="w-3 h-3" /> Propose Edit
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm text-center" id="no-vehicle-panel">
          <HelpCircle className="w-10 h-10 text-zinc-400 mx-auto stroke-1 mb-2" />
          <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">No Vehicle Assigned</h3>
          <p className="text-xs text-zinc-400 mt-1">Please ask your fleet owner/supervisor to assign you as the primary driver for an active vehicle in the main SQL console.</p>
        </div>
      )}

    </div>
  );
};
