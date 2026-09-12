import jwt from 'jsonwebtoken';

export function generateToken(user, options = {}) {
  return jwt.sign({ sub: user._id, role: user.role, ...(options.purpose ? { purpose: options.purpose } : {}) }, process.env.JWT_SECRET, { expiresIn: options.expiresIn || '7d' });
}

