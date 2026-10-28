/** Dates are ISO `YYYY-MM-DD` strings. Money is stored in minor units (e.g. cents). */

export type DistanceUnit = 'KM' | 'MI'

export interface Vehicle {
  id: string
  name: string
  make: string
  model: string
  year: number
  odometer: number
  unit: DistanceUnit
}

export interface ServiceEntry {
  id: string
  vehicleId: string
  type: string
  date: string
  odometer: number
  /** Minor units. */
  cost: number
  notes: string
}

export interface FuelEntry {
  id: string
  vehicleId: string
  date: string
  odometer: number
  litres: number
  /** Minor units. */
  cost: number
  fullTank: boolean
}

export interface ReminderRule {
  id: string
  vehicleId: string
  serviceType: string
  everyKm: number | null
  everyMonths: number | null
  lastDoneOdometer: number
  lastDoneDate: string
}
