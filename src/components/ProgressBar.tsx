interface Props {
  value: number
  max?: number
  color?: string
  label?: string
  showValue?: boolean
  unit?: string
}

export default function ProgressBar({ value, max = 100, color = '#e07968', label, showValue = true, unit }: Props) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-warm-500">{label}</span>}
          {showValue && (
            <span className="text-xs font-semibold text-navy-700 ml-auto">
              {value}{unit && <span className="text-warm-400"> / {max}{unit}</span>}
            </span>
          )}
        </div>
      )}
      <div className="h-2 bg-peach-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
