import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';

function todayAtMidnight() {
  const value = new Date();
  value.setHours(0, 0, 0, 0);
  return value;
}

export async function clockIn(req, res) {
  const employee = await Employee.findOne({ user: req.user._id });
  if (!employee) return res.status(400).json({ message: 'Only employees can clock in' });
  const workDate = todayAtMidnight();
  const existing = await Attendance.findOne({ employee: employee._id, workDate });
  if (existing?.clockIn) return res.status(409).json({ message: 'You are already clocked in today' });
  const attendance = existing || new Attendance({ employee: employee._id, workDate });
  attendance.clockIn = new Date();
  attendance.clockInLocation = req.body.location;
  attendance.note = req.body.note || attendance.note;
  await attendance.save();
  res.status(201).json(await attendance.populate({ path: 'employee', populate: { path: 'user', select: 'name email' } }));
}

export async function clockOut(req, res) {
  const employee = await Employee.findOne({ user: req.user._id });
  const attendance = employee && await Attendance.findOne({ employee: employee._id, workDate: todayAtMidnight() });
  if (!attendance?.clockIn) return res.status(400).json({ message: 'Clock in before clocking out' });
  if (attendance.clockOut) return res.status(409).json({ message: 'You are already clocked out today' });
  attendance.clockOut = new Date();
  attendance.clockOutLocation = req.body.location;
  await attendance.save();
  res.json(attendance);
}

export async function listAttendance(req, res) {
  const filter = {};
  if (req.user.role === 'employee') {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) return res.json([]);
    filter.employee = employee?._id;
  } else if (req.query.employee) filter.employee = req.query.employee;
  if (req.query.from || req.query.to) {
    filter.workDate = {};
    if (req.query.from) filter.workDate.$gte = new Date(req.query.from);
    if (req.query.to) filter.workDate.$lte = new Date(req.query.to);
  }
  res.json(await Attendance.find(filter).populate({ path: 'employee', populate: { path: 'user', select: 'name email' } }).sort({ workDate: -1 }).limit(250));
}
