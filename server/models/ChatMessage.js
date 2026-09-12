import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
  {
    body: { type: String, required: true, trim: true, maxlength: 2000 },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

chatMessageSchema.index({ recipient: 1, createdAt: -1 });
chatMessageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
export default mongoose.model('ChatMessage', chatMessageSchema);
