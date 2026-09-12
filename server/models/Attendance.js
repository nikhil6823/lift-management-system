import mongoose from 'mongoose';

const pointSchema = new mongoose.Schema({ latitude: Number, longitude: Number }, { _id: false });
const attendanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    workDate: { type: Date, required: true },
    status: { type: String, enum: ['present', 'absent', 'leave'], default: 'present' },
    clockIn: Date,
    clockOut: Date,
    clockInLocation: pointSchema,
    clockOutLocation: pointSchema,
    note: { type: String, maxlength: 500 },
  },
  { timestamps: true },
);

attendanceSchema.index({ employee: 1, workDate: 1 }, { unique: true });
export default mongoose.model('Attendance', attendanceSchema);

