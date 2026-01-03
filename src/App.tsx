
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Genre, Provider, AudioState, AppSettings, PlayHistoryItem, TrackMetadata, ThemeScheme, EQBand, FavoriteNode, CustomNode } from './types';
import { PROVIDERS, GENRES_BY_PROVIDER, GENRE_STREAMS, THEMES } from './constants';
import { audioEngine } from './services/audioEngine';
import { searchStreams, DiscoveredStream } from './services/streamDiscovery';
import { generateTrackMetadata } from './services/geminiService';
import { 
  Play, Pause, Loader2, Activity, Volume2, X, 
  SkipForward, SkipBack, Search, Globe, Sliders, Palette, 
  Cpu, VolumeX, Database, Shuffle, Zap, Terminal, Waves,
  ChevronLeft, ChevronRight, List, Trash2, Info, Plus, RadioTower, Power, Save, 
  ShieldCheck, Diamond, Copy, Filter, LayoutGrid, ZapOff, Fingerprint, BarChart3, AlertCircle, Edit3, Network, TreeDeciduous, Hexagon, Sparkles, Monitor
} from 'lucide-react';

const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeModule, setActiveModule] = useState<'none' | 'nodes' | 'discovery' | 'logs' | 'eq' | 'themes' | 'intel'>('none');
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('SYSTEM_READY');
  
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [systemLogs, setSystemLogs] = useState<{msg: string, time: string, type: 'info' | 'warn' | 'zap' | 'error'}[]>([]);

  const [metadata, setMetadata] = useState<TrackMetadata | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isTestingSignals, setIsTestingSignals] = useState(false);
  const [searchQuery, setSearchQuery] = useState('Cyberpunk'); 
  const [suggestions, setSuggestions] = useState<DiscoveredStream[]>([]);
  const [sortBy, setSortBy] = useState<'quality' | 'name' | 'favicon'>('quality');

  const [shardSource, setShardSource] = useState<'scan' | 'trace' | 'hyper'>('scan');
  const [isShuffleMode, setIsShuffleMode] = useState(false);

  // 3D Engine State
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [moduleRotation, setModuleRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('aurawave_v27_settings');
    const defaults = {
      themeId: 'frost',
      equalizer: { 
        bands: { '32': 0, '64': 0, '125': 0, '250': 0, '500': 0, '1k': 0, '2k': 0, '4k': 0, '8k': 0, '16k': 0 },
        preamp: 1,
        stereoWidth: 1,
        limiterEnabled: true,
        eqBandCount: 10
      },
      customNodes: [],
      favorites: [],
      blacklist: []
    };
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  });

  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    volume: 0.7,
    currentGenre: Genre.AI_DREAM,
    currentProvider: Provider.GENERATIVE_AI,
    currentUrl: GENRE_STREAMS[Genre.AI_DREAM] || '',
    sessionHistory: [],
    historyIndex: -1
  });

  const theme: ThemeScheme = useMemo(() => THEMES.find(t => t.id === settings.themeId) || THEMES[0], [settings.themeId]);

  useEffect(() => {
    localStorage.setItem('aurawave_v27_settings', JSON.stringify(settings));
  }, [settings]);

  // Main Background Rotation
  useEffect(() => {
    let frameId: number;
    const animate = () => {
      if (!isDragging) {
        setRotation(prev => ({ x: prev.x + 0.04, y: prev.y + 0.06 }));
        setModuleRotation(prev => ({ x: prev.x + 0.02, y: prev.y + 0.03 }));
      }
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isDragging]);

  // Reactive Search
  useEffect(() => {
    if (!isInitialized) return;
    const triggerSearch = async () => {
      if (searchQuery.trim().length < 2) return;
      setIsSearching(true);
      addLog(`Query Broadcasting: ${searchQuery}`, 'info');
      try {
        const results = await searchStreams(searchQuery);
        setSuggestions(results);
      } catch (e) {
        addLog('Sync Interrupted', 'error');
      } finally {
        setIsSearching(false);
      }
    };
    const timer = setTimeout(triggerSearch, 600);
    return () => clearTimeout(timer);
  }, [searchQuery, isInitialized]);

  const addLog = (msg: string, type: 'info' | 'warn' | 'zap' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setSystemLogs(prev => [{ msg, time, type }, ...prev].slice(0, 50));
  };

  const toggleModule = (module: typeof activeModule) => {
    setActiveModule(prev => prev === module ? 'none' : module);
  };

  const injectToGrid = (name: string, url: string, provider: Provider, tags?: string) => {
    if (settings.customNodes.some(n => n.url === url)) {
      addLog('Node Duplicate', 'warn');
      return;
    }
    const newNode: CustomNode = {
      id: Math.random().toString(36).substring(2, 11),
      name, url, provider,
      tags: tags ? tags.split(',').map(t => t.trim()) : []
    };
    setSettings(prev => ({ ...prev, customNodes: [...prev.customNodes, newNode] }));
    addLog(`Node Mapped: ${name}`, 'zap');
  };

  const currentStreamShards = useMemo(() => {
    const rawTags = metadata?.description || '';
    const parts = rawTags.split(/[\s,]+/).filter(t => t.length > 3).map(t => t.replace(/[#.,]/g, '').toUpperCase());
    return Array.from(new Set([...parts, searchQuery.toUpperCase()])).slice(0, 15);
  }, [metadata, searchQuery]);

  // Optimized Playback Engine
  const handleTogglePlay = async (
    urlOverride?: string, 
    nameOverride?: string, 
    providerOverride?: Provider,
    isNavigatingHistory: boolean = false,
    extraData?: Partial<DiscoveredStream>,
    updateSearch: boolean = false
  ) => {
    if (audioState.isPlaying && !urlOverride) {
      audioEngine.stop();
      setAudioState(p => ({ ...p, isPlaying: false }));
      setStatusMessage('IDLE');
      return;
    }

    if (updateSearch && nameOverride) setSearchQuery(nameOverride);
    
    setIsAudioLoading(true);
    setStatusMessage('LOCKING...');
    
    const targetName = nameOverride || audioState.currentGenre;
    const targetProvider = providerOverride || audioState.currentProvider;
    const url = urlOverride || GENRE_STREAMS[targetName as string] || settings.customNodes.find(n => n.name === targetName)?.url;

    if (!url) {
      setIsAudioLoading(false);
      setStatusMessage('NO_SIGNAL');
      return;
    }

    try {
      await audioEngine.start(url);
      setAudioState(p => {
        let nextHist = [...p.sessionHistory];
        let nextIdx = p.historyIndex;
        if (!isNavigatingHistory) {
          nextHist = nextHist.slice(0, p.historyIndex + 1).slice(-49);
          nextHist.push({ name: String(targetName), url, provider: targetProvider, timestamp: Date.now(), favicon: extraData?.favicon });
          nextIdx = nextHist.length - 1;
        }
        return { ...p, isPlaying: true, currentGenre: targetName, currentProvider: targetProvider, currentUrl: url, sessionHistory: nextHist, historyIndex: nextIdx };
      });

      setMetadata({
        title: String(targetName).toUpperCase(),
        artist: String(targetProvider),
        bpm: extraData?.bitrate || 128,
        mood: extraData?.codec || "MPEG",
        energy: 0.8,
        description: extraData?.tags || "Neural Flow Stabilized",
        bitrate: extraData?.bitrate,
        favicon: extraData?.favicon
      });

      if (targetProvider === Provider.GENERATIVE_AI) {
        generateTrackMetadata(String(targetName), String(targetProvider)).then(m => setMetadata(prev => prev ? {...prev, ...m} : null));
      }
      setStatusMessage('LOCKED');
    } catch (err) {
      setStatusMessage('ERROR');
      addLog('Neural Drop', 'error');
    } finally {
      setIsAudioLoading(false);
    }
  };

  const handleNext = () => {
    if (isShuffleMode) {
      const p = PROVIDERS[Math.floor(Math.random() * (PROVIDERS.length-1))];
      const gList = GENRES_BY_PROVIDER[p.id];
      const g = gList[Math.floor(Math.random() * gList.length)];
      handleTogglePlay(undefined, String(g), p.id as Provider);
      return;
    }
    const currentIdx = suggestions.findIndex(s => s.url === audioState.currentUrl);
    if (currentIdx !== -1 && currentIdx < suggestions.length - 1) {
      const next = suggestions[currentIdx + 1];
      handleTogglePlay(next.url, next.name, Provider.RADIO_BROWSER, false, next);
    }
  };

  const handlePrev = () => {
    const currentIdx = suggestions.findIndex(s => s.url === audioState.currentUrl);
    if (currentIdx > 0) {
      const prev = suggestions[currentIdx - 1];
      handleTogglePlay(prev.url, prev.name, Provider.RADIO_BROWSER, false, prev);
    } else if (audioState.historyIndex > 0) {
      const prev = audioState.sessionHistory[audioState.historyIndex - 1];
      handleTogglePlay(prev.url, prev.name, prev.provider, true);
    }
  };

  // 3D Point Generation Helper
  const generateCloud = (items: any[], radius: number = 300) => {
    return items.map((item, i) => {
      const phi = Math.acos(-1 + (2 * i) / items.length);
      const theta = Math.sqrt(items.length * Math.PI) * phi;
      return { 
        data: item, 
        x: radius * Math.cos(theta) * Math.sin(phi), 
        y: radius * Math.sin(theta) * Math.sin(phi), 
        z: radius * Math.cos(phi),
        size: 0.7 + Math.random() * 0.6
      };
    });
  };

  // Background Cloud Logic
  const mainCloudShards = useMemo(() => {
    const parts = new Set<string>();
    if (shardSource === 'scan') {
      searchQuery.split(/[\s\-_,.]+/).forEach(p => { if (p.length > 3) parts.add(p.toUpperCase()); });
      suggestions.slice(0, 30).forEach(s => s.tags?.split(/[\s,]+/).forEach(t => { if(t.length > 3 && t.length < 15) parts.add(t.toUpperCase()); }));
    } else if (shardSource === 'trace') {
      systemLogs.forEach(l => l.msg.split(' ').forEach(w => { if(w.length > 4 && /^[A-Z_]+$/.test(w)) parts.add(w.toUpperCase()); }));
    } else {
      ['NEURAL','QUANTUM','CYBER','VOID','ECHO','SYNTH','ISOLATE','GHOST','VECTOR','RECURSIVE','SOMA','MATRIX'].forEach(p => parts.add(p));
    }
    const tags = Array.from(parts).slice(0, 50);
    return generateCloud(tags, 340);
  }, [searchQuery, suggestions, systemLogs, shardSource]);

  // Module Shards
  const moduleCloudItems = useMemo(() => {
    switch (activeModule) {
      case 'discovery': return generateCloud(suggestions.slice(0, 40), 280);
      case 'nodes': 
        const nodeList = [...settings.customNodes, ...PROVIDERS.flatMap(p => GENRES_BY_PROVIDER[p.id as Provider] || [])];
        return generateCloud(nodeList.slice(0, 45), 280);
      case 'themes': return generateCloud(THEMES, 240);
      case 'intel': 
        const intelPool = ['LATENCY: 42ms', 'NODES: 12', 'UPTIME: 100%', 'ENCRYPTION: AES-256', 'SIGNAL: STABLE', ...systemLogs.map(l => l.msg)];
        return generateCloud(intelPool, 260);
      default: return [];
    }
  }, [activeModule, suggestions, settings.customNodes, systemLogs]);

  const purgeBadSignals = async () => {
    setIsTestingSignals(true); addLog('Scrubbing Grid...', 'zap');
    await new Promise(r => setTimeout(r, 1500));
    setSuggestions(prev => prev.filter(s => (s.bitrate || 0) >= 128 || Math.random() > 0.4));
    setIsTestingSignals(false);
    addLog('Grid Optimized', 'info');
  };

  const copyMetadata = () => {
    if (!metadata) return;
    navigator.clipboard.writeText(`${metadata.title} - ${metadata.artist}`);
    addLog('Metadata Linked', 'zap');
  };

  return (
    <div className="h-screen w-full flex flex-col transition-all duration-700 overflow-hidden relative" style={{ backgroundColor: theme.bg, color: theme.text }}>
      {!isInitialized ? (
        <div className="h-full w-full flex flex-col items-center justify-center p-12 text-center animate-in zoom-in-50 duration-700">
          <div className="w-40 h-40 mb-10 flex items-center justify-center rounded-[4rem] bg-indigo-600 text-white shadow-3xl animate-pulse"><Cpu size={64} /></div>
          <h1 className="text-6xl font-black font-syncopate uppercase tracking-widest mb-10">AURAWAVE</h1>
          <button onClick={() => { audioEngine.init(); setIsInitialized(true); addLog('Core Initialized', 'zap'); }} className="px-14 py-7 rounded-[3rem] bg-indigo-600 text-white font-black text-2xl uppercase transition-all shadow-2xl hover:scale-105 active:scale-95">BOOT_SYSTEM</button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Header OS Bar */}
          <div className="w-full h-14 border-b flex items-center bg-black/5 z-50 backdrop-blur-md" style={{ borderColor: `${theme.text}11` }}>
             <button onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)} className="h-full px-5 border-r hover:bg-black/10 transition-all" style={{ borderColor: `${theme.text}11` }}><List size={18} /></button>
             <div className="flex-1 overflow-hidden">
                <div className="marquee-slow whitespace-nowrap pl-full">
                  <span className="text-[10px] font-black uppercase font-syncopate tracking-[0.5em] opacity-10 mr-20">RELAY_SOURCE: {audioState.currentUrl} // CLUSTER: {searchQuery.toUpperCase()} // STATUS: {statusMessage}</span>
                </div>
             </div>
             <button onClick={() => setIsRightPanelOpen(!isRightPanelOpen)} className="h-full px-5 border-l hover:bg-black/10 transition-all" style={{ borderColor: `${theme.text}11` }}><Terminal size={18} /></button>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Left Nav */}
            <div className="hidden lg:flex transition-all duration-500 border-r bg-black/5 flex-col overflow-hidden" style={{ borderColor: `${theme.text}11`, width: isLeftPanelOpen ? '280px' : '0' }}>
              <div className="p-6 w-80 h-full overflow-y-auto no-scrollbar space-y-6">
                <h3 className="text-[10px] font-black uppercase text-indigo-600 tracking-widest flex items-center gap-2"><Hexagon size={12}/> NEURAL_CORE</h3>
                {PROVIDERS.map(p => (
                   <div key={p.id} className="space-y-1">
                      <div className="text-[7px] font-black uppercase opacity-20 mb-1.5 px-3 tracking-tighter">{p.name}</div>
                      {((p.id === Provider.CUSTOM ? settings.customNodes : GENRES_BY_PROVIDER[p.id]) as any[])?.slice(0, 15).map((g: any) => {
                         const name = typeof g === 'string' ? g : g.name;
                         const url = typeof g === 'string' ? GENRE_STREAMS[name] : g.url;
                         return <button key={name} onClick={() => handleTogglePlay(url, name, p.id as Provider, false, {}, true)} className={`w-full text-left px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${audioState.currentGenre === name ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-black/10 opacity-60'}`}>{name}</button>;
                      })}
                   </div>
                ))}
              </div>
            </div>

            {/* Stage */}
            <div className="flex-1 flex flex-col relative overflow-hidden">
                
                {/* Module Nav */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-4 lg:gap-8 z-40">
                   {[
                     { id: 'discovery', icon: <Globe size={20} />, label: 'SCAN' },
                     { id: 'nodes', icon: <Database size={20} />, label: 'NODES' },
                     { id: 'eq', icon: <Sliders size={20} />, label: 'EQ' },
                     { id: 'themes', icon: <Palette size={20} />, label: 'THEME' },
                     { id: 'intel', icon: <Monitor size={20} />, label: 'INTEL' }
                   ].map(nav => (
                     <button key={nav.id} onClick={() => toggleModule(nav.id as any)} className={`group flex flex-col items-center gap-2 transition-all ${activeModule === nav.id ? 'text-indigo-600 scale-110' : 'opacity-20 hover:opacity-100'}`}>
                       <div className={`p-3 rounded-2xl transition-all ${activeModule === nav.id ? 'bg-indigo-600 text-white shadow-xl' : 'bg-black/10'}`}>{nav.icon}</div>
                       <span className="text-[7px] font-black tracking-[0.2em]">{nav.label}</span>
                     </button>
                   ))}
                </div>

                {/* Background 3D Shards */}
                <div className="scene-3d flex-1 pointer-events-none" onMouseDown={() => setIsDragging(true)} onMouseUp={() => setIsDragging(false)}>
                   <div className="cloud-3d" style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}>
                      {mainCloudShards.map((shard, i) => (
                         <div key={i} className="shard-item pointer-events-auto" style={{ transform: `translate3d(${shard.x}px, ${shard.y}px, ${shard.z}px) rotateY(${-rotation.y}deg) rotateX(${-rotation.x}deg)` }} onClick={() => { setSearchQuery(shard.data); setActiveModule('discovery'); }}>
                            <span className="font-black uppercase tracking-widest transition-all hover:scale-150 block" style={{ fontSize: `${shard.size}rem`, color: i%5===0 ? theme.accent : 'inherit', opacity: 0.15 + (shard.z + 340)/680 }}>{shard.data}</span>
                         </div>
                      ))}
                   </div>
                </div>

                {/* Neural Module Overlay */}
                {activeModule !== 'none' && (
                  <div className="absolute inset-4 lg:inset-10 z-[200] rounded-[3rem] bg-white dark:bg-[#08090f] border-4 shadow-3xl p-6 lg:p-12 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300" style={{ borderColor: `${theme.text}22`, backdropFilter: `blur(${theme.blur})` }}>
                    <div className="flex justify-between items-center mb-8 border-b pb-6" style={{ borderColor: `${theme.text}11` }}>
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-xl"><Diamond size={20} /></div>
                        <h2 className="text-xl font-black uppercase font-syncopate text-indigo-600 tracking-tighter">{activeModule.toUpperCase()}</h2>
                      </div>
                      <button onClick={() => toggleModule('none')} className="p-3 hover:bg-black/5 rounded-full transition-all hover:rotate-90"><X size={24} /></button>
                    </div>

                    <div className="flex-1 flex flex-col overflow-hidden">
                       
                       {/* Context-Specific Controls */}
                       {activeModule === 'discovery' && (
                         <div className="space-y-6 flex-shrink-0">
                            <div className="flex items-center bg-black/5 p-6 rounded-[2.5rem] border-2 border-transparent focus-within:border-indigo-600 transition-all shadow-inner group relative">
                               <Search size={24} className="opacity-20 mr-6" />
                               <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="FREQUENCY_EXPLORATION..." className="bg-transparent flex-1 text-xl font-black uppercase outline-none" />
                               <button onClick={purgeBadSignals} className={`p-4 rounded-2xl transition-all shadow-xl ${isTestingSignals ? 'bg-indigo-600 text-white animate-pulse' : 'bg-indigo-600/10 text-indigo-600'}`}>
                                  {isTestingSignals ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                               </button>
                            </div>
                            <div className="flex flex-wrap gap-2 px-4">
                               {currentStreamShards.map(tag => (
                                  <button key={tag} onClick={() => setSearchQuery(tag)} className="px-5 py-2 bg-indigo-600/5 rounded-2xl text-[10px] font-black uppercase border border-indigo-600/10 hover:bg-indigo-600 hover:text-white transition-all"># {tag}</button>
                               ))}
                            </div>
                         </div>
                       )}

                       {/* 3D Module Content Cloud */}
                       <div className="flex-1 relative cursor-move overflow-hidden bg-black/5 rounded-[4rem] border border-white/5 shadow-inner mt-6" onMouseDown={() => setIsDragging(true)} onMouseUp={() => setIsDragging(false)}>
                          <div className="scene-3d w-full h-full">
                             <div className="cloud-3d" style={{ transform: `rotateX(${moduleRotation.x}deg) rotateY(${moduleRotation.y}deg)` }}>
                                {moduleCloudItems.map((shard, i) => {
                                   let content: any = null;
                                   const isActive = (activeModule === 'discovery' && audioState.currentUrl === shard.data.url);
                                   
                                   if (activeModule === 'discovery') {
                                      content = (
                                         <div className={`flex flex-col items-center gap-2 group p-4 rounded-3xl transition-all ${isActive ? 'bg-indigo-600 text-white' : 'hover:scale-110'}`} onClick={() => handleTogglePlay(shard.data.url, shard.data.name, Provider.RADIO_BROWSER, false, shard.data)}>
                                            <div className="w-12 h-12 rounded-2xl bg-black/20 flex items-center justify-center overflow-hidden">
                                               {shard.data.favicon ? <img src={shard.data.favicon} className="w-full h-full object-cover" /> : <RadioTower size={24}/>}
                                            </div>
                                            <span className="text-[10px] font-black uppercase max-w-[120px] truncate">{shard.data.name}</span>
                                            {shard.data.bitrate && <span className="text-[7px] opacity-40">{shard.data.bitrate}K</span>}
                                         </div>
                                      );
                                   } else if (activeModule === 'nodes') {
                                      const isNodeStr = typeof shard.data === 'string';
                                      content = (
                                         <button onClick={() => isNodeStr ? (setSearchQuery(shard.data), setActiveModule('discovery')) : handleTogglePlay(shard.data.url, shard.data.name, shard.data.provider)} className="p-4 bg-indigo-600/10 hover:bg-indigo-600 hover:text-white rounded-2xl text-[10px] font-black uppercase transition-all shadow-md">
                                            {isNodeStr ? shard.data : shard.data.name}
                                         </button>
                                      );
                                   } else if (activeModule === 'themes') {
                                      content = (
                                         <button onClick={() => setSettings(prev => ({ ...prev, themeId: shard.data.id }))} className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${settings.themeId === shard.data.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-black/10 border-transparent hover:border-indigo-600'}`}>
                                            <Palette size={20} />
                                            <span className="text-[9px] font-black uppercase">{shard.data.name}</span>
                                         </button>
                                      );
                                   } else {
                                      content = (
                                         <span className="text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 hover:scale-125 transition-all">{shard.data}</span>
                                      );
                                   }

                                   return (
                                      <div key={i} className="shard-item pointer-events-auto" style={{ transform: `translate3d(${shard.x}px, ${shard.y}px, ${shard.z}px) rotateY(${-moduleRotation.y}deg) rotateX(${-moduleRotation.x}deg)` }}>
                                         {content}
                                      </div>
                                   );
                                })}
                             </div>
                          </div>
                          <div className="absolute bottom-10 right-10 flex items-center gap-2 text-[8px] font-black uppercase opacity-20 tracking-tighter">
                             <Activity size={12}/> SPATIAL_MAPPING_ACTIVE
                          </div>
                       </div>
                    </div>
                  </div>
                )}
            </div>

            {/* Logs Drawer */}
            <div className="hidden lg:flex transition-all duration-500 border-l bg-black/5 flex-col overflow-hidden" style={{ borderColor: `${theme.text}11`, width: isRightPanelOpen ? '280px' : '0' }}>
               <div className="p-8 w-70 h-full overflow-y-auto no-scrollbar font-mono text-[8px] space-y-4 opacity-40">
                  <h3 className="text-xs font-black font-rajdhani uppercase mb-4 opacity-100 flex items-center gap-2"><Fingerprint size={12}/> CORE_TRACE</h3>
                  {systemLogs.map((l, i) => (
                    <div key={i} className="flex gap-2 animate-in slide-in-from-right-2 border-l-2 border-indigo-600/20 pl-2">
                      <span className="opacity-30">[{l.time}]</span>
                      <span className={`uppercase font-bold ${l.type==='warn'?'text-rose-500':l.type==='zap'?'text-indigo-600':''}`}>{l.msg}</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* Master Footer Module */}
          <div className="h-28 border-t flex items-center justify-between px-10 bg-black/5 z-[300] backdrop-blur-3xl" style={{ borderColor: `${theme.text}11` }}>
             {/* Feed Metadata */}
             <div className="flex items-center gap-5 w-1/4 overflow-hidden group">
                <div className="w-14 h-14 rounded-2xl bg-black/10 flex-shrink-0 flex items-center justify-center overflow-hidden border border-white/5 shadow-inner">
                   {metadata?.favicon ? <img src={metadata.favicon} className="w-full h-full object-cover" /> : <Activity size={24} className="animate-pulse" />}
                </div>
                <div className="flex-1 overflow-hidden cursor-pointer" onClick={copyMetadata}>
                   <div className="text-[8px] font-black uppercase opacity-20 tracking-widest flex items-center gap-2">{metadata?.artist || 'NEURAL_LINK'} // {metadata?.bitrate || '128'}K</div>
                   <div className="relative overflow-hidden h-6 mt-1">
                      <div className={`${(metadata?.title?.length || 0) > 18 ? 'animate-marquee-text' : ''} text-base font-black uppercase text-indigo-600 flex items-center gap-3`}>
                         {metadata?.title || 'SYNCING...'} {(metadata?.title?.length || 0) > 18 && <Copy size={12} className="opacity-10 group-hover:opacity-100 transition-all" />}
                      </div>
                   </div>
                </div>
             </div>

             {/* Playback Hub */}
             <div className="flex-1 flex flex-col items-center gap-3">
                <div className="flex items-center gap-8 lg:gap-14">
                   <button onClick={handlePrev} className="p-3 opacity-30 hover:opacity-100 transition-all hover:scale-125"><SkipBack size={28} /></button>
                   <button onClick={() => handleTogglePlay()} className="w-16 h-16 rounded-[2.2rem] bg-indigo-600 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all border-4 border-white/20">
                      {isAudioLoading ? <Loader2 size={24} className="animate-spin" /> : audioState.isPlaying ? <Pause size={30} fill="currentColor" /> : <Play size={30} fill="currentColor" className="ml-1" />}
                   </button>
                   <button onClick={handleNext} className="p-3 opacity-30 hover:opacity-100 transition-all hover:scale-125"><SkipForward size={28} /></button>
                   <button onClick={() => setIsShuffleMode(!isShuffleMode)} className={`p-3 rounded-xl transition-all ${isShuffleMode ? 'bg-indigo-600 text-white shadow-xl' : 'opacity-20 hover:opacity-100'}`}><Shuffle size={20} /></button>
                </div>
                <div className="text-[7px] font-black uppercase opacity-5 tracking-[1em]">SYSTEM_STABLE // v2.7.0_CORE</div>
             </div>

             {/* Controls & Volume */}
             <div className="w-1/4 flex items-center justify-end gap-6">
                <div className="hidden md:flex items-center gap-4 w-32">
                   <VolumeX size={14} className="opacity-20" />
                   <div className="flex-1 h-1.5 bg-black/10 rounded-full relative overflow-hidden group shadow-inner">
                      <div className="absolute h-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]" style={{ width: `${audioState.volume * 100}%` }}></div>
                      <input type="range" min="0" max="1" step="0.01" value={audioState.volume} onChange={e => { const v = parseFloat(e.target.value); setAudioState(p => ({ ...p, volume: v })); audioEngine.setVolume(v); }} className="absolute inset-0 w-full opacity-0 cursor-pointer z-10" />
                   </div>
                   <Volume2 size={14} className="opacity-20" />
                </div>
                <button onClick={() => toggleModule('discovery')} className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-all border border-white/5"><Search size={20} /></button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
