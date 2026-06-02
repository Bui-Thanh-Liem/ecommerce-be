/* eslint-disable @typescript-eslint/no-unsafe-member-access */
const SENSITIVE_FIELDS = [
  'password',
  'confirmPassword',
  'oldPassword',
  'newPassword',
  'accessToken',
  'refreshToken',
  'token',
  'otp',
  'secret',
  'authorization',
  'cookie',
  'api_key',
  'signature',
];

export function sanitizeAuditPayload(data: any): any {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map(sanitizeAuditPayload);
  }

  if (typeof data !== 'object') {
    return data;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const clone = { ...data };

  for (const key of Object.keys(clone)) {
    const lower = key.toLowerCase();

    if (SENSITIVE_FIELDS.includes(lower)) {
      clone[key] = '******';
      continue;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    clone[key] = sanitizeAuditPayload(clone[key]);
  }

  return clone;
}
