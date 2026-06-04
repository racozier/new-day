import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import PlannerPage from './pages/PlannerPage'
import AreasPage from './pages/AreasPage'
import BodyPage from './pages/areas/Body'
import FinancesPage from './pages/areas/Finances'
import MentalPage from './pages/areas/Mental'
import RelationshipsPage from './pages/areas/Relationships'
import QuergiaPage from './pages/areas/Quergia'
import ReflectionPage from './pages/ReflectionPage'
import MorePage from './pages/MorePage'
import AnalyticsPage from './pages/AnalyticsPage'
import InspirationPage from './pages/InspirationPage'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="planner" element={<PlannerPage />} />
          <Route path="areas" element={<AreasPage />} />
          <Route path="areas/body" element={<BodyPage />} />
          <Route path="areas/finances" element={<FinancesPage />} />
          <Route path="areas/mental" element={<MentalPage />} />
          <Route path="areas/relationships" element={<RelationshipsPage />} />
          <Route path="areas/quergia" element={<QuergiaPage />} />
          <Route path="reflect" element={<ReflectionPage />} />
          <Route path="more" element={<MorePage />} />
          <Route path="more/analytics" element={<AnalyticsPage />} />
          <Route path="more/inspiration" element={<InspirationPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
