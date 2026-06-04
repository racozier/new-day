import { useState, useEffect } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp, Image } from 'lucide-react'
import { db } from '../db'
import PageHeader from '../components/PageHeader'
import type { InspirationFigure, VisionImage } from '../types'

export default function InspirationPage() {
  const [tab, setTab] = useState<'figures' | 'vision'>('figures')
  const [figures, setFigures] = useState<InspirationFigure[]>([])
  const [visions, setVisions] = useState<VisionImage[]>([])
  const [expanded, setExpanded] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', bio: '', quote: '', area: '' })

  useEffect(() => { load() }, [tab])

  async function load() {
    if (tab === 'figures') {
      setFigures(await db.inspirationFigures.toArray())
    } else {
      setVisions(await db.visionImages.toArray())
    }
  }

  async function addFigure() {
    if (!form.name.trim()) return
    const fig: Omit<InspirationFigure, 'id'> = {
      name: form.name.trim(),
      bio: form.bio,
      achievements: [],
      quotes: form.quote ? [form.quote] : [],
      area: form.area ? form.area.split(',').map(s => s.trim()) : [],
      isCustom: true,
    }
    const id = await db.inspirationFigures.add(fig) as number
    setFigures(prev => [...prev, { ...fig, id }])
    setForm({ name: '', bio: '', quote: '', area: '' })
    setAdding(false)
  }

  async function deleteFigure(id: number) {
    await db.inspirationFigures.delete(id)
    setFigures(prev => prev.filter(f => f.id !== id))
  }

  async function addVisionImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async ev => {
      const imageData = ev.target?.result as string
      const img: Omit<VisionImage, 'id'> = {
        title: file.name.replace(/\.[^.]+$/, ''),
        imageData,
        category: 'vision',
        addedAt: new Date().toISOString(),
      }
      const id = await db.visionImages.add(img) as number
      setVisions(prev => [...prev, { ...img, id }])
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <PageHeader title="Inspiration" back />
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-4">
        <div className="flex bg-slate-900 rounded-xl p-1">
          {(['figures', 'vision'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-brand-500 text-white' : 'text-slate-400'}`}>
              {t === 'figures' ? '🌟 Figures' : '🖼️ Vision Board'}
            </button>
          ))}
        </div>

        {tab === 'figures' && (
          <div className="space-y-3">
            {figures.map(fig => (
              <div key={fig.id} className="bg-slate-900 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpanded(expanded === fig.id ? null : (fig.id ?? null))}
                  className="w-full flex items-center gap-3 p-4 active:bg-slate-800 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {fig.name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-100 text-sm">{fig.name}</p>
                    <p className="text-xs text-slate-500 line-clamp-1">{fig.bio}</p>
                  </div>
                  {expanded === fig.id ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                </button>
                {expanded === fig.id && (
                  <div className="px-4 pb-4 border-t border-slate-800 space-y-3">
                    {fig.bio && <p className="text-sm text-slate-300 leading-relaxed pt-3">{fig.bio}</p>}
                    {fig.achievements.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Achievements</p>
                        {fig.achievements.map((a, i) => (
                          <p key={i} className="text-sm text-slate-300 flex gap-2"><span className="text-brand-400">✦</span>{a}</p>
                        ))}
                      </div>
                    )}
                    {fig.quotes.length > 0 && (
                      <div className="bg-slate-800 rounded-xl p-3">
                        <p className="text-sm text-slate-200 italic">"{fig.quotes[0]}"</p>
                        <p className="text-xs text-slate-500 mt-1">— {fig.name}</p>
                      </div>
                    )}
                    {fig.isCustom && (
                      <button onClick={() => fig.id && deleteFigure(fig.id)} className="flex items-center gap-1.5 text-xs text-red-500/60 active:text-red-400">
                        <Trash2 size={12} /> Remove
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}

            {adding ? (
              <div className="bg-slate-900 rounded-2xl p-4 space-y-3">
                <h3 className="font-semibold text-slate-200 text-sm">Add Inspiration Figure</h3>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Name *" className="input-field" />
                <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Short biography" rows={3} className="input-field resize-none" />
                <input value={form.quote} onChange={e => setForm(f => ({ ...f, quote: e.target.value }))} placeholder='Favourite quote (e.g. "Stay hungry...")' className="input-field" />
                <input value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} placeholder="Life areas (comma-separated, e.g. body, mental)" className="input-field" />
                <div className="flex gap-2">
                  <button onClick={() => setAdding(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-400 text-sm">Cancel</button>
                  <button onClick={addFigure} className="flex-1 py-2.5 rounded-xl bg-brand-500 text-white text-sm">Add Figure</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAdding(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 active:bg-brand-500/20">
                <Plus size={18} /><span className="text-sm font-medium">Add Custom Figure</span>
              </button>
            )}
          </div>
        )}

        {tab === 'vision' && (
          <div>
            <div className="grid grid-cols-2 gap-3">
              {visions.map(v => (
                <div key={v.id} className="relative rounded-2xl overflow-hidden aspect-square bg-slate-800">
                  <img src={v.imageData} alt={v.title} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 p-2">
                    <p className="text-xs text-white font-medium truncate">{v.title}</p>
                  </div>
                  <button
                    onClick={async () => { if (v.id) { await db.visionImages.delete(v.id); setVisions(prev => prev.filter(x => x.id !== v.id)) } }}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white/70 active:text-white"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              <label className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900 cursor-pointer active:bg-slate-800 transition-colors">
                <Image size={28} className="text-slate-600 mb-2" />
                <span className="text-xs text-slate-500">Add Image</span>
                <input type="file" accept="image/*" className="hidden" onChange={addVisionImage} />
              </label>
            </div>
            {visions.length === 0 && (
              <p className="text-center text-sm text-slate-600 mt-6">
                Your vision board is empty.<br />Upload images that inspire you.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
