import mongoose from 'mongoose';

const serviceRequestSchema = new mongoose.Schema(
  {
    ticketNumber: { type: String, required: true, unique: true },
    requestType: { type: String, enum: ['service', 'new-lift', 'emergency', 'maintenance-reschedule', 'general-query'], default: 'service' },
    lift: { type: mongoose.Schema.Types.ObjectId, ref: 'Lift' },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, maxlength: 3000 },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    issueCategory: { type: String, trim: true, maxlength: 100 },
    status: { type: String, enum: ['open', 'assigned', 'in-progress', 'on-hold', 'resolved', 'closed'], default: 'open' },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    submittedByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedTechnician: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    dueDate: Date,
    requestedMaintenanceDate: Date,
    siteLocation: {
      address: { type: String, trim: true, maxlength: 300 },
      latitude: { type: Number, min: -90, max: 90 },
      longitude: { type: Number, min: -180, max: 180 },
    },
    attachments: [{
      data: { type: String, maxlength: 7500000 },
      name: { type: String, maxlength: 160 },
      type: { type: String, maxlength: 100 },
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now },
    }],
    technicianArrivalStatus: { type: String, enum: ['not-assigned', 'scheduled', 'en-route', 'arrived', 'on-site'], default: 'not-assigned' },
    technicianArrivalEta: Date,
    estimatedCompletion: Date,
    resolvedAt: Date,
    resolutionNotes: { type: String, maxlength: 3000 },
    partsReplaced: { type: String, maxlength: 2000 },
    review: {
      rating: { type: Number, min: 1, max: 5 },
      feedback: { type: String, maxlength: 1500 },
      reviewedAt: Date,
    },
  },
  { timestamps: true },
);

serviceRequestSchema.index({ status: 1, assignedTechnician: 1, createdAt: -1 });
serviceRequestSchema.index({ submittedByUser: 1, createdAt: -1 });
export default mongoose.model('ServiceRequest', serviceRequestSchema);
