import Invoice from '../models/Invoice.js';

const populated = (query) => query.populate('lift', 'code name building').populate('serviceRequest', 'ticketNumber title status');

function remainingBalance(invoice) {
  return Math.max(0, invoice.amount - invoice.payments.reduce((total, payment) => total + payment.amount, 0));
}

export async function listInvoices(req, res) {
  const filter = req.user.role === 'customer' ? { customer: req.user._id } : req.user.role === 'admin' ? {} : { _id: null };
  const invoices = await populated(Invoice.find(filter).sort({ createdAt: -1 }));
  res.json(invoices.map((invoice) => ({ ...invoice.toObject(), balance: remainingBalance(invoice) })));
}

export async function createInvoice(req, res) {
  const { customer, lift, serviceRequest, description, amount, dueDate } = req.body;
  if (!customer || !description || amount === undefined) return res.status(400).json({ message: 'Customer, description, and amount are required' });
  const invoice = await Invoice.create({ customer, lift, serviceRequest, description, amount: Number(amount), dueDate, invoiceNumber: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}` });
  res.status(201).json(await populated(Invoice.findById(invoice._id)));
}

export async function recordOnlinePayment(req, res) {
  const invoice = await Invoice.findOne({ _id: req.params.id, customer: req.user._id });
  if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
  if (invoice.status === 'paid') return res.status(400).json({ message: 'This invoice is already paid' });
  const amount = Number(req.body.amount || remainingBalance(invoice));
  const method = req.body.method || 'upi';
  if (!['card', 'upi', 'bank-transfer'].includes(method) || !Number.isFinite(amount) || amount <= 0 || amount > remainingBalance(invoice)) return res.status(400).json({ message: 'Enter a valid payment amount and method' });
  invoice.payments.push({ amount, method, reference: `PAY-${Date.now()}` });
  if (remainingBalance(invoice) === 0) invoice.status = 'paid';
  await invoice.save();
  const result = await populated(Invoice.findById(invoice._id));
  res.json({ ...result.toObject(), balance: remainingBalance(result) });
}

export async function downloadInvoiceReceipt(req, res) {
  const invoice = await Invoice.findOne({ _id: req.params.id, customer: req.user._id }).populate('lift', 'code name building');
  if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
  const receipt = [`PV Tech Elevators — Invoice receipt`, `Invoice: ${invoice.invoiceNumber}`, `Lift: ${invoice.lift?.code || '—'}`, `Description: ${invoice.description}`, `Invoice total: ₹${invoice.amount.toFixed(2)}`, `Paid: ₹${invoice.payments.reduce((total, payment) => total + payment.amount, 0).toFixed(2)}`, `Balance: ₹${remainingBalance(invoice).toFixed(2)}`, `Status: ${invoice.status}`].join('\n');
  res.type('text/plain').attachment(`${invoice.invoiceNumber}-receipt.txt`).send(receipt);
}
