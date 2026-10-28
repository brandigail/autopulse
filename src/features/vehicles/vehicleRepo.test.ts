import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { db, newId } from '../../db/schema'
import { addVehicle, deleteVehicle, updateVehicle, type VehicleInput } from './vehicleRepo'

const input: VehicleInput = { name: 'Hilux', make: 'Toyota', model: 'Hilux', year: 2021, odometer: 52000, unit: 'KM' }

beforeEach(async () => {
  await Promise.all([db.vehicles.clear(), db.services.clear(), db.fuel.clear(), db.reminders.clear()])
})

describe('vehicleRepo', () => {
  it('adds and updates a vehicle', async () => {
    const id = await addVehicle(input)
    await updateVehicle(id, { ...input, odometer: 53000 })
    expect((await db.vehicles.get(id))?.odometer).toBe(53000)
  })

  it('deletes a vehicle with its logs but leaves other vehicles alone', async () => {
    const id = await addVehicle(input)
    const otherId = await addVehicle({ ...input, name: 'Defender' })
    for (const vehicleId of [id, otherId]) {
      await db.services.add({ id: newId(), vehicleId, type: 'Oil', date: '2025-01-01', odometer: 1, cost: 100, notes: '' })
      await db.fuel.add({ id: newId(), vehicleId, date: '2025-01-01', odometer: 1, litres: 40, cost: 100, fullTank: true })
      await db.reminders.add({ id: newId(), vehicleId, serviceType: 'Oil', everyKm: 10000, everyMonths: 6, lastDoneOdometer: 0, lastDoneDate: '2025-01-01' })
    }
    await deleteVehicle(id)
    expect(await db.vehicles.count()).toBe(1)
    expect(await db.services.where('vehicleId').equals(id).count()).toBe(0)
    expect(await db.fuel.where('vehicleId').equals(id).count()).toBe(0)
    expect(await db.reminders.where('vehicleId').equals(id).count()).toBe(0)
    expect(await db.services.where('vehicleId').equals(otherId).count()).toBe(1)
  })
})
