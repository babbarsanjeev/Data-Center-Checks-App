# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A client-side PWA for conducting onsite hardware inspection checks of data center cabinet units. Supports multiple sites/systems, photo capture per unit, offline storage, and Excel/HTML export with photo attachments.

Built by **Digital COE Gen AI Team**.

## Architecture

Plain JavaScript PWA — no build system, no package manager. All code runs directly in the browser.

### File Structure

| File | Purpose |
|------|---------|
| `js/data.js` | System/cabinet definitions, status options, severity computation |
| `js/storage.js` | Hybrid storage: localStorage (inspections/settings) + IndexedDB (photos) |
| `js/camera.js` | Photo capture, JPEG compression, thumbnail generation |
| `js/export.js` | CSV, XLS, HTML report (with embedded photos), email export |
| `js/app.js` | SPA controller: AppState, Views (string templates), App (navigation/logic) |
| `css/styles.css` | Responsive CSS — mobile-first with tablet (768px), desktop (1024px), large (1440px) breakpoints |
| `sw.js` | Service worker — cache-first for full offline support |
| `manifest.json` | PWA manifest |

### Script Load Order (matters — each depends on predecessors)

1. `data.js` — `LED_OPTIONS`, `DC_SYSTEMS`, `computeOverallStatus`
2. `storage.js` — `Storage` (depends on `DC_SYSTEMS` from data.js for default settings)
3. `camera.js` — `Camera` (standalone)
4. `export.js` — `Export` (depends on data.js globals + `Storage` + `Camera`)
5. `app.js` — `App`, `Views`, `AppState` (depends on all above)

### Data Flow

- **Inspections** → JSON in `localStorage` (`dc_inspections_v2` key)
- **Settings** → JSON in `localStorage` (`dc_settings_v2` key)
- **Photos** → Blobs in IndexedDB (`dc_sanity_db` / `photos` store), keyed as `{inspectionId}_{srNo}_{side}`
- **History limit** → Configurable (default 7), oldest auto-deleted with photos

### Core Data Module: `js/data.js`

- **`LED_OPTIONS` / `PDU_FRONT_OPTIONS`** — dropdown option arrays for status selects
- **`STATUS_SEVERITY`** — maps status strings to numeric severity (-1 to 4)
- **`computeOverallStatus(units)`** — returns `INCOMPLETE | OK | WARNING | ISSUES`
- **`DC_SYSTEMS`** — keyed by system ID. Each has `cabinets[]` with `units[]`
- **`getCabinetUnits(systemId, cabinetNo)`** — returns units array
- **`getCabinetLabel(systemId, cabinetNo)`** — returns display label

### Adding a New System

Add a new key to `DC_SYSTEMS` following the `Jamaica` or `DC377` pattern. Unit 1 in each cabinet is conventionally the PDU using `PDU_FRONT_OPTIONS` for the front.

### Adding a New Status Value

1. Add the option object to `LED_OPTIONS` or `PDU_FRONT_OPTIONS`
2. Add a corresponding entry in `STATUS_SEVERITY` with appropriate severity level

### Key Features

- **Photo capture** — per unit front/back, stored in IndexedDB, embedded in HTML reports
- **Responsive** — mobile-first with tablet/desktop layouts (CSS Grid at breakpoints)
- **Offline-first** — service worker caches all assets
- **Export formats** — CSV, XLS (HTML table), HTML report with photos, email via mailto:
- **Backup/restore** — full JSON export/import including photos (base64-encoded)
- **Copy from last** — pre-fill new inspection from previous same-cabinet inspection
- **Auto-cleanup** — configurable max inspections, oldest auto-deleted
- **v1 migration** — auto-migrates from `dc_inspections_v1` / `dc_settings_v1` keys
