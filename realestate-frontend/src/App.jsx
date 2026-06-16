import './App.css'
import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'

import Navbar from './components/Navbar.jsx'

import Home from './pages/Home.jsx'
import UserProfile from './features/user/page/Citizen/UserProfile.jsx'
import AddProperties from './features/property/page/AddProperties.jsx'
import PropertyDetails from './features/property/page/PropertyDetails.jsx'

import { PortalDashboard } from './features/auth/components/PortalDashboard.jsx'
import CitizenPage from './features/user/page/Citizen/CitizenPage.jsx'
import GovernmentDashboard from './features/user/page/Governments/GovernmentDashboard.jsx'

import ProtectedRoute from './routes/ProtectedRoute.jsx'
import { authService } from './lib/authService.js'
import { useAuth } from './features/auth/hooks/useAuth.js'

function App() {
  const [isLoggedOut, setIsLoggedOut] = useState(false)

  useEffect(() => {
    authService.init()

    const handleLogout = (event) => {
      console.log('Auth logout event:', event.detail)
      authService.handleLogout()
      setIsLoggedOut(true)

      setTimeout(() => {
        window.location.href = '/'
      }, 1000)
    }

    window.addEventListener('auth:logout', handleLogout)
    return () => window.removeEventListener('auth:logout', handleLogout)
  }, [])

  if (isLoggedOut) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Session Expired</h2>
          <p className="text-gray-600 mb-4">
            Your session has expired. Please login again.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="p-6">
        <Routes>

          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* User Profile */}
          <Route path="/userprofile" element={<UserProfile />} />

          {/* Add Properties (Citizen only) */}
          <Route
            path="/addproperties"
            element={
              <ProtectedRoute
                allowedRoles={['Citizen']}
                fallback={<div style={{ padding: 24 }}>Not authorized.</div>}
              >
                <AddProperties />
              </ProtectedRoute>
            }
          />

          {/* Property Details */}
          <Route
            path="/property/:id"
            element={
              <ProtectedRoute
                allowedRoles={['Citizen', 'Government']}
                fallback={<div style={{ padding: 24 }}>Not authorized.</div>}
              >
                <PropertyDetails />
              </ProtectedRoute>
            }
          />

          {/* Dashboard (role-based) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute
                allowedRoles={['Citizen', 'Government']}
                fallback={<div style={{ padding: 24 }}>Not authorized.</div>}
              >
                <RoleBasedDashboard />
              </ProtectedRoute>
            }
          />

          {/* Portal (Government only) */}
          <Route
            path="/portal"
            element={
              <ProtectedRoute
                allowedRoles={['Government']}
                fallback={<div style={{ padding: 24 }}>Not authorized.</div>}
              >
                <PortalDashboard />
              </ProtectedRoute>
            }
          />

        </Routes>
      </div>
    </div>
  )
}

// Role-based dashboard renderer
function RoleBasedDashboard() {
  const { role } = useAuth()

  if (role === 'Citizen') {
    return <CitizenPage />
  }

  if (role === 'Government') {
    return <GovernmentDashboard />
  }

  return <div style={{ padding: 24 }}>Unknown role or not authorized.</div>
}

export default App