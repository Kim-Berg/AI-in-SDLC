export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  return { valid: true };
}

export function validateRequired(value: unknown, fieldName: string): { valid: boolean; message?: string } {
  if (value === null || value === undefined || value === '') {
    return { valid: false, message: `${fieldName} is required` };
  }
  return { valid: true };
}

export function validatePositiveNumber(value: number, fieldName: string): { valid: boolean; message?: string } {
  if (typeof value !== 'number' || value <= 0) {
    return { valid: false, message: `${fieldName} must be a positive number` };
  }
  return { valid: true };
}
