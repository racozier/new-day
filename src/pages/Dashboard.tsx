import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import { Droplets, Footprints, Weight, Dumbbell, TrendingUp } from 'lucide-react'
import { db, getOrCreateBodyEntry } from '../db'
import { scoreBody, scoreFinances, scoreMental, scoreRelationships, scoreQuergia } from '../utils/scoring'
import { today, formatDate } from '../utils/dates'
import ScoreCard from '../components/ScoreCard'
import type { BodyEntry } from '../types'

const DATE = today()

interface Scores {
  body: number; finances: number; mental: number; relationships: number; quergia: number
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [scores, setScores] = useState<Scores>({ body: 0, finances: 0, mental: 0, relationships: 0, quergia: 0 })
  const [bodyEntry, setBodyEntry] = useState<BodyEntry>({ date: DATE, water: 0, steps: 0, exercises: [] })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [body, finance, mental, rel, quergia] = await Promise.all([
      db.body.where('date').equals(DATE).first(),
      db.finances.where('date').equals(DATE).first(),
      db.mental.where('date').equals(DATE).first(),
      db.relationships.where('date').equals(DATE).first(),
      db.quergia.where('date').equals(DATE).first(),
    ])
    if (body) setBodyEntry(body)
    setScores({
      body: scoreBody(body),
      finances: scoreFinances(finance),
      mental: scoreMental(mental),
      relationships: scoreRelationships(rel),
      quergia: scoreQuergia(quergia),
    })
  }

  const radarData = [
    { area: 'Body',     value: scores.body },
    { area: 'Finances', value: scores.finances },
    { area: 'Mental',   value: scores.mental },
    { area: 'Relations',value: scores.relationships },
    { area: 'QUERGIA',  value: scores.quergia },
  ]

  const overallScore = Math.round(
    (scores.body + scores.finances + scores.mental + scores.relationships + scores.quergia) / 5
  )

  async function quickUpdateWater(delta: number) {
    const entry = await getOrCreateBodyEntry(DATE)
    const updated = { ...entry, water: Math.max(0, Math.round((entry.water + delta) * 10) / 10) }
    if (updated.id) await db.body.update(updated.id, { water: updated.water })
    setBodyEntry(updated)
    setScores(s => ({ ...s, body: scoreBody(updated) }))
  }

  async function quickUpdateSteps(delta: number) {
    const entry = await getOrCreateBodyEntry(DATE)
    const updated = { ...entry, steps: Math.max(0, entry.steps + delta) }
    if (updated.id) await db.body.update(updated.id, { steps: updated.steps })
    setBodyEntry(updated)
    setScores(s => ({ ...s, body: scoreBody(updated) }))
  }

  return (
    <div className="flex flex-col min-h-screen bg-cream-100">
      {/* Header */}
      <div className="px-4 pt-12 pb-4 safe-top">
        <p className="text-warm-400 text-sm">{formatDate(DATE)}</p>
        <h1 className="text-2xl font-bold text-navy-700 mt-0.5">Good day ✨</h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 space-y-4 pb-4">

        {/* Life Balance Wheel */}
        <div className="card">
          <div className="flex items-center justify-between mb-1">
            <h2 className="section-title mb-0">Life Balance</h2>
            <div className="flex items-center gap-1.5">
              <TrendingUp size={14} className="text-brand-500" />
              <span className="text-sm font-bold text-brand-500">{overallScore}%</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <PolarGrid stroke="#e8c4a2" gridType="polygon" />
              <PolarAngleAxis dataKey="area" tick={{ fill: '#8b7260', fontSize: 11, fontWeight: 500 }} />
              <Radar name="Score" dataKey="value" stroke="#e07968" fill="#e07968" fillOpacity={0.18} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Entry */}
        <div className="card">
          <h2 className="section-title">Quick Entry</h2>
          <div className="grid grid-cols-2 gap-3">

            {/* Water */}
            <div className="bg-cream-100 border border-peach-200 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Droplets size={16} className="text-sky-500" />
                <span className="text-xs font-medium text-warm-500">Water</span>
              </div>
              <p className="text-xl font-bold text-navy-700 mb-2">
                {bodyEntry.water}<span className="text-sm text-warm-400 ml-1">L</span>
              </p>
              <div className="h-1.5 bg-peach-200 rounded-full mb-2">
                <div className="h-full bg-sky-400 rounded-full transition-all" style={{ width: `${Math.min(bodyEntry.water / 2.5 * 100, 100)}%` }} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => quickUpdateWater(-0.2)} className="flex-1 text-xs py-1.5 rounded-lg bg-peach-100 active:bg-peach-200 text-warm-600">−0.2</button>
                <button onClick={() => quickUpdateWater(0.2)} className="flex-1 text-xs py-1.5 rounded-lg bg-sky-50 active:bg-sky-100 text-sky-600 font-medium">+0.2</button>
              </div>
            </div>

            {/* Steps */}
            <div className="bg-cream-100 border border-peach-200 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Footprints size={16} className="text-emerald-500" />
                <span className="text-xs font-medium text-warm-500">Steps</span>
              </div>
              <p className="text-xl font-bold text-navy-700 mb-2">{bodyEntry.steps.toLocaleString()}</p>
              <div className="h-1.5 bg-peach-200 rounded-full mb-2">
                <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${Math.min(bodyEntry.steps / 10000 * 100, 100)}%` }} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => quickUpdateSteps(-1000)} className="flex-1 text-xs py-1.5 rounded-lg bg-peach-100 active:bg-peach-200 text-warm-600">−1k</button>
                <button onClick={() => quickUpdateSteps(1000)} className="flex-1 text-xs py-1.5 rounded-lg bg-emerald-50 active:bg-emerald-100 text-emerald-600 font-medium">+1k</button>
              </div>
            </div>
          </div>

          {/* More quick buttons */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            <button onClick={() => navigate('/areas/body')} className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-cream-100 border border-peach-200 active:bg-peach-100 transition-colors">
              <Weight size={18} className="text-brand-500" />
              <span className="text-xs text-warm-500">Weight</span>
            </button>
            <button onClick={() => navigate('/areas/body')} className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-cream-100 border border-peach-200 active:bg-peach-100 transition-colors">
              <Dumbbell size={18} className="text-brand-400" />
              <span className="text-xs text-warm-500">Exercise</span>
            </button>
            <button onClick={() => navigate('/reflect')} className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-cream-100 border border-peach-200 active:bg-peach-100 transition-colors">
              <span className="text-lg">✍️</span>
              <span className="text-xs text-warm-500">Reflect</span>
            </button>
          </div>
        </div>

        {/* Area Scores */}
        <div className="card">
          <h2 className="section-title">Today's Scores</h2>
          <div className="space-y-2">
            {(Object.entries(scores) as [keyof Scores, number][]).map(([area, score]) => (
              <ScoreCard key={area} area={area} score={score} to={`/areas/${area}`} />
            ))}
          </div>
        </div>

        {/* Motivation */}
        <div
          className="rounded-2xl p-4 cursor-pointer active:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #e07968 0%, #c96554 100%)' }}
          onClick={() => navigate('/more/inspiration')}
        >
          <p className="text-xs font-semibold text-white/70 uppercase tracking-wide mb-1">Daily Inspiration</p>
          <p className="text-white font-medium text-sm leading-relaxed">
            "Nothing in life is to be feared, only to be understood."
          </p>
          <p className="text-white/70 text-xs mt-1">— Marie Curie</p>
        </div>

      </div>
    </div>
  )
}
