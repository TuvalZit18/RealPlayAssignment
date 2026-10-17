import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useState, type FormEvent } from 'react';
import { ApiError } from '../../shared/api';
import { useRegister } from './useRegister';
import { validateRegister, type FieldErrors, type RegisterValues } from './validation';

export function RegisterForm() {
  const { register, isPending, error } = useRegister();
  const [values, setValues] = useState<RegisterValues>({ name: '', email: '' });
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const serverFieldErrors: FieldErrors = error instanceof ApiError ? (error.fields ?? {}) : {};
  const fieldError = (field: keyof RegisterValues) => clientErrors[field] ?? serverFieldErrors[field];

  const update = (field: keyof RegisterValues) => (value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    // After the first submit, re-validate as the user types.
    if (submitted) setClientErrors(validateRegister(next));
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    const errors = validateRegister(values);
    setClientErrors(errors);
    if (Object.keys(errors).length === 0) register(values);
  };

  // Field errors show under their inputs; anything else shows as one message.
  const hasFormFieldErrors = Boolean(serverFieldErrors.name || serverFieldErrors.email);
  const generalError = error && !hasFormFieldErrors ? error.message : null;

  return (
    <Stack component="form" spacing={2} noValidate onSubmit={onSubmit}>
      {generalError && (
        <Alert severity="error" role="alert">
          {generalError}
        </Alert>
      )}
      <TextField
        label="Name"
        name="name"
        autoComplete="name"
        value={values.name}
        onChange={(event) => update('name')(event.target.value)}
        error={Boolean(fieldError('name'))}
        helperText={fieldError('name')}
        disabled={isPending}
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        value={values.email}
        onChange={(event) => update('email')(event.target.value)}
        error={Boolean(fieldError('email'))}
        helperText={fieldError('email')}
        disabled={isPending}
      />
      <Button type="submit" variant="contained" size="large" disabled={isPending}>
        {isPending ? 'Creating account…' : 'Create account'}
      </Button>
    </Stack>
  );
}
