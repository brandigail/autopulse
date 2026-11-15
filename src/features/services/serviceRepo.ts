import { db, newId } from '../../db/schema'
import { bumpVehicleOdometer } from '../../db/vehicleSync'
import type { ServiceEntry } from '../../types'
import { applyServiceToReminders } from '../reminders/reminderRepo'

export type ServiceInput = Omit<ServiceEntry, 'id' | 'vehicleId'>

export async function addService(vehicleId: string, input: ServiceInput): Promise<void> {
  await db.transaction('rw', [db.services, db.vehicles, db.reminders], async () => {
    await db.services.add({ id: newId(), vehicleId, ...input })
    await bumpVehicleOdometer(vehicleId, input.odometer)
    await applyServiceToReminders({ vehicleId, ...input })
  })
}

export async function updateService(id: string, input: ServiceInput): Promise<void> {
  await db.transaction('rw', [db.services, db.vehicles, db.reminders], async () => {
    const existing = await db.services.get(id)
    if (!existing) return
    await db.services.update(id, input)
    await bumpVehicleOdometer(existing.vehicleId, input.odometer)
    await applyServiceToReminders({ vehicleId: existing.vehicleId, ...input })
  })
}

export async function deleteService(id: string): Promise<void> {
  await db.services.delete(id)
}
