import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer
} from 'recharts'
import { Droplets, Footprints, Weight, Dumbbell, TrendingUp, Sun, Moon } from 'lucide-react'
import { db, getOrCreateBodyEntry } from '../db'
import { scoreBody, scoreFinances, scoreMental, scoreRelationships, scoreQuergia, AREA_COLORS } from '../utils/scoring'
import { today, formatDate } from '../utils/dates'
import { useTheme } from '../hooks/useTheme'
import ScoreCard from '../components/ScoreCard'
import type { BodyEntry } from '../types'

const DATE = today()

interface Scores {
  body: number
  finances: number
  mental: number
  relationships: number
  quergia: number
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const [scores, setScores] = useState<Scores>({ body: 0, finances: 0, mental: 0, relationships: 0, quergia: 0 })
  const [bodyEntry, setBodyEntry] = useState<BodyEntry>({ date: DATE, water: 0, steps: 0, exercises: [] })

  useEffect(() => {
    loadData()
  }, [])

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
    { area: 'Body', value: scores.body, fullMark: 100 },
    { area: 'Finances', value: scores.finances, fullMark: 100 },
    { area: 'Mental', value: scores.mental, fullMark: 100 },
    { area: 'Relations', value: scores.relationships, fullMark: 100 },
    { area: 'QUERGIA', value: scores.quergia, fullMark: 100 },
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
    <div className="flex flex-col min-h-screen bg-slate-950">
      {/* Header */}
      <div className="px-4 pt-12 pb-4 safe-top">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-slate-500 text-sm">{formatDate(DATE)}</p>
            <h1 className="text-2xl font-bold text-slate-100 mt-0.5">Good day</h1>
          </div>
          <button onClick={toggle} className="mt-1 p-2 rounded-xl bg-slate-800 text-slate-400 active:bg-slate-700">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 space-y-4 pb-4">
        {/* Life Balance Wheel */}
        <div className="bg-slate-900 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-slate-300">Life Balance</h2>
            <div className="flex items-center gap-1.5">
              <TrendingUp size={14} className="text-brand-400" />
              <span className="text-sm font-bold text-brand-400">{overallScore}%</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <PolarGrid stroke="#334155" gridType="polygon" />
              <PolarAngleAxis
                dataKey="area"
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
              />
              <Radar
                name="Score"
                dataKey="value"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.25}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Entry — Water & Steps */}
        <div className="bg-slate-900 rounded-2xl p-4">
          <h2 className="text-sm font-semibold text-slate-300 mb-3">Quick Entry</h2>
          <div className="grid grid-cols-2 gap-3">
            {/* Water */}
            <div className="bg-slate-800 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Droplets size={16} className="text-cyan-400" />
                <span className="text-xs font-medium text-slate-400">Water</span>
              </div>
              <p className="text-xl font-bold text-slate-100 mb-2">{bodyEntry.water}<span className="text-sm text-slate-500 ml-1">L</span></p>
              <div className="h-1.5 bg-slate-700 rounded-full mb-2">
                <div className="h-full bg-cyan-500 rounded-full transition-all" style={{ width: `${Math.min(bodyEntry.water / 2.5 * 100, 100)}%` }} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => quickUpdateWater(-0.2)} className="flex-1 text-xs py-1.5 rounded-lg bg-slate-700 active:bg-slate-600 text-slate-300">-0.2</button>
                <button onClick={() => quickUpdateWater(0.2)} className="flex-1 text-xs py-1.5 rounded-lg bg-cyan-500/20 active:bg-cyan-500/30 text-cyan-400">+0.2</button>
              </div>
            </div>
            {/* Steps */}
            <div className="bg-slate-800 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Footprints size={16} className="text-emerald-400" />
                <span className="text-xs font-medium text-slate-400">Steps</span>
              </div>
              <p className="text-xl font-bold text-slate-100 mb-2">{bodyEntry.steps.toLocaleString()}</p>
              <div className="h-1.5 bg-slate-700 rounded-full mb-2">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(bodyEntry.steps / 10000 * 100, 100)}%` }} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => quickUpdateSteps(-1000)} className="flex-1 text-xs py-1.5 rounded-lg bg-slate-700 active:bg-slate-600 text-slate-300">-1k</button>
                <button onClick={() => quickUpdateSteps(1000)} className="flex-1 text-xs py-1.5 rounded-lg bg-emerald-500/20 active:bg-emerald-500/30 text-emerald-400">+1k</button>
              </div>
            </div>
          </div>
          {/* More quick buttons */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            <button onClick={() => navigate('/areas/body')} className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-slate-800 active:bg-slate-700 transition-colors">
              <Weight size={18} className="text-purple-400" />
              <span className="text-xs text-slate-400">Weight</span>
            </button>
            <button onClick={() => navigate('/areas/body')} className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-slate-800 active:bg-slate-700 transition-colors">
              <Dumbbell size={18} className="text-orange-400" />
              <span className="text-xs text-slate-400">Exercise</span>
            </button>
            <button onClick={() => navigate('/reflect')} className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-slate-800 active:bg-slate-700 transition-colors">
              <span className="text-lg">✍️</span>
              <span className="text-xs text-slate-400">Reflect</span>
            </button>
          </div>
        </div>

        {/* Area Scores */}
        <div className="bg-slate-900 rounded-2xl p-4">
          <h2 className="text-sm font-semibold text-slate-300 mb-3">Today's Scores</h2>
          <div className="space-y-2">
            {(Object.entries(scores) as [keyof Scores, number][]).map(([area, score]) => (
              <ScoreCard key={area} area={area} score={score} to={`/areas/${area}`} />
            ))}
          </div>
        </div>

        {/* Motivation Nudge */}
        <div
          className="rounded-2xl p-4 cursor-pointer active:opacity-80 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #4338ca 0%, #7c3aed 100%)' }}
          onClick={() => navigate('/more/inspiration')}
        >
          <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wide mb-1">Daily Inspiration</p>
          <p className="text-slate-100 font-medium text-sm leading-relaxed">
            "Nothing in life is to be feared, only to be understood."
          </p>
          <p className="text-indigo-300 text-xs mt-1">— Marie Curie</p>
        </div>
      </div>
    </div>
  )
}
