import { useEffect, useState, useRef } from 'react'
import { GlassCard } from '../components/ui/GlassCard'
import { GlassButton } from '../components/ui/GlassButton'
import WebApp from '@twa-dev/sdk'
import { supabase } from '../lib/supabase'
import ReactPlayer from 'react-player/youtube'
import { Play, Pause } from 'lucide-react'

export default function WatchParty() {
  const [groupId, setGroupId] = useState('-123456789')
  const [url, setUrl] = useState('')
  const [inputUrl, setInputUrl] = useState('')
  const [playing, setPlaying] = useState(false)
  const playerRef = useRef(null)

  useEffect(() => {
    const startParam = WebApp.initDataUnsafe?.start_param;
    if (startParam) {
      setGroupId(startParam);
    }
    const idToFetch = startParam || '-123456789';

    const fetchState = async () => {
      const { data } = await supabase
        .from('group_data')
        .select('current_video_url, video_state, video_timestamp')
        .eq('chat_id', idToFetch)
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
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'group_data' }, 
        (payload) => {
          const { new: newData } = payload;
          if (newData.chat_id.toString() !== idToFetch.toString()) return;

          if (newData.current_video_url !== url) setUrl(newData.current_video_url || '');
          setPlaying(newData.video_state === 'playing');
          
          if (playerRef.current && newData.video_timestamp !== null) {
            const currentTime = playerRef.current.getCurrentTime();
            if (newData.video_state === 'playing' && Math.abs(currentTime - newData.video_timestamp) > 2) {
              playerRef.current.seekTo(newData.video_timestamp, 'seconds');
            }
          }
        }
      ).subscribe();

    return () => { supabase.removeChannel(channel); }
  }, [url]);

  const updateState = async (updates) => {
    // Optimistic UI updates
    if (updates.current_video_url !== undefined) setUrl(updates.current_video_url);
    if (updates.video_state !== undefined) setPlaying(updates.video_state === 'playing');

    await supabase
      .from('group_data')
      .upsert(
        { chat_id: groupId, ...updates, updated_at: new Date().toISOString() }, 
        { onConflict: 'chat_id' }
      );
  }

  const handlePlay = () => {
    const time = playerRef.current ? playerRef.current.getCurrentTime() : 0;
    updateState({ video_state: 'playing', video_timestamp: time });
  }

  const handlePause = () => {
    const time = playerRef.current ? playerRef.current.getCurrentTime() : 0;
    updateState({ video_state: 'paused', video_timestamp: time });
  }

  const loadVideo = () => {
    if (inputUrl) {
      updateState({ current_video_url: inputUrl, video_state: 'playing', video_timestamp: 0 });
      setInputUrl('');
    }
  }

  return (
    <div className="p-4 pt-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 tracking-tight">Watch Party</h1>
      
      <GlassCard className="mb-6">
        <div className="aspect-video bg-black/40 rounded-lg overflow-hidden flex items-center justify-center mb-4 border border-white/5 relative">
          {url ? (
            <ReactPlayer 
              ref={playerRef}
              url={url} 
              playing={playing}
              onPlay={handlePlay}
              onPause={handlePause}
              width="100%" 
              height="100%"
              controls={true}
            />
          ) : (
            <p className="text-white/50 text-sm">No video playing</p>
          )}
        </div>
        
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Paste YouTube URL..." 
            className="flex-1 bg-white/5 border border-white/10 rounded-squircle px-4 py-2 text-sm text-white focus:outline-none focus:border-white/30"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
          />
          <GlassButton onClick={loadVideo} className="px-4 py-2">
            Play
          </GlassButton>
        </div>
      </GlassCard>

      <div className="flex justify-center gap-4">
        <GlassButton onClick={handlePlay} className={playing ? 'bg-white/20' : ''}>
          <Play size={20} />
        </GlassButton>
        <GlassButton onClick={handlePause} className={!playing ? 'bg-white/20' : ''}>
          <Pause size={20} />
        </GlassButton>
      </div>
    </div>
  )
}
