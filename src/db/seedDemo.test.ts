import { describe, expect, it } from 'vitest'
import { computeEfficiency } from '../lib/efficiency'
import { evaluateAll } from '../lib/reminders'
import { buildDemoData } from './seedDemo'

const TODAY = '2026-06-15'

describe('buildDemoData', () => {
  const data = buildDemoData(TODAY, 'demo')

  it('covers about two years of history ending today', () => {
    const dates = [...data.fuel, ...data.services].map((e) => e.date).sort()
    expect(dates[0] >= '2024-06-15').toBe(true)
    expect((dates.at(-1) ?? '') <= TODAY).toBe(true)
    expect(data.fuel.length).toBeGreaterThan(50)
    expect(data.services.length).toBeGreaterThan(8)
  })

  it('gives a believable 4x4 efficiency', () => {
    const report = computeEfficiency(data.fuel, 'KM')
    expect(report.averageLPer100km).toBeGreaterThan(11.5)
    expect(report.averageLPer100km).toBeLessThan(15)
    expect(report.segments.length).toBeGreaterThan(40)
  })

  it('never fills more than a realistic 4x4 tank', () => {
    expect(Math.max(...data.fuel.map((f) => f.litres))).toBeLessThanOrEqual(93)
  })

  it('has rising odometer and every record belongs to the vehicle', () => {
    const odos = data.fuel.map((f) => f.odometer)
    expect(odos).toEqual([...odos].sort((a, b) => a - b))
    for (const entry of [...data.fuel, ...data.services, ...data.reminders]) expect(entry.vehicleId).toBe('demo')
  })

  it('shows something overdue and something due soon today', () => {
    const due = evaluateAll(data.reminders, data.vehicle.odometer, TODAY)
    expect(due.some((d) => d.status === 'overdue')).toBe(true)
    expect(due.some((d) => d.status === 'due-soon')).toBe(true)
    expect(due.some((d) => d.status === 'ok')).toBe(true)
  })

  it('is deterministic apart from generated ids', () => {
    const strip = (d: typeof data) => d.fuel.map(({ id: _id, ...rest }) => rest)
    expect(strip(buildDemoData(TODAY, 'demo'))).toEqual(strip(data))
  })
})
