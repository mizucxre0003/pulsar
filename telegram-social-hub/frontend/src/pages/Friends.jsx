import { useState } from 'react'
import { GlassCard } from '../components/ui/GlassCard'
import { GlassButton } from '../components/ui/GlassButton'
import { UserPlus, MoreHorizontal, Play } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import WatchPartySheet from '../components/WatchPartySheet'

const FRIEND_COLORS = [
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #4facfe, #00f2fe)',
  'linear-gradient(135deg, #43e97b, #38f9d7)',
  'linear-gradient(135deg, #fa709a, #fee140)',
  'linear-gradient(135deg, #667eea, #764ba2)',
]

export default function Friends() {
  const [friends, setFriends] = useState([
    { id: '1', username: 'Crypto Chad', status: 'Рисует в Web3 Group', color: FRIEND_COLORS[0] }
  ])
  const [friendId, setFriendId] = useState('')
  const [menuOpen, setMenuOpen] = useState(null)
  const [watchFriend, setWatchFriend] = useState(null)

  const addFriend = () => {
    if (!friendId.trim()) return
    setFriends([...friends, {
      id: friendId,
      username: `User ${friendId.slice(0, 4)}`,
      status: 'Online',
      color: FRIEND_COLORS[friends.length % FRIEND_COLORS.length]
    }])
    setFriendId('')
  }

  return (
    <div className="p-4 pt-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-2 tracking-tight text-white">Друзья</h1>
      <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>Активность и присутствие</p>

      {/* Add friend input */}
      <div className="glass-panel rounded-full flex gap-2 p-2 pl-6 mb-6"
        style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
        <input type="number" placeholder="Telegram ID друга..."
          className="flex-1 bg-transparent text-sm text-white focus:outline-none"
          style={{ color: 'white' }}
          value={friendId}
          onChange={e => setFriendId(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addFriend()}
        />
        <GlassButton className="rounded-full px-4 py-2" onClick={addFriend}>
          <UserPlus size={18} />
        </GlassButton>
      </div>

      {/* Friends list */}
      <div className="space-y-3">
        {friends.length === 0 ? (
          <GlassCard>
            <p className="text-center py-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Пока нет друзей
            </p>
          </GlassCard>
        ) : (
          friends.map((friend, i) => (
            <motion.div key={friend.id}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}>
              <div className="glass-panel rounded-2xl p-4 flex items-center gap-3">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-lg text-white"
                  style={{ background: friend.color }}>
                  {friend.username[0]}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white">{friend.username}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{friend.status}</p>
                  </div>
                </div>

                {/* 3-dot menu */}
                <div className="relative flex-shrink-0">
                  <button className="p-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                    onClick={() => setMenuOpen(menuOpen === friend.id ? null : friend.id)}>
                    <MoreHorizontal size={18} className="text-white" />
                  </button>
                  <AnimatePresence>
                    {menuOpen === friend.id && (
                      <motion.div initial={{ opacity: 0, scale: 0.9, y: -5 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute right-0 mt-2 rounded-2xl overflow-hidden z-10"
                        style={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.15)', minWidth: 170, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                        <button className="w-full px-4 py-3 text-sm text-left flex items-center gap-2 text-white hover:bg-white/10"
                          onClick={() => { setWatchFriend(friend.id); setMenuOpen(null) }}>
                          <Play size={14} /> Смотреть вместе
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Watch party sheet */}
      {watchFriend && (
        <WatchPartySheet groupId={`friend-${watchFriend}`} onClose={() => setWatchFriend(null)} />
      )}

      {menuOpen && <div className="fixed inset-0 z-0" onClick={() => setMenuOpen(null)} />}
    </div>
  )
}
