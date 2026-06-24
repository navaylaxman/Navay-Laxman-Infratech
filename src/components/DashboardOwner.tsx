import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  Users, Key, Shield, RefreshCw, Database, Terminal, FileText, CheckCircle, 
  AlertTriangle, Play, HelpCircle, HardDrive, ShieldCheck, Cpu, Trash2, Edit, Plus, UserCheck, Truck, Wrench
} from 'lucide-react';
import { Vehicle, Driver, Supervisor, Vendor, MaintenanceRecord, InsurancePolicy, AuditLog, FuelLog } from '../types';
import { exportToCSV, printReport } from '../utils/export';

interface DashboardOwnerProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  supervisors: Supervisor[];
  vendors: Vendor[];
  maintenanceRecords: MaintenanceRecord[];
  insurancePolicies: InsurancePolicy[];
  auditLogs: AuditLog[];
  fuelLogs: FuelLog[];
  maintenanceCosts: number;
  onRefresh: () => void;
  username: string;
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

export const DashboardOwner: React.FC<DashboardOwnerProps> = ({
  vehicles,
  drivers,
  supervisors,
  vendors,
  maintenanceRecords,
  insurancePolicies,
  auditLogs,
  fuelLogs,
  maintenanceCosts,
  onRefresh,
  username
}) => {
  // Owner Approval Feedback State
  const [approvalFeedback, setApprovalFeedback] = useState('');

  // Active Admin Tab State
  const [activeAdminTab, setActiveAdminTab] = useState<'drivers' | 'supervisors' | 'vehicles' | 'vendors' | 'maintenance' | 'insurance'>('drivers');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adminFeedback, setAdminFeedback] = useState('');

  // Form Field States
  // Drivers
  const [fDriverName, setFDriverName] = useState('');
  const [fDriverEmail, setFDriverEmail] = useState('');
  const [fDriverPhone, setFDriverPhone] = useState('');
  const [fDriverLicense, setFDriverLicense] = useState('');
  const [fDriverStatus, setFDriverStatus] = useState<'Active' | 'Off Duty' | 'On Trip' | 'Suspended'>('Off Duty');
  const [fDriverAddress, setFDriverAddress] = useState('');
  const [fDriverPan, setFDriverPan] = useState('');
  const [fDriverAadhar, setFDriverAadhar] = useState('');
  const [fDriverBankDetails, setFDriverBankDetails] = useState('');
  const [fDriverSupervisorId, setFDriverSupervisorId] = useState('');

  // Supervisors
  const [fSuperName, setFSuperName] = useState('');
  const [fSuperEmail, setFSuperEmail] = useState('');
  const [fSuperPhone, setFSuperPhone] = useState('');
  const [fSuperStatus, setFSuperStatus] = useState<'Active' | 'Inactive'>('Active');
  const [fSuperAddress, setFSuperAddress] = useState('');
  const [fSuperPan, setFSuperPan] = useState('');
  const [fSuperAadhar, setFSuperAadhar] = useState('');
  const [fSuperBankDetails, setFSuperBankDetails] = useState('');

  // Vehicles
  const [fVehPlate, setFVehPlate] = useState('');
  const [fVehMake, setFVehMake] = useState('');
  const [fVehModel, setFVehModel] = useState('');
  const [fVehYear, setFVehYear] = useState('2024');
  const [fVehType, setFVehType] = useState('Light Duty Truck');
  const [fVehStatus, setFVehStatus] = useState<'Active' | 'In Service' | 'On Trip' | 'Decommissioned'>('Active');

  // Vendors
  const [fVenName, setFVenName] = useState('');
  const [fVenContact, setFVenContact] = useState('');
  const [fVenPhone, setFVenPhone] = useState('');
  const [fVenEmail, setFVenEmail] = useState('');
  const [fVenServices, setFVenServices] = useState('Oil Change, Brakes');
  const [fVenAddress, setFVenAddress] = useState('');

  // Maintenance
  const [fMaintVehId, setFMaintVehId] = useState('');
  const [fMaintVenId, setFMaintVenId] = useState('');
  const [fMaintType, setFMaintType] = useState('Oil Change');
  const [fMaintCost, setFMaintCost] = useState('');
  const [fMaintDate, setFMaintDate] = useState('');
  const [fMaintNotes, setFMaintNotes] = useState('');
  const [fMaintStatus, setFMaintStatus] = useState<'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled'>('Scheduled');

  // Insurance
  const [fInsVehId, setFInsVehId] = useState('');
  const [fInsProvider, setFInsProvider] = useState('');
  const [fInsPolNum, setFInsPolNum] = useState('');
  const [fInsExpiry, setFInsExpiry] = useState('');
  const [fInsPremium, setFInsPremium] = useState('');
  const [fInsDetails, setFInsDetails] = useState('');

  // SQL Console States
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM vehicles;');
  const [sqlResult, setSqlResult] = useState<{ columns: string[]; rows: any[]; error?: string } | null>(null);

  // Owner approval action handlers
  const handleOwnerApproveService = async (id: string, approved: boolean) => {
    try {
      const res = await fetch('/api/maintenance/owner-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approved })
      });
      if (res.ok) {
        setApprovalFeedback(`Service Record ${id} was successfully ${approved ? 'Approved' : 'Rejected'}!`);
        onRefresh();
        setTimeout(() => setApprovalFeedback(''), 4000);
      } else {
        setApprovalFeedback('Failed to update service record approval.');
      }
    } catch (err) {
      setApprovalFeedback('Error processing service record approval.');
    }
  };

  const handleOwnerApproveVehicle = async (id: string, approved: boolean) => {
    try {
      const res = await fetch('/api/vehicle/owner-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approved })
      });
      if (res.ok) {
        setApprovalFeedback(`Vehicle ${id} has been ${approved ? 'Approved and Registered' : 'Rejected'}!`);
        onRefresh();
        setTimeout(() => setApprovalFeedback(''), 4000);
      } else {
        setApprovalFeedback('Failed to process vehicle approval.');
      }
    } catch (err) {
      setApprovalFeedback('Error processing vehicle approval.');
    }
  };

  const handleOwnerApproveDriver = async (id: string, approved: boolean) => {
    try {
      const res = await fetch('/api/driver/owner-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approved })
      });
      if (res.ok) {
        setApprovalFeedback(`Driver ${id} account has been ${approved ? 'Approved and Activated' : 'Rejected'}!`);
        onRefresh();
        setTimeout(() => setApprovalFeedback(''), 4000);
      } else {
        setApprovalFeedback('Failed to process driver approval.');
      }
    } catch (err) {
      setApprovalFeedback('Error processing driver approval.');
    }
  };

  // Owner Approval Tabs state
  const [activeApprovalTab, setActiveApprovalTab] = useState<'services' | 'vehicles' | 'drivers' | 'insurance' | 'supervisors'>('services');

  // Filtered lists for Owner Approvals
  const pendingServices = maintenanceRecords.filter(m => m.supervisorVerified === 'Verified' && m.ownerApproved === 'Pending');
  const pendingVehicles = vehicles.filter(v => v.isApproved === false);
  const pendingDrivers = drivers.filter(d => d.isApproved === false);
  const pendingInsurance = insurancePolicies.filter(p => p.supervisorVerified && p.ownerApproved === 'Pending');
  const pendingSupervisors = supervisors.filter(s => s.isApproved === false);

  // Administrative Workspace States
  const [adminTab, setAdminTab] = useState<'drivers' | 'supervisors' | 'assets' | 'maintenance' | 'insurance'>('drivers');
  const [adminMessage, setAdminMessage] = useState('');

  // 1. Admin Driver States
  const [drvId, setDrvId] = useState('');
  const [drvName, setDrvName] = useState('');
  const [drvEmail, setDrvEmail] = useState('');
  const [drvPhone, setDrvPhone] = useState('');
  const [drvLicense, setDrvLicense] = useState('');
  const [drvStatus, setDrvStatus] = useState('Active');

  // 2. Admin Supervisor States
  const [supId, setSupId] = useState('');
  const [supName, setSupName] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supStatus, setSupStatus] = useState('Active');

  // 3. Admin Asset/Vehicle States
  const [vehId, setVehId] = useState('');
  const [vehPlate, setVehPlate] = useState('');
  const [vehMake, setVehMake] = useState('');
  const [vehModel, setVehModel] = useState('');
  const [vehYear, setVehYear] = useState('2024');
  const [vehType, setVehType] = useState('Light Duty Truck');
  const [vehStatus, setVehStatus] = useState('Active');

  // 4. Admin Maintenance States
  const [maintId, setMaintId] = useState('');
  const [maintVehId, setMaintVehId] = useState('');
  const [maintVendorId, setMaintVendorId] = useState('');
  const [maintServiceType, setMaintServiceType] = useState('Oil Change');
  const [maintCost, setMaintCost] = useState('');
  const [maintDate, setMaintDate] = useState('');
  const [maintNotes, setMaintNotes] = useState('');

  // 5. Admin Insurance States
  const [insurId, setInsurId] = useState('');
  const [insurVehId, setInsurVehId] = useState('');
  const [insurProvider, setInsurProvider] = useState('');
  const [insurPolicyNum, setInsurPolicyNum] = useState('');
  const [insurExpiry, setInsurExpiry] = useState('');
  const [insurPremium, setInsurPremium] = useState('');
  const [insurCoverage, setInsurCoverage] = useState('');

  // --- Owner Approval API Calls for Supervisors & Insurance ---
  const handleOwnerApproveInsurance = async (id: string, approved: boolean) => {
    try {
      const res = await fetch('/api/owner/insurance/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approved })
      });
      if (res.ok) {
        setApprovalFeedback(`Insurance Policy ${id} has been ${approved ? 'Approved' : 'Rejected'}!`);
        onRefresh();
        setTimeout(() => setApprovalFeedback(''), 4000);
      } else {
        setApprovalFeedback('Failed to process insurance approval.');
      }
    } catch (err) {
      setApprovalFeedback('Error processing insurance approval.');
    }
  };

  const handleOwnerApproveSupervisor = async (id: string, approved: boolean) => {
    try {
      const res = await fetch('/api/owner/supervisor/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approved })
      });
      if (res.ok) {
        setApprovalFeedback(`Supervisor ${id} has been ${approved ? 'Approved' : 'Rejected'}!`);
        onRefresh();
        setTimeout(() => setApprovalFeedback(''), 4000);
      } else {
        setApprovalFeedback('Failed to process supervisor approval.');
      }
    } catch (err) {
      setApprovalFeedback('Error processing supervisor approval.');
    }
  };

  // --- CRUD API Calls: DRIVERS ---
  const handleAdminAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drvName || !drvEmail || !drvLicense) {
      setAdminMessage('Driver Name, Email, and License are required.');
      return;
    }
    try {
      const res = await fetch('/api/owner/driver/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: drvName, email: drvEmail, phone: drvPhone, license: drvLicense, status: drvStatus })
      });
      if (res.ok) {
        setAdminMessage(`Successfully added Driver ${drvName}!`);
        setDrvName(''); setDrvEmail(''); setDrvPhone(''); setDrvLicense('');
        onRefresh();
        setTimeout(() => setAdminMessage(''), 4000);
      } else {
        setAdminMessage('Failed to add driver.');
      }
    } catch (err) {
      setAdminMessage('Error calling server.');
    }
  };

  const handleAdminModifyDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drvId) {
      setAdminMessage('Select a driver first.');
      return;
    }
    try {
      const res = await fetch('/api/owner/driver/modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: drvId,
          updates: { name: drvName, email: drvEmail, phone: drvPhone, licenseNumber: drvLicense, status: drvStatus }
        })
      });
      if (res.ok) {
        setAdminMessage(`Successfully modified Driver ${drvId}!`);
        setDrvId(''); setDrvName(''); setDrvEmail(''); setDrvPhone(''); setDrvLicense('');
        onRefresh();
        setTimeout(() => setAdminMessage(''), 4000);
      } else {
        setAdminMessage('Failed to modify driver.');
      }
    } catch (err) {
      setAdminMessage('Error calling server.');
    }
  };

  const handleAdminDeleteDriver = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete Driver ${id}?`)) return;
    try {
      const res = await fetch('/api/owner/driver/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setAdminMessage(`Driver ${id} deleted successfully.`);
        onRefresh();
        setTimeout(() => setAdminMessage(''), 4000);
      } else {
        setAdminMessage('Failed to delete driver.');
      }
    } catch (err) {
      setAdminMessage('Error calling server.');
    }
  };

  const handleSelectDriverForEdit = (id: string) => {
    const d = drivers.find(item => item.id === id);
    if (d) {
      setDrvId(d.id);
      setDrvName(d.name);
      setDrvEmail(d.email);
      setDrvPhone(d.phone || '');
      setDrvLicense(d.licenseNumber || '');
      setDrvStatus(d.status || 'Active');
    }
  };

  // --- CRUD API Calls: SUPERVISORS ---
  const handleAdminAddSupervisor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName || !supEmail) {
      setAdminMessage('Supervisor Name and Email are required.');
      return;
    }
    try {
      const res = await fetch('/api/owner/supervisor/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: supName, email: supEmail, phone: supPhone, status: supStatus })
      });
      if (res.ok) {
        setAdminMessage(`Successfully added Supervisor ${supName}!`);
        setSupName(''); setSupEmail(''); setSupPhone('');
        onRefresh();
        setTimeout(() => setAdminMessage(''), 4000);
      } else {
        setAdminMessage('Failed to add supervisor.');
      }
    } catch (err) {
      setAdminMessage('Error calling server.');
    }
  };

  const handleAdminModifySupervisor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supId) {
      setAdminMessage('Select a supervisor first.');
      return;
    }
    try {
      const res = await fetch('/api/owner/supervisor/modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: supId,
          updates: { name: supName, email: supEmail, phone: supPhone, status: supStatus }
        })
      });
      if (res.ok) {
        setAdminMessage(`Successfully modified Supervisor ${supId}!`);
        setSupId(''); setSupName(''); setSupEmail(''); setSupPhone('');
        onRefresh();
        setTimeout(() => setAdminMessage(''), 4000);
      } else {
        setAdminMessage('Failed to modify supervisor.');
      }
    } catch (err) {
      setAdminMessage('Error calling server.');
    }
  };

  const handleAdminDeleteSupervisor = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete Supervisor ${id}?`)) return;
    try {
      const res = await fetch('/api/owner/supervisor/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setAdminMessage(`Supervisor ${id} deleted successfully.`);
        onRefresh();
        setTimeout(() => setAdminMessage(''), 4000);
      } else {
        setAdminMessage('Failed to delete supervisor.');
      }
    } catch (err) {
      setAdminMessage('Error calling server.');
    }
  };

  const handleSelectSupervisorForEdit = (id: string) => {
    const s = supervisors.find(item => item.id === id);
    if (s) {
      setSupId(s.id);
      setSupName(s.name);
      setSupEmail(s.email);
      setSupPhone(s.phone || '');
      setSupStatus(s.status || 'Active');
    }
  };

  // --- CRUD API Calls: VEHICLES / ASSETS ---
  const handleAdminAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehPlate || !vehMake || !vehModel) {
      setAdminMessage('Plate, Make, and Model are required.');
      return;
    }
    try {
      const res = await fetch('/api/owner/vehicle/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plate: vehPlate, make: vehMake, model: vehModel, year: Number(vehYear), type: vehType, status: vehStatus })
      });
      if (res.ok) {
        setAdminMessage(`Successfully registered Asset ${vehPlate}!`);
        setVehPlate(''); setVehMake(''); setVehModel('');
        onRefresh();
        setTimeout(() => setAdminMessage(''), 4000);
      } else {
        setAdminMessage('Failed to add vehicle.');
      }
    } catch (err) {
      setAdminMessage('Error calling server.');
    }
  };

  const handleAdminModifyVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehId) {
      setAdminMessage('Select an asset first.');
      return;
    }
    try {
      const res = await fetch('/api/owner/vehicle/modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: vehId,
          updates: { plate: vehPlate, make: vehMake, model: vehModel, year: Number(vehYear), type: vehType, status: vehStatus }
        })
      });
      if (res.ok) {
        setAdminMessage(`Successfully updated Vehicle ${vehId}!`);
        setVehId(''); setVehPlate(''); setVehMake(''); setVehModel('');
        onRefresh();
        setTimeout(() => setAdminMessage(''), 4000);
      } else {
        setAdminMessage('Failed to modify vehicle.');
      }
    } catch (err) {
      setAdminMessage('Error calling server.');
    }
  };

  const handleAdminDeleteVehicle = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete Asset ${id}?`)) return;
    try {
      const res = await fetch('/api/owner/vehicle/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setAdminMessage(`Asset ${id} deleted successfully.`);
        onRefresh();
        setTimeout(() => setAdminMessage(''), 4000);
      } else {
        setAdminMessage('Failed to delete vehicle.');
      }
    } catch (err) {
      setAdminMessage('Error calling server.');
    }
  };

  const handleSelectVehicleForEdit = (id: string) => {
    const v = vehicles.find(item => item.id === id);
    if (v) {
      setVehId(v.id);
      setVehPlate(v.plate);
      setVehMake(v.make);
      setVehModel(v.model);
      setVehYear(String(v.year));
      setVehType(v.type);
      setVehStatus(v.status);
    }
  };

  // --- CRUD API Calls: MAINTENANCE / SERVICES ---
  const handleAdminAddMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintVehId || !maintVendorId || !maintServiceType || !maintDate) {
      setAdminMessage('Vehicle, Vendor, Service, and Date are required.');
      return;
    }
    try {
      const res = await fetch('/api/owner/maintenance/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: maintVehId,
          vendorId: maintVendorId,
          serviceType: maintServiceType,
          cost: Number(maintCost || 0),
          scheduledDate: maintDate,
          notes: maintNotes
        })
      });
      if (res.ok) {
        setAdminMessage('Successfully logged new Maintenance record.');
        setMaintCost(''); setMaintNotes(''); setMaintDate('');
        onRefresh();
        setTimeout(() => setAdminMessage(''), 4000);
      } else {
        setAdminMessage('Failed to add maintenance record.');
      }
    } catch (err) {
      setAdminMessage('Error calling server.');
    }
  };

  const handleAdminModifyMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintId) {
      setAdminMessage('Select a record first.');
      return;
    }
    try {
      const res = await fetch('/api/owner/maintenance/modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: maintId,
          updates: {
            vehicleId: maintVehId,
            vendorId: maintVendorId,
            serviceType: maintServiceType,
            cost: Number(maintCost || 0),
            scheduledDate: maintDate,
            notes: maintNotes
          }
        })
      });
      if (res.ok) {
        setAdminMessage(`Successfully modified Maintenance ${maintId}!`);
        setMaintId(''); setMaintCost(''); setMaintNotes(''); setMaintDate('');
        onRefresh();
        setTimeout(() => setAdminMessage(''), 4000);
      } else {
        setAdminMessage('Failed to modify maintenance.');
      }
    } catch (err) {
      setAdminMessage('Error calling server.');
    }
  };

  const handleAdminDeleteMaintenance = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete Maintenance Record ${id}?`)) return;
    try {
      const res = await fetch('/api/owner/maintenance/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setAdminMessage(`Maintenance ${id} deleted successfully.`);
        onRefresh();
        setTimeout(() => setAdminMessage(''), 4000);
      } else {
        setAdminMessage('Failed to delete maintenance.');
      }
    } catch (err) {
      setAdminMessage('Error calling server.');
    }
  };

  const handleSelectMaintenanceForEdit = (id: string) => {
    const m = maintenanceRecords.find(item => item.id === id);
    if (m) {
      setMaintId(m.id);
      setMaintVehId(m.vehicleId);
      setMaintVendorId(m.vendorId);
      setMaintServiceType(m.serviceType);
      setMaintCost(String(m.cost));
      setMaintDate(m.scheduledDate);
      setMaintNotes(m.notes);
    }
  };

  // --- CRUD API Calls: INSURANCE ---
  const handleAdminAddInsurance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!insurVehId || !insurProvider || !insurPolicyNum || !insurExpiry) {
      setAdminMessage('Vehicle, Provider, Policy#, and Expiry are required.');
      return;
    }
    try {
      const res = await fetch('/api/owner/insurance/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: insurVehId,
          provider: insurProvider,
          policyNumber: insurPolicyNum,
          expiryDate: insurExpiry,
          annualPremium: Number(insurPremium || 0),
          coverageDetails: insurCoverage
        })
      });
      if (res.ok) {
        setAdminMessage('Successfully issued new Fleet Insurance policy!');
        setInsurVehId(''); setInsurProvider(''); setInsurPolicyNum(''); setInsurExpiry(''); setInsurPremium(''); setInsurCoverage('');
        onRefresh();
        setTimeout(() => setAdminMessage(''), 4000);
      } else {
        setAdminMessage('Failed to add insurance.');
      }
    } catch (err) {
      setAdminMessage('Error calling server.');
    }
  };

  const handleAdminModifyInsurance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!insurId) {
      setAdminMessage('Select a policy first.');
      return;
    }
    try {
      const res = await fetch('/api/owner/insurance/modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: insurId,
          updates: {
            vehicleId: insurVehId,
            provider: insurProvider,
            policyNumber: insurPolicyNum,
            expiryDate: insurExpiry,
            annualPremium: Number(insurPremium || 0),
            coverageDetails: insurCoverage
          }
        })
      });
      if (res.ok) {
        setAdminMessage(`Successfully modified Policy ${insurId}!`);
        setInsurId(''); setInsurProvider(''); setInsurPolicyNum(''); setInsurExpiry(''); setInsurPremium(''); setInsurCoverage('');
        onRefresh();
        setTimeout(() => setAdminMessage(''), 4000);
      } else {
        setAdminMessage('Failed to modify policy.');
      }
    } catch (err) {
      setAdminMessage('Error calling server.');
    }
  };

  const handleAdminDeleteInsurance = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete Insurance Policy ${id}?`)) return;
    try {
      const res = await fetch('/api/owner/insurance/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setAdminMessage(`Policy ${id} deleted successfully.`);
        onRefresh();
        setTimeout(() => setAdminMessage(''), 4000);
      } else {
        setAdminMessage('Failed to delete policy.');
      }
    } catch (err) {
      setAdminMessage('Error calling server.');
    }
  };

  const handleSelectInsuranceForEdit = (id: string) => {
    const p = insurancePolicies.find(item => item.id === id);
    if (p) {
      setInsurId(p.id);
      setInsurVehId(p.vehicleId);
      setInsurProvider(p.provider);
      setInsurPolicyNum(p.policyNumber);
      setInsurExpiry(p.expiryDate);
      setInsurPremium(String(p.annualPremium));
      setInsurCoverage(p.coverageDetails);
    }
  };

  // Backup States
  const [backups, setBackups] = useState<any[]>([]);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupMessage, setBackupMessage] = useState('');

  // Fetch backups and run initial SQL
  useEffect(() => {
    fetchBackups();
    executeSqlConsole('SELECT * FROM vehicles;');
  }, []);

  const fetchBackups = async () => {
    try {
      const res = await fetch('/api/backups');
      const data = await res.json();
      setBackups(data);
    } catch (e) {
      console.error(e);
    }
  };

  // --- COMPREHENSIVE CRUDS FOR OWNER ---

  // 1. Drivers CRUD
  const handleSubmitDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let res;
      if (editingId) {
        res = await fetch('/api/owner/driver/modify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            updates: {
              name: fDriverName,
              email: fDriverEmail,
              phone: fDriverPhone,
              licenseNumber: fDriverLicense,
              status: fDriverStatus,
              address: fDriverAddress,
              pan: fDriverPan,
              aadhar: fDriverAadhar,
              bankDetails: fDriverBankDetails,
              supervisorId: fDriverSupervisorId || null
            }
          })
        });
      } else {
        res = await fetch('/api/owner/driver/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: fDriverName,
            email: fDriverEmail,
            phone: fDriverPhone,
            license: fDriverLicense,
            status: fDriverStatus,
            address: fDriverAddress,
            pan: fDriverPan,
            aadhar: fDriverAadhar,
            bankDetails: fDriverBankDetails,
            supervisorId: fDriverSupervisorId || null
          })
        });
      }
      if (res.ok) {
        setAdminFeedback(`Driver successfully ${editingId ? 'modified' : 'added'}!`);
        setEditingId(null);
        setFDriverName('');
        setFDriverEmail('');
        setFDriverPhone('');
        setFDriverLicense('');
        setFDriverAddress('');
        setFDriverPan('');
        setFDriverAadhar('');
        setFDriverBankDetails('');
        setFDriverSupervisorId('');
        onRefresh();
        setTimeout(() => setAdminFeedback(''), 4000);
      } else {
        setAdminFeedback('Error submitting driver record.');
      }
    } catch (err) {
      setAdminFeedback('Connection error.');
    }
  };

  const handleDeleteDriver = async (id: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete Driver ${id}?`)) return;
    try {
      const res = await fetch('/api/owner/driver/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setAdminFeedback(`Driver ${id} deleted successfully!`);
        onRefresh();
        setTimeout(() => setAdminFeedback(''), 4000);
      }
    } catch (e) {
      setAdminFeedback('Connection error.');
    }
  };

  const handleEditDriver = (d: Driver) => {
    setEditingId(d.id);
    setFDriverName(d.name);
    setFDriverEmail(d.email);
    setFDriverPhone(d.phone || '');
    setFDriverLicense(d.licenseNumber);
    setFDriverStatus(d.status as any);
    setFDriverAddress(d.address || '');
    setFDriverPan(d.pan || '');
    setFDriverAadhar(d.aadhar || '');
    setFDriverBankDetails(d.bankDetails || '');
    setFDriverSupervisorId(d.supervisorId || '');
  };

  // 2. Supervisors CRUD
  const handleSubmitSupervisor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let res;
      if (editingId) {
        res = await fetch('/api/owner/supervisor/modify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            updates: {
              name: fSuperName,
              email: fSuperEmail,
              phone: fSuperPhone,
              status: fSuperStatus,
              address: fSuperAddress,
              pan: fSuperPan,
              aadhar: fSuperAadhar,
              bankDetails: fSuperBankDetails
            }
          })
        });
      } else {
        res = await fetch('/api/owner/supervisor/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: fSuperName,
            email: fSuperEmail,
            phone: fSuperPhone,
            status: fSuperStatus,
            address: fSuperAddress,
            pan: fSuperPan,
            aadhar: fSuperAadhar,
            bankDetails: fSuperBankDetails
          })
        });
      }
      if (res.ok) {
        setAdminFeedback(`Supervisor successfully ${editingId ? 'modified' : 'added'}!`);
        setEditingId(null);
        setFSuperName('');
        setFSuperEmail('');
        setFSuperPhone('');
        setFSuperAddress('');
        setFSuperPan('');
        setFSuperAadhar('');
        setFSuperBankDetails('');
        onRefresh();
        setTimeout(() => setAdminFeedback(''), 4000);
      } else {
        setAdminFeedback('Error submitting supervisor.');
      }
    } catch (err) {
      setAdminFeedback('Connection error.');
    }
  };

  const handleDeleteSupervisor = async (id: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete Supervisor ${id}?`)) return;
    try {
      const res = await fetch('/api/owner/supervisor/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setAdminFeedback(`Supervisor ${id} deleted successfully!`);
        onRefresh();
        setTimeout(() => setAdminFeedback(''), 4000);
      }
    } catch (e) {
      setAdminFeedback('Connection error.');
    }
  };

  const handleVerifySupervisor = async (id: string, approved: boolean) => {
    try {
      const res = await fetch('/api/owner/supervisor/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approved })
      });
      if (res.ok) {
        setAdminFeedback(`Supervisor ${id} was successfully ${approved ? 'approved' : 'rejected'}!`);
        onRefresh();
        setTimeout(() => setAdminFeedback(''), 4000);
      }
    } catch (e) {
      setAdminFeedback('Connection error.');
    }
  };

  const handleEditSupervisor = (s: Supervisor) => {
    setEditingId(s.id);
    setFSuperName(s.name);
    setFSuperEmail(s.email);
    setFSuperPhone(s.phone || '');
    setFSuperStatus(s.status);
    setFSuperAddress(s.address || '');
    setFSuperPan(s.pan || '');
    setFSuperAadhar(s.aadhar || '');
    setFSuperBankDetails(s.bankDetails || '');
  };

  // 3. Asset (Vehicle) CRUD
  const handleSubmitVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let res;
      if (editingId) {
        res = await fetch('/api/owner/vehicle/modify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            updates: {
              plate: fVehPlate,
              make: fVehMake,
              model: fVehModel,
              year: Number(fVehYear),
              type: fVehType,
              status: fVehStatus
            }
          })
        });
      } else {
        res = await fetch('/api/owner/vehicle/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plate: fVehPlate,
            make: fVehMake,
            model: fVehModel,
            year: Number(fVehYear),
            type: fVehType,
            status: fVehStatus
          })
        });
      }
      if (res.ok) {
        setAdminFeedback(`Vehicle successfully ${editingId ? 'modified' : 'added'}!`);
        setEditingId(null);
        setFVehPlate('');
        setFVehMake('');
        setFVehModel('');
        onRefresh();
        setTimeout(() => setAdminFeedback(''), 4000);
      } else {
        setAdminFeedback('Error submitting vehicle specs.');
      }
    } catch (err) {
      setAdminFeedback('Connection error.');
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete Asset ${id}? This will also wipe its linked insurance record.`)) return;
    try {
      const res = await fetch('/api/owner/vehicle/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setAdminFeedback(`Asset ${id} and insurance policy deleted!`);
        onRefresh();
        setTimeout(() => setAdminFeedback(''), 4000);
      }
    } catch (e) {
      setAdminFeedback('Connection error.');
    }
  };

  const handleEditVehicle = (v: Vehicle) => {
    setEditingId(v.id);
    setFVehPlate(v.plate);
    setFVehMake(v.make);
    setFVehModel(v.model);
    setFVehYear(String(v.year));
    setFVehType(v.type);
    setFVehStatus(v.status);
  };

  // 4. Service (Vendor) CRUD
  const handleSubmitVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/vendor/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fVenName,
          contactPerson: fVenContact,
          phone: fVenPhone,
          email: fVenEmail,
          services: fVenServices.split(',').map(s => s.trim()),
          address: fVenAddress
        })
      });
      if (res.ok) {
        setAdminFeedback('Vendor registered successfully!');
        setFVenName('');
        setFVenContact('');
        setFVenPhone('');
        setFVenEmail('');
        setFVenAddress('');
        onRefresh();
        setTimeout(() => setAdminFeedback(''), 4000);
      } else {
        setAdminFeedback('Error registering vendor.');
      }
    } catch (err) {
      setAdminFeedback('Connection error.');
    }
  };

  // 5. Maintenance CRUD
  const handleSubmitMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let res;
      if (editingId) {
        res = await fetch('/api/owner/maintenance/modify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            updates: {
              vehicleId: fMaintVehId,
              vendorId: fMaintVenId,
              serviceType: fMaintType,
              cost: Number(fMaintCost),
              scheduledDate: fMaintDate,
              notes: fMaintNotes,
              status: fMaintStatus
            }
          })
        });
      } else {
        res = await fetch('/api/owner/maintenance/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vehicleId: fMaintVehId,
            vendorId: fMaintVenId,
            serviceType: fMaintType,
            cost: Number(fMaintCost),
            scheduledDate: fMaintDate,
            notes: fMaintNotes
          })
        });
      }
      if (res.ok) {
        setAdminFeedback(`Maintenance record ${editingId ? 'modified' : 'added'} successfully!`);
        setEditingId(null);
        setFMaintVehId('');
        setFMaintVenId('');
        setFMaintCost('');
        setFMaintDate('');
        setFMaintNotes('');
        onRefresh();
        setTimeout(() => setAdminFeedback(''), 4000);
      } else {
        setAdminFeedback('Error submitting maintenance record.');
      }
    } catch (err) {
      setAdminFeedback('Connection error.');
    }
  };

  const handleDeleteMaintenance = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete maintenance record ${id}?`)) return;
    try {
      const res = await fetch('/api/owner/maintenance/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setAdminFeedback(`Maintenance record ${id} deleted successfully!`);
        onRefresh();
        setTimeout(() => setAdminFeedback(''), 4000);
      }
    } catch (e) {
      setAdminFeedback('Connection error.');
    }
  };

  const handleEditMaintenance = (m: MaintenanceRecord) => {
    setEditingId(m.id);
    setFMaintVehId(m.vehicleId);
    setFMaintVenId(m.vendorId || '');
    setFMaintType(m.serviceType);
    setFMaintCost(String(m.cost));
    setFMaintDate(m.scheduledDate);
    setFMaintNotes(m.notes || '');
    setFMaintStatus(m.status);
  };

  // 6. Insurance CRUD
  const handleSubmitInsurance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let res;
      if (editingId) {
        res = await fetch('/api/owner/insurance/modify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            updates: {
              vehicleId: fInsVehId,
              provider: fInsProvider,
              policyNumber: fInsPolNum,
              expiryDate: fInsExpiry,
              annualPremium: Number(fInsPremium),
              coverageDetails: fInsDetails
            }
          })
        });
      } else {
        res = await fetch('/api/owner/insurance/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vehicleId: fInsVehId,
            provider: fInsProvider,
            policyNumber: fInsPolNum,
            expiryDate: fInsExpiry,
            annualPremium: Number(fInsPremium),
            coverageDetails: fInsDetails
          })
        });
      }
      if (res.ok) {
        setAdminFeedback(`Insurance policy ${editingId ? 'modified' : 'added'} successfully!`);
        setEditingId(null);
        setFInsVehId('');
        setFInsProvider('');
        setFInsPolNum('');
        setFInsPremium('');
        setFInsDetails('');
        onRefresh();
        setTimeout(() => setAdminFeedback(''), 4000);
      } else {
        setAdminFeedback('Error submitting insurance policy details.');
      }
    } catch (err) {
      setAdminFeedback('Connection error.');
    }
  };

  const handleDeleteInsurance = async (id: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete Insurance Policy ${id}?`)) return;
    try {
      const res = await fetch('/api/owner/insurance/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setAdminFeedback(`Insurance Policy ${id} deleted successfully!`);
        onRefresh();
        setTimeout(() => setAdminFeedback(''), 4000);
      }
    } catch (e) {
      setAdminFeedback('Connection error.');
    }
  };

  const handleEditInsurance = (ins: InsurancePolicy) => {
    setEditingId(ins.id);
    setFInsVehId(ins.vehicleId);
    setFInsProvider(ins.provider);
    setFInsPolNum(ins.policyNumber || '');
    setFInsExpiry(ins.expiryDate);
    setFInsPremium(String(ins.annualPremium));
    setFInsDetails(ins.coverageDetails || '');
  };

  const executeSqlConsole = async (queryToRun: string) => {
    try {
      const res = await fetch('/api/sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sql: queryToRun,
          role: 'Owner',
          username: username
        })
      });
      const data = await res.json();
      setSqlResult(data);
      if (!data.error) {
        onRefresh();
      }
    } catch (err) {
      setSqlResult({ columns: ['Error'], rows: [], error: 'Could not connect to database container' });
    }
  };

  const triggerBackup = async () => {
    setIsBackingUp(true);
    setBackupMessage('Synthesizing incremental logs, encrypting with AES-256...');
    try {
      const res = await fetch('/api/backups/trigger', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setBackupMessage(`Backup ${data.id} uploaded successfully! Size: ${data.size}. Fully encrypted.`);
        fetchBackups();
        onRefresh();
        setTimeout(() => setBackupMessage(''), 5000);
      } else {
        setBackupMessage('Backup failed.');
      }
    } catch (e) {
      setBackupMessage('Connection error.');
    } finally {
      setIsBackingUp(false);
    }
  };

  // Charts aggregation
  const statusData = [
    { name: 'Active', value: vehicles.filter(v => v.status === 'Active').length },
    { name: 'On Trip', value: vehicles.filter(v => v.status === 'On Trip').length },
    { name: 'In Service', value: vehicles.filter(v => v.status === 'In Service').length },
    { name: 'Inactive', value: vehicles.filter(v => v.status === 'Inactive').length },
  ].filter(d => d.value > 0);

  const costData = [
    { name: 'Maintenance', Cost: maintenanceCosts },
    { name: 'Fuel', Cost: fuelLogs.reduce((sum, log) => sum + log.cost, 0) }
  ];

  const handleExportAuditCSV = () => {
    const headers = ['id', 'userRole', 'username', 'action', 'sqlStatement', 'timestamp'];
    const rows = auditLogs.map(log => [
      log.id,
      log.userRole,
      log.username,
      log.action,
      log.sqlStatement,
      log.timestamp
    ]);
    exportToCSV(headers, rows, 'fleetcore_audit_logs');
  };

  const handleExportAuditPDF = () => {
    printReport('Fleet Management System - Full Compliance Audit Trail', ['id', 'userRole', 'username', 'action', 'sqlStatement', 'timestamp'], auditLogs);
  };

  return (
    <div className="space-y-8 animate-fade-in" id="owner-dashboard-root">
      {/* OWNER APPROVALS & VERIFICATIONS CONTROL ROOM */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-4" id="owner-approvals-hq">
        <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" /> Compliance & Approvals Control Center
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Owner authority workspace to review, approve, or reject supervisor proposals and verified driver service records.
            </p>
          </div>

          <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded-lg text-xs" id="owner-approval-tabs">
            <button
              onClick={() => setActiveApprovalTab('services')}
              className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeApprovalTab === 'services' 
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Services ({pendingServices.length})
            </button>
            <button
              onClick={() => setActiveApprovalTab('vehicles')}
              className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeApprovalTab === 'vehicles' 
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Vehicles ({pendingVehicles.length})
            </button>
            <button
              onClick={() => setActiveApprovalTab('drivers')}
              className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeApprovalTab === 'drivers' 
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Drivers ({pendingDrivers.length})
            </button>
            <button
              onClick={() => setActiveApprovalTab('insurance')}
              className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeApprovalTab === 'insurance' 
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Insurance ({pendingInsurance.length})
            </button>
            <button
              onClick={() => setActiveApprovalTab('supervisors')}
              className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeApprovalTab === 'supervisors' 
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Supervisors ({pendingSupervisors.length})
            </button>
          </div>
        </div>

        {approvalFeedback && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-semibold text-center">
            {approvalFeedback}
          </div>
        )}

        <div className="space-y-4" id="owner-approval-viewport">
          {/* TAB 1: SERVICES */}
          {activeApprovalTab === 'services' && (
            <div className="space-y-3" id="services-approval-view">
              {pendingServices.length > 0 ? (
                pendingServices.map(m => {
                  const isMod = !!m.pendingChanges;
                  return (
                    <div key={m.id} className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/40 dark:bg-zinc-950/20 space-y-3 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded font-bold text-zinc-500">TICKET: {m.id}</span>
                            <span className="text-[9px] bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 px-2 py-0.5 rounded font-mono font-bold uppercase">Supervisor Verified</span>
                          </div>
                          <h4 className="font-bold text-xs text-zinc-800 dark:text-zinc-100 mt-2 flex items-center gap-1.5">
                            {m.serviceType}
                            {isMod ? (
                              <span className="text-[9px] bg-amber-500/15 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded font-bold">Modified Record</span>
                            ) : (
                              <span className="text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-bold">New Addition</span>
                            )}
                          </h4>
                          <p className="text-[11px] text-zinc-400 mt-0.5">Vehicle Code: <strong className="text-zinc-700 dark:text-zinc-300">{m.vehicleId}</strong> &bull; Original Submitter: <strong className="text-zinc-700 dark:text-zinc-300">{m.submittedBy || 'Driver'}</strong></p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-zinc-400 block">{m.scheduledDate}</span>
                          <span className="text-xs font-black text-zinc-800 dark:text-zinc-100">${m.cost}</span>
                        </div>
                      </div>

                      {isMod && m.pendingChanges && (
                        <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg text-[11px] space-y-1.5">
                          <p className="font-bold text-amber-500">Proposed Edits (Supervisor Verified):</p>
                          <div className="grid grid-cols-2 gap-4 font-mono text-zinc-500">
                            <div>
                              <span className="text-[9px] text-zinc-400 block uppercase">Current Details</span>
                              <p>Service: {m.serviceType}</p>
                              <p>Cost: ${m.cost}</p>
                              <p className="truncate">Notes: "{m.notes}"</p>
                            </div>
                            <div className="border-l border-zinc-200 dark:border-zinc-800 pl-4 text-zinc-800 dark:text-zinc-200 font-bold">
                              <span className="text-[9px] text-zinc-400 block uppercase">Proposed Details</span>
                              <p>Service: {m.pendingChanges.serviceType || m.serviceType}</p>
                              <p>Cost: ${m.pendingChanges.cost !== undefined ? m.pendingChanges.cost : m.cost}</p>
                              <p className="truncate">Notes: "{m.pendingChanges.notes || m.notes}"</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {!isMod && (
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 italic">"Notes: {m.notes}"</p>
                      )}

                      <div className="flex gap-2 justify-end pt-2 border-t border-zinc-100 dark:border-zinc-800/40">
                        <button
                          onClick={() => handleOwnerApproveService(m.id, false)}
                          className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded text-xs font-bold transition cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleOwnerApproveService(m.id, true)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition cursor-pointer"
                        >
                          Approve & Commit to DB
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                  No verified driver service records are currently pending owner approval.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: VEHICLES */}
          {activeApprovalTab === 'vehicles' && (
            <div className="space-y-3" id="vehicles-approval-view">
              {pendingVehicles.length > 0 ? (
                pendingVehicles.map(v => {
                  const isMod = !!v.pendingChanges;
                  return (
                    <div key={v.id} className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/40 dark:bg-zinc-950/20 space-y-3 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded font-bold text-zinc-500">VEHICLE ID: {v.id}</span>
                            <span className="text-[9px] bg-blue-500/10 text-blue-500 dark:text-blue-400 px-2 py-0.5 rounded font-mono font-bold uppercase">Supervisor Action Needed</span>
                          </div>
                          <h4 className="font-bold text-xs text-zinc-800 dark:text-zinc-100 mt-2">
                            {v.make} {v.model} ({v.year || '2023'})
                          </h4>
                          <p className="text-[11px] text-zinc-400 mt-0.5">License Plate: <strong className="text-zinc-700 dark:text-zinc-300">{v.plate}</strong> &bull; Class: <strong className="text-zinc-700 dark:text-zinc-300">{v.type}</strong></p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400 px-2 py-0.5 rounded">{v.status}</span>
                        </div>
                      </div>

                      {isMod && v.pendingChanges && (
                        <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg text-[11px] space-y-1.5">
                          <p className="font-bold text-amber-500">Proposed Vehicle Modifications:</p>
                          <div className="grid grid-cols-2 gap-4 font-mono text-zinc-500">
                            <div>
                              <span className="text-[9px] text-zinc-400 block uppercase">Current Details</span>
                              <p>Plate: {v.plate}</p>
                              <p>Make: {v.make}</p>
                              <p>Model: {v.model}</p>
                            </div>
                            <div className="border-l border-zinc-200 dark:border-zinc-800 pl-4 text-zinc-800 dark:text-zinc-200 font-bold">
                              <span className="text-[9px] text-zinc-400 block uppercase">Proposed Details</span>
                              <p>Plate: {v.pendingChanges.plate || v.plate}</p>
                              <p>Make: {v.pendingChanges.make || v.make}</p>
                              <p>Model: {v.pendingChanges.model || v.model}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 justify-end pt-2 border-t border-zinc-100 dark:border-zinc-800/40">
                        <button
                          onClick={() => handleOwnerApproveVehicle(v.id, false)}
                          className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded text-xs font-bold transition cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleOwnerApproveVehicle(v.id, true)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition cursor-pointer"
                        >
                          Approve Registration
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                  No vehicle additions or modifications are pending owner approval.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DRIVERS */}
          {activeApprovalTab === 'drivers' && (
            <div className="space-y-3" id="drivers-approval-view">
              {pendingDrivers.length > 0 ? (
                pendingDrivers.map(d => (
                  <div key={d.id} className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/40 dark:bg-zinc-950/20 space-y-3 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded font-bold text-zinc-500">DRIVER ID: {d.id}</span>
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-mono font-bold uppercase">New Supervisor Addition</span>
                        </div>
                        <h4 className="font-bold text-xs text-zinc-800 dark:text-zinc-100 mt-2">
                          {d.name}
                        </h4>
                        <p className="text-[11px] text-zinc-400 mt-0.5">Email: <strong className="text-zinc-700 dark:text-zinc-300">{d.email}</strong> &bull; License: <strong className="text-zinc-700 dark:text-zinc-300">{d.licenseNumber}</strong></p>
                      </div>
                      <div className="text-right text-[10px] text-zinc-400 font-mono">
                        Phone: {d.phone || 'N/A'}
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2 border-t border-zinc-100 dark:border-zinc-800/40">
                      <button
                        onClick={() => handleOwnerApproveDriver(d.id, false)}
                        className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded text-xs font-bold transition cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleOwnerApproveDriver(d.id, true)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition cursor-pointer"
                      >
                        Approve Driver Account
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                  No driver accounts are pending owner approval.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: INSURANCE */}
          {activeApprovalTab === 'insurance' && (
            <div className="space-y-3" id="insurance-approval-view">
              {pendingInsurance.length > 0 ? (
                pendingInsurance.map(p => (
                  <div key={p.id} className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/40 dark:bg-zinc-950/20 space-y-3 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded font-bold text-zinc-500">POLICY ID: {p.id}</span>
                          <span className="text-[9px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded font-mono font-bold uppercase">Supervisor Verified</span>
                        </div>
                        <h4 className="font-bold text-xs text-zinc-800 dark:text-zinc-100 mt-2">
                          {p.provider} &bull; Policy #{p.policyNumber}
                        </h4>
                        <p className="text-[11px] text-zinc-400 mt-0.5">Vehicle: <strong className="text-zinc-700 dark:text-zinc-300">{p.vehicleId}</strong> &bull; Coverage: <span className="text-zinc-600 dark:text-zinc-300 font-mono text-[10px]">{p.coverageDetails}</span></p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-zinc-400 block">Expires: {p.expiryDate}</span>
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100">${p.annualPremium}/yr</span>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2 border-t border-zinc-100 dark:border-zinc-800/40">
                      <button
                        onClick={() => handleOwnerApproveInsurance(p.id, false)}
                        className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded text-xs font-bold transition cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleOwnerApproveInsurance(p.id, true)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition cursor-pointer"
                      >
                        Approve Policy
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                  No insurance policies are pending owner approval.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SUPERVISORS */}
          {activeApprovalTab === 'supervisors' && (
            <div className="space-y-3" id="supervisors-approval-view">
              {pendingSupervisors.length > 0 ? (
                pendingSupervisors.map(s => (
                  <div key={s.id} className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/40 dark:bg-zinc-950/20 space-y-3 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded font-bold text-zinc-500">SUPERVISOR ID: {s.id}</span>
                          <span className="text-[9px] bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 px-2 py-0.5 rounded font-mono font-bold uppercase">Pending Activation</span>
                        </div>
                        <h4 className="font-bold text-xs text-zinc-800 dark:text-zinc-100 mt-2">
                          {s.name}
                        </h4>
                        <p className="text-[11px] text-zinc-400 mt-0.5">Email: <strong className="text-zinc-700 dark:text-zinc-300">{s.email}</strong> &bull; Role Auth Level: <span className="text-indigo-500 font-bold">Supervisor</span></p>
                      </div>
                      <div className="text-right text-[10px] text-zinc-400 font-mono">
                        Phone: {s.phone || 'N/A'}
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2 border-t border-zinc-100 dark:border-zinc-800/40">
                      <button
                        onClick={() => handleOwnerApproveSupervisor(s.id, false)}
                        className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded text-xs font-bold transition cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleOwnerApproveSupervisor(s.id, true)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition cursor-pointer"
                      >
                        Approve & Grant Keys
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                  No supervisor registrations are pending owner approval.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Analytics Overview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="owner-charts-grid">
        {/* Cost comparison chart */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm col-span-1 lg:col-span-2" id="cost-comparison-card">
          <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-500" /> Operational Cost Allocation
          </h3>
          <div className="h-64" id="cost-bar-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="name" stroke="#71717a" />
                <YAxis stroke="#71717a" />
                <Tooltip contentStyle={{ borderRadius: '8px' }} />
                <Bar dataKey="Cost" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                  {costData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#3B82F6' : '#10B981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm" id="vehicle-status-distribution-card">
          <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">
            Vehicle Status Share
          </h3>
          <div className="h-48 relative flex items-center justify-center" id="status-pie-chart-container">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-zinc-400">No status data available.</p>
            )}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{vehicles.length}</span>
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">Total Assets</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs" id="status-legend">
            {statusData.map((entry, idx) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-zinc-600 dark:text-zinc-400">{entry.name}: <strong className="text-zinc-900 dark:text-zinc-100">{entry.value}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SQL Command Playground */}
      <div className="bg-zinc-950 text-zinc-100 border border-zinc-800 rounded-xl p-6 shadow-xl relative overflow-hidden" id="sql-playground-card">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4 mb-4">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2 text-emerald-400">
              <Terminal className="w-5 h-5" /> SQL Query Command Console
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Live operational SQL terminal. Execute queries directly against the fleet relational model.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs" id="sql-quick-queries">
            <button 
              onClick={() => { setSqlQuery('SELECT * FROM vehicles WHERE status = \'Active\';'); executeSqlConsole('SELECT * FROM vehicles WHERE status = \'Active\';'); }}
              className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 rounded transition cursor-pointer text-zinc-300"
            >
              Vehicles Active
            </button>
            <button 
              onClick={() => { setSqlQuery('SELECT * FROM drivers ORDER BY rating DESC;'); executeSqlConsole('SELECT * FROM drivers ORDER BY rating DESC;'); }}
              className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 rounded transition cursor-pointer text-zinc-300"
            >
              Drivers by Rating
            </button>
            <button 
              onClick={() => { setSqlQuery('SELECT * FROM audit_logs;'); executeSqlConsole('SELECT * FROM audit_logs;'); }}
              className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 rounded transition cursor-pointer text-zinc-300"
            >
              Full Audit Trial
            </button>
          </div>
        </div>

        <div className="space-y-4" id="sql-console-form-container">
          <div className="flex gap-2" id="sql-console-input-group">
            <span className="font-mono text-zinc-500 select-none self-center text-sm">fleet_db#</span>
            <input 
              type="text" 
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              className="flex-1 font-mono text-sm bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-emerald-500 focus:outline-none rounded px-3 py-2 text-emerald-400"
              placeholder="SELECT * FROM vehicles;"
            />
            <button 
              onClick={() => executeSqlConsole(sqlQuery)}
              className="bg-emerald-600 hover:bg-emerald-500 transition px-4 py-2 text-sm text-white font-semibold rounded flex items-center gap-1 cursor-pointer shadow-lg shadow-emerald-950/20"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Execute
            </button>
          </div>

          {/* Result Display */}
          {sqlResult && (
            <div className="bg-zinc-900 border border-zinc-800 rounded p-4 overflow-x-auto font-mono text-xs max-h-72" id="sql-result-display">
              {sqlResult.error ? (
                <div className="text-red-400 border border-red-950/50 bg-red-950/20 px-3 py-2.5 rounded flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">SQL Error:</span> {sqlResult.error}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between text-zinc-500 border-b border-zinc-800 pb-2 mb-2">
                    <span>Rows Returned: {sqlResult.rows?.length || 0}</span>
                    <span className="text-[10px] text-emerald-500/70 font-semibold">SUCCESS &bull; TRANSACT WRITE OK</span>
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-400">
                        {sqlResult.columns?.map((col, idx) => (
                          <th key={idx} className="p-2 select-all">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sqlResult.rows?.length > 0 ? (
                        sqlResult.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 text-zinc-300">
                            {sqlResult.columns.map((col, cIdx) => {
                              const cellValue = row[col];
                              return (
                                <td key={cIdx} className="p-2 select-all">
                                  {cellValue === null ? (
                                    <span className="text-zinc-600 italic">NULL</span>
                                  ) : typeof cellValue === 'object' ? (
                                    JSON.stringify(cellValue)
                                  ) : (
                                    String(cellValue)
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={sqlResult.columns?.length || 1} className="p-2 text-zinc-500 italic text-center">
                            Empty set (0 rows)
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="driver-backup-grid">
        {/* Enterprise Admin Control Panel */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm flex flex-col justify-between" id="driver-management-card">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Enterprise Corporate Admin Panel
              </h3>
              {editingId && (
                <button 
                  onClick={() => setEditingId(null)} 
                  className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-bold px-2 py-0.5 rounded-md hover:underline cursor-pointer"
                >
                  Cancel Edit (Mode: Edit #{editingId})
                </button>
              )}
            </div>

            {/* Entity switcher tabs */}
            <div className="flex flex-wrap gap-1 mb-5 border-b border-zinc-100 dark:border-zinc-800 pb-3" id="owner-admin-tabs">
              {(['drivers', 'supervisors', 'vehicles', 'vendors', 'maintenance', 'insurance'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveAdminTab(tab);
                    setEditingId(null);
                    setAdminFeedback('');
                  }}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg capitalize transition cursor-pointer ${
                    activeAdminTab === tab 
                      ? 'bg-blue-600 text-white shadow' 
                      : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Admin Feedback Block */}
            {adminFeedback && (
              <div className="text-xs bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 p-2.5 rounded-lg border border-blue-200 dark:border-blue-950 flex items-center gap-2 mb-4">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{adminFeedback}</span>
              </div>
            )}

            {/* 1. DRIVERS TAB CONTENT */}
            {activeAdminTab === 'drivers' && (
              <div className="space-y-4 animate-fade-in" id="admin-drivers-section">
                <form onSubmit={handleSubmitDriver} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">Driver Name*</label>
                      <input 
                        type="text" required value={fDriverName} onChange={e => setFDriverName(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Liam Thompson"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">Email*</label>
                      <input 
                        type="email" required value={fDriverEmail} onChange={e => setFDriverEmail(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="liam.t@corp.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">Phone</label>
                      <input 
                        type="tel" value={fDriverPhone} onChange={e => setFDriverPhone(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="+1-555-0199"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">CDL License*</label>
                      <input 
                        type="text" required value={fDriverLicense} onChange={e => setFDriverLicense(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="DL-CA9942"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">Status</label>
                      <select 
                        value={fDriverStatus} onChange={e => setFDriverStatus(e.target.value as any)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Active">Active</option>
                        <option value="Off Duty">Off Duty</option>
                        <option value="On Trip">On Trip</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">Full Address</label>
                      <input 
                        type="text" value={fDriverAddress} onChange={e => setFDriverAddress(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="123 Main St, New Delhi"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">Assigned Supervisor</label>
                      <select 
                        value={fDriverSupervisorId} onChange={e => setFDriverSupervisorId(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">PAN Card Number</label>
                      <input 
                        type="text" value={fDriverPan} onChange={e => setFDriverPan(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono uppercase"
                        placeholder="ABCDE1234F"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">Aadhar Number</label>
                      <input 
                        type="text" value={fDriverAadhar} onChange={e => setFDriverAadhar(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                        placeholder="1234-5678-9012"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">Bank Account & IFSC</label>
                      <input 
                        type="text" value={fDriverBankDetails} onChange={e => setFDriverBankDetails(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="HDFC A/C: 501002..., IFSC: HDFC0000..."
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 transition text-white py-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer">
                    {editingId ? 'Modify Existing Driver' : 'Register New Active Driver'}
                  </button>
                </form>

                <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Corporate Driver Directory ({drivers.length})</h4>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {drivers.map(drv => (
                      <div key={drv.id} className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/80 rounded-lg text-xs">
                        <div>
                          <span className="font-bold text-zinc-800 dark:text-zinc-200">{drv.name}</span>
                          <span className="text-[10px] text-zinc-400 font-mono ml-1.5">ID: {drv.id}</span>
                          <div className="text-[9px] text-zinc-500">{drv.email} &bull; CDL: {drv.licenseNumber}</div>
                          {drv.supervisorId && (
                            <div className="text-[9px] text-blue-600 dark:text-blue-400 font-semibold">
                              Assigned Supervisor: {supervisors.find(s => s.id === drv.supervisorId)?.name || drv.supervisorId}
                            </div>
                          )}
                          {(drv.address || drv.pan || drv.aadhar || drv.bankDetails) && (
                            <div className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-0.5 space-y-0.5">
                              {drv.address && <div>📍 {drv.address}</div>}
                              <div className="flex gap-2">
                                {drv.pan && <span>PAN: <span className="font-mono uppercase text-zinc-600 dark:text-zinc-300 font-semibold">{drv.pan}</span></span>}
                                {drv.aadhar && <span>Aadhar: <span className="font-mono text-zinc-600 dark:text-zinc-300 font-semibold">{drv.aadhar}</span></span>}
                              </div>
                              {drv.bankDetails && <div>🏦 {drv.bankDetails}</div>}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold font-mono ${drv.status === 'Active' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' : 'bg-zinc-150 dark:bg-zinc-800 text-zinc-400'}`}>
                            {drv.status}
                          </span>
                          <button onClick={() => handleEditDriver(drv)} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-blue-500 cursor-pointer">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteDriver(drv.id)} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-red-500 cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. SUPERVISORS TAB CONTENT */}
            {activeAdminTab === 'supervisors' && (
              <div className="space-y-4 animate-fade-in" id="admin-supervisors-section">
                <form onSubmit={handleSubmitSupervisor} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">Supervisor Name*</label>
                      <input 
                        type="text" required value={fSuperName} onChange={e => setFSuperName(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="John Miller"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">Email*</label>
                      <input 
                        type="email" required value={fSuperEmail} onChange={e => setFSuperEmail(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="j.miller@corp.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">Phone</label>
                      <input 
                        type="tel" value={fSuperPhone} onChange={e => setFSuperPhone(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="+1-555-0100"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">Status</label>
                      <select 
                        value={fSuperStatus} onChange={e => setFSuperStatus(e.target.value as any)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">Full Address</label>
                      <input 
                        type="text" value={fSuperAddress} onChange={e => setFSuperAddress(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="456 Ring Road, Mumbai"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">Bank Account & IFSC</label>
                      <input 
                        type="text" value={fSuperBankDetails} onChange={e => setFSuperBankDetails(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="ICICI A/C: 000401..., IFSC: ICIC0000..."
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">PAN Card Number</label>
                      <input 
                        type="text" value={fSuperPan} onChange={e => setFSuperPan(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono uppercase"
                        placeholder="XYZKP9876Q"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">Aadhar Number</label>
                      <input 
                        type="text" value={fSuperAadhar} onChange={e => setFSuperAadhar(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                        placeholder="9876-5432-1098"
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 transition text-white py-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer">
                    {editingId ? 'Modify Existing Supervisor' : 'Add New Supervisor Account'}
                  </button>
                </form>

                <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Corporate Supervisor Directory ({supervisors.length})</h4>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {supervisors.map(sup => (
                      <div key={sup.id} className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/80 rounded-lg text-xs">
                        <div>
                          <span className="font-bold text-zinc-800 dark:text-zinc-200">{sup.name}</span>
                          <span className="text-[10px] text-zinc-400 font-mono ml-1.5">ID: {sup.id}</span>
                          <div className="text-[9px] text-zinc-500">{sup.email} &bull; {sup.phone}</div>
                          {(sup.address || sup.pan || sup.aadhar || sup.bankDetails) && (
                            <div className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-0.5 space-y-0.5">
                              {sup.address && <div>📍 {sup.address}</div>}
                              <div className="flex gap-2">
                                {sup.pan && <span>PAN: <span className="font-mono uppercase text-zinc-600 dark:text-zinc-300 font-semibold">{sup.pan}</span></span>}
                                {sup.aadhar && <span>Aadhar: <span className="font-mono text-zinc-600 dark:text-zinc-300 font-semibold">{sup.aadhar}</span></span>}
                              </div>
                              {sup.bankDetails && <div>🏦 {sup.bankDetails}</div>}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {!sup.isApproved && (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleVerifySupervisor(sup.id, true)} className="bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded font-semibold cursor-pointer">Approve</button>
                              <button onClick={() => handleVerifySupervisor(sup.id, false)} className="bg-red-600 hover:bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded font-semibold cursor-pointer">Reject</button>
                            </div>
                          )}
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold font-mono ${sup.isApproved ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' : 'bg-amber-100 dark:bg-amber-950 text-amber-600'}`}>
                            {sup.isApproved ? 'Approved' : 'Pending Approval'}
                          </span>
                          <button onClick={() => handleEditSupervisor(sup)} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-blue-500 cursor-pointer">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteSupervisor(sup.id)} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-red-500 cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. VEHICLES TAB CONTENT */}
            {activeAdminTab === 'vehicles' && (
              <div className="space-y-4 animate-fade-in" id="admin-vehicles-section">
                <form onSubmit={handleSubmitVehicle} className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">License Plate*</label>
                      <input 
                        type="text" required value={fVehPlate} onChange={e => setFVehPlate(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="7XYZ89"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">Make*</label>
                      <input 
                        type="text" required value={fVehMake} onChange={e => setFVehMake(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Ford"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">Model*</label>
                      <input 
                        type="text" required value={fVehModel} onChange={e => setFVehModel(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="F-150"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">Year*</label>
                      <input 
                        type="number" required value={fVehYear} onChange={e => setFVehYear(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">Class Type*</label>
                      <input 
                        type="text" required value={fVehType} onChange={e => setFVehType(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Heavy Duty Truck"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">Status</label>
                      <select 
                        value={fVehStatus} onChange={e => setFVehStatus(e.target.value as any)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Active">Active</option>
                        <option value="In Service">In Service</option>
                        <option value="On Trip">On Trip</option>
                        <option value="Decommissioned">Decommissioned</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 transition text-white py-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer">
                    {editingId ? 'Modify Vehicle Record' : 'Add New Asset Vehicle'}
                  </button>
                </form>

                <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Corporate Asset Directory ({vehicles.length})</h4>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {vehicles.map(veh => (
                      <div key={veh.id} className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/80 rounded-lg text-xs">
                        <div>
                          <span className="font-bold text-zinc-800 dark:text-zinc-200">{veh.make} {veh.model} ({veh.plate})</span>
                          <span className="text-[10px] text-zinc-400 font-mono ml-1.5">ID: {veh.id}</span>
                          <div className="text-[9px] text-zinc-500">{veh.type} &bull; Year: {veh.year}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold font-mono ${veh.status === 'Active' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' : 'bg-amber-100 dark:bg-amber-950 text-amber-600'}`}>
                            {veh.status}
                          </span>
                          <button onClick={() => handleEditVehicle(veh)} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-blue-500 cursor-pointer">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteVehicle(veh.id)} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-red-500 cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 4. VENDORS TAB CONTENT */}
            {activeAdminTab === 'vendors' && (
              <div className="space-y-4 animate-fade-in" id="admin-vendors-section">
                <form onSubmit={handleSubmitVendor} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">Vendor/Service Name*</label>
                      <input 
                        type="text" required value={fVenName} onChange={e => setFVenName(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Apex Auto Garage"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">Contact Person</label>
                      <input 
                        type="text" value={fVenContact} onChange={e => setFVenContact(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Jerry Smith"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">Phone</label>
                      <input 
                        type="tel" value={fVenPhone} onChange={e => setFVenPhone(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="+1-555-8821"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">Email</label>
                      <input 
                        type="email" value={fVenEmail} onChange={e => setFVenEmail(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="contact@apexgarage.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">Offered Services (Comma separated)*</label>
                      <input 
                        type="text" required value={fVenServices} onChange={e => setFVenServices(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">Workshop Address</label>
                      <input 
                        type="text" value={fVenAddress} onChange={e => setFVenAddress(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="450 industrial Dr"
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 transition text-white py-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer">
                    Register New Service Vendor
                  </button>
                </form>

                <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Corporate Service Vendors ({vendors.length})</h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {vendors.map(v => (
                      <div key={v.id} className="p-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/80 rounded-lg text-xs">
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">{v.name}</span>
                        <span className="text-[10px] text-zinc-400 font-mono ml-2">ID: {v.id}</span>
                        <div className="text-[9px] text-zinc-500 mt-0.5">Contact: {v.contactPerson} &bull; {v.phone}</div>
                        <div className="text-[9px] font-bold text-blue-500 mt-1">Services: {v.services.join(', ')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 5. MAINTENANCE TAB CONTENT */}
            {activeAdminTab === 'maintenance' && (
              <div className="space-y-4 animate-fade-in" id="admin-maintenance-section">
                <form onSubmit={handleSubmitMaintenance} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">Select Asset Vehicle*</label>
                      <select 
                        required value={fMaintVehId} onChange={e => setFMaintVehId(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">-- Choose Vehicle --</option>
                        {vehicles.map(v => (
                          <option key={v.id} value={v.id}>{v.id} ({v.plate}) - {v.make}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">Select Service Vendor*</label>
                      <select 
                        required value={fMaintVenId} onChange={e => setFMaintVenId(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">-- Choose Vendor --</option>
                        {vendors.map(v => (
                          <option key={v.id} value={v.id}>{v.name} ({v.id})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">Service Type*</label>
                      <input 
                        type="text" required value={fMaintType} onChange={e => setFMaintType(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                        placeholder="Oil Change"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">Cost (INR/USD)*</label>
                      <input 
                        type="number" required value={fMaintCost} onChange={e => setFMaintCost(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                        placeholder="5000"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">Scheduled Date*</label>
                      <input 
                        type="date" required value={fMaintDate} onChange={e => setFMaintDate(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                      />
                    </div>
                  </div>
                  {editingId && (
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">Service Status</label>
                      <select 
                        value={fMaintStatus} onChange={e => setFMaintStatus(e.target.value as any)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800"
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 mb-1">Operational Notes / Repairs</label>
                    <textarea 
                      value={fMaintNotes} onChange={e => setFMaintNotes(e.target.value)} rows={2}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                      placeholder="Add replacement parts, engine diagnostic info..."
                    />
                  </div>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 transition text-white py-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer">
                    {editingId ? 'Modify Maintenance Record' : 'Schedule New Fleet Maintenance'}
                  </button>
                </form>

                <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Fleet Maintenance Ledger ({maintenanceRecords.length})</h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {maintenanceRecords.map(rec => (
                      <div key={rec.id} className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/80 rounded-lg text-xs">
                        <div>
                          <span className="font-bold text-zinc-800 dark:text-zinc-200">{rec.serviceType} &bull; ID: {rec.id}</span>
                          <div className="text-[9px] text-zinc-500">Vehicle: {rec.vehicleId} &bull; Cost: {rec.cost} &bull; {rec.scheduledDate}</div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${rec.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {rec.status}
                          </span>
                          <button onClick={() => handleEditMaintenance(rec)} className="p-0.5 text-blue-500 hover:bg-zinc-200 rounded cursor-pointer">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteMaintenance(rec.id)} className="p-0.5 text-red-500 hover:bg-zinc-200 rounded cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 6. INSURANCE TAB CONTENT */}
            {activeAdminTab === 'insurance' && (
              <div className="space-y-4 animate-fade-in" id="admin-insurance-section">
                <form onSubmit={handleSubmitInsurance} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">Select Target Vehicle*</label>
                      <select 
                        required value={fInsVehId} onChange={e => setFInsVehId(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">-- Choose Vehicle --</option>
                        {vehicles.map(v => (
                          <option key={v.id} value={v.id}>{v.id} ({v.plate})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">Insurance Provider*</label>
                      <input 
                        type="text" required value={fInsProvider} onChange={e => setFInsProvider(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                        placeholder="State Farm Insurance"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">Policy Number*</label>
                      <input 
                        type="text" required value={fInsPolNum} onChange={e => setFInsPolNum(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                        placeholder="POL-99120"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">Annual Premium*</label>
                      <input 
                        type="number" required value={fInsPremium} onChange={e => setFInsPremium(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                        placeholder="1200"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1">Expiry Date*</label>
                      <input 
                        type="date" required value={fInsExpiry} onChange={e => setFInsExpiry(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 mb-1">Coverage Scope Details</label>
                    <textarea 
                      value={fInsDetails} onChange={e => setFInsDetails(e.target.value)} rows={2}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none"
                      placeholder="e.g. Third Party Liability, Comprehensive Theft and Roadside Assistance."
                    />
                  </div>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 transition text-white py-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer">
                    {editingId ? 'Modify Policy Details' : 'Add Corporate Insurance Policy'}
                  </button>
                </form>

                <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Fleet Insurance Registry ({insurancePolicies.length})</h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {insurancePolicies.map(ins => (
                      <div key={ins.id} className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/80 rounded-lg text-xs">
                        <div>
                          <span className="font-bold text-zinc-800 dark:text-zinc-200">{ins.provider} &bull; ID: {ins.id}</span>
                          <div className="text-[9px] text-zinc-500">Vehicle: {ins.vehicleId} &bull; Expiry: {ins.expiryDate}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          {!ins.supervisorVerified && (
                            <span className="text-[9px] text-amber-500 font-bold mr-1">Pending verification</span>
                          )}
                          {ins.ownerApproved !== 'Approved' && (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleOwnerApproveInsurance(ins.id, true)} className="bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded cursor-pointer font-bold">Approve</button>
                              <button onClick={() => handleOwnerApproveInsurance(ins.id, false)} className="bg-red-600 hover:bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded cursor-pointer font-bold">Reject</button>
                            </div>
                          )}
                          {ins.ownerApproved === 'Approved' && (
                            <span className="text-[9px] text-emerald-600 font-bold">✓ Approved</span>
                          )}
                          <button onClick={() => handleEditInsurance(ins)} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-blue-500 cursor-pointer">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteInsurance(ins.id)} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-red-500 cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Disaster Recovery & Cloud Backups */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm flex flex-col justify-between" id="cloud-backups-card">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-purple-500" /> Automated Disaster Recovery
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Database backups are automatically synchronized nightly to Cloud storage buckets.
                </p>
              </div>
              <button
                onClick={triggerBackup}
                disabled={isBackingUp}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isBackingUp ? 'animate-spin' : ''}`} /> Trigger Backup
              </button>
            </div>

            {backupMessage && (
              <div className="text-xs bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 p-2.5 rounded-lg border border-purple-200 dark:border-purple-950/50 flex items-center gap-2 mb-4">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>{backupMessage}</span>
              </div>
            )}

            <div className="space-y-2 max-h-56 overflow-y-auto" id="backups-list">
              {backups.map(bak => (
                <div key={bak.id} className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{bak.id}</span>
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-semibold px-1.5 py-0.5 rounded">
                      {bak.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-zinc-400 font-mono">
                    <span>Size: {bak.size} &bull; Cloud Storage GCS</span>
                    <span>{new Date(bak.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-purple-500/5 border border-purple-200/50 dark:border-purple-900/30 p-3 rounded-xl mt-4 text-xs space-y-1.5">
            <span className="font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Compliant Storage Encryption
            </span>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Backups are encrypted using AES-256 with auto-rotating encryption keys. Storage compliance conforms strictly with SOX & GDPR guidelines.
            </p>
          </div>
        </div>
      </div>

      {/* Audit Log Panel */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm" id="audit-log-panel-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" /> Database Relational Audit Trail
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Maintains high-fidelity logging of all administrative operations, transactions, and backend SQL statements.
            </p>
          </div>
          <div className="flex items-center gap-2" id="audit-log-actions">
            <button 
              onClick={handleExportAuditCSV}
              className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-300 flex items-center gap-1 cursor-pointer"
            >
              Export CSV
            </button>
            <button 
              onClick={handleExportAuditPDF}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              Export PDF
            </button>
          </div>
        </div>

        <div className="overflow-x-auto" id="audit-table-wrapper">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold">
                <th className="p-3">ID</th>
                <th className="p-3">Role</th>
                <th className="p-3">User</th>
                <th className="p-3">Action</th>
                <th className="p-3 font-mono">SQL Replica</th>
                <th className="p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.slice(0, 8).map(log => (
                <tr key={log.id} className="border-b border-zinc-50 dark:border-zinc-800/40 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                  <td className="p-3 font-mono text-zinc-400">{log.id}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                      log.userRole === 'Owner' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400' :
                      log.userRole === 'Supervisor' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400' :
                      log.userRole === 'System' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' :
                      'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}>
                      {log.userRole}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-zinc-700 dark:text-zinc-300">{log.username}</td>
                  <td className="p-3 text-zinc-600 dark:text-zinc-400">{log.action}</td>
                  <td className="p-3 font-mono text-zinc-500 select-all max-w-xs truncate" title={log.sqlStatement}>{log.sqlStatement}</td>
                  <td className="p-3 text-zinc-400 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
