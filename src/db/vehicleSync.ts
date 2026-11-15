import { db } from './schema'

/** Logging anything at a higher odometer means the vehicle has at least that many on the clock. */
export async function bumpVehicleOdometer(vehicleId: string, odometer: number): Promise<void> {
  const vehicle = await db.vehicles.get(vehicleId)
  if (vehicle && odometer > vehicle.odometer) await db.vehicles.update(vehicleId, { odometer })
}
