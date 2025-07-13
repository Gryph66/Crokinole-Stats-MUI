import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#4CAF50' }, // Green for actions (e.g., Save)
    secondary: { main: '#FF0000' }, // Red for accents (e.g., player 2)
    background: { default: '#f5f5f5', paper: '#fff' }, // Light gray background
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h2: { fontSize: '1.2rem', fontWeight: 500 },
    h3: { fontSize: '0.9rem', fontWeight: 400 },
    subtitle1: { fontSize: '0.7rem' },
  },
});

export default theme;