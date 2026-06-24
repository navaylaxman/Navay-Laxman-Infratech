import fs from 'fs';
import path from 'path';
import { DatabaseState, Vehicle, Driver, Supervisor, Vendor, MaintenanceRecord, InsurancePolicy, FuelLog, AuditLog, PushNotification } from '../types';

const DB_FILE = path.join(process.cwd(), 'db.json');

// Helper to encrypt sensitive string values
export function encryptSensitive(val: string): string {
  // Simple deterministic XOR cipher shown as a robust encryption simulation
  const key = 'FLEETCORE_SECURE_KEY';
  let encrypted = '';
  for (let i = 0; i < val.length; i++) {
    const charCode = val.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    encrypted += String.fromCharCode(charCode);
  }
  return Buffer.from(encrypted).toString('base64');
}

export function decryptSensitive(encoded: string): string {
  try {
    const val = Buffer.from(encoded, 'base64').toString('utf-8');
    const key = 'FLEETCORE_SECURE_KEY';
    let decrypted = '';
    for (let i = 0; i < val.length; i++) {
      const charCode = val.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      decrypted += String.fromCharCode(charCode);
    }
    return decrypted;
  } catch {
    return 'Decryption Error';
  }
}

const initialVehicles: Vehicle[] = [
  { id: 'V-101', plate: 'CA-982-FX', make: 'Ford', model: 'F-150', year: 2022, type: 'Truck', status: 'Active', odometer: 42150, fuelLevel: 75, speed: 65, latitude: 37.7749, longitude: -122.4194, driverId: 'D-201', insuranceId: 'I-301' },
  { id: 'V-102', plate: 'TX-147-ZZ', make: 'Chevrolet', model: 'Express Van', year: 2021, type: 'Van', status: 'In Service', odometer: 78300, fuelLevel: 45, speed: 0, latitude: 37.7833, longitude: -122.4167, driverId: 'D-202', insuranceId: 'I-302' },
  { id: 'V-103', plate: 'NY-302-ML', make: 'Toyota', model: 'RAV4', year: 2023, type: 'SUV', status: 'Active', odometer: 15400, fuelLevel: 92, speed: 45, latitude: 37.7699, longitude: -122.4468, driverId: 'D-203', insuranceId: 'I-303' },
  { id: 'V-104', plate: 'FL-509-PK', make: 'Mercedes-Benz', model: 'Sprinter', year: 2020, type: 'Van', status: 'On Trip', odometer: 112000, fuelLevel: 60, speed: 82, latitude: 37.7550, longitude: -122.4350, driverId: 'D-204', insuranceId: 'I-304' },
  { id: 'V-105', plate: 'WA-774-QS', make: 'Honda', model: 'Civic', year: 2022, type: 'Sedan', status: 'Inactive', odometer: 28900, fuelLevel: 22, speed: 0, latitude: 37.7890, longitude: -122.4010, driverId: null, insuranceId: 'I-305' }
];

const initialDrivers: Driver[] = [
  { id: 'D-201', name: 'Alex Rivera', email: 'alex.rivera@fleetcore.io', phone: '+1 (555) 234-5678', licenseNumber: 'DL-CA83921', status: 'On Trip', rating: 4.8, activeVehicleId: 'V-101', biometricRegistered: true },
  { id: 'D-202', name: 'Sarah Jenkins', email: 'sarah.j@fleetcore.io', phone: '+1 (555) 345-6789', licenseNumber: 'DL-TX11482', status: 'Off Duty', rating: 4.9, activeVehicleId: null, biometricRegistered: true },
  { id: 'D-203', name: 'Marcus Vance', email: 'marcus.v@fleetcore.io', phone: '+1 (555) 456-7890', licenseNumber: 'DL-NY77201', status: 'Active', rating: 4.5, activeVehicleId: 'V-103', biometricRegistered: false },
  { id: 'D-204', name: 'Chloe Dubois', email: 'chloe.d@fleetcore.io', phone: '+1 (555) 567-8901', licenseNumber: 'DL-FL39045', status: 'On Trip', rating: 4.7, activeVehicleId: 'V-104', biometricRegistered: true }
];

const initialVendors: Vendor[] = [
  { id: 'VN-401', name: 'Apex Auto Service', contactPerson: 'John Miller', phone: '+1 (555) 123-4567', email: 'service@apexauto.com', services: ['Oil Change', 'Brakes', 'Suspension', 'Tire Rotation'], rating: 4.7, address: '842 Mission St, San Francisco, CA' },
  { id: 'VN-402', name: 'City Fleet Care Center', contactPerson: 'Rita Gomez', phone: '+1 (555) 987-6543', email: 'rita@cityfleetcare.com', services: ['Transmission Repair', 'Engine Diagnostics', 'Major Overhaul'], rating: 4.4, address: '1205 Folsom St, San Francisco, CA' },
  { id: 'VN-403', name: 'Rapid Tire & Glass', contactPerson: 'Dave Fletcher', phone: '+1 (555) 443-2211', email: 'dave@rapidtire.com', services: ['Tire Rotation', 'Wheel Alignment', 'Windshield Replacement'], rating: 4.9, address: '450 Potrero Ave, San Francisco, CA' }
];

const initialMaintenance: MaintenanceRecord[] = [
  { id: 'M-501', vehicleId: 'V-102', vendorId: 'VN-401', serviceType: 'Oil Change & Brake Inspection', status: 'Completed', cost: 185.50, scheduledDate: '2026-06-10', completedDate: '2026-06-11', notes: 'Oil replaced with fully synthetic 5W-30. Brake pads are at 70%.', jiraIssueKey: 'FLEET-843', asanaTaskId: 'as_task_129' },
  { id: 'M-502', vehicleId: 'V-101', vendorId: 'VN-403', serviceType: 'Tire Rotation & Alignment', status: 'Scheduled', cost: 120.00, scheduledDate: '2026-06-25', completedDate: null, notes: 'Regular tire rotation interval approaching.', jiraIssueKey: null, asanaTaskId: null },
  { id: 'M-503', vehicleId: 'V-104', vendorId: 'VN-402', serviceType: 'Transmission Service', status: 'In Progress', cost: 750.00, scheduledDate: '2026-06-22', completedDate: null, notes: 'Vehicle slipping in second gear. Investigating clutch pack.', jiraIssueKey: 'FLEET-852', asanaTaskId: 'as_task_150' },
  { id: 'M-504', vehicleId: 'V-103', vendorId: 'VN-401', serviceType: 'Scheduled Inspection', status: 'Completed', cost: 95.00, scheduledDate: '2026-05-18', completedDate: '2026-05-18', notes: 'Passed all inspections without any issues.', jiraIssueKey: 'FLEET-812', asanaTaskId: null }
];

const initialInsurance: InsurancePolicy[] = [
  { id: 'I-301', vehicleId: 'V-101', provider: 'Progressive Commercial', policyNumber: 'PRG-448201-99', expiryDate: '2027-01-15', annualPremium: 2100, coverageDetails: 'Full liability, Comprehensive & Collision, $1M Limit', isEncrypted: true },
  { id: 'I-302', vehicleId: 'V-102', provider: 'Geico Fleet Advantage', policyNumber: 'GCO-839210-44', expiryDate: '2026-11-20', annualPremium: 2400, coverageDetails: 'Commercial liability, Uninsured Motorist, $2M Limit', isEncrypted: true },
  { id: 'I-303', vehicleId: 'V-103', provider: 'State Farm Business', policyNumber: 'SFB-112394-01', expiryDate: '2026-08-01', annualPremium: 1850, coverageDetails: 'Standard corporate passenger vehicle liability, $500k Limit', isEncrypted: true },
  { id: 'I-304', vehicleId: 'V-104', provider: 'Liberty Mutual Fleet', policyNumber: 'LBM-940251-12', expiryDate: '2026-07-10', annualPremium: 3200, coverageDetails: 'Commercial transport high-mileage van coverage, $2M Limit', isEncrypted: true },
  { id: 'I-305', vehicleId: 'V-105', provider: 'Allstate Commercial', policyNumber: 'ALS-224482-39', expiryDate: '2026-12-05', annualPremium: 1600, coverageDetails: 'Basic corporate sedan coverage, $500k Limit', isEncrypted: true }
];

const initialFuelLogs: FuelLog[] = [
  { id: 'FL-601', vehicleId: 'V-101', driverId: 'D-201', amount: 82.5, cost: 135.20, odometerReading: 41800, date: '2026-06-18' },
  { id: 'FL-602', vehicleId: 'V-103', driverId: 'D-203', amount: 45.0, cost: 78.50, odometerReading: 15150, date: '2026-06-20' },
  { id: 'FL-603', vehicleId: 'V-104', driverId: 'D-204', amount: 110.0, cost: 198.00, odometerReading: 111500, date: '2026-06-15' },
  { id: 'FL-604', vehicleId: 'V-101', driverId: 'D-201', amount: 78.0, cost: 129.50, odometerReading: 42120, date: '2026-06-22' }
];

const initialNotifications: PushNotification[] = [
  { id: 'N-701', title: 'Upcoming Service Due', message: 'Vehicle V-101 is scheduled for Tire Rotation at Apex Auto Service on 2026-06-25.', type: 'service', isRead: false, timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 'N-702', title: 'Insurance Expiry Warning', message: 'Insurance Policy for vehicle V-104 is set to expire in less than 3 weeks (2026-07-10).', type: 'security', isRead: false, timestamp: new Date(Date.now() - 86400000).toISOString() },
  { id: 'N-703', title: 'New Maintenance Task Linked', message: 'Maintenance record M-503 has been successfully linked to Jira Ticket FLEET-852.', type: 'task', isRead: true, timestamp: new Date(Date.now() - 172800000).toISOString() }
];

const initialAuditLogs: AuditLog[] = [
  { id: 1, userRole: 'System', username: 'System Init', action: 'Database Seeded', sqlStatement: 'CREATE DATABASE fleetcore_db; CREATE TABLE vehicles; CREATE TABLE drivers; CREATE TABLE vendors; CREATE TABLE maintenance_records;', timestamp: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: 2, userRole: 'Owner', username: 'navay.laxman@gmail.com', action: 'Assigned Driver D-201 to Vehicle V-101', sqlStatement: "UPDATE vehicles SET driverId = 'D-201' WHERE id = 'V-101';", timestamp: new Date(Date.now() - 3600000 * 4).toISOString() },
  { id: 3, userRole: 'Supervisor', username: 'Supervisor Mode', action: 'Linked Asana Task as_task_129 to M-501', sqlStatement: "UPDATE maintenance_records SET asanaTaskId = 'as_task_129' WHERE id = 'M-501';", timestamp: new Date(Date.now() - 3600000 * 2).toISOString() }
];

const initialSupervisors: Supervisor[] = [
  { id: 'S-401', name: 'Marcus Sterling', email: 'marcus.sterling@fleetcore.io', phone: '+1 (555) 678-1234', status: 'Active', biometricRegistered: true, isApproved: true },
  { id: 'S-402', name: 'Amara Vance', email: 'amara.vance@fleetcore.io', phone: '+1 (555) 789-2345', status: 'Active', biometricRegistered: true, isApproved: true },
  { id: 'S-403', name: 'Tristan Cole', email: 'tristan.cole@fleetcore.io', phone: '+1 (555) 890-3456', status: 'Inactive', biometricRegistered: false, isApproved: false }
];

export class Database {
  private state: DatabaseState;

  constructor() {
    this.state = this.load();
  }

  private load(): DatabaseState {
    let loadedState: DatabaseState;
    if (fs.existsSync(DB_FILE)) {
      try {
        const data = fs.readFileSync(DB_FILE, 'utf-8');
        loadedState = JSON.parse(data);
      } catch (err) {
        console.error("Error reading database file, resetting...", err);
        loadedState = this.getFreshState();
      }
    } else {
      loadedState = this.getFreshState();
    }

    // Ensure backwards compatibility by defining default approvals and fields
    if (!loadedState.supervisors) {
      loadedState.supervisors = [...initialSupervisors];
    }
    loadedState.supervisors.forEach(s => {
      if (s.isApproved === undefined) s.isApproved = true;
    });

    loadedState.vehicles.forEach(v => {
      if (v.isApproved === undefined) v.isApproved = true;
    });
    loadedState.drivers.forEach(d => {
      if (d.isApproved === undefined) d.isApproved = true;
    });
    loadedState.maintenanceRecords.forEach(m => {
      if (m.submittedBy === undefined) m.submittedBy = 'Supervisor';
      if (m.supervisorVerified === undefined) m.supervisorVerified = 'Verified';
      if (m.ownerApproved === undefined) m.ownerApproved = 'Approved';
    });
    if (!loadedState.insurancePolicies) {
      loadedState.insurancePolicies = [];
    }
    loadedState.insurancePolicies.forEach(ip => {
      if (ip.isApproved === undefined) ip.isApproved = true;
      if (ip.supervisorVerified === undefined) ip.supervisorVerified = 'Verified';
      if (ip.ownerApproved === undefined) ip.ownerApproved = 'Approved';
    });

    this.save(loadedState);
    return loadedState;
  }

  private getFreshState(): DatabaseState {
    const state: DatabaseState = {
      vehicles: initialVehicles.map(v => ({ ...v, isApproved: true })),
      drivers: initialDrivers.map(d => ({ ...d, isApproved: true })),
      supervisors: initialSupervisors.map(s => ({ ...s, isApproved: true })),
      vendors: initialVendors,
      maintenanceRecords: initialMaintenance.map(m => ({
        ...m,
        submittedBy: 'Supervisor',
        supervisorVerified: 'Verified',
        ownerApproved: 'Approved'
      })),
      insurancePolicies: initialInsurance.map(policy => ({
        ...policy,
        policyNumber: encryptSensitive(policy.policyNumber),
        coverageDetails: encryptSensitive(policy.coverageDetails),
        isApproved: true,
        supervisorVerified: 'Verified',
        ownerApproved: 'Approved'
      })),
      fuelLogs: initialFuelLogs,
      auditLogs: initialAuditLogs,
      pushNotifications: initialNotifications
    };
    return state;
  }

  private save(stateToSave: DatabaseState = this.state) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(stateToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error("Failed to write to database file", err);
    }
  }

  public getState(): DatabaseState {
    return this.state;
  }

  public getDecryptedPolicies(): InsurancePolicy[] {
    return this.state.insurancePolicies.map(policy => ({
      ...policy,
      policyNumber: decryptSensitive(policy.policyNumber),
      coverageDetails: decryptSensitive(policy.coverageDetails)
    }));
  }

  public writeLog(userRole: string, username: string, action: string, sqlStatement: string) {
    const newLog: AuditLog = {
      id: this.state.auditLogs.length + 1,
      userRole,
      username,
      action,
      sqlStatement,
      timestamp: new Date().toISOString()
    };
    this.state.auditLogs.unshift(newLog); // Newest first
    this.save();
  }

  public addNotification(title: string, message: string, type: 'security' | 'service' | 'task') {
    const newNotif: PushNotification = {
      id: `N-${Math.floor(100 + Math.random() * 900)}`,
      title,
      message,
      type,
      isRead: false,
      timestamp: new Date().toISOString()
    };
    this.state.pushNotifications.unshift(newNotif);
    this.save();
    return newNotif;
  }

  // --- SQL-LIKE RAW QUERY EXECUTION ENGINE FOR THE SQL PLAYGROUND ---
  public executeSql(sql: string, userRole = 'Owner', username = 'navay.laxman@gmail.com'): { columns: string[]; rows: any[]; error?: string } {
    const cleanSql = sql.trim().replace(/;$/, '');
    const selectRegex = /^\s*SELECT\s+(.*?)\s+FROM\s+(\w+)(?:\s+JOIN\s+(\w+)\s+ON\s+([\w.]+)\s*=\s*([\w.]+))?(?:\s+WHERE\s+(.*?))?(?:\s+ORDER\s+BY\s+(.*?))?\s*$/i;
    const insertRegex = /^\s*INSERT\s+INTO\s+(\w+)\s*\((.*?)\)\s*VALUES\s*\((.*?)\)\s*$/i;
    const updateRegex = /^\s*UPDATE\s+(\w+)\s+SET\s+(.*?)(?:\s+WHERE\s+(.*?))?\s*$/i;
    const deleteRegex = /^\s*DELETE\s+FROM\s+(\w+)(?:\s+WHERE\s+(.*?))?\s*$/i;

    try {
      if (selectRegex.test(cleanSql)) {
        const match = cleanSql.match(selectRegex);
        if (!match) throw new Error("Invalid SELECT syntax");

        const fieldsStr = match[1].trim();
        const primaryTable = match[2].trim().toLowerCase();
        const joinTable = match[3] ? match[3].trim().toLowerCase() : null;
        const joinLeft = match[4] ? match[4].trim() : null;
        const joinRight = match[5] ? match[5].trim() : null;
        const whereClause = match[6] ? match[6].trim() : null;
        const orderByClause = match[7] ? match[7].trim() : null;

        // Resolve table records
        let records: any[] = [];
        if (primaryTable === 'vehicles') records = JSON.parse(JSON.stringify(this.state.vehicles));
        else if (primaryTable === 'drivers') records = JSON.parse(JSON.stringify(this.state.drivers));
        else if (primaryTable === 'vendors') records = JSON.parse(JSON.stringify(this.state.vendors));
        else if (primaryTable === 'maintenance_records' || primaryTable === 'maintenance') records = JSON.parse(JSON.stringify(this.state.maintenanceRecords));
        else if (primaryTable === 'insurance_policies' || primaryTable === 'insurance') records = JSON.parse(JSON.stringify(this.getDecryptedPolicies()));
        else if (primaryTable === 'fuel_logs') records = JSON.parse(JSON.stringify(this.state.fuelLogs));
        else if (primaryTable === 'audit_logs') records = JSON.parse(JSON.stringify(this.state.auditLogs));
        else if (primaryTable === 'push_notifications') records = JSON.parse(JSON.stringify(this.state.pushNotifications));
        else {
          throw new Error(`Table '${primaryTable}' not found in database.`);
        }

        // Handle JOIN
        if (joinTable) {
          let joinRecords: any[] = [];
          if (joinTable === 'vehicles') joinRecords = JSON.parse(JSON.stringify(this.state.vehicles));
          else if (joinTable === 'drivers') joinRecords = JSON.parse(JSON.stringify(this.state.drivers));
          else if (joinTable === 'vendors') joinRecords = JSON.parse(JSON.stringify(this.state.vendors));
          else if (joinTable === 'maintenance_records') joinRecords = JSON.parse(JSON.stringify(this.state.maintenanceRecords));
          else if (joinTable === 'insurance_policies') joinRecords = JSON.parse(JSON.stringify(this.getDecryptedPolicies()));
          else if (joinTable === 'fuel_logs') joinRecords = JSON.parse(JSON.stringify(this.state.fuelLogs));
          else {
            throw new Error(`Join table '${joinTable}' not found.`);
          }

          const primaryKey = joinLeft?.split('.')[1] || '';
          const foreignKey = joinRight?.split('.')[1] || '';

          records = records.map(pRec => {
            const matchRec = joinRecords.find(jRec => jRec[foreignKey] === pRec[primaryKey] || jRec[primaryKey] === pRec[foreignKey]);
            if (matchRec) {
              // Merge matching keys, prefixing with table names to avoid collision in columns if needed
              const merged: any = { ...pRec };
              Object.keys(matchRec).forEach(k => {
                if (merged[k] === undefined) {
                  merged[k] = matchRec[k];
                } else {
                  merged[`${joinTable}_${k}`] = matchRec[k];
                }
              });
              return merged;
            }
            return pRec;
          });
        }

        // Handle WHERE
        if (whereClause) {
          // Parse simple column = value or column LIKE value
          const whereMatch = whereClause.match(/(\w+)\s*(=\s*|like\s*)\s*['"]?(.*?)['"]?$/i);
          if (whereMatch) {
            const col = whereMatch[1];
            const op = whereMatch[2].trim().toLowerCase();
            const val = whereMatch[3].trim();

            records = records.filter(rec => {
              const recVal = String(rec[col] !== undefined ? rec[col] : '').toLowerCase();
              if (op === '=') {
                return recVal === val.toLowerCase();
              } else if (op === 'like') {
                const search = val.replace(/%/g, '');
                return recVal.includes(search.toLowerCase());
              }
              return true;
            });
          }
        }

        // Handle ORDER BY
        if (orderByClause) {
          const parts = orderByClause.split(/\s+/);
          const col = parts[0];
          const dir = parts[1] ? parts[1].toLowerCase() : 'asc';
          records.sort((a, b) => {
            const valA = a[col];
            const valB = b[col];
            if (typeof valA === 'number' && typeof valB === 'number') {
              return dir === 'desc' ? valB - valA : valA - valB;
            }
            return dir === 'desc'
              ? String(valB).localeCompare(String(valA))
              : String(valA).localeCompare(String(valB));
          });
        }

        // Extract Columns
        let columns: string[] = [];
        if (records.length > 0) {
          if (fieldsStr === '*') {
            columns = Object.keys(records[0]);
          } else {
            columns = fieldsStr.split(',').map(f => f.trim());
          }
        } else {
          columns = fieldsStr === '*' ? ['id'] : fieldsStr.split(',').map(f => f.trim());
        }

        // Project Fields
        const rows = records.map(rec => {
          const projected: any = {};
          columns.forEach(col => {
            projected[col] = rec[col] !== undefined ? rec[col] : null;
          });
          return projected;
        });

        this.writeLog(userRole, username, 'Executed SQL SELECT', cleanSql);
        return { columns, rows };
      }

      if (insertRegex.test(cleanSql)) {
        const match = cleanSql.match(insertRegex);
        if (!match) throw new Error("Invalid INSERT syntax");
        const table = match[1].toLowerCase();
        const fields = match[2].split(',').map(f => f.trim());
        const values = match[3].split(',').map(v => v.trim().replace(/^['"]|['"]$/g, ''));

        const newRecord: any = {};
        fields.forEach((field, idx) => {
          const val = values[idx];
          // Simple parsing
          if (val === 'null') newRecord[field] = null;
          else if (!isNaN(Number(val))) newRecord[field] = Number(val);
          else if (val === 'true') newRecord[field] = true;
          else if (val === 'false') newRecord[field] = false;
          else newRecord[field] = val;
        });

        if (table === 'vehicles') {
          this.state.vehicles.push(newRecord as Vehicle);
        } else if (table === 'drivers') {
          this.state.drivers.push(newRecord as Driver);
        } else if (table === 'vendors') {
          this.state.vendors.push(newRecord as Vendor);
        } else if (table === 'maintenance_records') {
          this.state.maintenanceRecords.push(newRecord as MaintenanceRecord);
        } else if (table === 'fuel_logs') {
          this.state.fuelLogs.push(newRecord as FuelLog);
        } else {
          throw new Error(`Table '${table}' does not support ad-hoc SQL INSERT in this simulator.`);
        }

        this.save();
        this.writeLog(userRole, username, `Ad-hoc SQL Insert into ${table}`, cleanSql);
        return { columns: ['status', 'message'], rows: [[{ status: 'Success', message: `Successfully inserted 1 record into ${table}` }]] };
      }

      if (updateRegex.test(cleanSql)) {
        const match = cleanSql.match(updateRegex);
        if (!match) throw new Error("Invalid UPDATE syntax");
        const table = match[1].toLowerCase();
        const setsStr = match[2];
        const whereClause = match[3] ? match[3].trim() : null;

        // Extract updates
        const updates: any = {};
        setsStr.split(',').forEach(set => {
          const parts = set.split('=');
          if (parts.length === 2) {
            const field = parts[0].trim();
            const val = parts[1].trim().replace(/^['"]|['"]$/g, '');
            if (val === 'null') updates[field] = null;
            else if (!isNaN(Number(val))) updates[field] = Number(val);
            else if (val === 'true') updates[field] = true;
            else if (val === 'false') updates[field] = false;
            else updates[field] = val;
          }
        });

        let targetList: any[] = [];
        if (table === 'vehicles') targetList = this.state.vehicles;
        else if (table === 'drivers') targetList = this.state.drivers;
        else if (table === 'vendors') targetList = this.state.vendors;
        else if (table === 'maintenance_records') targetList = this.state.maintenanceRecords;
        else {
          throw new Error(`Table '${table}' does not support ad-hoc SQL UPDATE.`);
        }

        let updatedCount = 0;
        targetList.forEach(rec => {
          let matches = true;
          if (whereClause) {
            const wParts = whereClause.split('=');
            if (wParts.length === 2) {
              const col = wParts[0].trim();
              const val = wParts[1].trim().replace(/^['"]|['"]$/g, '');
              matches = String(rec[col]) === val;
            }
          }
          if (matches) {
            Object.assign(rec, updates);
            updatedCount++;
          }
        });

        this.save();
        this.writeLog(userRole, username, `Ad-hoc SQL Update ${table}`, cleanSql);
        return { columns: ['status', 'rows_affected'], rows: [[{ status: 'Success', rows_affected: updatedCount }]] };
      }

      throw new Error("Syntax Error or SQL command not supported in this dashboard simulator. Please use SELECT, INSERT, or UPDATE statements.");
    } catch (e: any) {
      return { columns: ['error'], rows: [], error: e.message || "Unknown database error" };
    }
  }

  // --- ACTIONS DIRECTLY VIA ENDPOINTS (ALIGNED WITH SQL REPLICAS) ---
  public updateVehicleGPS(id: string, lat: number, lng: number, speed: number, fuelDec: number) {
    const v = this.state.vehicles.find(veh => veh.id === id);
    if (v) {
      v.latitude = parseFloat(lat.toFixed(6));
      v.longitude = parseFloat(lng.toFixed(6));
      v.speed = Math.round(speed);
      v.fuelLevel = Math.max(0, Math.min(100, Math.round(v.fuelLevel - fuelDec)));
      v.odometer += parseFloat((speed * 0.005).toFixed(2)); // Increment odometer based on simulated travel

      const sql = `UPDATE vehicles SET latitude = ${v.latitude}, longitude = ${v.longitude}, speed = ${v.speed}, fuelLevel = ${v.fuelLevel}, odometer = ${v.odometer.toFixed(2)} WHERE id = '${id}';`;
      this.writeLog('Driver', 'GPS Tracker Simulation', `Updated Vehicle ${id} GPS Coordinates`, sql);
      this.save();
    }
    return v;
  }

  public scheduleMaintenance(vehicleId: string, vendorId: string, serviceType: string, cost: number, scheduledDate: string, notes: string) {
    const id = `M-${Math.floor(500 + Math.random() * 500)}`;
    const record: MaintenanceRecord = {
      id,
      vehicleId,
      vendorId,
      serviceType,
      status: 'Scheduled',
      cost,
      scheduledDate,
      completedDate: null,
      notes,
      jiraIssueKey: null,
      asanaTaskId: null
    };
    this.state.maintenanceRecords.unshift(record);

    const sql = `INSERT INTO maintenance_records (id, vehicleId, vendorId, serviceType, status, cost, scheduledDate) VALUES ('${id}', '${vehicleId}', '${vendorId}', '${serviceType}', 'Scheduled', ${cost}, '${scheduledDate}');`;
    this.writeLog('Supervisor', 'Fleet Planner', `Scheduled Service for ${vehicleId}`, sql);
    this.save();
    return record;
  }

  public updateMaintenanceStatus(id: string, status: 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue', cost?: number, completedDate?: string | null, jira?: string | null, asana?: string | null) {
    const record = this.state.maintenanceRecords.find(m => m.id === id);
    if (record) {
      record.status = status;
      if (cost !== undefined) record.cost = cost;
      if (completedDate !== undefined) record.completedDate = completedDate;
      if (jira !== undefined) record.jiraIssueKey = jira;
      if (asana !== undefined) record.asanaTaskId = asana;

      const sql = `UPDATE maintenance_records SET status = '${status}', cost = ${record.cost}, completedDate = ${completedDate ? `'${completedDate}'` : 'NULL'} WHERE id = '${id}';`;
      this.writeLog('Supervisor', 'Service Manager', `Updated Service ${id} to ${status}`, sql);
      this.save();
    }
    return record;
  }

  public linkThirdParty(id: string, platform: 'jira' | 'asana', key: string) {
    const record = this.state.maintenanceRecords.find(m => m.id === id);
    if (record) {
      if (platform === 'jira') record.jiraIssueKey = key;
      if (platform === 'asana') record.asanaTaskId = key;

      const sql = `UPDATE maintenance_records SET ${platform === 'jira' ? 'jiraIssueKey' : 'asanaTaskId'} = '${key}' WHERE id = '${id}';`;
      this.writeLog('Supervisor', 'Integration Manager', `Linked Service ${id} to ${platform.toUpperCase()} (${key})`, sql);
      this.save();
    }
    return record;
  }

  public addFuelLog(vehicleId: string, driverId: string, amount: number, cost: number, odometer: number) {
    const id = `FL-${Math.floor(600 + Math.random() * 400)}`;
    const log: FuelLog = {
      id,
      vehicleId,
      driverId,
      amount,
      cost,
      odometerReading: odometer,
      date: new Date().toISOString().split('T')[0]
    };
    this.state.fuelLogs.unshift(log);

    // Update vehicle's fuel level back to 100% and update odometer
    const v = this.state.vehicles.find(veh => veh.id === vehicleId);
    if (v) {
      v.fuelLevel = 100;
      v.odometer = odometer;
    }

    const sqlLog = `INSERT INTO fuel_logs (id, vehicleId, driverId, amount, cost, odometerReading) VALUES ('${id}', '${vehicleId}', '${driverId}', ${amount}, ${cost}, ${odometer});`;
    this.writeLog('Driver', driverId, `Logged Fuel Receipt for Vehicle ${vehicleId}`, sqlLog);
    this.save();
    return log;
  }

  public toggleBiometrics(driverId: string, enable: boolean) {
    const driver = this.state.drivers.find(d => d.id === driverId);
    if (driver) {
      driver.biometricRegistered = enable;
      const sql = `UPDATE drivers SET biometricRegistered = ${enable ? 1 : 0} WHERE id = '${driverId}';`;
      this.writeLog('Driver', driverId, `Toggled Biometric Authentication to ${enable}`, sql);
      this.save();
    }
    return driver;
  }

  public createDriver(name: string, email: string, phone: string, license: string) {
    const id = `D-${Math.floor(205 + Math.random() * 95)}`;
    const driver: Driver = {
      id,
      name,
      email,
      phone,
      licenseNumber: license,
      status: 'Off Duty',
      rating: 5.0,
      activeVehicleId: null,
      biometricRegistered: false
    };
    this.state.drivers.push(driver);

    const sql = `INSERT INTO drivers (id, name, email, phone, licenseNumber, status) VALUES ('${id}', '${name}', '${email}', '${phone}', '${license}', 'Off Duty');`;
    this.writeLog('Owner', 'navay.laxman@gmail.com', `Created Driver ${name}`, sql);
    this.save();
    return driver;
  }

  public createVehicle(plate: string, make: string, model: string, year: number, type: 'Truck' | 'Van' | 'Sedan' | 'SUV') {
    const id = `V-${Math.floor(106 + Math.random() * 94)}`;
    const vehicle: Vehicle = {
      id,
      plate,
      make,
      model,
      year,
      type,
      status: 'Active',
      odometer: 0,
      fuelLevel: 100,
      speed: 0,
      latitude: 37.7749,
      longitude: -122.4194,
      driverId: null,
      insuranceId: `I-${Math.floor(306 + Math.random() * 94)}`
    };
    this.state.vehicles.push(vehicle);

    // Auto-create basic insurance policy
    const policy: InsurancePolicy = {
      id: vehicle.insuranceId!,
      vehicleId: id,
      provider: 'Corporate Default Policy',
      policyNumber: encryptSensitive(`POL-${Math.floor(100000 + Math.random() * 900000)}`),
      expiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
      annualPremium: 2000,
      coverageDetails: encryptSensitive('Comprehensive corporate liability coverage'),
      isEncrypted: true
    };
    this.state.insurancePolicies.push(policy);

    const sqlVeh = `INSERT INTO vehicles (id, plate, make, model, year, type, status) VALUES ('${id}', '${plate}', '${make}', '${model}', ${year}, '${type}', 'Active');`;
    this.writeLog('Owner', 'navay.laxman@gmail.com', `Registered New Vehicle ${id}`, sqlVeh);
    this.save();
    return vehicle;
  }

  public createVendor(name: string, contact: string, phone: string, email: string, services: string[], address: string) {
    const id = `VN-${Math.floor(404 + Math.random() * 96)}`;
    const vendor: Vendor = {
      id,
      name,
      contactPerson: contact,
      phone,
      email,
      services,
      rating: 5.0,
      address
    };
    this.state.vendors.push(vendor);

    const sql = `INSERT INTO vendors (id, name, contactPerson, phone, email, address) VALUES ('${id}', '${name}', '${contact}', '${phone}', '${email}', '${address}');`;
    this.writeLog('Supervisor', 'Fleet Admin', `Registered Maintenance Vendor ${name}`, sql);
    this.save();
    return vendor;
  }

  // --- WORKFLOW: OWNER / SUPERVISOR / DRIVER SECURE AUDITED PROCESSES ---

  // 1. Driver adds service record
  public driverAddServiceRecord(vehicleId: string, vendorId: string, serviceType: string, cost: number, scheduledDate: string, notes: string) {
    const id = `M-${Math.floor(500 + Math.random() * 500)}`;
    const record: MaintenanceRecord = {
      id,
      vehicleId,
      vendorId,
      serviceType,
      status: 'Scheduled',
      cost,
      scheduledDate,
      completedDate: null,
      notes,
      jiraIssueKey: null,
      asanaTaskId: null,
      submittedBy: 'Driver',
      supervisorVerified: 'Pending',
      ownerApproved: 'Pending'
    };
    this.state.maintenanceRecords.unshift(record);

    const sql = `INSERT INTO maintenance_records (id, vehicleId, vendorId, serviceType, status, cost, scheduledDate, submittedBy, supervisorVerified, ownerApproved) VALUES ('${id}', '${vehicleId}', '${vendorId}', '${serviceType}', 'Scheduled', ${cost}, '${scheduledDate}', 'Driver', 'Pending', 'Pending');`;
    this.writeLog('Driver', 'Service Portal', `Driver Added Service for ${vehicleId}`, sql);
    this.save();
    return record;
  }

  // 2. Driver proposes modification of service record
  public driverModifyServiceRecord(id: string, serviceType: string, cost: number, scheduledDate: string, notes: string) {
    const record = this.state.maintenanceRecords.find(m => m.id === id);
    if (record) {
      record.pendingChanges = {
        serviceType,
        cost,
        scheduledDate,
        notes
      };
      record.supervisorVerified = 'Pending';
      record.ownerApproved = 'Pending';

      const sql = `UPDATE maintenance_records SET supervisorVerified = 'Pending', ownerApproved = 'Pending', pendingChanges = '{"serviceType":"${serviceType}","cost":${cost},"scheduledDate":"${scheduledDate}","notes":"${notes}"}' WHERE id = '${id}';`;
      this.writeLog('Driver', 'Service Portal', `Driver Proposed Modification for Service ${id}`, sql);
      this.save();
    }
    return record;
  }

  // 3. Supervisor verifies driver addition or modification
  public supervisorVerifyServiceRecord(id: string, verified: boolean) {
    const record = this.state.maintenanceRecords.find(m => m.id === id);
    if (record) {
      record.supervisorVerified = verified ? 'Verified' : 'Rejected';
      if (!verified) {
        record.ownerApproved = 'Rejected';
      }

      const sql = `UPDATE maintenance_records SET supervisorVerified = '${record.supervisorVerified}'${!verified ? ", ownerApproved = 'Rejected'" : ''} WHERE id = '${id}';`;
      this.writeLog('Supervisor', 'Verification Desk', `Supervisor ${verified ? 'Verified' : 'Rejected'} Service ${id}`, sql);
      this.save();
    }
    return record;
  }

  // 4. Supervisor adds vehicle
  public supervisorAddVehicle(plate: string, make: string, model: string, year: number, type: 'Truck' | 'Van' | 'Sedan' | 'SUV') {
    const id = `V-${Math.floor(106 + Math.random() * 94)}`;
    const vehicle: Vehicle = {
      id,
      plate,
      make,
      model,
      year,
      type,
      status: 'Active',
      odometer: 0,
      fuelLevel: 100,
      speed: 0,
      latitude: 37.7749,
      longitude: -122.4194,
      driverId: null,
      insuranceId: `I-${Math.floor(306 + Math.random() * 94)}`,
      isApproved: false
    };
    this.state.vehicles.push(vehicle);

    const policy: InsurancePolicy = {
      id: vehicle.insuranceId!,
      vehicleId: id,
      provider: 'Corporate Default Policy',
      policyNumber: encryptSensitive(`POL-${Math.floor(100000 + Math.random() * 900000)}`),
      expiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
      annualPremium: 2000,
      coverageDetails: encryptSensitive('Comprehensive corporate liability coverage'),
      isEncrypted: true
    };
    this.state.insurancePolicies.push(policy);

    const sqlVeh = `INSERT INTO vehicles (id, plate, make, model, year, type, status, isApproved) VALUES ('${id}', '${plate}', '${make}', '${model}', ${year}, '${type}', 'Active', false);`;
    this.writeLog('Supervisor', 'Asset Desk', `Supervisor Registered New Vehicle ${id} (Pending Owner Approval)`, sqlVeh);
    this.save();
    return vehicle;
  }

  // 5. Supervisor modifies vehicle
  public supervisorModifyVehicle(id: string, plate: string, make: string, model: string, year: number, type: 'Truck' | 'Van' | 'Sedan' | 'SUV') {
    const v = this.state.vehicles.find(veh => veh.id === id);
    if (v) {
      v.pendingChanges = {
        plate,
        make,
        model,
        year,
        type
      };
      v.isApproved = false;

      const sql = `UPDATE vehicles SET isApproved = false, pendingChanges = '{"plate":"${plate}","make":"${make}","model":"${model}","year":${year},"type":"${type}"}' WHERE id = '${id}';`;
      this.writeLog('Supervisor', 'Asset Desk', `Supervisor Proposed Modification for Vehicle ${id}`, sql);
      this.save();
    }
    return v;
  }

  // 6. Supervisor adds driver
  public supervisorAddDriver(name: string, email: string, phone: string, license: string, address?: string, pan?: string, aadhar?: string, bankDetails?: string, supervisorId?: string | null) {
    const id = `D-${Math.floor(205 + Math.random() * 95)}`;
    const driver: Driver = {
      id,
      name,
      email,
      phone,
      licenseNumber: license,
      status: 'Off Duty',
      rating: 5.0,
      activeVehicleId: null,
      biometricRegistered: false,
      isApproved: false,
      address,
      pan,
      aadhar,
      bankDetails,
      supervisorId
    };
    this.state.drivers.push(driver);

    const sql = `INSERT INTO drivers (id, name, email, phone, licenseNumber, status, isApproved) VALUES ('${id}', '${name}', '${email}', '${phone}', '${license}', 'Off Duty', false);`;
    this.writeLog('Supervisor', 'Driver Desk', `Supervisor Registered New Driver ${name} (Pending Owner Approval)`, sql);
    this.save();
    return driver;
  }

  // 7. Supervisor assigns driver to a vehicle
  public supervisorAssignDriver(vehicleId: string, driverId: string | null) {
    const v = this.state.vehicles.find(veh => veh.id === vehicleId);
    if (v) {
      v.pendingChanges = {
        ...v.pendingChanges,
        driverId
      };
      v.isApproved = false;

      const sql = `UPDATE vehicles SET isApproved = false, pendingChanges = json_set(pendingChanges, '$.driverId', '${driverId || 'null'}') WHERE id = '${vehicleId}';`;
      this.writeLog('Supervisor', 'Asset Desk', `Supervisor Proposed Driver Assignment for Vehicle ${vehicleId}`, sql);
      this.save();
    }
    return v;
  }

  // 8. Owner approves service record
  public ownerApproveServiceRecord(id: string, approved: boolean) {
    const record = this.state.maintenanceRecords.find(m => m.id === id);
    if (record) {
      record.ownerApproved = approved ? 'Approved' : 'Rejected';
      if (approved) {
        if (record.pendingChanges) {
          Object.assign(record, record.pendingChanges);
          delete record.pendingChanges;
        }
      } else {
        delete record.pendingChanges;
      }
      const sql = `UPDATE maintenance_records SET ownerApproved = '${record.ownerApproved}' WHERE id = '${id}';`;
      this.writeLog('Owner', 'Approval Panel', `Owner ${approved ? 'Approved' : 'Rejected'} Service Record ${id}`, sql);
      this.save();
    }
    return record;
  }

  // 9. Owner approves vehicle additions & modifications
  public ownerApproveVehicle(id: string, approved: boolean) {
    const v = this.state.vehicles.find(veh => veh.id === id);
    if (v) {
      if (approved) {
        v.isApproved = true;
        if (v.pendingChanges) {
          if (v.pendingChanges.driverId !== undefined) {
            // Unassign old driver
            if (v.driverId) {
              const oldD = this.state.drivers.find(drv => drv.id === v.driverId);
              if (oldD) oldD.activeVehicleId = null;
            }
            v.driverId = v.pendingChanges.driverId;
            // Assign new driver
            if (v.driverId) {
              const newD = this.state.drivers.find(drv => drv.id === v.driverId);
              if (newD) newD.activeVehicleId = id;
            }
          }
          Object.assign(v, v.pendingChanges);
          delete v.pendingChanges;
        }
      } else {
        // If it was a new vehicle addition and got rejected, we can optionally remove it or leave it unapproved
        // Let's keep it unapproved to let them re-modify, but clear pendingChanges
        v.isApproved = false;
        delete v.pendingChanges;
      }

      const sql = `UPDATE vehicles SET isApproved = ${approved ? 'true' : 'false'} WHERE id = '${id}';`;
      this.writeLog('Owner', 'Approval Panel', `Owner ${approved ? 'Approved' : 'Rejected'} Vehicle ${id}`, sql);
      this.save();
    }
    return v;
  }

  // 10. Owner approves driver addition
  public ownerApproveDriver(id: string, approved: boolean) {
    const driver = this.state.drivers.find(d => d.id === id);
    if (driver) {
      driver.isApproved = approved;
      const sql = `UPDATE drivers SET isApproved = ${approved ? 'true' : 'false'} WHERE id = '${id}';`;
      this.writeLog('Owner', 'Approval Panel', `Owner ${approved ? 'Approved' : 'Rejected'} Driver ${id}`, sql);
      this.save();
    }
    return driver;
  }

  // --- DIRECT OWNER ACTIONS ---
  public ownerAddDriver(name: string, email: string, phone: string, license: string, status: any, address?: string, pan?: string, aadhar?: string, bankDetails?: string, supervisorId?: string | null) {
    const id = `D-${Math.floor(205 + Math.random() * 95)}`;
    const driver: Driver = {
      id,
      name,
      email,
      phone,
      licenseNumber: license,
      status: status || 'Off Duty',
      rating: 5.0,
      activeVehicleId: null,
      biometricRegistered: false,
      isApproved: true,
      address,
      pan,
      aadhar,
      bankDetails,
      supervisorId
    };
    this.state.drivers.push(driver);
    const sql = `INSERT INTO drivers (id, name, email, phone, licenseNumber, isApproved) VALUES ('${id}', '${name}', '${email}', '${phone}', '${license}', true);`;
    this.writeLog('Owner', 'navay.laxman@gmail.com', `Owner Created & Verified Driver ${name}`, sql);
    this.save();
    return driver;
  }

  public ownerModifyDriver(id: string, updates: Partial<Driver>) {
    const driver = this.state.drivers.find(d => d.id === id);
    if (driver) {
      Object.assign(driver, updates);
      const sql = `UPDATE drivers SET ${Object.entries(updates).map(([k, v]) => `${k} = '${v}'`).join(', ')} WHERE id = '${id}';`;
      this.writeLog('Owner', 'navay.laxman@gmail.com', `Owner Modified Driver ${id}`, sql);
      this.save();
    }
    return driver;
  }

  public ownerDeleteDriver(id: string) {
    const idx = this.state.drivers.findIndex(d => d.id === id);
    if (idx !== -1) {
      const driver = this.state.drivers[idx];
      this.state.drivers.splice(idx, 1);
      const sql = `DELETE FROM drivers WHERE id = '${id}';`;
      this.writeLog('Owner', 'navay.laxman@gmail.com', `Owner Deleted Driver ${driver.name}`, sql);
      this.save();
      return true;
    }
    return false;
  }

  // Supervisor direct management (Owner only)
  public ownerAddSupervisor(name: string, email: string, phone: string, status: 'Active' | 'Inactive', address?: string, pan?: string, aadhar?: string, bankDetails?: string) {
    const id = `S-${Math.floor(803 + Math.random() * 97)}`;
    const supervisor: Supervisor = {
      id,
      name,
      email,
      phone,
      status: status || 'Active',
      biometricRegistered: false,
      isApproved: true,
      address,
      pan,
      aadhar,
      bankDetails
    };
    this.state.supervisors.push(supervisor);
    const sql = `INSERT INTO supervisors (id, name, email, phone, status, isApproved) VALUES ('${id}', '${name}', '${email}', '${phone}', '${status}', true);`;
    this.writeLog('Owner', 'navay.laxman@gmail.com', `Owner Created & Verified Supervisor ${name}`, sql);
    this.save();
    return supervisor;
  }

  public ownerModifySupervisor(id: string, updates: Partial<Supervisor>) {
    const supervisor = this.state.supervisors.find(s => s.id === id);
    if (supervisor) {
      Object.assign(supervisor, updates);
      const sql = `UPDATE supervisors SET ${Object.entries(updates).map(([k, v]) => `${k} = '${v}'`).join(', ')} WHERE id = '${id}';`;
      this.writeLog('Owner', 'navay.laxman@gmail.com', `Owner Modified Supervisor ${id}`, sql);
      this.save();
    }
    return supervisor;
  }

  public ownerDeleteSupervisor(id: string) {
    const idx = this.state.supervisors.findIndex(s => s.id === id);
    if (idx !== -1) {
      const supervisor = this.state.supervisors[idx];
      this.state.supervisors.splice(idx, 1);
      const sql = `DELETE FROM supervisors WHERE id = '${id}';`;
      this.writeLog('Owner', 'navay.laxman@gmail.com', `Owner Deleted Supervisor ${supervisor.name}`, sql);
      this.save();
      return true;
    }
    return false;
  }

  public ownerVerifySupervisor(id: string, approved: boolean) {
    const supervisor = this.state.supervisors.find(s => s.id === id);
    if (supervisor) {
      supervisor.isApproved = approved;
      const sql = `UPDATE supervisors SET isApproved = ${approved ? 'true' : 'false'} WHERE id = '${id}';`;
      this.writeLog('Owner', 'navay.laxman@gmail.com', `Owner ${approved ? 'Approved' : 'Rejected'} Supervisor ${id}`, sql);
      this.save();
    }
    return supervisor;
  }

  // Direct Owner Asset (Vehicle) CRUD
  public ownerAddVehicleDirect(plate: string, make: string, model: string, year: number, type: any, status: any) {
    const id = `V-${Math.floor(106 + Math.random() * 94)}`;
    const vehicle: Vehicle = {
      id,
      plate,
      make,
      model,
      year,
      type,
      status: status || 'Active',
      odometer: 0,
      fuelLevel: 100,
      speed: 0,
      latitude: 37.7749,
      longitude: -122.4194,
      driverId: null,
      insuranceId: `I-${Math.floor(306 + Math.random() * 94)}`,
      isApproved: true
    };
    this.state.vehicles.push(vehicle);

    const policy: InsurancePolicy = {
      id: vehicle.insuranceId!,
      vehicleId: id,
      provider: 'Corporate Default Policy',
      policyNumber: encryptSensitive(`POL-${Math.floor(100000 + Math.random() * 900000)}`),
      expiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
      annualPremium: 2000,
      coverageDetails: encryptSensitive('Comprehensive corporate liability coverage'),
      isEncrypted: true,
      isApproved: true,
      supervisorVerified: 'Verified',
      ownerApproved: 'Approved'
    };
    this.state.insurancePolicies.push(policy);

    const sql = `INSERT INTO vehicles (id, plate, make, model, year, type, isApproved) VALUES ('${id}', '${plate}', '${make}', '${model}', ${year}, '${type}', true);`;
    this.writeLog('Owner', 'navay.laxman@gmail.com', `Owner Registered & Approved Vehicle ${id}`, sql);
    this.save();
    return vehicle;
  }

  public ownerModifyVehicleDirect(id: string, updates: Partial<Vehicle>) {
    const v = this.state.vehicles.find(veh => veh.id === id);
    if (v) {
      Object.assign(v, updates);
      const sql = `UPDATE vehicles SET ${Object.entries(updates).map(([k, v]) => `${k} = '${v}'`).join(', ')} WHERE id = '${id}';`;
      this.writeLog('Owner', 'navay.laxman@gmail.com', `Owner Modified Vehicle ${id}`, sql);
      this.save();
    }
    return v;
  }

  public ownerDeleteVehicle(id: string) {
    const idx = this.state.vehicles.findIndex(v => v.id === id);
    if (idx !== -1) {
      const v = this.state.vehicles[idx];
      this.state.vehicles.splice(idx, 1);
      // Also delete insurance policy associated with it
      if (v.insuranceId) {
        const pIdx = this.state.insurancePolicies.findIndex(p => p.id === v.insuranceId);
        if (pIdx !== -1) this.state.insurancePolicies.splice(pIdx, 1);
      }
      const sql = `DELETE FROM vehicles WHERE id = '${id}';`;
      this.writeLog('Owner', 'navay.laxman@gmail.com', `Owner Deleted Vehicle ${id}`, sql);
      this.save();
      return true;
    }
    return false;
  }

  // Owner Service & Maintenance Direct CRUD
  public ownerAddMaintenanceRecordDirect(vehicleId: string, vendorId: string, serviceType: string, cost: number, scheduledDate: string, notes: string) {
    const id = `M-${Math.floor(500 + Math.random() * 500)}`;
    const record: MaintenanceRecord = {
      id,
      vehicleId,
      vendorId,
      serviceType,
      status: 'Scheduled',
      cost,
      scheduledDate,
      completedDate: null,
      notes,
      jiraIssueKey: null,
      asanaTaskId: null,
      submittedBy: 'Supervisor',
      supervisorVerified: 'Verified',
      ownerApproved: 'Approved'
    };
    this.state.maintenanceRecords.unshift(record);
    const sql = `INSERT INTO maintenance_records (id, vehicleId, serviceType, cost, ownerApproved) VALUES ('${id}', '${vehicleId}', '${serviceType}', ${cost}, 'Approved');`;
    this.writeLog('Owner', 'navay.laxman@gmail.com', `Owner Created Maintenance Record ${id}`, sql);
    this.save();
    return record;
  }

  public ownerModifyMaintenanceRecord(id: string, updates: Partial<MaintenanceRecord>) {
    const record = this.state.maintenanceRecords.find(m => m.id === id);
    if (record) {
      Object.assign(record, updates);
      const sql = `UPDATE maintenance_records SET ${Object.entries(updates).map(([k, v]) => `${k} = '${v}'`).join(', ')} WHERE id = '${id}';`;
      this.writeLog('Owner', 'navay.laxman@gmail.com', `Owner Modified Maintenance Record ${id}`, sql);
      this.save();
    }
    return record;
  }

  public ownerDeleteMaintenanceRecord(id: string) {
    const idx = this.state.maintenanceRecords.findIndex(m => m.id === id);
    if (idx !== -1) {
      this.state.maintenanceRecords.splice(idx, 1);
      const sql = `DELETE FROM maintenance_records WHERE id = '${id}';`;
      this.writeLog('Owner', 'navay.laxman@gmail.com', `Owner Deleted Maintenance Record ${id}`, sql);
      this.save();
      return true;
    }
    return false;
  }

  // Owner Insurance Policy CRUD
  public ownerAddInsurancePolicy(vehicleId: string, provider: string, policyNumber: string, expiryDate: string, annualPremium: number, coverageDetails: string) {
    const id = `I-${Math.floor(306 + Math.random() * 94)}`;
    const policy: InsurancePolicy = {
      id,
      vehicleId,
      provider,
      policyNumber: encryptSensitive(policyNumber),
      expiryDate,
      annualPremium,
      coverageDetails: encryptSensitive(coverageDetails),
      isEncrypted: true,
      isApproved: true,
      supervisorVerified: 'Verified',
      ownerApproved: 'Approved'
    };
    this.state.insurancePolicies.push(policy);
    // Link to vehicle if vehicle exists
    const v = this.state.vehicles.find(veh => veh.id === vehicleId);
    if (v) v.insuranceId = id;

    const sql = `INSERT INTO insurance_policies (id, vehicleId, provider, isApproved) VALUES ('${id}', '${vehicleId}', '${provider}', true);`;
    this.writeLog('Owner', 'navay.laxman@gmail.com', `Owner Created Insurance Policy ${id}`, sql);
    this.save();
    return policy;
  }

  public ownerModifyInsurancePolicy(id: string, updates: Partial<InsurancePolicy>) {
    const policy = this.state.insurancePolicies.find(ip => ip.id === id);
    if (policy) {
      if (updates.policyNumber) updates.policyNumber = encryptSensitive(updates.policyNumber);
      if (updates.coverageDetails) updates.coverageDetails = encryptSensitive(updates.coverageDetails);
      Object.assign(policy, updates);
      const sql = `UPDATE insurance_policies SET ${Object.entries(updates).map(([k, v]) => `${k} = '${v}'`).join(', ')} WHERE id = '${id}';`;
      this.writeLog('Owner', 'navay.laxman@gmail.com', `Owner Modified Insurance Policy ${id}`, sql);
      this.save();
    }
    return policy;
  }

  public ownerDeleteInsurancePolicy(id: string) {
    const idx = this.state.insurancePolicies.findIndex(ip => ip.id === id);
    if (idx !== -1) {
      const p = this.state.insurancePolicies[idx];
      this.state.insurancePolicies.splice(idx, 1);
      // Unlink from vehicle
      const v = this.state.vehicles.find(veh => veh.insuranceId === id);
      if (v) v.insuranceId = null;
      const sql = `DELETE FROM insurance_policies WHERE id = '${id}';`;
      this.writeLog('Owner', 'navay.laxman@gmail.com', `Owner Deleted Insurance Policy ${id}`, sql);
      this.save();
      return true;
    }
    return false;
  }

  public ownerApproveInsurancePolicy(id: string, approved: boolean) {
    const policy = this.state.insurancePolicies.find(ip => ip.id === id);
    if (policy) {
      policy.ownerApproved = approved ? 'Approved' : 'Rejected';
      policy.isApproved = approved;
      if (approved && policy.pendingChanges) {
        Object.assign(policy, policy.pendingChanges);
        delete policy.pendingChanges;
      } else {
        delete policy.pendingChanges;
      }
      const sql = `UPDATE insurance_policies SET ownerApproved = '${policy.ownerApproved}', isApproved = ${approved} WHERE id = '${id}';`;
      this.writeLog('Owner', 'navay.laxman@gmail.com', `Owner ${approved ? 'Approved' : 'Rejected'} Insurance Policy ${id}`, sql);
      this.save();
    }
    return policy;
  }

  // --- DIRECT SUPERVISOR ACTIONS ---
  // Supervisors can Add, Modify, Verify (No Delete, No Drivers/Supervisors)
  public supervisorAddInsurancePolicy(vehicleId: string, provider: string, policyNumber: string, expiryDate: string, annualPremium: number, coverageDetails: string) {
    const id = `I-${Math.floor(306 + Math.random() * 94)}`;
    const policy: InsurancePolicy = {
      id,
      vehicleId,
      provider,
      policyNumber: encryptSensitive(policyNumber),
      expiryDate,
      annualPremium,
      coverageDetails: encryptSensitive(coverageDetails),
      isEncrypted: true,
      isApproved: false,
      supervisorVerified: 'Verified',
      ownerApproved: 'Pending'
    };
    this.state.insurancePolicies.push(policy);
    const sql = `INSERT INTO insurance_policies (id, vehicleId, provider, isApproved, supervisorVerified, ownerApproved) VALUES ('${id}', '${vehicleId}', '${provider}', false, 'Verified', 'Pending');`;
    this.writeLog('Supervisor', 'Service Manager', `Supervisor Created Insurance Policy ${id} (Pending Owner Approval)`, sql);
    this.save();
    return policy;
  }

  public supervisorModifyInsurancePolicy(id: string, updates: Partial<InsurancePolicy>) {
    const policy = this.state.insurancePolicies.find(ip => ip.id === id);
    if (policy) {
      policy.pendingChanges = {
        ...policy.pendingChanges,
        ...updates
      };
      if (updates.policyNumber) policy.pendingChanges.policyNumber = encryptSensitive(updates.policyNumber);
      if (updates.coverageDetails) policy.pendingChanges.coverageDetails = encryptSensitive(updates.coverageDetails);
      policy.isApproved = false;
      policy.supervisorVerified = 'Verified';
      policy.ownerApproved = 'Pending';
      const sql = `UPDATE insurance_policies SET isApproved = false, supervisorVerified = 'Verified', ownerApproved = 'Pending' WHERE id = '${id}';`;
      this.writeLog('Supervisor', 'Service Manager', `Supervisor Proposed Modifications for Insurance Policy ${id}`, sql);
      this.save();
    }
    return policy;
  }

  public supervisorVerifyInsurancePolicy(id: string, verified: boolean) {
    const policy = this.state.insurancePolicies.find(ip => ip.id === id);
    if (policy) {
      policy.supervisorVerified = verified ? 'Verified' : 'Rejected';
      if (!verified) policy.ownerApproved = 'Rejected';
      const sql = `UPDATE insurance_policies SET supervisorVerified = '${policy.supervisorVerified}' WHERE id = '${id}';`;
      this.writeLog('Supervisor', 'Service Manager', `Supervisor ${verified ? 'Verified' : 'Rejected'} Insurance Policy ${id}`, sql);
      this.save();
    }
    return policy;
  }

  public supervisorVerifyVehicle(id: string, verified: boolean) {
    const v = this.state.vehicles.find(veh => veh.id === id);
    if (v) {
      (v as any).supervisorVerified = verified ? 'Verified' : 'Rejected';
      if (!verified) v.isApproved = false;
      const sql = `UPDATE vehicles SET supervisorVerified = '${verified ? 'Verified' : 'Rejected'}' WHERE id = '${id}';`;
      this.writeLog('Supervisor', 'Asset Desk', `Supervisor ${verified ? 'Verified' : 'Rejected'} Vehicle ${id}`, sql);
      this.save();
    }
    return v;
  }
}

export const db = new Database();
export default db;
