import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/db.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/db-state', (req, res) => {
    try {
      const state = db.getState();
      const decryptedPolicies = db.getDecryptedPolicies();
      res.json({
        ...state,
        insurancePolicies: decryptedPolicies
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Database fetch error" });
    }
  });

  app.post('/api/sql', (req, res) => {
    const { sql, role, username } = req.body;
    if (!sql) {
      return res.status(400).json({ error: "SQL query string is required" });
    }
    const result = db.executeSql(sql, role || 'Owner', username || 'navay.laxman@gmail.com');
    res.json(result);
  });

  app.post('/api/gps-update', (req, res) => {
    const { id, latitude, longitude, speed, fuelDec } = req.body;
    if (!id || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: "Missing required GPS parameters" });
    }
    const updated = db.updateVehicleGPS(id, latitude, longitude, speed || 0, fuelDec || 0);
    res.json(updated);
  });

  app.post('/api/maintenance/schedule', (req, res) => {
    const { vehicleId, vendorId, serviceType, cost, scheduledDate, notes } = req.body;
    if (!vehicleId || !vendorId || !serviceType || !scheduledDate) {
      return res.status(400).json({ error: "Missing parameters for scheduling maintenance" });
    }
    const record = db.scheduleMaintenance(vehicleId, vendorId, serviceType, Number(cost || 0), scheduledDate, notes || '');
    res.json(record);
  });

  app.put('/api/maintenance/status', (req, res) => {
    const { id, status, cost, completedDate, jiraIssueKey, asanaTaskId } = req.body;
    if (!id || !status) {
      return res.status(400).json({ error: "ID and status are required" });
    }
    const updated = db.updateMaintenanceStatus(id, status, cost, completedDate, jiraIssueKey, asanaTaskId);
    res.json(updated);
  });

  app.post('/api/maintenance/link', (req, res) => {
    const { id, platform, key } = req.body;
    if (!id || !platform || !key) {
      return res.status(400).json({ error: "ID, platform (jira/asana), and key are required" });
    }
    const updated = db.linkThirdParty(id, platform, key);
    res.json(updated);
  });

  app.post('/api/fuel/log', (req, res) => {
    const { vehicleId, driverId, amount, cost, odometer } = req.body;
    if (!vehicleId || !driverId || !amount || !cost || !odometer) {
      return res.status(400).json({ error: "All fuel log parameters are required" });
    }
    const logged = db.addFuelLog(vehicleId, driverId, Number(amount), Number(cost), Number(odometer));
    res.json(logged);
  });

  app.post('/api/driver/biometrics', (req, res) => {
    const { driverId, enable } = req.body;
    if (!driverId) {
      return res.status(400).json({ error: "Driver ID is required" });
    }
    const updated = db.toggleBiometrics(driverId, !!enable);
    res.json(updated);
  });

  app.post('/api/driver/create', (req, res) => {
    const { name, email, phone, license } = req.body;
    if (!name || !email || !license) {
      return res.status(400).json({ error: "Name, email, and license are required" });
    }
    const driver = db.createDriver(name, email, phone || '', license);
    res.json(driver);
  });

  app.post('/api/vehicle/create', (req, res) => {
    const { plate, make, model, year, type } = req.body;
    if (!plate || !make || !model || !year || !type) {
      return res.status(400).json({ error: "All vehicle specs are required" });
    }
    const vehicle = db.createVehicle(plate, make, model, Number(year), type);
    res.json(vehicle);
  });

  // --- NEW AUDITED WORKFLOW ROUTES ---

  // Driver adding/modifying service record
  app.post('/api/maintenance/driver-add', (req, res) => {
    const { vehicleId, vendorId, serviceType, cost, scheduledDate, notes } = req.body;
    if (!vehicleId || !vendorId || !serviceType || !scheduledDate) {
      return res.status(400).json({ error: "Missing required parameters to log service request." });
    }
    const record = db.driverAddServiceRecord(vehicleId, vendorId, serviceType, Number(cost || 0), scheduledDate, notes || '');
    res.json(record);
  });

  app.post('/api/maintenance/driver-modify', (req, res) => {
    const { id, serviceType, cost, scheduledDate, notes } = req.body;
    if (!id || !serviceType || !scheduledDate) {
      return res.status(400).json({ error: "ID, Service Type, and Scheduled Date are required." });
    }
    const record = db.driverModifyServiceRecord(id, serviceType, Number(cost || 0), scheduledDate, notes || '');
    res.json(record);
  });

  // Supervisor verifying service record
  app.post('/api/maintenance/supervisor-verify', (req, res) => {
    const { id, verified } = req.body;
    if (!id || verified === undefined) {
      return res.status(400).json({ error: "ID and verified status are required." });
    }
    const record = db.supervisorVerifyServiceRecord(id, !!verified);
    res.json(record);
  });

  // Supervisor adding/modifying vehicle
  app.post('/api/vehicle/supervisor-add', (req, res) => {
    const { plate, make, model, year, type } = req.body;
    if (!plate || !make || !model || !year || !type) {
      return res.status(400).json({ error: "All vehicle specs are required." });
    }
    const vehicle = db.supervisorAddVehicle(plate, make, model, Number(year), type);
    res.json(vehicle);
  });

  app.post('/api/vehicle/supervisor-modify', (req, res) => {
    const { id, plate, make, model, year, type } = req.body;
    if (!id || !plate || !make || !model || !year || !type) {
      return res.status(400).json({ error: "All vehicle specs and ID are required." });
    }
    const vehicle = db.supervisorModifyVehicle(id, plate, make, model, Number(year), type);
    res.json(vehicle);
  });

  // Supervisor adding/assigning driver
  app.post('/api/driver/supervisor-add', (req, res) => {
    const { name, email, phone, license, address, pan, aadhar, bankDetails, supervisorId } = req.body;
    if (!name || !email || !license) {
      return res.status(400).json({ error: "Name, email, and license are required." });
    }
    const driver = db.supervisorAddDriver(name, email, phone || '', license, address, pan, aadhar, bankDetails, supervisorId);
    res.json(driver);
  });

  app.post('/api/driver/supervisor-assign', (req, res) => {
    const { vehicleId, driverId } = req.body;
    if (!vehicleId) {
      return res.status(400).json({ error: "Vehicle ID is required." });
    }
    const vehicle = db.supervisorAssignDriver(vehicleId, driverId || null);
    res.json(vehicle);
  });

  // Owner Approvals
  app.post('/api/maintenance/owner-approve', (req, res) => {
    const { id, approved } = req.body;
    if (!id || approved === undefined) {
      return res.status(400).json({ error: "ID and approved status are required." });
    }
    const record = db.ownerApproveServiceRecord(id, !!approved);
    res.json(record);
  });

  app.post('/api/vehicle/owner-approve', (req, res) => {
    const { id, approved } = req.body;
    if (!id || approved === undefined) {
      return res.status(400).json({ error: "ID and approved status are required." });
    }
    const vehicle = db.ownerApproveVehicle(id, !!approved);
    res.json(vehicle);
  });

  app.post('/api/driver/owner-approve', (req, res) => {
    const { id, approved } = req.body;
    if (!id || approved === undefined) {
      return res.status(400).json({ error: "ID and approved status are required." });
    }
    const driver = db.ownerApproveDriver(id, !!approved);
    res.json(driver);
  });

  app.post('/api/vendor/create', (req, res) => {
    const { name, contactPerson, phone, email, services, address } = req.body;
    if (!name || !contactPerson || !email) {
      return res.status(400).json({ error: "Name, contact, and email are required" });
    }
    const vendor = db.createVendor(name, contactPerson, phone || '', email, services || [], address || '');
    res.json(vendor);
  });

  // --- NEW ROLE-BASED DIRECT CRUD & VERIFICATION ENDPOINTS ---

  // 1. Owner - Driver Actions
  app.post('/api/owner/driver/add', (req, res) => {
    const { name, email, phone, license, status, address, pan, aadhar, bankDetails, supervisorId } = req.body;
    if (!name || !email || !license) return res.status(400).json({ error: "Name, email, and license are required" });
    const driver = db.ownerAddDriver(name, email, phone, license, status, address, pan, aadhar, bankDetails, supervisorId);
    res.json(driver);
  });

  app.post('/api/owner/driver/modify', (req, res) => {
    const { id, updates } = req.body;
    if (!id || !updates) return res.status(400).json({ error: "ID and updates are required" });
    const driver = db.ownerModifyDriver(id, updates);
    res.json(driver);
  });

  app.post('/api/owner/driver/delete', (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "ID is required" });
    const success = db.ownerDeleteDriver(id);
    res.json({ success });
  });

  // 2. Owner - Supervisor Actions
  app.post('/api/owner/supervisor/add', (req, res) => {
    const { name, email, phone, status, address, pan, aadhar, bankDetails } = req.body;
    if (!name || !email) return res.status(400).json({ error: "Name and email are required" });
    const supervisor = db.ownerAddSupervisor(name, email, phone, status, address, pan, aadhar, bankDetails);
    res.json(supervisor);
  });

  app.post('/api/owner/supervisor/modify', (req, res) => {
    const { id, updates } = req.body;
    if (!id || !updates) return res.status(400).json({ error: "ID and updates are required" });
    const supervisor = db.ownerModifySupervisor(id, updates);
    res.json(supervisor);
  });

  app.post('/api/owner/supervisor/delete', (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "ID is required" });
    const success = db.ownerDeleteSupervisor(id);
    res.json({ success });
  });

  app.post('/api/owner/supervisor/verify', (req, res) => {
    const { id, approved } = req.body;
    if (!id || approved === undefined) return res.status(400).json({ error: "ID and approved status are required" });
    const supervisor = db.ownerVerifySupervisor(id, !!approved);
    res.json(supervisor);
  });

  // 3. Owner - Vehicle (Asset) Actions
  app.post('/api/owner/vehicle/add', (req, res) => {
    const { plate, make, model, year, type, status } = req.body;
    if (!plate || !make || !model || !year || !type) return res.status(400).json({ error: "All specs are required" });
    const vehicle = db.ownerAddVehicleDirect(plate, make, model, Number(year), type, status);
    res.json(vehicle);
  });

  app.post('/api/owner/vehicle/modify', (req, res) => {
    const { id, updates } = req.body;
    if (!id || !updates) return res.status(400).json({ error: "ID and updates are required" });
    const vehicle = db.ownerModifyVehicleDirect(id, updates);
    res.json(vehicle);
  });

  app.post('/api/owner/vehicle/delete', (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "ID is required" });
    const success = db.ownerDeleteVehicle(id);
    res.json({ success });
  });

  // 4. Owner - Maintenance & Service Actions
  app.post('/api/owner/maintenance/add', (req, res) => {
    const { vehicleId, vendorId, serviceType, cost, scheduledDate, notes } = req.body;
    if (!vehicleId || !vendorId || !serviceType || !scheduledDate) return res.status(400).json({ error: "Missing required parameters" });
    const record = db.ownerAddMaintenanceRecordDirect(vehicleId, vendorId, serviceType, Number(cost), scheduledDate, notes);
    res.json(record);
  });

  app.post('/api/owner/maintenance/modify', (req, res) => {
    const { id, updates } = req.body;
    if (!id || !updates) return res.status(400).json({ error: "ID and updates are required" });
    const record = db.ownerModifyMaintenanceRecord(id, updates);
    res.json(record);
  });

  app.post('/api/owner/maintenance/delete', (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "ID is required" });
    const success = db.ownerDeleteMaintenanceRecord(id);
    res.json({ success });
  });

  // 5. Owner - Insurance Actions
  app.post('/api/owner/insurance/add', (req, res) => {
    const { vehicleId, provider, policyNumber, expiryDate, annualPremium, coverageDetails } = req.body;
    if (!vehicleId || !provider || !policyNumber || !expiryDate) return res.status(400).json({ error: "Missing required parameters" });
    const policy = db.ownerAddInsurancePolicy(vehicleId, provider, policyNumber, expiryDate, Number(annualPremium || 0), coverageDetails || '');
    res.json(policy);
  });

  app.post('/api/owner/insurance/modify', (req, res) => {
    const { id, updates } = req.body;
    if (!id || !updates) return res.status(400).json({ error: "ID and updates are required" });
    const policy = db.ownerModifyInsurancePolicy(id, updates);
    res.json(policy);
  });

  app.post('/api/owner/insurance/delete', (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "ID is required" });
    const success = db.ownerDeleteInsurancePolicy(id);
    res.json({ success });
  });

  app.post('/api/owner/insurance/verify', (req, res) => {
    const { id, approved } = req.body;
    if (!id || approved === undefined) return res.status(400).json({ error: "ID and approved status are required" });
    const policy = db.ownerApproveInsurancePolicy(id, !!approved);
    res.json(policy);
  });

  // 6. Supervisor - Insurance Actions
  app.post('/api/supervisor/insurance/add', (req, res) => {
    const { vehicleId, provider, policyNumber, expiryDate, annualPremium, coverageDetails } = req.body;
    if (!vehicleId || !provider || !policyNumber || !expiryDate) return res.status(400).json({ error: "Missing required parameters" });
    const policy = db.supervisorAddInsurancePolicy(vehicleId, provider, policyNumber, expiryDate, Number(annualPremium || 0), coverageDetails || '');
    res.json(policy);
  });

  app.post('/api/supervisor/insurance/modify', (req, res) => {
    const { id, updates } = req.body;
    if (!id || !updates) return res.status(400).json({ error: "ID and updates are required" });
    const policy = db.supervisorModifyInsurancePolicy(id, updates);
    res.json(policy);
  });

  app.post('/api/supervisor/insurance/verify', (req, res) => {
    const { id, verified } = req.body;
    if (!id || verified === undefined) return res.status(400).json({ error: "ID and verified status are required" });
    const policy = db.supervisorVerifyInsurancePolicy(id, !!verified);
    res.json(policy);
  });

  // 7. Supervisor - Vehicle Verification Actions
  app.post('/api/supervisor/vehicle/verify', (req, res) => {
    const { id, verified } = req.body;
    if (!id || verified === undefined) return res.status(400).json({ error: "ID and verified status are required" });
    const vehicle = db.supervisorVerifyVehicle(id, !!verified);
    res.json(vehicle);
  });

  app.put('/api/notifications/read', (req, res) => {
    const { id } = req.body;
    const state = db.getState();
    if (id) {
      const n = state.pushNotifications.find(not => not.id === id);
      if (n) n.isRead = true;
    } else {
      state.pushNotifications.forEach(not => not.isRead = true);
    }
    db.writeLog('System', 'Notification Center', id ? `Read notification ${id}` : 'Marked all notifications read', '--');
    res.json({ success: true });
  });

  app.post('/api/notifications/create', (req, res) => {
    const { title, message, type } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: "Title and message are required" });
    }
    const notif = db.addNotification(title, message, type || 'task');
    res.json(notif);
  });

  // Backup History Simulation
  const mockBackups = [
    { id: 'BAK-20260623-01', timestamp: '2026-06-23T04:00:00.000Z', size: '142 KB', status: 'SUCCESS', target: 'Google Cloud Storage (us-central1)', encrypted: true },
    { id: 'BAK-20260622-01', timestamp: '2026-06-22T04:00:00.000Z', size: '139 KB', status: 'SUCCESS', target: 'Google Cloud Storage (us-central1)', encrypted: true },
    { id: 'BAK-20260621-01', timestamp: '2026-06-21T04:00:00.000Z', size: '138 KB', status: 'SUCCESS', target: 'Google Cloud Storage (us-central1)', encrypted: true },
  ];

  app.get('/api/backups', (req, res) => {
    res.json(mockBackups);
  });

  app.post('/api/backups/trigger', (req, res) => {
    const id = `BAK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-MAN`;
    const newBackup = {
      id,
      timestamp: new Date().toISOString(),
      size: `${(Math.random() * 20 + 130).toFixed(1)} KB`,
      status: 'SUCCESS',
      target: 'Google Cloud Storage (us-central1) [MANUAL AD-HOC]',
      encrypted: true
    };
    mockBackups.unshift(newBackup);
    db.writeLog('Owner', 'navay.laxman@gmail.com', 'Triggered Manual Encrypted Database Backup to GCS', `DUMP DATABASE fleetcore_db TO '${id}.sql' WITH ENCRYPTION_KEY='*****';`);
    res.json(newBackup);
  });

  // Vite Integration for HMR and static file serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer();
