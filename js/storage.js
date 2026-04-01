'use strict';

// ─── Storage Module ──────────────────────────────────────────────────────────
// Hybrid storage: localStorage for inspection JSON, IndexedDB for photos.
// Auto-migrates from v1 keys. Enforces configurable history limit (default 7).

const Storage = (() => {
  const INSPECTIONS_KEY = 'dc_inspections_v2';
  const SETTINGS_KEY    = 'dc_settings_v2';
  const DEFAULT_MAX     = 7;

  // ── IndexedDB (photos) ──────────────────────────────────────────────────────
  const DB_NAME    = 'dc_sanity_db';
  const DB_VER     = 1;
  const PHOTO_STORE = 'photos';
  let _db = null;

  function _openDB() {
    if (_db) return Promise.resolve(_db);
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VER);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(PHOTO_STORE))
          db.createObjectStore(PHOTO_STORE);
      };
      req.onsuccess = e => { _db = e.target.result; resolve(_db); };
      req.onerror   = e => reject(e.target.error);
    });
  }

  // key format: {inspectionId}_{srNo}_{side}
  function photoKey(inspectionId, srNo, side) {
    return `${inspectionId}_${srNo}_${side}`;
  }

  async function savePhoto(key, blob) {
    const db = await _openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PHOTO_STORE, 'readwrite');
      tx.objectStore(PHOTO_STORE).put(blob, key);
      tx.oncomplete = () => resolve();
      tx.onerror    = e => reject(e.target.error);
    });
  }

  async function getPhoto(key) {
    const db = await _openDB();
    return new Promise((resolve, reject) => {
      const tx  = db.transaction(PHOTO_STORE, 'readonly');
      const req = tx.objectStore(PHOTO_STORE).get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror   = e => reject(e.target.error);
    });
  }

  async function deletePhoto(key) {
    const db = await _openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PHOTO_STORE, 'readwrite');
      tx.objectStore(PHOTO_STORE).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror    = e => reject(e.target.error);
    });
  }

  async function deletePhotosForInspection(inspectionId) {
    const db = await _openDB();
    return new Promise((resolve, reject) => {
      const tx    = db.transaction(PHOTO_STORE, 'readwrite');
      const store = tx.objectStore(PHOTO_STORE);
      const cur   = store.openCursor();
      cur.onsuccess = e => {
        const c = e.target.result;
        if (c) {
          if (String(c.key).startsWith(inspectionId + '_')) c.delete();
          c.continue();
        }
      };
      tx.oncomplete = () => resolve();
      tx.onerror    = e => reject(e.target.error);
    });
  }

  async function getAllPhotosForInspection(inspectionId) {
    const db = await _openDB();
    return new Promise((resolve, reject) => {
      const photos = {};
      const tx     = db.transaction(PHOTO_STORE, 'readonly');
      const cur    = tx.objectStore(PHOTO_STORE).openCursor();
      cur.onsuccess = e => {
        const c = e.target.result;
        if (c) {
          if (String(c.key).startsWith(inspectionId + '_')) photos[c.key] = c.value;
          c.continue();
        }
      };
      tx.oncomplete = () => resolve(photos);
      tx.onerror    = e => reject(e.target.error);
    });
  }

  async function countPhotos() {
    try {
      const db = await _openDB();
      return new Promise((resolve, reject) => {
        const tx  = db.transaction(PHOTO_STORE, 'readonly');
        const req = tx.objectStore(PHOTO_STORE).count();
        req.onsuccess = () => resolve(req.result);
        req.onerror   = () => resolve(0);
      });
    } catch { return 0; }
  }

  // ── ID generation ───────────────────────────────────────────────────────────
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  // ── Settings ────────────────────────────────────────────────────────────────
  function getSettings() {
    try {
      return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || _defaultSettings();
    } catch { return _defaultSettings(); }
  }

  function _defaultSettings() {
    return {
      engineerName:   '',
      defaultSystem:  Object.keys(DC_SYSTEMS)[0] || 'Jamaica',
      maxInspections: DEFAULT_MAX,
      emailRecipient: '',
    };
  }

  function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  // ── Inspections (localStorage) ──────────────────────────────────────────────
  function getInspections() {
    try { return JSON.parse(localStorage.getItem(INSPECTIONS_KEY)) || []; }
    catch { return []; }
  }

  function _persist(list) { localStorage.setItem(INSPECTIONS_KEY, JSON.stringify(list)); }

  async function _enforceLimit() {
    const max  = getSettings().maxInspections || DEFAULT_MAX;
    const list = getInspections();
    if (list.length <= max) return;
    const removed = list.splice(max);
    _persist(list);
    for (const r of removed) {
      try { await deletePhotosForInspection(r.id); } catch { /* best effort */ }
    }
  }

  async function addInspection(inspection) {
    const list   = getInspections();
    const record = { ...inspection, id: inspection._preId || generateId(), createdAt: new Date().toISOString() };
    delete record._preId;
    list.unshift(record);
    _persist(list);
    await _enforceLimit();
    return record;
  }

  function updateInspection(id, updates) {
    const list = getInspections();
    const idx  = list.findIndex(i => i.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates, id };
    _persist(list);
    return list[idx];
  }

  async function deleteInspection(id) {
    try { await deletePhotosForInspection(id); } catch { /* best effort */ }
    _persist(getInspections().filter(i => i.id !== id));
  }

  function getInspection(id) {
    return getInspections().find(i => i.id === id) || null;
  }

  function getSystemInspections(systemId, cabinetNo, limit) {
    let list = getInspections().filter(i =>
      i.systemId === systemId && (cabinetNo == null || i.cabinetNo === cabinetNo)
    );
    return limit ? list.slice(0, limit) : list;
  }

  async function clearAllInspections() {
    for (const i of getInspections()) {
      try { await deletePhotosForInspection(i.id); } catch { /* ok */ }
    }
    localStorage.removeItem(INSPECTIONS_KEY);
  }

  function getStorageInfo() {
    const raw   = localStorage.getItem(INSPECTIONS_KEY) || '[]';
    const bytes = new Blob([raw]).size;
    return { count: getInspections().length, kb: (bytes / 1024).toFixed(1) };
  }

  // ── Backup / Restore ────────────────────────────────────────────────────────

  function _blobToBase64(blob) {
    return new Promise(resolve => {
      const r = new FileReader();
      r.onloadend = () => resolve(r.result);
      r.readAsDataURL(blob);
    });
  }

  function _base64ToBlob(dataUrl) {
    return fetch(dataUrl).then(r => r.blob());
  }

  async function exportBackup() {
    const inspections = getInspections();
    const settings    = getSettings();
    const photos      = {};
    for (const insp of inspections) {
      const p = await getAllPhotosForInspection(insp.id);
      for (const [k, v] of Object.entries(p)) photos[k] = await _blobToBase64(v);
    }
    return JSON.stringify({
      version: 2, inspections, settings, photos,
      exportedAt: new Date().toISOString(),
    });
  }

  async function importBackup(jsonStr) {
    const data = JSON.parse(jsonStr);
    if (!data.inspections) throw new Error('Invalid backup file');
    _persist(data.inspections);
    if (data.settings) saveSettings(data.settings);
    if (data.photos) {
      for (const [k, b64] of Object.entries(data.photos)) {
        const blob = await _base64ToBlob(b64);
        await savePhoto(k, blob);
      }
    }
  }

  // ── v1 Migration ────────────────────────────────────────────────────────────
  (function _migrate() {
    const v1 = localStorage.getItem('dc_inspections_v1');
    const v1s = localStorage.getItem('dc_settings_v1');
    if (v1 && !localStorage.getItem(INSPECTIONS_KEY)) localStorage.setItem(INSPECTIONS_KEY, v1);
    if (v1s && !localStorage.getItem(SETTINGS_KEY))   localStorage.setItem(SETTINGS_KEY, v1s);
  })();

  _openDB().catch(e => console.warn('IndexedDB unavailable:', e));

  return {
    generateId, getSettings, saveSettings,
    getInspections, addInspection, updateInspection,
    deleteInspection, getInspection, getSystemInspections,
    clearAllInspections, getStorageInfo,
    savePhoto, getPhoto, deletePhoto,
    deletePhotosForInspection, getAllPhotosForInspection,
    countPhotos, photoKey,
    exportBackup, importBackup,
  };
})();
