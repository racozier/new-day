import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { AREA_COLORS } from '../utils/scoring'

const areas = [
  { key: 'body', label: 'Body', emoji: '💪', desc: 'Water, steps, weight, exercise', to: '/areas/body' },
  { key: 'finances', label: 'Finances', emoji: '💰', desc: 'Income, expenses, learning', to: '/areas/finances' },
  { key: 'mental', label: 'Mental Growth', emoji: '🧠', desc: 'Learning, books, insights', to: '/areas/mental' },
  { key: 'relationships', label: 'Relationships', emoji: '❤️', desc: 'Meetings, social, romance', to: '/areas/relationships' },
  { key: 'quergia', label: 'QUERGIA', emoji: '🚀', desc: 'Business tasks, revenue, leads', to: '/areas/quergia' },
]

export default function AreasPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <PageHeader title="Life Areas" subtitle="Track your daily progress" />
      <div className="px-4 py-4 space-y-3">
        {areas.map(area => (
          <button
            key={area.key}
            onClick={() => navigate(area.to)}
            className="w-full flex items-center gap-4 bg-slate-900 rounded-2xl p-4 active:bg-slate-800 transition-colors text-left"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ backgroundColor: AREA_COLORS[area.key] + '20' }}
            >
              {area.emoji}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-100">{area.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{area.desc}</p>
            </div>
            <ChevronRight size={18} className="text-slate-600 flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  )
}
