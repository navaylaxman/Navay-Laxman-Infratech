import React, { useState, useEffect } from 'react';
import { 
  Wrench, ShieldAlert, Truck, Users, MapPin, Clock, Check, 
  Plus, Calendar, PlusCircle, Link2, ExternalLink, AlertCircle, Sparkles, MessageSquareDot, HelpCircle, Shield, Trash2, Edit3, UserCheck, CheckSquare
} from 'lucide-react';
import { Vehicle, Vendor, MaintenanceRecord, InsurancePolicy, Driver, Supervisor, PushNotification } from '../types';

interface DashboardSupervisorProps {
  vehicles: Vehicle[];
  vendors: Vendor[];
  maintenanceRecords: MaintenanceRecord[];
  insurancePolicies: InsurancePolicy[];
  drivers: Driver[];
  supervisors?: Supervisor[];
  notifications: PushNotification[];
  onRefresh: () => void;
  onReadNotification: (id?: string) => void;
}

export const DashboardSupervisor: React.FC<DashboardSupervisorProps> = ({
  vehicles,
  vendors,
  maintenanceRecords,
  insurancePolicies,
  drivers,
  supervisors = [],
  notifications,
  onRefresh,
  onReadNotification
}) => {
  // Navigation tabs
  const [activeSubTab, setActiveSubTab] = useState<'map' | 'schedule' | 'vendors' | 'notifications' | 'verification' | 'vehicles-drivers' | 'insurance'>('map');

  // Tracking vehicle state on map
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [liveGpsLogs, setLiveGpsLogs] = useState<string[]>([]);

  // Maintenance Form State
  const [schedVehicleId, setSchedVehicleId] = useState('');
  const [schedVendorId, setSchedVendorId] = useState('');
  const [schedServiceType, setSchedServiceType] = useState('Oil Change');
  const [schedCost, setSchedCost] = useState('');
  const [schedDate, setSchedDate] = useState('');
  const [schedNotes, setSchedNotes] = useState('');
  const [scheduleMsg, setScheduleMsg] = useState('');

  // New Vendor Form State
  const [venName, setVenName] = useState('');
  const [venContact, setVenContact] = useState('');
  const [venPhone, setVenPhone] = useState('');
  const [venEmail, setVenEmail] = useState('');
  const [venServices, setVenServices] = useState('Oil Change, Brakes');
  const [venAddress, setVenAddress] = useState('');
  const [venMessage, setVenMessage] = useState('');

  // Third party integration popups/inputs
  const [linkingRecordId, setLinkingRecordId] = useState<string | null>(null);
  const [jiraKey, setJiraKey] = useState('');
  const [asanaId, setAsanaId] = useState('');

  // Vehicle Management Form State
  const [vehicleId, setVehicleId] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('2024');
  const [vehicleType, setVehicleType] = useState('Light Duty Truck');
  const [vehicleStatus, setVehicleStatus] = useState<'Active' | 'In Service' | 'On Trip' | 'Decommissioned'>('Active');
  const [vehicleSuccessMsg, setVehicleSuccessMsg] = useState('');

  // Modifying Vehicle State
  const [modVehicleId, setModVehicleId] = useState('');
  const [modVehiclePlate, setModVehiclePlate] = useState('');
  const [modVehicleMake, setModVehicleMake] = useState('');
  const [modVehicleModel, setModVehicleModel] = useState('');
  const [modVehicleYear, setModVehicleYear] = useState('');
  const [modVehicleType, setModVehicleType] = useState('');
  const [modVehicleStatus, setModVehicleStatus] = useState<'Active' | 'In Service' | 'On Trip' | 'Decommissioned'>('Active');

  // Driver Management Form State
  const [driverName, setDriverName] = useState('');
  const [driverEmail, setDriverEmail] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [driverLicense, setDriverLicense] = useState('');
  const [driverAddress, setDriverAddress] = useState('');
  const [driverPan, setDriverPan] = useState('');
  const [driverAadhar, setDriverAadhar] = useState('');
  const [driverBankDetails, setDriverBankDetails] = useState('');
  const [driverSupervisorId, setDriverSupervisorId] = useState('');
  const [driverSuccessMsg, setDriverSuccessMsg] = useState('');

  // Assignment Form State
  const [assignVehicleId, setAssignVehicleId] = useState('');
  const [assignDriverId, setAssignDriverId] = useState('');
  const [assignSuccessMsg, setAssignSuccessMsg] = useState('');

  // Verification feedback state
  const [verifySuccessMsg, setVerifySuccessMsg] = useState('');

  // Supervisor Insurance states
  const [insVehicleId, setInsVehicleId] = useState('');
  const [insProvider, setInsProvider] = useState('');
  const [insPolicyNumber, setInsPolicyNumber] = useState('');
  const [insExpiryDate, setInsExpiryDate] = useState('');
  const [insPremium, setInsPremium] = useState('');
  const [insCoverage, setInsCoverage] = useState('');
  const [insSuccessMsg, setInsSuccessMsg] = useState('');

  // Supervisor Insurance Modify states
  const [modInsId, setModInsId] = useState('');
  const [modInsVehicleId, setModInsVehicleId] = useState('');
  const [modInsProvider, setModInsProvider] = useState('');
  const [modInsPolicyNumber, setModInsPolicyNumber] = useState('');
  const [modInsExpiryDate, setModInsExpiryDate] = useState('');
  const [modInsPremium, setModInsPremium] = useState('');
  const [modInsCoverage, setModInsCoverage] = useState('');

  // Supervisor Insurance API Handlers
  const handleSupervisorAddInsurance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!insVehicleId || !insProvider || !insPolicyNumber || !insExpiryDate) {
      setInsSuccessMsg('Please fill in all required fields (Vehicle, Provider, Policy#, Expiry).');
      return;
    }
    try {
      const res = await fetch('/api/supervisor/insurance/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: insVehicleId,
          provider: insProvider,
          policyNumber: insPolicyNumber,
          expiryDate: insExpiryDate,
          annualPremium: Number(insPremium || 0),
          coverageDetails: insCoverage
        })
      });
      if (res.ok) {
        setInsSuccessMsg('Successfully added insurance policy! Sent to Owner for final approval.');
        setInsVehicleId('');
        setInsProvider('');
        setInsPolicyNumber('');
        setInsExpiryDate('');
        setInsPremium('');
        setInsCoverage('');
        onRefresh();
        setTimeout(() => setInsSuccessMsg(''), 4000);
      } else {
        const d = await res.json();
        setInsSuccessMsg(d.error || 'Failed to add insurance policy.');
      }
    } catch (err) {
      setInsSuccessMsg('Error calling API.');
    }
  };

  const handleSupervisorModifyInsurance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modInsId) return;
    try {
      const res = await fetch('/api/supervisor/insurance/modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: modInsId,
          updates: {
            vehicleId: modInsVehicleId,
            provider: modInsProvider,
            policyNumber: modInsPolicyNumber,
            expiryDate: modInsExpiryDate,
            annualPremium: Number(modInsPremium || 0),
            coverageDetails: modInsCoverage
          }
        })
      });
      if (res.ok) {
        setInsSuccessMsg(`Submitted modification request for Policy ${modInsId} to Owner!`);
        setModInsId('');
        onRefresh();
        setTimeout(() => setInsSuccessMsg(''), 4000);
      } else {
        setInsSuccessMsg('Failed to update policy.');
      }
    } catch (err) {
      setInsSuccessMsg('Error calling API.');
    }
  };

  const handleSupervisorVerifyInsurance = async (id: string, verified: boolean) => {
    try {
      const res = await fetch('/api/supervisor/insurance/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, verified })
      });
      if (res.ok) {
        setVerifySuccessMsg(`Successfully verified insurance policy ${id}! forwarded to Owner.`);
        onRefresh();
        setTimeout(() => setVerifySuccessMsg(''), 4000);
      } else {
        setVerifySuccessMsg('Verification failed.');
      }
    } catch (err) {
      setVerifySuccessMsg('Error processing verification.');
    }
  };

  const handleSupervisorVerifyVehicle = async (id: string, verified: boolean) => {
    try {
      const res = await fetch('/api/supervisor/vehicle/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, verified })
      });
      if (res.ok) {
        setVerifySuccessMsg(`Successfully verified vehicle ${id}! forwarded to Owner.`);
        onRefresh();
        setTimeout(() => setVerifySuccessMsg(''), 4000);
      } else {
        setVerifySuccessMsg('Verification failed.');
      }
    } catch (err) {
      setVerifySuccessMsg('Error processing verification.');
    }
  };

  const handleSelectModInsurance = (policyId: string) => {
    const p = insurancePolicies.find(item => item.id === policyId);
    if (p) {
      setModInsId(p.id);
      setModInsVehicleId(p.vehicleId);
      setModInsProvider(p.provider);
      setModInsPolicyNumber(p.policyNumber);
      setModInsExpiryDate(p.expiryDate);
      setModInsPremium(String(p.annualPremium));
      setModInsCoverage(p.coverageDetails);
    }
  };

  // Supervisor verifies or rejects driver's service log
  const handleSupervisorVerify = async (id: string, verified: boolean) => {
    try {
      const res = await fetch('/api/maintenance/supervisor-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, verified })
      });
      if (res.ok) {
        setVerifySuccessMsg(`Record ${id} successfully ${verified ? 'verified' : 'rejected'} and logged! Sent to Owner for final approval.`);
        onRefresh();
        setTimeout(() => setVerifySuccessMsg(''), 4000);
      } else {
        setVerifySuccessMsg('Verification failed.');
      }
    } catch (err) {
      setVerifySuccessMsg('Error submitting verification.');
    }
  };

  // Supervisor adds a new vehicle (pending owner approval)
  const handleSupervisorAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !vehiclePlate || !vehicleMake || !vehicleModel) {
      setVehicleSuccessMsg('All vehicle fields are required.');
      return;
    }

    try {
      const res = await fetch('/api/vehicle/supervisor-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: vehicleId,
          plate: vehiclePlate,
          make: vehicleMake,
          model: vehicleModel,
          year: Number(vehicleYear),
          type: vehicleType,
          status: vehicleStatus
        })
      });
      if (res.ok) {
        setVehicleSuccessMsg(`Vehicle ${vehicleId} registered and sent to Owner for approval!`);
        setVehicleId('');
        setVehiclePlate('');
        setVehicleMake('');
        setVehicleModel('');
        onRefresh();
        setTimeout(() => setVehicleSuccessMsg(''), 4000);
      } else {
        setVehicleSuccessMsg('Vehicle addition failed (Check if ID is duplicate).');
      }
    } catch (err) {
      setVehicleSuccessMsg('Error adding vehicle.');
    }
  };

  // Supervisor modifies vehicle details (pending owner approval)
  const handleSupervisorModifyVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modVehicleId) return;

    try {
      const res = await fetch('/api/vehicle/supervisor-modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: modVehicleId,
          plate: modVehiclePlate,
          make: modVehicleMake,
          model: modVehicleModel,
          year: Number(modVehicleYear),
          type: modVehicleType,
          status: modVehicleStatus
        })
      });
      if (res.ok) {
        setVehicleSuccessMsg(`Modification proposals for ${modVehicleId} submitted for Owner approval!`);
        setModVehicleId('');
        onRefresh();
        setTimeout(() => setVehicleSuccessMsg(''), 4000);
      } else {
        setVehicleSuccessMsg('Vehicle modification failed.');
      }
    } catch (err) {
      setVehicleSuccessMsg('Error modifying vehicle.');
    }
  };

  // Pre-fill modification fields
  const handleSelectModVehicle = (vId: string) => {
    const v = vehicles.find(item => item.id === vId);
    if (v) {
      setModVehicleId(v.id);
      setModVehiclePlate(v.plate);
      setModVehicleMake(v.make);
      setModVehicleModel(v.model);
      setModVehicleYear(String(v.year));
      setModVehicleType(v.type);
      setModVehicleStatus(v.status);
    }
  };

  // Supervisor adds a driver (pending owner approval)
  const handleSupervisorAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName || !driverEmail || !driverPhone || !driverLicense) {
      setDriverSuccessMsg('All driver fields are required.');
      return;
    }

    try {
      const res = await fetch('/api/driver/supervisor-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: driverName,
          email: driverEmail,
          phone: driverPhone,
          license: driverLicense,
          address: driverAddress,
          pan: driverPan,
          aadhar: driverAadhar,
          bankDetails: driverBankDetails,
          supervisorId: driverSupervisorId || null
        })
      });
      if (res.ok) {
        setDriverSuccessMsg(`Driver ${driverName} registered! Pending Owner approval.`);
        setDriverName('');
        setDriverEmail('');
        setDriverPhone('');
        setDriverLicense('');
        setDriverAddress('');
        setDriverPan('');
        setDriverAadhar('');
        setDriverBankDetails('');
        setDriverSupervisorId('');
        onRefresh();
        setTimeout(() => setDriverSuccessMsg(''), 4000);
      } else {
        setDriverSuccessMsg('Driver registration failed.');
      }
    } catch (err) {
      setDriverSuccessMsg('Error registering driver.');
    }
  };

  // Supervisor assigns a driver to vehicle (pending owner approval)
  const handleSupervisorAssignDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignVehicleId || !assignDriverId) {
      setAssignSuccessMsg('Please select both a vehicle and a driver.');
      return;
    }

    try {
      const res = await fetch('/api/driver/supervisor-assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: assignVehicleId,
          driverId: assignDriverId
        })
      });
      if (res.ok) {
        setAssignSuccessMsg('Assignment proposed successfully! Pending Owner approval.');
        onRefresh();
        setTimeout(() => setAssignSuccessMsg(''), 4000);
      } else {
        setAssignSuccessMsg('Assignment proposal failed.');
      }
    } catch (err) {
      setAssignSuccessMsg('Error assigning driver.');
    }
  };

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  // GPS Log simulation ticker
  useEffect(() => {
    if (!selectedVehicleId || !selectedVehicle) {
      setLiveGpsLogs([]);
      return;
    }

    // Populate initial logs
    const initialLogs = [];
    for (let i = 0; i < 5; i++) {
      const offsetLat = (Math.random() - 0.5) * 0.002;
      const offsetLng = (Math.random() - 0.5) * 0.002;
      initialLogs.unshift(`[GPS] Lat: ${(selectedVehicle.latitude + offsetLat).toFixed(6)}, Lng: ${(selectedVehicle.longitude + offsetLng).toFixed(6)} | Speed: ${selectedVehicle.speed} km/h`);
    }
    setLiveGpsLogs(initialLogs);

    const interval = setInterval(() => {
      const offsetLat = (Math.random() - 0.5) * 0.0005;
      const offsetLng = (Math.random() - 0.5) * 0.0005;
      const log = `[GPS] Lat: ${(selectedVehicle.latitude + offsetLat).toFixed(6)}, Lng: ${(selectedVehicle.longitude + offsetLng).toFixed(6)} | Telemetry: Speed ${selectedVehicle.speed} km/h, Fuel ${selectedVehicle.fuelLevel}%, Odometer ${selectedVehicle.odometer.toFixed(1)} km`;
      setLiveGpsLogs(prev => [log, ...prev.slice(0, 15)]);
    }, 2500);

    return () => clearInterval(interval);
  }, [selectedVehicleId, vehicles]);

  // Set default form values
  useEffect(() => {
    if (vehicles.length > 0 && !schedVehicleId) {
      setSchedVehicleId(vehicles[0].id);
    }
    if (vendors.length > 0 && !schedVendorId) {
      setSchedVendorId(vendors[0].id);
    }
  }, [vehicles, vendors]);

  const handleScheduleMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedVehicleId || !schedVendorId || !schedServiceType || !schedDate) {
      setScheduleMsg('Please fill in all required maintenance fields.');
      return;
    }

    try {
      const res = await fetch('/api/maintenance/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: schedVehicleId,
          vendorId: schedVendorId,
          serviceType: schedServiceType,
          cost: Number(schedCost || 0),
          scheduledDate: schedDate,
          notes: schedNotes
        })
      });

      if (res.ok) {
        setScheduleMsg('Service scheduled and linked in relational engine!');
        setSchedNotes('');
        setSchedCost('');
        onRefresh();
        setTimeout(() => setScheduleMsg(''), 4000);
      } else {
        setScheduleMsg('Error scheduling maintenance.');
      }
    } catch (e) {
      setScheduleMsg('Connection failure to database.');
    }
  };

  const handleRegisterVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!venName || !venContact || !venEmail) {
      setVenMessage('Name, Contact, and Email are required.');
      return;
    }

    try {
      const servicesArray = venServices.split(',').map(s => s.trim());
      const res = await fetch('/api/vendor/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: venName,
          contactPerson: venContact,
          phone: venPhone,
          email: venEmail,
          services: servicesArray,
          address: venAddress
        })
      });

      if (res.ok) {
        setVenMessage('Vendor registered and cached successfully!');
        setVenName('');
        setVenContact('');
        setVenPhone('');
        setVenEmail('');
        setVenAddress('');
        onRefresh();
        setTimeout(() => setVenMessage(''), 4000);
      } else {
        setVenMessage('Failed to register vendor.');
      }
    } catch (err) {
      setVenMessage('Backend server offline.');
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue') => {
    try {
      const body: any = { id, status: newStatus };
      if (newStatus === 'Completed') {
        body.completedDate = new Date().toISOString().split('T')[0];
      }
      const res = await fetch('/api/maintenance/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        onRefresh();
        // Trigger push notification of service completion
        const record = maintenanceRecords.find(m => m.id === id);
        if (record) {
          fetch('/api/notifications/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: 'Service Completed',
              message: `Service record ${id} (${record.serviceType}) for vehicle ${record.vehicleId} is complete. Jira/Asana updated.`,
              type: 'task'
            })
          }).then(() => onRefresh());
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLinkIntegration = async (recordId: string, platform: 'jira' | 'asana', keyVal: string) => {
    if (!keyVal) return;
    try {
      const res = await fetch('/api/maintenance/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: recordId, platform, key: keyVal })
      });
      if (res.ok) {
        onRefresh();
        setLinkingRecordId(null);
        setJiraKey('');
        setAsanaId('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6" id="supervisor-dashboard-root">
      {/* Tab Selectors */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800" id="supervisor-tabs-bar">
        <button 
          onClick={() => setActiveSubTab('map')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'map' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <MapPin className="w-4 h-4" /> Real-time GPS Tracker & Assets
        </button>
        <button 
          onClick={() => setActiveSubTab('schedule')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'schedule' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Wrench className="w-4 h-4" /> Maintenance Scheduler
        </button>
        <button 
          onClick={() => setActiveSubTab('vendors')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'vendors' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Users className="w-4 h-4" /> Vendor Registries
        </button>
        <button 
          onClick={() => setActiveSubTab('notifications')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 relative ${
            activeSubTab === 'notifications' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <MessageSquareDot className="w-4 h-4" /> Service Intervals
          {notifications.filter(n => !n.isRead).length > 0 && (
            <span className="absolute top-2.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          )}
        </button>
        <button 
          onClick={() => setActiveSubTab('verification')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 relative ${
            activeSubTab === 'verification' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-amber-500" /> Driver Verifications
          {maintenanceRecords.filter(m => m.supervisorVerified === 'Pending').length > 0 && (
            <span className="absolute top-2.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </button>
        <button 
          onClick={() => setActiveSubTab('vehicles-drivers')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'vehicles-drivers' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Truck className="w-4 h-4 text-blue-500" /> Manage Vehicles & Drivers
        </button>
        <button 
          onClick={() => setActiveSubTab('insurance')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 relative ${
            activeSubTab === 'insurance' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Shield className="w-4 h-4 text-emerald-500" /> Insurance Policies
          {insurancePolicies.filter(p => !p.supervisorVerified).length > 0 && (
            <span className="absolute top-2.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </button>
      </div>

      {/* SUB TAB: Map & Real-time Tracking */}
      {activeSubTab === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="gps-tab-container">
          {/* List of Vehicles */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm h-[520px] flex flex-col justify-between" id="asset-list-panel">
            <div>
              <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-3">
                <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Fleet Active Tracking ({vehicles.length})</h3>
                <span className="text-[10px] uppercase font-mono bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-bold">Live Stream</span>
              </div>
              
              <div className="space-y-2 overflow-y-auto h-[430px] pr-1" id="asset-scroll-container">
                {vehicles.map(v => {
                  const isSelected = v.id === selectedVehicleId;
                  const driver = drivers.find(d => d.id === v.driverId);
                  return (
                    <div 
                      key={v.id}
                      onClick={() => setSelectedVehicleId(v.id)}
                      className={`p-3 border rounded-xl transition cursor-pointer flex items-start justify-between ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-500/5 dark:bg-blue-500/10' 
                          : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950/30'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Truck className={`w-4 h-4 ${isSelected ? 'text-blue-500' : 'text-zinc-400'}`} />
                          <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200">{v.id} - {v.make} {v.model}</span>
                        </div>
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono space-y-0.5">
                          <p>Plate: {v.plate} &bull; Odo: {Math.round(v.odometer).toLocaleString()} km</p>
                          <p className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300 font-semibold mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Driver: {driver ? driver.name : 'Unassigned'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          v.status === 'On Trip' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400' :
                          v.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' :
                          v.status === 'In Service' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' :
                          'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}>
                          {v.status}
                        </span>
                        <p className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 font-mono">{v.fuelLevel}% Fuel</p>
                        {v.speed > 0 && (
                          <span className="text-[9px] text-emerald-600 font-bold block animate-pulse">{v.speed} km/h</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Map Vector Visualization & Details */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm col-span-1 lg:col-span-2 h-[520px] grid grid-cols-1 md:grid-cols-5 gap-4" id="tracking-canvas-panel">
            
            {/* SVG Visual Simulated Map Area */}
            <div className="bg-slate-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800 relative col-span-1 md:col-span-3 overflow-hidden flex flex-col justify-between" id="simulated-map-wrapper">
              
              <div className="absolute top-2 left-2 z-10 bg-white/90 dark:bg-zinc-900/95 shadow border border-zinc-100 dark:border-zinc-800 px-2 py-1.5 rounded-lg text-[9px] font-mono space-y-0.5">
                <p className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> Real-time Dispatch Map
                </p>
                <p className="text-zinc-400">San Francisco Terminal Sub-sector</p>
              </div>

              {/* Simulated Map SVG Background */}
              <div className="w-full h-full relative" id="vector-map-graphic">
                <svg className="w-full h-full text-zinc-200 dark:text-zinc-800/40" viewBox="0 0 300 300">
                  {/* Grid Lines */}
                  <line x1="0" y1="100" x2="300" y2="100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" />
                  <line x1="0" y1="200" x2="300" y2="200" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" />
                  <line x1="100" y1="0" x2="100" y2="300" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" />
                  <line x1="200" y1="0" x2="200" y2="300" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" />

                  {/* Simulated Roads/Highways */}
                  <path d="M10,80 Q100,20 290,120" fill="none" stroke="#94a3b8" strokeWidth="3" opacity="0.4" />
                  <path d="M40,290 L260,10" fill="none" stroke="#94a3b8" strokeWidth="2.5" opacity="0.3" />
                  <path d="M150,10 L150,290" fill="none" stroke="#94a3b8" strokeWidth="2.5" opacity="0.35" />
                  <path d="M10,150 C100,160 200,130 290,200" fill="none" stroke="#3b82f6" strokeWidth="4" opacity="0.25" />

                  {/* Warehouses/Logistics Hubs */}
                  <g transform="translate(150,150)" className="text-blue-500/20 dark:text-blue-400/10">
                    <circle r="25" fill="currentColor" />
                    <circle r="1.5" fill="#3b82f6" />
                    <text x="5" y="15" fill="#64748b" fontSize="7" fontWeight="bold">HQ Terminal</text>
                  </g>
                  <g transform="translate(60,60)">
                    <circle r="5" fill="#e2e8f0" stroke="#cbd5e1" />
                    <text x="8" y="3" fill="#94a3b8" fontSize="5" fontStyle="italic">Sector West Depot</text>
                  </g>
                  <g transform="translate(240,220)">
                    <circle r="5" fill="#e2e8f0" stroke="#cbd5e1" />
                    <text x="-35" y="3" fill="#94a3b8" fontSize="5" fontStyle="italic">Sector East Dock</text>
                  </g>

                  {/* Render vehicles as SVG nodes */}
                  {vehicles.map(v => {
                    // Normalize lat/lng to fit SF dimensions [37.75, 37.79] and [-122.45, -122.40] into map coordinate grid [0, 300]
                    const latMin = 37.75;
                    const latMax = 37.79;
                    const lngMin = -122.45;
                    const lngMax = -122.40;

                    const x = ((v.longitude - lngMin) / (lngMax - lngMin)) * 300;
                    const y = (1 - (v.latitude - latMin) / (latMax - latMin)) * 300;

                    const isSelected = v.id === selectedVehicleId;

                    return (
                      <g 
                        key={v.id} 
                        transform={`translate(${x}, ${y})`} 
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVehicleId(v.id);
                        }}
                      >
                        {v.status === 'On Trip' && (
                          <circle r="12" className="fill-indigo-500/20 stroke-indigo-500/10 animate-ping" />
                        )}
                        {isSelected && (
                          <circle r="16" className="fill-blue-500/10 stroke-blue-500/30 animate-pulse" />
                        )}
                        <circle 
                          r={isSelected ? "6" : "4"} 
                          fill={
                            v.status === 'On Trip' ? '#6366f1' :
                            v.status === 'Active' ? '#10b981' :
                            v.status === 'In Service' ? '#f59e0b' :
                            '#94a3b8'
                          } 
                          stroke={isSelected ? "#fff" : "transparent"}
                          strokeWidth="1.5"
                        />
                        <text 
                          x="7" 
                          y="3" 
                          fill={isSelected ? "#3b82f6" : "#64748b"} 
                          fontSize="6.5" 
                          fontWeight={isSelected ? "bold" : "normal"}
                        >
                          {v.id}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="p-2 border-t border-zinc-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/40 text-[9px] text-zinc-500 flex justify-between items-center font-mono">
                <span>Map Coordinate System: UTM Projection</span>
                <span>Click markers to query GPS telemeter</span>
              </div>
            </div>

            {/* GPS Telemetry Log Stream & Details */}
            <div className="col-span-1 md:col-span-2 flex flex-col justify-between" id="telemetry-log-panel">
              <div className="space-y-4">
                <div className="bg-zinc-50 dark:bg-zinc-950 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-2">
                  <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Telemeter Query
                  </h4>
                  {selectedVehicle ? (
                    <div className="text-xs space-y-1" id="scanned-telemetry-details">
                      <p><strong className="text-zinc-400">ID/Plate:</strong> <span className="font-semibold text-zinc-800 dark:text-zinc-100">{selectedVehicle.id} ({selectedVehicle.plate})</span></p>
                      <p><strong className="text-zinc-400">Class:</strong> <span className="text-zinc-700 dark:text-zinc-300">{selectedVehicle.type} ({selectedVehicle.make} {selectedVehicle.model})</span></p>
                      <p><strong className="text-zinc-400">Coords:</strong> <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400">{selectedVehicle.latitude.toFixed(5)}, {selectedVehicle.longitude.toFixed(5)}</span></p>
                      <p><strong className="text-zinc-400">Status:</strong> <span className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedVehicle.status}</span></p>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-[11px] text-zinc-400">
                      <HelpCircle className="w-6 h-6 mx-auto stroke-1 mb-2" />
                      Select a vehicle on the left or map to inspect real-time telematics
                    </div>
                  )}
                </div>

                {selectedVehicle && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Live Stream Coordinates (RTOS)</span>
                    <div className="bg-zinc-950 text-emerald-500 font-mono text-[9px] p-3 rounded-xl border border-zinc-800 h-64 overflow-y-auto space-y-1.5" id="gps-stream-log">
                      {liveGpsLogs.map((log, idx) => (
                        <div key={idx} className="leading-normal hover:bg-zinc-900 px-1 py-0.5 rounded transition">
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SUB TAB: Maintenance Scheduler */}
      {activeSubTab === 'schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in" id="maintenance-tab-container">
          {/* Scheduling Form */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm h-fit" id="scheduler-form-panel">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-blue-500" /> Create Service Scheduled Interval
            </h3>

            <form onSubmit={handleScheduleMaintenance} className="space-y-4" id="service-scheduler-form">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Select Vehicle*</label>
                <select 
                  value={schedVehicleId}
                  onChange={e => setSchedVehicleId(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.id} ({v.make} {v.model})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Select Service Provider*</label>
                <select 
                  value={schedVendorId}
                  onChange={e => setSchedVendorId(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                >
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.contactPerson})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Service Category*</label>
                <input 
                  type="text"
                  required
                  value={schedServiceType}
                  onChange={e => setSchedServiceType(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                  placeholder="e.g. Brake Replacement & Rotor Inspection"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Estimated Cost ($)</label>
                  <input 
                    type="number"
                    value={schedCost}
                    onChange={e => setSchedCost(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                    placeholder="150"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Scheduled Date*</label>
                  <input 
                    type="date"
                    required
                    value={schedDate}
                    onChange={e => setSchedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Instruction Notes</label>
                <textarea 
                  value={schedNotes}
                  onChange={e => setSchedNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                  placeholder="Additional inspection guidelines..."
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 px-4 rounded-lg cursor-pointer"
              >
                Schedule Service Ticket
              </button>
            </form>

            {scheduleMsg && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-3 font-semibold text-center">{scheduleMsg}</p>
            )}
          </div>

          {/* Service Tickets & Jira/Asana Integrations */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm col-span-1 lg:col-span-2 space-y-4" id="tickets-registry-panel">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">Service Maintenance Tickets ({maintenanceRecords.length})</h3>
                <p className="text-[10px] text-zinc-400 mt-0.5">Linked directly to external third-party project boards.</p>
              </div>
              <span className="text-[10px] font-mono bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded font-bold">Bi-directional Sync</span>
            </div>

            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1" id="tickets-scroller">
              {maintenanceRecords.map(m => {
                const vehicle = vehicles.find(v => v.id === m.vehicleId);
                const vendor = vendors.find(vd => vd.id === m.vendorId);
                const isLinking = linkingRecordId === m.id;

                return (
                  <div key={m.id} className="p-4 bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-100 dark:border-zinc-800 rounded-xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800/60 pb-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-zinc-400">TICKET: {m.id}</span>
                        <h4 className="font-bold text-xs text-zinc-800 dark:text-zinc-100">{m.serviceType}</h4>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Vehicle: <strong className="text-zinc-700 dark:text-zinc-300">{m.vehicleId}</strong> &bull; Vendor: <strong className="text-zinc-700 dark:text-zinc-300">{vendor ? vendor.name : 'Unknown'}</strong></p>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-center">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          m.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' :
                          m.status === 'In Progress' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-400' :
                          m.status === 'Scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400' :
                          'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400'
                        }`}>
                          {m.status}
                        </span>
                        <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300 font-mono">${m.cost}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 italic">"{m.notes}"</p>

                    {/* Jira & Asana Sync Display */}
                    <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono">
                      {m.jiraIssueKey ? (
                        <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10" title="Auto Syncing Status">
                          <Link2 className="w-3 h-3" /> Jira: {m.jiraIssueKey}
                          {m.status === 'Completed' ? <span className="text-[8px] bg-emerald-500 text-white px-1 rounded">CLOSED</span> : <span className="text-[8px] bg-amber-500 text-white px-1 rounded font-bold">IN DEV</span>}
                        </span>
                      ) : (
                        <button 
                          onClick={() => setLinkingRecordId(m.id)} 
                          className="text-[9px] text-blue-500 hover:underline flex items-center gap-0.5"
                        >
                          + Link Jira
                        </button>
                      )}

                      {m.asanaTaskId ? (
                        <span className="flex items-center gap-1 text-red-500 dark:text-red-400 bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10" title="Auto Syncing Status">
                          <Link2 className="w-3 h-3" /> Asana: {m.asanaTaskId}
                          {m.status === 'Completed' ? <span className="text-[8px] bg-emerald-500 text-white px-1 rounded">RESOLVED</span> : <span className="text-[8px] bg-indigo-500 text-white px-1 rounded">ASSIGNED</span>}
                        </span>
                      ) : (
                        <button 
                          onClick={() => setLinkingRecordId(m.id)} 
                          className="text-[9px] text-red-500 hover:underline flex items-center gap-0.5"
                        >
                          + Link Asana
                        </button>
                      )}
                    </div>

                    {/* Form to insert key values for linking */}
                    {isLinking && (
                      <div className="p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs space-y-2">
                        <p className="font-semibold text-zinc-700 dark:text-zinc-300">Synchronize Ticket with Integration Hub</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-400">Jira Ticket Key</label>
                            <input 
                              type="text" 
                              value={jiraKey} 
                              onChange={e => setJiraKey(e.target.value)}
                              placeholder="e.g. FLEET-142" 
                              className="w-full px-2 py-1 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded text-xs text-zinc-800 dark:text-zinc-100"
                            />
                            <button 
                              onClick={() => handleLinkIntegration(m.id, 'jira', jiraKey)}
                              className="px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[9px] font-semibold"
                            >
                              Sync Jira
                            </button>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-400">Asana Task ID</label>
                            <input 
                              type="text" 
                              value={asanaId} 
                              onChange={e => setAsanaId(e.target.value)}
                              placeholder="e.g. as_task_448" 
                              className="w-full px-2 py-1 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded text-xs text-zinc-800 dark:text-zinc-100"
                            />
                            <button 
                              onClick={() => handleLinkIntegration(m.id, 'asana', asanaId)}
                              className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded text-[9px] font-semibold"
                            >
                              Sync Asana
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Status updater quick actions */}
                    {m.status !== 'Completed' && (
                      <div className="flex gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/40">
                        {m.status === 'Scheduled' && (
                          <button 
                            onClick={() => handleUpdateStatus(m.id, 'In Progress')}
                            className="bg-zinc-800 hover:bg-zinc-700 hover:text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-[10px] py-1 px-3 rounded transition font-semibold cursor-pointer"
                          >
                            Set to 'In Progress'
                          </button>
                        )}
                        {m.status === 'In Progress' && (
                          <button 
                            onClick={() => handleUpdateStatus(m.id, 'Completed')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] py-1 px-3 rounded transition font-semibold cursor-pointer flex items-center gap-0.5"
                          >
                            <Check className="w-3 h-3" /> Complete Ticket & Sync
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB: Vendors Directory */}
      {activeSubTab === 'vendors' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in" id="vendors-tab-container">
          {/* Vendor Create Form */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm h-fit" id="vendor-creator-form-panel">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2 mb-4">
              <PlusCircle className="w-5 h-5 text-blue-500" /> Register Maintenance Vendor
            </h3>

            <form onSubmit={handleRegisterVendor} className="space-y-4" id="vendor-form">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Company Name*</label>
                <input 
                  type="text"
                  required
                  value={venName}
                  onChange={e => setVenName(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                  placeholder="e.g. SOMA Transmission Specialists"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Contact Person*</label>
                <input 
                  type="text"
                  required
                  value={venContact}
                  onChange={e => setVenContact(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                  placeholder="e.g. Frank Castillo"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Phone Number</label>
                  <input 
                    type="tel"
                    value={venPhone}
                    onChange={e => setVenPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                    placeholder="+1 (555) 993-8822"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Corporate Email*</label>
                  <input 
                    type="email"
                    required
                    value={venEmail}
                    onChange={e => setVenEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                    placeholder="frank@somatransmissions.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Services Offered (Comma Separated)</label>
                <input 
                  type="text"
                  value={venServices}
                  onChange={e => setVenServices(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                  placeholder="Engine Diagnostics, Clutch Repair, Exhaust"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Shop Address</label>
                <input 
                  type="text"
                  value={venAddress}
                  onChange={e => setVenAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                  placeholder="e.g. 10th St, San Francisco, CA"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 px-4 rounded-lg cursor-pointer animate-pulse"
              >
                Register Maintenance Vendor
              </button>
            </form>

            {venMessage && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-3 font-semibold text-center">{venMessage}</p>
            )}
          </div>

          {/* Vendors Directory List */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm col-span-1 lg:col-span-2 space-y-4" id="vendors-directory-panel">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 pb-3 border-b border-zinc-100 dark:border-zinc-800">Verified Vendors ({vendors.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="vendors-grid">
              {vendors.map(v => (
                <div key={v.id} className="p-4 bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-100 dark:border-zinc-800 rounded-xl space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-xs text-zinc-800 dark:text-zinc-200">{v.name}</h4>
                      <span className="text-[10px] font-bold text-amber-500 font-mono">★ {v.rating}</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 font-mono">ID: {v.id}</p>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 space-y-0.5 font-mono">
                      <p>Contact: <strong className="text-zinc-700 dark:text-zinc-300">{v.contactPerson}</strong></p>
                      <p>Phone: {v.phone}</p>
                      <p>Email: {v.email}</p>
                      <p className="truncate" title={v.address}>Addr: {v.address}</p>
                    </div>
                  </div>

                  <div className="border-t border-zinc-100 dark:border-zinc-800/60 pt-2" id="vendor-services-offered">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase block mb-1">Capabilities</span>
                    <div className="flex flex-wrap gap-1" id="vendor-services-labels">
                      {v.services.map((svc, sIdx) => (
                        <span key={sIdx} className="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-[9px] font-semibold px-1.5 py-0.5 rounded">
                          {svc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB: Notifications Interval Center */}
      {activeSubTab === 'notifications' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm max-w-4xl mx-auto space-y-4 animate-fade-in" id="alerts-tab-container">
          <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">Service Interval Alerts & Push Notifications</h3>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">Alerts dispatched for vehicle oil intervals, policy expirations, and safety logs.</p>
            </div>
            <button 
              onClick={() => onReadNotification()}
              className="text-xs text-blue-500 hover:text-blue-600 hover:underline cursor-pointer"
            >
              Mark all read
            </button>
          </div>

          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1" id="alerts-scroller">
            {notifications.length > 0 ? (
              notifications.map(notif => (
                <div 
                  key={notif.id}
                  onClick={() => onReadNotification(notif.id)}
                  className={`p-3.5 border rounded-xl flex items-start justify-between gap-4 transition cursor-pointer ${
                    notif.isRead 
                      ? 'bg-zinc-50 dark:bg-zinc-950/20 border-zinc-100 dark:border-zinc-800 text-zinc-500' 
                      : 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20 text-zinc-800 dark:text-zinc-100 font-medium'
                  }`}
                >
                  <div className="flex gap-2.5">
                    {notif.type === 'security' ? (
                      <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    ) : (
                      <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className="text-xs font-bold leading-normal">{notif.title}</h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">{notif.message}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[9px] text-zinc-400 font-mono">{new Date(notif.timestamp).toLocaleTimeString()}</span>
                    {!notif.isRead && (
                      <span className="block text-[8px] bg-amber-500 text-white px-1.5 py-0.5 rounded font-bold uppercase mt-1 w-fit ml-auto">NEW</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-zinc-400">
                No active notifications or service alerts. All assets verified clean.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB TAB: Driver Verifications */}
      {activeSubTab === 'verification' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm max-w-5xl mx-auto space-y-6 animate-fade-in" id="verification-tab-container">
          
          {verifySuccessMsg && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-semibold text-center">
              {verifySuccessMsg}
            </div>
          )}

          {/* SECTION 1: SERVICES */}
          <div className="space-y-3">
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-2 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-blue-500" /> Pending Driver Service Verifications
                </h3>
                <p className="text-[10px] text-zinc-400">Authenticate service records submitted by drivers before sending to Owner.</p>
              </div>
              <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400 px-2 py-0.5 rounded">
                {maintenanceRecords.filter(m => m.supervisorVerified === 'Pending').length} Pending
              </span>
            </div>

            <div className="space-y-4">
              {maintenanceRecords.filter(m => m.supervisorVerified === 'Pending').length > 0 ? (
                maintenanceRecords
                  .filter(m => m.supervisorVerified === 'Pending')
                  .map(m => {
                    const isMod = !!m.pendingChanges;
                    return (
                      <div key={m.id} className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded font-black text-zinc-500">TICKET: {m.id}</span>
                            <h4 className="font-bold text-xs text-zinc-800 dark:text-zinc-100 mt-1 flex items-center gap-1.5">
                              {m.serviceType}
                              {isMod ? (
                                <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-bold">Modification Requested</span>
                              ) : (
                                <span className="text-[9px] bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded font-bold">New Addition</span>
                              )}
                            </h4>
                            <p className="text-[11px] text-zinc-400 mt-0.5">Vehicle: <strong className="text-zinc-700 dark:text-zinc-200">{m.vehicleId}</strong> &bull; Submitter: <strong className="text-zinc-700 dark:text-zinc-200">{m.submittedBy || 'Driver'}</strong></p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-mono text-zinc-400 block">{m.scheduledDate}</span>
                            <span className="text-xs font-black text-zinc-800 dark:text-zinc-100">${m.cost}</span>
                          </div>
                        </div>

                        {/* Display before/after for proposed edits */}
                        {isMod && m.pendingChanges && (
                          <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg text-[11px] space-y-1.5">
                            <p className="font-bold text-amber-500 flex items-center gap-1">Proposed Modifications:</p>
                            <div className="grid grid-cols-2 gap-4 font-mono">
                              <div>
                                <span className="text-[9px] text-zinc-400 block uppercase">Current Details</span>
                                <p className="text-zinc-500">Service: {m.serviceType}</p>
                                <p className="text-zinc-500">Cost: ${m.cost}</p>
                                <p className="text-zinc-500">Notes: "{m.notes}"</p>
                              </div>
                              <div className="border-l border-zinc-200 dark:border-zinc-800 pl-4">
                                <span className="text-[9px] text-zinc-400 block uppercase">Proposed Details</span>
                                <p className="text-zinc-800 dark:text-zinc-100 font-bold">Service: {m.pendingChanges.serviceType || m.serviceType}</p>
                                <p className="text-zinc-800 dark:text-zinc-100 font-bold">Cost: ${m.pendingChanges.cost !== undefined ? m.pendingChanges.cost : m.cost}</p>
                                <p className="text-zinc-800 dark:text-zinc-100 font-bold">Notes: "{m.pendingChanges.notes || m.notes}"</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {!isMod && (
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 italic">"Notes: {m.notes}"</p>
                        )}

                        <div className="flex gap-2 justify-end pt-2 border-t border-zinc-100 dark:border-zinc-800/40">
                          <button
                            onClick={() => handleSupervisorVerify(m.id, false)}
                            className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded text-xs font-bold transition cursor-pointer"
                          >
                            Reject Request
                          </button>
                          <button
                            onClick={() => handleSupervisorVerify(m.id, true)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition cursor-pointer"
                          >
                            Verify & Forward to Owner
                          </button>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="py-6 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                  No service records are currently pending verification. All driver logs are verified!
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: VEHICLES / ASSETS */}
          <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-2 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-500" /> Pending Asset & Vehicle Verifications
                </h3>
                <p className="text-[10px] text-zinc-400">Verify newly proposed or modified vehicle details before owner registration.</p>
              </div>
              <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400 px-2 py-0.5 rounded">
                {vehicles.filter(v => !v.isApproved && !v.supervisorVerified).length} Pending
              </span>
            </div>

            <div className="space-y-4">
              {vehicles.filter(v => !v.isApproved && !v.supervisorVerified).length > 0 ? (
                vehicles
                  .filter(v => !v.isApproved && !v.supervisorVerified)
                  .map(v => (
                    <div key={v.id} className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <span className="text-[9px] font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded font-black text-zinc-500">ID: {v.id}</span>
                        <h4 className="font-bold text-xs text-zinc-800 dark:text-zinc-100 mt-1">{v.make} {v.model} ({v.year})</h4>
                        <p className="text-[10px] text-zinc-400">Plate: {v.plate} &bull; Type: {v.type} &bull; Status: {v.status}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSupervisorVerifyVehicle(v.id, false)}
                          className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded text-xs font-bold transition cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleSupervisorVerifyVehicle(v.id, true)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition cursor-pointer"
                        >
                          Verify & Send to Owner
                        </button>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="py-6 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                  No vehicle additions are pending supervisor verification.
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: INSURANCE POLICIES */}
          <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-2 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-purple-500" /> Pending Commercial Insurance Verifications
                </h3>
                <p className="text-[10px] text-zinc-400">Verify policy entries before they are committed to the secure raw database layer by the Owner.</p>
              </div>
              <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400 px-2 py-0.5 rounded">
                {insurancePolicies.filter(p => !p.supervisorVerified).length} Pending
              </span>
            </div>

            <div className="space-y-4">
              {insurancePolicies.filter(p => !p.supervisorVerified).length > 0 ? (
                insurancePolicies
                  .filter(p => !p.supervisorVerified)
                  .map(p => (
                    <div key={p.id} className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded font-black text-zinc-500">POLICY: {p.id}</span>
                          <h4 className="font-bold text-xs text-zinc-800 dark:text-zinc-100 mt-1">Provider: {p.provider}</h4>
                          <p className="text-[10px] text-zinc-400">Policy Number: {p.policyNumber} &bull; Vehicle: {p.vehicleId} &bull; Expiry: {p.expiryDate}</p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2 italic">"Coverage: {p.coverageDetails}"</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-zinc-800 dark:text-zinc-100">${p.annualPremium}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end pt-2 border-t border-zinc-100 dark:border-zinc-800/40">
                        <button
                          onClick={() => handleSupervisorVerifyInsurance(p.id, false)}
                          className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded text-xs font-bold transition cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleSupervisorVerifyInsurance(p.id, true)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition cursor-pointer"
                        >
                          Verify & Forward
                        </button>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="py-6 text-center text-xs text-zinc-400 border border-dashed border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                  No insurance policy additions are pending supervisor verification.
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* SUB TAB: Manage Vehicles & Drivers */}
      {activeSubTab === 'vehicles-drivers' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in" id="vehicles-drivers-tab-container">
          
          {/* Left Column: Vehicles Add & Modify */}
          <div className="space-y-6">
            {/* Add Vehicle */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4 text-blue-500" /> Propose New Vehicle
              </h3>

              <form onSubmit={handleSupervisorAddVehicle} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-semibold mb-1">Vehicle Code (ID)*</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. VH-310"
                      value={vehicleId}
                      onChange={e => setVehicleId(e.target.value)}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-semibold mb-1">License Plate*</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 8XYZ90"
                      value={vehiclePlate}
                      onChange={e => setVehiclePlate(e.target.value)}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-semibold mb-1">Make*</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ford"
                      value={vehicleMake}
                      onChange={e => setVehicleMake(e.target.value)}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-semibold mb-1">Model*</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. F-150"
                      value={vehicleModel}
                      onChange={e => setVehicleModel(e.target.value)}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-semibold mb-1">Year</label>
                    <input
                      type="number"
                      value={vehicleYear}
                      onChange={e => setVehicleYear(e.target.value)}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-semibold mb-1">Classification Type</label>
                    <select
                      value={vehicleType}
                      onChange={e => setVehicleType(e.target.value)}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                    >
                      <option value="Light Duty Truck">Light Duty Truck</option>
                      <option value="Heavy Duty Semi">Heavy Duty Semi</option>
                      <option value="Electric Delivery Van">Electric Delivery Van</option>
                      <option value="Flatbed Trailer">Flatbed Trailer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-semibold mb-1">Initial Status</label>
                    <select
                      value={vehicleStatus}
                      onChange={e => setVehicleStatus(e.target.value as any)}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                    >
                      <option value="Active">Active</option>
                      <option value="In Service">In Service</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg cursor-pointer transition shadow shadow-blue-950/20"
                >
                  Propose New Vehicle Addition
                </button>
              </form>

              {vehicleSuccessMsg && (
                <p className="text-xs text-blue-600 dark:text-blue-400 text-center font-bold">{vehicleSuccessMsg}</p>
              )}
            </div>

            {/* Modify Vehicle */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-amber-500" /> Propose Vehicle Modifications
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] text-zinc-400 font-semibold mb-1">Select Target Vehicle to Modify</label>
                  <select
                    onChange={e => handleSelectModVehicle(e.target.value)}
                    value={modVehicleId}
                    className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                  >
                    <option value="">-- Choose Active Vehicle --</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.id} - {v.make} {v.model} ({v.plate})</option>
                    ))}
                  </select>
                </div>

                {modVehicleId && (
                  <form onSubmit={handleSupervisorModifyVehicle} className="space-y-3 pt-2 animate-fade-in">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-zinc-400 font-semibold mb-1">License Plate</label>
                        <input
                          type="text"
                          required
                          value={modVehiclePlate}
                          onChange={e => setModVehiclePlate(e.target.value)}
                          className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400 font-semibold mb-1">Vehicle Classification Type</label>
                        <input
                          type="text"
                          required
                          value={modVehicleType}
                          onChange={e => setModVehicleType(e.target.value)}
                          className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] text-zinc-400 font-semibold mb-1">Make</label>
                        <input
                          type="text"
                          required
                          value={modVehicleMake}
                          onChange={e => setModVehicleMake(e.target.value)}
                          className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400 font-semibold mb-1">Model</label>
                        <input
                          type="text"
                          required
                          value={modVehicleModel}
                          onChange={e => setModVehicleModel(e.target.value)}
                          className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400 font-semibold mb-1">Year</label>
                        <input
                          type="number"
                          required
                          value={modVehicleYear}
                          onChange={e => setModVehicleYear(e.target.value)}
                          className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-400 font-semibold mb-1">Operational Status</label>
                      <select
                        value={modVehicleStatus}
                        onChange={e => setModVehicleStatus(e.target.value as any)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                      >
                        <option value="Active">Active</option>
                        <option value="In Service">In Service</option>
                        <option value="On Trip">On Trip</option>
                        <option value="Decommissioned">Decommissioned</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded-lg cursor-pointer transition shadow"
                    >
                      Propose Modification Updates
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Drivers Add & Assign */}
          <div className="space-y-6">
            {/* Add Driver */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-500" /> Propose New Driver Account
              </h3>

              <form onSubmit={handleSupervisorAddDriver} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] text-zinc-400 font-semibold mb-1">Driver Full Name*</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={driverName}
                    onChange={e => setDriverName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-semibold mb-1">Email Address*</label>
                    <input
                      type="email"
                      required
                      placeholder="john@fleetcore.com"
                      value={driverEmail}
                      onChange={e => setDriverEmail(e.target.value)}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-semibold mb-1">Phone Number*</label>
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 019-2831"
                      value={driverPhone}
                      onChange={e => setDriverPhone(e.target.value)}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 font-semibold mb-1">CDL / Commercial License Number*</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CA-CDL-99882"
                    value={driverLicense}
                    onChange={e => setDriverLicense(e.target.value)}
                    className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-semibold mb-1">Full Address</label>
                    <input
                      type="text"
                      placeholder="e.g. 123 Main St, Delhi"
                      value={driverAddress}
                      onChange={e => setDriverAddress(e.target.value)}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-semibold mb-1">Assigned Supervisor</label>
                    <select
                      value={driverSupervisorId}
                      onChange={e => setDriverSupervisorId(e.target.value)}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                    >
                      <option value="">-- No Supervisor --</option>
                      {supervisors.filter(s => s.isApproved).map(sup => (
                        <option key={sup.id} value={sup.id}>{sup.name} ({sup.id})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-semibold mb-1">PAN Card Number</label>
                    <input
                      type="text"
                      placeholder="e.g. ABCDE1234F"
                      value={driverPan}
                      onChange={e => setDriverPan(e.target.value)}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-semibold mb-1">Aadhar Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 1234-5678-9012"
                      value={driverAadhar}
                      onChange={e => setDriverAadhar(e.target.value)}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-semibold mb-1">Bank details (IFSC, A/C)</label>
                    <input
                      type="text"
                      placeholder="HDFC, A/C: 50100..."
                      value={driverBankDetails}
                      onChange={e => setDriverBankDetails(e.target.value)}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg cursor-pointer transition shadow shadow-emerald-950/20"
                >
                  Propose Driver Registration
                </button>
              </form>

              {driverSuccessMsg && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 text-center font-bold">{driverSuccessMsg}</p>
              )}
            </div>

            {/* Assign Driver to Vehicle */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Link2 className="w-4 h-4 text-purple-500" /> Propose Driver Assignment
              </h3>

              <form onSubmit={handleSupervisorAssignDriver} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-semibold mb-1">Select Vehicle</label>
                    <select
                      value={assignVehicleId}
                      onChange={e => setAssignVehicleId(e.target.value)}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                    >
                      <option value="">-- Choose Vehicle --</option>
                      {vehicles.map(v => (
                        <option key={v.id} value={v.id}>{v.id} ({v.plate})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-semibold mb-1">Select Driver</label>
                    <select
                      value={assignDriverId}
                      onChange={e => setAssignDriverId(e.target.value)}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                    >
                      <option value="">-- Choose Driver --</option>
                      {drivers.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded-lg cursor-pointer transition shadow"
                >
                  Propose Driver Assignment
                </button>
              </form>

              {assignSuccessMsg && (
                <p className="text-xs text-purple-600 dark:text-purple-400 text-center font-bold">{assignSuccessMsg}</p>
              )}
            </div>
          </div>

        </div>
      )}

      {/* SUB TAB: Commercial Insurance Workspace */}
      {activeSubTab === 'insurance' && (
        <div className="space-y-6 animate-fade-in" id="supervisor-insurance-workspace">
          
          {insSuccessMsg && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-semibold text-center">
              {insSuccessMsg}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Propose New Policy */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4 text-emerald-500" /> Propose New Policy
              </h3>
              
              <form onSubmit={handleSupervisorAddInsurance} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[10px] text-zinc-400 font-semibold mb-1">Associated Vehicle ID*</label>
                  <select
                    required
                    value={insVehicleId}
                    onChange={e => setInsVehicleId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none text-xs"
                  >
                    <option value="">-- Select Asset --</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.id} ({v.plate})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 font-semibold mb-1">Provider Name*</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Geico Fleet, Liberty Mutual"
                    value={insProvider}
                    onChange={e => setInsProvider(e.target.value)}
                    className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-semibold mb-1">Policy Number*</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. POL-88992"
                      value={insPolicyNumber}
                      onChange={e => setInsPolicyNumber(e.target.value)}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-semibold mb-1">Expiry Date*</label>
                    <input
                      type="date"
                      required
                      value={insExpiryDate}
                      onChange={e => setInsExpiryDate(e.target.value)}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 font-semibold mb-1">Annual Premium ($)*</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 4500"
                    value={insPremium}
                    onChange={e => setInsPremium(e.target.value)}
                    className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 font-semibold mb-1">Coverage / Liability Clauses</label>
                  <textarea
                    rows={3}
                    placeholder="Describe liability boundaries, incident coverage limits, deductibles..."
                    value={insCoverage}
                    onChange={e => setInsCoverage(e.target.value)}
                    className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg cursor-pointer transition shadow"
                >
                  Propose Policy Addition
                </button>
              </form>
            </div>

            {/* Middle Column: Propose Modifications */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-amber-500" /> Propose Modifications
              </h3>
              
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] text-zinc-400 font-semibold mb-1">Select Policy to Modify</label>
                  <select
                    value={modInsId}
                    onChange={e => handleSelectModInsurance(e.target.value)}
                    className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none text-xs"
                  >
                    <option value="">-- Choose Existing Policy --</option>
                    {insurancePolicies.map(p => (
                      <option key={p.id} value={p.id}>{p.id} - {p.provider} ({p.policyNumber})</option>
                    ))}
                  </select>
                </div>

                {modInsId && (
                  <form onSubmit={handleSupervisorModifyInsurance} className="space-y-3.5 animate-fade-in">
                    <div>
                      <label className="block text-[10px] text-zinc-400 font-semibold mb-1">Provider Name</label>
                      <input
                        type="text"
                        value={modInsProvider}
                        onChange={e => setModInsProvider(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-zinc-400 font-semibold mb-1">Policy Number</label>
                        <input
                          type="text"
                          value={modInsPolicyNumber}
                          onChange={e => setModInsPolicyNumber(e.target.value)}
                          className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400 font-semibold mb-1">Expiry Date</label>
                        <input
                          type="date"
                          value={modInsExpiryDate}
                          onChange={e => setModInsExpiryDate(e.target.value)}
                          className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-400 font-semibold mb-1">Annual Premium ($)</label>
                      <input
                        type="number"
                        value={modInsPremium}
                        onChange={e => setModInsPremium(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-400 font-semibold mb-1">Coverage Details</label>
                      <textarea
                        rows={3}
                        value={modInsCoverage}
                        onChange={e => setModInsCoverage(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded-lg cursor-pointer transition shadow"
                    >
                      Propose Policy Modification
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Right Column: Existing Commercial Policies */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-500" /> Existing Policies ({insurancePolicies.length})
              </h3>

              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {insurancePolicies.map(policy => {
                  const isExpiring = new Date(policy.expiryDate) < new Date(Date.now() + 30 * 24 * 3600 * 1000);
                  return (
                    <div key={policy.id} className="p-3 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800/80 rounded-lg space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-mono font-black text-blue-600 dark:text-blue-400">ID: {policy.id}</span>
                          <h4 className="font-bold text-zinc-800 dark:text-zinc-100 mt-0.5">{policy.provider}</h4>
                        </div>
                        {isExpiring ? (
                          <span className="bg-red-100 text-red-800 text-[9px] font-bold px-1.5 py-0.5 rounded animate-pulse">EXPIRING SOON</span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded">ACTIVE</span>
                        )}
                      </div>

                      <div className="text-[11px] space-y-1 text-zinc-500 dark:text-zinc-400 font-mono">
                        <p className="flex justify-between"><span>Policy Number:</span> <span className="font-bold text-zinc-800 dark:text-zinc-200">{policy.policyNumber}</span></p>
                        <p className="flex justify-between"><span>Vehicle Code:</span> <span className="font-bold text-blue-600">{policy.vehicleId}</span></p>
                        <p className="flex justify-between"><span>Expiry Date:</span> <span>{policy.expiryDate}</span></p>
                        <p className="flex justify-between"><span>Annual Premium:</span> <span className="font-bold">${policy.annualPremium}</span></p>
                        <p className="flex justify-between"><span>Verification:</span> 
                          <span className={`font-bold ${policy.ownerApproved === 'Approved' ? 'text-emerald-600' : 'text-amber-500'}`}>
                            {policy.supervisorVerified ? 'Verified' : 'Pending Verification'} &bull; {policy.ownerApproved}
                          </span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
