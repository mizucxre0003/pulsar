import { useEffect, useState } from 'react'
import { GlassCard } from '../components/ui/GlassCard'

const getTgData = () => {
  try {
    return window.Telegram?.WebApp?.initDataUnsafe?.user || null
  } catch { return null }
}

export default function Profile() {
  const [user, setUser] = useState({ first_name: 'Пользователь', username: 'unknown', language_code: 'ru' })

  useEffect(() => {
    const tgUser = getTgData()
    if (tgUser) setUser(tgUser)
  }, [])

  return (
    <div className="p-4 pt-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 tracking-tight">Профиль</h1>
      <GlassCard className="mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg"
            style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
            {(user.first_name?.[0] || 'U').toUpperCase()}
          </div>
          <div>
            <h2 className="font-medium text-lg text-white">{user.first_name} {user.last_name || ''}</h2>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>@{user.username || 'unknown'}</p>
          </div>
        </div>
        <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '16px 0' }} />
        <div className="flex justify-between text-sm">
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>Язык</span>
          <span className="font-medium text-white">{user.language_code?.toUpperCase() || 'RU'}</span>
        </div>
      </GlassCard>
      <GlassCard>
        <h3 className="font-medium mb-3" style={{ color: 'rgba(255,255,255,0.9)' }}>Статистика</h3>
        <div className="grid grid-cols-2 gap-4">
          {[['0', 'Друзей'], ['1', 'Групп']].map(([val, label]) => (
            <div key={label} className="p-4 rounded-xl text-center" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
              <p className="text-2xl font-bold text-white mb-1">{val}</p>
              <p className="text-xs uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
