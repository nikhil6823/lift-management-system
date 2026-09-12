import mongoose from 'mongoose';

const salarySlipSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    month: { type: String, required: true, match: /^\d{4}-(0[1-9]|1[0-2])$/ },
    baseSalary: { type: Number, required: true, min: 0 },
    allowances: { type: Number, min: 0, default: 0 },
    deductions: { type: Number, min: 0, default: 0 },
    netPay: { type: Number, required: true, min: 0 },
    paidOn: Date,
    status: { type: String, enum: ['draft', 'issued', 'paid'], default: 'draft' },
    notes: { type: String, maxlength: 1000 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

salarySlipSchema.index({ employee: 1, month: 1 }, { unique: true });
export default mongoose.model('SalarySlip', salarySlipSchema);

