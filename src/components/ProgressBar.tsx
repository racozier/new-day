interface Props {
  value: number
  max?: number
  color?: string
  label?: string
  showValue?: boolean
  unit?: string
}

export default function ProgressBar({ value, max = 100, color = '#6366f1', label, showValue = true, unit }: Props) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-slate-400">{label}</span>}
          {showValue && (
            <span className="text-xs font-semibold text-slate-200 ml-auto">
              {value}{unit && <span className="text-slate-500"> / {max}{unit}</span>}
            </span>
          )}
        </div>
      )}
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
