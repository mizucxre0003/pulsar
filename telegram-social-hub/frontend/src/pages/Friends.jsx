import { useEffect, useState } from 'react'
import { GlassCard } from '../components/ui/GlassCard'
import { GlassButton } from '../components/ui/GlassButton'
import { UserPlus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import WebApp from '@twa-dev/sdk'

export default function Friends() {
  const [friends, setFriends] = useState([
    // Mock user for testing UI presence
    { id: '1234', username: 'Crypto Chad', status: 'Drawing in Web3 Group', color: 'from-pink-500 to-orange-400' }
  ])
  const [friendId, setFriendId] = useState('')

  useEffect(() => {
    // In a real app we would load their actual friends from Supabase based on user uuid
    // Subscribing to friends activity in the user_activity table would let us know where they are
  }, [])

  const addFriend = () => {
    if (!friendId) return
    // Mock functionality
    setFriends([...friends, { 
      id: friendId, 
      username: `User ${friendId.slice(0, 4)}`, 
      status: 'Online',
      color: 'from-blue-400 to-cyan-300'
    }])
    setFriendId('')
  }

  return (
    <div className="p-4 pt-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 tracking-tight">Friends</h1>
      
      <GlassCard className="mb-6 flex gap-2 p-2 rounded-full pl-6 border border-white/20">
        <input 
          type="text" 
          placeholder="Enter Telegram ID..." 
          className="flex-1 bg-transparent border-none text-sm text-white focus:outline-none placeholder:text-white/40"
          value={friendId}
          onChange={(e) => setFriendId(e.target.value)}
        />
        <GlassButton className="rounded-full px-4 py-2 bg-white/10" onClick={addFriend}>
          <UserPlus size={18} />
        </GlassButton>
      </GlassCard>

      <div className="space-y-4">
        {friends.length === 0 ? (
          <GlassCard>
            <p className="text-white/50 text-center py-4">You have no friends yet.</p>
          </GlassCard>
        ) : (
          friends.map((friend, i) => (
            <GlassCard key={i} className="flex justify-between items-center p-4 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-tr ${friend.color || 'from-green-400 to-emerald-500'} flex items-center justify-center font-bold text-lg shadow-lg`}>
                  {friend.username[0]}
                </div>
                <div>
                  <p className="font-medium text-white">{friend.username}</p>
                  <p className="text-xs text-green-300 font-medium tracking-wide">{friend.status}</p>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  )
}
