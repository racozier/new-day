import { useState, useEffect } from 'react'
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { db } from '../../db'
import { today, formatDate } from '../../utils/dates'
import { scoreFinances } from '../../utils/scoring'
import PageHeader from '../../components/PageHeader'
import type { FinanceEntry, ExpenseItem, LearningItem } from '../../types'

const DATE = today()

function genId() { return Math.random().toString(36).slice(2, 10) }

const CATEGORIES = ['Food', 'Transport', 'Health', 'Education', 'Entertainment', 'Business', 'Other']
const LEARNING_TYPES: LearningItem['type'][] = ['course', 'book', 'podcast', 'video', 'article']

async function getOrCreate(): Promise<FinanceEntry> {
  const e = await db.finances.where('date').equals(DATE).first()
  if (e) return e
  const blank: FinanceEntry = { date: DATE, income: 0, expenses: [], learningItems: [] }
  const id = await db.finances.add(blank) as number
  return { ...blank, id }
}

export default function FinancesPage() {
  const [entry, setEntry] = useState<FinanceEntry>({ date: DATE, income: 0, expenses: [], learningItems: [] })
  const [score, setScore] = useState(0)
  const [incomeInput, setIncomeInput] = useState('')
  const [addingExpense, setAddingExpense] = useState(false)
  const [expLabel, setExpLabel] = useState('')
  const [expAmount, setExpAmount] = useState('')
  const [expCat, setExpCat] = useState('Other')
  const [addingLearn, setAddingLearn] = useState(false)
  const [learnTitle, setLearnTitle] = useState('')
  const [learnType, setLearnType] = useState<LearningItem['type']>('course')

  useEffect(() => { load() }, [])

  async function load() {
    const e = await getOrCreate()
    setEntry(e)
    setScore(scoreFinances(e))
    if (e.income) setIncomeInput(String(e.income))
  }

  async function save(patch: Partial<FinanceEntry>) {
    const updated = { ...entry, ...patch }
    setEntry(updated)
    setScore(scoreFinances(updated))
    if (updated.id) await db.finances.update(updated.id, patch)
  }

  async function saveIncome() {
    const v = parseFloat(incomeInput)
    if (!isNaN(v)) await save({ income: v })
  }

  async function addExpense() {
    if (!expLabel.trim() || !expAmount) return
    const item: ExpenseItem = { id: genId(), label: expLabel.trim(), amount: parseFloat(expAmount), category: expCat }
    await save({ expenses: [...entry.expenses, item] })
    setExpLabel(''); setExpAmount(''); setAddingExpense(false)
  }

  async function addLearn() {
    if (!learnTitle.trim()) return
    const item: LearningItem = { id: genId(), title: learnTitle.trim(), type: learnType, area: 'finance' }
    await save({ learningItems: [...entry.learningItems, item] })
    setLearnTitle(''); setAddingLearn(false)
  }

  const totalExpenses = entry.expenses.reduce((s, e) => s + e.amount, 0)
  const balance = entry.income - totalExpenses

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <PageHeader
        title="Finances"
        subtitle={formatDate(DATE)}
        back
        right={<span className="text-sm font-bold px-3 py-1 rounded-lg bg-amber-500/20 text-amber-400">{score}%</span>}
      />
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Income', value: entry.income, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Expenses', value: totalExpenses, color: 'text-red-400', bg: 'bg-red-500/10' },
            { label: 'Balance', value: balance, color: balance >= 0 ? 'text-brand-400' : 'text-red-400', bg: 'bg-slate-800' },
          ].map(c => (
            <div key={c.label} className={`${c.bg} rounded-xl p-3 text-center`}>
              <p className="text-xs text-slate-500 mb-1">{c.label}</p>
              <p className={`text-base font-bold ${c.color}`}>{balance < 0 && c.label === 'Balance' ? '-' : '+'}{Math.abs(c.value).toFixed(0)}</p>
            </div>
          ))}
        </div>

        {/* Income */}
        <div className="bg-slate-900 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="text-emerald-400" />
            <h3 className="font-semibold text-slate-200">Income Today</h3>
          </div>
          <div className="flex gap-2">
            <input type="number" value={incomeInput} onChange={e => setIncomeInput(e.target.value)} placeholder="0.00" className="input-field flex-1" />
            <button onClick={saveIncome} className="px-4 rounded-xl bg-emerald-500/20 text-emerald-400 text-sm font-medium active:bg-emerald-500/30">Save</button>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-slate-900 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingDown size={18} className="text-red-400" />
              <h3 className="font-semibold text-slate-200">Expenses</h3>
            </div>
            <button onClick={() => setAddingExpense(true)} className="text-xs text-brand-400 flex items-center gap-1"><Plus size={14} />Add</button>
          </div>
          {entry.expenses.length === 0 && !addingExpense && <p className="text-sm text-slate-600 text-center py-3">No expenses logged</p>}
          <div className="space-y-2">
            {entry.expenses.map(exp => (
              <div key={exp.id} className="flex items-center gap-3 bg-slate-800 rounded-xl px-3 py-2.5">
                <div className="flex-1">
                  <p className="text-sm text-slate-200">{exp.label}</p>
                  <p className="text-xs text-slate-500">{exp.category}</p>
                </div>
                <span className="text-sm font-semibold text-red-400">-{exp.amount.toFixed(2)}</span>
                <button onClick={() => save({ expenses: entry.expenses.filter(e => e.id !== exp.id) })} className="p-1 text-slate-700 active:text-red-400"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
          {addingExpense && (
            <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
              <input value={expLabel} onChange={e => setExpLabel(e.target.value)} placeholder="Description" className="input-field" />
              <div className="flex gap-2">
                <input type="number" value={expAmount} onChange={e => setExpAmount(e.target.value)} placeholder="Amount" className="input-field flex-1" />
                <select value={expCat} onChange={e => setExpCat(e.target.value)} className="input-field flex-1">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setAddingExpense(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-400 text-sm">Cancel</button>
                <button onClick={addExpense} className="flex-1 py-2.5 rounded-xl bg-brand-500 text-white text-sm">Add</button>
              </div>
            </div>
          )}
        </div>

        {/* Learning */}
        <div className="bg-slate-900 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-200">📚 Learning</h3>
            <button onClick={() => setAddingLearn(true)} className="text-xs text-brand-400 flex items-center gap-1"><Plus size={14} />Add</button>
          </div>
          {entry.learningItems.length === 0 && !addingLearn && <p className="text-sm text-slate-600 text-center py-3">No learning items</p>}
          <div className="space-y-2">
            {entry.learningItems.map(item => (
              <div key={item.id} className="flex items-center gap-3 bg-slate-800 rounded-xl px-3 py-2.5">
                <span className="text-sm">{item.type === 'course' ? '🎓' : item.type === 'book' ? '📖' : '🎧'}</span>
                <p className="flex-1 text-sm text-slate-200">{item.title}</p>
                <button onClick={() => save({ learningItems: entry.learningItems.filter(l => l.id !== item.id) })} className="p-1 text-slate-700 active:text-red-400"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
          {addingLearn && (
            <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
              <input value={learnTitle} onChange={e => setLearnTitle(e.target.value)} placeholder="Title" className="input-field" />
              <div className="flex gap-1.5 flex-wrap">
                {LEARNING_TYPES.map(t => (
                  <button key={t} onClick={() => setLearnType(t)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${learnType === t ? 'bg-brand-500 text-white' : 'bg-slate-800 text-slate-400'}`}>{t}</button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setAddingLearn(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-400 text-sm">Cancel</button>
                <button onClick={addLearn} className="flex-1 py-2.5 rounded-xl bg-brand-500 text-white text-sm">Add</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
