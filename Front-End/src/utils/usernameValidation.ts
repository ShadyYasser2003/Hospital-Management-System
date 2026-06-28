/**
 * Username rules:
 * - 3 to 30 characters
 * - Letters (a-z, A-Z), digits (0-9), underscores (_) and dots (.) only
 * - Must NOT start or end with _ or .
 * - No spaces or other special characters
 */
const USERNAME_REGEX = /^[a-zA-Z0-9]([a-zA-Z0-9._]{1,28}[a-zA-Z0-9])?$/;

export interface UsernameValidationResult {
  valid: boolean;
  error?: string;
}

export function validateUsername(username: string): UsernameValidationResult {
  if (!username || username.trim() === '') {
    return { valid: false, error: 'Username is required' };
  }
  const trimmed = username.trim();
  if (trimmed.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }
  if (trimmed.length > 30) {
    return { valid: false, error: 'Username must be at most 30 characters' };
  }
  if (/\s/.test(trimmed)) {
    return { valid: false, error: 'Username cannot contain spaces' };
  }
  if (!USERNAME_REGEX.test(trimmed)) {
    if (/[^a-zA-Z0-9._]/.test(trimmed)) {
      return { valid: false, error: 'Username can only contain letters, numbers, underscores (_) and dots (.)' };
    }
    return { valid: false, error: 'Username must not start or end with a special character (_ or .)' };
  }
  return { valid: true };
}

/** Returns a human-readable hint for the username field */
export const USERNAME_HINT = '3–30 characters. Letters, numbers, _ and . only. Cannot start or end with _ or .';
