import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatDate } from '../../lib/dates'
import type { FuelSegment } from '../../lib/efficiency'
import { convertEfficiency, efficiencyLabel, type EfficiencyUnit } from '../../lib/units'

interface Props {
  segments: FuelSegment[]
  unit: EfficiencyUnit
  /** Latest points to plot; older history stays in the numbers but would crowd a phone screen. */
  maxPoints?: number
}

export function FuelChart({ segments, unit, maxPoints = 30 }: Props) {
  const data = segments.slice(-maxPoints).map((s) => ({
    date: s.endDate,
    value: Math.round(convertEfficiency(s.lPer100km, unit) * 10) / 10,
  }))
  const label = efficiencyLabel(unit)

  if (data.length < 2) {
    return (
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Log at least two full-tank fill-ups to see your efficiency trend.
      </p>
    )
  }

  return (
    <div
      role="img"
      aria-label={`Line chart of ${label} for the last ${data.length} fill-ups, from ${data[0].value} to ${data[data.length - 1].value}`}
      className="h-56 w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: -16 }}>
          <CartesianGrid stroke="currentColor" strokeOpacity={0.12} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(d: string) => formatDate(d).replace(/ \d{4}$/, '')}
            tick={{ fontSize: 11, fill: 'currentColor' }}
            stroke="currentColor"
            strokeOpacity={0.3}
            minTickGap={32}
          />
          <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: 'currentColor' }} stroke="currentColor" strokeOpacity={0.3} />
          <Tooltip
            formatter={(value) => [`${value} ${label}`, 'Efficiency']}
            labelFormatter={(d) => formatDate(String(d))}
            contentStyle={{ borderRadius: 8 }}
          />
          <Line type="monotone" dataKey="value" stroke="#0f766e" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
