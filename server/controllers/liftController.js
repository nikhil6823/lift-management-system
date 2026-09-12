import Lift from '../models/Lift.js';
import Employee from '../models/Employee.js';

const liftPopulation = [
  { path: 'assignedTechnician', select: 'employeeCode designation' },
  { path: 'assignedCustomer', select: 'name email phone' },
  { path: 'customerStatus.updatedBy', select: 'name' },
  { path: 'images.uploadedBy', select: 'name role' },
];

function customerFilter(user) {
  return user.role === 'customer' ? { assignedCustomer: user._id } : {};
}

async function findAccessibleLift(id, user) {
  return Lift.findOne({ _id: id, ...customerFilter(user) });
}

export async function listLifts(req, res) {
  const filter = { ...customerFilter(req.user) };
  if (req.query.status) filter.status = req.query.status;
  const lifts = await Lift.find(filter).populate(liftPopulation).sort({ updatedAt: -1 });
  res.json(lifts);
}

export async function createLift(req, res) {
  const lift = await Lift.create(req.body);
  res.status(201).json(await lift.populate(liftPopulation));
}

export async function getLift(req, res) {
  const lift = await Lift.findOne({ _id: req.params.id, ...customerFilter(req.user) }).populate(liftPopulation);
  if (!lift) return res.status(404).json({ message: 'Lift not found' });
  res.json(lift);
}

export async function updateLift(req, res) {
  const lift = await Lift.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate(liftPopulation);
  if (!lift) return res.status(404).json({ message: 'Lift not found' });
  res.json(lift);
}

export async function deleteLift(req, res) {
  const lift = await Lift.findByIdAndDelete(req.params.id);
  if (!lift) return res.status(404).json({ message: 'Lift not found' });
  req.app.get('io')?.to('admins').emit('lift:removed', { id: lift._id.toString() });
  res.status(204).end();
}

export async function addLiftImage(req, res) {
  if (!req.file) return res.status(400).json({ message: 'Choose a JPG, PNG, or WebP lift image' });
  const lift = await findAccessibleLift(req.params.id, req.user);
  if (!lift) return res.status(404).json({ message: 'Lift not found or not assigned to you' });
  if (req.user.role === 'employee') {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee || lift.assignedTechnician?.toString() !== employee._id.toString()) return res.status(403).json({ message: 'Only the assigned technician can add lift images' });
  }
  lift.images.push({ data: `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`, name: req.file.originalname, uploadedBy: req.user._id });
  await lift.save();
  res.status(201).json(await Lift.findById(lift._id).populate(liftPopulation));
}

export async function updateCustomerLiftStatus(req, res) {
  const { status, note } = req.body;
  if (!['operational', 'maintenance', 'out-of-service'].includes(status)) return res.status(400).json({ message: 'Choose a valid lift status' });
  const lift = await findAccessibleLift(req.params.id, req.user);
  if (!lift) return res.status(404).json({ message: 'Lift not found or not assigned to you' });
  lift.customerStatus = { status, note: note?.trim() || '', updatedBy: req.user._id, updatedAt: new Date() };
  await lift.save();
  const updated = await Lift.findById(lift._id).populate(liftPopulation);
  req.app.get('io')?.to('admins').emit('lift:status-update', updated);
  res.json(updated);
}
