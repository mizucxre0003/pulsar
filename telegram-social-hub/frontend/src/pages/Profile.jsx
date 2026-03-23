import { useEffect, useState } from 'react'
import { GlassCard } from '../components/ui/GlassCard'
import { motion } from 'framer-motion'

const getTgUser = () => {
  try { return window.Telegram?.WebApp?.initDataUnsafe?.user || null } catch { return null }
}

const THEMES = [
  { id: 'dark', label: '🌙 Тёмная', desc: 'Глубокие серые тона' },
  { id: 'light', label: '☀️ Светлая', desc: 'Скоро в разработке...' },
]

const LANGS = ['🇷🇺 Русский', '🇬🇧 English']

export default function Profile() {
  const [user, setUser] = useState({ first_name: 'Пользователь', username: null, language_code: 'ru' })
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  const [lang, setLang] = useState(LANGS[0])

  useEffect(() => {
    const tgUser = getTgUser()
    if (tgUser) setUser(tgUser)
  }, [])

  const handleTheme = (t) => {
    setTheme(t)
    localStorage.setItem('theme', t)
    document.documentElement.classList.toggle('dark', t === 'dark')
  }

  return (
    <div className="p-4 pt-10 max-w-md mx-auto pb-32">
      <h1 className="text-2xl font-bold mb-6 tracking-tight text-white">Профиль</h1>

      {/* Avatar + Name */}
      <GlassCard className="mb-4 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
          {(user.first_name?.[0] || 'U').toUpperCase()}
        </div>
        <div>
          <h2 className="font-semibold text-lg text-white">{user.first_name} {user.last_name || ''}</h2>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {user.username ? `@${user.username}` : 'Telegram User'}
          </p>
        </div>
      </GlassCard>

      {/* Stats */}
      <GlassCard className="mb-4 grid grid-cols-3 gap-3">
        {[['0', 'Друзей'], ['0', 'Групп'], ['0', 'Пикселей']].map(([val, label]) => (
          <div key={label} className="text-center p-3 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
            <p className="text-xl font-bold text-white">{val}</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>
          </div>
        ))}
      </GlassCard>

      {/* Theme Settings */}
      <GlassCard className="mb-4">
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>Тема</p>
        <div className="space-y-2">
          {THEMES.map(t => (
            <button key={t.id} onClick={() => handleTheme(t.id)}
              className="w-full text-left p-3 rounded-xl transition-all flex items-center justify-between"
              style={{
                backgroundColor: theme === t.id ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${theme === t.id ? 'rgba(255,255,255,0.25)' : 'transparent'}`,
              }}>
              <div>
                <p className="text-sm font-medium text-white">{t.label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{t.desc}</p>
              </div>
              {theme === t.id && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Language Settings */}
      <GlassCard>
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>Язык</p>
        <div className="flex gap-2">
          {LANGS.map(l => (
            <button key={l} onClick={() => setLang(l)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor: lang === l ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${lang === l ? 'rgba(255,255,255,0.3)' : 'transparent'}`,
                color: 'white'
              }}>
              {l}
            </button>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
