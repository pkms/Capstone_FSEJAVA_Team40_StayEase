import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function LoginRegister({ navigate }: { navigate: (hash: string) => void }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { show } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'login') await login(email, password);
      else await register(email, password, name);
      show(mode === 'login' ? 'Logged in' : 'Account created', 'success');
      // navigate back to redirect if provided
      const qp = new URLSearchParams(window.location.hash.split('?')[1]);
      const redirect = qp.get('redirect');
      if (redirect) {
        // redirect was encoded; decode and set hash
        const dest = decodeURIComponent(redirect);
        navigate(dest);
      } else {
        navigate('#/');
      }
    } catch (e: any) {
      setError(e.message || 'Auth failed');
      show(e.message || 'Auth failed', 'error');
    }
  };

  return (
    <div className="page auth card">
      <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
      <form onSubmit={submit}>
        {mode === 'register' && (
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
        )}
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <div className="form-error">{error}</div>}
        <div className="row actions">
          <button className="primary-button" type="submit">{mode === 'login' ? 'Login' : 'Register'}</button>
          <button type="button" className="link-button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Create an account' : 'Have an account?'} </button>
        </div>
      </form>
    </div>
  );
}
