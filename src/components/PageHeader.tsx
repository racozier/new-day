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
    <div className="sticky top-0 z-40 bg-cream-100/95 backdrop-blur-sm border-b border-peach-200/60 px-4 py-3 safe-top">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {back && (
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 -ml-1.5 rounded-lg text-warm-500 active:text-navy-700 transition-colors"
            >
              <ChevronLeft size={22} />
            </button>
          )}
          <div>
            <h1 className="text-lg font-semibold text-navy-700 leading-tight">{title}</h1>
            {subtitle && <p className="text-xs text-warm-400">{subtitle}</p>}
          </div>
        </div>
        {right && <div>{right}</div>}
      </div>
    </div>
  )
}
