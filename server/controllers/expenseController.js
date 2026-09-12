import Employee from '../models/Employee.js';
import Expense from '../models/Expense.js';

export async function listExpenses(req, res) {
  const filter = {};
  if (req.user.role === 'employee') {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) return res.json([]);
    filter.employee = employee._id;
  }
  if (req.query.status) filter.status = req.query.status;
  res.json(await Expense.find(filter).populate({ path: 'employee', populate: { path: 'user', select: 'name email' } }).sort({ expenseDate: -1 }));
}

export async function createExpense(req, res) {
  const employee = await Employee.findOne({ user: req.user._id });
  if (!employee) return res.status(400).json({ message: 'Only employees can submit expenses' });
  const expense = await Expense.create({ ...req.body, employee: employee._id, receiptUrl: req.file ? undefined : req.body.receiptUrl });
  res.status(201).json(expense);
}

export async function updateExpense(req, res) {
  const expense = await Expense.findById(req.params.id);
  if (!expense) return res.status(404).json({ message: 'Expense not found' });
  if (req.user.role === 'employee') {
    const employee = await Employee.findOne({ user: req.user._id });
    if (expense.employee.toString() !== employee?._id.toString() || expense.status !== 'pending') return res.status(403).json({ message: 'Only your pending expenses can be edited' });
    ['expenseDate', 'category', 'amount', 'description', 'receiptUrl'].forEach((field) => { if (req.body[field] !== undefined) expense[field] = req.body[field]; });
  } else {
    ['status', 'reviewNote'].forEach((field) => { if (req.body[field] !== undefined) expense[field] = req.body[field]; });
    expense.reviewedBy = req.user._id;
  }
  await expense.save();
  res.json(expense);
}
