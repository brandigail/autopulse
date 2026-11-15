import { createContext, useContext } from 'react'
import type { EfficiencyUnit } from '../lib/units'

export interface PreferencesContextValue {
  efficiencyUnit: EfficiencyUnit
  setEfficiencyUnit: (unit: EfficiencyUnit) => void
}

export const PreferencesContext = createContext<PreferencesContextValue | null>(null)

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider')
  return ctx
}
