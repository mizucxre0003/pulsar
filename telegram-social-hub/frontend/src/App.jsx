import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import WebApp from '@twa-dev/sdk'
import Navigation from './components/Navigation'
import Home from './pages/Home'
import Friends from './pages/Friends'
import Profile from './pages/Profile'
import WatchParty from './pages/WatchParty'

function App() {
  useEffect(() => {
    WebApp.ready();
    WebApp.expand();
  }, [])

  return (
    <Router>
      <div className="pb-24 min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/watch" element={<WatchParty />} />
        </Routes>
        <Navigation />
      </div>
    </Router>
  )
}

export default App
