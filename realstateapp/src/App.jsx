import './App.css'
import UserProfile from './pages/forms/UserProfile.jsx'
import AddProperties from './pages/properties/AddProperties.jsx'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import PropertyDetails from './pages/property/PropertyDetails.jsx'

function App() {
  // Simple view switcher (avoids react-router dependency).
  const currentPath = window.location.pathname || '/'
  const isHome = currentPath === '/'
  const isUserProfile = currentPath === '/userprofile'
  const isAddProperties = currentPath === '/addproperties'
  const isPropertyDetails = currentPath.startsWith('/property/')


  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="p-6">
        {isHome ? <Home /> : null}
        {isPropertyDetails ? <PropertyDetails /> : null}
        {isUserProfile ? <UserProfile /> : null}
        {isAddProperties ? <AddProperties /> : null}
      </div>

    </div>
  )
}

export default App











