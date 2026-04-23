import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faRightFromBracket, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { useClientStore } from '@/store/client.store';

export default function NavUserMenu() {
  const user = useClientStore(s => s.user);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, right: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Esperar a que Zustand rehidrate desde localStorage antes de renderizar
    if (useClientStore.persist.hasHydrated()) {
      setMounted(true);
    } else {
      const unsub = useClientStore.persist.onFinishHydration(() => setMounted(true));
      return unsub;
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, { passive: true });
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onOutside(e: MouseEvent) {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        dropdownRef.current?.contains(e.target as Node)
      ) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [open]);

  // Antes de hidratar: placeholder del mismo tamaño para evitar layout shift
  if (!mounted) {
    return <div className="nav-user-skeleton" aria-hidden="true" />;
  }

  // Si el store aún no tiene datos (p.ej. login previo sin setAuth),
  // se muestra igual con fallback para que el usuario siempre vea algo
  const displayName = user
    ? `${user.name} ${user.lastname}`
    : 'Mi cuenta';

  function handleToggle() {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen(prev => !prev);
  }

  return (
    <>
      <button
        ref={triggerRef}
        className="nav-user-trigger"
        onClick={handleToggle}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="nav-user-name">{displayName}</span>
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`nav-user-chevron${open ? ' open' : ''}`}
        />
      </button>

      {open && createPortal(
        <div
          ref={dropdownRef}
          className="nav-user-dropdown"
          style={{ top: dropPos.top, right: dropPos.right }}
          role="menu"
        >
          <a
            href="/perfil"
            className="nav-user-option"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <FontAwesomeIcon icon={faUser} className="nav-user-option-icon" />
            Ver Perfil
          </a>
          <div className="nav-user-separator" role="separator" />
          <a
            href="/api/auth/logout"
            className="nav-user-option nav-user-option--logout"
            role="menuitem"
          >
            <FontAwesomeIcon icon={faRightFromBracket} className="nav-user-option-icon" />
            Cerrar Sesión
          </a>
        </div>,
        document.body
      )}
    </>
  );
}
