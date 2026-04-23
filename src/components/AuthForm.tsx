import { useState, type FormEvent, type ChangeEvent } from 'react';

type Mode = 'login' | 'register';

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const INITIAL_FORM: FormState = { name: '', email: '', password: '', confirmPassword: '' };

export default function AuthForm() {
  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  }

  function switchMode(newMode: Mode) {
    setMode(newMode);
    setError(null);
    setSuccess(null);
    setForm(INITIAL_FORM);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (mode === 'register' && form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body =
        mode === 'login'
          ? { email: form.email, password: form.password }
          : { name: form.name, email: form.email, password: form.password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Ocurrió un error. Intenta nuevamente.');
        return;
      }

      if (mode === 'login') {
        setSuccess('¡Sesión iniciada! Redirigiendo...');
        setTimeout(() => {
          window.location.href = data.redirect ?? '/clientes';
        }, 900);
      } else {
        setSuccess('¡Cuenta creada exitosamente! Ya puedes iniciar sesión.');
        setTimeout(() => switchMode('login'), 2000);
      }
    } catch {
      setError('Error de conexión. Verifica tu internet e intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  const isLogin = mode === 'login';

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* Brand */}
        <div className="auth-brand">
          <img src="/images/logo.png" alt="Season Harvest" className="auth-logo" />
          <span className="auth-eyebrow">Bienvenido a</span>
          <h1 className="auth-title">Season Harvest</h1>
          <p className="auth-subtitle">Distribuidora de frutas y verduras</p>
        </div>

        {/* Tab toggle */}
        <div className="auth-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={isLogin}
            className={`auth-tab${isLogin ? ' active' : ''}`}
            onClick={() => switchMode('login')}
            type="button"
          >
            Iniciar Sesión
          </button>
          <button
            role="tab"
            aria-selected={!isLogin}
            className={`auth-tab${!isLogin ? ' active' : ''}`}
            onClick={() => switchMode('register')}
            type="button"
          >
            Crear Cuenta
          </button>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {!isLogin && (
            <div className="auth-field">
              <label htmlFor="name">Nombre completo</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Tu nombre completo"
                value={form.name}
                onChange={handleChange}
                required
                autoComplete="name"
                disabled={loading}
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="correo@ejemplo.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              disabled={loading}
            />
          </div>

          {!isLogin && (
            <div className="auth-field">
              <label htmlFor="confirmPassword">Confirmar contraseña</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
                disabled={loading}
              />
            </div>
          )}

          {error && (
            <div className="auth-alert auth-alert--error" role="alert">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="auth-alert auth-alert--success" role="status">
              ✅ {success}
            </div>
          )}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? (
              <span className="auth-spinner-wrapper">
                <span className="auth-spinner" aria-hidden="true" />
                {isLogin ? 'Iniciando sesión...' : 'Creando cuenta...'}
              </span>
            ) : isLogin ? (
              'Iniciar Sesión'
            ) : (
              'Crear Cuenta'
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>o</span>
        </div>

        <p className="auth-switch">
          {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <button
            type="button"
            className="auth-switch-btn"
            onClick={() => switchMode(isLogin ? 'register' : 'login')}
          >
            {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
          </button>
        </p>
      </div>
    </div>
  );
}
