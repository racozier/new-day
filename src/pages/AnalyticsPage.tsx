import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts'
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
    setData(dates.map(date => ({
      date: formatShort(date),
      body:          scoreBody(bodies.find(x => x.date === date)),
      finances:      scoreFinances(finances.find(x => x.date === date)),
      mental:        scoreMental(mentals.find(x => x.date === date)),
      relationships: scoreRelationships(rels.find(x => x.date === date)),
      quergia:       scoreQuergia(quergia.find(x => x.date === date)),
    })))
  }

  const avg = (key: keyof typeof data[0]) =>
    data.length ? Math.round(data.reduce((s, d) => s + (d[key] as number), 0) / data.length) : 0

  const radarData = [
    { area: 'Body',      value: avg('body') },
    { area: 'Finances',  value: avg('finances') },
    { area: 'Mental',    value: avg('mental') },
    { area: 'Relations', value: avg('relationships') },
    { area: 'QUERGIA',   value: avg('quergia') },
  ]

  const tooltipStyle = { backgroundColor: '#ffffff', border: '1px solid #e8c4a2', borderRadius: 8, fontSize: 12, color: '#16193b' }

  return (
    <div className="flex flex-col min-h-screen bg-cream-100">
      <PageHeader title="Analytics" back />
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-4">

        {/* Period selector */}
        <div className="flex bg-white border border-peach-200 rounded-xl p-1">
          {(['7d', '30d', '90d'] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${period === p ? 'bg-brand-500 text-white' : 'text-warm-500'}`}>
              {p}
            </button>
          ))}
        </div>

        {/* Averages */}
        <div className="card">
          <h3 className="section-title">Period Averages</h3>
          <div className="grid grid-cols-5 gap-2">
            {(['body', 'finances', 'mental', 'relationships', 'quergia'] as const).map(area => (
              <div key={area} className="text-center">
                <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center text-xs font-bold text-white mb-1"
                  style={{ background: AREA_COLORS[area] }}>
                  {avg(area)}
                </div>
                <p className="text-[10px] text-warm-400 capitalize">{area === 'relationships' ? 'Rels' : area}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Radar */}
        <div className="card">
          <h3 className="section-title">Balance Wheel</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e8c4a2" />
              <PolarAngleAxis dataKey="area" tick={{ fill: '#8b7260', fontSize: 11 }} />
              <Radar dataKey="value" stroke="#e07968" fill="#e07968" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Overall trend */}
        <div className="card">
          <h3 className="section-title">Overall Trend</h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={data.map(d => ({ ...d, overall: Math.round((d.body + d.finances + d.mental + d.relationships + d.quergia) / 5) }))}>
              <XAxis dataKey="date" tick={{ fill: '#b09a82', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#b09a82', fontSize: 10 }} tickLine={false} axisLine={false} width={28} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="overall" stroke="#e07968" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Body bar */}
        <div className="card">
          <h3 className="section-title">Body Score</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data}>
              <XAxis dataKey="date" tick={{ fill: '#b09a82', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#b09a82', fontSize: 10 }} tickLine={false} axisLine={false} width={28} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="body" fill={AREA_COLORS.body} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* All areas */}
        <div className="card">
          <h3 className="section-title">All Areas</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <XAxis dataKey="date" tick={{ fill: '#b09a82', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#b09a82', fontSize: 10 }} tickLine={false} axisLine={false} width={28} />
              <Tooltip contentStyle={tooltipStyle} />
              {(['body', 'finances', 'mental', 'relationships', 'quergia'] as const).map(area => (
                <Line key={area} type="monotone" dataKey={area} stroke={AREA_COLORS[area]} strokeWidth={1.5} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-3 justify-center">
            {(['body', 'finances', 'mental', 'relationships', 'quergia'] as const).map(area => (
              <div key={area} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: AREA_COLORS[area] }} />
                <span className="text-xs text-warm-400 capitalize">{area}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
