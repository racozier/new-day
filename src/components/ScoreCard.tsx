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
  const color = AREA_COLORS[area] ?? '#6366f1'
  const label = AREA_LABELS[area] ?? area

  const bg = score >= 70 ? 'bg-emerald-500/10' : score >= 40 ? 'bg-amber-500/10' : 'bg-slate-800'
  const textColor = score >= 70 ? 'text-emerald-400' : score >= 40 ? 'text-amber-400' : 'text-slate-400'

  return (
    <button
      onClick={() => to && navigate(to)}
      className="flex items-center gap-3 bg-slate-800/60 rounded-xl p-3 w-full active:bg-slate-700/60 transition-colors text-left"
    >
      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      <span className="flex-1 text-sm font-medium text-slate-300">{label}</span>
      <span className={`text-sm font-bold ${textColor} ${bg} px-2 py-0.5 rounded-lg`}>{score}%</span>
      {to && <ChevronRight size={16} className="text-slate-600 flex-shrink-0" />}
    </button>
  )
}
