import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import Home from './pages/Home'
import Friends from './pages/Friends'
import Profile from './pages/Profile'
import WatchParty from './pages/WatchParty'

function App() {
  useEffect(() => {
    // Safely init Telegram WebApp - only works inside Telegram
    try {
      const tg = window.Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();
      }
    } catch (e) {
      console.warn("Not inside Telegram, WebApp SDK skipped.");
    }
  }, [])

  return (
    <Router>
      <div style={{ paddingBottom: '96px', minHeight: '100vh' }}>
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
