import crypto from 'node:crypto';

export function createOneTimeCode() {
  return String(crypto.randomInt(100000, 1000000));
}

export function hashOneTimeCode(code) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

export function codeExpiry(minutes = 10) {
  return new Date(Date.now() + minutes * 60 * 1000);
}
