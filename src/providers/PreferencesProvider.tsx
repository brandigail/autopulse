import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { EfficiencyUnit } from '../lib/units'
import { PreferencesContext } from './preferences'

const STORAGE_KEY = 'autopulse-efficiency-unit'

function initialUnit(): EfficiencyUnit {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'MPG' ? 'MPG' : 'L_PER_100KM'
  } catch {
    return 'L_PER_100KM'
  }
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [efficiencyUnit, setUnit] = useState<EfficiencyUnit>(initialUnit)

  const setEfficiencyUnit = useCallback((unit: EfficiencyUnit) => {
    setUnit(unit)
    try {
      localStorage.setItem(STORAGE_KEY, unit)
    } catch {
      // ignore: the choice still applies for this session
    }
  }, [])

  const value = useMemo(() => ({ efficiencyUnit, setEfficiencyUnit }), [efficiencyUnit, setEfficiencyUnit])
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}
