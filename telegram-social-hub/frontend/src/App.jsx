import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import Groups from './pages/Groups'
import GroupDetail from './pages/GroupDetail'
import Friends from './pages/Friends'
import Profile from './pages/Profile'

function App() {
  useEffect(() => {
    try {
      const tg = window.Telegram?.WebApp
      if (tg) { tg.ready(); tg.expand() }
    } catch (e) {
      console.warn("Not in Telegram", e)
    }
  }, [])

  return (
    <Router>
      <div style={{ paddingBottom: '96px', minHeight: '100vh' }}>
        <Routes>
          <Route path="/" element={<Groups />} />
          <Route path="/group/:chatId" element={<GroupDetail />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <Navigation />
      </div>
    </Router>
  )
}

export default App
