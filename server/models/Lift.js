import mongoose from 'mongoose';

const liftSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    building: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    make: { type: String, trim: true },
    model: { type: String, trim: true },
    serialNumber: { type: String, trim: true },
    capacityKg: { type: Number, min: 0 },
    floors: { type: Number, min: 1 },
    status: { type: String, enum: ['operational', 'maintenance', 'out-of-service'], default: 'operational' },
    lastServiceDate: Date,
    nextServiceDate: Date,
    warrantyUntil: Date,
    assignedTechnician: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    assignedCustomer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    location: {
      latitude: Number,
      longitude: Number,
    },
    notes: { type: String, maxlength: 2000 },
    customerStatus: {
      status: { type: String, enum: ['operational', 'maintenance', 'out-of-service'] },
      note: { type: String, maxlength: 1000 },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      updatedAt: Date,
    },
    images: [{
      data: { type: String, maxlength: 7000000 },
      name: { type: String, maxlength: 160 },
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true },
);

liftSchema.index({ building: 1, status: 1 });
liftSchema.index({ assignedCustomer: 1 });
export default mongoose.model('Lift', liftSchema);
