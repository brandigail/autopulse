import type { ReminderRule } from '../types'
import { addMonths, daysBetween } from './dates'

export type ReminderStatus = 'overdue' | 'due-soon' | 'ok'

export interface ReminderDue {
  rule: ReminderRule
  status: ReminderStatus
  /** Distance left (negative once passed); null when the rule has no distance interval. */
  distanceRemaining: number | null
  /** Days left (negative once passed); null when the rule has no time interval. */
  daysRemaining: number | null
  dueOdometer: number | null
  dueDate: string | null
}

const DUE_SOON_DAYS = 30
const DUE_SOON_MAX_DISTANCE = 1000
const DUE_SOON_FRACTION = 0.1
const DAYS_PER_MONTH = 30.44

const SEVERITY: Record<ReminderStatus, number> = { overdue: 0, 'due-soon': 1, ok: 2 }

/** A rule fires on whichever limit (distance or time) arrives first. */
export function evaluateReminder(rule: ReminderRule, currentOdometer: number, today: string): ReminderDue {
  const dueOdometer = rule.everyKm !== null ? rule.lastDoneOdometer + rule.everyKm : null
  const dueDate = rule.everyMonths !== null ? addMonths(rule.lastDoneDate, rule.everyMonths) : null
  const distanceRemaining = dueOdometer !== null ? dueOdometer - currentOdometer : null
  const daysRemaining = dueDate !== null ? daysBetween(today, dueDate) : null

  const overdue = (distanceRemaining !== null && distanceRemaining <= 0) || (daysRemaining !== null && daysRemaining <= 0)
  const soonDistance =
    distanceRemaining !== null && rule.everyKm !== null
      ? distanceRemaining <= Math.min(DUE_SOON_MAX_DISTANCE, rule.everyKm * DUE_SOON_FRACTION)
      : false
  const soonTime = daysRemaining !== null && daysRemaining <= DUE_SOON_DAYS

  const status: ReminderStatus = overdue ? 'overdue' : soonDistance || soonTime ? 'due-soon' : 'ok'
  return { rule, status, distanceRemaining, daysRemaining, dueOdometer, dueDate }
}

/** How far through its interval a rule is, using whichever limit is closer. Lower is more urgent. */
function urgency(due: ReminderDue): number {
  const parts: number[] = []
  if (due.distanceRemaining !== null && due.rule.everyKm) parts.push(due.distanceRemaining / due.rule.everyKm)
  if (due.daysRemaining !== null && due.rule.everyMonths) {
    parts.push(due.daysRemaining / (due.rule.everyMonths * DAYS_PER_MONTH))
  }
  return parts.length ? Math.min(...parts) : Number.POSITIVE_INFINITY
}

/** Evaluates every rule and orders them: overdue first, then due soon, each by how close the limit is. */
export function evaluateAll(rules: readonly ReminderRule[], currentOdometer: number, today: string): ReminderDue[] {
  return rules
    .map((rule) => evaluateReminder(rule, currentOdometer, today))
    .sort((a, b) => SEVERITY[a.status] - SEVERITY[b.status] || urgency(a) - urgency(b))
}

export function describeDue(due: ReminderDue, unitLabel: string): string {
  const bits: string[] = []
  if (due.distanceRemaining !== null) {
    const km = Math.abs(Math.round(due.distanceRemaining)).toLocaleString('en-GB')
    bits.push(due.distanceRemaining <= 0 ? `${km} ${unitLabel} over` : `${km} ${unitLabel} left`)
  }
  if (due.daysRemaining !== null) {
    const days = Math.abs(due.daysRemaining)
    const word = days === 1 ? 'day' : 'days'
    bits.push(due.daysRemaining <= 0 ? `${days} ${word} over` : `${days} ${word} left`)
  }
  return bits.join(' · ')
}
