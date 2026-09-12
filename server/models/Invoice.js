import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lift: { type: mongoose.Schema.Types.ObjectId, ref: 'Lift' },
    serviceRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest' },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' },
    dueDate: Date,
    payments: [{
      amount: { type: Number, required: true, min: 0.01 },
      method: { type: String, enum: ['card', 'upi', 'bank-transfer'], required: true },
      reference: { type: String, required: true },
      paidAt: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true },
);

invoiceSchema.index({ customer: 1, status: 1, dueDate: 1 });
export default mongoose.model('Invoice', invoiceSchema);
