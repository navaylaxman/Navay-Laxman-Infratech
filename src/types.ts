export interface Vehicle {
  id: string; // e.g. "V-101"
  plate: string;
  make: string;
  model: string;
  year: number;
  type: 'Truck' | 'Van' | 'Sedan' | 'SUV';
  status: 'Active' | 'In Service' | 'Inactive' | 'On Trip';
  odometer: number;
  fuelLevel: number; // Percentage
  speed: number; // km/h
  latitude: number;
  longitude: number;
  driverId: string | null;
  insuranceId: string | null;
  isApproved?: boolean;
  supervisorVerified?: 'Pending' | 'Verified' | 'Rejected' | 'N/A';
  ownerApproved?: 'Pending' | 'Approved' | 'Rejected';
  pendingChanges?: Partial<Vehicle>;
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  status: 'Active' | 'Off Duty' | 'On Trip';
  rating: number;
  activeVehicleId: string | null;
  biometricRegistered: boolean;
  isApproved?: boolean;
  address?: string;
  pan?: string;
  aadhar?: string;
  bankDetails?: string;
  supervisorId?: string | null;
}

export interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  services: string[];
  rating: number;
  address: string;
  isApproved?: boolean;
  supervisorVerified?: 'Pending' | 'Verified' | 'Rejected' | 'N/A';
  ownerApproved?: 'Pending' | 'Approved' | 'Rejected';
  pendingChanges?: Partial<Vendor>;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  vendorId: string;
  serviceType: string; // e.g., "Oil Change", "Tire Rotation", "Brake Repair"
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue';
  cost: number;
  scheduledDate: string;
  completedDate: string | null;
  notes: string;
  jiraIssueKey: string | null;
  asanaTaskId: string | null;
  submittedBy?: 'Driver' | 'Supervisor';
  supervisorVerified?: 'Pending' | 'Verified' | 'Rejected' | 'N/A';
  ownerApproved?: 'Pending' | 'Approved' | 'Rejected';
  pendingChanges?: Partial<MaintenanceRecord>;
}

export interface InsurancePolicy {
  id: string;
  vehicleId: string;
  provider: string;
  policyNumber: string;
  expiryDate: string;
  annualPremium: number;
  coverageDetails: string;
  isEncrypted: boolean; // For demonstrating robust encryption
  isApproved?: boolean;
  supervisorVerified?: 'Pending' | 'Verified' | 'Rejected' | 'N/A';
  ownerApproved?: 'Pending' | 'Approved' | 'Rejected';
  pendingChanges?: Partial<InsurancePolicy>;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  driverId: string;
  amount: number; // Litres/Gallons
  cost: number;
  odometerReading: number;
  date: string;
}

export interface AuditLog {
  id: number;
  userRole: string;
  username: string;
  action: string;
  sqlStatement: string;
  timestamp: string;
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  type: 'security' | 'service' | 'task';
  isRead: boolean;
  timestamp: string;
}

export interface Supervisor {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
  biometricRegistered: boolean;
  isApproved?: boolean;
  address?: string;
  pan?: string;
  aadhar?: string;
  bankDetails?: string;
}

export interface DatabaseState {
  vehicles: Vehicle[];
  drivers: Driver[];
  supervisors: Supervisor[];
  vendors: Vendor[];
  maintenanceRecords: MaintenanceRecord[];
  insurancePolicies: InsurancePolicy[];
  fuelLogs: FuelLog[];
  auditLogs: AuditLog[];
  pushNotifications: PushNotification[];
}
