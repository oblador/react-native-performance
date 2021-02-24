import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

test('renders App.render performance entry', async () => {
  render(<App />);
  await waitFor(() => screen.getByText(/App\.render/i));
});
