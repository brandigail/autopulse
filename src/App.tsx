import { Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { FuelPage } from './features/fuel/FuelPage'
import { RemindersPage } from './features/reminders/RemindersPage'
import { ServicesPage } from './features/services/ServicesPage'
import { VehiclesPage } from './features/vehicles/VehiclesPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="fuel" element={<FuelPage />} />
        <Route path="reminders" element={<RemindersPage />} />
        <Route path="vehicles" element={<VehiclesPage />} />
      </Route>
    </Routes>
  )
}
