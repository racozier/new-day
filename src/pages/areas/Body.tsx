import { useState, useEffect } from 'react'
import { Droplets, Footprints, Weight, Plus, Trash2 } from 'lucide-react'
import { db, getOrCreateBodyEntry } from '../../db'
import { today, formatDate } from '../../utils/dates'
import { scoreBody } from '../../utils/scoring'
import PageHeader from '../../components/PageHeader'
import ProgressBar from '../../components/ProgressBar'
import type { BodyEntry, Exercise } from '../../types'

const DATE = today()

const EXERCISE_TYPES: { type: Exercise['type']; label: string; emoji: string }[] = [
  { type: 'yoga',       label: 'Yoga',         emoji: '🧘' },
  { type: 'shakti',     label: 'Shakti Dance',  emoji: '💃' },
  { type: 'situps',     label: 'Sit-ups',       emoji: '🏋️' },
  { type: 'walking',    label: 'Walking',       emoji: '🚶' },
  { type: 'running',    label: 'Running',       emoji: '🏃' },
  { type: 'stretching', label: 'Stretching',    emoji: '🤸' },
]

function genId() { return Math.random().toString(36).slice(2, 10) }

export default function BodyPage() {
  const [entry, setEntry] = useState<BodyEntry>({ date: DATE, water: 0, steps: 0, exercises: [] })
  const [score, setScore] = useState(0)
  const [weightInput, setWeightInput] = useState('')
  const [addingExercise, setAddingExercise] = useState(false)
  const [exType, setExType] = useState<Exercise['type']>('yoga')
  const [exDuration, setExDuration] = useState('')
  const [exReps, setExReps] = useState('')

  useEffect(() => { loadEntry() }, [])

  async function loadEntry() {
    const e = await getOrCreateBodyEntry(DATE)
    setEntry(e); setScore(scoreBody(e))
    if (e.weight) setWeightInput(String(e.weight))
  }

  async function updateEntry(patch: Partial<BodyEntry>) {
    const updated = { ...entry, ...patch }
    setEntry(updated); setScore(scoreBody(updated))
    if (updated.id) {
      await db.body.update(updated.id, patch)
    } else {
      const id = await db.body.add(updated) as number
      setEntry({ ...updated, id })
    }
  }

  async function saveWeight() {
    const w = parseFloat(weightInput)
    if (!isNaN(w) && w > 0) await updateEntry({ weight: w })
  }

  async function addExercise() {
    const ex: Exercise = {
      id: genId(), type: exType,
      duration: exDuration ? parseInt(exDuration) : undefined,
      reps: exReps ? parseInt(exReps) : undefined,
    }
    await updateEntry({ exercises: [...entry.exercises, ex] })
    setExDuration(''); setExReps(''); setAddingExercise(false)
  }

  const exLabel = EXERCISE_TYPES.find(e => e.type === exType)

  return (
    <div className="flex flex-col min-h-screen bg-cream-100">
      <PageHeader title="Body" subtitle={formatDate(DATE)} back
        right={<span className="text-sm font-bold px-3 py-1 rounded-lg bg-brand-100 text-brand-600">{score}%</span>}
      />
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-4">

        {/* Water */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Droplets size={18} className="text-sky-500" />
            <h3 className="font-semibold text-navy-700">Water Intake</h3>
            <span className="ml-auto text-xs text-warm-400">Goal: 2.5 L</span>
          </div>
          <ProgressBar value={entry.water} max={2.5} color="#38bdf8" unit="L" />
          <div className="flex gap-2 mt-3">
            {[0.1, 0.2, 0.3, 0.5].map(v => (
              <button key={v} onClick={() => updateEntry({ water: Math.round((entry.water + v) * 10) / 10 })}
                className="flex-1 py-2 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 text-xs font-semibold active:bg-sky-100">
                +{v}L
              </button>
            ))}
          </div>
          <button onClick={() => updateEntry({ water: 0 })} className="mt-2 text-xs text-warm-400 active:text-warm-600 w-full text-center">Reset</button>
        </div>

        {/* Steps */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Footprints size={18} className="text-emerald-500" />
            <h3 className="font-semibold text-navy-700">Steps</h3>
            <span className="ml-auto text-xs text-warm-400">Goal: 10,000</span>
          </div>
          <ProgressBar value={entry.steps} max={10000} color="#34d399" />
          <div className="flex gap-2 mt-3">
            {[500, 1000, 2000, 5000].map(v => (
              <button key={v} onClick={() => updateEntry({ steps: entry.steps + v })}
                className="flex-1 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-semibold active:bg-emerald-100">
                +{v >= 1000 ? `${v / 1000}k` : v}
              </button>
            ))}
          </div>
          <div className="mt-3">
            <input type="number" placeholder="Enter exact steps" className="input-field"
              onBlur={e => { const v = parseInt(e.target.value); if (!isNaN(v)) { updateEntry({ steps: v }); e.target.value = '' } }} />
          </div>
        </div>

        {/* Weight */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Weight size={18} className="text-brand-500" />
            <h3 className="font-semibold text-navy-700">Weight</h3>
          </div>
          <div className="flex gap-3">
            <input type="number" step="0.1" value={weightInput} onChange={e => setWeightInput(e.target.value)}
              placeholder="e.g. 70.5" className="input-field flex-1" />
            <button onClick={saveWeight} className="px-4 py-2.5 rounded-xl bg-brand-100 text-brand-600 text-sm font-medium active:bg-brand-200">Save</button>
          </div>
          {entry.weight && (
            <p className="text-sm text-warm-500 mt-2">Today: <span className="text-navy-700 font-semibold">{entry.weight} kg</span></p>
          )}
        </div>

        {/* Exercises */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-navy-700">Exercise Log</h3>
            <button onClick={() => setAddingExercise(true)} className="flex items-center gap-1 text-xs text-brand-500 active:text-brand-700">
              <Plus size={14} /> Add
            </button>
          </div>

          {entry.exercises.length === 0 && !addingExercise && (
            <p className="text-sm text-warm-400 text-center py-4">No exercises logged yet</p>
          )}

          <div className="space-y-2">
            {entry.exercises.map(ex => {
              const info = EXERCISE_TYPES.find(e => e.type === ex.type)
              return (
                <div key={ex.id} className="flex items-center gap-3 bg-cream-100 border border-peach-200 rounded-xl px-3 py-2.5">
                  <span className="text-base">{info?.emoji ?? '🏋️'}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-navy-700">{ex.name ?? info?.label}</p>
                    <p className="text-xs text-warm-400">
                      {ex.duration && `${ex.duration} min`}
                      {ex.duration && ex.reps && ' · '}
                      {ex.reps && `${ex.reps} reps`}
                    </p>
                  </div>
                  <button onClick={() => updateEntry({ exercises: entry.exercises.filter(e => e.id !== ex.id) })}
                    className="p-1 text-peach-300 active:text-brand-500"><Trash2 size={14} /></button>
                </div>
              )
            })}
          </div>

          {addingExercise && (
            <div className="mt-3 space-y-3 pt-3 border-t border-peach-200">
              <div className="flex flex-wrap gap-2">
                {EXERCISE_TYPES.map(e => (
                  <button key={e.type} onClick={() => setExType(e.type)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                      exType === e.type ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-warm-600 border-peach-200'
                    }`}>
                    {e.emoji} {e.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="number" value={exDuration} onChange={e => setExDuration(e.target.value)} placeholder="Duration (min)" className="input-field flex-1" />
                <input type="number" value={exReps} onChange={e => setExReps(e.target.value)} placeholder="Reps" className="input-field flex-1" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setAddingExercise(false)} className="flex-1 py-2.5 rounded-xl bg-peach-100 text-warm-600 text-sm">Cancel</button>
                <button onClick={addExercise} className="flex-1 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-medium">
                  Add {exLabel?.emoji} {exLabel?.label}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
