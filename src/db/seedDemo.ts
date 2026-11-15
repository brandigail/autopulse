import type { FuelEntry, ReminderRule, ServiceEntry, Vehicle } from '../types'
import { addDays, todayISO } from '../lib/dates'
import { db, newId } from './schema'

const START_ODOMETER = 74_200
const END_ODOMETER = 119_300
const HISTORY_DAYS = 730

/** Small deterministic generator so the demo looks the same every time (and tests can rely on it). */
function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface ScheduledService {
  type: string
  odometers: number[]
  /** Typical cost in rand; the seed adds a little variation. */
  costRand: number
  notes: string
}

// Odometers are chosen so that, today, one item is overdue and two are close, which makes the dashboard worth looking at.
const SCHEDULE: ScheduledService[] = [
  { type: 'Engine oil and filter', odometers: [80_000, 90_000, 100_000, 110_000], costRand: 1650, notes: '5W-30 synthetic, new filter' },
  { type: 'Tyre rotation', odometers: [78_000, 88_000, 98_000, 108_000], costRand: 350, notes: 'Rotated and balanced' },
  { type: 'Air filter', odometers: [85_000, 105_000], costRand: 520, notes: '' },
  { type: 'Differential fluid', odometers: [90_000], costRand: 1850, notes: 'Front and rear diff, 80W-90' },
  { type: 'Brake inspection', odometers: [100_000], costRand: 780, notes: 'Pads at 60%, discs fine' },
  { type: 'Battery replacement', odometers: [96_500], costRand: 2900, notes: '12V 100Ah' },
  { type: 'Wheel alignment', odometers: [82_000], costRand: 650, notes: 'After new tyres' },
]

const RULES: { serviceType: string; everyKm: number | null; everyMonths: number | null }[] = [
  { serviceType: 'Engine oil and filter', everyKm: 10_000, everyMonths: 6 },
  { serviceType: 'Tyre rotation', everyKm: 10_000, everyMonths: 6 },
  { serviceType: 'Air filter', everyKm: 20_000, everyMonths: 12 },
  { serviceType: 'Differential fluid', everyKm: 40_000, everyMonths: 24 },
  { serviceType: 'Brake inspection', everyKm: 20_000, everyMonths: 12 },
]

export interface DemoData {
  vehicle: Vehicle
  fuel: FuelEntry[]
  services: ServiceEntry[]
  reminders: ReminderRule[]
}

/** Builds two years of history ending today, without touching the database. */
export function buildDemoData(today: string = todayISO(), vehicleId: string = newId()): DemoData {
  const rand = mulberry32(2024)
  const startDate = addDays(today, -HISTORY_DAYS)
  const dateAt = (odometer: number): string => {
    const progress = (odometer - START_ODOMETER) / (END_ODOMETER - START_ODOMETER)
    return addDays(startDate, Math.round(progress * HISTORY_DAYS))
  }

  const fuel: FuelEntry[] = []
  let odometer = START_ODOMETER
  let consumed = 0
  let owed = 0
  // A mix of town and highway: a 4x4 pulling around 13 L/100km.
  const baseLPer100 = 13.2

  fuel.push({ id: newId(), vehicleId, date: startDate, odometer, litres: 78, cost: 78 * 2150, fullTank: true })

  let fillIndex = 0
  while (odometer < END_ODOMETER) {
    // Short enough hops that even a fill that also repays a part fill stays under a ~93 L tank.
    const step = Math.min(END_ODOMETER - odometer, 360 + Math.round(rand() * 120))
    odometer += step
    fillIndex += 1
    const economy = baseLPer100 + (rand() - 0.5) * 2.4
    consumed += (step * economy) / 100

    const partial = fillIndex % 9 === 0 && odometer < END_ODOMETER
    const litres = partial ? consumed * 0.75 : consumed + owed
    owed = partial ? owed + consumed * 0.25 : 0
    consumed = 0

    const progress = (odometer - START_ODOMETER) / (END_ODOMETER - START_ODOMETER)
    const pricePerLitre = 21.9 + progress * 1.6 + (rand() - 0.5) * 0.5
    const roundedLitres = Math.round(litres * 10) / 10
    fuel.push({
      id: newId(),
      vehicleId,
      date: dateAt(odometer),
      odometer,
      litres: roundedLitres,
      cost: Math.round(roundedLitres * pricePerLitre * 100),
      fullTank: !partial,
    })
  }

  const services: ServiceEntry[] = []
  for (const item of SCHEDULE) {
    for (const at of item.odometers) {
      services.push({
        id: newId(),
        vehicleId,
        type: item.type,
        date: dateAt(at),
        odometer: at,
        cost: Math.round((item.costRand * (0.95 + rand() * 0.15)) / 5) * 5 * 100,
        notes: item.notes,
      })
    }
  }
  services.sort((a, b) => a.date.localeCompare(b.date))

  const reminders: ReminderRule[] = RULES.map((rule) => {
    const latest = services.filter((s) => s.type === rule.serviceType).at(-1)
    return {
      id: newId(),
      vehicleId,
      serviceType: rule.serviceType,
      everyKm: rule.everyKm,
      everyMonths: rule.everyMonths,
      lastDoneOdometer: latest?.odometer ?? START_ODOMETER,
      lastDoneDate: latest?.date ?? startDate,
    }
  })

  const vehicle: Vehicle = {
    id: vehicleId,
    name: 'Land Cruiser 200',
    make: 'Toyota',
    model: 'Land Cruiser 200 VX',
    year: 2019,
    odometer: END_ODOMETER,
    unit: 'KM',
  }
  return { vehicle, fuel, services, reminders }
}

/** Adds the demo 4x4 and returns its id. */
export async function seedDemoData(): Promise<string> {
  const data = buildDemoData()
  await db.transaction('rw', [db.vehicles, db.services, db.fuel, db.reminders], async () => {
    await db.vehicles.add(data.vehicle)
    await db.fuel.bulkAdd(data.fuel)
    await db.services.bulkAdd(data.services)
    await db.reminders.bulkAdd(data.reminders)
  })
  return data.vehicle.id
}

const SEEDED_KEY = 'autopulse-demo-seeded'

/** First launch only: show a lived-in demo vehicle instead of an empty app. Never reseeds after the user deletes it. */
export async function ensureDemoData(): Promise<string | null> {
  try {
    if (localStorage.getItem(SEEDED_KEY)) return null
    localStorage.setItem(SEEDED_KEY, '1')
  } catch {
    return null
  }
  if ((await db.vehicles.count()) > 0) return null
  return seedDemoData()
}
