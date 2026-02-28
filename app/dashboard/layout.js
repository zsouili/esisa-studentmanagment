'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import StarCanvas from '../components/StarCanvas';
import Toast from '../components/Toast';

const sectionTitles = {
  '/dashboard': 'Dashboard',
  '/dashboard/students': 'Étudiants',
  '/dashboard/modules': 'Modules',
  '/dashboard/absences': 'Absences',
  '/dashboard/grades': 'Notes & Rattrapages',
  '/dashboard/decisions': 'Décisions Académiques',
  '/dashboard/export': 'Documents & Export',
  '/dashboard/settings': 'Paramètres',
};

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const title = sectionTitles[pathname] || 'Dashboard';

  return (
    <>
      <StarCanvas />
      <div className="app-layout">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="main-wrapper">
          <Topbar title={title} onMenuToggle={() => setSidebarOpen(true)} />
          <main className="content">
            <Toast />
            {children}
          </main>
          <footer className="main-footer">
            <p>
              Developed by <strong>Zayd Swy</strong> — ESISA 1st Year Student &nbsp;|&nbsp; &copy; 2026 ESISA
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
