import 'dotenv/config';
import mongoose from 'mongoose';
import Attendance from './models/Attendance.js';
import Employee from './models/Employee.js';
import Expense from './models/Expense.js';
import Invoice from './models/Invoice.js';
import Lift from './models/Lift.js';
import LocationLog from './models/LocationLog.js';
import SalarySlip from './models/SalarySlip.js';
import ServiceRequest from './models/ServiceRequest.js';
import User from './models/User.js';

const demoPassword = 'Password123!';
const workDate = new Date('2026-09-11T00:00:00.000Z');

async function findOrCreateUser(data) {
  let user = await User.findOne({ email: data.email });
  if (!user) user = await User.create({ ...data, password: demoPassword });
  return user;
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const admin = await findOrCreateUser({ name: 'Demo Administrator', email: 'admin@pvtech.test', role: 'admin', phone: '+91 90000 10000' });
  const customer = await findOrCreateUser({ name: 'Skyline Facilities', email: 'customer@pvtech.test', role: 'customer', phone: '+91 90000 10003' });
  const technicianUsers = await Promise.all([
    findOrCreateUser({ name: 'Aarav Sharma', email: 'aarav@pvtech.test', role: 'employee', phone: '+91 90000 10001' }),
    findOrCreateUser({ name: 'Meera Patel', email: 'meera@pvtech.test', role: 'employee', phone: '+91 90000 10002' }),
  ]);

  const employees = await Promise.all([
    Employee.findOneAndUpdate({ user: technicianUsers[0]._id }, { $set: { employeeCode: 'TECH-001', designation: 'Senior Technician', department: 'Field Service', skills: ['Hydraulics', 'Door systems'], joiningDate: new Date('2023-04-10'), baseSalary: 42000, address: 'Andheri East, Mumbai', emergencyContact: '+91 90000 11001' } }, { new: true, upsert: true, setDefaultsOnInsert: true }),
    Employee.findOneAndUpdate({ user: technicianUsers[1]._id }, { $set: { employeeCode: 'TECH-002', designation: 'Service Technician', department: 'Field Service', skills: ['Traction lifts', 'Preventive maintenance'], joiningDate: new Date('2024-01-15'), baseSalary: 36000, address: 'Vastrapur, Ahmedabad', emergencyContact: '+91 90000 11002' } }, { new: true, upsert: true, setDefaultsOnInsert: true }),
  ]);
  await Attendance.deleteMany({ employee: { $in: employees.map((employee) => employee._id) }, workDate: new Date('2026-09-12T00:00:00.000Z') });

  const lifts = await Promise.all([
    Lift.findOneAndUpdate({ code: 'PV-MUM-001' }, { $set: { name: 'Tower A Passenger Lift', building: 'Skyline Residency', address: 'Andheri East, Mumbai', make: 'Schindler', model: 'S3300', serialNumber: 'SCH-3300-001', capacityKg: 680, floors: 18, status: 'operational', assignedTechnician: employees[0]._id, assignedCustomer: customer._id, location: { latitude: 19.1197, longitude: 72.8468 }, lastServiceDate: new Date('2026-08-20'), nextServiceDate: new Date('2026-09-20') } }, { new: true, upsert: true, setDefaultsOnInsert: true }),
    Lift.findOneAndUpdate({ code: 'PV-MUM-002' }, { $set: { name: 'Tower B Service Lift', building: 'Skyline Residency', address: 'Andheri East, Mumbai', make: 'Otis', model: 'Gen2', serialNumber: 'OTS-GEN2-002', capacityKg: 1000, floors: 18, status: 'maintenance', assignedTechnician: employees[1]._id, assignedCustomer: customer._id, location: { latitude: 19.1211, longitude: 72.8482 }, lastServiceDate: new Date('2026-08-02'), nextServiceDate: new Date('2026-09-13') } }, { new: true, upsert: true, setDefaultsOnInsert: true }),
    Lift.findOneAndUpdate({ code: 'PV-AHM-001' }, { $set: { name: 'Office Block Lift', building: 'Westgate Business Park', address: 'Prahlad Nagar, Ahmedabad', make: 'Kone', model: 'MonoSpace', serialNumber: 'KON-MS-003', capacityKg: 630, floors: 12, status: 'operational', assignedTechnician: employees[1]._id, location: { latitude: 23.0125, longitude: 72.5106 }, lastServiceDate: new Date('2026-08-28'), nextServiceDate: new Date('2026-09-28') } }, { new: true, upsert: true, setDefaultsOnInsert: true }),
  ]);

  const serviceRequests = [
    { ticketNumber: 'SR-DEMO-001', lift: lifts[1]._id, title: 'Door closing delay', description: 'Landing door takes several seconds to close after the car reaches the floor.', priority: 'high', status: 'assigned', submittedBy: employees[0]._id, assignedTechnician: employees[1]._id, dueDate: new Date('2026-09-13') },
    { ticketNumber: 'SR-DEMO-002', lift: lifts[0]._id, title: 'Preventive maintenance visit', description: 'Monthly inspection and lubrication are due for the passenger lift.', priority: 'medium', status: 'in-progress', submittedBy: employees[1]._id, assignedTechnician: employees[0]._id, dueDate: new Date('2026-09-14') },
    { ticketNumber: 'SR-DEMO-003', lift: lifts[2]._id, title: 'Cabin light replacement', description: 'Replace two flickering LED panels in the lift cabin.', priority: 'low', status: 'open', assignedTechnician: employees[1]._id, dueDate: new Date('2026-09-16') },
  ];
  for (const request of serviceRequests) await ServiceRequest.findOneAndUpdate({ ticketNumber: request.ticketNumber }, { $set: request }, { upsert: true, new: true, setDefaultsOnInsert: true });

  await Invoice.findOneAndUpdate({ invoiceNumber: 'INV-DEMO-001' }, { $set: { customer: customer._id, lift: lifts[0]._id, description: 'Quarterly maintenance service', amount: 4500, dueDate: new Date('2026-09-20'), status: 'pending' } }, { upsert: true, new: true, setDefaultsOnInsert: true });

  const expenses = [
    { employee: employees[0]._id, expenseDate: new Date('2026-09-10'), category: 'travel', amount: 860, description: 'Travel between Skyline Residency and workshop', status: 'pending' },
    { employee: employees[1]._id, expenseDate: new Date('2026-09-09'), category: 'parts', amount: 1450, description: 'Door roller and alignment hardware', status: 'approved', reviewedBy: admin._id },
  ];
  for (const expense of expenses) await Expense.findOneAndUpdate({ employee: expense.employee, description: expense.description }, { $set: expense }, { upsert: true, new: true, setDefaultsOnInsert: true });

  for (const [employee, status, clockIn] of [[employees[0], 'present', '2026-09-12T08:42:00.000Z'], [employees[1], 'present', '2026-09-12T09:05:00.000Z']]) {
    await Attendance.findOneAndUpdate({ employee: employee._id, workDate }, { $set: { status, clockIn: new Date(clockIn.replace('2026-09-12', '2026-09-11')), clockInLocation: { latitude: 19.12, longitude: 72.847 } } }, { upsert: true, new: true, setDefaultsOnInsert: true });
  }

  for (const employee of employees) {
    await SalarySlip.findOneAndUpdate({ employee: employee._id, month: '2026-08' }, { $set: { baseSalary: employee.baseSalary, allowances: 3500, deductions: 1200, netPay: employee.baseSalary + 2300, paidOn: new Date('2026-08-31'), status: 'paid', notes: 'Demo salary slip', createdBy: admin._id } }, { upsert: true, new: true, setDefaultsOnInsert: true });
  }

  await LocationLog.findOneAndUpdate({ employee: employees[0]._id, recordedAt: new Date('2026-09-12T09:20:00.000Z') }, { $set: { latitude: 19.1197, longitude: 72.8468, accuracy: 18 } }, { upsert: true, new: true, setDefaultsOnInsert: true });
  await LocationLog.findOneAndUpdate({ employee: employees[1]._id, recordedAt: new Date('2026-09-12T09:18:00.000Z') }, { $set: { latitude: 23.0125, longitude: 72.5106, accuracy: 24 } }, { upsert: true, new: true, setDefaultsOnInsert: true });

  console.info('Demo data ready.');
  console.info('Admin login: admin@pvtech.test / Password123!');
  console.info('Technician login: aarav@pvtech.test / Password123!');
  console.info('Technician login: meera@pvtech.test / Password123!');
  console.info('Customer login: customer@pvtech.test / Password123!');
}

seed().catch((error) => {
  console.error('Could not seed demo data:', error.message);
  process.exitCode = 1;
}).finally(async () => {
  await mongoose.disconnect();
});
