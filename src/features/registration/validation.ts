// Client-side checks matching the API rules (docs/architecture/api.md), so
// obvious mistakes never reach the network. The server validates too.

export interface RegisterValues {
  name: string;
  email: string;
}

export type FieldErrors = Partial<Record<keyof RegisterValues, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegister({ name, email }: RegisterValues): FieldErrors {
  const errors: FieldErrors = {};
  const trimmedName = name.trim();

  if (!trimmedName) errors.name = 'Enter your name.';
  else if (trimmedName.length > 100) errors.name = 'Name must be 100 characters or fewer.';

  if (!email.trim()) errors.email = 'Enter your email address.';
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Enter a valid email address, like name@example.com.';

  return errors;
}
