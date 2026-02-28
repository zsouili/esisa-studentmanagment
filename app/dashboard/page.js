'use client';

import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [stats, setStats] = useState({ students: 0, modules: 0, notes: 0, absences: 0 });

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <section className="section active">
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-body">
            <span className="stat-value">{stats.students}</span>
            <span className="stat-label">Étudiants</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-body">
            <span className="stat-value">{stats.modules}</span>
            <span className="stat-label">Modules</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-body">
            <span className="stat-value">{stats.notes}</span>
            <span className="stat-label">Notes saisies</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🚫</div>
          <div className="stat-body">
            <span className="stat-value">{stats.absences}</span>
            <span className="stat-label">Absences</span>
          </div>
        </div>
      </div>
      <div className="card">
        <h3>Bienvenue sur le portail ESISA</h3>
        <p>
          Utilisez la barre latérale pour naviguer entre les sections : gestion des étudiants,
          modules (5 ans / 10 semestres), absences, notes, décisions académiques, et exportation de
          documents.
        </p>
        <p>Toutes les données sont gérées dynamiquement — ajoutez, modifiez ou supprimez librement.</p>
      </div>
    </section>
  );
}
