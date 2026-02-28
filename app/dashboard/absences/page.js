'use client';

import { useEffect, useState, useCallback } from 'react';
import { showToast } from '../../components/Toast';

export default function AbsencesPage() {
  const [students, setStudents] = useState([]);
  const [modules, setModules] = useState([]);
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState([]);
  const [form, setForm] = useState({ studentId: '', moduleId: '', date: '', status: 'present' });
  const [viewStudent, setViewStudent] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [sRes, mRes] = await Promise.all([fetch('/api/students'), fetch('/api/modules')]);
      setStudents(await sRes.json());
      setModules(await mRes.json());
    } catch {}
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const loadAttendance = async (sid) => {
    if (!sid) { setRecords([]); setSummary([]); return; }
    try {
      const res = await fetch(`/api/students/${sid}/attendance`);
      const data = await res.json();
      setRecords(data.records || []);
      setSummary(data.summary || []);
    } catch { setRecords([]); setSummary([]); }
  };

  useEffect(() => { if (viewStudent) loadAttendance(viewStudent); }, [viewStudent]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.studentId) { showToast('Sélectionnez un étudiant.'); return; }
    try {
      const res = await fetch(`/api/students/${form.studentId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId: form.moduleId, date: form.date, status: form.status }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      showToast('Présence enregistrée.');
      if (viewStudent === form.studentId) loadAttendance(viewStudent);
    } catch (err) { showToast(err.message || 'Erreur.'); }
  };

  const handleDeleteAttendance = async (id) => {
    try {
      await fetch(`/api/attendance/${id}`, { method: 'DELETE' });
      showToast('Enregistrement supprimé.');
      if (viewStudent) loadAttendance(viewStudent);
    } catch { showToast('Erreur.'); }
  };

  return (
    <section className="section active">
      <div className="section-toolbar"><h3>Gestion des Absences</h3></div>

      <div className="card form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>Étudiant
              <select value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} required>
                <option value="">— Sélectionner —</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} (A{s.year})</option>)}
              </select>
            </label>
            <label>Module
              <select value={form.moduleId} onChange={(e) => setForm({ ...form, moduleId: e.target.value })} required>
                <option value="">— Sélectionner —</option>
                {modules.map((m) => <option key={m.id} value={m.id}>{m.code} — {m.name}</option>)}
              </select>
            </label>
            <label>Date <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></label>
            <label>Statut
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} required>
                <option value="present">Présent</option>
                <option value="absent">Absent</option>
                <option value="late">En retard</option>
              </select>
            </label>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">Enregistrer</button>
          </div>
        </form>
      </div>

      <div className="card">
        <label>Voir pour :
          <select value={viewStudent} onChange={(e) => setViewStudent(e.target.value)} style={{ marginLeft: 8 }}>
            <option value="">— Sélectionner —</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
          </select>
        </label>
      </div>

      <div className="card table-card">
        <h4 style={{ padding: '18px 22px 10px' }}>Historique</h4>
        <div className="table-responsive">
          <table>
            <thead><tr><th>Date</th><th>Module</th><th>Statut</th><th>Actions</th></tr></thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan="4" className="empty">Aucun enregistrement</td></tr>
              ) : (
                records.map((r) => {
                  const badge = r.status === 'present' ? 'badge-success' : r.status === 'absent' ? 'badge-danger' : 'badge-warning';
                  const label = r.status === 'present' ? 'Présent' : r.status === 'absent' ? 'Absent' : 'Retard';
                  return (
                    <tr key={r.id}>
                      <td>{r.date}</td>
                      <td>{r.moduleName}</td>
                      <td><span className={`badge ${badge}`}>{label}</span></td>
                      <td><button className="btn-danger" onClick={() => handleDeleteAttendance(r.id)}>🗑️</button></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card table-card">
        <h4 style={{ padding: '18px 22px 10px' }}>Résumé par module</h4>
        <div className="table-responsive">
          <table>
            <thead><tr><th>Module</th><th>Total</th><th>Présent</th><th>Absent</th><th>Retard</th></tr></thead>
            <tbody>
              {summary.length === 0 ? (
                <tr><td colSpan="5" className="empty">—</td></tr>
              ) : (
                summary.map((s, i) => (
                  <tr key={i}>
                    <td>{s.moduleName}</td><td>{s.total}</td><td>{s.present}</td><td>{s.absent}</td><td>{s.late}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
