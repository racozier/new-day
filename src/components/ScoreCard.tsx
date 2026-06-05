import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { AREA_COLORS, AREA_LABELS } from '../utils/scoring'

interface Props {
  area: string
  score: number
  to?: string
}

export default function ScoreCard({ area, score, to }: Props) {
  const navigate = useNavigate()
  const color = AREA_COLORS[area] ?? '#e07968'
  const label = AREA_LABELS[area] ?? area

  const scoreColor = score >= 70 ? 'text-emerald-600' : score >= 40 ? 'text-amber-600' : 'text-warm-500'
  const scoreBg = score >= 70 ? 'bg-emerald-50' : score >= 40 ? 'bg-amber-50' : 'bg-peach-100'

  return (
    <button
      onClick={() => to && navigate(to)}
      className="flex items-center gap-3 bg-cream-100 border border-peach-200 rounded-xl p-3 w-full active:bg-peach-100 transition-colors text-left"
    >
      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      <span className="flex-1 text-sm font-medium text-navy-700">{label}</span>
      <span className={`text-sm font-bold ${scoreColor} ${scoreBg} px-2 py-0.5 rounded-lg`}>{score}%</span>
      {to && <ChevronRight size={16} className="text-warm-400 flex-shrink-0" />}
    </button>
  )
}
