import mongoose from 'mongoose';

const locationLogSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
    accuracy: { type: Number, min: 0 },
    photoData: { type: String, maxlength: 7000000 },
    photoName: { type: String, maxlength: 160 },
    recordedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

locationLogSchema.index({ employee: 1, recordedAt: -1 });
export default mongoose.model('LocationLog', locationLogSchema);
