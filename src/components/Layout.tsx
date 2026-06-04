import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-950 dark:bg-slate-950 text-slate-100">
      <main className="pb-20 min-h-screen">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
