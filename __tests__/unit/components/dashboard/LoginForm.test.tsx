import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from '@/components/dashboard/LoginForm';

describe('LoginForm', () => {
  it('renders password input and sign in button', () => {
    render(<LoginForm onLogin={jest.fn()} />);
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('renders logo and title', () => {
    render(<LoginForm onLogin={jest.fn()} />);
    expect(screen.getByText('Lead Dashboard')).toBeInTheDocument();
  });

  it('calls onLogin with password on submit', () => {
    const handleLogin = jest.fn().mockResolvedValue(true);
    render(<LoginForm onLogin={handleLogin} />);
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'my-pass' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    expect(handleLogin).toHaveBeenCalledWith('my-pass');
  });

  it('does not call onLogin with empty password', () => {
    const handleLogin = jest.fn().mockResolvedValue(false);
    render(<LoginForm onLogin={handleLogin} />);
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    expect(handleLogin).not.toHaveBeenCalled();
  });

  it('displays error message', () => {
    render(<LoginForm onLogin={jest.fn()} error="Invalid password" />);
    expect(screen.getByText('Invalid password')).toBeInTheDocument();
  });
});
