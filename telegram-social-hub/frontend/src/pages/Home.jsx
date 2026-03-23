import { useEffect, useRef, useState } from 'react'
import { GlassCard } from '../components/ui/GlassCard'
import { supabase } from '../lib/supabase'

const GRID_SIZE = 64;

const getTgData = () => {
  try {
    return window.Telegram?.WebApp?.initDataUnsafe || {}
  } catch {
    return {}
  }
}

export default function Home() {
  const canvasRef = useRef(null)
  const [groupId, setGroupId] = useState('-123456789')
  const [color, setColor] = useState('#ffffff')
  const [grid, setGrid] = useState({})

  useEffect(() => {
    const startParam = getTgData()?.start_param;
    if (startParam) setGroupId(startParam);

    const idToFetch = startParam || '-123456789';

    const initCanvas = async () => {
      const { data } = await supabase
        .from('group_data')
        .select('canvas_state')
        .eq('chat_id', idToFetch)
        .single();

      if (data?.canvas_state) {
        setGrid(data.canvas_state);
        drawGrid(data.canvas_state);
      }
    };
    initCanvas();

    const channel = supabase.channel('canvas-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_data' }, (payload) => {
        if (payload.new?.canvas_state) {
          setGrid(payload.new.canvas_state);
          drawGrid(payload.new.canvas_state);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); }
  }, [])

  const drawGrid = (currentGrid) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, GRID_SIZE, GRID_SIZE);
    Object.entries(currentGrid).forEach(([key, hex]) => {
      const [x, y] = key.split(',').map(Number);
      ctx.fillStyle = hex;
      ctx.fillRect(x, y, 1, 1);
    });
  };

  const drawPixel = async (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.clientX || (e.touches?.[0]?.clientX);
    const clientY = e.clientY || (e.touches?.[0]?.clientY);
    const x = Math.floor((clientX - rect.left) * scaleX);
    const y = Math.floor((clientY - rect.top) * scaleY);

    if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
      const key = `${x},${y}`;
      const newGrid = { ...grid, [key]: color };
      setGrid(newGrid);
      drawGrid(newGrid);
      await supabase.from('group_data').upsert(
        { chat_id: groupId, canvas_state: newGrid, updated_at: new Date().toISOString() },
        { onConflict: 'chat_id' }
      );
    }
  };

  const handlePointerMove = (e) => { if (e.buttons > 0) drawPixel(e); };

  return (
    <div className="p-4 pt-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 tracking-tight">Group Canvas</h1>
      <GlassCard className="flex flex-col items-center justify-center p-4">
        <canvas
          ref={canvasRef}
          width={GRID_SIZE}
          height={GRID_SIZE}
          onPointerDown={drawPixel}
          onPointerMove={handlePointerMove}
          className="w-full aspect-square border-2 border-white/10 rounded-lg shadow-inner mb-6 touch-none cursor-crosshair"
          style={{ imageRendering: 'pixelated', backgroundColor: '#1A1A1A' }}
        />
        <div className="flex gap-4 p-2 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
          {['#ffffff', '#ff3b30', '#34c759', '#007aff', '#ffd60a', '#1c1c1e'].map(c => (
            <button
              key={c}
              className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
