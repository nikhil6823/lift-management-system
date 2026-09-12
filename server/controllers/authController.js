import jwt from 'jsonwebtoken';
import Employee from '../models/Employee.js';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { codeExpiry, createOneTimeCode, hashOneTimeCode } from '../utils/security.js';
import { isEmailDeliveryConfigured, sendSecurityCode } from '../utils/emailService.js';

function userPayload(user, employee) {
  return { token: generateToken(user), user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone }, employee };
}

async function issueCode(user, purpose) {
  const code = createOneTimeCode();
  if (purpose === 'email-verification') {
    user.emailVerificationCodeHash = hashOneTimeCode(code);
    user.emailVerificationExpiresAt = codeExpiry();
  } else {
    user.twoFactorCodeHash = hashOneTimeCode(code);
    user.twoFactorExpiresAt = codeExpiry();
  }
  await user.save();
  await sendSecurityCode({ email: user.email, name: user.name, purpose, code });
  return isEmailDeliveryConfigured();
}

function validCode(code, hash, expiresAt) {
  return Boolean(code && hash && expiresAt && expiresAt > new Date() && hashOneTimeCode(code) === hash);
}

export async function register(req, res) {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
  const isFirstUser = (await User.countDocuments()) === 0;
  if (!isFirstUser) return res.status(403).json({ message: 'Public registration is closed. Ask an administrator to provision your account.' });
  if (await User.exists({ email: email.toLowerCase() })) return res.status(409).json({ message: 'An account with this email already exists' });
  const user = await User.create({ name, email, password, phone, role: 'admin', emailVerified: false });
  await issueCode(user, 'email-verification');
  res.status(201).json({ verificationRequired: true, email: user.email });
}

export async function registerCustomer(req, res) {
  const { name, email, password, phone } = req.body;
  if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: 'Name, email and password are required' });
  if (await User.exists({ email: email.toLowerCase() })) return res.status(409).json({ message: 'An account with this email already exists' });
  const user = await User.create({ name, email, password, phone, role: 'customer', emailVerified: false });
  await issueCode(user, 'email-verification');
  res.status(201).json({ verificationRequired: true, email: user.email });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() }).select('+password');
  if (!user || !(await user.matchesPassword(password || ''))) return res.status(401).json({ message: 'Invalid email or password' });
  if (!user.active) return res.status(403).json({ message: 'Account is inactive' });
  if (!user.emailVerified) return res.status(403).json({ message: 'Verify your email before signing in', code: 'EMAIL_NOT_VERIFIED' });
  await issueCode(user, 'two-factor');
  res.json({ twoFactorRequired: true, email: user.email, challenge: generateToken(user, { expiresIn: '10m', purpose: 'two-factor' }) });
}

export async function verifyEmail(req, res) {
  const user = await User.findOne({ email: req.body.email?.toLowerCase() }).select('+emailVerificationCodeHash +emailVerificationExpiresAt');
  if (!user || !validCode(req.body.code, user.emailVerificationCodeHash, user.emailVerificationExpiresAt)) return res.status(400).json({ message: 'The verification code is invalid or expired' });
  user.emailVerified = true;
  user.emailVerificationCodeHash = undefined;
  user.emailVerificationExpiresAt = undefined;
  await user.save();
  const employee = await Employee.findOne({ user: user._id }).populate('user', 'name email phone');
  res.json(userPayload(user, employee));
}

export async function resendEmailVerification(req, res) {
  const user = await User.findOne({ email: req.body.email?.toLowerCase() });
  if (!user || user.emailVerified) return res.json({ message: 'If the account requires verification, a new code has been sent.' });
  await issueCode(user, 'email-verification');
  res.json({ message: 'If the account requires verification, a new code has been sent.' });
}

export async function verifyLoginCode(req, res) {
  let payload;
  try { payload = jwt.verify(req.body.challenge, process.env.JWT_SECRET); } catch { return res.status(400).json({ message: 'The sign-in challenge is invalid or expired' }); }
  if (payload.purpose !== 'two-factor') return res.status(400).json({ message: 'The sign-in challenge is invalid' });
  const user = await User.findById(payload.sub).select('+twoFactorCodeHash +twoFactorExpiresAt');
  if (!user || !user.active || !user.emailVerified || !validCode(req.body.code, user.twoFactorCodeHash, user.twoFactorExpiresAt)) return res.status(401).json({ message: 'The verification code is invalid or expired' });
  user.twoFactorCodeHash = undefined;
  user.twoFactorExpiresAt = undefined;
  await user.save();
  const employee = await Employee.findOne({ user: user._id }).populate('user', 'name email phone');
  res.json(userPayload(user, employee));
}

export async function me(req, res) {
  const employee = await Employee.findOne({ user: req.user._id }).populate('user', 'name email phone');
  res.json({ user: req.user, employee });
}

export async function updateProfile(req, res) {
  const { name, email, phone, address, emergencyContact } = req.body;
  if (!name?.trim() || !email?.trim()) return res.status(400).json({ message: 'Name and email are required' });
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail, _id: { $ne: req.user._id } });
  if (existingUser) return res.status(409).json({ message: 'An account with this email already exists' });
  req.user.name = name.trim();
  req.user.email = normalizedEmail;
  req.user.phone = phone?.trim() || '';
  await req.user.save();
  const employee = await Employee.findOne({ user: req.user._id });
  if (employee) {
    employee.address = address?.trim() || '';
    employee.emergencyContact = emergencyContact?.trim() || '';
    await employee.save();
  }
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role, phone: req.user.phone }, employee });
}
