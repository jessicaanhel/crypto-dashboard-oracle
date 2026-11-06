import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import App from './App';
import { theme } from './theme/theme';

test('renders the dashboard overview by default', () => {
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <App />
      </MemoryRouter>
    </ThemeProvider>,
  );
  expect(screen.getByRole('heading', { name: /Overview — Smart Money Flow/i })).toBeInTheDocument();
  expect(screen.getByText('Market Oracle App')).toBeInTheDocument();
});
