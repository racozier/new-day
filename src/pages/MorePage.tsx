import { useNavigate } from 'react-router-dom'
import { BarChart3, Sparkles, Download, Upload, ChevronRight } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { db } from '../db'

async function exportData() {
  const [body, finances, mental, relationships, quergia, dayPlans, reflections] = await Promise.all([
    db.body.toArray(), db.finances.toArray(), db.mental.toArray(),
    db.relationships.toArray(), db.quergia.toArray(), db.dayPlans.toArray(), db.reflections.toArray(),
  ])
  const data = { body, finances, mental, relationships, quergia, dayPlans, reflections, exportedAt: new Date().toISOString() }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `new-day-export-${new Date().toISOString().split('T')[0]}.json`; a.click()
  URL.revokeObjectURL(url)
}

const items = [
  { icon: BarChart3,  label: 'Analytics',         desc: 'Charts, trends, correlations', to: '/more/analytics',   color: 'text-navy-700',   bg: 'bg-navy-700/8' },
  { icon: Sparkles,   label: 'Inspiration Library', desc: 'Vision board & figures',      to: '/more/inspiration', color: 'text-brand-500',  bg: 'bg-brand-50' },
]

export default function MorePage() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col min-h-screen bg-cream-100">
      <PageHeader title="More" />
      <div className="px-4 py-4 space-y-3">
        {items.map(item => (
          <button key={item.to} onClick={() => navigate(item.to)}
            className="w-full flex items-center gap-4 bg-white border border-peach-200 rounded-2xl p-4 active:bg-cream-100 transition-colors text-left">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bg} flex-shrink-0`}>
              <item.icon size={22} className={item.color} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-navy-700">{item.label}</p>
              <p className="text-xs text-warm-400 mt-0.5">{item.desc}</p>
            </div>
            <ChevronRight size={18} className="text-peach-300 flex-shrink-0" />
          </button>
        ))}

        {/* Data */}
        <div className="bg-white border border-peach-200 rounded-2xl p-4 mt-2">
          <h3 className="font-semibold text-navy-700 mb-3 text-sm">Data</h3>
          <div className="space-y-2">
            <button onClick={exportData}
              className="w-full flex items-center gap-3 py-3 px-4 rounded-xl bg-cream-100 border border-peach-200 active:bg-peach-100 transition-colors">
              <Download size={18} className="text-emerald-500" />
              <div className="text-left">
                <p className="text-sm text-navy-700">Export Data</p>
                <p className="text-xs text-warm-400">Download all entries as JSON</p>
              </div>
            </button>
            <label className="w-full flex items-center gap-3 py-3 px-4 rounded-xl bg-cream-100 border border-peach-200 active:bg-peach-100 transition-colors cursor-pointer">
              <Upload size={18} className="text-brand-500" />
              <div className="text-left">
                <p className="text-sm text-navy-700">Import Data</p>
                <p className="text-xs text-warm-400">Restore from JSON backup</p>
              </div>
              <input type="file" accept=".json" className="hidden" onChange={async e => {
                const file = e.target.files?.[0]; if (!file) return
                try {
                  const text = await file.text(); const data = JSON.parse(text)
                  if (data.body) await db.body.bulkPut(data.body)
                  if (data.finances) await db.finances.bulkPut(data.finances)
                  if (data.mental) await db.mental.bulkPut(data.mental)
                  if (data.relationships) await db.relationships.bulkPut(data.relationships)
                  if (data.quergia) await db.quergia.bulkPut(data.quergia)
                  if (data.dayPlans) await db.dayPlans.bulkPut(data.dayPlans)
                  if (data.reflections) await db.reflections.bulkPut(data.reflections)
                  alert('Data imported successfully!')
                } catch { alert('Failed to import data. Check the file format.') }
              }} />
            </label>
          </div>
        </div>

        <p className="text-center text-xs text-warm-400 pt-2">All data is stored locally on your device</p>
      </div>
    </div>
  )
}
