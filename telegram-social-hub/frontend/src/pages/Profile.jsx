import { useEffect, useState } from 'react'
import { GlassCard } from '../components/ui/GlassCard'
import { Moon, Sun } from 'lucide-react'

const getTgUser = () => {
  try { return window.Telegram?.WebApp?.initDataUnsafe?.user || null } catch { return null }
}

export default function Profile() {
  const [user, setUser] = useState({ first_name: 'Пользователь', username: null, language_code: 'ru' })
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  const [lang, setLang] = useState('ru')

  useEffect(() => {
    const tgUser = getTgUser()
    if (tgUser) {
      setUser(tgUser)
      setLang(tgUser.language_code === 'en' ? 'en' : 'ru')
    }
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  const toggleLang = () => {
    setLang(lang === 'ru' ? 'en' : 'ru')
  }

  return (
    <div className={`p-4 pt-10 max-w-md mx-auto pb-32 min-h-screen transition-colors duration-300 ${theme === 'light' ? 'bg-gray-100' : ''}`}>
      <h1 className={`text-2xl font-bold mb-6 tracking-tight ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Профиль</h1>

      {/* Avatar + Name */}
      <GlassCard className={`mb-4 flex items-center gap-4 ${theme === 'light' ? '!bg-white/50 !border-gray-200' : ''}`}>
        <div className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', boxShadow: '0 10px 20px rgba(102,126,234,0.3)' }}>
          {(user.first_name?.[0] || 'U').toUpperCase()}
        </div>
        <div>
          <h2 className={`font-semibold text-lg ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
            {user.first_name} {user.last_name || ''}
          </h2>
          <p className="text-sm font-medium" style={{ color: theme === 'light' ? '#6b7280' : 'rgba(255,255,255,0.5)' }}>
            {user.username ? `@${user.username}` : 'Telegram User'}
          </p>
        </div>
      </GlassCard>

      {/* Settings Row: Theme & Lang Toggles */}
      <div className="flex justify-center gap-6 mb-8 mt-4">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme} 
          title="Сменить тему"
          className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 shadow-lg"
          style={{ 
            backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb',
            color: theme === 'dark' ? '#9ca3af' : '#6b7280'
          }}
        >
          {theme === 'dark' ? (
            <Moon size={28} />
          ) : (
            <Sun size={28} />
          )}
        </button>

        {/* Language Toggle */}
        <button 
          onClick={toggleLang} 
          title="Сменить язык"
          className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 shadow-lg font-bold text-lg"
          style={{ 
            backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb',
            color: theme === 'dark' ? '#9ca3af' : '#6b7280'
          }}
        >
          {lang === 'ru' ? 'RU' : 'EN'}
        </button>
      </div>

    </div>
  )
}
