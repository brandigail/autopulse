import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { RemindersPage } from './features/reminders/RemindersPage'
import { ServicesPage } from './features/services/ServicesPage'
import { VehiclesPage } from './features/vehicles/VehiclesPage'

// The chart library is the biggest dependency and only the Fuel screen uses it, so it loads on demand.
const FuelPage = lazy(() => import('./features/fuel/FuelPage').then((m) => ({ default: m.FuelPage })))

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route
          path="fuel"
          element={
            <Suspense fallback={<p className="text-slate-600 dark:text-slate-400">Loading…</p>}>
              <FuelPage />
            </Suspense>
          }
        />
        <Route path="reminders" element={<RemindersPage />} />
        <Route path="vehicles" element={<VehiclesPage />} />
      </Route>
    </Routes>
  )
}
