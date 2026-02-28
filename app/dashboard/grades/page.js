'use client';

import { useEffect, useState, useCallback } from 'react';
import { showToast } from '../../components/Toast';

export default function GradesPage() {
  const [students, setStudents] = useState([]);
  const [modules, setModules] = useState([]);
  const [notes, setNotes] = useState([]);
  const [average, setAverage] = useState(0);
  const [gradeForm, setGradeForm] = useState({ studentId: '', moduleId: '', grade: '' });
  const [rattForm, setRattForm] = useState({ studentId: '', moduleId: '', grade: '' });
  const [viewStudent, setViewStudent] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [sRes, mRes] = await Promise.all([fetch('/api/students'), fetch('/api/modules')]);
      setStudents(await sRes.json());
      setModules(await mRes.json());
    } catch {}
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const loadGrades = async (sid) => {
    if (!sid) { setNotes([]); setAverage(0); return; }
    try {
      const res = await fetch(`/api/students/${sid}/notes`);
      const data = await res.json();
      setNotes(data.notes || []);
      setAverage(data.average || 0);
    } catch { setNotes([]); setAverage(0); }
  };

  useEffect(() => { if (viewStudent) loadGrades(viewStudent); }, [viewStudent]);

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    if (!gradeForm.studentId) { showToast('Sélectionnez un étudiant.'); return; }
    try {
      const res = await fetch(`/api/students/${gradeForm.studentId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId: gradeForm.moduleId, grade: Number(gradeForm.grade) }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      showToast('Note enregistrée.');
      if (viewStudent === gradeForm.studentId) loadGrades(viewStudent);
    } catch (err) { showToast(err.message || 'Erreur.'); }
  };

  const handleRattSubmit = async (e) => {
    e.preventDefault();
    if (!rattForm.studentId || !rattForm.moduleId) { showToast('Sélectionnez étudiant et module.'); return; }
    try {
      const res = await fetch(`/api/students/${rattForm.studentId}/notes/${rattForm.moduleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade: Number(rattForm.grade) }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      showToast('Rattrapage enregistré.');
      if (viewStudent === rattForm.studentId) loadGrades(viewStudent);
    } catch (err) { showToast(err.message || 'Erreur.'); }
  };

  const handleDeleteNote = async (studentId, moduleId) => {
    try {
      await fetch(`/api/students/${studentId}/notes/${moduleId}`, { method: 'DELETE' });
      showToast('Note supprimée.');
      loadGrades(studentId);
    } catch { showToast('Erreur.'); }
  };

  return (
    <section className="section active">
      <div className="section-toolbar"><h3>Notes &amp; Rattrapages</h3></div>

      <div className="card form-card">
        <h4>Saisir une note</h4>
        <form onSubmit={handleGradeSubmit}>
          <div className="form-grid">
            <label>Étudiant
              <select value={gradeForm.studentId} onChange={(e) => setGradeForm({ ...gradeForm, studentId: e.target.value })} required>
                <option value="">— Sélectionner —</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} (A{s.year})</option>)}
              </select>
            </label>
            <label>Module
              <select value={gradeForm.moduleId} onChange={(e) => setGradeForm({ ...gradeForm, moduleId: e.target.value })} required>
                <option value="">— Sélectionner —</option>
                {modules.map((m) => <option key={m.id} value={m.id}>{m.code} — {m.name}</option>)}
              </select>
            </label>
            <label>Note (0-20) <input type="number" min="0" max="20" step="0.25" value={gradeForm.grade} onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })} required /></label>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">Enregistrer</button>
          </div>
        </form>
      </div>

      <div className="card form-card">
        <h4>Rattrapage</h4>
        <form onSubmit={handleRattSubmit}>
          <div className="form-grid">
            <label>Étudiant
              <select value={rattForm.studentId} onChange={(e) => setRattForm({ ...rattForm, studentId: e.target.value })} required>
                <option value="">— Sélectionner —</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} (A{s.year})</option>)}
              </select>
            </label>
            <label>Module
              <select value={rattForm.moduleId} onChange={(e) => setRattForm({ ...rattForm, moduleId: e.target.value })} required>
                <option value="">— Sélectionner —</option>
                {modules.map((m) => <option key={m.id} value={m.id}>{m.code} — {m.name}</option>)}
              </select>
            </label>
            <label>Note rattrapage (0-20) <input type="number" min="0" max="20" step="0.25" value={rattForm.grade} onChange={(e) => setRattForm({ ...rattForm, grade: e.target.value })} required /></label>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-warning">Soumettre rattrapage</button>
          </div>
        </form>
      </div>

      <div className="card">
        <label>Relevé pour :
          <select value={viewStudent} onChange={(e) => setViewStudent(e.target.value)} style={{ marginLeft: 8 }}>
            <option value="">— Sélectionner —</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
          </select>
        </label>
      </div>

      <div className="card table-card">
        <div className="table-responsive">
          <table>
            <thead><tr><th>Module</th><th>Code</th><th>Coeff.</th><th>Note</th><th>Ratt.</th><th>Effective</th><th>Statut</th><th>Actions</th></tr></thead>
            <tbody>
              {notes.length === 0 ? (
                <tr><td colSpan="8" className="empty">Aucune note</td></tr>
              ) : (
                notes.map((n) => {
                  const eff = Math.max(n.grade, n.rattrapageGrade || 0);
                  const validated = eff >= 10;
                  return (
                    <tr key={`${n.studentId}-${n.moduleId}`}>
                      <td>{n.moduleName}</td>
                      <td>{n.moduleCode || ''}</td>
                      <td>{n.coefficient}</td>
                      <td>{n.grade}</td>
                      <td>{n.rattrapageGrade ?? '—'}</td>
                      <td>{eff.toFixed(2)}</td>
                      <td><span className={`badge ${validated ? 'badge-success' : 'badge-danger'}`}>{validated ? 'Validé' : 'Non validé'}</span></td>
                      <td><button className="btn-danger" onClick={() => handleDeleteNote(n.studentId, n.moduleId)}>🗑️</button></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <p className="average-display">Moyenne pondérée : <strong>{average ? average.toFixed(2) : '—'}</strong></p>
      </div>
    </section>
  );
}
