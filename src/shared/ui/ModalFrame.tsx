import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useId, type ReactNode } from 'react';

interface ModalFrameProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Label of the single primary action. Defaults to "Got it", which closes the modal. */
  actionLabel?: string;
  onAction?: () => void;
}

// Shared look for every modal: title, close (X), body, one primary action.
// Full-screen on phones. See docs/architecture/ui.md.
export function ModalFrame({ open, title, onClose, children, actionLabel = 'Got it', onAction }: ModalFrameProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const titleId = useId();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="xs"
      aria-labelledby={titleId}
    >
      <DialogTitle id={titleId} sx={{ pr: 7, fontWeight: 650 }}>
        {title}
      </DialogTitle>
      <IconButton aria-label="Close" onClick={onClose} sx={{ position: 'absolute', right: 12, top: 12 }}>
        <CloseIcon />
      </IconButton>
      <DialogContent>{children}</DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button variant="contained" onClick={onAction ?? onClose}>
          {actionLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
