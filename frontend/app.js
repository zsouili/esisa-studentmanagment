/* ═══════════════════════════════════════════════════════════
   ESISA Student Management — Frontend v3.0  (Premium)
   ═══════════════════════════════════════════════════════════ */

// ═══════════════════════════════════════════════════════════
// STAR CANVAS ANIMATION
// ═══════════════════════════════════════════════════════════
(function initStarCanvas() {
  const canvas = document.getElementById('starCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height, stars = [], shootingStars = [];
  const STAR_COUNT = 180;
  const SHOOTING_INTERVAL = 4000;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createStar() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.8 + 0.3,
      opacity: Math.random() * 0.6 + 0.2,
      twinkleSpeed: Math.random() * 0.015 + 0.005,
      twinkleDir: Math.random() > 0.5 ? 1 : -1,
      driftX: (Math.random() - 0.5) * 0.08,
      driftY: Math.random() * 0.04 + 0.01,
    };
  }

  function createShootingStar() {
    const fromLeft = Math.random() > 0.5;
    return {
      x: fromLeft ? Math.random() * width * 0.6 : width * 0.4 + Math.random() * width * 0.6,
      y: Math.random() * height * 0.4,
      len: Math.random() * 60 + 40,
      speed: Math.random() * 4 + 3,
      angle: fromLeft ? Math.PI / 6 + Math.random() * 0.3 : Math.PI - Math.PI / 6 - Math.random() * 0.3,
      opacity: 1,
      decay: Math.random() * 0.015 + 0.01,
    };
  }

  function init() {
    resize();
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) stars.push(createStar());
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Stars
    for (const s of stars) {
      // Twinkle
      s.opacity += s.twinkleSpeed * s.twinkleDir;
      if (s.opacity >= 0.85) { s.opacity = 0.85; s.twinkleDir = -1; }
      if (s.opacity <= 0.15) { s.opacity = 0.15; s.twinkleDir = 1; }

      // Drift
      s.x += s.driftX;
      s.y += s.driftY;
      if (s.y > height + 5) { s.y = -5; s.x = Math.random() * width; }
      if (s.x < -5 || s.x > width + 5) { s.x = Math.random() * width; s.y = Math.random() * height; }

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
      ctx.fill();

      // Glow effect for larger stars
      if (s.radius > 1.2) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96, 165, 250, ${s.opacity * 0.15})`;
        ctx.fill();
      }
    }

    // Shooting stars
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const ss = shootingStars[i];
      const endX = ss.x + Math.cos(ss.angle) * ss.len;
      const endY = ss.y + Math.sin(ss.angle) * ss.len;

      const grad = ctx.createLinearGradient(ss.x, ss.y, endX, endY);
      grad.addColorStop(0, `rgba(250, 204, 21, ${ss.opacity})`);
      grad.addColorStop(1, `rgba(250, 204, 21, 0)`);

      ctx.beginPath();
      ctx.moveTo(ss.x, ss.y);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Bright head
      ctx.beginPath();
      ctx.arc(ss.x, ss.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${ss.opacity})`;
      ctx.fill();

      ss.x += Math.cos(ss.angle) * ss.speed;
      ss.y += Math.sin(ss.angle) * ss.speed;
      ss.opacity -= ss.decay;

      if (ss.opacity <= 0 || ss.x < -50 || ss.x > width + 50 || ss.y > height + 50) {
        shootingStars.splice(i, 1);
      }
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); });
  init();
  draw();

  // Periodically spawn a shooting star
  setInterval(() => {
    if (shootingStars.length < 2) {
      shootingStars.push(createShootingStar());
    }
  }, SHOOTING_INTERVAL);
})();

// ═══════════════════════════════════════════════════════════
// NIGHT MODE TOGGLE
// ═══════════════════════════════════════════════════════════
(function initNightMode() {
  const toggle = document.getElementById('nightToggle');
  if (!toggle) return;
  // Restore saved preference
  if (localStorage.getItem('esisa_night_mode') === 'true') {
    document.body.classList.add('night-mode');
  }
  toggle.addEventListener('click', () => {
    document.body.classList.toggle('night-mode');
    localStorage.setItem('esisa_night_mode', document.body.classList.contains('night-mode'));
  });
})();

// ── Helpers ──
function isDemoMode() { return !!sessionStorage.getItem('esisa_demo_session'); }

function demoHeaders() {
  const h = { 'Content-Type': 'application/json' };
  const sid = sessionStorage.getItem('esisa_demo_session');
  if (sid) h['X-Demo-Session'] = sid;
  return h;
}

async function api(url, opts = {}) {
  opts.headers = { ...demoHeaders(), ...opts.headers };
  return fetch(url, opts);
}

// ── Toast ──
let toastTimer;
function showToast(msg, duration = 3000) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('visible'), duration);
}

// ── Data Cache ──
let students = [];
let modules = [];
let filieres = [];

// ═══════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════
const loginOverlay = document.getElementById('loginOverlay');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const appContainer = document.getElementById('appContainer');

function showApp() {
  if (loginOverlay) loginOverlay.classList.add('hidden');
  if (appContainer) appContainer.style.display = '';
  updateDemoBadge();
}

function showLogin() {
  sessionStorage.removeItem('esisa_logged_in');
  sessionStorage.removeItem('esisa_demo_session');
  if (loginOverlay) loginOverlay.classList.remove('hidden');
  if (appContainer) appContainer.style.display = 'none';
  if (loginError) loginError.textContent = '';
  if (loginForm) loginForm.reset();
}

if (sessionStorage.getItem('esisa_logged_in') === 'true') showApp();

document.getElementById('fillDemoBtn')?.addEventListener('click', () => {
  document.getElementById('loginUsername').value = 'esisa@ac.ma';
  document.getElementById('loginPassword').value = 'esisa123';
  loginForm?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
});

loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (loginError) loginError.textContent = '';
  const username = document.getElementById('loginUsername')?.value.trim();
  const password = document.getElementById('loginPassword')?.value;
  try {
    const res = await fetch('/api/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
    const data = await res.json();
    sessionStorage.setItem('esisa_logged_in', 'true');
    if (data.sessionId) sessionStorage.setItem('esisa_demo_session', data.sessionId);
    showApp();
    initApp();
    if (data.demo) showToast('Bienvenue en mode Démo — explorez librement !');
  } catch (err) {
    if (loginError) loginError.textContent = err.message || 'Erreur de connexion.';
  }
});

document.getElementById('logoutBtn')?.addEventListener('click', showLogin);

function updateDemoBadge() {
  const badge = document.getElementById('demoBadge');
  const resetBtn = document.getElementById('demoResetBtn');
  const isDemo = isDemoMode();
  if (badge) badge.style.display = isDemo ? '' : 'none';
  if (resetBtn) resetBtn.style.display = isDemo ? '' : 'none';
}

document.getElementById('demoResetBtn')?.addEventListener('click', async () => {
  if (!isDemoMode()) return;
  try {
    await api('/api/demo/reset', { method: 'POST' });
    showToast('Données démo réinitialisées.');
    await loadAll();
  } catch { showToast('Échec de la réinitialisation.'); }
});

// ═══════════════════════════════════════════════════════════
// SIDEBAR NAVIGATION
// ═══════════════════════════════════════════════════════════
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const menuToggle = document.getElementById('menuToggle');
const sidebarClose = document.getElementById('sidebarClose');
const navItems = document.querySelectorAll('.nav-item[data-section]');
const topbarTitle = document.getElementById('topbarTitle');

const sectionTitles = {
  dashboard: 'Dashboard', students: 'Étudiants', modules: 'Modules',
  absences: 'Absences', grades: 'Notes & Rattrapages', decisions: 'Décisions Académiques',
  export: 'Documents & Export', settings: 'Paramètres',
};

function switchSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('section-' + name);
  if (target) target.classList.add('active');
  navItems.forEach(n => n.classList.toggle('active', n.dataset.section === name));
  if (topbarTitle) topbarTitle.textContent = sectionTitles[name] || name;
  closeSidebar();

  // Refresh data when switching
  if (name === 'dashboard') refreshDashboard();
  if (name === 'students') fetchStudents();
  if (name === 'modules') fetchModules();
  if (name === 'absences') { populateStudentSelects(); populateModuleSelects(); }
  if (name === 'grades') { populateStudentSelects(); populateModuleSelects(); }
  if (name === 'decisions') populateStudentSelects();
}

navItems.forEach(item => {
  item.addEventListener('click', (e) => { e.preventDefault(); switchSection(item.dataset.section); });
});

function openSidebar() { sidebar?.classList.add('open'); sidebarOverlay?.classList.add('visible'); }
function closeSidebar() { sidebar?.classList.remove('open'); sidebarOverlay?.classList.remove('visible'); }
menuToggle?.addEventListener('click', openSidebar);
sidebarClose?.addEventListener('click', closeSidebar);
sidebarOverlay?.addEventListener('click', closeSidebar);

// ═══════════════════════════════════════════════════════════
// DATA LOADING
// ═══════════════════════════════════════════════════════════
async function loadFilieres() {
  try {
    const res = await api('/api/filieres');
    filieres = await res.json();
  } catch { filieres = []; }
  // Populate filiere selects
  const selects = [document.getElementById('filiere'), document.getElementById('moduleFiliere')];
  selects.forEach(sel => {
    if (!sel) return;
    const isModule = sel.id === 'moduleFiliere';
    sel.innerHTML = isModule ? '<option value="ALL">Toutes les filières</option>' : '';
    filieres.forEach(f => {
      const opt = document.createElement('option');
      opt.value = f; opt.textContent = f;
      sel.appendChild(opt);
    });
  });
}

async function fetchStudents() {
  try {
    const res = await api('/api/students');
    students = await res.json();
  } catch { students = []; }
  renderStudents();
  populateStudentSelects();
}

async function fetchModules() {
  const year = document.getElementById('filterModuleYear')?.value || '';
  const sem = document.getElementById('filterModuleSem')?.value || '';
  let url = '/api/modules?';
  if (year) url += `year=${year}&`;
  if (sem) url += `semester=${sem}&`;
  try {
    const res = await api(url);
    modules = await res.json();
  } catch { modules = []; }
  renderModules();
  populateModuleSelects();
}

async function loadAll() {
  await loadFilieres();
  await fetchStudents();
  await fetchModules();
  refreshDashboard();
}

function initApp() {
  loadAll();
}

// Auto-init if already logged in
if (sessionStorage.getItem('esisa_logged_in') === 'true') initApp();

// ═══════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════
async function refreshDashboard() {
  document.getElementById('statStudents').textContent = students.length;
  document.getElementById('statModules').textContent = modules.length;

  // Count notes and absences across all students
  let totalNotes = 0, totalAbsences = 0;
  for (const s of students) {
    try {
      const nr = await api(`/api/students/${s.id}/notes`);
      const nd = await nr.json();
      totalNotes += nd.notes?.length || 0;
    } catch {}
    try {
      const ar = await api(`/api/students/${s.id}/attendance`);
      const ad = await ar.json();
      totalAbsences += (ad.summary || []).reduce((sum, r) => sum + (r.absent || 0), 0);
    } catch {}
  }
  document.getElementById('statNotes').textContent = totalNotes;
  document.getElementById('statAbsences').textContent = totalAbsences;
}

// ═══════════════════════════════════════════════════════════
// STUDENTS
// ═══════════════════════════════════════════════════════════
const studentForm = document.getElementById('studentForm');
const studentFormCard = document.getElementById('studentFormCard');

document.getElementById('addStudentBtn')?.addEventListener('click', () => {
  document.getElementById('studentFormTitle').textContent = 'Nouvel étudiant';
  studentForm.reset();
  document.getElementById('studentId').value = '';
  studentFormCard.style.display = '';
});

document.getElementById('closeStudentForm')?.addEventListener('click', () => studentFormCard.style.display = 'none');
document.getElementById('cancelStudentBtn')?.addEventListener('click', () => studentFormCard.style.display = 'none');

studentForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('studentId').value;
  const payload = {
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    email: document.getElementById('email').value,
    filiere: document.getElementById('filiere').value,
    year: Number(document.getElementById('year').value),
    semester: Number(document.getElementById('semester').value),
  };
  try {
    const url = id ? `/api/students/${id}` : '/api/students';
    const method = id ? 'PUT' : 'POST';
    const res = await api(url, { method, body: JSON.stringify(payload) });
    if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
    showToast(id ? 'Étudiant mis à jour.' : 'Étudiant ajouté.');
    studentFormCard.style.display = 'none';
    await fetchStudents();
    refreshDashboard();
  } catch (err) { showToast(err.message || 'Erreur.'); }
});

function renderStudents() {
  const tbody = document.getElementById('studentsBody');
  if (!tbody) return;
  if (students.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty">Aucun étudiant</td></tr>';
    return;
  }
  tbody.innerHTML = students.map(s => `
    <tr>
      <td>${s.id}</td>
      <td>${s.firstName} ${s.lastName}</td>
      <td>${s.email}</td>
      <td>${shortenFiliere(s.filiere)}</td>
      <td>${s.year}</td>
      <td>${s.semester}</td>
      <td>${s.average ?? '—'}</td>
      <td class="actions">
        <button class="btn-edit" onclick="editStudent(${s.id})">✏️</button>
        <button class="btn-danger" onclick="deleteStudent(${s.id})">🗑️</button>
      </td>
    </tr>
  `).join('');
}

function shortenFiliere(f) {
  if (f.includes('Intelligence Artificielle')) return 'SI-IA';
  if (f.includes('Transformation')) return 'SI-Trans';
  if (f.includes('Logiciel')) return 'IL';
  return f;
}

window.editStudent = function(id) {
  const s = students.find(x => x.id === id);
  if (!s) return;
  document.getElementById('studentFormTitle').textContent = 'Modifier étudiant';
  document.getElementById('studentId').value = s.id;
  document.getElementById('firstName').value = s.firstName;
  document.getElementById('lastName').value = s.lastName;
  document.getElementById('email').value = s.email;
  document.getElementById('filiere').value = s.filiere;
  document.getElementById('year').value = s.year;
  document.getElementById('semester').value = s.semester;
  studentFormCard.style.display = '';
};

window.deleteStudent = async function(id) {
  if (!confirm('Supprimer cet étudiant ?')) return;
  try {
    const res = await api(`/api/students/${id}`, { method: 'DELETE' });
    if (res.ok) { showToast('Étudiant supprimé.'); await fetchStudents(); refreshDashboard(); }
    else { const d = await res.json(); showToast(d.message); }
  } catch { showToast('Erreur de suppression.'); }
};

// ═══════════════════════════════════════════════════════════
// MODULES
// ═══════════════════════════════════════════════════════════
const moduleForm = document.getElementById('moduleForm');
const moduleFormCard = document.getElementById('moduleFormCard');

document.getElementById('addModuleBtn')?.addEventListener('click', () => {
  document.getElementById('moduleFormTitle').textContent = 'Nouveau module';
  moduleForm.reset();
  document.getElementById('moduleId').value = '';
  moduleFormCard.style.display = '';
});

document.getElementById('closeModuleForm')?.addEventListener('click', () => moduleFormCard.style.display = 'none');
document.getElementById('cancelModuleBtn')?.addEventListener('click', () => moduleFormCard.style.display = 'none');

moduleForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('moduleId').value;
  const payload = {
    code: document.getElementById('moduleCode').value,
    name: document.getElementById('moduleName').value,
    coefficient: Number(document.getElementById('moduleCoeff').value),
    year: Number(document.getElementById('moduleYear').value),
    semester: Number(document.getElementById('moduleSemester').value),
    filiere: document.getElementById('moduleFiliere').value,
  };
  try {
    const url = id ? `/api/modules/${id}` : '/api/modules';
    const method = id ? 'PUT' : 'POST';
    const res = await api(url, { method, body: JSON.stringify(payload) });
    if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
    showToast(id ? 'Module mis à jour.' : 'Module ajouté.');
    moduleFormCard.style.display = 'none';
    await fetchModules();
    refreshDashboard();
  } catch (err) { showToast(err.message || 'Erreur.'); }
});

// Module filters
document.getElementById('filterModuleYear')?.addEventListener('change', fetchModules);
document.getElementById('filterModuleSem')?.addEventListener('change', fetchModules);

function renderModules() {
  const tbody = document.getElementById('modulesBody');
  if (!tbody) return;
  if (modules.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty">Aucun module</td></tr>';
    return;
  }
  tbody.innerHTML = modules.map(m => `
    <tr>
      <td><strong>${m.code}</strong></td>
      <td>${m.name}</td>
      <td>${m.coefficient}</td>
      <td>${m.year}</td>
      <td>${m.semester}</td>
      <td>${m.filiere === 'ALL' ? 'Toutes' : shortenFiliere(m.filiere)}</td>
      <td class="actions">
        <button class="btn-edit" onclick="editModule(${m.id})">✏️</button>
        <button class="btn-danger" onclick="deleteModule(${m.id})">🗑️</button>
      </td>
    </tr>
  `).join('');
}

window.editModule = function(id) {
  const m = modules.find(x => x.id === id);
  if (!m) return;
  document.getElementById('moduleFormTitle').textContent = 'Modifier module';
  document.getElementById('moduleId').value = m.id;
  document.getElementById('moduleCode').value = m.code;
  document.getElementById('moduleName').value = m.name;
  document.getElementById('moduleCoeff').value = m.coefficient;
  document.getElementById('moduleYear').value = m.year;
  document.getElementById('moduleSemester').value = m.semester;
  document.getElementById('moduleFiliere').value = m.filiere;
  moduleFormCard.style.display = '';
};

window.deleteModule = async function(id) {
  if (!confirm('Supprimer ce module ?')) return;
  try {
    const res = await api(`/api/modules/${id}`, { method: 'DELETE' });
    if (res.ok) { showToast('Module supprimé.'); await fetchModules(); refreshDashboard(); }
    else { const d = await res.json(); showToast(d.message); }
  } catch { showToast('Erreur de suppression.'); }
};

// ═══════════════════════════════════════════════════════════
// POPULATE SELECTS
// ═══════════════════════════════════════════════════════════
function populateStudentSelects() {
  const ids = ['attStudentId', 'attViewStudent', 'gradeStudentId', 'gradeViewStudent', 'rattStudentId', 'decisionStudentId'];
  ids.forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    const prev = sel.value;
    sel.innerHTML = '<option value="">— Sélectionner —</option>';
    students.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.firstName} ${s.lastName} (A${s.year})`;
      sel.appendChild(opt);
    });
    if (prev) sel.value = prev;
  });
}

function populateModuleSelects() {
  const ids = ['attModuleId', 'gradeModuleId', 'rattModuleId'];
  ids.forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    const prev = sel.value;
    sel.innerHTML = '<option value="">— Sélectionner —</option>';
    modules.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = `${m.code} — ${m.name}`;
      sel.appendChild(opt);
    });
    if (prev) sel.value = prev;
  });
}

// ═══════════════════════════════════════════════════════════
// ABSENCES
// ═══════════════════════════════════════════════════════════
document.getElementById('attendanceForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const studentId = document.getElementById('attStudentId').value;
  const moduleId = document.getElementById('attModuleId').value;
  const date = document.getElementById('attDate').value;
  const status = document.getElementById('attStatus').value;
  if (!studentId) { showToast('Sélectionnez un étudiant.'); return; }
  try {
    const res = await api(`/api/students/${studentId}/attendance`, {
      method: 'POST', body: JSON.stringify({ moduleId, date, status }),
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
    showToast('Présence enregistrée.');
    loadAttendance(studentId);
  } catch (err) { showToast(err.message || 'Erreur.'); }
});

document.getElementById('attViewStudent')?.addEventListener('change', (e) => {
  if (e.target.value) loadAttendance(e.target.value);
});

async function loadAttendance(studentId) {
  try {
    const res = await api(`/api/students/${studentId}/attendance`);
    const data = await res.json();
    renderAttendance(data);
  } catch { renderAttendance({ records: [], summary: [] }); }
}

function renderAttendance(data) {
  const tbody = document.getElementById('attendanceBody');
  const summary = document.getElementById('attendanceSummary');
  if (!tbody || !summary) return;

  if (!data.records?.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty">Aucun enregistrement</td></tr>';
  } else {
    tbody.innerHTML = data.records.map(r => {
      const badge = r.status === 'present' ? 'badge-success' : r.status === 'absent' ? 'badge-danger' : 'badge-warning';
      const label = r.status === 'present' ? 'Présent' : r.status === 'absent' ? 'Absent' : 'Retard';
      return `<tr>
        <td>${r.date}</td><td>${r.moduleName}</td>
        <td><span class="badge ${badge}">${label}</span></td>
        <td><button class="btn-danger" onclick="deleteAttendance(${r.id}, ${r.studentId})">🗑️</button></td>
      </tr>`;
    }).join('');
  }

  if (!data.summary?.length) {
    summary.innerHTML = '<tr><td colspan="5" class="empty">—</td></tr>';
  } else {
    summary.innerHTML = data.summary.map(s => `
      <tr><td>${s.moduleName}</td><td>${s.total}</td><td>${s.present}</td><td>${s.absent}</td><td>${s.late}</td></tr>
    `).join('');
  }
}

window.deleteAttendance = async function(id, studentId) {
  try {
    await api(`/api/attendance/${id}`, { method: 'DELETE' });
    showToast('Enregistrement supprimé.');
    loadAttendance(studentId);
  } catch { showToast('Erreur.'); }
};

// ═══════════════════════════════════════════════════════════
// GRADES
// ═══════════════════════════════════════════════════════════
document.getElementById('gradeForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const studentId = document.getElementById('gradeStudentId').value;
  const moduleId = document.getElementById('gradeModuleId').value;
  const grade = Number(document.getElementById('gradeValue').value);
  if (!studentId) { showToast('Sélectionnez un étudiant.'); return; }
  try {
    const res = await api(`/api/students/${studentId}/notes`, {
      method: 'POST', body: JSON.stringify({ moduleId, grade }),
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
    showToast('Note enregistrée.');
    loadGrades(studentId);
  } catch (err) { showToast(err.message || 'Erreur.'); }
});

document.getElementById('rattrapageForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const studentId = document.getElementById('rattStudentId').value;
  const moduleId = document.getElementById('rattModuleId').value;
  const grade = Number(document.getElementById('rattValue').value);
  if (!studentId || !moduleId) { showToast('Sélectionnez étudiant et module.'); return; }
  try {
    const res = await api(`/api/students/${studentId}/notes/${moduleId}/rattrapage`, {
      method: 'PUT', body: JSON.stringify({ grade }),
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
    showToast('Rattrapage enregistré.');
    loadGrades(studentId);
  } catch (err) { showToast(err.message || 'Erreur.'); }
});

document.getElementById('gradeViewStudent')?.addEventListener('change', (e) => {
  if (e.target.value) loadGrades(e.target.value);
});

async function loadGrades(studentId) {
  try {
    const res = await api(`/api/students/${studentId}/notes`);
    const data = await res.json();
    renderGrades(data, studentId);
  } catch { renderGrades({ notes: [], average: 0 }, studentId); }
}

function renderGrades(data, studentId) {
  const tbody = document.getElementById('gradesBody');
  const avgEl = document.getElementById('studentAverage');
  if (!tbody) return;

  if (!data.notes?.length) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty">Aucune note</td></tr>';
  } else {
    tbody.innerHTML = data.notes.map(n => {
      const eff = Math.max(n.grade, n.rattrapageGrade || 0);
      const validated = eff >= 10;
      const badge = validated ? 'badge-success' : 'badge-danger';
      const label = validated ? 'Validé' : 'Non validé';
      return `<tr>
        <td>${n.moduleName}</td><td>${n.moduleCode || ''}</td><td>${n.coefficient}</td>
        <td>${n.grade}</td><td>${n.rattrapageGrade ?? '—'}</td><td>${eff.toFixed(2)}</td>
        <td><span class="badge ${badge}">${label}</span></td>
        <td><button class="btn-danger" onclick="deleteNote(${studentId}, ${n.moduleId})">🗑️</button></td>
      </tr>`;
    }).join('');
  }
  if (avgEl) avgEl.textContent = data.average ? data.average.toFixed(2) : '—';
}

window.deleteNote = async function(studentId, moduleId) {
  try {
    await api(`/api/students/${studentId}/notes/${moduleId}`, { method: 'DELETE' });
    showToast('Note supprimée.');
    loadGrades(studentId);
  } catch { showToast('Erreur.'); }
};

// ═══════════════════════════════════════════════════════════
// DECISIONS
// ═══════════════════════════════════════════════════════════
document.getElementById('decisionStudentId')?.addEventListener('change', async (e) => {
  const sid = e.target.value;
  const container = document.getElementById('decisionResult');
  if (!sid) { if (container) container.style.display = 'none'; return; }
  try {
    const res = await api(`/api/students/${sid}/academic-decision`);
    const data = await res.json();
    renderDecision(data);
  } catch { if (container) container.style.display = 'none'; showToast('Erreur.'); }
});

function renderDecision(data) {
  const container = document.getElementById('decisionResult');
  if (!container) return;
  container.style.display = '';

  document.getElementById('decisionName').textContent = `${data.student.firstName} ${data.student.lastName}`;
  document.getElementById('decisionInfo').textContent = `${shortenFiliere(data.student.filiere)} — Année ${data.student.year}, Semestre ${data.student.semester}`;

  const badge = document.getElementById('decisionBadge');
  badge.textContent = data.decision;
  badge.className = 'decision-badge ' + data.decisionCode;

  document.getElementById('decisionAvg').textContent = data.average?.toFixed(2) ?? '—';
  document.getElementById('decisionValidated').textContent = `${data.validatedCount}/${data.totalModules}`;
  document.getElementById('decisionRatt').textContent = data.rattrapageEligible;
  document.getElementById('decisionFailed').textContent = data.failedCount;

  const tbody = document.getElementById('decisionModules');
  tbody.innerHTML = data.modules.map(m => {
    let badgeClass = 'badge-muted', label = 'Pas de note';
    if (m.status === 'validated') { badgeClass = 'badge-success'; label = 'Validé'; }
    else if (m.status === 'rattrapage-eligible') { badgeClass = 'badge-warning'; label = 'Rattrapage'; }
    else if (m.status === 'failed-after-rattrapage') { badgeClass = 'badge-danger'; label = 'Échoué'; }
    else if (m.status === 'failed') { badgeClass = 'badge-danger'; label = 'Échoué'; }
    return `<tr>
      <td>${m.name}</td><td>${m.code}</td>
      <td>${m.grade ?? '—'}</td><td>${m.rattrapageGrade ?? '—'}</td>
      <td>${m.effectiveGrade?.toFixed(2) ?? '—'}</td>
      <td><span class="badge ${badgeClass}">${label}</span></td>
    </tr>`;
  }).join('');
}

// ═══════════════════════════════════════════════════════════
// EXPORT CSV
// ═══════════════════════════════════════════════════════════
function downloadCSV(filename, rows) {
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

document.getElementById('exportStudentsCSV')?.addEventListener('click', async () => {
  const rows = [['ID', 'Prénom', 'Nom', 'Email', 'Filière', 'Année', 'Semestre', 'Moyenne']];
  students.forEach(s => rows.push([s.id, s.firstName, s.lastName, s.email, s.filiere, s.year, s.semester, s.average ?? '']));
  downloadCSV('etudiants.csv', rows);
  showToast('Export étudiants téléchargé.');
});

document.getElementById('exportModulesCSV')?.addEventListener('click', async () => {
  const rows = [['Code', 'Nom', 'Coefficient', 'Année', 'Semestre', 'Filière']];
  modules.forEach(m => rows.push([m.code, m.name, m.coefficient, m.year, m.semester, m.filiere]));
  downloadCSV('modules.csv', rows);
  showToast('Export modules téléchargé.');
});

document.getElementById('exportGradesCSV')?.addEventListener('click', async () => {
  const rows = [['Étudiant', 'Module', 'Code', 'Note', 'Rattrapage', 'Effective', 'Validé']];
  for (const s of students) {
    try {
      const res = await api(`/api/students/${s.id}/notes`);
      const data = await res.json();
      (data.notes || []).forEach(n => {
        const eff = Math.max(n.grade, n.rattrapageGrade || 0);
        rows.push([`${s.firstName} ${s.lastName}`, n.moduleName, n.moduleCode || '', n.grade, n.rattrapageGrade ?? '', eff, eff >= 10 ? 'Oui' : 'Non']);
      });
    } catch {}
  }
  downloadCSV('notes.csv', rows);
  showToast('Export notes téléchargé.');
});
