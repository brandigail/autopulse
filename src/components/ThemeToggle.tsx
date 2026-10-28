import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../providers/theme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${next} theme`}
      className="flex size-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-teal-600 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      {theme === 'dark' ? <Sun size={20} aria-hidden /> : <Moon size={20} aria-hidden />}
    </button>
  )
}
