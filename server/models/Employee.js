import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    employeeCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    designation: { type: String, default: 'Technician', trim: true },
    department: { type: String, default: 'Field Service', trim: true },
    skills: [{ type: String, trim: true }],
    joiningDate: { type: Date, default: Date.now },
    baseSalary: { type: Number, min: 0, default: 0 },
    emergencyContact: { type: String, trim: true },
    address: { type: String, trim: true },
  },
  { timestamps: true },
);

export default mongoose.model('Employee', employeeSchema);

