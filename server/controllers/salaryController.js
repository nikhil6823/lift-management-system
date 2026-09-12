import Employee from '../models/Employee.js';
import SalarySlip from '../models/SalarySlip.js';
import { calculateSalary } from '../utils/calculateSalary.js';

export async function listSalarySlips(req, res) {
  const filter = {};
  if (req.user.role === 'employee') {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) return res.json([]);
    filter.employee = employee._id;
  }
  if (req.query.month) filter.month = req.query.month;
  res.json(await SalarySlip.find(filter).populate({ path: 'employee', populate: { path: 'user', select: 'name email' } }).sort({ month: -1 }));
}

export async function createSalarySlip(req, res) {
  const { employee, month, baseSalary, allowances, deductions } = req.body;
  const netPay = calculateSalary({ baseSalary, allowances, deductions });
  const status = req.body.status || 'draft';
  const slip = await SalarySlip.create({ ...req.body, employee, month, baseSalary, allowances, deductions, netPay, status, paidOn: status === 'paid' ? new Date() : undefined, createdBy: req.user._id });
  res.status(201).json(slip);
}

export async function updateSalarySlip(req, res) {
  const slip = await SalarySlip.findById(req.params.id);
  if (!slip) return res.status(404).json({ message: 'Salary slip not found' });
  ['month', 'baseSalary', 'allowances', 'deductions', 'paidOn', 'status', 'notes'].forEach((field) => { if (req.body[field] !== undefined) slip[field] = req.body[field]; });
  if (slip.status === 'paid' && !slip.paidOn) slip.paidOn = new Date();
  if (slip.status !== 'paid') slip.paidOn = undefined;
  slip.netPay = calculateSalary(slip);
  await slip.save();
  res.json(slip);
}
