import Employee from '../models/Employee.js';
import Lift from '../models/Lift.js';
import LocationLog from '../models/LocationLog.js';
import ServiceRequest from '../models/ServiceRequest.js';
import User from '../models/User.js';

export async function listEmployees(req, res) {
  const employees = await Employee.find().populate('user', 'name email phone active').sort({ createdAt: -1 });
  res.json(employees.filter((employee) => employee.user?.active !== false));
}

export async function createEmployee(req, res) {
  const { name, email, password, phone, employeeCode, designation, department, skills, joiningDate, baseSalary, address, emergencyContact } = req.body;
  if (!name || !email || !password || !employeeCode) return res.status(400).json({ message: 'Name, email, password and employee code are required' });
  const user = await User.create({ name, email, password, phone, role: 'employee' });
  const employee = await Employee.create({ user: user._id, employeeCode, designation, department, skills, joiningDate, baseSalary, address, emergencyContact });
  res.status(201).json(await employee.populate('user', 'name email phone active'));
}

export async function getEmployee(req, res) {
  const employee = await Employee.findById(req.params.id).populate('user', 'name email phone active');
  if (!employee) return res.status(404).json({ message: 'Employee not found' });
  res.json(employee);
}

export async function updateEmployee(req, res) {
  const employee = await Employee.findById(req.params.id);
  if (!employee) return res.status(404).json({ message: 'Employee not found' });
  const employeeFields = ['employeeCode', 'designation', 'department', 'skills', 'joiningDate', 'baseSalary', 'address', 'emergencyContact'];
  employeeFields.forEach((field) => { if (req.body[field] !== undefined) employee[field] = req.body[field]; });
  await employee.save();
  const userFields = ['name', 'phone', 'active'];
  const updates = Object.fromEntries(userFields.filter((field) => req.body[field] !== undefined).map((field) => [field, req.body[field]]));
  if (Object.keys(updates).length) await User.findByIdAndUpdate(employee.user, updates, { runValidators: true });
  res.json(await employee.populate('user', 'name email phone active'));
}

export async function removeEmployee(req, res) {
  const employee = await Employee.findById(req.params.id);
  if (!employee) return res.status(404).json({ message: 'Employee not found' });

  const assignedLifts = await Lift.find({ assignedTechnician: employee._id }).select('_id');
  await User.findByIdAndUpdate(employee.user, { active: false });
  await Lift.updateMany({ assignedTechnician: employee._id }, { $unset: { assignedTechnician: 1 } });
  await ServiceRequest.updateMany(
    { assignedTechnician: employee._id, status: { $nin: ['resolved', 'closed'] } },
    { $unset: { assignedTechnician: 1 }, $set: { status: 'open', technicianArrivalStatus: 'not-assigned' } },
  );
  await LocationLog.deleteMany({ employee: employee._id });
  req.app.get('io')?.to('admins').emit('location:removed', { employee: employee._id.toString(), liftIds: assignedLifts.map((lift) => lift._id.toString()) });

  res.json({ message: 'Employee removed and account access disabled.' });
}

