import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { db } from '../../db'
import { today, formatDate } from '../../utils/dates'
import { scoreRelationships } from '../../utils/scoring'
import PageHeader from '../../components/PageHeader'
import type { RelationshipEntry, Meeting } from '../../types'

const DATE = today()
function genId() { return Math.random().toString(36).slice(2, 10) }

const ROMANCE_EMOJIS: { value: 1 | 2 | 3 | 4 | 5; emoji: string; label: string }[] = [
  { value: 1, emoji: '💔', label: 'Poor' },
  { value: 2, emoji: '😔', label: 'Difficult' },
  { value: 3, emoji: '😐', label: 'Neutral' },
  { value: 4, emoji: '😊', label: 'Good' },
  { value: 5, emoji: '😍', label: 'Excellent' },
]

async function getOrCreate(): Promise<RelationshipEntry> {
  const e = await db.relationships.where('date').equals(DATE).first()
  if (e) return e
  const blank: RelationshipEntry = { date: DATE, communicatorMins: 0, socialMins: 0, meetings: [] }
  const id = await db.relationships.add(blank) as number
  return { ...blank, id }
}

export default function RelationshipsPage() {
  const [entry, setEntry] = useState<RelationshipEntry>({ date: DATE, communicatorMins: 0, socialMins: 0, meetings: [] })
  const [score, setScore] = useState(0)
  const [addingMeeting, setAddingMeeting] = useState(false)
  const [mPerson, setMPerson] = useState('')
  const [mType, setMType] = useState<Meeting['type']>('friend')
  const [mDur, setMDur] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    const e = await getOrCreate()
    setEntry(e); setScore(scoreRelationships(e))
  }

  async function save(patch: Partial<RelationshipEntry>) {
    const updated = { ...entry, ...patch }
    setEntry(updated); setScore(scoreRelationships(updated))
    if (updated.id) await db.relationships.update(updated.id, patch)
  }

  async function addMeeting() {
    if (!mPerson.trim()) return
    const m: Meeting = { id: genId(), person: mPerson.trim(), type: mType, durationMins: parseInt(mDur) || 30 }
    await save({ meetings: [...entry.meetings, m] })
    setMPerson(''); setMDur(''); setAddingMeeting(false)
  }

  const TYPES: Meeting['type'][] = ['family', 'friend', 'work', 'networking', 'romantic']
  const TYPE_EMOJI: Record<string, string> = { family: '👨‍👩‍👧', friend: '👥', work: '💼', networking: '🤝', romantic: '💕' }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <PageHeader title="Relationships" subtitle={formatDate(DATE)} back
        right={<span className="text-sm font-bold px-3 py-1 rounded-lg bg-pink-500/20 text-pink-400">{score}%</span>}
      />
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-4">
        {/* Screen time */}
        <div className="bg-slate-900 rounded-2xl p-4">
          <h3 className="font-semibold text-slate-200 mb-3">📱 Screen Time</h3>
          <div className="space-y-3">
            {[
              { key: 'communicatorMins' as const, label: 'Messaging apps', color: '#6366f1' },
              { key: 'socialMins' as const, label: 'Social media', color: '#ec4899' },
            ].map(({ key, label, color }) => (
              <div key={key}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-slate-400">{label}</span>
                  <span className="text-xs font-semibold text-slate-200">{entry[key]} min</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full">
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(entry[key] / 180 * 100, 100)}%`, backgroundColor: color }} />
                </div>
                <div className="flex gap-2 mt-2">
                  {[15, 30, 60].map(v => (
                    <button key={v} onClick={() => save({ [key]: entry[key] + v })}
                      className="flex-1 py-1.5 text-xs rounded-lg bg-slate-800 text-slate-400 active:bg-slate-700">+{v}m</button>
                  ))}
                  <button onClick={() => save({ [key]: 0 })} className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 text-slate-600 active:bg-slate-700">✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Meetings */}
        <div className="bg-slate-900 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-200">🤝 Meetings</h3>
            <button onClick={() => setAddingMeeting(true)} className="text-xs text-brand-400 flex items-center gap-1"><Plus size={14} />Add</button>
          </div>
          {entry.meetings.length === 0 && !addingMeeting && <p className="text-sm text-slate-600 text-center py-3">No meetings logged</p>}
          <div className="space-y-2">
            {entry.meetings.map(m => (
              <div key={m.id} className="flex items-center gap-3 bg-slate-800 rounded-xl px-3 py-2.5">
                <span>{TYPE_EMOJI[m.type]}</span>
                <div className="flex-1">
                  <p className="text-sm text-slate-200">{m.person}</p>
                  <p className="text-xs text-slate-500">{m.type} · {m.durationMins} min</p>
                </div>
                <button onClick={() => save({ meetings: entry.meetings.filter(x => x.id !== m.id) })} className="p-1 text-slate-700 active:text-red-400"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
          {addingMeeting && (
            <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
              <input value={mPerson} onChange={e => setMPerson(e.target.value)} placeholder="Person's name" className="input-field" />
              <div className="flex gap-1.5 flex-wrap">
                {TYPES.map(t => (
                  <button key={t} onClick={() => setMType(t)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${mType === t ? 'bg-brand-500 text-white' : 'bg-slate-800 text-slate-400'}`}>{TYPE_EMOJI[t]} {t}</button>
                ))}
              </div>
              <input type="number" value={mDur} onChange={e => setMDur(e.target.value)} placeholder="Duration (min)" className="input-field" />
              <div className="flex gap-2">
                <button onClick={() => setAddingMeeting(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-400 text-sm">Cancel</button>
                <button onClick={addMeeting} className="flex-1 py-2.5 rounded-xl bg-brand-500 text-white text-sm">Add</button>
              </div>
            </div>
          )}
        </div>

        {/* Romance */}
        <div className="bg-slate-900 rounded-2xl p-4">
          <h3 className="font-semibold text-slate-200 mb-3">💑 Relationship Zone</h3>
          <p className="text-xs text-slate-500 mb-3">How is your romantic relationship today?</p>
          <div className="flex justify-between">
            {ROMANCE_EMOJIS.map(({ value, emoji, label }) => (
              <button
                key={value}
                onClick={() => save({ romanceRating: value })}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all ${entry.romanceRating === value ? 'bg-pink-500/20 scale-110' : 'opacity-50 active:opacity-80'}`}
              >
                <span className="text-2xl">{emoji}</span>
                <span className="text-[10px] text-slate-400">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
