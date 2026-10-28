import { db, newId } from '../../db/schema'
import type { Vehicle } from '../../types'

export type VehicleInput = Omit<Vehicle, 'id'>

export async function addVehicle(input: VehicleInput): Promise<string> {
  const id = newId()
  await db.vehicles.add({ id, ...input })
  return id
}

export async function updateVehicle(id: string, input: VehicleInput): Promise<void> {
  await db.vehicles.update(id, input)
}

/** Deletes the vehicle and everything logged against it. */
export async function deleteVehicle(id: string): Promise<void> {
  await db.transaction('rw', [db.vehicles, db.services, db.fuel, db.reminders], async () => {
    await db.services.where('vehicleId').equals(id).delete()
    await db.fuel.where('vehicleId').equals(id).delete()
    await db.reminders.where('vehicleId').equals(id).delete()
    await db.vehicles.delete(id)
  })
}
