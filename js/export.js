'use strict';

// ─── Export Module ───────────────────────────────────────────────────────────
// CSV, XLS (HTML-table), HTML report with photos, and email export.
// Depends on: DC_SYSTEMS, STATUS_SEVERITY, getCabinetUnits, getCabinetLabel (data.js)
//             Storage (storage.js), Camera (camera.js)

const Export = (() => {

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function _sev(value) { return STATUS_SEVERITY[value] ?? -1; }

  function _statusStyle(value) {
    const s = _sev(value);
    if (s < 0)  return 'color:#94a3b8';
    if (s === 0) return 'background:#f0fdf4;color:#16a34a;font-weight:600';
    if (s <= 2)  return 'background:#fffbeb;color:#d97706;font-weight:600';
    return 'background:#fef2f2;color:#dc2626;font-weight:700';
  }

  function _csvCell(val) {
    const s = String(val ?? '');
    return (s.includes(',') || s.includes('"') || s.includes('\n'))
      ? `"${s.replace(/"/g, '""')}"` : s;
  }

  function _esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function _download(content, filename, mimeType) {
    const bom  = mimeType.includes('csv') ? '\ufeff' : '';
    const blob = new Blob([bom + content], { type: mimeType });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function _checkText(systemId, cabinetNo, srNo) {
    const units = getCabinetUnits(systemId, cabinetNo || 1);
    const def   = units.find(u => u.srNo === srNo);
    return def ? def.check : 'Custom unit';
  }

  // ── Single-inspection CSV ──────────────────────────────────────────────────

  function _buildSingleCSV(insp) {
    const cabLabel  = getCabinetLabel(insp.systemId, insp.cabinetNo || 1);
    const hasNotes  = insp.units.some(u => u.notes && u.notes.trim());
    const headers   = ['Sr. No.', 'Units', 'Checks to be Done',
                       `Front Side (${insp.date})`, `Back Side (${insp.date})`];
    if (hasNotes) headers.push('Observations');

    const rows = [
      [`DC Site Inspection Report — ${insp.systemId} / ${cabLabel}`],
      [`Date: ${insp.date}`, `Type: ${insp.type}`, `Engineer: ${insp.engineer || 'N/A'}`, `Status: ${insp.status}`],
      [],
      headers,
      ...insp.units.map(u => {
        const r = [u.srNo, u.unit, _checkText(insp.systemId, insp.cabinetNo, u.srNo),
                   u.frontStatus || '', u.backStatus || ''];
        if (hasNotes) r.push(u.notes || '');
        return r;
      }),
    ];
    return rows.map(r => r.map(_csvCell).join(',')).join('\r\n');
  }

  // ── Multi-inspection CSV ───────────────────────────────────────────────────

  function _buildMultiCSV(inspections) {
    if (!inspections.length) return '';
    const { systemId, cabinetNo } = inspections[0];
    const cabLabel  = getCabinetLabel(systemId, cabinetNo || 1);
    const cabUnits  = getCabinetUnits(systemId, cabinetNo || 1);
    const dateH     = inspections.flatMap(i => [`Front ${i.date}`, `Back ${i.date}`]);
    const rows = [
      [`DC Site Inspection History — ${systemId} / ${cabLabel}`],
      [`Exported: ${new Date().toLocaleDateString('en-GB')}`, `${inspections.length} inspection(s)`],
      [], ['Sr. No.', 'Units', 'Checks to be Done', ...dateH],
      ...cabUnits.map(def => {
        const cols = inspections.flatMap(insp => {
          const u = insp.units.find(x => x.srNo === def.srNo) || {};
          return [u.frontStatus || '', u.backStatus || ''];
        });
        return [def.srNo, def.unit, def.check, ...cols];
      }),
    ];
    return rows.map(r => r.map(_csvCell).join(',')).join('\r\n');
  }

  // ── XLS (HTML table → .xls) ────────────────────────────────────────────────

  function _buildXLS(inspections) {
    if (!inspections.length) return '';
    const isSingle = inspections.length === 1;
    const { systemId, cabinetNo } = inspections[0];
    const cabLabel = getCabinetLabel(systemId, cabinetNo || 1);

    const unitRefs = isSingle
      ? inspections[0].units
      : getCabinetUnits(systemId, cabinetNo || 1).map(u => ({ srNo: u.srNo, unit: u.unit }));

    const hasNotes = isSingle && inspections[0].units.some(u => u.notes && u.notes.trim());
    const colspan  = 3 + inspections.length * 2 + (hasNotes ? 1 : 0);

    const dateHeaders = inspections.flatMap(i => [
      `<th style="background:#dbeafe;color:#1d4ed8;font-weight:700">Front Side<br>${i.date}</th>`,
      `<th style="background:#dbeafe;color:#1d4ed8;font-weight:700">Back Side<br>${i.date}</th>`,
    ]).join('');
    const notesH = hasNotes ? `<th style="background:#f0fdf4;color:#16a34a;font-weight:700">Observations</th>` : '';

    const dataRows = unitRefs.map(ref => {
      const check    = _checkText(systemId, cabinetNo, ref.srNo);
      const isCustom = ref.isCustom || !getCabinetUnits(systemId, cabinetNo || 1).find(u => u.srNo === ref.srNo);
      const custBdg  = isCustom ? ' <span style="background:#e0e7ff;color:#4338ca;font-size:9pt;padding:1px 5px;border-radius:3px">Custom</span>' : '';
      const cells    = inspections.flatMap(insp => {
        const u = insp.units.find(x => x.srNo === ref.srNo) || {};
        return [
          `<td style="${_statusStyle(u.frontStatus)}">${_esc(u.frontStatus) || '—'}</td>`,
          `<td style="${_statusStyle(u.backStatus)}">${_esc(u.backStatus) || '—'}</td>`,
        ];
      }).join('');
      const notesC = hasNotes ? (() => {
        const u = inspections[0].units.find(x => x.srNo === ref.srNo) || {};
        return `<td style="color:#64748b;font-style:italic">${_esc(u.notes || '')}</td>`;
      })() : '';
      return `<tr>
        <td style="color:#94a3b8;font-weight:700;text-align:center">${ref.srNo}</td>
        <td style="font-weight:600">${_esc(ref.unit)}${custBdg}</td>
        <td style="color:#64748b;font-style:italic">${_esc(check)}</td>
        ${cells}${notesC}</tr>`;
    }).join('\n');

    const insp0 = inspections[0];
    const meta  = isSingle
      ? `System: ${insp0.systemId} / ${cabLabel} | Date: ${insp0.date} | Type: ${insp0.type} | Engineer: ${_esc(insp0.engineer || 'N/A')} | Status: ${insp0.status}`
      : `System: ${insp0.systemId} / ${cabLabel} | ${inspections.length} inspections | Exported: ${new Date().toLocaleDateString('en-GB')}`;

    return `<html xmlns:o="urn:schemas-microsoft-com:office:office"
                  xmlns:x="urn:schemas-microsoft-com:office:excel"
                  xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8">
<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets>
<x:ExcelWorksheet><x:Name>Inspection Report</x:Name>
<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
<style>body{font-family:Calibri,Arial,sans-serif;font-size:11pt}table{border-collapse:collapse;width:100%}th,td{border:1px solid #e2e8f0;padding:7px 10px}</style>
</head><body><table>
<tr><td colspan="${colspan}" style="background:#1e40af;color:white;font-weight:700;font-size:14pt;padding:12px">
  DC Site Inspection Report — ${_esc(insp0.systemId)} / ${_esc(cabLabel)}</td></tr>
<tr><td colspan="${colspan}" style="color:#64748b;font-size:10pt;padding:8px">${meta}</td></tr>
<tr><td colspan="${colspan}"></td></tr>
<tr>
  <th style="background:#1e3a8a;color:white;font-weight:700">Sr. No.</th>
  <th style="background:#1e3a8a;color:white;font-weight:700">Units</th>
  <th style="background:#1e3a8a;color:white;font-weight:700">Checks to be Done</th>
  ${dateHeaders}${notesH}
</tr>
${dataRows}
<tr><td colspan="${colspan}"></td></tr>
<tr><td colspan="${colspan}" style="color:#94a3b8;font-size:9pt;text-align:center">
  Report delivered via Data Center Infrastructure Sanity Application — Powered by Sanjeev Babbar</td></tr>
</table></body></html>`;
  }

  // ── Multi-cabinet XLS (one tab per cabinet) ────────────────────────────────

  function _buildSiteXLS(inspections) {
    if (!inspections.length) return '';
    const insp0   = inspections[0];
    const sysName = DC_SYSTEMS[insp0.systemId]?.name || insp0.systemId;

    const worksheets = inspections.map(insp => {
      const cabLabel = getCabinetLabel(insp.systemId, insp.cabinetNo || 1);
      const hasNotes = insp.units.some(u => u.notes && u.notes.trim());
      const colspan  = hasNotes ? 6 : 5;
      const notesH   = hasNotes ? '<th style="background:#f0fdf4;color:#16a34a;font-weight:700">Observations</th>' : '';

      const rows = insp.units.map(u => {
        const check    = _checkText(insp.systemId, insp.cabinetNo, u.srNo);
        const isCustom = u.isCustom || !getCabinetUnits(insp.systemId, insp.cabinetNo || 1).find(x => x.srNo === u.srNo);
        const custBdg  = isCustom ? ' <span style="background:#e0e7ff;color:#4338ca;font-size:9pt;padding:1px 5px;border-radius:3px">Custom</span>' : '';
        const notesC   = hasNotes ? `<td style="color:#64748b;font-style:italic">${_esc(u.notes || '')}</td>` : '';
        return `<tr>
          <td style="color:#94a3b8;font-weight:700;text-align:center">${u.srNo}</td>
          <td style="font-weight:600">${_esc(u.unit)}${custBdg}</td>
          <td style="color:#64748b;font-style:italic">${_esc(check)}</td>
          <td style="${_statusStyle(u.frontStatus)}">${_esc(u.frontStatus) || '—'}</td>
          <td style="${_statusStyle(u.backStatus)}">${_esc(u.backStatus) || '—'}</td>
          ${notesC}</tr>`;
      }).join('\n');

      const statusColor = { OK: '#16a34a', WARNING: '#d97706', ISSUES: '#dc2626', INCOMPLETE: '#6b7280' }[insp.status] || '#6b7280';

      return {
        name: cabLabel,
        html: `<table>
<tr><td colspan="${colspan}" style="background:#1e40af;color:white;font-weight:700;font-size:14pt;padding:12px">
  DC Site Inspection Report — ${_esc(sysName)} / ${_esc(cabLabel)}</td></tr>
<tr><td colspan="${colspan}" style="color:#64748b;font-size:10pt;padding:8px">
  Date: ${insp.date} | Type: ${insp.type} | Engineer: ${_esc(insp.engineer || 'N/A')} |
  Status: <b style="color:${statusColor}">${insp.status}</b></td></tr>
<tr><td colspan="${colspan}"></td></tr>
<tr>
  <th style="background:#1e3a8a;color:white;font-weight:700">Sr. No.</th>
  <th style="background:#1e3a8a;color:white;font-weight:700">Units</th>
  <th style="background:#1e3a8a;color:white;font-weight:700">Checks to be Done</th>
  <th style="background:#dbeafe;color:#1d4ed8;font-weight:700">Front Side</th>
  <th style="background:#dbeafe;color:#1d4ed8;font-weight:700">Back Side</th>
  ${notesH}
</tr>
${rows}
<tr><td colspan="${colspan}"></td></tr>
<tr><td colspan="${colspan}" style="color:#94a3b8;font-size:9pt;text-align:center">
  Report delivered via Data Center Infrastructure Sanity Application — Powered by Sanjeev Babbar</td></tr>
</table>`,
      };
    });

    const wsXml = worksheets.map(ws =>
      `<x:ExcelWorksheet><x:Name>${_esc(ws.name)}</x:Name>
       <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
       </x:ExcelWorksheet>`
    ).join('\n');

    const bodyHtml = worksheets.map((ws, idx) => {
      const pgBreak = idx > 0 ? 'page-break-before:always;' : '';
      return `<div style="${pgBreak}">${ws.html}</div>`;
    }).join('\n');

    return `<html xmlns:o="urn:schemas-microsoft-com:office:office"
                  xmlns:x="urn:schemas-microsoft-com:office:excel"
                  xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8">
<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets>
${wsXml}
</x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
<style>body{font-family:Calibri,Arial,sans-serif;font-size:11pt}table{border-collapse:collapse;width:100%}th,td{border:1px solid #e2e8f0;padding:7px 10px}</style>
</head><body>${bodyHtml}</body></html>`;
  }

  // ── Multi-cabinet HTML Report with Photos ─────────────────────────────────

  async function _buildSiteHTMLReport(inspections) {
    const insp0   = inspections[0];
    const sysName = DC_SYSTEMS[insp0.systemId]?.name || insp0.systemId;

    const cabinetSections = [];

    for (const insp of inspections) {
      const cabLabel = getCabinetLabel(insp.systemId, insp.cabinetNo || 1);
      const photos   = await Storage.getAllPhotosForInspection(insp.id);
      const photoDataUrls = {};
      for (const [key, blob] of Object.entries(photos)) {
        photoDataUrls[key] = await Camera.blobToDataUrl(blob);
      }

      const statusColor = { OK: '#16a34a', WARNING: '#d97706', ISSUES: '#dc2626', INCOMPLETE: '#6b7280' }[insp.status] || '#6b7280';

      const unitRows = await Promise.all(insp.units.map(async unit => {
        const check = _checkText(insp.systemId, insp.cabinetNo, unit.srNo);
        const fKey  = Storage.photoKey(insp.id, unit.srNo, 'front');
        const bKey  = Storage.photoKey(insp.id, unit.srNo, 'back');
        const fImg  = photoDataUrls[fKey] ? `<img src="${photoDataUrls[fKey]}" style="max-width:220px;max-height:160px;border-radius:6px;margin-top:4px" alt="Front">` : '';
        const bImg  = photoDataUrls[bKey] ? `<img src="${photoDataUrls[bKey]}" style="max-width:220px;max-height:160px;border-radius:6px;margin-top:4px" alt="Back">` : '';
        const notes = unit.notes ? `<div style="color:#64748b;font-style:italic;font-size:11px;margin-top:4px">Notes: ${_esc(unit.notes)}</div>` : '';
        const custBdg = unit.isCustom ? ' <span style="background:#e0e7ff;color:#4338ca;font-size:9px;padding:1px 5px;border-radius:3px">Custom</span>' : '';

        return `<tr>
          <td style="text-align:center;color:#94a3b8;font-weight:700">${unit.srNo}</td>
          <td style="font-weight:600">${_esc(unit.unit)}${custBdg}<br><span style="color:#94a3b8;font-size:11px;font-style:italic">${_esc(check)}</span>${notes}</td>
          <td style="${_statusStyle(unit.frontStatus)}">${_esc(unit.frontStatus) || '—'}${fImg ? '<br>' + fImg : ''}</td>
          <td style="${_statusStyle(unit.backStatus)}">${_esc(unit.backStatus) || '—'}${bImg ? '<br>' + bImg : ''}</td>
        </tr>`;
      }));

      cabinetSections.push(`
        <div class="cabinet-section">
          <div class="cab-header">
            <h2>${_esc(cabLabel)}</h2>
            <span class="status-pill" style="background:${statusColor}">${insp.status}</span>
          </div>
          <div class="cab-meta">
            Type: ${insp.type} · Engineer: ${_esc(insp.engineer || 'N/A')}
          </div>
          <table>
            <thead><tr><th>#</th><th>Unit / Check</th><th>Front Side</th><th>Back Side</th></tr></thead>
            <tbody>${unitRows.join('\n')}</tbody>
          </table>
        </div>`);
    }

    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>DC Site Report — ${_esc(sysName)} — ${insp0.date}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f1f5f9;color:#0f172a;padding:24px;max-width:960px;margin:0 auto}
  .header{background:linear-gradient(135deg,#0f172a,#1e40af);color:white;padding:32px;border-radius:14px;margin-bottom:24px}
  .header h1{font-size:22px;margin-bottom:6px}
  .header .sub{font-size:14px;opacity:.85;margin-bottom:4px}
  .meta-grid{display:flex;flex-wrap:wrap;gap:20px;font-size:13px;opacity:.8;margin-top:12px}
  .meta-grid span{display:flex;align-items:center;gap:4px}
  .cabinet-section{margin-bottom:28px}
  .cab-header{display:flex;align-items:center;gap:12px;margin-bottom:6px}
  .cab-header h2{font-size:17px;color:#1e3a8a}
  .cab-meta{font-size:12px;color:#64748b;margin-bottom:10px}
  .status-pill{display:inline-block;padding:3px 12px;border-radius:20px;font-size:11px;font-weight:700;color:white}
  table{width:100%;border-collapse:collapse;background:white;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)}
  th{background:#1e3a8a;color:white;font-size:11px;text-transform:uppercase;letter-spacing:.5px;padding:10px 12px;text-align:left}
  td{padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;vertical-align:top}
  tr:last-child td{border-bottom:none}
  .footer{text-align:center;margin-top:28px;padding:16px;border-top:2px solid #e2e8f0}
  .footer .brand{font-size:12px;color:#64748b;margin-bottom:2px}
  .footer .powered{font-size:11px;color:#94a3b8;font-style:italic}
  @media print{body{background:white;padding:8px}.header{break-inside:avoid}.cabinet-section{break-inside:avoid}}
  @media(max-width:600px){body{padding:12px}.meta-grid{flex-direction:column;gap:4px}table{font-size:12px}td img{max-width:140px!important}}
</style></head><body>
<div class="header">
  <h1>DC Site Inspection Report</h1>
  <div class="sub">${_esc(sysName)} — ${inspections.length} Cabinet${inspections.length > 1 ? 's' : ''}</div>
  <div class="meta-grid">
    <span>Date: ${insp0.date}</span>
    <span>Type: ${insp0.type}</span>
    <span>Engineer: ${_esc(insp0.engineer || 'N/A')}</span>
    <span>Generated: ${new Date().toLocaleString('en-GB')}</span>
  </div>
</div>
${cabinetSections.join('\n')}
<div class="footer">
  <div class="brand">Report delivered via Data Center Infrastructure Sanity Application</div>
  <div class="powered">Powered by Sanjeev Babbar</div>
</div>
</body></html>`;
  }

  // ── Single-cabinet HTML Report with Photos ────────────────────────────────

  async function _buildHTMLReport(inspection) {
    const cabLabel = getCabinetLabel(inspection.systemId, inspection.cabinetNo || 1);
    const photos   = await Storage.getAllPhotosForInspection(inspection.id);

    const photoDataUrls = {};
    for (const [key, blob] of Object.entries(photos)) {
      photoDataUrls[key] = await Camera.blobToDataUrl(blob);
    }

    const unitRows = await Promise.all(inspection.units.map(async unit => {
      const check = _checkText(inspection.systemId, inspection.cabinetNo, unit.srNo);
      const fKey  = Storage.photoKey(inspection.id, unit.srNo, 'front');
      const bKey  = Storage.photoKey(inspection.id, unit.srNo, 'back');
      const fImg  = photoDataUrls[fKey] ? `<img src="${photoDataUrls[fKey]}" style="max-width:240px;max-height:180px;border-radius:6px;margin-top:4px" alt="Front">` : '';
      const bImg  = photoDataUrls[bKey] ? `<img src="${photoDataUrls[bKey]}" style="max-width:240px;max-height:180px;border-radius:6px;margin-top:4px" alt="Back">` : '';
      const notes = unit.notes ? `<div style="color:#64748b;font-style:italic;font-size:11px;margin-top:4px">Notes: ${_esc(unit.notes)}</div>` : '';
      const custBdg = unit.isCustom ? ' <span style="background:#e0e7ff;color:#4338ca;font-size:9px;padding:1px 5px;border-radius:3px">Custom</span>' : '';

      return `<tr>
        <td style="text-align:center;color:#94a3b8;font-weight:700">${unit.srNo}</td>
        <td style="font-weight:600">${_esc(unit.unit)}${custBdg}<br><span style="color:#94a3b8;font-size:11px;font-style:italic">${_esc(check)}</span>${notes}</td>
        <td style="${_statusStyle(unit.frontStatus)}">${_esc(unit.frontStatus) || '—'}${fImg ? '<br>' + fImg : ''}</td>
        <td style="${_statusStyle(unit.backStatus)}">${_esc(unit.backStatus) || '—'}${bImg ? '<br>' + bImg : ''}</td>
      </tr>`;
    }));

    const statusColor = { OK: '#16a34a', WARNING: '#d97706', ISSUES: '#dc2626', INCOMPLETE: '#6b7280' }[inspection.status] || '#6b7280';

    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>DC Inspection Report — ${_esc(inspection.systemId)} ${_esc(cabLabel)} ${inspection.date}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;color:#0f172a;padding:24px;max-width:900px;margin:0 auto}
  .header{background:linear-gradient(135deg,#0f172a,#1d4ed8);color:white;padding:28px;border-radius:12px;margin-bottom:20px}
  .header h1{font-size:20px;margin-bottom:8px}
  .meta{display:flex;flex-wrap:wrap;gap:16px;font-size:13px;opacity:.85}
  .status-badge{display:inline-block;padding:4px 14px;border-radius:20px;font-size:12px;font-weight:700;color:white;background:${statusColor};margin-top:8px}
  table{width:100%;border-collapse:collapse;background:white;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)}
  th{background:#1e3a8a;color:white;font-size:11px;text-transform:uppercase;letter-spacing:.5px;padding:10px 12px;text-align:left}
  td{padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;vertical-align:top}
  tr:last-child td{border-bottom:none}
  .footer{text-align:center;margin-top:20px;font-size:11px;color:#94a3b8}
  @media print{body{background:white;padding:8px}.header{break-inside:avoid}}
  @media(max-width:600px){body{padding:12px}.meta{flex-direction:column;gap:4px}table{font-size:12px}td img{max-width:160px!important}}
</style></head><body>
<div class="header">
  <h1>DC Site Inspection Report</h1>
  <div class="meta">
    <span>System: ${_esc(inspection.systemId)} / ${_esc(cabLabel)}</span>
    <span>Date: ${inspection.date}</span>
    <span>Type: ${inspection.type}</span>
    <span>Engineer: ${_esc(inspection.engineer || 'N/A')}</span>
  </div>
  <div class="status-badge">${inspection.status}</div>
</div>
<table>
  <thead><tr><th>#</th><th>Unit / Check</th><th>Front Side</th><th>Back Side</th></tr></thead>
  <tbody>${unitRows.join('\n')}</tbody>
</table>
<div class="footer">
  <div style="margin-bottom:2px">Report delivered via Data Center Infrastructure Sanity Application</div>
  <div style="font-style:italic;opacity:.7">Powered by Sanjeev Babbar</div>
</div>
</body></html>`;
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  function downloadCSV(inspection) {
    _download(_buildSingleCSV(inspection),
      `DC_Check_${inspection.systemId}_Cab${inspection.cabinetNo || 1}_${inspection.date}.csv`,
      'text/csv;charset=utf-8;');
  }

  function downloadCSVMultiple(inspections, systemId) {
    const cab = inspections[0]?.cabinetNo || 1;
    _download(_buildMultiCSV(inspections),
      `DC_History_${systemId}_Cab${cab}_${new Date().toISOString().split('T')[0]}.csv`,
      'text/csv;charset=utf-8;');
  }

  function downloadXLS(inspection) {
    _download(_buildXLS([inspection]),
      `DC_Check_${inspection.systemId}_Cab${inspection.cabinetNo || 1}_${inspection.date}.xls`,
      'application/vnd.ms-excel;charset=utf-8;');
  }

  function downloadXLSMultiple(inspections, systemId) {
    const cab = inspections[0]?.cabinetNo || 1;
    _download(_buildXLS(inspections),
      `DC_History_${systemId}_Cab${cab}_${new Date().toISOString().split('T')[0]}.xls`,
      'application/vnd.ms-excel;charset=utf-8;');
  }

  async function downloadHTMLReport(inspection) {
    const html = await _buildHTMLReport(inspection);
    _download(html,
      `DC_Report_${inspection.systemId}_Cab${inspection.cabinetNo || 1}_${inspection.date}.html`,
      'text/html;charset=utf-8;');
  }

  function _formatDateLong(d) {
    if (!d) return '';
    const [y, m, dd] = d.split('-').map(Number);
    return new Date(y, m - 1, dd).toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  }

  function _typeLabel(t) {
    return { weekly: 'Weekly', biweekly: 'Bi-Weekly', adhoc: 'Ad-Hoc' }[t] || t;
  }

  function _statusLabel(s) {
    return { OK: 'ALL OK - No Issues', WARNING: 'WARNING - Needs Attention', ISSUES: 'ISSUES FOUND - Action Required', INCOMPLETE: 'INCOMPLETE' }[s] || s;
  }

  function _buildEmailBody(inspections) {
    const isSingle = inspections.length === 1;
    const insp0    = inspections[0];
    const sysName  = DC_SYSTEMS[insp0.systemId]?.name || insp0.systemId;
    const now      = new Date();
    const timeStr  = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    const LINE  = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    const LINE2 = '────────────────────────────────────────────────────────────────';
    const SEP   = '─────┼────────────────────┼──────────────────────────┼──────────────────────────';

    let body = [];
    body.push('Good day Team,');
    body.push('');
    body.push('Below is the summary/details for the data center health check performed.');
    body.push('');
    body.push(LINE);
    body.push('  INSPECTION DETAILS');
    body.push(LINE);
    body.push(`  Site:        ${sysName}`);
    if (isSingle) {
      const cabLabel = getCabinetLabel(insp0.systemId, insp0.cabinetNo || 1);
      body.push(`  Cabinet:     ${cabLabel}`);
    } else {
      const cabNames = inspections.map(i => getCabinetLabel(i.systemId, i.cabinetNo || 1)).join(', ');
      body.push(`  Cabinets:    ${cabNames}`);
    }
    body.push(`  Date:        ${_formatDateLong(insp0.date)}`);
    body.push(`  Time:        ${timeStr}`);
    body.push(`  Type:        ${_typeLabel(insp0.type)}`);
    body.push(`  Engineer:    ${insp0.engineer || 'N/A'}`);
    if (isSingle) {
      body.push(`  Status:      ${_statusLabel(insp0.status)}`);
    }
    body.push(LINE);

    for (const insp of inspections) {
      const cabLabel = getCabinetLabel(insp.systemId, insp.cabinetNo || 1);
      body.push('');
      if (!isSingle) {
        body.push(`  ${cabLabel.toUpperCase()} — Status: ${_statusLabel(insp.status)}`);
        body.push(LINE2);
      } else {
        body.push('  UNIT INSPECTION RESULTS');
        body.push(LINE2);
      }
      body.push('  #   | Unit               | Front Side                | Back Side');
      body.push('  ' + SEP);

      for (const u of insp.units) {
        const num   = String(u.srNo).padStart(3);
        const name  = (u.unit || '').padEnd(18).substring(0, 18);
        const front = (u.frontStatus || '—').padEnd(25).substring(0, 25);
        const back  = u.backStatus || '—';
        body.push(`  ${num} | ${name} | ${front} | ${back}`);
        if (u.notes && u.notes.trim()) {
          body.push(`      | NOTE: ${u.notes.trim()}`);
        }
      }

      const issues = insp.units.filter(u => {
        const fs = STATUS_SEVERITY[u.frontStatus] ?? -1;
        const bs = STATUS_SEVERITY[u.backStatus] ?? -1;
        return fs >= 3 || bs >= 3;
      });
      const warnings = insp.units.filter(u => {
        const fs = STATUS_SEVERITY[u.frontStatus] ?? -1;
        const bs = STATUS_SEVERITY[u.backStatus] ?? -1;
        return (fs === 1 || fs === 2 || bs === 1 || bs === 2) && fs < 3 && bs < 3;
      });

      if (issues.length) {
        body.push('');
        body.push('  !! CRITICAL ISSUES:');
        for (const u of issues) {
          body.push(`     * ${u.unit} — Front: ${u.frontStatus || '—'}, Back: ${u.backStatus || '—'}`);
        }
      }
      if (warnings.length) {
        body.push('');
        body.push('  ** WARNINGS:');
        for (const u of warnings) {
          body.push(`     * ${u.unit} — Front: ${u.frontStatus || '—'}, Back: ${u.backStatus || '—'}`);
        }
      }
    }

    body.push('');
    body.push(LINE2);
    body.push('');
    body.push('NOTE: Please find the attached HTML/Excel report for detailed view with photos.');
    body.push('');
    body.push(LINE2);
    body.push('Report delivered via Data Center Infrastructure Sanity Application');
    body.push('Powered by Sanjeev Babbar');
    body.push(LINE2);

    return body.join('\n');
  }

  function emailReport(inspection, recipient) {
    const cabLabel = getCabinetLabel(inspection.systemId, inspection.cabinetNo || 1);
    const sysName  = DC_SYSTEMS[inspection.systemId]?.name || inspection.systemId;
    const to       = recipient ? encodeURIComponent(recipient) : '';
    const subject  = encodeURIComponent(
      `DC Health Check Report — ${sysName} / ${cabLabel} — ${_formatDateLong(inspection.date)}`
    );
    const body = _buildEmailBody([inspection]);
    window.location.href = `mailto:${to}?subject=${subject}&body=${encodeURIComponent(body)}`;
  }

  function emailSiteReport(inspections, recipient) {
    if (!inspections.length) return;
    const insp0   = inspections[0];
    const sysName = DC_SYSTEMS[insp0.systemId]?.name || insp0.systemId;
    const to      = recipient ? encodeURIComponent(recipient) : '';
    const cabCount = inspections.length;
    const subject  = encodeURIComponent(
      `DC Health Check Report — ${sysName} (${cabCount} Cabinet${cabCount > 1 ? 's' : ''}) — ${_formatDateLong(insp0.date)}`
    );
    const body = _buildEmailBody(inspections);
    window.location.href = `mailto:${to}?subject=${subject}&body=${encodeURIComponent(body)}`;
  }

  function downloadSiteXLS(inspections) {
    if (!inspections.length) return;
    const sysId = inspections[0].systemId;
    const date  = inspections[0].date;
    _download(_buildSiteXLS(inspections),
      `DC_SiteReport_${sysId}_${date}.xls`,
      'application/vnd.ms-excel;charset=utf-8;');
  }

  async function downloadSiteHTMLReport(inspections) {
    if (!inspections.length) return;
    const html = await _buildSiteHTMLReport(inspections);
    const sysId = inspections[0].systemId;
    const date  = inspections[0].date;
    _download(html,
      `DC_SiteReport_${sysId}_${date}.html`,
      'text/html;charset=utf-8;');
  }

  return {
    downloadCSV, downloadCSVMultiple,
    downloadXLS, downloadXLSMultiple,
    downloadHTMLReport, emailReport,
    downloadSiteXLS, downloadSiteHTMLReport, emailSiteReport,
  };
})();
