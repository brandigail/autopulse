import type { DistanceUnit } from '../types'

export type EfficiencyUnit = 'L_PER_100KM' | 'MPG'

const KM_PER_MILE = 1.609344
/** 100 km per litre expressed as US miles per gallon: mpg = 235.215 / (L/100km). */
const MPG_FACTOR = 235.214583

export function toKm(distance: number, unit: DistanceUnit): number {
  return unit === 'MI' ? distance * KM_PER_MILE : distance
}

export function distanceLabel(unit: DistanceUnit): string {
  return unit === 'MI' ? 'mi' : 'km'
}

/** Converts litres per 100 km into the unit the user wants to read. */
export function convertEfficiency(lPer100km: number, unit: EfficiencyUnit): number {
  return unit === 'MPG' ? MPG_FACTOR / lPer100km : lPer100km
}

export function formatEfficiency(lPer100km: number | null, unit: EfficiencyUnit): string {
  if (lPer100km === null) return 'n/a'
  const value = convertEfficiency(lPer100km, unit)
  return unit === 'MPG' ? `${value.toFixed(1)} mpg` : `${value.toFixed(1)} L/100km`
}

export function efficiencyLabel(unit: EfficiencyUnit): string {
  return unit === 'MPG' ? 'mpg (US)' : 'L/100km'
}
