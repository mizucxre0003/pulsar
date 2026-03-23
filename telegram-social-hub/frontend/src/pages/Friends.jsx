import { useState } from 'react'
import { GlassCard } from '../components/ui/GlassCard'
import { GlassButton } from '../components/ui/GlassButton'
import { UserPlus } from 'lucide-react'

export default function Friends() {
  const [friends, setFriends] = useState([
    { id: '1', username: 'Crypto Chad', status: 'Рисует в Web3 Group', color: 'linear-gradient(135deg, #f093fb, #f5576c)' }
  ])
  const [friendId, setFriendId] = useState('')

  const addFriend = () => {
    if (!friendId.trim()) return
    setFriends([...friends, {
      id: friendId,
      username: `User ${friendId.slice(0, 4)}`,
      status: 'Online',
      color: 'linear-gradient(135deg, #4facfe, #00f2fe)'
    }])
    setFriendId('')
  }

  return (
    <div className="p-4 pt-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 tracking-tight">Друзья</h1>

      <div className="glass-panel rounded-full flex gap-2 p-2 pl-6 mb-6" style={{ border: '1px solid rgba(255,255,255,0.2)' }}>
        <input
          type="number"
          placeholder="Введи Telegram ID..."
          className="flex-1 bg-transparent border-none text-sm text-white focus:outline-none"
          style={{ color: 'white' }}
          value={friendId}
          onChange={(e) => setFriendId(e.target.value)}
        />
        <GlassButton className="rounded-full px-4 py-2" onClick={addFriend}>
          <UserPlus size={18} />
        </GlassButton>
      </div>

      <div className="space-y-3">
        {friends.length === 0 ? (
          <GlassCard>
            <p className="text-center py-4" style={{ color: 'rgba(255,255,255,0.5)' }}>Пока нет друзей.</p>
          </GlassCard>
        ) : (
          friends.map((friend) => (
            <GlassCard key={friend.id} className="flex justify-between items-center p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white shadow-lg"
                  style={{ background: friend.color }}>
                  {friend.username[0]}
                </div>
                <div>
                  <p className="font-medium text-white">{friend.username}</p>
                  <p className="text-xs font-medium" style={{ color: '#34c759' }}>{friend.status}</p>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  )
}
