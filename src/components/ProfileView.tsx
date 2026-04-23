import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useClientStore } from '@/store/client.store';
import type { ClientUser } from '@/store/client.store';

interface EditForm {
  name: string;
  lastname: string;
  email: string;
  birthdate: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const EMPTY_FORM: EditForm = {
  name: '', lastname: '', email: '',
  birthdate: '', phone: '', password: '', confirmPassword: '',
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' });
}

function getMaxBirthdate() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().split('T')[0];
}

export default function ProfileView() {
  const user = useClientStore(s => s.user);
  const setUser = useClientStore(s => s.setUser);
  const clearAuth = useClientStore(s => s.clearAuth);

  const [mounted, setMounted] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState<EditForm>(EMPTY_FORM);

  const fakePassword = useRef('•'.repeat(8 + Math.floor(Math.random() * 6))).current;

  useEffect(() => {
    if (useClientStore.persist.hasHydrated()) {
      setMounted(true);
    } else {
      const unsub = useClientStore.persist.onFinishHydration(() => setMounted(true));
      return unsub;
    }
  }, []);

  useEffect(() => {
    if (editOpen && user) {
      setForm({
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        birthdate: user.birthdate?.split('T')[0] ?? '',
        phone: user.phone?.toString() ?? '',
        password: '',
        confirmPassword: '',
      });
      setFormError(null);
    }
  }, [editOpen, user]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError(null);
  }

  async function handleUpdate(e: FormEvent) {
    e.preventDefault();

    // Validación client-side → error inline en el form
    if (form.password && form.password !== form.confirmPassword) {
      setFormError('Las contraseñas no coinciden.');
      return;
    }
    if (form.phone && !/^[0-9]{9}$/.test(form.phone)) {
      setFormError('El teléfono debe tener 9 dígitos (ej: 912345678).');
      return;
    }

    setLoading(true);
    setFormError(null);

    try {
      const body: Record<string, unknown> = {
        name: form.name,
        lastname: form.lastname,
        email: form.email,
        birthdate: form.birthdate,
      };
      if (form.phone) body.phone = Number(form.phone);
      if (form.password) body.password = form.password;

      const res = await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        // Error del backend → toast
        toast.error(data.message ?? 'No se pudo actualizar el perfil.');
        return;
      }

      // Éxito del backend → actualizar store + toast + cerrar modal
      setUser(data.user as ClientUser);
      setEditOpen(false);
      toast.success(data.message ?? '¡Perfil actualizado correctamente!');
    } catch {
      toast.error('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!user) return;
    setLoading(true);

    try {
      const res = await fetch('/api/profile/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user._id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setDeleteConfirm(false);
        toast.error(data.message ?? 'No se pudo eliminar la cuenta.');
        return;
      }

      clearAuth();
      window.location.href = '/';
    } catch {
      toast.error('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) {
    return <div className="profile-skeleton" aria-hidden="true" />;
  }

  if (!user) {
    return (
      <div className="profile-wrapper">
        <p className="profile-empty">
          No se encontraron datos de sesión. <a href="/auth">Inicia sesión</a>
        </p>
      </div>
    );
  }

  const initials = `${user.name[0]}${user.lastname[0]}`.toUpperCase();

  return (
    <div className="profile-wrapper">

      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />

      {/* ── Tarjeta de perfil ── */}
      <div className="profile-card">

        <div className="profile-header">
          <div className="profile-avatar">{initials}</div>
          <div className="profile-header-info">
            <h2>{user.name} {user.lastname}</h2>
            <p>{user.email}</p>
          </div>
        </div>

        <div className="profile-body">
          <div className="profile-grid">
            <div className="profile-field">
              <span className="profile-field-label">Nombre</span>
              <span className="profile-field-value">{user.name}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Apellido</span>
              <span className="profile-field-value">{user.lastname}</span>
            </div>
            <div className="profile-field profile-field--full">
              <span className="profile-field-label">Correo electrónico</span>
              <span className="profile-field-value">{user.email}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Fecha de nacimiento</span>
              <span className="profile-field-value">{formatDate(user.birthdate)}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Teléfono</span>
              <span className="profile-field-value">{user.phone ?? '—'}</span>
            </div>
            <div className="profile-field profile-field--full">
              <span className="profile-field-label">Contraseña</span>
              <span className="profile-field-value profile-password">{fakePassword}</span>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button className="profile-btn profile-btn--edit" onClick={() => setEditOpen(true)}>
            Editar perfil
          </button>
          <button className="profile-btn profile-btn--delete" onClick={() => setDeleteConfirm(true)}>
            Eliminar cuenta
          </button>
        </div>
      </div>

      {/* ── Modal de edición ── */}
      {editOpen && (
        <div className="profile-overlay" onClick={(e) => e.target === e.currentTarget && setEditOpen(false)}>
          <div className="profile-modal" role="dialog" aria-modal="true" aria-label="Editar perfil">
            <div className="profile-modal-header">
              <h3>Editar perfil</h3>
              <button className="profile-modal-close" onClick={() => setEditOpen(false)} aria-label="Cerrar">✕</button>
            </div>

            <form onSubmit={handleUpdate} noValidate>
              <div className="profile-modal-body">
                <div className="profile-modal-row">
                  <div className="auth-field">
                    <label htmlFor="edit-name">Nombre</label>
                    <input id="edit-name" name="name" type="text" value={form.name} onChange={handleChange} required disabled={loading} />
                  </div>
                  <div className="auth-field">
                    <label htmlFor="edit-lastname">Apellido</label>
                    <input id="edit-lastname" name="lastname" type="text" value={form.lastname} onChange={handleChange} required disabled={loading} />
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="edit-email">Correo electrónico</label>
                  <input id="edit-email" name="email" type="email" value={form.email} onChange={handleChange} required disabled={loading} />
                </div>

                <div className="profile-modal-row">
                  <div className="auth-field">
                    <label htmlFor="edit-birthdate">Fecha de nacimiento</label>
                    <input id="edit-birthdate" name="birthdate" type="date" max={getMaxBirthdate()} value={form.birthdate} onChange={handleChange} required disabled={loading} />
                  </div>
                  <div className="auth-field">
                    <label htmlFor="edit-phone">Teléfono <span className="auth-optional">(opcional)</span></label>
                    <input id="edit-phone" name="phone" type="tel" placeholder="912345678" maxLength={9} value={form.phone} onChange={handleChange} disabled={loading} />
                  </div>
                </div>

                <div className="profile-modal-divider">
                  <span>Cambiar contraseña <span className="auth-optional">(dejar vacío para no cambiar)</span></span>
                </div>

                <div className="auth-field">
                  <label htmlFor="edit-password">Nueva contraseña</label>
                  <input id="edit-password" name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} autoComplete="new-password" disabled={loading} />
                </div>
                <div className="auth-field">
                  <label htmlFor="edit-confirm">Confirmar contraseña</label>
                  <input id="edit-confirm" name="confirmPassword" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={handleChange} autoComplete="new-password" disabled={loading} />
                </div>

                {/* Solo errores de validación client-side */}
                {formError && (
                  <div className="auth-alert auth-alert--error">⚠️ {formError}</div>
                )}
              </div>

              <div className="profile-modal-footer">
                <button type="button" className="profile-btn profile-btn--cancel" onClick={() => setEditOpen(false)} disabled={loading}>
                  Cancelar
                </button>
                <button type="submit" className="profile-btn profile-btn--save" disabled={loading}>
                  {loading ? (
                    <span className="auth-spinner-wrapper">
                      <span className="auth-spinner" aria-hidden="true" />
                      Guardando...
                    </span>
                  ) : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Confirmación de eliminar ── */}
      {deleteConfirm && (
        <div className="profile-overlay" onClick={(e) => e.target === e.currentTarget && setDeleteConfirm(false)}>
          <div className="profile-modal profile-modal--sm" role="dialog" aria-modal="true">
            <div className="profile-modal-header">
              <h3>¿Eliminar cuenta?</h3>
              <button className="profile-modal-close" onClick={() => setDeleteConfirm(false)} aria-label="Cerrar">✕</button>
            </div>
            <div className="profile-modal-body">
              <p className="profile-delete-warning">
                Esta acción es <strong>irreversible</strong>. Se eliminarán todos tus datos permanentemente.
              </p>
            </div>
            <div className="profile-modal-footer">
              <button className="profile-btn profile-btn--cancel" onClick={() => setDeleteConfirm(false)} disabled={loading}>
                Cancelar
              </button>
              <button className="profile-btn profile-btn--confirm-delete" onClick={handleDelete} disabled={loading}>
                {loading ? (
                  <span className="auth-spinner-wrapper">
                    <span className="auth-spinner" aria-hidden="true" />
                    Eliminando...
                  </span>
                ) : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
