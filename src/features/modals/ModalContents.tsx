import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ModalFrame } from '../../shared/ui';
import type { ModalParamsMap, ModalType } from './modalRegistry';

export interface ModalProps<K extends ModalType> {
  params: ModalParamsMap[K];
  onClose: () => void;
  hideBackdrop: boolean;
}

const codeSx = {
  fontFamily: 'ui-monospace, "Cascadia Mono", Consolas, monospace',
  fontWeight: 600,
  px: 1,
  py: 0.25,
  borderRadius: 1,
  bgcolor: 'action.selected',
} as const;

export function WelcomeModal({ onClose, hideBackdrop }: ModalProps<'welcome'>) {
  return (
    <ModalFrame open title="Welcome to RealPlay" onClose={onClose} hideBackdrop={hideBackdrop} actionLabel="Let's go">
      <Typography color="text.secondary">
        Your account is ready. Explore the games and enjoy your welcome bonus.
      </Typography>
    </ModalFrame>
  );
}

export function PromoModal({ params, onClose, hideBackdrop }: ModalProps<'promo'>) {
  return (
    <ModalFrame open title="Promo unlocked" onClose={onClose} hideBackdrop={hideBackdrop}>
      <Typography color="text.secondary">
        Your promo code{' '}
        <Box component="span" sx={codeSx}>
          {params.code}
        </Box>{' '}
        is ready to use.
      </Typography>
    </ModalFrame>
  );
}

export function InviteModal({ params, onClose, hideBackdrop }: ModalProps<'invite'>) {
  return (
    <ModalFrame open title="You've been invited" onClose={onClose} hideBackdrop={hideBackdrop}>
      <Typography color="text.secondary">
        Your friend{' '}
        <Box component="span" sx={codeSx}>
          {params.friendId}
        </Box>{' '}
        invited you to play on RealPlay.
      </Typography>
    </ModalFrame>
  );
}

// The spec maps ?signup=1 to a Registration modal, but modals only show to
// signed-in users, so its content says they are already registered.
export function SignupModal({ onClose, hideBackdrop }: ModalProps<'signup'>) {
  return (
    <ModalFrame open title="Registration" onClose={onClose} hideBackdrop={hideBackdrop}>
      <Typography color="text.secondary">
        You're already registered and signed in, so there's nothing more to do here.
      </Typography>
    </ModalFrame>
  );
}
