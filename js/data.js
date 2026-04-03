'use strict';

// ─── Status Option Definitions ───────────────────────────────────────────────

const LED_OPTIONS = [
  { value: '',                      label: '-- Select Status --',    color: 'neutral' },
  { value: 'GREEN LED',             label: 'GREEN LED',              color: 'green'   },
  { value: 'RED LED',               label: 'RED LED',                color: 'red'     },
  { value: 'AMBER LED (glowing)',   label: 'AMBER LED (glowing)',    color: 'amber'   },
  { value: 'AMBER LED (toggling)',  label: 'AMBER LED (toggling)',   color: 'amber'   },
  { value: 'SWITCH OFF',            label: 'SWITCH OFF',             color: 'gray'    },
  { value: 'N/A',                   label: 'N/A',                    color: 'neutral' },
];

const PDU_FRONT_OPTIONS = [
  { value: '',                    label: '-- Select Status --',     color: 'neutral' },
  { value: 'All Switches ON',     label: 'All Switches ON',         color: 'green'   },
  { value: 'A1 Switch OFF',       label: 'A1 Switch OFF',           color: 'amber'   },
  { value: 'A1A2 Switches OFF',   label: 'A1A2 Switches OFF',       color: 'red'     },
  { value: 'All Switches OFF',    label: 'All Switches OFF',        color: 'red'     },
  { value: 'N/A',                 label: 'N/A',                     color: 'neutral' },
];

// Severity map — drives overall status computation
const STATUS_SEVERITY = {
  '':                     -1,   // not filled = incomplete
  'N/A':                   0,
  'All Switches ON':       0,
  'GREEN LED':             0,
  'AMBER LED (toggling)':  1,
  'A1 Switch OFF':         2,
  'AMBER LED (glowing)':   2,
  'SWITCH OFF':            3,
  'A1A2 Switches OFF':     3,
  'RED LED':               3,
  'All Switches OFF':      4,
};

function computeOverallStatus(units) {
  let hasEmpty    = false;
  let maxSeverity = 0;

  units.forEach(unit => {
    const fv = unit.frontStatus;
    const bv = unit.backStatus;

    if (!fv || fv === '') hasEmpty = true;

    const fSev = STATUS_SEVERITY[fv] ?? 0;
    const bSev = (bv && bv !== '') ? (STATUS_SEVERITY[bv] ?? 0) : 0;
    maxSeverity = Math.max(maxSeverity, fSev, bSev);
  });

  if (hasEmpty)          return 'INCOMPLETE';
  if (maxSeverity === 0) return 'OK';
  if (maxSeverity <= 2)  return 'WARNING';
  return 'ISSUES';
}

// ─── System Definitions ──────────────────────────────────────────────────────
//
// Structure:
//   DC_SYSTEMS[systemId].cabinets  →  array of cabinet objects
//   cabinet.cabinetNo              →  1, 2, 3 …
//   cabinet.label                  →  display name  ("Cabinet 1")
//   cabinet.units                  →  array of unit rows
//
// Cabinet unit 1 is conventionally the PDU (uses PDU_FRONT_OPTIONS for front).
// All other units use LED_OPTIONS for both sides.

const DC_SYSTEMS = {
  Jamaica: {
    id:       'Jamaica',
    name:     'System Jamaica',
    location: 'Data Center',
    cabinets: [

      // ── Cabinet 1 — 16 units ──────────────────────────────────────────────
      {
        cabinetNo: 1,
        label:     'Cabinet 1',
        units: [
          {
            srNo:         1,
            unit:         'PDU',
            check:        'Check if all Switches are ON',
            frontOptions: PDU_FRONT_OPTIONS,
            backOptions:  LED_OPTIONS,
          },
          {
            srNo:         2,
            unit:         'DIM 1B',
            check:        'Check if any Amber LED is glowing',
            frontOptions: LED_OPTIONS,
            backOptions:  LED_OPTIONS,
          },
          {
            srNo:         3,
            unit:         'DIM 1A',
            check:        'Check if any Amber LED is glowing',
            frontOptions: LED_OPTIONS,
            backOptions:  LED_OPTIONS,
          },
          {
            srNo:         4,
            unit:         'HSBU 1B',
            check:        'Check if any Amber LED is glowing',
            frontOptions: LED_OPTIONS,
            backOptions:  LED_OPTIONS,
          },
          {
            srNo:         5,
            unit:         'HSEU 1A',
            check:        'Check if any Amber LED is glowing',
            frontOptions: LED_OPTIONS,
            backOptions:  LED_OPTIONS,
          },
          {
            srNo:         6,
            unit:         'FCS 1B',
            check:        'Check if any Amber LED is glowing',
            frontOptions: LED_OPTIONS,
            backOptions:  LED_OPTIONS,
          },
          {
            srNo:         7,
            unit:         'FCS 1A',
            check:        'Check if any Amber LED is glowing',
            frontOptions: LED_OPTIONS,
            backOptions:  LED_OPTIONS,
          },
          {
            srNo:         8,
            unit:         'OKVMMGR',
            check:        'Check if any Amber LED is glowing',
            frontOptions: LED_OPTIONS,
            backOptions:  LED_OPTIONS,
          },
          {
            srNo:         9,
            unit:         'LNX SDP HE 1B',
            check:        'Check if any Amber LED is glowing',
            frontOptions: LED_OPTIONS,
            backOptions:  LED_OPTIONS,
          },
          {
            srNo:         10,
            unit:         'LNX SDP HE 1A',
            check:        'Check if any Amber LED is glowing',
            frontOptions: LED_OPTIONS,
            backOptions:  LED_OPTIONS,
          },
          {
            srNo:         11,
            unit:         'NAS GW 1B',
            check:        'Check if any Amber LED is glowing',
            frontOptions: LED_OPTIONS,
            backOptions:  LED_OPTIONS,
          },
          {
            srNo:         12,
            unit:         'NAS GW 1A',
            check:        'Check if any Amber LED is glowing',
            frontOptions: LED_OPTIONS,
            backOptions:  LED_OPTIONS,
          },
          {
            srNo:         13,
            unit:         'PS 5200-1',
            check:        'Check if any Amber LED is glowing',
            frontOptions: LED_OPTIONS,
            backOptions:  LED_OPTIONS,
          },
          {
            srNo:         14,
            unit:         'PS 5035-1',
            check:        'Check if any Amber LED is glowing',
            frontOptions: LED_OPTIONS,
            backOptions:  LED_OPTIONS,
          },
          {
            srNo:         15,
            unit:         'LBA 1B',
            check:        'Check if any Amber LED is glowing',
            frontOptions: LED_OPTIONS,
            backOptions:  LED_OPTIONS,
          },
          {
            srNo:         16,
            unit:         'LBA 1A',
            check:        'Check if any Amber LED is glowing',
            frontOptions: LED_OPTIONS,
            backOptions:  LED_OPTIONS,
          },
        ],
      },

      // ── Cabinet 2 — 13 units ──────────────────────────────────────────────
      {
        cabinetNo: 2,
        label:     'Cabinet 2',
        units: [
          {
            srNo:         1,
            unit:         'PDU',
            check:        'Check if all Switches are ON',
            frontOptions: PDU_FRONT_OPTIONS,
            backOptions:  LED_OPTIONS,
          },
          {
            srNo:         2,
            unit:         'DIM 1B',
            check:        'Check if any Amber LED is glowing',
            frontOptions: LED_OPTIONS,
            backOptions:  LED_OPTIONS,
          },
          {
            srNo:         3,
            unit:         'DIM 1A',
            check:        'Check if any Amber LED is glowing',
            frontOptions: LED_OPTIONS,
            backOptions:  LED_OPTIONS,
          },
          {
            srNo:         4,
            unit:         'UPMDB 1B',
            check:        'Check if any Amber LED is glowing',
            frontOptions: LED_OPTIONS,
            backOptions:  LED_OPTIONS,
          },
          {
            srNo:         5,
            unit:         'UPMDB 1A',
            check:        'Check if any Amber LED is glowing',
            frontOptions: LED_OPTIONS,
            backOptions:  LED_OPTIONS,
          },
          {
            srNo:         6,
            unit:         'IT OEL FU DB 1B',
            check:        'Check if any Amber LED is glowing',
            frontOptions: LED_OPTIONS,
            backOptions:  LED_OPTIONS,
          },
          {
            srNo:         7,
            unit:         'IT OEL FU DB 1A',
            check:        'Check if any Amber LED is glowing',
            frontOptions: LED_OPTIONS,
            backOptions:  LED_OPTIONS,
          },
          {
            srNo:         8,
            unit:         'FS 5200-2',
            check:        'Check if any Amber LED is glowing',
            frontOptions: LED_OPTIONS,
            backOptions:  LED_OPTIONS,
          },
          {
            srNo:         9,
            unit:         'C1 LCS ESX 5',
            check:        'Check if any Amber LED is glowing',
            frontOptions: LED_OPTIONS,
            backOptions:  LED_OPTIONS,
          },
          {
            srNo:         10,
            unit:         'C1 LCS ESX 4',
            check:        'Check if any Amber LED is glowing',
            frontOptions: LED_OPTIONS,
            backOptions:  LED_OPTIONS,
          },
          {
            srNo:         11,
            unit:         'C1 LCS ESX 3',
            check:        'Check if any Amber LED is glowing',
            frontOptions: LED_OPTIONS,
            backOptions:  LED_OPTIONS,
          },
          {
            srNo:         12,
            unit:         'C1 LCS ESX 2',
            check:        'Check if any Amber LED is glowing',
            frontOptions: LED_OPTIONS,
            backOptions:  LED_OPTIONS,
          },
          {
            srNo:         13,
            unit:         'C1 LCS ESX 1',
            check:        'Check if any Amber LED is glowing',
            frontOptions: LED_OPTIONS,
            backOptions:  LED_OPTIONS,
          },
        ],
      },

    ], // end Jamaica cabinets
  },

  DC377: {
    id:       'DC377',
    name:     'Dutch Caribbean - 3.7.7',
    location: 'Data Center',
    cabinets: [

      // ── Cabinet 1 — 32 units ──────────────────────────────────────────────
      {
        cabinetNo: 1,
        label:     'Cabinet 1',
        units: [
          { srNo:  1, unit: 'PDU',                 check: 'Check if all Switches are ON',      frontOptions: PDU_FRONT_OPTIONS, backOptions: LED_OPTIONS },
          { srNo:  2, unit: 'TRSU2',               check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo:  3, unit: 'SGU-Sigtran1a',       check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo:  4, unit: 'PCI Expansion Blade', check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo:  5, unit: 'SU-Sigtran1b',        check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo:  6, unit: 'PCI Expansion Blade', check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo:  7, unit: 'BE4',                 check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo:  8, unit: 'BE5',                 check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo:  9, unit: 'BE6',                 check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 10, unit: 'BE7',                 check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 11, unit: 'VCENTER2B',           check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 12, unit: 'PACKETWARE2',         check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 13, unit: 'TRSU1',               check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 14, unit: 'MKU1',                check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 15, unit: 'CCS1a',               check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 16, unit: 'PCI Expansion Blade', check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 17, unit: 'CCS1b',               check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 18, unit: 'PCI Expansion Blade', check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 19, unit: 'SGU1a',               check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 20, unit: 'PCI Expansion Blade', check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 21, unit: 'SGU1b',               check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 22, unit: 'PCI Expansion Blade', check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 23, unit: 'MAU1',                check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 24, unit: 'BE1',                 check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 25, unit: 'BE2',                 check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 26, unit: 'BE3',                 check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 27, unit: 'VCENTER1b',           check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 28, unit: 'PACKETWARE1',         check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 29, unit: 'HSBU-SZ-1b',          check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 30, unit: 'HSBU-SZ-1a',          check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 31, unit: 'LBA-SZ-1b',           check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 32, unit: 'LBA-SZ-1a',           check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
        ],
      },

      // ── Cabinet 2 — 35 units ──────────────────────────────────────────────
      {
        cabinetNo: 2,
        label:     'Cabinet 2',
        units: [
          { srNo:  1, unit: 'PDU',          check: 'Check if all Switches are ON',      frontOptions: PDU_FRONT_OPTIONS, backOptions: LED_OPTIONS },
          { srNo:  2, unit: 'TRSU4',        check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo:  3, unit: 'PCIEXP BLADE', check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo:  4, unit: 'CSS-VT2',      check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo:  5, unit: 'PCIEXP BLADE', check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo:  6, unit: 'CMS3',         check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo:  7, unit: 'PCIEXP BLADE', check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo:  8, unit: 'CMS4',         check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo:  9, unit: 'PCIEXP BLADE', check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 10, unit: 'SgU1b',        check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 11, unit: 'PCIEXP BLADE', check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 12, unit: 'CCS-SIG1a',    check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 13, unit: 'PCIEXP BLADE', check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 14, unit: 'CCS-SIG1b',    check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 15, unit: 'PCIEXP BLADE', check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 16, unit: 'TRSU3',        check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 17, unit: 'DTR1A',        check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 18, unit: 'DTR1B',        check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 19, unit: 'PCIEXP BLADE', check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 20, unit: 'CSS-VT1',      check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 21, unit: 'PCIEXP BLADE', check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 22, unit: 'CMS1',         check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 23, unit: 'PCIEXP BLADE', check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 24, unit: 'CMS2',         check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 25, unit: 'PCIEXP BLADE', check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 26, unit: 'SgU1a',        check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 27, unit: 'PCIEXP BLADE', check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 28, unit: 'ITDB1a',       check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 29, unit: 'ITDB1b',       check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 30, unit: 'ITDB2a',       check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 31, unit: 'ITDB2b',       check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 32, unit: 'HSBU-DMZ-1b',  check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 33, unit: 'HSBU-DMZ-1a',  check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 34, unit: 'LBA-DMZ-1b',   check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 35, unit: 'LBA-DMZ-1a',   check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
        ],
      },

      // ── Cabinet 3 — 22 units ──────────────────────────────────────────────
      {
        cabinetNo: 3,
        label:     'Cabinet 3',
        units: [
          { srNo:  1, unit: 'IBM 24 EXP 3',   check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo:  2, unit: 'V7000 CTRL 2',    check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo:  3, unit: 'IBM 12 EXP 2',    check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo:  4, unit: 'IBM 24 EXP 1',    check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo:  5, unit: 'V7000 CTRL 1',    check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo:  6, unit: 'IBM File 1B',      check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo:  7, unit: 'IBM File 1A',      check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo:  8, unit: 'SDP1A',            check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo:  9, unit: 'SDP1B',            check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 10, unit: 'OAM-APP-1A',       check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 11, unit: 'OAM-APP-1B',       check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 12, unit: 'VP-X86-IT-WL-1',  check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 13, unit: 'VP-X86-IT-WL-2',  check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 14, unit: 'VP-X86-IT-WL-3',  check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 15, unit: 'VP-X86-IT-WL-4',  check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 16, unit: 'CMS PSTN 5',       check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 17, unit: 'PCI EXP BLADE',    check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 18, unit: 'CMS PSTN 6',       check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 19, unit: 'PCI EXP BLADE',    check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 20, unit: 'UPM DB 1A',        check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 21, unit: 'UPM DB 1B',        check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 22, unit: 'D02500-1',         check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
        ],
      },

      // ── Cabinet 4 — 9 units ───────────────────────────────────────────────
      {
        cabinetNo: 4,
        label:     'Cabinet 4',
        units: [
          { srNo: 1, unit: 'IBM 12 EXP 11', check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 2, unit: 'IBM 24 EXP 10', check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 3, unit: 'IBM 24 EXP 9',  check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 4, unit: 'IBM 24 EXP 8',  check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 5, unit: 'IBM 24 EXP 7',  check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 6, unit: 'IBM 24 EXP 6',  check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 7, unit: 'IBM 24 EXP 5',  check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 8, unit: 'IBM 24 EXP 4',  check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 9, unit: 'V700 CTRL 3',   check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
        ],
      },

      // ── Cabinet 5 — 9 units ───────────────────────────────────────────────
      {
        cabinetNo: 5,
        label:     'Cabinet 5',
        units: [
          { srNo: 1, unit: 'PDU',           check: 'Check if all Switches are ON',      frontOptions: PDU_FRONT_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 2, unit: 'UGS 1A',        check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 3, unit: 'PCI EXP BLADE', check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 4, unit: 'UGS 1B',        check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 5, unit: 'PCI EXP BLADE', check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 6, unit: 'UAS -1',         check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 7, unit: 'UAS -2',         check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 8, unit: 'HSBU1B',         check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 9, unit: 'HSBU1A',         check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
        ],
      },

      // ── Cabinet 6 — 13 units ──────────────────────────────────────────────
      {
        cabinetNo: 6,
        label:     'Cabinet 6',
        units: [
          { srNo:  1, unit: 'PDU',            check: 'Check if all Switches are ON',      frontOptions: PDU_FRONT_OPTIONS, backOptions: LED_OPTIONS },
          { srNo:  2, unit: 'DMM APP TEST 1', check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo:  3, unit: 'CNSL 1',          check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo:  4, unit: 'RAID DPE 1',      check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo:  5, unit: 'RAID DAE 1',      check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo:  6, unit: 'KVMU1',           check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo:  7, unit: 'IBM BCH T1',      check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo:  8, unit: 'DPI 2',           check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo:  9, unit: 'DPI 1',           check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 10, unit: 'LBA F5 1A',       check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 11, unit: 'LBA F5 1B',       check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 12, unit: 'HSBU E1',         check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 13, unit: 'HSBU A2',         check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
        ],
      },

      // ── Cabinet 7 — 25 units ──────────────────────────────────────────────
      {
        cabinetNo: 7,
        label:     'Cabinet 7',
        units: [
          { srNo:  1, unit: 'PDU',              check: 'Check if all Switches are ON',      frontOptions: PDU_FRONT_OPTIONS, backOptions: LED_OPTIONS },
          { srNo:  2, unit: 'DIM2 1B',           check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo:  3, unit: 'DIM2 1A',           check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo:  4, unit: 'IBM 12 EXP 1',      check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo:  5, unit: 'V7000 CTRL 1',      check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo:  6, unit: 'IBM FILE 1B',        check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo:  7, unit: 'IBM FILE 1A',        check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo:  8, unit: 'MKU',               check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo:  9, unit: 'CCS1A',             check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 10, unit: 'DTR 1A',             check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 11, unit: 'PCI EXP BLADE',      check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 12, unit: 'PCI EXP BLADE',      check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 13, unit: 'CMS 1',             check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 14, unit: 'VP X86 BE 1',        check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 15, unit: 'VP X86 FE 1',        check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 16, unit: 'PCI EXP BLADE',      check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 17, unit: 'SGU1A',              check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 18, unit: 'VPX86IN-IT-LE-1',   check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 19, unit: 'PCI EXP BLADE',      check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 20, unit: 'VPX86IN-IT-HE-1',   check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 21, unit: 'SGU SIGTRAN 1A',    check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 22, unit: 'MAU1',               check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 23, unit: 'PCI EXP BLADE',      check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 24, unit: 'PACKETWARE 1',       check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
          { srNo: 25, unit: 'HSBU SZ',            check: 'Check if any Amber LED is glowing', frontOptions: LED_OPTIONS, backOptions: LED_OPTIONS },
        ],
      },

    ], // end DC377 cabinets
  },

};

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Returns the units array for a given system + cabinet number.
 * Falls back to the first cabinet if cabinetNo is missing or not found.
 */
function getCabinetUnits(systemId, cabinetNo) {
  const system = DC_SYSTEMS[systemId];
  if (!system || !system.cabinets.length) return [];
  const cab = system.cabinets.find(c => c.cabinetNo === (cabinetNo || 1));
  return (cab || system.cabinets[0]).units;
}

/**
 * Returns the default "OK" value for a given set of status options.
 * Picks the first option whose severity is 0 (healthy), skipping blank and N/A.
 */
function getDefaultOkValue(options) {
  const ok = options.find(o => o.value !== '' && o.value !== 'N/A' && (STATUS_SEVERITY[o.value] ?? -1) === 0);
  return ok ? ok.value : '';
}

/**
 * Returns the display label for a cabinet (e.g. "Cabinet 1").
 */
function getCabinetLabel(systemId, cabinetNo) {
  const system = DC_SYSTEMS[systemId];
  if (!system) return '';
  const cab = system.cabinets.find(c => c.cabinetNo === (cabinetNo || 1));
  return cab ? cab.label : `Cabinet ${cabinetNo || 1}`;
}
