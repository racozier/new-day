import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts'
import { db } from '../db'
import { lastNDates, formatShort } from '../utils/dates'
import { scoreBody, scoreFinances, scoreMental, scoreRelationships, scoreQuergia, AREA_COLORS } from '../utils/scoring'
import PageHeader from '../components/PageHeader'

type Period = '7d' | '30d' | '90d'

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('7d')
  const [data, setData] = useState<{ date: string; body: number; finances: number; mental: number; relationships: number; quergia: number }[]>([])

  useEffect(() => { loadData() }, [period])

  async function loadData() {
    const n = period === '7d' ? 7 : period === '30d' ? 30 : 90
    const dates = lastNDates(n)
    const from = dates[0], to = dates[dates.length - 1]

    const [bodies, finances, mentals, rels, quergia] = await Promise.all([
      db.body.where('date').between(from, to, true, true).toArray(),
      db.finances.where('date').between(from, to, true, true).toArray(),
      db.mental.where('date').between(from, to, true, true).toArray(),
      db.relationships.where('date').between(from, to, true, true).toArray(),
      db.quergia.where('date').between(from, to, true, true).toArray(),
    ])

    const rows = dates.map(date => ({
      date: formatShort(date),
      body: scoreBody(bodies.find(x => x.date === date)),
      finances: scoreFinances(finances.find(x => x.date === date)),
      mental: scoreMental(mentals.find(x => x.date === date)),
      relationships: scoreRelationships(rels.find(x => x.date === date)),
      quergia: scoreQuergia(quergia.find(x => x.date === date)),
    }))

    setData(rows)
  }

  const avg = (key: keyof typeof data[0]) =>
    data.length ? Math.round(data.reduce((s, d) => s + (d[key] as number), 0) / data.length) : 0

  const radarData = [
    { area: 'Body', value: avg('body') },
    { area: 'Finances', value: avg('finances') },
    { area: 'Mental', value: avg('mental') },
    { area: 'Relations', value: avg('relationships') },
    { area: 'QUERGIA', value: avg('quergia') },
  ]

  const PERIODS: Period[] = ['7d', '30d', '90d']

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <PageHeader title="Analytics" back />
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-4">
        {/* Period selector */}
        <div className="flex bg-slate-900 rounded-xl p-1">
          {PERIODS.map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${period === p ? 'bg-brand-500 text-white' : 'text-slate-400'}`}>
              {p}
            </button>
          ))}
        </div>

        {/* Average Scores */}
        <div className="bg-slate-900 rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Period Averages</h3>
          <div className="grid grid-cols-5 gap-2">
            {(['body', 'finances', 'mental', 'relationships', 'quergia'] as const).map(area => (
              <div key={area} className="text-center">
                <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center text-xs font-bold text-white mb-1"
                  style={{ background: AREA_COLORS[area] }}>
                  {avg(area)}%
                </div>
                <p className="text-[10px] text-slate-500 capitalize">{area === 'relationships' ? 'Rels' : area}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Radar */}
        <div className="bg-slate-900 rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Balance Wheel</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="area" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Line chart — overall trend */}
        <div className="bg-slate-900 rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Overall Trend</h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={data.map(d => ({ ...d, overall: Math.round((d.body + d.finances + d.mental + d.relationships + d.quergia) / 5) }))}>
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} width={28} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="overall" stroke="#6366f1" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar chart per area */}
        <div className="bg-slate-900 rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Body & Steps</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data}>
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} width={28} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="body" fill={AREA_COLORS.body} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Multi-line chart */}
        <div className="bg-slate-900 rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">All Areas</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} width={28} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8, fontSize: 12 }} />
              {(['body', 'finances', 'mental', 'relationships', 'quergia'] as const).map(area => (
                <Line key={area} type="monotone" dataKey={area} stroke={AREA_COLORS[area]} strokeWidth={1.5} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-3 justify-center">
            {(['body', 'finances', 'mental', 'relationships', 'quergia'] as const).map(area => (
              <div key={area} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: AREA_COLORS[area] }} />
                <span className="text-xs text-slate-500 capitalize">{area}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
