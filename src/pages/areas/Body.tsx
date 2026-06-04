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
  { type: 'yoga', label: 'Yoga', emoji: '🧘' },
  { type: 'shakti', label: 'Shakti Dance', emoji: '💃' },
  { type: 'situps', label: 'Sit-ups', emoji: '🏋️' },
  { type: 'walking', label: 'Walking', emoji: '🚶' },
  { type: 'running', label: 'Running', emoji: '🏃' },
  { type: 'stretching', label: 'Stretching', emoji: '🤸' },
]

function genId() {
  return Math.random().toString(36).slice(2, 10)
}

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
    setEntry(e)
    setScore(scoreBody(e))
    if (e.weight) setWeightInput(String(e.weight))
  }

  async function updateEntry(patch: Partial<BodyEntry>) {
    const updated = { ...entry, ...patch }
    setEntry(updated)
    setScore(scoreBody(updated))
    if (updated.id) {
      await db.body.update(updated.id, patch)
    } else {
      const id = await db.body.add(updated) as number
      setEntry({ ...updated, id })
    }
  }

  async function saveWeight() {
    const w = parseFloat(weightInput)
    if (!isNaN(w) && w > 0) {
      await updateEntry({ weight: w })
    }
  }

  async function addExercise() {
    const ex: Exercise = {
      id: genId(),
      type: exType,
      duration: exDuration ? parseInt(exDuration) : undefined,
      reps: exReps ? parseInt(exReps) : undefined,
    }
    await updateEntry({ exercises: [...entry.exercises, ex] })
    setExDuration('')
    setExReps('')
    setAddingExercise(false)
  }

  async function removeExercise(id: string) {
    await updateEntry({ exercises: entry.exercises.filter(e => e.id !== id) })
  }

  const exLabel = EXERCISE_TYPES.find(e => e.type === exType)

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <PageHeader
        title="Body"
        subtitle={formatDate(DATE)}
        back
        right={
          <span className={`text-sm font-bold px-3 py-1 rounded-lg ${score >= 70 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-brand-500/20 text-brand-400'}`}>
            {score}%
          </span>
        }
      />

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-4">
        {/* Water */}
        <div className="bg-slate-900 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Droplets size={18} className="text-cyan-400" />
            <h3 className="font-semibold text-slate-200">Water Intake</h3>
            <span className="ml-auto text-xs text-slate-500">Goal: 2.5 L</span>
          </div>
          <ProgressBar value={entry.water} max={2.5} color="#06b6d4" unit="L" />
          <div className="flex gap-2 mt-3">
            {[0.1, 0.2, 0.3, 0.5].map(v => (
              <button
                key={v}
                onClick={() => updateEntry({ water: Math.round((entry.water + v) * 10) / 10 })}
                className="flex-1 py-2 rounded-xl bg-cyan-500/15 text-cyan-400 text-xs font-semibold active:bg-cyan-500/25"
              >
                +{v}L
              </button>
            ))}
          </div>
          <button
            onClick={() => updateEntry({ water: 0 })}
            className="mt-2 text-xs text-slate-600 active:text-slate-400 w-full text-center"
          >
            Reset
          </button>
        </div>

        {/* Steps */}
        <div className="bg-slate-900 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Footprints size={18} className="text-emerald-400" />
            <h3 className="font-semibold text-slate-200">Steps</h3>
            <span className="ml-auto text-xs text-slate-500">Goal: 10,000</span>
          </div>
          <ProgressBar value={entry.steps} max={10000} color="#10b981" />
          <div className="flex gap-2 mt-3">
            {[500, 1000, 2000, 5000].map(v => (
              <button
                key={v}
                onClick={() => updateEntry({ steps: entry.steps + v })}
                className="flex-1 py-2 rounded-xl bg-emerald-500/15 text-emerald-400 text-xs font-semibold active:bg-emerald-500/25"
              >
                +{v >= 1000 ? `${v / 1000}k` : v}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              type="number"
              placeholder="Enter exact steps"
              className="input-field flex-1"
              onBlur={e => {
                const v = parseInt(e.target.value)
                if (!isNaN(v)) { updateEntry({ steps: v }); e.target.value = '' }
              }}
            />
          </div>
        </div>

        {/* Weight */}
        <div className="bg-slate-900 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Weight size={18} className="text-purple-400" />
            <h3 className="font-semibold text-slate-200">Weight</h3>
          </div>
          <div className="flex gap-3">
            <input
              type="number"
              step="0.1"
              value={weightInput}
              onChange={e => setWeightInput(e.target.value)}
              placeholder="e.g. 70.5"
              className="input-field flex-1"
            />
            <button onClick={saveWeight} className="px-4 py-2.5 rounded-xl bg-purple-500/20 text-purple-400 text-sm font-medium active:bg-purple-500/30">
              Save
            </button>
          </div>
          {entry.weight && (
            <p className="text-sm text-slate-400 mt-2">Today: <span className="text-slate-200 font-semibold">{entry.weight} kg</span></p>
          )}
        </div>

        {/* Exercises */}
        <div className="bg-slate-900 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-200">Exercise Log</h3>
            <button onClick={() => setAddingExercise(true)} className="flex items-center gap-1 text-xs text-brand-400 active:text-brand-300">
              <Plus size={14} /> Add
            </button>
          </div>

          {entry.exercises.length === 0 && !addingExercise && (
            <p className="text-sm text-slate-600 text-center py-4">No exercises logged yet</p>
          )}

          <div className="space-y-2">
            {entry.exercises.map(ex => {
              const info = EXERCISE_TYPES.find(e => e.type === ex.type)
              return (
                <div key={ex.id} className="flex items-center gap-3 bg-slate-800 rounded-xl px-3 py-2.5">
                  <span className="text-base">{info?.emoji ?? '🏋️'}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-200">{ex.name ?? info?.label}</p>
                    <p className="text-xs text-slate-500">
                      {ex.duration && `${ex.duration} min`}
                      {ex.duration && ex.reps && ' · '}
                      {ex.reps && `${ex.reps} reps`}
                    </p>
                  </div>
                  <button onClick={() => removeExercise(ex.id)} className="p-1 text-slate-700 active:text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            })}
          </div>

          {addingExercise && (
            <div className="mt-3 space-y-3 pt-3 border-t border-slate-800">
              <div className="flex flex-wrap gap-2">
                {EXERCISE_TYPES.map(e => (
                  <button
                    key={e.type}
                    onClick={() => setExType(e.type)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      exType === e.type ? 'bg-brand-500 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {e.emoji} {e.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={exDuration}
                  onChange={e => setExDuration(e.target.value)}
                  placeholder="Duration (min)"
                  className="input-field flex-1"
                />
                <input
                  type="number"
                  value={exReps}
                  onChange={e => setExReps(e.target.value)}
                  placeholder="Reps"
                  className="input-field flex-1"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setAddingExercise(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-400 text-sm">Cancel</button>
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
