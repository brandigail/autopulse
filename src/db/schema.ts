import Dexie, { type EntityTable } from 'dexie'
import type { FuelEntry, ReminderRule, ServiceEntry, Vehicle } from '../types'

export class AutoPulseDB extends Dexie {
  vehicles!: EntityTable<Vehicle, 'id'>
  services!: EntityTable<ServiceEntry, 'id'>
  fuel!: EntityTable<FuelEntry, 'id'>
  reminders!: EntityTable<ReminderRule, 'id'>

  constructor(name = 'autopulse') {
    super(name)
    this.version(1).stores({
      vehicles: 'id, name',
      services: 'id, vehicleId, [vehicleId+date], [vehicleId+odometer]',
      fuel: 'id, vehicleId, [vehicleId+date], [vehicleId+odometer]',
      reminders: 'id, vehicleId, [vehicleId+serviceType]',
    })
  }
}

export const db = new AutoPulseDB()

export const newId = (): string => crypto.randomUUID()
