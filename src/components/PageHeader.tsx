import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

interface Props {
  title: string
  subtitle?: string
  back?: boolean
  right?: React.ReactNode
}

export default function PageHeader({ title, subtitle, back, right }: Props) {
  const navigate = useNavigate()
  return (
    <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800/50 px-4 py-3 safe-top">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {back && (
            <button onClick={() => navigate(-1)} className="p-1.5 -ml-1.5 rounded-lg text-slate-400 active:text-slate-200">
              <ChevronLeft size={22} />
            </button>
          )}
          <div>
            <h1 className="text-lg font-semibold text-slate-100 leading-tight">{title}</h1>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>
        {right && <div>{right}</div>}
      </div>
    </div>
  )
}
