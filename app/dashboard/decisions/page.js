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

export default function DecisionsPage() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [decision, setDecision] = useState(null);

  const fetchStudents = useCallback(async () => {
    try {
      const res = await fetch('/api/students');
      setStudents(await res.json());
    } catch {}
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const loadDecision = async (sid) => {
    if (!sid) { setDecision(null); return; }
    try {
      const res = await fetch(`/api/students/${sid}/academic-decision`);
      const data = await res.json();
      setDecision(data);
    } catch { setDecision(null); showToast('Erreur.'); }
  };

  useEffect(() => { if (selectedStudent) loadDecision(selectedStudent); }, [selectedStudent]);

  return (
    <section className="section active">
      <div className="section-toolbar"><h3>Décisions Académiques</h3></div>

      <div className="card">
        <label>Étudiant :
          <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} style={{ marginLeft: 8 }}>
            <option value="">— Sélectionner —</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
          </select>
        </label>
      </div>

      {decision && (
        <div className="card">
          <div className="decision-header">
            <div>
              <strong>{decision.student.firstName} {decision.student.lastName}</strong><br />
              <span className="text-muted">
                {shortenFiliere(decision.student.filiere)} — Année {decision.student.year}, Semestre {decision.student.semester}
              </span>
            </div>
            <span className={`decision-badge ${decision.decisionCode}`}>{decision.decision}</span>
          </div>
          <div className="decision-stats">
            <span>Moyenne : <strong>{decision.average?.toFixed(2) ?? '—'}</strong></span>
            <span>Validés : <strong>{decision.validatedCount}/{decision.totalModules}</strong></span>
            <span>Rattrapages : <strong>{decision.rattrapageEligible}</strong></span>
            <span>Échoués : <strong>{decision.failedCount}</strong></span>
          </div>
          <div className="table-responsive">
            <table>
              <thead><tr><th>Module</th><th>Code</th><th>Note</th><th>Ratt.</th><th>Effective</th><th>Statut</th></tr></thead>
              <tbody>
                {decision.modules.map((m) => {
                  let badgeClass = 'badge-muted', label = 'Pas de note';
                  if (m.status === 'validated') { badgeClass = 'badge-success'; label = 'Validé'; }
                  else if (m.status === 'rattrapage-eligible') { badgeClass = 'badge-warning'; label = 'Rattrapage'; }
                  else if (m.status === 'failed-after-rattrapage' || m.status === 'failed') { badgeClass = 'badge-danger'; label = 'Échoué'; }
                  return (
                    <tr key={m.id}>
                      <td>{m.name}</td>
                      <td>{m.code}</td>
                      <td>{m.grade ?? '—'}</td>
                      <td>{m.rattrapageGrade ?? '—'}</td>
                      <td>{m.effectiveGrade?.toFixed(2) ?? '—'}</td>
                      <td><span className={`badge ${badgeClass}`}>{label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
