import { useState, useEffect } from 'react'
import { Plus, Trash2, Lightbulb } from 'lucide-react'
import { db } from '../../db'
import { today, formatDate } from '../../utils/dates'
import { scoreMental } from '../../utils/scoring'
import PageHeader from '../../components/PageHeader'
import type { MentalEntry, LearningItem } from '../../types'

const DATE = today()
function genId() { return Math.random().toString(36).slice(2, 10) }

async function getOrCreate(): Promise<MentalEntry> {
  const e = await db.mental.where('date').equals(DATE).first()
  if (e) return e
  const blank: MentalEntry = { date: DATE, learningItems: [], insights: [], hoursLearned: 0 }
  const id = await db.mental.add(blank) as number
  return { ...blank, id }
}

export default function MentalPage() {
  const [entry, setEntry] = useState<MentalEntry>({ date: DATE, learningItems: [], insights: [], hoursLearned: 0 })
  const [score, setScore] = useState(0)
  const [learnTitle, setLearnTitle] = useState('')
  const [learnType, setLearnType] = useState<LearningItem['type']>('book')
  const [addingLearn, setAddingLearn] = useState(false)
  const [insight, setInsight] = useState('')
  const [hoursInput, setHoursInput] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    const e = await getOrCreate()
    setEntry(e)
    setScore(scoreMental(e))
    if (e.hoursLearned) setHoursInput(String(e.hoursLearned))
  }

  async function save(patch: Partial<MentalEntry>) {
    const updated = { ...entry, ...patch }
    setEntry(updated)
    setScore(scoreMental(updated))
    if (updated.id) await db.mental.update(updated.id, patch)
  }

  async function addLearnItem() {
    if (!learnTitle.trim()) return
    const item: LearningItem = { id: genId(), title: learnTitle.trim(), type: learnType, area: 'mental' }
    await save({ learningItems: [...entry.learningItems, item] })
    setLearnTitle(''); setAddingLearn(false)
  }

  async function addInsight() {
    if (!insight.trim()) return
    await save({ insights: [...entry.insights, insight.trim()] })
    setInsight('')
  }

  const TYPES: LearningItem['type'][] = ['book', 'course', 'podcast', 'video', 'article']
  const TYPE_EMOJI: Record<string, string> = { book: '📖', course: '🎓', podcast: '🎧', video: '📺', article: '📰' }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <PageHeader title="Mental Growth" subtitle={formatDate(DATE)} back
        right={<span className="text-sm font-bold px-3 py-1 rounded-lg bg-brand-500/20 text-brand-400">{score}%</span>}
      />
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-4">
        {/* Hours */}
        <div className="bg-slate-900 rounded-2xl p-4">
          <h3 className="font-semibold text-slate-200 mb-3">⏱ Hours Learned Today</h3>
          <div className="flex gap-2">
            <input type="number" step="0.5" value={hoursInput} onChange={e => setHoursInput(e.target.value)} placeholder="e.g. 1.5" className="input-field flex-1" />
            <button onClick={() => { const v = parseFloat(hoursInput); if (!isNaN(v)) save({ hoursLearned: v }) }} className="px-4 rounded-xl bg-brand-500/20 text-brand-400 text-sm font-medium active:bg-brand-500/30">Save</button>
          </div>
          <div className="flex gap-2 mt-2">
            {[0.5, 1, 1.5, 2].map(v => (
              <button key={v} onClick={() => { setHoursInput(String(entry.hoursLearned + v)); save({ hoursLearned: entry.hoursLearned + v }) }}
                className="flex-1 py-1.5 text-xs rounded-lg bg-slate-800 text-slate-400 active:bg-slate-700">+{v}h</button>
            ))}
          </div>
        </div>

        {/* Learning Items */}
        <div className="bg-slate-900 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-200">📚 What I Studied</h3>
            <button onClick={() => setAddingLearn(true)} className="text-xs text-brand-400 flex items-center gap-1"><Plus size={14} />Add</button>
          </div>
          {entry.learningItems.length === 0 && !addingLearn && <p className="text-sm text-slate-600 text-center py-3">Nothing logged yet</p>}
          <div className="space-y-2">
            {entry.learningItems.map(item => (
              <div key={item.id} className="flex items-center gap-3 bg-slate-800 rounded-xl px-3 py-2.5">
                <span>{TYPE_EMOJI[item.type] ?? '📖'}</span>
                <p className="flex-1 text-sm text-slate-200">{item.title}</p>
                <span className="text-xs text-slate-600">{item.type}</span>
                <button onClick={() => save({ learningItems: entry.learningItems.filter(l => l.id !== item.id) })} className="p-1 text-slate-700 active:text-red-400"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
          {addingLearn && (
            <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
              <input value={learnTitle} onChange={e => setLearnTitle(e.target.value)} placeholder="Book / course / podcast title" className="input-field" />
              <div className="flex gap-1.5 flex-wrap">
                {TYPES.map(t => (
                  <button key={t} onClick={() => setLearnType(t)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${learnType === t ? 'bg-brand-500 text-white' : 'bg-slate-800 text-slate-400'}`}>{TYPE_EMOJI[t]} {t}</button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setAddingLearn(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-400 text-sm">Cancel</button>
                <button onClick={addLearnItem} className="flex-1 py-2.5 rounded-xl bg-brand-500 text-white text-sm">Add</button>
              </div>
            </div>
          )}
        </div>

        {/* Insights */}
        <div className="bg-slate-900 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={18} className="text-yellow-400" />
            <h3 className="font-semibold text-slate-200">Today's Insights</h3>
          </div>
          <div className="space-y-2 mb-3">
            {entry.insights.map((ins, i) => (
              <div key={i} className="flex gap-3 bg-slate-800 rounded-xl px-3 py-2.5">
                <span className="text-yellow-400 text-xs mt-0.5">💡</span>
                <p className="flex-1 text-sm text-slate-200">{ins}</p>
                <button onClick={() => save({ insights: entry.insights.filter((_, j) => j !== i) })} className="p-1 text-slate-700 active:text-red-400"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={insight} onChange={e => setInsight(e.target.value)} onKeyDown={e => e.key === 'Enter' && addInsight()} placeholder="New insight..." className="input-field flex-1" />
            <button onClick={addInsight} className="px-4 rounded-xl bg-yellow-500/20 text-yellow-400 text-sm active:bg-yellow-500/30">Add</button>
          </div>
        </div>
      </div>
    </div>
  )
}
