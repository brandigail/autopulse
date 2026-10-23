# AutoPulse: Vehicle Diagnostic and Service Tracker

Read the portfolio-root `CLAUDE.md` first for global rules. This file is the brief for this project.

## What it is
An offline-first PWA for vehicle ownership. Log services (oil, tyre rotation, diff fluid), record fill-ups to see L/100km and cost per distance, and get reminders based on odometer or calendar intervals.

## Stack
React, Vite, TypeScript strict, Tailwind CSS, Dexie.js (IndexedDB), vite-plugin-pwa, Recharts. Hosted on Netlify. (PWA chosen over Expo to ship faster.) No Supabase, no Vercel, no Gemini/OpenAI.

## MVP (build first)
1. Vehicles and service log: add vehicle, log services with date, odometer, cost, notes and type.
2. Fuel log with automatic efficiency (L/100km or MPG toggle) and cost-per-distance, with a trend chart.
3. Reminders: schedule rules by odometer and/or months; dashboard shows due and overdue items.

## Phase 2
Local notifications for due services, Photo attachments for receipts, CSV export/import, Optional Neon sync via Netlify Function.

## Data model (put in `types/`)
```ts
export interface Vehicle { id: string; name: string; make: string; model: string; year: number; odometer: number; unit: 'KM' | 'MI' }
export interface ServiceEntry { id: string; vehicleId: string; type: string; date: string; odometer: number; cost: number; notes: string }
export interface FuelEntry { id: string; vehicleId: string; date: string; odometer: number; litres: number; cost: number; fullTank: boolean }
export interface ReminderRule { id: string; vehicleId: string; serviceType: string; everyKm: number | null; everyMonths: number | null; lastDoneOdometer: number; lastDoneDate: string }
```

## Rules specific to this project
- Efficiency maths must use full-tank to full-tank segments; unit-test the calculations.
- Store odometer and money as numbers (money in minor units); format only at display.
- Everything works offline; no network calls are required for core flows.
- Seed a demo 4x4 with 2 years of services and fuel history.
- Seed realistic demo data so the app looks alive on first load without sign-up.

## Start here
1. Scaffold Vite + Tailwind + Dexie + vite-plugin-pwa, commit.
2. Write the `types/` and Dexie schema.
3. Work through `PLAN.md` from step 2.
