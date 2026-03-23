import { useEffect, useState, useRef } from 'react'
import { GlassCard } from '../components/ui/GlassCard'
import { GlassButton } from '../components/ui/GlassButton'
import { supabase } from '../lib/supabase'
import ReactPlayer from 'react-player'
import { Play, Pause } from 'lucide-react'

const getTgData = () => {
  try { return window.Telegram?.WebApp?.initDataUnsafe || {} } catch { return {} }
}

export default function WatchParty() {
  const [groupId, setGroupId] = useState('-123456789')
  const [url, setUrl] = useState('')
  const [inputUrl, setInputUrl] = useState('')
  const [playing, setPlaying] = useState(false)
  const playerRef = useRef(null)

  useEffect(() => {
    const startParam = getTgData()?.start_param;
    const id = startParam || '-123456789';
    setGroupId(id);

    const fetchState = async () => {
      const { data } = await supabase.from('group_data')
        .select('current_video_url, video_state, video_timestamp')
        .eq('chat_id', id)
        .single();
      if (data) {
        if (data.current_video_url) setUrl(data.current_video_url);
        setPlaying(data.video_state === 'playing');
        if (playerRef.current && data.video_timestamp) {
          playerRef.current.seekTo(data.video_timestamp, 'seconds');
        }
      }
    };
    fetchState();

    const channel = supabase.channel('watch-party')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_data' }, (payload) => {
        const nd = payload.new;
        if (!nd) return;
        if (nd.current_video_url !== undefined) setUrl(nd.current_video_url || '');
        setPlaying(nd.video_state === 'playing');
        if (playerRef.current && nd.video_timestamp !== null) {
          const cur = playerRef.current.getCurrentTime();
          if (nd.video_state === 'playing' && Math.abs(cur - nd.video_timestamp) > 2) {
            playerRef.current.seekTo(nd.video_timestamp, 'seconds');
          }
        }
      }).subscribe();

    return () => { supabase.removeChannel(channel); }
  }, []);

  const pushState = async (updates) => {
    if (updates.video_state !== undefined) setPlaying(updates.video_state === 'playing');
    if (updates.current_video_url !== undefined) setUrl(updates.current_video_url);
    await supabase.from('group_data').upsert(
      { chat_id: groupId, ...updates, updated_at: new Date().toISOString() },
      { onConflict: 'chat_id' }
    );
  };

  const loadVideo = () => {
    if (!inputUrl) return;
    pushState({ current_video_url: inputUrl, video_state: 'playing', video_timestamp: 0 });
    setInputUrl('');
  };

  return (
    <div className="p-4 pt-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 tracking-tight">Watch Party</h1>
      <GlassCard className="mb-6">
        <div className="aspect-video rounded-lg overflow-hidden flex items-center justify-center mb-4 border"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)', borderColor: 'rgba(255,255,255,0.05)' }}>
          {url ? (
            <ReactPlayer
              ref={playerRef}
              url={url}
              playing={playing}
              onPlay={() => pushState({ video_state: 'playing', video_timestamp: playerRef.current?.getCurrentTime() || 0 })}
              onPause={() => pushState({ video_state: 'paused', video_timestamp: playerRef.current?.getCurrentTime() || 0 })}
              width="100%"
              height="100%"
              controls={true}
            />
          ) : (
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Нет видео</p>
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Вставь YouTube URL..."
            className="flex-1 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
          />
          <GlassButton onClick={loadVideo}>Плей</GlassButton>
        </div>
      </GlassCard>
      <div className="flex justify-center gap-4">
        <GlassButton onClick={() => pushState({ video_state: 'playing', video_timestamp: playerRef.current?.getCurrentTime() || 0 })}>
          <Play size={20} />
        </GlassButton>
        <GlassButton onClick={() => pushState({ video_state: 'paused', video_timestamp: playerRef.current?.getCurrentTime() || 0 })}>
          <Pause size={20} />
        </GlassButton>
      </div>
    </div>
  )
}
