import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const MODES = [
  { id: 'free', label: '🖌 Свободное рисование', desc: 'Рисуй любым цветом, без ограничений' },
  { id: 'battle', label: '⚔️ Пиксельная битва', desc: 'Цвет назначается случайно каждые 30 сек' },
]

const BRUSH_SIZES = [1, 2, 4]

export default function CanvasSettings({ settings, onChange, onClose }) {
  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex flex-col justify-end"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}>
        <motion.div className="glass-panel rounded-t-3xl p-6 pb-10"
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">⚙️ Настройки холста</h2>
            <button onClick={onClose} className="p-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <X size={18} className="text-white" />
            </button>
          </div>

          {/* Canvas Mode */}
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>Режим</p>
          <div className="space-y-3 mb-6">
            {MODES.map(mode => (
              <button key={mode.id} onClick={() => onChange({ ...settings, mode: mode.id })}
                className="w-full text-left p-4 rounded-2xl transition-all"
                style={{
                  backgroundColor: settings.mode === mode.id ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${settings.mode === mode.id ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
                }}>
                <p className="font-medium text-white text-sm mb-1">{mode.label}</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{mode.desc}</p>
              </button>
            ))}
          </div>

          {/* Brush Size */}
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>Размер кисти</p>
          <div className="flex gap-3">
            {BRUSH_SIZES.map(size => (
              <button key={size} onClick={() => onChange({ ...settings, brushSize: size })}
                className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all"
                style={{
                  backgroundColor: settings.brushSize === size ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${settings.brushSize === size ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  color: 'white'
                }}>
                {size}px
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
