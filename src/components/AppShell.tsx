import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { ThemeToggle } from './ThemeToggle'
import { VehicleSwitcher } from './VehicleSwitcher'

export function AppShell() {
  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-lg font-semibold text-teal-700 dark:text-teal-400">AutoPulse</h1>
        <div className="flex min-w-0 items-center gap-2">
          <VehicleSwitcher />
          <ThemeToggle />
        </div>
      </header>
      <div className="flex flex-1 flex-col md:flex-row">
        <BottomNav />
        <main className="mx-auto w-full max-w-3xl flex-1 p-4 pb-24 md:pb-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
