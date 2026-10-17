import { validateRegister } from './validation';

describe('validateRegister', () => {
  it('accepts a valid name and email', () => {
    expect(validateRegister({ name: 'Dana', email: 'dana@example.com' })).toEqual({});
  });

  it('requires both fields', () => {
    expect(validateRegister({ name: '  ', email: '' })).toEqual({
      name: 'Enter your name.',
      email: 'Enter your email address.',
    });
  });

  it('rejects an invalid email and an overlong name', () => {
    const errors = validateRegister({ name: 'a'.repeat(101), email: 'dana@example' });
    expect(errors.name).toMatch(/100 characters/);
    expect(errors.email).toMatch(/valid email/);
  });
});
