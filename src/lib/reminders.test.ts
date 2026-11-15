import { describe, expect, it } from 'vitest'
import type { ReminderRule } from '../types'
import { addDays, addMonths, daysBetween, isValidISO } from './dates'
import { describeDue, evaluateAll, evaluateReminder } from './reminders'

const rule = (over: Partial<ReminderRule> = {}): ReminderRule => ({
  id: 'r',
  vehicleId: 'v',
  serviceType: 'Engine oil',
  everyKm: 10000,
  everyMonths: 6,
  lastDoneOdometer: 50000,
  lastDoneDate: '2025-01-15',
  ...over,
})

describe('dates', () => {
  it('clamps month-end when adding months', () => {
    expect(addMonths('2025-01-31', 1)).toBe('2025-02-28')
    expect(addMonths('2024-01-31', 1)).toBe('2024-02-29')
    expect(addMonths('2025-11-15', 3)).toBe('2026-02-15')
  })

  it('counts whole days either way', () => {
    expect(daysBetween('2025-03-01', '2025-03-31')).toBe(30)
    expect(daysBetween('2025-03-31', '2025-03-01')).toBe(-30)
    expect(daysBetween('2025-03-29', '2025-03-30')).toBe(1) // across a DST change in many zones
    expect(addDays('2025-12-30', 3)).toBe('2026-01-02')
  })

  it('validates ISO dates', () => {
    expect(isValidISO('2025-02-28')).toBe(true)
    expect(isValidISO('2025-02-30')).toBe(false)
    expect(isValidISO('28/02/2025')).toBe(false)
  })
})

describe('evaluateReminder', () => {
  it('is ok when well inside both limits', () => {
    const due = evaluateReminder(rule(), 52000, '2025-02-01')
    expect(due.status).toBe('ok')
    expect(due.distanceRemaining).toBe(8000)
    expect(due.dueDate).toBe('2025-07-15')
  })

  it('is overdue once the distance limit is reached, even if the date is fine', () => {
    expect(evaluateReminder(rule(), 60000, '2025-02-01').status).toBe('overdue')
    expect(evaluateReminder(rule(), 61500, '2025-02-01').distanceRemaining).toBe(-1500)
  })

  it('is overdue once the date passes, even if the distance is fine', () => {
    const due = evaluateReminder(rule(), 51000, '2025-08-01')
    expect(due.status).toBe('overdue')
    expect(due.daysRemaining).toBeLessThan(0)
  })

  it('is due soon within 30 days or the last tenth of the distance', () => {
    expect(evaluateReminder(rule(), 51000, '2025-06-20').status).toBe('due-soon') // 25 days left
    expect(evaluateReminder(rule(), 59200, '2025-02-01').status).toBe('due-soon') // 800 km left (<1000)
    expect(evaluateReminder(rule(), 58900, '2025-02-01').status).toBe('ok') // 1100 km left
  })

  it('supports distance-only and time-only rules', () => {
    const distanceOnly = evaluateReminder(rule({ everyMonths: null }), 52000, '2030-01-01')
    expect(distanceOnly.daysRemaining).toBeNull()
    expect(distanceOnly.status).toBe('ok')
    const timeOnly = evaluateReminder(rule({ everyKm: null }), 999999, '2025-02-01')
    expect(timeOnly.distanceRemaining).toBeNull()
    expect(timeOnly.status).toBe('ok')
  })
})

describe('evaluateAll and describeDue', () => {
  it('orders overdue before due soon before ok', () => {
    const list = evaluateAll(
      [
        rule({ id: 'ok', lastDoneOdometer: 55000 }),
        rule({ id: 'over', lastDoneOdometer: 40000 }),
        rule({ id: 'soon', lastDoneOdometer: 51000 }),
      ],
      60500,
      '2025-02-01',
    )
    expect(list.map((d) => [d.rule.id, d.status])).toEqual([
      ['over', 'overdue'],
      ['soon', 'due-soon'],
      ['ok', 'ok'],
    ])
  })

  it('describes remaining and overshoot', () => {
    expect(describeDue(evaluateReminder(rule(), 61500, '2025-08-01'), 'km')).toMatch(/1,500 km over · \d+ days over/)
    expect(describeDue(evaluateReminder(rule({ everyMonths: null }), 52000, '2025-02-01'), 'mi')).toBe('8,000 mi left')
  })
})
