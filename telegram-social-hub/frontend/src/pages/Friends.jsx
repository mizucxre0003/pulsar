import { useEffect, useState } from 'react'
import { GlassCard } from '../components/ui/GlassCard'
import { GlassButton } from '../components/ui/GlassButton'
import { UserPlus, MoreHorizontal, Play, Check, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import WatchPartySheet from '../components/WatchPartySheet'
import { supabase } from '../lib/supabase'

const getTgUser = () => {
  try { return window.Telegram?.WebApp?.initDataUnsafe?.user || null } catch { return null }
}

const FRIEND_COLORS = [
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #4facfe, #00f2fe)',
  'linear-gradient(135deg, #43e97b, #38f9d7)',
  'linear-gradient(135deg, #fa709a, #fee140)',
  'linear-gradient(135deg, #667eea, #764ba2)',
]

export default function Friends() {
  const [currentUser, setCurrentUser] = useState(null)
  const [friends, setFriends] = useState([])
  const [requests, setRequests] = useState([])
  const [friendUsername, setFriendUsername] = useState('')
  const [menuOpen, setMenuOpen] = useState(null)
  const [watchFriend, setWatchFriend] = useState(null)
  const [tab, setTab] = useState('friends') // 'friends' | 'requests'

  useEffect(() => {
    const tgUser = getTgUser()
    if (!tgUser) return
    
    const fetchUserAndFriends = async () => {
      const { data: profile } = await supabase.from('profiles').select('id').eq('telegram_id', tgUser.id).single()
      if (!profile) return
      setCurrentUser(profile)

      // Fetch accepted friends
      const { data: f1 } = await supabase.from('friendships').select('id, friend_id(id, username), user_id(id, username)').eq('user_id', profile.id).eq('status', 'accepted')
      const { data: f2 } = await supabase.from('friendships').select('id, friend_id(id, username), user_id(id, username)').eq('friend_id', profile.id).eq('status', 'accepted')
      
      const formattedFriends = []
      if (f1) f1.forEach(f => { if (f.friend_id) formattedFriends.push({ ...f.friend_id, f_id: f.id }) })
      if (f2) f2.forEach(f => { if (f.user_id) formattedFriends.push({ ...f.user_id, f_id: f.id }) })
      setFriends(formattedFriends)

      // Fetch pending requests TO me
      const { data: reqs } = await supabase.from('friendships').select('id, user_id(id, username)').eq('friend_id', profile.id).eq('status', 'pending')
      if (reqs) setRequests(reqs)
    }
    fetchUserAndFriends()
  }, [])

  const sendRequest = async () => {
    let un = friendUsername.trim().replace('@', '')
    if (!un || !currentUser) return
    
    // Find user by username
    const { data: target } = await supabase.from('profiles').select('id, username, telegram_id').ilike('username', un).single()
    if (!target) {
      alert('Пользователь не найден! Убедитесь, что вы вводите правильный Telegram @username (а не ID), и этот человек запускал нашего бота.')
      return
    }
    if (target.id === currentUser.id) {
       alert('Нельзя добавить себя')
       return
    }

    const { error } = await supabase.from('friendships').insert({
      user_id: currentUser.id,
      friend_id: target.id,
      status: 'pending'
    })
    
    if (error) alert('Заявка уже отправлена или вы уже друзья')
    else {
      alert('Заявка отправлена!');
      setFriendUsername('');
      
      const apiUrl = import.meta.env.VITE_BOT_API_URL || 'http://localhost:8000';
      fetch(`${apiUrl}/api/notify_request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_username: currentUser.username || "Пользователь",
          to_tg_id: target.telegram_id
        })
      }).catch(e => console.error("Notify err:", e));
    }
  }

  const acceptRequest = async (reqId) => {
    await supabase.from('friendships').update({ status: 'accepted' }).eq('id', reqId)
    window.location.reload() // hard reload to refetch cleanly
  }

  const rejectRequest = async (reqId) => {
    await supabase.from('friendships').delete().eq('id', reqId)
    setRequests(requests.filter(r => r.id !== reqId))
  }

  return (
    <div className="p-4 pt-10 max-w-md mx-auto pb-32">
      <h1 className="text-2xl font-bold mb-6 tracking-tight text-gray-900 dark:text-white">Контакты</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('friends')} className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
          style={{ 
            backgroundColor: tab === 'friends' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${tab === 'friends' ? 'rgba(255,255,255,0.3)' : 'transparent'}`
          }}>
          <span className="text-gray-900 dark:text-white">Друзья ({friends.length})</span>
        </button>
        <button onClick={() => setTab('requests')} className="flex-1 py-2 rounded-xl text-sm font-medium transition-all relative"
          style={{ 
            backgroundColor: tab === 'requests' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${tab === 'requests' ? 'rgba(255,255,255,0.3)' : 'transparent'}`
          }}>
          <span className="text-gray-900 dark:text-white">Заявки</span>
          {requests.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
              {requests.length}
            </span>
          )}
        </button>
      </div>

      {tab === 'friends' ? (
        <>
          {/* Add friend input */}
          <div className="glass-panel rounded-full flex gap-2 p-2 pl-6 mb-6">
            <input type="text" placeholder="@username друга..."
              className="flex-1 bg-transparent text-sm focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/40"
              value={friendUsername}
              onChange={e => setFriendUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendRequest()}
            />
            <GlassButton className="rounded-full px-4 py-2" onClick={sendRequest}>
              <UserPlus size={18} />
            </GlassButton>
          </div>

          <div className="space-y-3">
            {friends.length === 0 ? (
              <GlassCard>
                <p className="text-center py-6 text-gray-500 dark:text-white/40">
                  У вас пока нет друзей.
                </p>
              </GlassCard>
            ) : (
              friends.map((friend, i) => (
                <motion.div key={friend.id}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}>
                  <div className="glass-panel rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-lg text-white shadow-lg"
                      style={{ background: FRIEND_COLORS[i % FRIEND_COLORS.length] }}>
                      {friend.username?.[0]?.toUpperCase() || 'U'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white">@{friend.username}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        <p className="text-xs text-gray-500 dark:text-white/50">В сети</p>
                      </div>
                    </div>

                    <div className="relative flex-shrink-0">
                      <button className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        onClick={() => setMenuOpen(menuOpen === friend.id ? null : friend.id)}>
                        <MoreHorizontal size={18} className="text-gray-900 dark:text-white" />
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
        </>
      ) : (
        <div className="space-y-3">
          {requests.length === 0 ? (
            <GlassCard>
              <p className="text-center py-6 text-gray-500 dark:text-white/40">
                Нет новых заявок
              </p>
            </GlassCard>
          ) : (
            requests.map(req => (
              <GlassCard key={req.id} className="p-4 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">@{req.user_id.username}</p>
                  <p className="text-xs text-gray-500 dark:text-white/40">Хочет добавить вас</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => acceptRequest(req.id)} className="p-2 rounded-full bg-green-500/20 text-green-400 hover:bg-green-500/30">
                    <Check size={18} />
                  </button>
                  <button onClick={() => rejectRequest(req.id)} className="p-2 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30">
                    <X size={18} />
                  </button>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      )}

      {watchFriend && (
        <WatchPartySheet groupId={`friend-${watchFriend}`} onClose={() => setWatchFriend(null)} />
      )}
      {menuOpen && <div className="fixed inset-0 z-0" onClick={() => setMenuOpen(null)} />}
    </div>
  )
}
