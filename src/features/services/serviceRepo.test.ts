import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { db, newId } from '../../db/schema'
import { addFuel } from '../fuel/fuelRepo'
import { addVehicle } from '../vehicles/vehicleRepo'
import { addReminder, markReminderDone } from '../reminders/reminderRepo'
import { addService, updateService } from './serviceRepo'

let vehicleId = ''

beforeEach(async () => {
  await Promise.all([db.vehicles.clear(), db.services.clear(), db.fuel.clear(), db.reminders.clear()])
  vehicleId = await addVehicle({ name: 'Hilux', make: 'Toyota', model: 'Hilux', year: 2021, odometer: 50000, unit: 'KM' })
})

const service = { type: 'Engine oil', date: '2025-06-01', odometer: 55000, cost: 150000, notes: '' }

describe('serviceRepo', () => {
  it('restarts a matching reminder (ignoring case) and raises the vehicle odometer', async () => {
    await addReminder(vehicleId, { serviceType: 'engine OIL', everyKm: 10000, everyMonths: 6, lastDoneOdometer: 40000, lastDoneDate: '2025-01-01' })
    await addService(vehicleId, service)
    const [rule] = await db.reminders.toArray()
    expect(rule.lastDoneOdometer).toBe(55000)
    expect(rule.lastDoneDate).toBe('2025-06-01')
    expect((await db.vehicles.get(vehicleId))?.odometer).toBe(55000)
  })

  it('leaves other service types alone and does not move a reminder backwards', async () => {
    await addReminder(vehicleId, { serviceType: 'Tyre rotation', everyKm: 10000, everyMonths: null, lastDoneOdometer: 40000, lastDoneDate: '2025-01-01' })
    await addReminder(vehicleId, { serviceType: 'Engine oil', everyKm: 10000, everyMonths: null, lastDoneOdometer: 59000, lastDoneDate: '2025-09-01' })
    await addService(vehicleId, service) // oil on an older date than the reminder's last done
    const rules = await db.reminders.toArray()
    expect(rules.find((r) => r.serviceType === 'Tyre rotation')?.lastDoneOdometer).toBe(40000)
    expect(rules.find((r) => r.serviceType === 'Engine oil')?.lastDoneOdometer).toBe(59000)
  })

  it('does not lower the vehicle odometer when an older entry is logged', async () => {
    await addService(vehicleId, { ...service, odometer: 20000 })
    expect((await db.vehicles.get(vehicleId))?.odometer).toBe(50000)
  })

  it('applies edits to reminders too', async () => {
    await addReminder(vehicleId, { serviceType: 'Engine oil', everyKm: 10000, everyMonths: null, lastDoneOdometer: 0, lastDoneDate: '2025-01-01' })
    await addService(vehicleId, service)
    const [saved] = await db.services.toArray()
    await updateService(saved.id, { ...service, odometer: 56000, date: '2025-06-02' })
    expect((await db.reminders.toArray())[0].lastDoneOdometer).toBe(56000)
  })
})

describe('fuel and reminders', () => {
  it('raises the vehicle odometer from a fill-up', async () => {
    await addFuel(vehicleId, { date: '2025-06-01', odometer: 51234, litres: 40, cost: 90000, fullTank: true })
    expect((await db.vehicles.get(vehicleId))?.odometer).toBe(51234)
  })

  it('marks a reminder done from now', async () => {
    const id = newId()
    await db.reminders.add({ id, vehicleId, serviceType: 'Oil', everyKm: 10000, everyMonths: 6, lastDoneOdometer: 0, lastDoneDate: '2024-01-01' })
    await markReminderDone(id, 52000, '2025-06-10')
    expect(await db.reminders.get(id)).toMatchObject({ lastDoneOdometer: 52000, lastDoneDate: '2025-06-10' })
  })
})
