'use client';

import { useEffect, useState, useCallback } from 'react';
import { showToast } from '../../components/Toast';

function shortenFiliere(f) {
  if (!f) return '';
  if (f.includes('Intelligence Artificielle')) return 'SI-IA';
  if (f.includes('Transformation')) return 'SI-Trans';
  if (f.includes('Logiciel')) return 'IL';
  return f;
}

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', filiere: '', year: 1, semester: 1,
  });

  const fetchStudents = useCallback(async () => {
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      setStudents(data);
    } catch { setStudents([]); }
  }, []);

  const fetchFilieres = useCallback(async () => {
    try {
      const res = await fetch('/api/filieres');
      const data = await res.json();
      setFilieres(data);
    } catch { setFilieres([]); }
  }, []);

  useEffect(() => {
    fetchStudents();
    fetchFilieres();
  }, [fetchStudents, fetchFilieres]);

  const resetForm = () => {
    setForm({ firstName: '', lastName: '', email: '', filiere: '', year: 1, semester: 1 });
    setEditingId(null);
    setShowForm(false);
  };

  const openAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (s) => {
    setForm({
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email,
      filiere: s.filiere || s.department,
      year: s.year,
      semester: s.semester,
    });
    setEditingId(s.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId ? `/api/students/${editingId}` : '/api/students';
    const method = editingId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message);
      }
      showToast(editingId ? 'Étudiant mis à jour.' : 'Étudiant ajouté.');
      resetForm();
      fetchStudents();
    } catch (err) {
      showToast(err.message || 'Erreur.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet étudiant ?')) return;
    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Étudiant supprimé.');
        fetchStudents();
      } else {
        const d = await res.json();
        showToast(d.message);
      }
    } catch {
      showToast('Erreur de suppression.');
    }
  };

  return (
    <section className="section active">
      <div className="section-toolbar">
        <h3>Gestion des Étudiants</h3>
        <button className="btn-primary" onClick={openAdd}>+ Ajouter</button>
      </div>

      {showForm && (
        <div className="card form-card">
          <div className="form-header">
            <h4>{editingId ? 'Modifier étudiant' : 'Nouvel étudiant'}</h4>
            <button className="close-btn" onClick={resetForm}>✕</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <label>
                Prénom
                <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
              </label>
              <label>
                Nom
                <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
              </label>
              <label>
                Email
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </label>
              <label>
                Filière
                <select value={form.filiere} onChange={(e) => setForm({ ...form, filiere: e.target.value })} required>
                  <option value="">— Sélectionner —</option>
                  {filieres.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </label>
              <label>
                Année (1-5)
                <input type="number" min="1" max="5" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} required />
              </label>
              <label>
                Semestre (1-10)
                <input type="number" min="1" max="10" value={form.semester} onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })} required />
              </label>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Enregistrer</button>
              <button type="button" className="btn-outline" onClick={resetForm}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="card table-card">
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Nom</th><th>Email</th><th>Filière</th><th>Année</th><th>Sem.</th><th>Moyenne</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr><td colSpan="8" className="empty">Aucun étudiant</td></tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.firstName} {s.lastName}</td>
                    <td>{s.email}</td>
                    <td>{shortenFiliere(s.filiere || s.department)}</td>
                    <td>{s.year}</td>
                    <td>{s.semester}</td>
                    <td>{s.average ?? '—'}</td>
                    <td className="actions">
                      <button className="btn-edit" onClick={() => openEdit(s)}>✏️</button>
                      <button className="btn-danger" onClick={() => handleDelete(s.id)}>🗑️</button>
                    </td>
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
