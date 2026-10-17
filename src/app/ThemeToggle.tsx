import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useThemeMode } from './theme';

export function ThemeToggle() {
  const { mode, toggleMode } = useThemeMode();
  const label = mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <Tooltip title={label}>
      <IconButton onClick={toggleMode} aria-label={label} color="inherit">
        {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
}
