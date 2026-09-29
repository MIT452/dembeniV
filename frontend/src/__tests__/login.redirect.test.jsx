import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import { AuthProvider } from '../context/AuthContext';
import Login from '../components/Login';

vi.mock('axios', () => ({
  default: {
    post: vi.fn()
  }
}));

import axios from 'axios';

const renderWithRoutes = (initialPath = '/login') =>
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<div>ADMIN</div>} />
          <Route path="/compte" element={<div>COMPTE</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );

describe('Redirection après connexion', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    axios.post.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('Redirection correcte: Admin -> Dashboard Admin', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        data: { token: 't', _id: '1', firstname: 'A', lastname: 'B', email: 'admin@test.com', role: 'admin', status: 'approved' }
      }
    });

    renderWithRoutes('/login');

    fireEvent.change(await screen.findByPlaceholderText('exemple@domaine.com'), { target: { value: '  ADMIN@TEST.COM  ' } });
    fireEvent.change(screen.getByPlaceholderText('Votre mot de passe'), { target: { value: 'Admin123!' } });
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    await vi.runAllTimersAsync();
    expect(await screen.findByText('ADMIN')).toBeInTheDocument();
  });

  test('Redirection correcte: Citoyen -> Tableau de bord citoyen', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        data: { token: 't', _id: '2', firstname: 'C', lastname: 'D', email: 'citoyen@test.com', role: 'citoyen', status: 'approved' }
      }
    });

    renderWithRoutes('/login');

    fireEvent.change(await screen.findByPlaceholderText('exemple@domaine.com'), { target: { value: 'citoyen@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Votre mot de passe'), { target: { value: 'Citizen123!' } });
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    await vi.runAllTimersAsync();
    expect(await screen.findByText('COMPTE')).toBeInTheDocument();
  });
});
