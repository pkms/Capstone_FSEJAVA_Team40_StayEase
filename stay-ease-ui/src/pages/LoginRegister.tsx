import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { strings } from '../constants/strings';
import { getStoredRole } from '../api/client';

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
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    if (mode === 'register' && !trimmedName) {
      setError(strings.auth.nameRequired);
      return;
    }
    if (!trimmedEmail) {
      setError(strings.auth.emailRequired);
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setError(strings.auth.emailInvalid);
      return;
    }
    if (!password) {
      setError(strings.auth.passwordRequired);
      return;
    }
    if (password.length < 6) {
      setError(strings.auth.passwordTooShort);
      return;
    }
    try {
      if (mode === 'login') await login(trimmedEmail, password);
      else await register(trimmedEmail, password, trimmedName);
      show(mode === 'login' ? strings.auth.loggedIn : strings.auth.accountCreated, 'success');
      // navigate back to redirect if provided
      const qp = new URLSearchParams(window.location.hash.split('?')[1]);
      const redirect = qp.get('redirect');
      if (redirect) {
        // redirect was encoded; decode and set hash
        const dest = decodeURIComponent(redirect);
        navigate(dest);
      } else {
        const role = getStoredRole();
        navigate(role === 'MANAGER' ? '#/manager' : role === 'ADMIN' ? '#/admin' : '#/');
      }
    } catch (e: any) {
      setError(e.message || strings.auth.authFailed);
      show(e.message || strings.auth.authFailed, 'error');
    }
  };

  return (
    <div className="page auth card">
      <h2>{mode === 'login' ? strings.auth.login : strings.auth.register}</h2>
      <form onSubmit={submit}>
        {mode === 'register' && (
          <label>
            {strings.auth.name}
            <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} />
          </label>
        )}
        <label>
          {strings.auth.email}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={254} />
        </label>
        <label>
          {strings.auth.password}
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        </label>
        {error && <div className="form-error">{error}</div>}
        <div className="row actions">
          <button className="primary-button" type="submit">{mode === 'login' ? strings.auth.login : strings.auth.register}</button>
          <button type="button" className="link-button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? strings.auth.createAccount : strings.auth.haveAccount} </button>
        </div>
      </form>
    </div>
  );
}
