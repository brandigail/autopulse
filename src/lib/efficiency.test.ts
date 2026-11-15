import { describe, expect, it } from 'vitest'
import type { FuelEntry } from '../types'
import { computeEfficiency } from './efficiency'
import { convertEfficiency, formatEfficiency } from './units'

let n = 0
const fill = (odometer: number, litres: number, cost: number, fullTank: boolean, date = '2025-01-01'): FuelEntry => ({
  id: `f${n++}`,
  vehicleId: 'v',
  date,
  odometer,
  litres,
  cost,
  fullTank,
})

describe('computeEfficiency', () => {
  it('measures full tank to full tank and ignores the first fill litres', () => {
    // Baseline full fill at 1000 (its 50 L do not count). 500 km later 40 L fills it again: 8 L/100km.
    const report = computeEfficiency([fill(1000, 50, 9000, true), fill(1500, 40, 7600, true)], 'KM')
    expect(report.segments).toHaveLength(1)
    expect(report.segments[0].lPer100km).toBeCloseTo(8, 5)
    expect(report.segments[0].cost).toBe(7600)
    expect(report.averageLPer100km).toBeCloseTo(8, 5)
  })

  it('adds part fills between two full tanks into one segment', () => {
    const report = computeEfficiency(
      [fill(0, 45, 8000, true), fill(300, 20, 3800, false), fill(600, 25, 4750, true)],
      'KM',
    )
    expect(report.segments).toHaveLength(1)
    expect(report.segments[0].litres).toBe(45)
    expect(report.segments[0].distance).toBe(600)
    expect(report.segments[0].lPer100km).toBeCloseTo(7.5, 5)
    expect(report.segments[0].cost).toBe(8550)
  })

  it('ignores part fills before the first full tank', () => {
    const report = computeEfficiency([fill(0, 10, 1900, false), fill(100, 30, 5700, true), fill(500, 32, 6080, true)], 'KM')
    expect(report.segments).toHaveLength(1)
    expect(report.segments[0].startOdometer).toBe(100)
    expect(report.segments[0].lPer100km).toBeCloseTo(8, 5)
  })

  it('sorts entries by odometer regardless of entry order', () => {
    const report = computeEfficiency([fill(1500, 40, 7600, true), fill(1000, 50, 9000, true)], 'KM')
    expect(report.segments[0].lPer100km).toBeCloseTo(8, 5)
  })

  it('weights the average by distance rather than averaging segment averages', () => {
    // 100 km at 10 L/100km then 900 km at 5 L/100km = 55 L over 1000 km = 5.5 (not 7.5).
    const report = computeEfficiency(
      [fill(0, 40, 0, true), fill(100, 10, 0, true), fill(1000, 45, 0, true)],
      'KM',
    )
    expect(report.segments.map((s) => Math.round(s.lPer100km * 10) / 10)).toEqual([10, 5])
    expect(report.averageLPer100km).toBeCloseTo(5.5, 5)
  })

  it('reports cost per distance in the vehicle unit', () => {
    const report = computeEfficiency([fill(0, 40, 0, true), fill(400, 40, 8000, true)], 'KM')
    expect(report.costPerDistance).toBeCloseTo(20, 5) // 8000 minor units over 400 km
  })

  it('converts miles to km before computing L/100km', () => {
    // 100 miles = 160.9344 km on 10 L => 6.2137 L/100km.
    const report = computeEfficiency([fill(0, 30, 0, true), fill(100, 10, 0, true)], 'MI')
    expect(report.segments[0].lPer100km).toBeCloseTo(6.2137, 3)
  })

  it('skips segments with no distance and never divides by zero', () => {
    const report = computeEfficiency([fill(500, 30, 0, true), fill(500, 30, 0, true)], 'KM')
    expect(report.segments).toHaveLength(0)
    expect(report.averageLPer100km).toBeNull()
    expect(report.costPerDistance).toBeNull()
  })

  it('needs at least two full tanks to report anything', () => {
    expect(computeEfficiency([], 'KM').segments).toHaveLength(0)
    expect(computeEfficiency([fill(0, 40, 0, true)], 'KM').averageLPer100km).toBeNull()
  })
})

describe('efficiency units', () => {
  it('converts L/100km to US mpg', () => {
    expect(convertEfficiency(8, 'MPG')).toBeCloseTo(29.4, 1)
    expect(convertEfficiency(8, 'L_PER_100KM')).toBe(8)
  })

  it('formats with the unit and handles missing data', () => {
    expect(formatEfficiency(8, 'L_PER_100KM')).toBe('8.0 L/100km')
    expect(formatEfficiency(null, 'MPG')).toBe('n/a')
  })
})
