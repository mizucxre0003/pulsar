import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GlassCard } from '../components/ui/GlassCard'
import { supabase } from '../lib/supabase'
import { Users, Play, MoreHorizontal } from 'lucide-react'
import WatchPartySheet from '../components/WatchPartySheet'

export default function Groups() {
  const navigate = useNavigate()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(null)
  const [watchGroup, setWatchGroup] = useState(null)

  useEffect(() => {
    const fetchGroups = async () => {
      const { data } = await supabase.from('bot_groups').select('*').order('added_at', { ascending: false })
      setGroups(data || [])
      setLoading(false)
    }
    fetchGroups()

    const channel = supabase.channel('groups-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bot_groups' }, fetchGroups)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const groupColors = [
    'linear-gradient(135deg, #667eea, #764ba2)',
    'linear-gradient(135deg, #f093fb, #f5576c)',
    'linear-gradient(135deg, #4facfe, #00f2fe)',
    'linear-gradient(135deg, #43e97b, #38f9d7)',
    'linear-gradient(135deg, #fa709a, #fee140)',
  ]

  return (
    <div className="p-4 pt-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-2 tracking-tight text-white">Группы</h1>
      <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
        Группы, в которые добавлен бот
      </p>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <GlassCard className="text-center py-12">
          <Users size={40} className="mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.3)' }} />
          <p className="font-medium text-white mb-1">Нет групп</p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Добавь бота в группу, и она появится здесь
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {groups.map((group, i) => (
            <motion.div key={group.chat_id}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}>
              <div className="glass-panel rounded-2xl p-4 flex items-center gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-lg font-bold text-white"
                  style={{ background: groupColors[i % groupColors.length] }}>
                  {group.title[0].toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/group/${group.chat_id}`)}>
                  <p className="font-semibold text-white truncate">{group.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {group.username ? `@${group.username}` : `ID: ${group.chat_id}`}
                  </p>
                </div>

                {/* 3-dot menu */}
                <div className="relative flex-shrink-0">
                  <button className="p-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                    onClick={() => setMenuOpen(menuOpen === group.chat_id ? null : group.chat_id)}>
                    <MoreHorizontal size={18} className="text-white" />
                  </button>
                  {menuOpen === group.chat_id && (
                    <motion.div initial={{ opacity: 0, scale: 0.9, y: -5 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="absolute right-0 mt-2 rounded-2xl overflow-hidden z-10 min-w-[160px]"
                      style={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
                      <button className="w-full px-4 py-3 text-sm text-left flex items-center gap-2 hover:bg-white/10 transition-colors"
                        style={{ color: 'white' }}
                        onClick={() => { setWatchGroup(group.chat_id); setMenuOpen(null) }}>
                        <Play size={14} />
                        Смотреть вместе
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {watchGroup && (
        <WatchPartySheet groupId={watchGroup} onClose={() => setWatchGroup(null)} />
      )}

      {/* Dismiss menu on outside click */}
      {menuOpen && (
        <div className="fixed inset-0 z-0" onClick={() => setMenuOpen(null)} />
      )}
    </div>
  )
}
