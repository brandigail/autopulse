import { useLiveQuery } from 'dexie-react-hooks'
import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { db } from '../db/schema'
import { ActiveVehicleContext } from './activeVehicle'

const STORAGE_KEY = 'autopulse-active-vehicle'

function storedId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function ActiveVehicleProvider({ children }: { children: ReactNode }) {
  const vehicles = useLiveQuery(() => db.vehicles.orderBy('name').toArray())
  const [selectedId, setSelectedId] = useState<string | null>(storedId)

  const setActiveId = useCallback((id: string) => {
    setSelectedId(id)
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch {
      // ignore: selection still applies for this session
    }
  }, [])

  const activeVehicle = vehicles?.find((v) => v.id === selectedId) ?? vehicles?.[0] ?? null
  const value = useMemo(
    () => ({ vehicles, activeVehicle, setActiveId }),
    [vehicles, activeVehicle, setActiveId],
  )

  return <ActiveVehicleContext.Provider value={value}>{children}</ActiveVehicleContext.Provider>
}
