import { useState, useEffect, useCallback } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { db, getOrCreateReflection } from '../db'
import { today, formatDate } from '../utils/dates'
import PageHeader from '../components/PageHeader'
import type { ReflectionEntry, Decision } from '../types'

const DATE = today()
function genId() { return Math.random().toString(36).slice(2, 10) }

interface SectionProps {
  title: string
  emoji: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}

function Section({ title, emoji, open, onToggle, children }: SectionProps) {
  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center gap-3 p-4 active:bg-slate-800 transition-colors text-left">
        <span className="text-lg">{emoji}</span>
        <span className="flex-1 font-semibold text-slate-200 text-sm">{title}</span>
        {open ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
      </button>
      {open && <div className="px-4 pb-4 space-y-3 border-t border-slate-800">{children}</div>}
    </div>
  )
}

function Textarea({ label, value, onChange, placeholder }: { label?: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      {label && <p className="label mt-3">{label}</p>}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="input-field resize-none mt-1"
      />
    </div>
  )
}

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex justify-between items-center mt-3 mb-1">
        <p className="text-xs text-slate-400">{label}</p>
        <span className={`text-sm font-bold ${value >= 7 ? 'text-emerald-400' : value >= 4 ? 'text-amber-400' : 'text-red-400'}`}>{value}/10</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-brand-500"
      />
    </div>
  )
}

export default function ReflectionPage() {
  const [entry, setEntry] = useState<ReflectionEntry>({
    date: DATE, lessons: '', beliefs: '', strengths: [], weaknesses: [],
    didWell: '', improve: '', actions: [], decisions: [],
    giftEvent: '', giftPerspective: '',
    playToWin: 5, focused: 5, conscious: 5, intentional: 5,
  })
  const [open, setOpen] = useState<Record<string, boolean>>({ learning: true })
  const [newStrength, setNewStrength] = useState('')
  const [newWeakness, setNewWeakness] = useState('')
  const [newAction, setNewAction] = useState('')
  const [newDecision, setNewDecision] = useState('')
  const [saveTimer, setSaveTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    const e = await getOrCreateReflection(DATE)
    setEntry(e)
  }

  const autoSave = useCallback((updated: ReflectionEntry) => {
    if (saveTimer) clearTimeout(saveTimer)
    const t = setTimeout(async () => {
      if (updated.id) await db.reflections.update(updated.id, updated)
    }, 800)
    setSaveTimer(t)
  }, [saveTimer])

  function update(patch: Partial<ReflectionEntry>) {
    const updated = { ...entry, ...patch }
    setEntry(updated)
    autoSave(updated)
  }

  function toggleSection(key: string) {
    setOpen(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function addToList(key: 'strengths' | 'weaknesses' | 'actions', val: string, clear: () => void) {
    if (!val.trim()) return
    update({ [key]: [...entry[key], val.trim()] })
    clear()
  }

  function removeFromList(key: 'strengths' | 'weaknesses' | 'actions', index: number) {
    update({ [key]: entry[key].filter((_, i) => i !== index) })
  }

  function addDecision() {
    if (!newDecision.trim()) return
    const d: Decision = { id: genId(), description: newDecision.trim(), outcome: 'pending', lesson: '' }
    update({ decisions: [...entry.decisions, d] })
    setNewDecision('')
  }

  function updateDecision(id: string, patch: Partial<Decision>) {
    update({ decisions: entry.decisions.map(d => d.id === id ? { ...d, ...patch } : d) })
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <PageHeader title="Daily Reflection" subtitle={formatDate(DATE)} />
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-3">

        <Section title="Learning & Awareness" emoji="🧠" open={!!open.learning} onToggle={() => toggleSection('learning')}>
          <Textarea label="What did this day teach me?" value={entry.lessons} onChange={v => update({ lessons: v })} placeholder="Today I learned..." />
          <Textarea label="What subconscious belief did I recognize?" value={entry.beliefs} onChange={v => update({ beliefs: v })} placeholder="I noticed that I believe..." />
        </Section>

        <Section title="Strengths & Weaknesses" emoji="⚖️" open={!!open.sw} onToggle={() => toggleSection('sw')}>
          <div className="mt-3">
            <p className="label">Strengths revealed today</p>
            <div className="space-y-1.5">
              {entry.strengths.map((s, i) => (
                <div key={i} className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2">
                  <span className="text-xs text-emerald-400">✦</span>
                  <span className="flex-1 text-sm text-slate-200">{s}</span>
                  <button onClick={() => removeFromList('strengths', i)} className="p-0.5 text-slate-700 active:text-red-400"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input value={newStrength} onChange={e => setNewStrength(e.target.value)} onKeyDown={e => e.key === 'Enter' && addToList('strengths', newStrength, () => setNewStrength(''))} placeholder="Add strength..." className="input-field flex-1 text-sm" />
              <button onClick={() => addToList('strengths', newStrength, () => setNewStrength(''))} className="px-3 rounded-xl bg-emerald-500/20 text-emerald-400 active:bg-emerald-500/30"><Plus size={16} /></button>
            </div>
          </div>
          <div className="mt-3">
            <p className="label">Weaknesses revealed today</p>
            <div className="space-y-1.5">
              {entry.weaknesses.map((w, i) => (
                <div key={i} className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2">
                  <span className="text-xs text-red-400">✦</span>
                  <span className="flex-1 text-sm text-slate-200">{w}</span>
                  <button onClick={() => removeFromList('weaknesses', i)} className="p-0.5 text-slate-700 active:text-red-400"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input value={newWeakness} onChange={e => setNewWeakness(e.target.value)} onKeyDown={e => e.key === 'Enter' && addToList('weaknesses', newWeakness, () => setNewWeakness(''))} placeholder="Add weakness..." className="input-field flex-1 text-sm" />
              <button onClick={() => addToList('weaknesses', newWeakness, () => setNewWeakness(''))} className="px-3 rounded-xl bg-red-500/20 text-red-400 active:bg-red-500/30"><Plus size={16} /></button>
            </div>
          </div>
        </Section>

        <Section title="Performance Evaluation" emoji="📊" open={!!open.perf} onToggle={() => toggleSection('perf')}>
          <Textarea label="What did I do well?" value={entry.didWell} onChange={v => update({ didWell: v })} placeholder="I performed well at..." />
          <Textarea label="What needs improvement?" value={entry.improve} onChange={v => update({ improve: v })} placeholder="I could improve on..." />
        </Section>

        <Section title="Actions & Implementation" emoji="⚡" open={!!open.actions} onToggle={() => toggleSection('actions')}>
          <div className="mt-3 space-y-1.5">
            {entry.actions.map((a, i) => (
              <div key={i} className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2">
                <span className="text-xs text-brand-400">→</span>
                <span className="flex-1 text-sm text-slate-200">{a}</span>
                <button onClick={() => removeFromList('actions', i)} className="p-0.5 text-slate-700 active:text-red-400"><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <input value={newAction} onChange={e => setNewAction(e.target.value)} onKeyDown={e => e.key === 'Enter' && addToList('actions', newAction, () => setNewAction(''))} placeholder="Action to take..." className="input-field flex-1 text-sm" />
            <button onClick={() => addToList('actions', newAction, () => setNewAction(''))} className="px-3 rounded-xl bg-brand-500/20 text-brand-400 active:bg-brand-500/30"><Plus size={16} /></button>
          </div>
        </Section>

        <Section title="Decision Analysis" emoji="🎯" open={!!open.decisions} onToggle={() => toggleSection('decisions')}>
          <div className="mt-3 space-y-3">
            {entry.decisions.map(d => (
              <div key={d.id} className="bg-slate-800 rounded-xl p-3 space-y-2">
                <p className="text-sm text-slate-200">{d.description}</p>
                <div className="flex gap-2">
                  {(['correct', 'incorrect', 'pending'] as const).map(o => (
                    <button key={o} onClick={() => updateDecision(d.id, { outcome: o })}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${d.outcome === o
                        ? o === 'correct' ? 'bg-emerald-500/30 text-emerald-400' : o === 'incorrect' ? 'bg-red-500/30 text-red-400' : 'bg-slate-600 text-slate-200'
                        : 'bg-slate-700 text-slate-500'}`}>
                      {o === 'correct' ? '✓ Yes' : o === 'incorrect' ? '✗ No' : '⏳ Pending'}
                    </button>
                  ))}
                </div>
                <input value={d.lesson} onChange={e => updateDecision(d.id, { lesson: e.target.value })} placeholder="Lesson learned..." className="input-field text-xs" />
                <button onClick={() => update({ decisions: entry.decisions.filter(x => x.id !== d.id) })} className="text-xs text-slate-700 active:text-red-400 flex items-center gap-1"><Trash2 size={12} /> Remove</button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <input value={newDecision} onChange={e => setNewDecision(e.target.value)} onKeyDown={e => e.key === 'Enter' && addDecision()} placeholder="Describe a decision you made..." className="input-field flex-1 text-sm" />
            <button onClick={addDecision} className="px-3 rounded-xl bg-brand-500/20 text-brand-400 active:bg-brand-500/30"><Plus size={16} /></button>
          </div>
        </Section>

        <Section title="Reframing — The Gift" emoji="🎁" open={!!open.gift} onToggle={() => toggleSection('gift')}>
          <Textarea label="Today's event or challenge" value={entry.giftEvent} onChange={v => update({ giftEvent: v })} placeholder="Something difficult happened..." />
          <Textarea label="What can I do with this so it works to my advantage?" value={entry.giftPerspective} onChange={v => update({ giftPerspective: v })} placeholder="I can use this as..." />
        </Section>

        <Section title="Mental State" emoji="🧭" open={!!open.mental} onToggle={() => toggleSection('mental')}>
          <Slider label="Did I play to WIN (not just to avoid losing)?" value={entry.playToWin} onChange={v => update({ playToWin: v })} />
          <Slider label="Was I focused on the goal?" value={entry.focused} onChange={v => update({ focused: v })} />
          <Slider label="Did I act consciously?" value={entry.conscious} onChange={v => update({ conscious: v })} />
          <Slider label="Did I act with intention?" value={entry.intentional} onChange={v => update({ intentional: v })} />
          <p className="text-xs text-slate-600 mt-3 text-center">Auto-saved as you type</p>
        </Section>
      </div>
    </div>
  )
}
