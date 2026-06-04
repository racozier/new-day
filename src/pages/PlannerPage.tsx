import { useState, useEffect } from 'react'
import { Plus, Check, X, Zap } from 'lucide-react'
import { db, getOrCreateDayPlan } from '../db'
import { today, formatDate } from '../utils/dates'
import PageHeader from '../components/PageHeader'
import type { PlanTask, DayPlan } from '../types'

const DATE = today()
const TIME_SLOTS: PlanTask['timeOfDay'][] = ['morning', 'afternoon', 'evening', 'anytime']
const TIME_LABELS: Record<PlanTask['timeOfDay'], string> = {
  morning: '🌅 Morning',
  afternoon: '☀️ Afternoon',
  evening: '🌙 Evening',
  anytime: '📌 Anytime',
}

function genId() {
  return Math.random().toString(36).slice(2, 10)
}

export default function PlannerPage() {
  const [plan, setPlan] = useState<DayPlan>({ date: DATE, tasks: [] })
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newTime, setNewTime] = useState<PlanTask['timeOfDay']>('morning')

  useEffect(() => { loadPlan() }, [])

  async function loadPlan() {
    const p = await getOrCreateDayPlan(DATE)
    setPlan(p)
  }

  async function savePlan(updated: DayPlan) {
    setPlan(updated)
    if (updated.id) {
      await db.dayPlans.update(updated.id, { tasks: updated.tasks })
    }
  }

  async function addTask() {
    if (!newTitle.trim()) return
    const task: PlanTask = {
      id: genId(),
      title: newTitle.trim(),
      timeOfDay: newTime,
      completed: false,
      unexpected: false,
    }
    await savePlan({ ...plan, tasks: [...plan.tasks, task] })
    setNewTitle('')
    setAdding(false)
  }

  async function toggleComplete(id: string) {
    const tasks = plan.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    await savePlan({ ...plan, tasks })
  }

  async function removeTask(id: string) {
    const tasks = plan.tasks.filter(t => t.id !== id)
    await savePlan({ ...plan, tasks })
  }

  async function addUnexpected() {
    const title = prompt('What unexpected happened?')
    if (!title) return
    const task: PlanTask = {
      id: genId(),
      title,
      timeOfDay: 'anytime',
      completed: true,
      unexpected: true,
    }
    await savePlan({ ...plan, tasks: [...plan.tasks, task] })
  }

  const total = plan.tasks.filter(t => !t.unexpected).length
  const completed = plan.tasks.filter(t => t.completed && !t.unexpected).length
  const completion = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <PageHeader title="Daily Planner" subtitle={formatDate(DATE)} />

      {/* Completion summary */}
      {total > 0 && (
        <div className="mx-4 mt-4 bg-slate-900 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">{completed} / {total} tasks</span>
            <span className={`text-sm font-bold ${completion >= 75 ? 'text-emerald-400' : completion >= 40 ? 'text-amber-400' : 'text-slate-400'}`}>{completion}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${completion}%`,
                backgroundColor: completion >= 75 ? '#10b981' : completion >= 40 ? '#f59e0b' : '#6366f1'
              }}
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-4">
        {TIME_SLOTS.map(slot => {
          const tasks = plan.tasks.filter(t => t.timeOfDay === slot && !t.unexpected)
          return (
            <div key={slot}>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{TIME_LABELS[slot]}</h3>
              <div className="space-y-2">
                {tasks.length === 0 && (
                  <p className="text-xs text-slate-600 italic pl-2">No tasks</p>
                )}
                {tasks.map(task => (
                  <TaskRow key={task.id} task={task} onToggle={toggleComplete} onRemove={removeTask} />
                ))}
              </div>
            </div>
          )
        })}

        {/* Unexpected */}
        {plan.tasks.filter(t => t.unexpected).length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-amber-500/70 uppercase tracking-wider mb-2">⚡ Unexpected</h3>
            <div className="space-y-2">
              {plan.tasks.filter(t => t.unexpected).map(task => (
                <TaskRow key={task.id} task={task} onToggle={toggleComplete} onRemove={removeTask} />
              ))}
            </div>
          </div>
        )}

        {/* Add task form */}
        {adding ? (
          <div className="bg-slate-900 rounded-2xl p-4 space-y-3">
            <input
              autoFocus
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTask()}
              placeholder="Task title..."
              className="input-field"
            />
            <div className="flex gap-2 flex-wrap">
              {TIME_SLOTS.map(s => (
                <button
                  key={s}
                  onClick={() => setNewTime(s)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${newTime === s ? 'bg-brand-500 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  {TIME_LABELS[s]}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setAdding(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-400 text-sm">Cancel</button>
              <button onClick={addTask} className="flex-1 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-medium">Add Task</button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setAdding(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 active:bg-brand-500/20 transition-colors"
            >
              <Plus size={18} />
              <span className="text-sm font-medium">Add Task</span>
            </button>
            <button
              onClick={addUnexpected}
              className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 active:bg-amber-500/20 transition-colors"
            >
              <Zap size={16} />
              <span className="text-xs font-medium">Unexpected</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function TaskRow({ task, onToggle, onRemove }: {
  task: PlanTask
  onToggle: (id: string) => void
  onRemove: (id: string) => void
}) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
      task.completed ? 'bg-slate-900/40' : 'bg-slate-900'
    } ${task.unexpected ? 'border border-amber-500/20' : ''}`}>
      <button
        onClick={() => onToggle(task.id)}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'
        }`}
      >
        {task.completed && <Check size={12} strokeWidth={3} className="text-white" />}
      </button>
      <span className={`flex-1 text-sm ${task.completed ? 'line-through text-slate-600' : 'text-slate-200'}`}>
        {task.title}
      </span>
      <button onClick={() => onRemove(task.id)} className="p-1 text-slate-700 active:text-slate-400">
        <X size={14} />
      </button>
    </div>
  )
}
