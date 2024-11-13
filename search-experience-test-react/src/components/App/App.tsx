import React from 'react';
import { CssVarsProvider, extendTheme } from '@mui/joy/styles';
import CheckPage from '../CheckPage/CheckPage';

const theme = extendTheme({
  typography: {
    fontFamily: {
      display: 'Roboto',
      body: 'Roboto',
    }
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          solidBg: '#eb3500',
          solidHoverBg: '#F38666',
          outlinedBorder: '#eb3500',
          500: '#eb3500',
        }
      }
    },
    dark: {
      palette: {}
    }
  },
});

const App: React.FC<unknown> = () => {
  return (
    <CssVarsProvider theme={theme}>
      <CheckPage />
    </CssVarsProvider>
  );
}

export default App;
