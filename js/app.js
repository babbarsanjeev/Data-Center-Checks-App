'use strict';

// ─── App State ───────────────────────────────────────────────────────────────
const AppState = {
  view:              'dashboard',
  pendingInspection: null,   // { ...fields, _editId?, _preId }
  detailId:          null,
  historyFilter:     'all',
  photoThumbs:       {},     // { 'srNo_side': dataUrl } — live thumbnails
};

// ─── SVG Icons ───────────────────────────────────────────────────────────────
const Icons = {
  home:         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  clipboard:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>`,
  clock:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  gear:         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M20 12h2M2 12h2M17.66 17.66l-1.41-1.41M6.34 6.34L4.93 4.93"/></svg>`,
  back:         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
  chevronRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
  plus:         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  download:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  mail:         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>`,
  trash:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>`,
  check:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  wifi:         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0114.08 0"/><path d="M1.42 9a16 16 0 0121.16 0"/><path d="M8.53 16.11a6 6 0 016.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`,
  save:         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
  edit:         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  excel:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>`,
  camera:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  copy:         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>`,
  upload:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>`,
  file:         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(d) {
  if (!d) return '';
  const [y, m, dd] = d.split('-').map(Number);
  return new Date(y, m - 1, dd).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function todayStr() { return new Date().toISOString().split('T')[0]; }
function escapeHtml(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function getStatusColor(v) {
  if (!v || v === '') return 'incomplete';
  const s = STATUS_SEVERITY[v]; if (s === undefined || s < 0) return 'incomplete';
  return s === 0 ? 'ok' : s <= 2 ? 'warning' : 'issues';
}
function getSelectClass(v) {
  return { ok: 'status-green', warning: 'status-amber', issues: 'status-red', incomplete: '' }[getStatusColor(v)] || '';
}
function getBadgeClass(s) { return { OK:'badge-ok', WARNING:'badge-warning', ISSUES:'badge-issues', INCOMPLETE:'badge-incomplete' }[s] || 'badge-incomplete'; }
function getStatusEmoji(s) { return { OK:'✅', WARNING:'⚠️', ISSUES:'🔴', INCOMPLETE:'⏳' }[s] || '⏳'; }
function getStatusIconBg(s) {
  return { OK:'background:var(--green-bg)', WARNING:'background:var(--amber-bg)', ISSUES:'background:var(--red-bg)', INCOMPLETE:'background:var(--gray-bg)' }[s] || 'background:var(--gray-bg)';
}
function getTypeBadgeHtml(t) {
  const cls = { weekly:'type-weekly', biweekly:'type-biweekly', adhoc:'type-adhoc' }[t] || 'type-adhoc';
  const lbl = { weekly:'Weekly', biweekly:'Bi-weekly', adhoc:'Ad-hoc' }[t] || t;
  return `<span class="type-badge ${cls}">${lbl}</span>`;
}
function buildOptionsHtml(opts, sel) {
  return opts.map(o => `<option value="${escapeHtml(o.value)}"${o.value === sel ? ' selected' : ''}>${escapeHtml(o.label)}</option>`).join('');
}

function showToast(msg, duration = 2600) {
  let el = document.getElementById('dc-toast');
  if (!el) { el = document.createElement('div'); el.id = 'dc-toast'; el.className = 'toast'; document.body.appendChild(el); }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), duration);
}

function buildNav(active) {
  const isNew = active === 'new-inspection' || active === 'checklist';
  const tabs = [
    { view: 'dashboard', icon: Icons.home, label: 'Home' },
    { view: '__new__',   icon: Icons.plus, label: 'New',  isNew: true },
    { view: 'history',   icon: Icons.clock, label: 'History' },
    { view: 'settings',  icon: Icons.gear,  label: 'Settings' },
  ];
  return `<nav class="bottom-nav">${tabs.map(t => {
    if (t.isNew) return `<button class="nav-item nav-item-new${isNew ? ' active' : ''}" onclick="App.navigate('new-inspection')">
      <div class="nav-new-btn">${Icons.plus}</div><span style="margin-top:2px">New</span></button>`;
    return `<button class="nav-item${active === t.view ? ' active' : ''}" onclick="App.navigate('${t.view}')">${t.icon}<span>${t.label}</span></button>`;
  }).join('')}</nav>`;
}

// ─── Views ───────────────────────────────────────────────────────────────────
const Views = {

  // ── Dashboard ─────────────────────────────────────────────────────────────
  dashboard() {
    const settings = Storage.getSettings();
    const all      = Storage.getInspections();
    const recent   = all.slice(0, 5);
    const total    = all.length;
    const ok       = all.filter(i => i.status === 'OK').length;
    const warn     = all.filter(i => i.status === 'WARNING' || i.status === 'ISSUES').length;
    const firstName = settings.engineerName ? settings.engineerName.trim().split(' ')[0] : null;
    const maxI     = settings.maxInspections || 7;

    return `
      <div class="page">
        <div class="header">
          <div class="header-brand">
            <div class="header-logo-mark">DC</div>
            <div class="header-brand-text">
              <span class="header-brand-main">DC Infra Sanity</span>
              <span class="header-brand-sub">Infrastructure Inspection · Digital COE Gen AI Team</span>
            </div>
          </div>
          <button class="header-action" onclick="App.navigate('settings')">${Icons.gear}</button>
        </div>
        <div class="page-content">
          <div class="dashboard-hero">
            <div class="hero-deco-circle"></div>
            <div class="hero-inner">
              <div class="hero-left">
                <div class="hero-label">Data Center Infrastructure Sanity</div>
                <div class="hero-title">${firstName ? `Hi, ${escapeHtml(firstName)} 👋` : 'Welcome'}</div>
                <div class="hero-sub">
                  <span class="${navigator.onLine ? 'hero-online-dot' : 'hero-offline-dot'}"></span>
                  ${navigator.onLine ? 'Online' : 'Offline — saved locally'} &nbsp;·&nbsp;
                  ${new Date().toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short', year:'numeric' })}
                </div>
              </div>
              <div class="hero-right">
                <div class="hero-count">${total}<span class="hero-count-max">/${maxI}</span></div>
                <div class="hero-count-label">Inspections</div>
              </div>
            </div>
          </div>
          <div class="stats-grid">
            <div class="stat-card"><div class="stat-icon">📦</div><div class="stat-value">${total}</div><div class="stat-label">Total</div></div>
            <div class="stat-card stat-card-ok"><div class="stat-icon">✅</div><div class="stat-value">${ok}</div><div class="stat-label">All OK</div></div>
            <div class="stat-card stat-card-warn"><div class="stat-icon">⚠️</div><div class="stat-value">${warn}</div><div class="stat-label">Attention</div></div>
          </div>
          <button class="btn btn-primary mb-16" onclick="App.navigate('new-inspection')">
            ${Icons.plus} Start New Inspection
          </button>
          <div class="dashboard-layout">
            <div class="dashboard-section">
              <div class="section-header">
                <div class="section-title">Recent Inspections</div>
                ${total > 5 ? `<button class="section-link" onclick="App.navigate('history')">View all</button>` : ''}
              </div>
              ${recent.length
                ? `<div class="inspection-list">${recent.map(i => Views._inspectionCard(i)).join('')}</div>`
                : `<div class="empty-state">
                     <div class="empty-state-icon">📋</div>
                     <div class="empty-state-title">No inspections yet</div>
                     <div class="empty-state-sub">Tap <strong>New</strong> to start your first inspection</div>
                   </div>`}
            </div>
            <div class="dashboard-section">
              <div class="section-title mb-8">Available Systems</div>
              <div class="systems-grid">
                ${Object.values(DC_SYSTEMS).map(sys => `
                  <div class="system-card" onclick="App.quickStartSystem('${sys.id}')">
                    <div class="system-card-icon">🏢</div>
                    <div class="system-card-info">
                      <div class="system-card-name">${escapeHtml(sys.name)}</div>
                      <div class="system-card-meta">${sys.cabinets.length} cabinet${sys.cabinets.length !== 1 ? 's' : ''} · ${sys.cabinets.reduce((s, c) => s + c.units.length, 0)} units</div>
                    </div>
                    <div class="system-card-arrow">${Icons.chevronRight}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
        ${buildNav('dashboard')}
      </div>`;
  },

  _inspectionCard(insp) {
    const cabLabel = getCabinetLabel(insp.systemId, insp.cabinetNo);
    const subtitle = cabLabel ? `${escapeHtml(insp.systemId)} – ${cabLabel}` : escapeHtml(insp.systemId);
    const photoCount = (insp.units || []).filter(u => u.hasPhoto).length;
    return `
      <div class="inspection-card status-${insp.status.toLowerCase()}" onclick="App.navigate('detail',{detailId:'${insp.id}'})">
        <div class="inspection-icon" style="${getStatusIconBg(insp.status)}">${getStatusEmoji(insp.status)}</div>
        <div class="inspection-info">
          <div class="inspection-title">${subtitle} · ${formatDate(insp.date)}</div>
          <div class="inspection-meta">
            <span class="badge ${getBadgeClass(insp.status)}">${insp.status}</span>
            ${getTypeBadgeHtml(insp.type)}
            ${photoCount > 0 ? `<span class="photo-count-badge">📷 ${photoCount}</span>` : ''}
            ${insp.engineer ? `<span class="truncate" style="max-width:110px">${escapeHtml(insp.engineer)}</span>` : ''}
          </div>
        </div>
        <div class="inspection-chevron">${Icons.chevronRight}</div>
      </div>`;
  },

  _siteReportSection(insp, recipient) {
    const siteInsps = Storage.getInspections().filter(i =>
      i.systemId === insp.systemId && i.date === insp.date
    );
    if (siteInsps.length <= 1) return '';

    const cabNames = siteInsps.map(i => getCabinetLabel(i.systemId, i.cabinetNo || 1)).join(', ');
    const sysName  = DC_SYSTEMS[insp.systemId]?.name || insp.systemId;
    const ids      = JSON.stringify(siteInsps.map(i => i.id));

    return `
      <div class="site-report-section mt-16">
        <div class="section-title mb-4">Site Report — All Cabinets (${sysName})</div>
        <div class="text-sm text-muted mb-8">${siteInsps.length} cabinets inspected on ${insp.date}: ${escapeHtml(cabNames)}</div>
        <div class="export-grid">
          <button class="btn btn-primary btn-sm" onclick="App.downloadSiteXLS('${escapeHtml(insp.systemId)}','${insp.date}')">
            ${Icons.excel} Combined XLS
          </button>
          <button class="btn btn-primary btn-sm" onclick="App.downloadSiteHTML('${escapeHtml(insp.systemId)}','${insp.date}')">
            ${Icons.file} Combined Report
          </button>
          <button class="btn btn-primary btn-sm" onclick="App.emailSiteReport('${escapeHtml(insp.systemId)}','${insp.date}','${escapeHtml(recipient)}')">
            ${Icons.mail} Email All Cabinets
          </button>
        </div>
      </div>`;
  },

  // ── New Inspection Setup ──────────────────────────────────────────────────
  newInspection() {
    const settings   = Storage.getSettings();
    const defaultSys = settings.defaultSystem || Object.keys(DC_SYSTEMS)[0];
    const system0    = DC_SYSTEMS[defaultSys];

    const sysOptions = Object.keys(DC_SYSTEMS).map(k =>
      `<option value="${k}"${k === defaultSys ? ' selected' : ''}>${escapeHtml(DC_SYSTEMS[k].name)}</option>`
    ).join('');
    const cabOptions = system0.cabinets.map(c =>
      `<option value="${c.cabinetNo}">${escapeHtml(c.label)}</option>`
    ).join('');

    const lastInsp = Storage.getSystemInspections(defaultSys, null, 1)[0];
    const copyBtn  = lastInsp
      ? `<div class="copy-hint mt-12">
           <button class="btn btn-secondary btn-sm" onclick="App.startInspectionFromLast()">
             ${Icons.copy} Copy from last inspection (${formatDate(lastInsp.date)})
           </button>
         </div>` : '';

    return `
      <div class="page">
        <div class="header">
          <button class="header-back" onclick="App.navigate('dashboard')">${Icons.back}</button>
          <div class="header-title">New Inspection</div>
        </div>
        <div class="page-content">
          <div class="form-group">
            <label class="form-label">System / Data Center</label>
            <select class="form-control" id="inp-system" onchange="App.updateCabinetOptions()">${sysOptions}</select>
          </div>
          <div class="form-group">
            <label class="form-label">Cabinet</label>
            <select class="form-control" id="inp-cabinet">${cabOptions}</select>
          </div>
          <div class="form-group">
            <label class="form-label">Inspection Type</label>
            <select class="form-control" id="inp-type">
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="adhoc">Ad-hoc / On-demand</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Inspection Date</label>
            <input type="date" class="form-control" id="inp-date" value="${todayStr()}">
          </div>
          <div class="form-group">
            <label class="form-label">Engineer Name</label>
            <input type="text" class="form-control" id="inp-engineer"
                   placeholder="Your full name"
                   value="${escapeHtml(settings.engineerName || '')}">
          </div>
          <div class="mt-20">
            <button class="btn btn-primary" onclick="App.startInspection()">
              ${Icons.clipboard} Begin Inspection
            </button>
            ${copyBtn}
            <button class="btn btn-secondary mt-8" onclick="App.navigate('dashboard')">Cancel</button>
          </div>
        </div>
        ${buildNav('new-inspection')}
      </div>`;
  },

  // ── Unit Card ─────────────────────────────────────────────────────────────
  _unitCardHtml(unit, frontOptions, backOptions, checkText, inspId) {
    const unitStatus = computeOverallStatus([{ frontStatus: unit.frontStatus, backStatus: unit.backStatus }]);
    const dotClass   = `dot-${unitStatus.toLowerCase()}`;
    const frontClass = getSelectClass(unit.frontStatus);
    const backClass  = getSelectClass(unit.backStatus);
    const customBadge = unit.isCustom ? `<span class="custom-badge">Custom</span>` : '';

    const fThumb = AppState.photoThumbs[`${unit.srNo}_front`] || '';
    const bThumb = AppState.photoThumbs[`${unit.srNo}_back`]  || '';

    return `
      <div class="unit-card" id="unit-card-${unit.srNo}">
        <div class="unit-card-header">
          <div class="unit-number">${unit.srNo}</div>
          <div class="unit-name">${escapeHtml(unit.unit)} ${customBadge}</div>
          <div class="unit-status-dot ${dotClass}" id="dot-${unit.srNo}"></div>
        </div>
        <div class="unit-card-body">
          <div class="unit-check-text">📋 ${escapeHtml(checkText)}</div>
          <div class="unit-status-row">
            <div>
              <div class="unit-side-label">Front Side</div>
              <select class="form-control ${frontClass}" id="sel-${unit.srNo}-front"
                      onchange="App.updateStatus(${unit.srNo},'front',this.value)">
                ${buildOptionsHtml(frontOptions, unit.frontStatus)}
              </select>
              <div class="photo-row">
                <button class="photo-btn" onclick="App.captureUnitPhoto(${unit.srNo},'front')" title="Take photo">
                  ${Icons.camera}
                </button>
                ${fThumb ? `<img class="photo-thumb" src="${fThumb}" onclick="App.viewPhoto(${unit.srNo},'front')" alt="Front photo">
                  <button class="photo-remove" onclick="App.removePhoto(${unit.srNo},'front')" title="Remove">×</button>` : ''}
              </div>
            </div>
            <div>
              <div class="unit-side-label">Back Side</div>
              <select class="form-control ${backClass}" id="sel-${unit.srNo}-back"
                      onchange="App.updateStatus(${unit.srNo},'back',this.value)">
                ${buildOptionsHtml(backOptions, unit.backStatus)}
              </select>
              <div class="photo-row">
                <button class="photo-btn" onclick="App.captureUnitPhoto(${unit.srNo},'back')" title="Take photo">
                  ${Icons.camera}
                </button>
                ${bThumb ? `<img class="photo-thumb" src="${bThumb}" onclick="App.viewPhoto(${unit.srNo},'back')" alt="Back photo">
                  <button class="photo-remove" onclick="App.removePhoto(${unit.srNo},'back')" title="Remove">×</button>` : ''}
              </div>
            </div>
          </div>
          <textarea class="form-control unit-notes" id="notes-${unit.srNo}" rows="2"
                    placeholder="Observations / comments (optional)"
                    oninput="App.updateNotes(${unit.srNo},this.value)"
          >${escapeHtml(unit.notes || '')}</textarea>
        </div>
      </div>`;
  },

  // ── Checklist ─────────────────────────────────────────────────────────────
  checklist() {
    const insp = AppState.pendingInspection;
    if (!insp) { App.navigate('dashboard'); return ''; }

    const cabinetNo = insp.cabinetNo || 1;
    const cabLabel  = getCabinetLabel(insp.systemId, cabinetNo);
    const cabUnits  = getCabinetUnits(insp.systemId, cabinetNo);
    const isEditing = !!insp._editId;
    const totalU    = insp.units.length;
    const filled    = insp.units.filter(u => u.frontStatus !== '').length;
    const progress  = Math.round((filled / totalU) * 100);

    const overall = computeOverallStatus(
      insp.units.map(u => ({ frontStatus: u.frontStatus, backStatus: u.backStatus }))
    );
    const bannerMsgs = {
      INCOMPLETE: `${filled} of ${totalU} units completed`,
      OK:         'All units checked — no issues found',
      WARNING:    'Some units need attention',
      ISSUES:     'Critical issues detected — review required',
    };

    const inspId = insp._editId || insp._preId;
    const unitsHtml = insp.units.map(unit => {
      const def = cabUnits.find(u => u.srNo === unit.srNo);
      return Views._unitCardHtml(
        unit,
        def ? def.frontOptions : LED_OPTIONS,
        def ? def.backOptions  : LED_OPTIONS,
        def ? def.check        : 'Custom unit — check LED status',
        inspId
      );
    }).join('');

    return `
      <div class="page">
        <div class="header">
          <button class="header-back" onclick="App.confirmLeave()">${Icons.back}</button>
          <div class="header-title">${escapeHtml(insp.systemId)} – ${cabLabel}</div>
          <button class="header-action" onclick="App.saveInspection()">
            ${Icons.save} ${isEditing ? 'Update' : 'Save'}
          </button>
        </div>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill" id="progress-fill" style="width:${progress}%"></div>
        </div>
        <div class="page-content" style="padding-top:calc(var(--header-h) + 3px + 16px)">
          <div class="checklist-meta mb-12">
            <span>${formatDate(insp.date)}</span>
            ${getTypeBadgeHtml(insp.type)}
            ${insp.engineer ? `<span>👤 ${escapeHtml(insp.engineer)}</span>` : ''}
          </div>
          <div class="status-banner ${overall.toLowerCase()}" id="status-banner">
            <div class="status-banner-icon" id="banner-icon">${getStatusEmoji(overall)}</div>
            <div>
              <div class="status-banner-title" id="banner-title">${overall}</div>
              <div class="status-banner-sub"   id="banner-sub">${bannerMsgs[overall]}</div>
            </div>
          </div>
          <div id="units-container" class="units-grid">${unitsHtml}</div>
          <div class="add-unit-section mt-4">
            <div class="add-unit-section-title">➕ Add Custom Unit</div>
            <div class="add-unit-row">
              <input type="text" class="form-control" id="new-unit-name"
                     placeholder="Unit name (e.g. Switch 1A, ATS 2)">
              <button class="btn btn-secondary btn-sm" onclick="App.addCustomUnit()">Add</button>
            </div>
          </div>
          <div class="mt-16">
            <button class="btn btn-primary" onclick="App.saveInspection()">
              ${Icons.check} ${isEditing ? 'Update Inspection' : 'Save Inspection'}
            </button>
            <button class="btn btn-secondary" onclick="App.confirmLeave()">Discard &amp; Exit</button>
          </div>
        </div>
        ${buildNav('checklist')}
      </div>`;
  },

  // ── History ───────────────────────────────────────────────────────────────
  history() {
    const filter = AppState.historyFilter;
    let inspections = Storage.getInspections();
    if (filter !== 'all') inspections = inspections.filter(i => i.type === filter);
    const total = Storage.getInspections().length;

    const chips = ['all','weekly','biweekly','adhoc'].map(f => `
      <button class="filter-chip${filter === f ? ' active' : ''}" onclick="App.setHistoryFilter('${f}')">
        ${{ all:'All', weekly:'Weekly', biweekly:'Bi-weekly', adhoc:'Ad-hoc' }[f]}
      </button>`).join('');

    return `
      <div class="page">
        <div class="header">
          <div class="header-title">Inspection History</div>
          ${total > 0 ? `<button class="header-action" onclick="App.exportAll()">${Icons.download} Export</button>` : ''}
        </div>
        <div class="page-content">
          <div class="filter-row">${chips}</div>
          ${inspections.length
            ? `<div class="inspection-list history-grid">${inspections.map(i => Views._inspectionCard(i)).join('')}</div>`
            : `<div class="empty-state">
                 <div class="empty-state-icon">🗂️</div>
                 <div class="empty-state-title">No ${filter !== 'all' ? filter : ''} inspections</div>
                 <div class="empty-state-sub">Completed inspections will appear here</div>
               </div>`}
        </div>
        ${buildNav('history')}
      </div>`;
  },

  // ── Detail ────────────────────────────────────────────────────────────────
  detail(id) {
    const insp = Storage.getInspection(id);
    if (!insp) { App.navigate('history'); return ''; }
    const cabinetNo = insp.cabinetNo || 1;
    const cabLabel  = getCabinetLabel(insp.systemId, cabinetNo);
    const colorStyle = {
      ok: 'color:var(--green);font-weight:600', warning: 'color:var(--amber);font-weight:600',
      issues: 'color:var(--red);font-weight:700', incomplete: 'color:var(--text-xs)',
    };
    const tableRows = insp.units.map(unit => {
      const fColor  = colorStyle[getStatusColor(unit.frontStatus)];
      const bColor  = colorStyle[getStatusColor(unit.backStatus)];
      const custBdg = unit.isCustom ? `<span class="custom-badge">Custom</span>` : '';
      const hasNote = unit.notes && unit.notes.trim();
      const hasP    = unit.hasPhoto;
      return `
        <tr>
          <td style="color:var(--text-xs);font-weight:700;text-align:center;width:36px">${unit.srNo}</td>
          <td style="font-weight:600">${escapeHtml(unit.unit)}${custBdg}</td>
          <td style="${fColor}">${escapeHtml(unit.frontStatus) || '—'}</td>
          <td style="${bColor}">${escapeHtml(unit.backStatus) || '—'}</td>
          <td class="photo-cell">${hasP ? `<button class="photo-view-btn" onclick="App.viewSavedPhotos('${id}',${unit.srNo})">📷 View</button>` : '<span style="color:var(--text-xs)">—</span>'}</td>
        </tr>
        ${hasNote ? `<tr class="notes-sub-row"><td></td><td colspan="4">💬 ${escapeHtml(unit.notes)}</td></tr>` : ''}`;
    }).join('');

    const recipient = Storage.getSettings().emailRecipient || '';

    return `
      <div class="page">
        <div class="header">
          <button class="header-back" onclick="App.navigate('history')">${Icons.back}</button>
          <div class="header-title">${escapeHtml(insp.systemId)} – ${cabLabel} · ${formatDate(insp.date)}</div>
          <button class="header-action header-action-danger" onclick="App.deleteInspection('${id}')">${Icons.trash}</button>
        </div>
        <div class="page-content">
          <div class="card mb-12">
            <div class="card-body">
              <div class="flex items-center justify-between mb-8">
                <div>
                  <div class="font-bold">${escapeHtml(DC_SYSTEMS[insp.systemId]?.name || insp.systemId)} — ${cabLabel}</div>
                  <div class="text-sm text-muted">${formatDate(insp.date)} · ${getTypeBadgeHtml(insp.type)}</div>
                </div>
                <span class="badge ${getBadgeClass(insp.status)}">${insp.status}</span>
              </div>
              ${insp.engineer ? `<div class="text-sm text-muted mb-4">👤 ${escapeHtml(insp.engineer)}</div>` : ''}
              <div class="text-xs text-muted">Saved ${new Date(insp.createdAt).toLocaleString('en-GB')}</div>
            </div>
          </div>
          <button class="btn btn-edit btn-sm mb-12" onclick="App.editInspection('${id}')">
            ${Icons.edit} ${insp.status === 'INCOMPLETE' ? 'Complete This Inspection' : 'Edit Inspection'}
          </button>
          <div class="section-title mb-8">Unit Results</div>
          <div class="card mb-16">
            <div class="overflow-x-auto">
              <table class="detail-table">
                <thead><tr><th>#</th><th>Unit</th><th>Front Side</th><th>Back Side</th><th>Photos</th></tr></thead>
                <tbody>${tableRows}</tbody>
              </table>
            </div>
          </div>
          <div class="section-title mb-8">Export &amp; Share — This Cabinet</div>
          <div class="export-grid">
            <button class="btn btn-secondary btn-sm" onclick="Export.downloadCSV(Storage.getInspection('${id}'))">
              ${Icons.download} CSV
            </button>
            <button class="btn btn-secondary btn-sm" onclick="Export.downloadXLS(Storage.getInspection('${id}'))">
              ${Icons.excel} XLS (Excel)
            </button>
            <button class="btn btn-secondary btn-sm" onclick="Export.downloadHTMLReport(Storage.getInspection('${id}'))">
              ${Icons.file} Report + Photos
            </button>
            <button class="btn btn-secondary btn-sm" onclick="Export.emailReport(Storage.getInspection('${id}'),'${escapeHtml(recipient)}')">
              ${Icons.mail} Email
            </button>
          </div>
          ${Views._siteReportSection(insp, recipient)}
        </div>
        ${buildNav('history')}
      </div>`;
  },

  // ── Settings ──────────────────────────────────────────────────────────────
  settings() {
    const settings = Storage.getSettings();
    const info     = Storage.getStorageInfo();
    const sysOpts  = Object.keys(DC_SYSTEMS).map(k =>
      `<option value="${k}"${settings.defaultSystem === k ? ' selected' : ''}>${escapeHtml(DC_SYSTEMS[k].name)}</option>`
    ).join('');

    return `
      <div class="page">
        <div class="header"><div class="header-title">Settings</div></div>
        <div class="page-content">
          <div class="settings-layout">
            <div class="settings-section">
              <div class="section-title mb-12">Profile</div>
              <div class="form-group">
                <label class="form-label">Engineer Name</label>
                <input type="text" class="form-control" id="settings-name" placeholder="Your full name"
                       value="${escapeHtml(settings.engineerName || '')}">
              </div>
              <div class="form-group">
                <label class="form-label">Default System</label>
                <select class="form-control" id="settings-system">${sysOpts}</select>
              </div>
              <div class="form-group">
                <label class="form-label">Email Recipient (for reports)</label>
                <input type="email" class="form-control" id="settings-email" placeholder="team@company.com"
                       value="${escapeHtml(settings.emailRecipient || '')}">
              </div>
              <div class="form-group">
                <label class="form-label">Max Inspections to Keep</label>
                <select class="form-control" id="settings-max">
                  ${[5,6,7,8,10].map(n => `<option value="${n}"${(settings.maxInspections || 7) === n ? ' selected' : ''}>${n}</option>`).join('')}
                </select>
              </div>
              <button class="btn btn-primary btn-sm" onclick="App.saveSettings()">
                ${Icons.check} Save Settings
              </button>
            </div>
            <div class="settings-section">
              <div class="divider hide-desktop"></div>
              <div class="section-title mb-12">Stored Data</div>
              <div class="info-row mb-12">
                <div class="info-row-icon" style="background:var(--primary-light)">💾</div>
                <div class="info-row-body">
                  <div class="info-row-title">${info.count} inspection${info.count !== 1 ? 's' : ''} stored</div>
                  <div class="info-row-sub">${info.kb} KB · Max ${settings.maxInspections || 7} inspections · Oldest auto-deleted</div>
                </div>
              </div>
              <div class="export-grid mb-12">
                <button class="btn btn-secondary btn-sm" onclick="App.exportAll()">
                  ${Icons.download} Export All CSV
                </button>
                <button class="btn btn-secondary btn-sm" onclick="App.exportAllXLS()">
                  ${Icons.excel} Export All XLS
                </button>
              </div>
              <div class="divider"></div>
              <div class="section-title mb-12">Backup &amp; Restore</div>
              <div class="info-row mb-12">
                <div class="info-row-icon" style="background:var(--green-bg)">${Icons.wifi}</div>
                <div class="info-row-body">
                  <div class="info-row-title">Offline-first storage</div>
                  <div class="info-row-sub">Data saved locally. Use backup to transfer between devices.</div>
                </div>
              </div>
              <div class="export-grid mb-12">
                <button class="btn btn-secondary btn-sm" onclick="App.downloadBackup()">
                  ${Icons.download} Download Backup
                </button>
                <button class="btn btn-secondary btn-sm" onclick="App.triggerRestore()">
                  ${Icons.upload} Restore Backup
                </button>
              </div>
              <input type="file" id="restore-input" accept=".json" style="display:none" onchange="App.restoreBackup(this)">
              ${info.count > 0 ? `
              <div class="divider"></div>
              <div class="section-title mb-12">Danger Zone</div>
              <button class="btn btn-danger btn-sm" onclick="App.clearAllData()">
                ${Icons.trash} Clear All Inspection Data
              </button>` : ''}
            </div>
          </div>
        </div>
        ${buildNav('settings')}
      </div>`;
  },
};

// ─── Photo Viewer Modal ─────────────────────────────────────────────────────
function showPhotoModal(dataUrl, title) {
  let modal = document.getElementById('photo-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'photo-modal';
    modal.className = 'photo-modal';
    document.body.appendChild(modal);
  }
  modal.innerHTML = `
    <div class="photo-modal-overlay" onclick="document.getElementById('photo-modal').classList.remove('show')"></div>
    <div class="photo-modal-content">
      <div class="photo-modal-header">
        <span>${escapeHtml(title || 'Photo')}</span>
        <button onclick="document.getElementById('photo-modal').classList.remove('show')">✕</button>
      </div>
      <img src="${dataUrl}" alt="${escapeHtml(title)}">
    </div>`;
  modal.classList.add('show');
}

// ─── App Controller ─────────────────────────────────────────────────────────
const App = {

  navigate(view, params = {}) {
    if (AppState.view === 'checklist' && view !== 'checklist') {
      const insp  = AppState.pendingInspection;
      const dirty = insp && insp.units.some(u => u.frontStatus !== '' || (u.notes && u.notes.trim()));
      if (dirty && !confirm('Leave this inspection? Progress will be lost.')) return;
      if (!insp._editId && insp._preId) {
        Storage.deletePhotosForInspection(insp._preId).catch(() => {});
      }
      AppState.pendingInspection = null;
      AppState.photoThumbs = {};
    }
    AppState.view = view;
    if (params.detailId !== undefined) AppState.detailId = params.detailId;
    this._render();
    window.scrollTo(0, 0);
  },

  _render() {
    const app = document.getElementById('app');
    if (!app) return;
    switch (AppState.view) {
      case 'dashboard':      app.innerHTML = Views.dashboard();                break;
      case 'new-inspection': app.innerHTML = Views.newInspection();            break;
      case 'checklist':      app.innerHTML = Views.checklist();                break;
      case 'history':        app.innerHTML = Views.history();                  break;
      case 'detail':         app.innerHTML = Views.detail(AppState.detailId);  break;
      case 'settings':       app.innerHTML = Views.settings();                 break;
      default:               app.innerHTML = Views.dashboard();
    }
  },

  // ── Cabinet dropdown sync ─────────────────────────────────────────────────
  updateCabinetOptions() {
    const systemId = document.getElementById('inp-system').value;
    const system   = DC_SYSTEMS[systemId];
    const cabSel   = document.getElementById('inp-cabinet');
    if (!system || !cabSel) return;
    cabSel.innerHTML = system.cabinets.map(c =>
      `<option value="${c.cabinetNo}">${escapeHtml(c.label)}</option>`
    ).join('');
  },

  // ── Start inspection ──────────────────────────────────────────────────────
  startInspection() {
    const systemId  = document.getElementById('inp-system').value;
    const cabinetNo = parseInt(document.getElementById('inp-cabinet').value, 10);
    const type      = document.getElementById('inp-type').value;
    const date      = document.getElementById('inp-date').value;
    const engineer  = document.getElementById('inp-engineer').value.trim();
    if (!date) { showToast('Please select a date'); return; }

    const settings = Storage.getSettings();
    if (engineer !== settings.engineerName) Storage.saveSettings({ ...settings, engineerName: engineer });

    const units  = getCabinetUnits(systemId, cabinetNo);
    const preId  = Storage.generateId();
    AppState.pendingInspection = {
      systemId, cabinetNo, type, date, engineer, status: 'INCOMPLETE', _preId: preId,
      units: units.map(u => ({ srNo: u.srNo, unit: u.unit, frontStatus: '', backStatus: '', notes: '', hasPhoto: false })),
    };
    AppState.photoThumbs = {};
    AppState.view = 'checklist';
    this._render();
    window.scrollTo(0, 0);
  },

  startInspectionFromLast() {
    const systemId  = document.getElementById('inp-system').value;
    const cabinetNo = parseInt(document.getElementById('inp-cabinet').value, 10);
    const type      = document.getElementById('inp-type').value;
    const date      = document.getElementById('inp-date').value;
    const engineer  = document.getElementById('inp-engineer').value.trim();
    if (!date) { showToast('Please select a date'); return; }

    const last = Storage.getSystemInspections(systemId, cabinetNo, 1)[0];
    if (!last) { this.startInspection(); return; }

    const settings = Storage.getSettings();
    if (engineer !== settings.engineerName) Storage.saveSettings({ ...settings, engineerName: engineer });

    const preId = Storage.generateId();
    AppState.pendingInspection = {
      systemId, cabinetNo, type, date, engineer, status: 'INCOMPLETE', _preId: preId,
      units: last.units.map(u => ({
        srNo: u.srNo, unit: u.unit,
        frontStatus: u.frontStatus || '', backStatus: u.backStatus || '',
        notes: '', hasPhoto: false, isCustom: u.isCustom || false,
      })),
    };
    AppState.photoThumbs = {};
    AppState.view = 'checklist';
    this._render();
    window.scrollTo(0, 0);
    showToast('Copied from last inspection — review & update');
  },

  quickStartSystem(systemId) {
    const settings = Storage.getSettings();
    Storage.saveSettings({ ...settings, defaultSystem: systemId });
    this.navigate('new-inspection');
    setTimeout(() => {
      const sel = document.getElementById('inp-system');
      if (sel) { sel.value = systemId; this.updateCabinetOptions(); }
    }, 50);
  },

  editInspection(id) {
    const insp = Storage.getInspection(id);
    if (!insp) return;
    AppState.pendingInspection = {
      ...insp, cabinetNo: insp.cabinetNo || 1,
      units: insp.units.map(u => ({ ...u })), _editId: id,
    };
    AppState.photoThumbs = {};
    this._loadExistingThumbs(id, insp.units);
    AppState.view = 'checklist';
    this._render();
    window.scrollTo(0, 0);
  },

  async _loadExistingThumbs(inspId, units) {
    for (const u of units) {
      for (const side of ['front', 'back']) {
        const key  = Storage.photoKey(inspId, u.srNo, side);
        const blob = await Storage.getPhoto(key).catch(() => null);
        if (blob) {
          const thumb = await Camera.createThumbnail(blob);
          AppState.photoThumbs[`${u.srNo}_${side}`] = thumb;
          const container = document.querySelector(`#unit-card-${u.srNo} .photo-row:nth-of-type(${side === 'front' ? 1 : 2})`);
          if (container) this._refreshPhotoRow(u.srNo, side, thumb);
        }
      }
    }
  },

  // ── Checklist interactions ────────────────────────────────────────────────
  updateStatus(srNo, side, value) {
    const insp = AppState.pendingInspection;
    if (!insp) return;
    const unit = insp.units.find(u => u.srNo === srNo);
    if (!unit) return;
    if (side === 'front') unit.frontStatus = value; else unit.backStatus = value;
    const sel = document.getElementById(`sel-${srNo}-${side}`);
    if (sel) sel.className = `form-control ${getSelectClass(value)}`;
    const unitSt = computeOverallStatus([{ frontStatus: unit.frontStatus, backStatus: unit.backStatus }]);
    const dot = document.getElementById(`dot-${srNo}`);
    if (dot) dot.className = `unit-status-dot dot-${unitSt.toLowerCase()}`;
    this._updateProgressAndBanner();
  },

  updateNotes(srNo, value) {
    const unit = AppState.pendingInspection?.units.find(u => u.srNo === srNo);
    if (unit) unit.notes = value;
  },

  _updateProgressAndBanner() {
    const insp = AppState.pendingInspection;
    if (!insp) return;
    const total   = insp.units.length;
    const filled  = insp.units.filter(u => u.frontStatus !== '').length;
    const pct     = Math.round((filled / total) * 100);
    const fill    = document.getElementById('progress-fill');
    if (fill) fill.style.width = `${pct}%`;
    const overall = computeOverallStatus(insp.units.map(u => ({ frontStatus: u.frontStatus, backStatus: u.backStatus })));
    insp.status = overall;
    const msgs = { INCOMPLETE: `${filled} of ${total} units completed`, OK: 'All units checked — no issues found', WARNING: 'Some units need attention', ISSUES: 'Critical issues detected — review required' };
    const banner = document.getElementById('status-banner');
    const iconEl = document.getElementById('banner-icon');
    const titleE = document.getElementById('banner-title');
    const subEl  = document.getElementById('banner-sub');
    if (banner) banner.className  = `status-banner ${overall.toLowerCase()}`;
    if (iconEl) iconEl.textContent = getStatusEmoji(overall);
    if (titleE) titleE.textContent = overall;
    if (subEl)  subEl.textContent  = msgs[overall];
  },

  addCustomUnit() {
    const inp = document.getElementById('new-unit-name');
    if (!inp) return;
    const name = inp.value.trim();
    if (!name) { showToast('Please enter a unit name'); return; }
    const insp     = AppState.pendingInspection;
    if (!insp) return;
    const nextSrNo = insp.units.reduce((max, u) => Math.max(max, u.srNo), 0) + 1;
    const newUnit  = { srNo: nextSrNo, unit: name, frontStatus: '', backStatus: '', notes: '', isCustom: true, hasPhoto: false };
    insp.units.push(newUnit);
    const container = document.getElementById('units-container');
    if (container) {
      const tmp = document.createElement('div');
      tmp.innerHTML = Views._unitCardHtml(newUnit, LED_OPTIONS, LED_OPTIONS, 'Custom unit — check LED status', insp._editId || insp._preId);
      const card = tmp.firstElementChild;
      container.appendChild(card);
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    inp.value = '';
    this._updateProgressAndBanner();
    showToast(`Unit "${name}" added`);
  },

  // ── Photo capture ─────────────────────────────────────────────────────────
  async captureUnitPhoto(srNo, side) {
    const insp = AppState.pendingInspection;
    if (!insp) return;
    try {
      const blob  = await Camera.capturePhoto();
      const thumb = await Camera.createThumbnail(blob);
      const inspId = insp._editId || insp._preId;
      const key    = Storage.photoKey(inspId, srNo, side);
      await Storage.savePhoto(key, blob);
      AppState.photoThumbs[`${srNo}_${side}`] = thumb;
      const unit = insp.units.find(u => u.srNo === srNo);
      if (unit) unit.hasPhoto = true;
      this._refreshPhotoRow(srNo, side, thumb);
      showToast('Photo captured');
    } catch (e) {
      if (e.message !== 'Cancelled') showToast('Photo capture failed');
    }
  },

  _refreshPhotoRow(srNo, side, thumb) {
    const card = document.getElementById(`unit-card-${srNo}`);
    if (!card) return;
    const rows = card.querySelectorAll('.photo-row');
    const row  = side === 'front' ? rows[0] : rows[1];
    if (!row) return;
    const existingThumb  = row.querySelector('.photo-thumb');
    const existingRemove = row.querySelector('.photo-remove');
    if (existingThumb)  existingThumb.remove();
    if (existingRemove) existingRemove.remove();
    if (thumb) {
      const img = document.createElement('img');
      img.className = 'photo-thumb';
      img.src = thumb;
      img.alt = `${side} photo`;
      img.onclick = () => App.viewPhoto(srNo, side);
      row.appendChild(img);
      const rm = document.createElement('button');
      rm.className = 'photo-remove';
      rm.textContent = '×';
      rm.title = 'Remove';
      rm.onclick = () => App.removePhoto(srNo, side);
      row.appendChild(rm);
    }
  },

  async removePhoto(srNo, side) {
    const insp = AppState.pendingInspection;
    if (!insp) return;
    const inspId = insp._editId || insp._preId;
    await Storage.deletePhoto(Storage.photoKey(inspId, srNo, side)).catch(() => {});
    delete AppState.photoThumbs[`${srNo}_${side}`];
    const unit = insp.units.find(u => u.srNo === srNo);
    if (unit) {
      const otherSide = side === 'front' ? 'back' : 'front';
      unit.hasPhoto = !!AppState.photoThumbs[`${srNo}_${otherSide}`];
    }
    this._refreshPhotoRow(srNo, side, null);
    showToast('Photo removed');
  },

  async viewPhoto(srNo, side) {
    const insp   = AppState.pendingInspection;
    if (!insp) return;
    const inspId = insp._editId || insp._preId;
    const blob   = await Storage.getPhoto(Storage.photoKey(inspId, srNo, side)).catch(() => null);
    if (!blob) { showToast('Photo not found'); return; }
    const dataUrl = await Camera.blobToDataUrl(blob);
    const unit    = insp.units.find(u => u.srNo === srNo);
    showPhotoModal(dataUrl, `${unit ? unit.unit : 'Unit ' + srNo} — ${side} side`);
  },

  async viewSavedPhotos(inspId, srNo) {
    const insp = Storage.getInspection(inspId);
    const unit = insp?.units.find(u => u.srNo === srNo);
    const name = unit ? unit.unit : `Unit ${srNo}`;
    for (const side of ['front', 'back']) {
      const blob = await Storage.getPhoto(Storage.photoKey(inspId, srNo, side)).catch(() => null);
      if (blob) {
        const dataUrl = await Camera.blobToDataUrl(blob);
        showPhotoModal(dataUrl, `${name} — ${side} side`);
        return;
      }
    }
    showToast('No photos found');
  },

  // ── Save ──────────────────────────────────────────────────────────────────
  async saveInspection() {
    const insp = AppState.pendingInspection;
    if (!insp) return;
    const { _editId, _preId, ...data } = insp;
    data.status = computeOverallStatus(data.units.map(u => ({ frontStatus: u.frontStatus, backStatus: u.backStatus })));

    if (_editId) {
      Storage.updateInspection(_editId, data);
      AppState.pendingInspection = null;
      AppState.photoThumbs = {};
      AppState.detailId = _editId;
      AppState.view = 'detail';
      this._render();
      window.scrollTo(0, 0);
      showToast('Inspection updated');
    } else {
      data._preId = _preId;
      const saved = await Storage.addInspection(data);
      AppState.pendingInspection = null;
      AppState.photoThumbs = {};
      AppState.view = 'dashboard';
      this._render();
      window.scrollTo(0, 0);
      showToast('Inspection saved');
    }
  },

  confirmLeave() {
    const insp  = AppState.pendingInspection;
    const dirty = insp && insp.units.some(u => u.frontStatus !== '' || (u.notes && u.notes.trim()));
    if (dirty && !confirm('Discard changes? Progress will be lost.')) return;
    if (insp && !insp._editId && insp._preId) {
      Storage.deletePhotosForInspection(insp._preId).catch(() => {});
    }
    AppState.photoThumbs = {};
    AppState.pendingInspection = null;
    if (insp && insp._editId) {
      AppState.detailId = insp._editId;
      AppState.view = 'detail';
    } else {
      AppState.view = 'dashboard';
    }
    this._render();
    window.scrollTo(0, 0);
  },

  // ── History ───────────────────────────────────────────────────────────────
  setHistoryFilter(f) { AppState.historyFilter = f; AppState.view = 'history'; this._render(); },

  async deleteInspection(id) {
    if (!confirm('Delete this inspection? This cannot be undone.')) return;
    await Storage.deleteInspection(id);
    this.navigate('history');
    showToast('Inspection deleted');
  },

  // ── Export ────────────────────────────────────────────────────────────────
  exportAll() {
    const all = Storage.getInspections();
    if (!all.length) { showToast('No data to export'); return; }
    const systemId = all[0].systemId;
    Export.downloadCSVMultiple(all.filter(i => i.systemId === systemId), systemId);
    showToast('Downloading CSV…');
  },

  _getSiteInspections(systemId, date) {
    return Storage.getInspections().filter(i => i.systemId === systemId && i.date === date)
      .sort((a, b) => (a.cabinetNo || 1) - (b.cabinetNo || 1));
  },

  downloadSiteXLS(systemId, date) {
    const insps = this._getSiteInspections(systemId, date);
    if (!insps.length) { showToast('No inspections found'); return; }
    Export.downloadSiteXLS(insps);
    showToast(`Downloading combined XLS — ${insps.length} cabinet(s)…`);
  },

  async downloadSiteHTML(systemId, date) {
    const insps = this._getSiteInspections(systemId, date);
    if (!insps.length) { showToast('No inspections found'); return; }
    showToast('Generating combined report…');
    await Export.downloadSiteHTMLReport(insps);
    showToast(`Combined HTML report — ${insps.length} cabinet(s)`);
  },

  emailSiteReport(systemId, date, recipient) {
    const insps = this._getSiteInspections(systemId, date);
    if (!insps.length) { showToast('No inspections found'); return; }
    Export.emailSiteReport(insps, recipient);
  },

  exportAllXLS() {
    const all = Storage.getInspections();
    if (!all.length) { showToast('No data to export'); return; }
    const systemId = all[0].systemId;
    Export.downloadXLSMultiple(all.filter(i => i.systemId === systemId), systemId);
    showToast('Downloading XLS…');
  },

  // ── Settings ──────────────────────────────────────────────────────────────
  saveSettings() {
    const name   = document.getElementById('settings-name').value.trim();
    const system = document.getElementById('settings-system').value;
    const email  = document.getElementById('settings-email').value.trim();
    const max    = parseInt(document.getElementById('settings-max').value, 10) || 7;
    Storage.saveSettings({ engineerName: name, defaultSystem: system, emailRecipient: email, maxInspections: max });
    showToast('Settings saved');
  },

  async clearAllData() {
    const count = Storage.getStorageInfo().count;
    if (!confirm(`Permanently delete all ${count} inspection(s) and photos? This cannot be undone.`)) return;
    await Storage.clearAllInspections();
    AppState.view = 'settings';
    this._render();
    showToast('All data cleared');
  },

  // ── Backup / Restore ──────────────────────────────────────────────────────
  async downloadBackup() {
    showToast('Preparing backup…');
    try {
      const json = await Storage.exportBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = Object.assign(document.createElement('a'), {
        href: url,
        download: `DC_Sanity_Backup_${new Date().toISOString().split('T')[0]}.json`,
      });
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Backup downloaded');
    } catch (e) {
      showToast('Backup failed: ' + e.message);
    }
  },

  triggerRestore() { document.getElementById('restore-input')?.click(); },

  async restoreBackup(input) {
    if (!input.files || !input.files[0]) return;
    if (!confirm('This will replace all current data. Continue?')) { input.value = ''; return; }
    showToast('Restoring…');
    try {
      const text = await input.files[0].text();
      await Storage.importBackup(text);
      input.value = '';
      this._render();
      showToast('Backup restored successfully');
    } catch (e) {
      showToast('Restore failed: ' + e.message);
    }
  },

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  init() {
    this._render();
    window.addEventListener('online',  () => { const d = document.querySelector('.hero-offline-dot'); if (d) d.className = 'hero-online-dot'; });
    window.addEventListener('offline', () => { const d = document.querySelector('.hero-online-dot');  if (d) d.className = 'hero-offline-dot'; });
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
