import type { ReminderStatus } from '../../lib/reminders'

const STYLES: Record<ReminderStatus, string> = {
  overdue: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  'due-soon': 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300',
  ok: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
}

const LABELS: Record<ReminderStatus, string> = { overdue: 'Overdue', 'due-soon': 'Due soon', ok: 'On track' }

/** Status is always spelled out in words so it never relies on colour alone. */
export function StatusBadge({ status }: { status: ReminderStatus }) {
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STYLES[status]}`}>{LABELS[status]}</span>
}
