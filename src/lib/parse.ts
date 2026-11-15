/** Parses what a person typed into a number field. Accepts a decimal comma ("1,5") and returns null when it isn't a number. */
export function parseNumber(text: string): number | null {
  const cleaned = text.trim().replace(/\s/g, '').replace(',', '.')
  if (cleaned === '') return null
  const value = Number(cleaned)
  return Number.isFinite(value) ? value : null
}
