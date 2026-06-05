import { useState, useEffect } from 'react'
import { Plus, Check, Trash2, Pin } from 'lucide-react'
import { db } from '../../db'
import { today, formatDate } from '../../utils/dates'
import { scoreQuergia } from '../../utils/scoring'
import PageHeader from '../../components/PageHeader'
import type { QuergiaEntry, MasterTask, PlanTask } from '../../types'

const DATE = today()
function genId() { return Math.random().toString(36).slice(2, 10) }
const CATEGORIES = ['Marketing', 'Sales', 'Content', 'Admin', 'Finance', 'Product', 'Strategy', 'Other']

async function getOrCreateQuergia(): Promise<QuergiaEntry> {
  const e = await db.quergia.where('date').equals(DATE).first()
  if (e) return e
  const blank: QuergiaEntry = { date: DATE, tasks: [], revenue: 0, leads: 0, notes: '' }
  const id = await db.quergia.add(blank) as number
  return { ...blank, id }
}

export default function QuergiaPage() {
  const [entry, setEntry] = useState<QuergiaEntry>({ date: DATE, tasks: [], revenue: 0, leads: 0, notes: '' })
  const [masterTasks, setMasterTasks] = useState<MasterTask[]>([])
  const [score, setScore] = useState(0)
  const [tab, setTab] = useState<'today' | 'master'>('today')
  const [addingTask, setAddingTask] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [addingMaster, setAddingMaster] = useState(false)
  const [masterTitle, setMasterTitle] = useState('')
  const [masterCat, setMasterCat] = useState('Other')

  useEffect(() => { load() }, [])

  async function load() {
    const [e, mt] = await Promise.all([getOrCreateQuergia(), db.masterTasks.toArray()])
    setEntry(e); setScore(scoreQuergia(e))
    setMasterTasks(mt.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)))
  }

  async function saveEntry(patch: Partial<QuergiaEntry>) {
    const updated = { ...entry, ...patch }
    setEntry(updated); setScore(scoreQuergia(updated))
    if (updated.id) await db.quergia.update(updated.id, patch)
  }

  async function addDayTask() {
    if (!taskTitle.trim()) return
    const task: PlanTask = { id: genId(), title: taskTitle.trim(), timeOfDay: 'anytime', completed: false, unexpected: false }
    await saveEntry({ tasks: [...entry.tasks, task] })
    setTaskTitle(''); setAddingTask(false)
  }

  async function toggleTask(id: string) {
    await saveEntry({ tasks: entry.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t) })
  }

  async function addFromMaster(mt: MasterTask) {
    if (entry.tasks.find(t => t.fromMaster === mt.id)) return
    const task: PlanTask = { id: genId(), title: mt.title, timeOfDay: 'anytime', fromMaster: mt.id, completed: false, unexpected: false }
    await saveEntry({ tasks: [...entry.tasks, task] })
    setTab('today')
  }

  async function addMasterTask() {
    if (!masterTitle.trim()) return
    const id = await db.masterTasks.add({ title: masterTitle.trim(), category: masterCat, pinned: false, createdAt: DATE }) as number
    setMasterTasks(prev => [{ id, title: masterTitle.trim(), category: masterCat, pinned: false, createdAt: DATE }, ...prev])
    setMasterTitle(''); setAddingMaster(false)
  }

  async function togglePin(mt: MasterTask) {
    if (!mt.id) return
    await db.masterTasks.update(mt.id, { pinned: !mt.pinned })
    setMasterTasks(prev => prev.map(t => t.id === mt.id ? { ...t, pinned: !t.pinned } : t).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)))
  }

  const completed = entry.tasks.filter(t => t.completed).length

  return (
    <div className="flex flex-col min-h-screen bg-cream-100">
      <PageHeader title="QUERGIA" subtitle={formatDate(DATE)} back
        right={<span className="text-sm font-bold px-3 py-1 rounded-lg bg-navy-700/10 text-navy-700">{score}%</span>}
      />
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-4">

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Tasks',   value: `${completed}/${entry.tasks.length}`, color: 'text-navy-700' },
            { label: 'Revenue', value: entry.revenue || '—', color: 'text-emerald-600', editable: true, key: 'revenue' as const },
            { label: 'Leads',   value: entry.leads   || '—', color: 'text-amber-600',   editable: true, key: 'leads'   as const },
          ].map(m => (
            <div key={m.label} className="bg-white border border-peach-200 rounded-xl p-3 text-center">
              <p className="text-xs text-warm-400 mb-1">{m.label}</p>
              {m.editable ? (
                <input type="number" defaultValue={typeof m.value === 'number' ? m.value : ''} placeholder="0"
                  className={`w-full text-center bg-transparent text-base font-bold ${m.color} outline-none`}
                  onBlur={e => { const v = parseInt(e.target.value); if (!isNaN(v)) saveEntry({ [m.key!]: v }) }} />
              ) : (
                <p className={`text-base font-bold ${m.color}`}>{m.value}</p>
              )}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex bg-white border border-peach-200 rounded-xl p-1">
          {(['today', 'master'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t ? 'bg-brand-500 text-white' : 'text-warm-500'
              }`}>
              {t === 'today' ? "Today's Tasks" : 'Master List'}
            </button>
          ))}
        </div>

        {tab === 'today' && (
          <div className="space-y-2">
            {entry.tasks.length === 0 && !addingTask && (
              <p className="text-sm text-warm-400 text-center py-6">No tasks for today.<br /><span className="text-xs">Add from Master List or create new.</span></p>
            )}
            {entry.tasks.map(task => (
              <div key={task.id} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border ${task.completed ? 'bg-cream-100 border-peach-100' : 'bg-white border-peach-200'}`}>
                <button onClick={() => toggleTask(task.id)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${task.completed ? 'bg-emerald-400 border-emerald-400' : 'border-peach-300'}`}>
                  {task.completed && <Check size={12} strokeWidth={3} className="text-white" />}
                </button>
                <span className={`flex-1 text-sm ${task.completed ? 'line-through text-warm-400' : 'text-navy-700'}`}>{task.title}</span>
                <button onClick={() => saveEntry({ tasks: entry.tasks.filter(t => t.id !== task.id) })} className="p-1 text-peach-300 active:text-brand-500"><Trash2 size={14} /></button>
              </div>
            ))}
            {addingTask ? (
              <div className="card space-y-3">
                <input autoFocus value={taskTitle} onChange={e => setTaskTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && addDayTask()} placeholder="Task title..." className="input-field" />
                <div className="flex gap-2">
                  <button onClick={() => setAddingTask(false)} className="flex-1 py-2.5 rounded-xl bg-peach-100 text-warm-600 text-sm">Cancel</button>
                  <button onClick={addDayTask} className="flex-1 py-2.5 rounded-xl bg-brand-500 text-white text-sm">Add</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingTask(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-peach-300 text-brand-500 active:bg-peach-100">
                <Plus size={16} /><span className="text-sm font-medium">Add Task</span>
              </button>
            )}
          </div>
        )}

        {tab === 'master' && (
          <div className="space-y-2">
            {masterTasks.map(mt => {
              const inToday = entry.tasks.some(t => t.fromMaster === mt.id)
              return (
                <div key={mt.id} className="flex items-center gap-3 bg-white border border-peach-200 rounded-xl px-3 py-2.5">
                  <button onClick={() => togglePin(mt)} className={`p-1 ${mt.pinned ? 'text-amber-500' : 'text-peach-300 active:text-amber-500'}`}><Pin size={14} /></button>
                  <div className="flex-1">
                    <p className="text-sm text-navy-700">{mt.title}</p>
                    <p className="text-xs text-warm-400">{mt.category}</p>
                  </div>
                  <button onClick={() => addFromMaster(mt)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium border ${inToday ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-brand-50 text-brand-600 border-brand-100 active:bg-brand-100'}`}>
                    {inToday ? '✓ Added' : '+ Today'}
                  </button>
                  <button onClick={async () => { if (mt.id) { await db.masterTasks.delete(mt.id); setMasterTasks(prev => prev.filter(t => t.id !== mt.id)) } }} className="p-1 text-peach-300 active:text-brand-500"><Trash2 size={14} /></button>
                </div>
              )
            })}
            {addingMaster ? (
              <div className="card space-y-3">
                <input autoFocus value={masterTitle} onChange={e => setMasterTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && addMasterTask()} placeholder="Task title..." className="input-field" />
                <select value={masterCat} onChange={e => setMasterCat(e.target.value)} className="input-field">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <div className="flex gap-2">
                  <button onClick={() => setAddingMaster(false)} className="flex-1 py-2.5 rounded-xl bg-peach-100 text-warm-600 text-sm">Cancel</button>
                  <button onClick={addMasterTask} className="flex-1 py-2.5 rounded-xl bg-brand-500 text-white text-sm">Add to Master</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingMaster(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-peach-300 text-brand-500 active:bg-peach-100">
                <Plus size={16} /><span className="text-sm font-medium">Add to Master List</span>
              </button>
            )}
          </div>
        )}

        {/* Notes */}
        <div className="card">
          <h3 className="font-semibold text-navy-700 mb-3">📝 Business Notes</h3>
          <textarea value={entry.notes} onChange={e => setEntry(prev => ({ ...prev, notes: e.target.value }))}
            onBlur={e => saveEntry({ notes: e.target.value })} placeholder="Notes, ideas, observations..." rows={4} className="input-field resize-none" />
        </div>
      </div>
    </div>
  )
}
