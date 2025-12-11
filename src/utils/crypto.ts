import { pbkdf2Sync } from 'node:crypto';

const _ITERATIONS = 10;
const _KEYLEN = 64;
const _DIGEST = 'sha512';

// Hash password using pbkdf2Sync
export function hashPassword(password: string) {
  return pbkdf2Sync(password, 'test', _ITERATIONS, _KEYLEN, _DIGEST).toString(
    'hex',
  );
}

// Verify password
export function verifyPassword(password: string, hash: string): boolean {
  const hashVerify = pbkdf2Sync(
    password,
    'test',
    _ITERATIONS,
    _KEYLEN,
    _DIGEST,
  ).toString('hex');
  return hash === hashVerify;
}
