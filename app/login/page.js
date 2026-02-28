'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import StarCanvas from '../components/StarCanvas';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      router.push('/dashboard');
    }
  };

  const fillDemo = () => {
    setEmail('esisa@ac.ma');
    setPassword('esisa123');
  };

  return (
    <>
      <StarCanvas />
      <div className="login-overlay">
        <div className="login-card">
          <div className="login-logo">
            <img src="/esisa-logo.svg" alt="ESISA Logo" className="login-logo-img" />
          </div>
          <h1 className="login-title">ESISA Student Management</h1>
          <p className="login-subtitle">Connectez-vous pour accéder au portail</p>
          <form onSubmit={handleSubmit}>
            <label className="login-label">
              Email
              <input
                type="email"
                placeholder="esisa@ac.ma"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="login-label">
              Mot de passe
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
            <button type="button" className="login-demo-btn" onClick={fillDemo}>
              🚀 Accès Démo
            </button>
            {error && <p className="login-error">{error}</p>}
          </form>
          <div className="login-footer">
            <p className="login-hint">
              Demo : <strong>esisa@ac.ma</strong> / <strong>esisa123</strong>
            </p>
            <p className="login-author">Developed by Zayd Swy — ESISA 1st Year Student</p>
          </div>
        </div>
      </div>
    </>
  );
}
