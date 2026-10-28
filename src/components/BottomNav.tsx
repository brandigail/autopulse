import { Car, Fuel, Gauge, LayoutDashboard, Wrench, type LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Home', icon: LayoutDashboard },
  { to: '/services', label: 'Services', icon: Wrench },
  { to: '/fuel', label: 'Fuel', icon: Fuel },
  { to: '/reminders', label: 'Reminders', icon: Gauge },
  { to: '/vehicles', label: 'Vehicles', icon: Car },
]

export function BottomNav() {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] dark:border-slate-800 dark:bg-slate-900 md:static md:w-52 md:shrink-0 md:border-t-0 md:border-r md:pb-0"
    >
      <ul className="flex md:flex-col md:gap-1 md:p-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1 md:flex-none">
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-1 py-2 text-xs font-medium focus-visible:outline-2 focus-visible:outline-teal-600 md:flex-row md:gap-3 md:rounded-lg md:px-3 md:text-sm ${
                  isActive
                    ? 'text-teal-700 dark:text-teal-400 md:bg-teal-50 md:dark:bg-teal-950'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`
              }
            >
              <Icon size={22} aria-hidden />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
