# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A client-side web application for conducting onsite hardware inspection checks of data center cabinet units. The companion Excel file (`5.X Onsite Cabinet HW Check.xlsx`) serves as a reference/template for the checks being digitized.

## Architecture

This is a plain JavaScript application with no build system or package manager. All code runs directly in the browser.

### Core Data Module: `js/data.js`

The entire data layer lives here. Key exports/globals:

- **`LED_OPTIONS` / `PDU_FRONT_OPTIONS`** — dropdown option arrays (`{value, label, color}`) for front/back status selects. PDU unit 1 uses `PDU_FRONT_OPTIONS` for its front check; all other units use `LED_OPTIONS` for both front and back.

- **`STATUS_SEVERITY`** — maps each status string to a numeric severity (`-1` = incomplete, `0` = OK, `1–2` = warning, `3–4` = issues). Drives the overall status computation.

- **`computeOverallStatus(units)`** — takes an array of `{frontStatus, backStatus}` objects and returns `'INCOMPLETE' | 'OK' | 'WARNING' | 'ISSUES'`. Only `frontStatus` is checked for incompleteness (empty string triggers `INCOMPLETE`); back status contributes to severity but not completeness gating.

- **`DC_SYSTEMS`** — object keyed by system name (currently only `Jamaica`). Each system has `id`, `name`, `location`, and `cabinets` array. Each cabinet entry has `srNo`, `unit`, `check` (instruction text), `frontOptions`, and `backOptions`.

### Adding a New System

Add a new key to `DC_SYSTEMS` following the `Jamaica` pattern. Cabinet unit 1 is conventionally the PDU using `PDU_FRONT_OPTIONS` for the front; all others use `LED_OPTIONS`.

### Adding a New Status Value

1. Add the option object to `LED_OPTIONS` or `PDU_FRONT_OPTIONS` (or a new options array).
2. Add a corresponding entry in `STATUS_SEVERITY` with an appropriate severity level.
