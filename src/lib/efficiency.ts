import type { DistanceUnit, FuelEntry } from '../types'
import { toKm } from './units'

export interface FuelSegment {
  startOdometer: number
  endOdometer: number
  endDate: string
  /** In the vehicle's own unit. */
  distance: number
  litres: number
  /** Minor units. */
  cost: number
  lPer100km: number
}

export interface EfficiencyReport {
  segments: FuelSegment[]
  /** Distance-weighted, not an average of averages. */
  averageLPer100km: number | null
  totalDistance: number
  /** Minor units spent on fuel inside the measured segments. */
  totalCost: number
  /** Minor units per unit of distance (per km or per mile, matching the vehicle). */
  costPerDistance: number | null
}

/**
 * Full-tank to full-tank efficiency. A segment runs from one full fill to the next:
 * its fuel is every fill after the first full tank up to and including the second one
 * (the first fill's own litres filled the tank before the segment started, so they don't count).
 * Part fills before the first full tank have no baseline and are ignored.
 */
export function computeEfficiency(entries: readonly FuelEntry[], unit: DistanceUnit): EfficiencyReport {
  const sorted = [...entries].sort((a, b) => a.odometer - b.odometer || a.date.localeCompare(b.date))
  const segments: FuelSegment[] = []

  let baseline: FuelEntry | null = null
  let litres = 0
  let cost = 0

  for (const entry of sorted) {
    if (baseline === null) {
      if (entry.fullTank) baseline = entry
      continue
    }
    litres += entry.litres
    cost += entry.cost
    if (!entry.fullTank) continue

    const distance = entry.odometer - baseline.odometer
    if (distance > 0 && litres > 0) {
      segments.push({
        startOdometer: baseline.odometer,
        endOdometer: entry.odometer,
        endDate: entry.date,
        distance,
        litres,
        cost,
        lPer100km: (litres / toKm(distance, unit)) * 100,
      })
    }
    baseline = entry
    litres = 0
    cost = 0
  }

  const totalDistance = segments.reduce((sum, s) => sum + s.distance, 0)
  const totalLitres = segments.reduce((sum, s) => sum + s.litres, 0)
  const totalCost = segments.reduce((sum, s) => sum + s.cost, 0)
  const totalKm = toKm(totalDistance, unit)

  return {
    segments,
    averageLPer100km: totalKm > 0 ? (totalLitres / totalKm) * 100 : null,
    totalDistance,
    totalCost,
    costPerDistance: totalDistance > 0 ? totalCost / totalDistance : null,
  }
}
