import { db, newId } from '../../db/schema'
import type { ReminderRule, ServiceEntry } from '../../types'

export type ReminderInput = Omit<ReminderRule, 'id' | 'vehicleId'>

export async function addReminder(vehicleId: string, input: ReminderInput): Promise<void> {
  await db.reminders.add({ id: newId(), vehicleId, ...input })
}

export async function updateReminder(id: string, input: ReminderInput): Promise<void> {
  await db.reminders.update(id, input)
}

export async function deleteReminder(id: string): Promise<void> {
  await db.reminders.delete(id)
}

/** "Mark as done now": restarts the interval from today at the current odometer. */
export async function markReminderDone(id: string, odometer: number, date: string): Promise<void> {
  await db.reminders.update(id, { lastDoneOdometer: odometer, lastDoneDate: date })
}

const sameType = (a: string, b: string): boolean => a.trim().toLowerCase() === b.trim().toLowerCase()

/**
 * When a service is logged, any reminder for that service type restarts from it,
 * as long as it is not older than what the reminder already knows about.
 */
export async function applyServiceToReminders(entry: Pick<ServiceEntry, 'vehicleId' | 'type' | 'date' | 'odometer'>): Promise<void> {
  const rules = await db.reminders.where('vehicleId').equals(entry.vehicleId).toArray()
  for (const rule of rules) {
    if (sameType(rule.serviceType, entry.type) && entry.date >= rule.lastDoneDate) {
      await db.reminders.update(rule.id, { lastDoneOdometer: entry.odometer, lastDoneDate: entry.date })
    }
  }
}
