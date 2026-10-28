import { createContext, useContext } from 'react'
import type { Vehicle } from '../types'

export interface ActiveVehicleContextValue {
  /** `undefined` while the first query is loading. */
  vehicles: Vehicle[] | undefined
  activeVehicle: Vehicle | null
  setActiveId: (id: string) => void
}

export const ActiveVehicleContext = createContext<ActiveVehicleContextValue | null>(null)

export function useActiveVehicle(): ActiveVehicleContextValue {
  const ctx = useContext(ActiveVehicleContext)
  if (!ctx) throw new Error('useActiveVehicle must be used within ActiveVehicleProvider')
  return ctx
}
