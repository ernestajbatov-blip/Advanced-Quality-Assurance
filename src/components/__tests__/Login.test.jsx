import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../../components/Login/Login';
import * as wellService from '../../axios/wellService';
import { vi } from 'vitest';

vi.mock('../../axios/wellService', () => ({
  login: vi.fn()
}));

describe('Login Component', () => {
  const mockOnLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders login form correctly', () => {
    render(<Login onLogin={mockOnLogin} />);
    expect(screen.getByText('Вход в систему')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Введите логин')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Введите пароль')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument();
  });

  it('updates input fields on change', async () => {
    render(<Login onLogin={mockOnLogin} />);
    const loginInput = screen.getByPlaceholderText('Введите логин');
    const passwordInput = screen.getByPlaceholderText('Введите пароль');

    await userEvent.type(loginInput, 'testuser');
    await userEvent.type(passwordInput, 'testpass');

    expect(loginInput).toHaveValue('testuser');
    expect(passwordInput).toHaveValue('testpass');
  });

  it('submits the form successfully', async () => {
    const mockUserData = { id: 1, name: 'Test User' };
    wellService.login.mockResolvedValueOnce({ data: mockUserData });
    
    render(<Login onLogin={mockOnLogin} />);
    
    await userEvent.type(screen.getByPlaceholderText('Введите логин'), 'testuser');
    await userEvent.type(screen.getByPlaceholderText('Введите пароль'), 'testpass');
    
    fireEvent.click(screen.getByRole('button', { name: 'Войти' }));

    expect(wellService.login).toHaveBeenCalledWith({ login: 'testuser', password: 'testpass' });
    
    await waitFor(() => {
      expect(localStorage.getItem('user')).toEqual(JSON.stringify(mockUserData));
      expect(mockOnLogin).toHaveBeenCalledWith(mockUserData);
    });
  });

  it('handles 401 unauthorized error', async () => {
    wellService.login.mockRejectedValueOnce({ response: { status: 401 } });
    
    render(<Login onLogin={mockOnLogin} />);
    
    await userEvent.type(screen.getByPlaceholderText('Введите логин'), 'testuser');
    await userEvent.type(screen.getByPlaceholderText('Введите пароль'), 'testpass');
    
    fireEvent.click(screen.getByRole('button', { name: 'Войти' }));

    await waitFor(() => {
      expect(screen.getByText('Неверный логин или пароль')).toBeInTheDocument();
    });
  });

  it('handles generic errors', async () => {
    wellService.login.mockRejectedValueOnce(new Error('Network error'));
    
    render(<Login onLogin={mockOnLogin} />);
    
    await userEvent.type(screen.getByPlaceholderText('Введите логин'), 'testuser');
    await userEvent.type(screen.getByPlaceholderText('Введите пароль'), 'testpass');
    
    fireEvent.click(screen.getByRole('button', { name: 'Войти' }));

    await waitFor(() => {
      expect(screen.getByText('Ошибка подключения к серверу')).toBeInTheDocument();
    });
  });

  it('submits form on enter key press in password field', async () => {
    const mockUserData = { id: 1, name: 'Test User' };
    wellService.login.mockResolvedValueOnce({ data: mockUserData });
    
    render(<Login onLogin={mockOnLogin} />);
    
    await userEvent.type(screen.getByPlaceholderText('Введите логин'), 'testuser');
    const passwordInput = screen.getByPlaceholderText('Введите пароль');
    await userEvent.type(passwordInput, 'testpass{enter}');

    expect(wellService.login).toHaveBeenCalledWith({ login: 'testuser', password: 'testpass' });
  });
});
