/** Money is stored in minor units (cents) and only formatted for display. */

const formatter = new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' })

export function formatMoney(minor: number): string {
  return formatter.format(minor / 100).replace(/ /g, ' ')
}

/** Converts what a user types (e.g. 1250.5) to minor units without float drift. */
export function toMinor(major: number): number {
  return Math.round(major * 100)
}

export function toMajorString(minor: number): string {
  return (minor / 100).toFixed(2)
}
