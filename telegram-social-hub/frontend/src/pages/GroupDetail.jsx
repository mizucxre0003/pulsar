import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { GlassButton } from '../components/ui/GlassButton'
import CanvasSettings from '../components/CanvasSettings'
import WatchPartySheet from '../components/WatchPartySheet'
import { ArrowLeft, Settings, MoreHorizontal, Play } from 'lucide-react'

const GRID_SIZE = 64

const getTgUserId = () => {
  try { return window.Telegram?.WebApp?.initDataUnsafe?.user?.id || null } catch { return null }
}
const getTgGroupId = () => {
  try {
    const p = new URLSearchParams(window.location.search)
    return p.get('group_id') || window.Telegram?.WebApp?.initDataUnsafe?.start_param || null
  } catch { return null }
}

const COLORS = ['#ffffff', '#ff3b30', '#ff9500', '#ffd60a', '#34c759', '#007aff', '#af52de', '#000000']

export default function GroupDetail() {
  const { chatId } = useParams()
  const navigate = useNavigate()
  const canvasRef = useRef(null)

  const [group, setGroup] = useState(null)
  const [grid, setGrid] = useState({})
  const [color, setColor] = useState('#ffffff')
  const [settings, setSettings] = useState({ mode: 'free', brushSize: 1 })
  const [canEdit, setCanEdit] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showWatch, setShowWatch] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // Battle mode: rotate color every 30s
  useEffect(() => {
    if (settings.mode !== 'battle') return
    const interval = setInterval(() => {
      setColor(COLORS[Math.floor(Math.random() * COLORS.length)])
    }, 30000)
    return () => clearInterval(interval)
  }, [settings.mode])

  useEffect(() => {
    // Fetch group info
    supabase.from('bot_groups').select('*').eq('chat_id', chatId).single()
      .then(({ data }) => setGroup(data))

    // Check edit permissions: user's group_id from TMA must match this chatId
    const tgGroupId = getTgGroupId()
    setCanEdit(tgGroupId?.toString() === chatId?.toString())

    // Fetch canvas
    supabase.from('group_data').select('canvas_state, canvas_mode').eq('chat_id', chatId).single()
      .then(({ data }) => {
        if (data?.canvas_state) { setGrid(data.canvas_state); drawGrid(data.canvas_state) }
        if (data?.canvas_mode) setSettings(s => ({ ...s, mode: data.canvas_mode }))
      })

    // Realtime subscription
    const channel = supabase.channel(`canvas-${chatId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_data' }, (payload) => {
        if (payload.new?.canvas_state) { setGrid(payload.new.canvas_state); drawGrid(payload.new.canvas_state) }
      }).subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [chatId])

  const drawGrid = (g) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, GRID_SIZE, GRID_SIZE)
    Object.entries(g).forEach(([key, hex]) => {
      const [x, y] = key.split(',').map(Number)
      ctx.fillStyle = hex
      ctx.fillRect(x, y, 1, 1)
    })
  }

  const drawPixel = async (e) => {
    if (!canEdit) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const clientX = e.clientX ?? e.touches?.[0]?.clientX
    const clientY = e.clientY ?? e.touches?.[0]?.clientY
    const cx = Math.floor((clientX - rect.left) * scaleX)
    const cy = Math.floor((clientY - rect.top) * scaleY)
    const bs = settings.brushSize
    const drawColor = settings.mode === 'battle' ? color : color

    const newGrid = { ...grid }
    for (let dx = 0; dx < bs; dx++) for (let dy = 0; dy < bs; dy++) {
      const x = cx + dx, y = cy + dy
      if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) newGrid[`${x},${y}`] = drawColor
    }
    setGrid(newGrid); drawGrid(newGrid)
    await supabase.from('group_data').upsert(
      { chat_id: chatId, canvas_state: newGrid, updated_at: new Date().toISOString() },
      { onConflict: 'chat_id' }
    )
  }

  const saveCanvasSettings = async (newSettings) => {
    setSettings(newSettings)
    await supabase.from('group_data').upsert(
      { chat_id: chatId, canvas_mode: newSettings.mode, updated_at: new Date().toISOString() },
      { onConflict: 'chat_id' }
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0F0F0F', backgroundImage: 'radial-gradient(circle at 50% -20%, #2a2a2a, #0F0F0F)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pt-8">
        <button onClick={() => navigate('/')} className="p-2 rounded-full"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-white truncate">{group?.title || 'Группа'}</h1>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {canEdit ? '✏️ Ты участник — редактирование включено' : '👁 Просмотр — войди через группу чтобы рисовать'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <button onClick={() => setShowSettings(true)} className="p-2 rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <Settings size={18} className="text-white" />
            </button>
          )}
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <MoreHorizontal size={18} className="text-white" />
            </button>
            {menuOpen && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 mt-2 rounded-2xl overflow-hidden z-10"
                style={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.15)', minWidth: 170, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                <button className="w-full px-4 py-3 text-sm text-left flex items-center gap-2 text-white hover:bg-white/10"
                  onClick={() => { setShowWatch(true); setMenuOpen(false) }}>
                  <Play size={14} /> Смотреть вместе
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="px-4">
        <div className="glass-panel rounded-3xl p-4 flex flex-col items-center">
          <canvas ref={canvasRef} width={GRID_SIZE} height={GRID_SIZE}
            onPointerDown={drawPixel} onPointerMove={e => e.buttons > 0 && drawPixel(e)}
            className="w-full aspect-square rounded-xl touch-none"
            style={{
              imageRendering: 'pixelated', backgroundColor: '#1A1A1A',
              cursor: canEdit ? 'crosshair' : 'default',
              border: '1px solid rgba(255,255,255,0.1)',
              filter: canEdit ? 'none' : 'brightness(0.7)',
            }}
          />

          {/* Color palette (only if can edit) */}
          {canEdit && (
            <div className="flex gap-2 mt-4 flex-wrap justify-center">
              {(settings.mode === 'battle' ? [color] : COLORS).map(c => (
                <button key={c} onClick={() => setColor(c)}
                  className="rounded-full border-2 transition-all"
                  style={{
                    width: 30, height: 30, backgroundColor: c,
                    borderColor: color === c ? 'white' : 'transparent',
                    transform: color === c ? 'scale(1.2)' : 'scale(1)',
                  }} />
              ))}
            </div>
          )}

          {settings.mode === 'battle' && canEdit && (
            <p className="text-xs mt-3 text-center" style={{ color: 'rgba(255,255,255,0.5)' }}>
              ⚔️ Пиксельная битва — цвет меняется автоматически
            </p>
          )}
        </div>
      </div>

      {showSettings && (
        <CanvasSettings settings={settings} onChange={saveCanvasSettings} onClose={() => setShowSettings(false)} />
      )}
      {showWatch && (
        <WatchPartySheet groupId={chatId} onClose={() => setShowWatch(false)} />
      )}
      {menuOpen && <div className="fixed inset-0 z-0" onClick={() => setMenuOpen(false)} />}
    </div>
  )
}
