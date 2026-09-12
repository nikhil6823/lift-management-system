import mongoose from 'mongoose';
import ChatMessage from '../models/ChatMessage.js';
import User from '../models/User.js';

const populated = (query) => query.populate('sender', 'name role').populate('recipient', 'name role');

export async function listContacts(req, res) {
  const contacts = await User.find({ _id: { $ne: req.user._id }, active: true }).select('name role').sort({ role: 1, name: 1 });
  res.json(contacts);
}

export async function listMessages(req, res) {
  const withUser = req.query.with;
  let filter = { recipient: null };
  if (withUser) {
    if (!mongoose.isValidObjectId(withUser)) return res.status(400).json({ message: 'Invalid chat contact' });
    filter = { $or: [
      { sender: req.user._id, recipient: withUser },
      { sender: withUser, recipient: req.user._id },
    ] };
  }
  const messages = await populated(ChatMessage.find(filter).sort({ createdAt: -1 }).limit(100));
  res.json(messages.reverse());
}

export async function createMessage(req, res) {
  const body = req.body.body?.trim();
  const recipient = req.body.recipient || null;
  if (!body) return res.status(400).json({ message: 'Write a message before sending' });
  if (recipient && (!mongoose.isValidObjectId(recipient) || recipient === req.user._id.toString())) return res.status(400).json({ message: 'Choose a valid chat contact' });
  if (recipient && !await User.exists({ _id: recipient, active: true })) return res.status(404).json({ message: 'Chat contact is unavailable' });
  const message = await ChatMessage.create({ body, sender: req.user._id, recipient });
  const result = await populated(ChatMessage.findById(message._id));
  const io = req.app.get('io');
  if (recipient) {
    io?.to(`user:${req.user._id}`).to(`user:${recipient}`).emit('chat:new', result);
  } else {
    io?.emit('chat:new', result);
  }
  res.status(201).json(result);
}
