import { db, newId } from '../../db/schema'
import { bumpVehicleOdometer } from '../../db/vehicleSync'
import type { FuelEntry } from '../../types'

export type FuelInput = Omit<FuelEntry, 'id' | 'vehicleId'>

export async function addFuel(vehicleId: string, input: FuelInput): Promise<void> {
  await db.transaction('rw', [db.fuel, db.vehicles], async () => {
    await db.fuel.add({ id: newId(), vehicleId, ...input })
    await bumpVehicleOdometer(vehicleId, input.odometer)
  })
}

export async function updateFuel(id: string, input: FuelInput): Promise<void> {
  await db.transaction('rw', [db.fuel, db.vehicles], async () => {
    const existing = await db.fuel.get(id)
    if (!existing) return
    await db.fuel.update(id, input)
    await bumpVehicleOdometer(existing.vehicleId, input.odometer)
  })
}

export async function deleteFuel(id: string): Promise<void> {
  await db.fuel.delete(id)
}
