import { NavLink, useLocation } from 'react-router-dom'
import { Home, CalendarDays, LayoutGrid, BookOpen, MoreHorizontal } from 'lucide-react'

const tabs = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/planner', icon: CalendarDays, label: 'Planner' },
  { to: '/areas', icon: LayoutGrid, label: 'Areas' },
  { to: '/reflect', icon: BookOpen, label: 'Reflect' },
  { to: '/more', icon: MoreHorizontal, label: 'More' },
]

export default function BottomNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-sm border-t border-slate-800 safe-bottom">
      <div className="flex items-center justify-around h-16">
        {tabs.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to || location.pathname.startsWith(to + '/')
          return (
            <NavLink
              key={to}
              to={to}
              className="flex flex-col items-center gap-0.5 px-4 py-2 min-w-[60px]"
            >
              <Icon
                size={22}
                className={active ? 'text-brand-400' : 'text-slate-500'}
                strokeWidth={active ? 2.5 : 2}
              />
              <span className={`text-[10px] font-medium ${active ? 'text-brand-400' : 'text-slate-500'}`}>
                {label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
