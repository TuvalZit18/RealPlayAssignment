import Box from '@mui/material/Box';
import { BRAND_VIOLET } from './brand';

interface LogoProps {
  /** Show the REALPLAY wordmark next to the monogram. */
  withWordmark?: boolean;
  size?: number;
}

// Rebuilt from RealPlay's brand: white "RP" monogram on the brand violet,
// with a widely tracked wordmark. See docs/architecture/ui.md.
export function Logo({ withWordmark = true, size = 32 }: LogoProps) {
  return (
    <Box
      component="span"
      role="img"
      aria-label="RealPlay"
      sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.25, color: 'text.primary' }}
    >
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <rect width="32" height="32" rx="8" fill={BRAND_VIOLET} />
        <text
          x="16"
          y="21.5"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily='"Inter Variable", Inter, system-ui, sans-serif'
          fontSize="14"
          fontWeight="600"
          letterSpacing="0.5"
        >
          RP
        </text>
      </svg>
      {withWordmark && (
        <Box
          component="span"
          aria-hidden="true"
          sx={{ fontWeight: 600, fontSize: size * 0.5, letterSpacing: '0.3em', lineHeight: 1 }}
        >
          REALPLAY
        </Box>
      )}
    </Box>
  );
}
