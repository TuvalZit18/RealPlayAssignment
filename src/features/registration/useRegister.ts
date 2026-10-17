import { useMutation } from '@tanstack/react-query';
import { useDispatch, useStore } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router';
import { useToast } from '../../shared/ui';
import { attributionCleared, selectAttributionParams } from '../attribution';
import { RETURN_TO_PARAM, safeReturnTo, sessionStarted } from '../auth';
import { registerUser, type RegisterRequest } from './api';
import type { RegisterValues } from './validation';

/**
 * The registration flow. The form only collects input and calls `register`.
 * See docs/architecture/frontend.md (Registration flow).
 */
export function useRegister() {
  const dispatch = useDispatch();
  const store = useStore<Parameters<typeof selectAttributionParams>[0]>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const mutation = useMutation({
    mutationFn: registerUser,
    // No retry (React Query's default for mutations): registration isn't
    // idempotent. On error, attribution stays stored for the next attempt.
    onSuccess: (session) => {
      dispatch(sessionStarted(session));
      dispatch(attributionCleared());
      showToast(`Welcome, ${session.user.name}! Your account is ready.`);
      void navigate(safeReturnTo(searchParams.get(RETURN_TO_PARAM)), { replace: true });
    },
  });

  const register = (values: RegisterValues) => {
    // Read attribution at submit time, so the latest stored record is sent.
    const attribution = selectAttributionParams(store.getState());
    const body: RegisterRequest = {
      name: values.name.trim(),
      email: values.email.trim(),
      ...(attribution && { attribution }),
    };
    mutation.mutate(body);
  };

  return { register, isPending: mutation.isPending, error: mutation.error };
}
