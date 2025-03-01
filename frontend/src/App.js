import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container } from '@mui/material';
import Home from './pages/Home';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3', // EatWise blue
      light: '#64b5f6',
      dark: '#1976d2',
    },
    secondary: {
      main: '#ff9800', // EatWise orange
      light: '#ffb74d',
      dark: '#f57c00',
    },
    eatwise: {
      blue: '#2196f3',
      orange: '#ff9800',
    },
    success: {
      main: '#4caf50',
    },
    warning: {
      main: '#ff9800',
    },
    error: {
      main: '#f44336',
    },
    background: {
      default: '#f5f5f5',
    }
  },
  typography: {
    fontFamily: "'Poppins', 'Roboto', 'Arial', sans-serif",
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    logoText: {
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 700,
      letterSpacing: '0.5px',
    }
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container>
        <Home />
      </Container>
    </ThemeProvider>
  );
}

export default App;
