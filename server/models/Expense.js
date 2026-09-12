import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    expenseDate: { type: Date, required: true, default: Date.now },
    category: { type: String, enum: ['travel', 'parts', 'tools', 'meals', 'other'], required: true },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, required: true, maxlength: 1000 },
    receiptUrl: String,
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewNote: { type: String, maxlength: 500 },
  },
  { timestamps: true },
);

expenseSchema.index({ employee: 1, expenseDate: -1 });
export default mongoose.model('Expense', expenseSchema);

