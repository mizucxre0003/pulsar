import { useEffect, useState } from 'react'
import { GlassCard } from '../components/ui/GlassCard'
import WebApp from '@twa-dev/sdk'

export default function Profile() {
  const [user, setUser] = useState({
    first_name: 'Developer',
    username: 'dev_user',
    language_code: 'en'
  })

  useEffect(() => {
    if (WebApp.initDataUnsafe?.user) {
      setUser(WebApp.initDataUnsafe.user)
    }
  }, [])

  return (
    <div className="p-4 pt-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 tracking-tight">Profile</h1>
      <GlassCard className="mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xl font-bold text-white shadow-lg">
            {user.first_name?.[0] || 'U'}
          </div>
          <div>
            <h2 className="font-medium text-lg text-white">{user.first_name} {user.last_name || ''}</h2>
            <p className="text-white/50 text-sm">@{user.username || 'unknown'}</p>
          </div>
        </div>
        
        <div className="h-px bg-white/10 w-full my-4" />
        
        <div className="flex justify-between text-sm">
          <span className="text-white/60">Language</span>
          <span className="font-medium text-white">{user.language_code?.toUpperCase() || 'EN'}</span>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="font-medium mb-3 text-white/90">Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 p-4 rounded-xl text-center">
            <p className="text-2xl font-bold text-white mb-1">0</p>
            <p className="text-xs text-white/50 uppercase tracking-wider">Friends</p>
          </div>
          <div className="bg-white/5 p-4 rounded-xl text-center">
            <p className="text-2xl font-bold text-white mb-1">1</p>
            <p className="text-xs text-white/50 uppercase tracking-wider">Groups</p>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
