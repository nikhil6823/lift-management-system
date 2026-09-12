import Employee from '../models/Employee.js';
import LocationLog from '../models/LocationLog.js';

export async function logLocation(req, res) {
  const employee = await Employee.findOne({ user: req.user._id });
  if (!employee) return res.status(400).json({ message: 'Only employees can send locations' });
  const locationData = {
    latitude: Number(req.body.latitude),
    longitude: Number(req.body.longitude),
    accuracy: req.body.accuracy === undefined ? undefined : Number(req.body.accuracy),
    employee: employee._id,
    photoData: req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` : undefined,
    photoName: req.file?.originalname,
  };
  const location = await LocationLog.create(locationData);
  await location.populate({ path: 'employee', populate: { path: 'user', select: 'name email' } });
  req.app.get('io')?.to('admins').emit('location:update', location);
  res.status(201).json(location);
}

export async function latestLocations(req, res) {
  const matches = await LocationLog.aggregate([
    { $sort: { recordedAt: -1 } },
    { $group: { _id: '$employee', latest: { $first: '$$ROOT' } } },
    { $replaceRoot: { newRoot: '$latest' } },
  ]);
  await LocationLog.populate(matches, { path: 'employee', populate: { path: 'user', select: 'name email' } });
  res.json(matches);
}

export async function removeLocation(req, res) {
  const location = await LocationLog.findById(req.params.id);
  if (!location) return res.status(404).json({ message: 'Location record not found' });
  await LocationLog.deleteMany({ employee: location.employee });
  req.app.get('io')?.to('admins').emit('location:removed', { id: req.params.id, employee: location.employee.toString() });
  res.status(204).end();
}
