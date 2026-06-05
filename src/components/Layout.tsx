import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function Layout() {
  return (
    <div className="min-h-screen bg-cream-100 text-navy-700">
      <main className="pb-20 min-h-screen">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
