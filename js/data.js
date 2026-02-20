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

// Severity map used to compute overall inspection status
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
  let hasEmpty   = false;
  let maxSeverity = 0;

  units.forEach(unit => {
    const fv = unit.frontStatus;
    const bv = unit.backStatus;

    if (!fv || fv === '') hasEmpty = true;

    const fSev = STATUS_SEVERITY[fv] ?? 0;
    const bSev = (bv && bv !== '') ? (STATUS_SEVERITY[bv] ?? 0) : 0;
    maxSeverity = Math.max(maxSeverity, fSev, bSev);
  });

  if (hasEmpty)       return 'INCOMPLETE';
  if (maxSeverity === 0) return 'OK';
  if (maxSeverity <= 2)  return 'WARNING';
  return 'ISSUES';
}

// ─── System Definitions ──────────────────────────────────────────────────────

const DC_SYSTEMS = {
  Jamaica: {
    id:       'Jamaica',
    name:     'System Jamaica',
    location: 'Data Center',
    cabinets: [
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
};
