import type { PaletteRange } from '@mui/joy/styles';

declare module '@mui/joy/styles' {
  interface TypographySystemOverrides {
    fontFamily: true;
  }
  interface ColorPalettePropOverrides {
    purpleSearch: true;
  }
  interface Palette {
    purpleSearch: PaletteRange;
  }
}