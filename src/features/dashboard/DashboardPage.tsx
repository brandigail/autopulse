import { useLiveQuery } from 'dexie-react-hooks'
import { Fuel, Wrench } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { NoVehicle } from '../../components/NoVehicle'
import { cardClass, mutedText } from '../../components/ui'
import { db } from '../../db/schema'
import { addDays, formatDate, todayISO } from '../../lib/dates'
import { computeEfficiency } from '../../lib/efficiency'
import { formatMoney } from '../../lib/money'
import { describeDue, evaluateAll } from '../../lib/reminders'
import { distanceLabel, formatEfficiency } from '../../lib/units'
import { useActiveVehicle } from '../../providers/activeVehicle'
import { usePreferences } from '../../providers/preferences'
import { StatusBadge } from '../reminders/StatusBadge'

interface Activity {
  id: string
  kind: 'service' | 'fuel'
  title: string
  detail: string
  date: string
  odometer: number
}

export function DashboardPage() {
  const { activeVehicle } = useActiveVehicle()
  const { efficiencyUnit } = usePreferences()
  const vehicleId = activeVehicle?.id

  const data = useLiveQuery(async () => {
    if (!vehicleId) return null
    const [services, fuel, reminders] = await Promise.all([
      db.services.where('vehicleId').equals(vehicleId).toArray(),
      db.fuel.where('vehicleId').equals(vehicleId).toArray(),
      db.reminders.where('vehicleId').equals(vehicleId).toArray(),
    ])
    return { services, fuel, reminders }
  }, [vehicleId])

  const summary = useMemo(() => {
    if (!activeVehicle || !data) return null
    const today = todayISO()
    const yearAgo = addDays(today, -365)
    const report = computeEfficiency(data.fuel, activeVehicle.unit)
    const due = evaluateAll(data.reminders, activeVehicle.odometer, today)
    const spent12m =
      data.services.filter((s) => s.date >= yearAgo).reduce((sum, s) => sum + s.cost, 0) +
      data.fuel.filter((f) => f.date >= yearAgo).reduce((sum, f) => sum + f.cost, 0)
    const unit = distanceLabel(activeVehicle.unit)
    const activity: Activity[] = [
      ...data.services.map((s) => ({ id: s.id, kind: 'service' as const, title: s.type, detail: formatMoney(s.cost), date: s.date, odometer: s.odometer })),
      ...data.fuel.map((f) => ({ id: f.id, kind: 'fuel' as const, title: `${f.litres.toFixed(1)} L fuel`, detail: formatMoney(f.cost), date: f.date, odometer: f.odometer })),
    ]
      .sort((a, b) => b.date.localeCompare(a.date) || b.odometer - a.odometer)
      .slice(0, 5)
    return { report, due, spent12m, activity, unit }
  }, [activeVehicle, data])

  if (!activeVehicle) return <NoVehicle />
  if (!summary) return <p className={mutedText}>Loading…</p>

  const attention = summary.due.filter((d) => d.status !== 'ok')

  return (
    <section className="space-y-4">
      <div className={cardClass}>
        <p className={`text-sm ${mutedText}`}>
          {activeVehicle.year} {activeVehicle.make} {activeVehicle.model}
        </p>
        <h2 className="text-2xl font-semibold">{activeVehicle.name}</h2>
        <p className="mt-1 text-lg">
          {activeVehicle.odometer.toLocaleString('en-GB')} {summary.unit}
        </p>
      </div>

      <div className={cardClass}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Needs attention</h3>
          <Link to="/reminders" className="text-sm font-medium text-teal-700 hover:underline dark:text-teal-400">
            All reminders
          </Link>
        </div>
        {attention.length === 0 ? (
          <p className={`mt-2 text-sm ${mutedText}`}>
            {summary.due.length === 0 ? 'No reminders set yet.' : 'Everything is on track. Nothing is due soon.'}
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {attention.map((d) => (
              <li key={d.rule.id}>
                <p className="flex flex-wrap items-center gap-2 font-medium">
                  {d.rule.serviceType} <StatusBadge status={d.status} />
                </p>
                <p className={`text-sm ${mutedText}`}>{describeDue(d, summary.unit)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={cardClass}>
          <p className={`text-sm ${mutedText}`}>Average efficiency</p>
          <p className="text-xl font-semibold">{formatEfficiency(summary.report.averageLPer100km, efficiencyUnit)}</p>
        </div>
        <div className={cardClass}>
          <p className={`text-sm ${mutedText}`}>Spent, last 12 months</p>
          <p className="text-xl font-semibold">{formatMoney(summary.spent12m)}</p>
        </div>
      </div>

      <div className={cardClass}>
        <h3 className="font-semibold">Recent activity</h3>
        {summary.activity.length === 0 ? (
          <p className={`mt-2 text-sm ${mutedText}`}>Nothing logged yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-200 dark:divide-slate-800">
            {summary.activity.map((a) => (
              <li key={a.id} className="flex items-center gap-3 py-2">
                {a.kind === 'service' ? <Wrench size={18} aria-label="Service" className="shrink-0 text-teal-700 dark:text-teal-400" /> : <Fuel size={18} aria-label="Fuel" className="shrink-0 text-teal-700 dark:text-teal-400" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{a.title}</p>
                  <p className={`text-sm ${mutedText}`}>
                    {formatDate(a.date)} · {a.odometer.toLocaleString('en-GB')} {summary.unit}
                  </p>
                </div>
                <p className="text-sm">{a.detail}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
