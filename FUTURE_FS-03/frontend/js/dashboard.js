/* dashboard.js — Admin Owner Portal JS */

const API = 'http://localhost:5000/api';
let token = null;
let allMembers = [];
let currentPage = 1;
const PAGE_SIZE = 15;
let deleteTargetId = null;
let editingId = null;
let joiningsChart, statusChart, planChart;

// ── Auth Guard ────────────────────────────────────
(function () {
  token = localStorage.getItem('sf_token');
  if (!token) { window.location.href = 'login.html'; return; }

  const adminData = JSON.parse(localStorage.getItem('sf_admin') || '{}');
  document.getElementById('ownerName').textContent = adminData.name || 'Gym Owner';
  document.getElementById('ownerAvatar').textContent = (adminData.name || 'O')[0].toUpperCase();
  document.getElementById('currentMonthName').textContent =
    new Date().toLocaleString('default', { month: 'long' });
})();

// ── API Helper ────────────────────────────────────
async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, ...(opts.headers || {}) }
  });
  const data = await res.json();
  if (res.status === 401) {
    // Token expired or invalid — clear and redirect to login
    localStorage.removeItem('sf_token');
    localStorage.removeItem('sf_admin');
    window.location.href = 'login.html';
    return;
  }
  if (!res.ok) throw new Error(data.message || 'API error');
  return data;
}

// ── Navigation ────────────────────────────────────
const SECTIONS = ['overview', 'members', 'new-joinings', 'active', 'expired', 'left', 'website'];
const TITLES = {
  'overview':     ['Overview',             'Welcome back! Here\'s your gym at a glance.'],
  'members':      ['All Members',          'View and manage every member in your gym.'],
  'new-joinings': ['New Joinings',         'Members who joined this month.'],
  'active':       ['Active Members',       'Currently active members with valid memberships.'],
  'expired':      ['Expired Memberships',  'Members whose membership has lapsed — time to follow up!'],
  'left':         ['Members Who Left',     'Members who have cancelled or left the gym.'],
  'website':      ['Public Website',       'Your public-facing website.']
};

function navigateTo(section) {
  SECTIONS.forEach(s => {
    document.getElementById(`section-${s}`)?.classList.remove('active');
    document.getElementById(`nav-${s}`)?.classList.remove('active');
  });
  document.getElementById(`section-${section}`)?.classList.add('active');
  document.getElementById(`nav-${section}`)?.classList.add('active');

  const [title, sub] = TITLES[section] || ['Dashboard', ''];
  document.getElementById('pageTitle').textContent = title;
  document.getElementById('pageSubtitle').textContent = sub;

  // Load content for each section
  if (section === 'members')      loadMembersTable('All');
  if (section === 'new-joinings') loadMembersTable('NewMonth');
  if (section === 'active')       loadMembersTable('Active');
  if (section === 'expired')      loadMembersTable('Expired', 'expiredContainer');
  if (section === 'left')         loadMembersTable('Left', 'leftContainer');
}

document.querySelectorAll('.nav-item[data-section]').forEach(el => {
  el.addEventListener('click', () => navigateTo(el.dataset.section));
});
document.getElementById('nav-add')?.addEventListener('click', openAddModal);
document.getElementById('addMemberTopBtn')?.addEventListener('click', openAddModal);
document.getElementById('addFromTable')?.addEventListener('click', openAddModal);
document.getElementById('seeAllBtn')?.addEventListener('click', () => navigateTo('members'));
document.getElementById('refreshBtn')?.addEventListener('click', init);

// Global search
document.getElementById('globalSearch')?.addEventListener('input', (e) => {
  const q = e.target.value.trim();
  if (q.length > 1) {
    navigateTo('members');
    loadMembersTable('All', 'memberTableContainer', q);
  }
});

// ══════════════════════════════════════════════════
//  LOAD STATS
// ══════════════════════════════════════════════════
async function loadStats() {
  try {
    const { data } = await apiFetch('/stats');

    // Stat cards
    document.getElementById('s-total').textContent    = data.totalMembers;
    document.getElementById('s-active').textContent   = data.activeMembers;
    document.getElementById('s-newmonth').textContent = data.newThisMonth;
    document.getElementById('s-expired').textContent  = data.expiredMembers;
    document.getElementById('s-left').textContent     = data.leftMembers;
    document.getElementById('s-revenue').textContent  = '₹' + data.totalRevenue.toLocaleString('en-IN');

    // Nav badges
    document.getElementById('totalBadge').textContent   = data.totalMembers;
    document.getElementById('newBadge').textContent     = data.newThisMonth;
    document.getElementById('expiredBadge').textContent = data.expiredMembers;
    document.getElementById('leftBadge').textContent    = data.leftMembers;

    // Charts
    buildJoiningsChart(data.monthlyTrend);
    buildStatusChart(data.activeMembers, data.expiredMembers, data.leftMembers);
    buildPlanChart(data.planBreakdown);

  } catch (err) {
    showToast('Failed to load stats: ' + err.message, 'error');
  }
}

// ── Joinings Trend Chart ──────────────────────────
function buildJoiningsChart(trend) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const labels  = trend.map(t => `${months[t._id.month - 1]} ${t._id.year}`);
  const counts  = trend.map(t => t.count);
  const revenue = trend.map(t => t.revenue);

  if (joiningsChart) joiningsChart.destroy();
  const ctx = document.getElementById('joiningsChart').getContext('2d');
  joiningsChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'New Members',
          data: counts,
          backgroundColor: 'rgba(249,115,22,0.75)',
          borderColor: '#F97316',
          borderWidth: 2,
          borderRadius: 8,
          yAxisID: 'y'
        },
        {
          label: 'Revenue (₹)',
          data: revenue,
          type: 'line',
          borderColor: '#FBBF24',
          backgroundColor: 'rgba(251,191,36,0.08)',
          borderWidth: 2.5,
          pointBackgroundColor: '#FBBF24',
          fill: true,
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { labels: { font: { family: 'Inter' }, boxRadius: 4 } } },
      scales: {
        y:  { beginAtZero: true, grid: { color: 'rgba(253,232,204,0.5)' }, ticks: { font: { family: 'Inter' } } },
        y1: { beginAtZero: true, position: 'right', grid: { display: false },
               ticks: { font: { family: 'Inter' }, callback: v => '₹' + (v/1000).toFixed(0) + 'k' } }
      }
    }
  });
}

// ── Status Donut Chart ────────────────────────────
function buildStatusChart(active, expired, left) {
  const total = active + expired + left || 1;
  const pct   = v => ((v / total) * 100).toFixed(1) + '%';

  if (statusChart) statusChart.destroy();
  const ctx = document.getElementById('statusChart').getContext('2d');
  statusChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Active', 'Expired', 'Left'],
      datasets: [{ data: [active, expired, left],
        backgroundColor: ['#22C55E', '#F59E0B', '#EF4444'],
        borderWidth: 3, borderColor: '#fff', hoverOffset: 8
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '68%',
      plugins: { legend: { display: false } }
    }
  });

  document.getElementById('donutLegend').innerHTML = `
    <div class="legend-item"><div class="legend-dot" style="background:#22C55E"></div> Active &nbsp;<strong>${active}</strong> &nbsp;<small style="color:var(--text-muted)">(${pct(active)})</small></div>
    <div class="legend-item"><div class="legend-dot" style="background:#F59E0B"></div> Expired &nbsp;<strong>${expired}</strong> &nbsp;<small style="color:var(--text-muted)">(${pct(expired)})</small></div>
    <div class="legend-item"><div class="legend-dot" style="background:#EF4444"></div> Left &nbsp;<strong>${left}</strong> &nbsp;<small style="color:var(--text-muted)">(${pct(left)})</small></div>
  `;
}

// ── Plan Bar Chart ────────────────────────────────
function buildPlanChart(plans) {
  const map = { Basic: 0, Standard: 0, Premium: 0 };
  plans.forEach(p => { if (map[p._id] !== undefined) map[p._id] = p.count; });

  if (planChart) planChart.destroy();
  const ctx = document.getElementById('planChart').getContext('2d');
  planChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Basic', 'Standard', 'Premium'],
      datasets: [{
        label: 'Members',
        data: [map.Basic, map.Standard, map.Premium],
        backgroundColor: ['rgba(249,115,22,0.7)', 'rgba(59,130,246,0.7)', 'rgba(217,119,6,0.7)'],
        borderRadius: 10, borderWidth: 0
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(253,232,204,0.5)' } }
      }
    }
  });
}

// ══════════════════════════════════════════════════
//  LOAD RECENT MEMBERS (Overview)
// ══════════════════════════════════════════════════
async function loadRecentMembers() {
  try {
    const { data } = await apiFetch('/members?limit=6&page=1');
    const el = document.getElementById('recentMembersList');
    if (!data.length) { el.innerHTML = emptyState('No members yet'); return; }

    el.innerHTML = `<div class="table-scroll"><table>
      <thead><tr><th>Member</th><th>Plan</th><th>Status</th><th>Joined</th></tr></thead>
      <tbody>${data.map(m => `
        <tr>
          <td><div class="member-info">
            <div class="member-avatar" style="background:${avatarColor(m.name)}">${m.name[0].toUpperCase()}</div>
            <div><div class="member-name">${m.name}</div><div class="member-email">${m.phone}</div></div>
          </div></td>
          <td><span class="badge badge-${m.membershipPlan.toLowerCase()}">${m.membershipPlan}</span></td>
          <td>${statusBadge(m.status)}</td>
          <td>${formatDate(m.joiningDate)}</td>
        </tr>`).join('')}
      </tbody>
    </table></div>`;
  } catch (err) {
    document.getElementById('recentMembersList').innerHTML = `<div class="empty-state"><p>Could not load data.</p></div>`;
  }
}

// ══════════════════════════════════════════════════
//  FULL MEMBERS TABLE
// ══════════════════════════════════════════════════
async function loadMembersTable(filter = 'All', containerId = 'memberTableContainer', search = '') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `<div class="loading-spinner"><div class="spinner"></div> Loading…</div>`;

  try {
    let url = '/members?limit=100';
    if (filter === 'Active')   url += '&status=Active';
    if (filter === 'Expired')  url += '&status=Expired';
    if (filter === 'Left')     url += '&status=Left';
    if (search)                url += `&search=${encodeURIComponent(search)}`;

    const { data } = await apiFetch(url);
    allMembers = data;

    // For NewMonth, filter client-side
    let members = data;
    if (filter === 'NewMonth') {
      const now = new Date();
      members = data.filter(m => {
        const d = new Date(m.joiningDate);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    }

    renderMembersTable(members, container, filter);
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><h3>Failed to load members</h3><p>${err.message}</p></div>`;
  }
}

function renderMembersTable(members, container, filter) {
  if (!members.length) {
    container.innerHTML = emptyState(filter === 'Left' ? 'No members have left — great retention! 🎉' : 'No members found');
    return;
  }

  container.innerHTML = `
    <div class="table-controls">
      <div class="table-filters">
        ${filter === 'All' ? `
        <button class="filter-btn active" data-f="All">All (${members.length})</button>
        <button class="filter-btn active-filter" data-f="Active">Active</button>
        <button class="filter-btn expired-filter" data-f="Expired">Expired</button>
        <button class="filter-btn left-filter" data-f="Left">Left</button>
        ` : ''}
      </div>
      <div class="table-search">
        <span class="s-icon">🔍</span>
        <input type="text" id="tableSearch" placeholder="Search name, email, phone…" />
      </div>
    </div>
    <div class="table-scroll">
      <table id="membersTable">
        <thead>
          <tr>
            <th>Member</th>
            <th>Phone</th>
            <th>Plan</th>
            <th>Status</th>
            <th>Joined</th>
            <th>Expiry</th>
            <th>Paid</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="membersBody">
          ${members.map(m => memberRow(m)).join('')}
        </tbody>
      </table>
    </div>
    <div class="table-footer">
      <span>Showing <strong>${members.length}</strong> members</span>
    </div>
  `;

  // Filter buttons (All section only)
  container.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.f;
      let filtered = allMembers;
      if (f !== 'All') filtered = allMembers.filter(m => m.status === f);
      document.getElementById('membersBody').innerHTML = filtered.map(m => memberRow(m)).join('');
      container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active','active-filter','expired-filter','left-filter'));
      btn.classList.add('active');
    });
  });

  // Inline search
  document.getElementById('tableSearch')?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = members.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.phone.includes(q)
    );
    document.getElementById('membersBody').innerHTML = filtered.map(m => memberRow(m)).join('');
  });

  // Row action listeners
  attachTableActions(container);
}

function memberRow(m) {
  const days = Math.ceil((new Date(m.expiryDate) - new Date()) / 86400000);
  return `
    <tr data-id="${m._id}">
      <td>
        <div class="member-info">
          <div class="member-avatar" style="background:${avatarColor(m.name)}">${m.name[0].toUpperCase()}</div>
          <div>
            <div class="member-name">${m.name}</div>
            <div class="member-email">${m.email}</div>
          </div>
        </div>
      </td>
      <td>${m.phone}</td>
      <td><span class="badge badge-${m.membershipPlan.toLowerCase()}">${m.membershipPlan}</span></td>
      <td>${statusBadge(m.status)}</td>
      <td>${formatDate(m.joiningDate)}</td>
      <td>
        <span style="font-size:0.82rem;color:${days < 0 ? '#DC2626' : days <= 7 ? '#D97706' : '#15803D'}">
          ${days < 0 ? `Expired ${Math.abs(days)}d ago` : `${days}d left`}
        </span>
      </td>
      <td>₹${(m.amountPaid || 0).toLocaleString('en-IN')}</td>
      <td>
        <div class="action-btns">
          <button class="action-btn view-btn" data-id="${m._id}" title="View Details">👁️</button>
          <button class="action-btn edit-btn" data-id="${m._id}" title="Edit">✏️</button>
          <button class="action-btn danger del-btn" data-id="${m._id}" data-name="${m.name}" title="Delete">🗑️</button>
        </div>
      </td>
    </tr>
  `;
}

function attachTableActions(container) {
  container.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => viewMember(btn.dataset.id));
  });
  container.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => editMember(btn.dataset.id));
  });
  container.querySelectorAll('.del-btn').forEach(btn => {
    btn.addEventListener('click', () => confirmDelete(btn.dataset.id, btn.dataset.name));
  });
}

// ══════════════════════════════════════════════════
//  VIEW MEMBER DETAILS
// ══════════════════════════════════════════════════
async function viewMember(id) {
  openModal('viewModal');
  document.getElementById('viewModalBody').innerHTML = `<div class="loading-spinner"><div class="spinner"></div></div>`;

  try {
    const { data: m } = await apiFetch(`/members/${id}`);
    const days = Math.ceil((new Date(m.expiryDate) - new Date()) / 86400000);
    const daysClass = days < 0 ? 'bad' : days <= 7 ? 'warn' : 'good';

    document.getElementById('viewModalBody').innerHTML = `
      <div class="member-detail-header">
        <div class="detail-avatar" style="background:${avatarColor(m.name)}">${m.name[0].toUpperCase()}</div>
        <div class="detail-meta">
          <div class="detail-name">${m.name}</div>
          <div class="detail-tag">${m.email} &nbsp;|&nbsp; ${m.phone}</div>
          <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
            ${statusBadge(m.status)}
            <span class="badge badge-${m.membershipPlan.toLowerCase()}">${m.membershipPlan}</span>
          </div>
        </div>
      </div>

      <div class="detail-grid">
        <div class="detail-item"><label>Age</label><value>${m.age} years</value></div>
        <div class="detail-item"><label>Gender</label><value>${m.gender}</value></div>
        <div class="detail-item"><label>Fitness Goal</label><value>${m.fitnessGoal}</value></div>
        <div class="detail-item"><label>Payment Mode</label><value>${m.paymentMode}</value></div>
        <div class="detail-item"><label>Joining Date</label><value>${formatDate(m.joiningDate)}</value></div>
        <div class="detail-item"><label>Expiry Date</label><value>${formatDate(m.expiryDate)}</value></div>
        <div class="detail-item"><label>Amount Paid</label><value>₹${(m.amountPaid || 0).toLocaleString('en-IN')}</value></div>
        <div class="detail-item"><label>Address</label><value>${m.address || '—'}</value></div>
      </div>

      <div class="days-remaining-pill ${daysClass}" style="margin-top:16px">
        ${days < 0 ? `⚠️ Expired ${Math.abs(days)} days ago` : `✅ ${days} days remaining`}
      </div>

      ${m.notes ? `<div style="margin-top:16px;padding:14px;background:var(--bg-alt);border-radius:var(--radius-md);font-size:0.88rem"><strong>Notes:</strong> ${m.notes}</div>` : ''}

      <div style="display:flex;gap:10px;margin-top:24px">
        <button class="btn btn-outline btn-sm" onclick="editMember('${m._id}');closeModal('viewModal')">✏️ Edit</button>
        <button class="btn btn-danger btn-sm" onclick="confirmDelete('${m._id}','${m.name}');closeModal('viewModal')">🗑️ Delete</button>
      </div>
    `;
  } catch (err) {
    document.getElementById('viewModalBody').innerHTML = `<p style="color:red">${err.message}</p>`;
  }
}

// ══════════════════════════════════════════════════
//  ADD / EDIT MEMBER
// ══════════════════════════════════════════════════
function openAddModal() {
  editingId = null;
  document.getElementById('modalTitle').textContent = 'Add New Member';
  document.getElementById('memberForm').reset();
  document.getElementById('memberId').value = '';
  document.getElementById('mJoining').value = new Date().toISOString().split('T')[0];

  // Default expiry: 30 days
  const exp = new Date(); exp.setDate(exp.getDate() + 30);
  document.getElementById('mExpiry').value = exp.toISOString().split('T')[0];
  document.getElementById('mAmount').value = 999;
  document.getElementById('formError').style.display = 'none';
  openModal('memberModal');
}

async function editMember(id) {
  editingId = id;
  document.getElementById('modalTitle').textContent = 'Edit Member';
  document.getElementById('formError').style.display = 'none';
  openModal('memberModal');

  try {
    const { data: m } = await apiFetch(`/members/${id}`);
    document.getElementById('mName').value    = m.name;
    document.getElementById('mEmail').value   = m.email;
    document.getElementById('mPhone').value   = m.phone;
    document.getElementById('mAge').value     = m.age;
    document.getElementById('mGender').value  = m.gender;
    document.getElementById('mPlan').value    = m.membershipPlan;
    document.getElementById('mGoal').value    = m.fitnessGoal;
    document.getElementById('mStatus').value  = m.status;
    document.getElementById('mAmount').value  = m.amountPaid;
    document.getElementById('mPayment').value = m.paymentMode;
    document.getElementById('mAddress').value = m.address;
    document.getElementById('mNotes').value   = m.notes;
    document.getElementById('mJoining').value = m.joiningDate?.split('T')[0];
    document.getElementById('mExpiry').value  = m.expiryDate?.split('T')[0];
  } catch (err) {
    showToast('Could not load member data', 'error');
  }
}

// Auto-set amount when plan changes
document.getElementById('mPlan')?.addEventListener('change', (e) => {
  const prices = { Basic: 999, Standard: 2499, Premium: 5999 };
  document.getElementById('mAmount').value = prices[e.target.value] || 0;

  const days = { Basic: 30, Standard: 90, Premium: 365 };
  const exp = new Date(document.getElementById('mJoining').value || new Date());
  exp.setDate(exp.getDate() + days[e.target.value]);
  document.getElementById('mExpiry').value = exp.toISOString().split('T')[0];
});

// Form Submit
document.getElementById('memberForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('saveBtn');
  const errEl = document.getElementById('formError');
  errEl.style.display = 'none';

  const payload = {
    name:           document.getElementById('mName').value.trim(),
    email:          document.getElementById('mEmail').value.trim(),
    phone:          document.getElementById('mPhone').value.trim(),
    age:            parseInt(document.getElementById('mAge').value),
    gender:         document.getElementById('mGender').value,
    membershipPlan: document.getElementById('mPlan').value,
    fitnessGoal:    document.getElementById('mGoal').value,
    status:         document.getElementById('mStatus').value,
    amountPaid:     parseFloat(document.getElementById('mAmount').value) || 0,
    paymentMode:    document.getElementById('mPayment').value,
    address:        document.getElementById('mAddress').value.trim(),
    notes:          document.getElementById('mNotes').value.trim(),
    joiningDate:    document.getElementById('mJoining').value,
    expiryDate:     document.getElementById('mExpiry').value
  };

  btn.disabled = true;
  btn.textContent = editingId ? 'Saving…' : 'Adding…';

  try {
    if (editingId) {
      await apiFetch(`/members/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
      showToast('✅ Member updated successfully', 'success');
    } else {
      await apiFetch('/members', { method: 'POST', body: JSON.stringify(payload) });
      showToast('✅ Member added successfully', 'success');
    }
    closeModal('memberModal');
    init();
    if (document.getElementById('section-members').classList.contains('active')) loadMembersTable('All');
  } catch (err) {
    errEl.textContent = '❌ ' + err.message;
    errEl.style.display = 'block';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Member';
  }
});

// ══════════════════════════════════════════════════
//  DELETE MEMBER
// ══════════════════════════════════════════════════
function confirmDelete(id, name) {
  deleteTargetId = id;
  document.getElementById('delMemberName').textContent = name;
  openModal('deleteModal');
}

document.getElementById('confirmDelete')?.addEventListener('click', async () => {
  if (!deleteTargetId) return;
  try {
    await apiFetch(`/members/${deleteTargetId}`, { method: 'DELETE' });
    showToast('🗑️ Member deleted', 'success');
    closeModal('deleteModal');
    init();
    if (document.getElementById('section-members').classList.contains('active')) loadMembersTable('All');
  } catch (err) {
    showToast(err.message, 'error');
  }
});

// ══════════════════════════════════════════════════
//  MODAL HELPERS
// ══════════════════════════════════════════════════
function openModal(id)  { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

document.getElementById('modalClose')?.addEventListener('click',   () => closeModal('memberModal'));
document.getElementById('cancelModal')?.addEventListener('click',  () => closeModal('memberModal'));
document.getElementById('viewModalClose')?.addEventListener('click',() => closeModal('viewModal'));
document.getElementById('delModalClose')?.addEventListener('click', () => closeModal('deleteModal'));
document.getElementById('cancelDelete')?.addEventListener('click',  () => closeModal('deleteModal'));

document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('open'); });
});

// ══════════════════════════════════════════════════
//  LOGOUT
// ══════════════════════════════════════════════════
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.removeItem('sf_token');
  localStorage.removeItem('sf_admin');
  window.location.href = 'login.html';
});

// ══════════════════════════════════════════════════
//  TOAST
// ══════════════════════════════════════════════════
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', warning: '⚠️' };
  toast.innerHTML = `<span>${icons[type] || '💬'}</span> ${message}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ══════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════
const COLORS = ['#F97316','#FBBF24','#22C55E','#3B82F6','#8B5CF6','#EC4899','#14B8A6','#F59E0B'];
function avatarColor(name) {
  return COLORS[name.charCodeAt(0) % COLORS.length];
}

function statusBadge(status) {
  const map = { Active: 'active', Expired: 'expired', Left: 'left' };
  const icons = { Active: '🟢', Expired: '🟡', Left: '🔴' };
  return `<span class="badge badge-${map[status]}">${icons[status]} ${status}</span>`;
}

function formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function emptyState(msg) {
  return `<div class="empty-state"><div class="empty-icon">😔</div><h3>${msg}</h3><p>No records to display.</p></div>`;
}

// ══════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════
async function init() {
  await Promise.all([loadStats(), loadRecentMembers()]);
}

init();
