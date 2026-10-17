import type { PaletteMode } from '@mui/material/styles';
import { createContext, useContext } from 'react';
import { readVersioned, writeVersioned } from '../../shared/storage';

const STORAGE_KEY = 'rp.theme';
const STORAGE_VERSION = 1;

export const DEFAULT_MODE: PaletteMode = 'dark';

interface StoredMode {
  mode: PaletteMode;
}

const isStoredMode = (value: unknown): value is StoredMode => {
  const mode = (value as { mode?: unknown }).mode;
  return mode === 'dark' || mode === 'light';
};

export function readStoredMode(): PaletteMode {
  return readVersioned(STORAGE_KEY, STORAGE_VERSION, isStoredMode)?.mode ?? DEFAULT_MODE;
}

export function storeMode(mode: PaletteMode): void {
  writeVersioned<StoredMode>(STORAGE_KEY, STORAGE_VERSION, { mode });
}

interface ThemeModeContextValue {
  mode: PaletteMode;
  toggleMode: () => void;
}

export const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

export function useThemeMode(): ThemeModeContextValue {
  const value = useContext(ThemeModeContext);
  if (!value) throw new Error('useThemeMode must be used inside <ThemeModeProvider>');
  return value;
}
