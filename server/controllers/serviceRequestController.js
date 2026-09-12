import Employee from '../models/Employee.js';
import Lift from '../models/Lift.js';
import LocationLog from '../models/LocationLog.js';
import ServiceRequest from '../models/ServiceRequest.js';

async function currentEmployee(userId) {
  return Employee.findOne({ user: userId });
}

const populated = (query) => query
  .populate('lift', 'code name building status customerStatus')
  .populate({ path: 'assignedTechnician', populate: { path: 'user', select: 'name email' } })
  .populate({ path: 'submittedBy', populate: { path: 'user', select: 'name email' } })
  .populate('submittedByUser', 'name email phone role')
  .populate('attachments.uploadedBy', 'name role');

async function canAccessRequest(request, user) {
  if (user.role === 'admin') return true;
  if (user.role === 'customer') return request.submittedByUser?.toString() === user._id.toString();
  const employee = await currentEmployee(user._id);
  return Boolean(employee && [request.assignedTechnician?.toString(), request.submittedBy?.toString()].includes(employee._id.toString()));
}

export async function listServiceRequests(req, res) {
  const filter = {};
  if (req.user.role === 'employee') {
    const employee = await currentEmployee(req.user._id);
    if (!employee) return res.json([]);
    filter.$or = [{ assignedTechnician: employee?._id }, { submittedBy: employee?._id }];
  }
  if (req.user.role === 'customer') filter.submittedByUser = req.user._id;
  if (req.query.status) filter.status = req.query.status;
  res.json(await populated(ServiceRequest.find(filter).sort({ createdAt: -1 })));
}

export async function createServiceRequest(req, res) {
  const employee = await currentEmployee(req.user._id);
  const requestType = req.body.requestType || 'service';
  if (!['service', 'new-lift', 'emergency', 'maintenance-reschedule', 'general-query'].includes(requestType)) return res.status(400).json({ message: 'Choose a valid request type' });
  if (['service', 'emergency', 'maintenance-reschedule'].includes(requestType) && !req.body.lift) return res.status(400).json({ message: 'Select a lift for this request' });
  if (req.user.role === 'customer' && req.body.lift) {
    const lift = await Lift.findOne({ _id: req.body.lift, assignedCustomer: req.user._id });
    if (!lift) return res.status(403).json({ message: 'You can request service only for a lift assigned to you' });
  }
  const ticketNumber = `SR-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
  const customerFields = ['lift', 'title', 'description', 'priority', 'issueCategory', 'siteLocation', 'requestedMaintenanceDate'];
  const input = req.user.role === 'customer'
    ? Object.fromEntries(customerFields.filter((field) => req.body[field] !== undefined).map((field) => [field, req.body[field]]))
    : req.body;
  const request = await ServiceRequest.create({ ...input, priority: requestType === 'emergency' ? 'critical' : input.priority, requestType, ticketNumber, submittedBy: employee?._id, submittedByUser: req.user._id });
  res.status(201).json(await populated(ServiceRequest.findById(request._id)));
}

export async function getServiceRequest(req, res) {
  const request = await populated(ServiceRequest.findById(req.params.id));
  if (!request) return res.status(404).json({ message: 'Service request not found' });
  if (req.user.role === 'employee') {
    const employee = await currentEmployee(req.user._id);
    if (!employee) return res.status(403).json({ message: 'Employee profile is required' });
    if (![request.assignedTechnician?._id?.toString(), request.submittedBy?._id?.toString()].includes(employee?._id.toString())) return res.status(403).json({ message: 'Not authorized for this request' });
  }
  if (req.user.role === 'customer' && request.submittedByUser?._id?.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized for this request' });
  res.json(request);
}

export async function addServiceMedia(req, res) {
  if (!req.files?.length) return res.status(400).json({ message: 'Choose up to three JPG, PNG, WebP, MP4, WebM, or MOV files' });
  const request = await ServiceRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ message: 'Service request not found' });
  if (!await canAccessRequest(request, req.user)) return res.status(403).json({ message: 'Not authorized for this request' });
  request.attachments.push(...req.files.map((file) => ({ data: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`, name: file.originalname, type: file.mimetype, uploadedBy: req.user._id })));
  await request.save();
  res.status(201).json(await populated(ServiceRequest.findById(request._id)));
}

export async function getServiceTracking(req, res) {
  const request = await ServiceRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ message: 'Service request not found' });
  if (!await canAccessRequest(request, req.user)) return res.status(403).json({ message: 'Not authorized for this request' });
  const location = request.assignedTechnician
    ? await LocationLog.findOne({ employee: request.assignedTechnician }).sort({ recordedAt: -1 }).populate({ path: 'employee', populate: { path: 'user', select: 'name' } })
    : null;
  res.json({ request: await populated(ServiceRequest.findById(request._id)), location });
}

export async function downloadServiceReport(req, res) {
  const request = await ServiceRequest.findById(req.params.id).populate('lift', 'code name building').populate({ path: 'assignedTechnician', populate: { path: 'user', select: 'name' } });
  if (!request) return res.status(404).json({ message: 'Service request not found' });
  if (!await canAccessRequest(request, req.user)) return res.status(403).json({ message: 'Not authorized for this request' });
  const report = [`PV Tech Elevators — Service report`, `Ticket: ${request.ticketNumber}`, `Lift: ${request.lift?.code || 'New lift enquiry'}`, `Status: ${request.status}`, `Technician: ${request.assignedTechnician?.user?.name || 'Not assigned'}`, `Resolution: ${request.resolutionNotes || 'Not yet recorded'}`, `Parts replaced: ${request.partsReplaced || 'None recorded'}`, `Completed: ${request.resolvedAt?.toLocaleString() || 'Not completed'}`].join('\n');
  res.type('text/plain').attachment(`${request.ticketNumber}-service-report.txt`).send(report);
}

export async function submitServiceReview(req, res) {
  const { rating, feedback } = req.body;
  const request = await ServiceRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ message: 'Service request not found' });
  if (req.user.role !== 'customer' || !await canAccessRequest(request, req.user)) return res.status(403).json({ message: 'Only the requesting customer can review this service' });
  if (!['resolved', 'closed'].includes(request.status)) return res.status(400).json({ message: 'A review can be added after the service is resolved' });
  if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) return res.status(400).json({ message: 'Choose a rating from one to five' });
  request.review = { rating: Number(rating), feedback: feedback?.trim() || '', reviewedAt: new Date() };
  await request.save();
  res.json(await populated(ServiceRequest.findById(request._id)));
}

export async function updateServiceRequest(req, res) {
  const request = await ServiceRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ message: 'Service request not found' });
  const employee = req.user.role === 'employee' ? await currentEmployee(req.user._id) : null;
  const isAssignee = employee && request.assignedTechnician?.toString() === employee._id.toString();
  if (req.user.role !== 'admin' && !isAssignee) return res.status(403).json({ message: 'Only the assigned technician may update this request' });

  const permitted = req.user.role === 'admin'
    ? ['lift', 'title', 'description', 'priority', 'status', 'assignedTechnician', 'dueDate', 'resolutionNotes', 'issueCategory', 'requestedMaintenanceDate', 'technicianArrivalStatus', 'technicianArrivalEta', 'estimatedCompletion', 'partsReplaced']
    : ['status', 'resolutionNotes', 'technicianArrivalStatus', 'technicianArrivalEta', 'estimatedCompletion', 'partsReplaced'];
  permitted.forEach((field) => { if (req.body[field] !== undefined) request[field] = req.body[field]; });
  if (['resolved', 'closed'].includes(request.status) && !request.resolvedAt) request.resolvedAt = new Date();
  if (!['resolved', 'closed'].includes(request.status)) request.resolvedAt = undefined;
  await request.save();
  if (['resolved', 'closed'].includes(request.status) && request.assignedTechnician) {
    req.app.get('io')?.to('admins').emit('location:removed', { employee: request.assignedTechnician.toString(), liftId: request.lift?.toString(), requestId: request._id.toString() });
  }
  res.json(await populated(ServiceRequest.findById(request._id)));
}
