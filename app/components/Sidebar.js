'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊', section: 'dashboard' },
  { href: '/dashboard/students', label: 'Étudiants', icon: '👥', section: 'students' },
  { href: '/dashboard/modules', label: 'Modules', icon: '📚', section: 'modules' },
  { href: '/dashboard/absences', label: 'Absences', icon: '📋', section: 'absences' },
  { href: '/dashboard/grades', label: 'Notes', icon: '📝', section: 'grades' },
  { href: '/dashboard/decisions', label: 'Décisions', icon: '⚖️', section: 'decisions' },
  { href: '/dashboard/export', label: 'Documents', icon: '📄', section: 'export' },
  { href: '/dashboard/settings', label: 'Paramètres', icon: '⚙️', section: 'settings' },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src="/esisa-logo.svg" alt="ESISA" className="sidebar-logo-img" />
          <span className="sidebar-brand">ESISA</span>
          <button className="sidebar-close" onClick={onClose} aria-label="Close sidebar">
            ✕
          </button>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.section}
              href={item.href}
              className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={() => signOut({ callbackUrl: '/login' })}>
            🚪 Déconnexion
          </button>
        </div>
      </aside>
      <div
        className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
      />
    </>
  );
}
