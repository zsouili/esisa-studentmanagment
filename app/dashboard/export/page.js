'use client';

import { useEffect, useState, useCallback } from 'react';
import { showToast } from '../../components/Toast';

function downloadCSV(filename, rows) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

export default function ExportPage() {
  const [students, setStudents] = useState([]);
  const [modules, setModules] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const [sRes, mRes] = await Promise.all([fetch('/api/students'), fetch('/api/modules')]);
      setStudents(await sRes.json());
      setModules(await mRes.json());
    } catch {}
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const exportStudents = () => {
    const rows = [['ID', 'Prénom', 'Nom', 'Email', 'Filière', 'Année', 'Semestre', 'Moyenne']];
    students.forEach((s) => rows.push([s.id, s.firstName, s.lastName, s.email, s.filiere || s.department, s.year, s.semester, s.average ?? '']));
    downloadCSV('etudiants.csv', rows);
    showToast('Export étudiants téléchargé.');
  };

  const exportModules = () => {
    const rows = [['Code', 'Nom', 'Coefficient', 'Année', 'Semestre', 'Filière']];
    modules.forEach((m) => rows.push([m.code, m.name, m.coefficient, m.year, m.semester, m.filiere]));
    downloadCSV('modules.csv', rows);
    showToast('Export modules téléchargé.');
  };

  const exportGrades = async () => {
    const rows = [['Étudiant', 'Module', 'Code', 'Note', 'Rattrapage', 'Effective', 'Validé']];
    for (const s of students) {
      try {
        const res = await fetch(`/api/students/${s.id}/notes`);
        const data = await res.json();
        (data.notes || []).forEach((n) => {
          const eff = Math.max(n.grade, n.rattrapageGrade || 0);
          rows.push([`${s.firstName} ${s.lastName}`, n.moduleName, n.moduleCode || '', n.grade, n.rattrapageGrade ?? '', eff, eff >= 10 ? 'Oui' : 'Non']);
        });
      } catch {}
    }
    downloadCSV('notes.csv', rows);
    showToast('Export notes téléchargé.');
  };

  return (
    <section className="section active">
      <div className="section-toolbar"><h3>Documents &amp; Export</h3></div>
      <div className="card">
        <p>Exportez les données en CSV pour une utilisation externe.</p>
        <div className="form-actions" style={{ marginTop: 16 }}>
          <button className="btn-primary" onClick={exportStudents}>📥 Étudiants (CSV)</button>
          <button className="btn-primary" onClick={exportModules}>📥 Modules (CSV)</button>
          <button className="btn-primary" onClick={exportGrades}>📥 Notes (CSV)</button>
        </div>
      </div>
    </section>
  );
}
