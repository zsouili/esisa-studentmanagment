'use client';

import { useEffect, useState, useCallback } from 'react';
import { showToast } from '../../components/Toast';

function shortenFiliere(f) {
  if (!f) return '';
  if (f === 'ALL') return 'Toutes';
  if (f.includes('Intelligence Artificielle')) return 'SI-IA';
  if (f.includes('Transformation')) return 'SI-Trans';
  if (f.includes('Logiciel')) return 'IL';
  return f;
}

export default function ModulesPage() {
  const [modules, setModules] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterYear, setFilterYear] = useState('');
  const [filterSem, setFilterSem] = useState('');
  const [form, setForm] = useState({
    code: '', name: '', coefficient: 2, year: 1, semester: 1, filiere: 'ALL',
  });

  const fetchModules = useCallback(async () => {
    let url = '/api/modules?';
    if (filterYear) url += `year=${filterYear}&`;
    if (filterSem) url += `semester=${filterSem}&`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      setModules(data);
    } catch { setModules([]); }
  }, [filterYear, filterSem]);

  const fetchFilieres = useCallback(async () => {
    try {
      const res = await fetch('/api/filieres');
      const data = await res.json();
      setFilieres(data);
    } catch { setFilieres([]); }
  }, []);

  useEffect(() => { fetchModules(); fetchFilieres(); }, [fetchModules, fetchFilieres]);

  const resetForm = () => {
    setForm({ code: '', name: '', coefficient: 2, year: 1, semester: 1, filiere: 'ALL' });
    setEditingId(null);
    setShowForm(false);
  };

  const openAdd = () => { resetForm(); setShowForm(true); };

  const openEdit = (m) => {
    setForm({
      code: m.code, name: m.name, coefficient: m.coefficient,
      year: m.year, semester: m.semester, filiere: m.filiere,
    });
    setEditingId(m.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId ? `/api/modules/${editingId}` : '/api/modules';
    const method = editingId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      showToast(editingId ? 'Module mis à jour.' : 'Module ajouté.');
      resetForm();
      fetchModules();
    } catch (err) { showToast(err.message || 'Erreur.'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce module ?')) return;
    try {
      const res = await fetch(`/api/modules/${id}`, { method: 'DELETE' });
      if (res.ok) { showToast('Module supprimé.'); fetchModules(); }
      else { const d = await res.json(); showToast(d.message); }
    } catch { showToast('Erreur de suppression.'); }
  };

  return (
    <section className="section active">
      <div className="section-toolbar">
        <h3>Gestion des Modules</h3>
        <button className="btn-primary" onClick={openAdd}>+ Ajouter</button>
      </div>

      {showForm && (
        <div className="card form-card">
          <div className="form-header">
            <h4>{editingId ? 'Modifier module' : 'Nouveau module'}</h4>
            <button className="close-btn" onClick={resetForm}>✕</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <label>Code <input type="text" placeholder="IL-S1.1" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required /></label>
              <label>Nom <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
              <label>Coefficient <input type="number" min="0.5" step="0.5" value={form.coefficient} onChange={(e) => setForm({ ...form, coefficient: Number(e.target.value) })} required /></label>
              <label>Année (1-5) <input type="number" min="1" max="5" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} required /></label>
              <label>Semestre (1-10) <input type="number" min="1" max="10" value={form.semester} onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })} required /></label>
              <label>Filière
                <select value={form.filiere} onChange={(e) => setForm({ ...form, filiere: e.target.value })}>
                  <option value="ALL">Toutes les filières</option>
                  {filieres.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </label>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Enregistrer</button>
              <button type="button" className="btn-outline" onClick={resetForm}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="card filter-bar">
        <label>Année
          <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
            <option value="">Toutes</option>
            {[1,2,3,4,5].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </label>
        <label>Semestre
          <select value={filterSem} onChange={(e) => setFilterSem(e.target.value)}>
            <option value="">Tous</option>
            {[1,2,3,4,5,6,7,8,9,10].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      </div>

      <div className="card table-card">
        <div className="table-responsive">
          <table>
            <thead>
              <tr><th>Code</th><th>Nom</th><th>Coeff.</th><th>Année</th><th>Sem.</th><th>Filière</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {modules.length === 0 ? (
                <tr><td colSpan="7" className="empty">Aucun module</td></tr>
              ) : (
                modules.map((m) => (
                  <tr key={m.id}>
                    <td><strong>{m.code}</strong></td>
                    <td>{m.name}</td>
                    <td>{m.coefficient}</td>
                    <td>{m.year}</td>
                    <td>{m.semester}</td>
                    <td>{shortenFiliere(m.filiere)}</td>
                    <td className="actions">
                      <button className="btn-edit" onClick={() => openEdit(m)}>✏️</button>
                      <button className="btn-danger" onClick={() => handleDelete(m.id)}>🗑️</button>
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
