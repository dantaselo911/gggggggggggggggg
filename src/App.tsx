import { useState, useEffect, useMemo } from 'react';
import { 
  Tv, 
  Search, 
  X, 
  Star, 
  TrendingUp, 
  LayoutGrid, 
  Gamepad2, 
  Trophy, 
  Newspaper, 
  Film, 
  Baby, 
  Compass, 
  Menu,
  ChevronRight,
  MonitorPlay,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CHANNELS, Channel } from './channels';

const CATEGORIES = [
  { id: 'all', name: 'Todos', icon: LayoutGrid },
  { id: 'Abertos', name: 'Abertos', icon: Tv },
  { id: 'Esportes', name: 'Esportes', icon: Trophy },
  { id: 'Filmes e Séries', name: 'Filmes', icon: Film },
  { id: 'Notícias', name: 'Notícias', icon: Newspaper },
  { id: 'Infantil', name: 'Infantil', icon: Baby },
  { id: 'Documentários', name: 'Documentos', icon: Compass },
  { id: 'Variedades', name: 'Variedades', icon: Gamepad2 },
  { id: 'Reality', name: 'Reality', icon: MonitorPlay },
];

export default function App() {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem('nexus-favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('nexus-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const filteredChannels = useMemo(() => {
    return CHANNELS.filter(channel => {
      const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || channel.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const favoriteChannels = useMemo(() => {
    return CHANNELS.filter(c => favorites.includes(c.id));
  }, [favorites]);

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const handleWatch = (channel: Channel) => {
    setSelectedChannel(channel);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-cyan-500/30">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/5 px-4 py-3 md:px-8">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <div className="neon-bg p-2 rounded-xl">
                <Tv className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-white leading-none">
                  NEXUS<span className="text-cyan-400">TV</span>
                </h1>
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Live Experience</p>
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-2xl hidden md:block">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Pesquisar canais, esportes ou filmes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="hidden sm:flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-sm font-semibold transition-all">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Em Alta
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 p-[2px]">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                <img src="https://picsum.photos/seed/user/100/100" alt="User" referrerPolicy="no-referrer" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex max-w-[1600px] mx-auto">
        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-[73px] h-[calc(100vh-73px)] z-40
          w-64 glass-panel border-r border-white/5 p-4 overflow-y-auto
          transition-transform duration-300 lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Categorias</p>
              <nav className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setIsSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                      ${activeCategory === cat.id 
                        ? 'bg-cyan-500/10 text-cyan-400' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}
                    `}
                  >
                    <cat.icon className={`w-4 h-4 ${activeCategory === cat.id ? 'text-cyan-400' : 'text-slate-500'}`} />
                    {cat.name}
                  </button>
                ))}
              </nav>
            </div>

            {favorites.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Favoritos</p>
                <div className="space-y-1">
                  {favoriteChannels.map(channel => (
                    <button
                      key={channel.id}
                      onClick={() => handleWatch(channel)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all group"
                    >
                      <span className="truncate">{channel.name}</span>
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-hidden">
          {/* Hero Section / Player */}
          <AnimatePresence mode="wait">
            {selectedChannel ? (
              <motion.section
                key="player"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-12"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 neon-bg rounded-2xl flex items-center justify-center">
                      <Tv className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedChannel.name}</h2>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 uppercase bg-cyan-500/10 px-2 py-0.5 rounded">
                          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
                          Ao Vivo
                        </span>
                        <span className="text-xs text-slate-500 font-medium">{selectedChannel.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => toggleFavorite(selectedChannel.id, e)}
                      className={`p-3 rounded-xl transition-all ${favorites.includes(selectedChannel.id) ? 'bg-cyan-500/10 text-cyan-400' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                      <Heart className={`w-5 h-5 ${favorites.includes(selectedChannel.id) ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={() => setSelectedChannel(null)}
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="relative aspect-video w-full bg-black rounded-[2rem] overflow-hidden shadow-2xl shadow-cyan-500/10 border border-white/5">
                  <iframe
                    src={`https://embedflix.click/tv/player.php?id=${selectedChannel.slug}`}
                    className="w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                </div>
              </motion.section>
            ) : (
              <section className="mb-12 relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-white/5">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent z-10"></div>
                <img 
                  src="https://picsum.photos/seed/streaming/1200/400" 
                  alt="Featured" 
                  className="w-full h-[300px] md:h-[400px] object-cover opacity-40"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 z-20 flex flex-col justify-center p-8 md:p-16">
                  <span className="inline-flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">
                    <Star className="w-4 h-4 fill-current" />
                    Destaque da Semana
                  </span>
                  <h2 className="text-4xl md:text-6xl font-black text-white mb-4 max-w-2xl leading-tight">
                    Acompanhe o melhor do <span className="neon-text">Futebol</span> ao vivo.
                  </h2>
                  <p className="text-slate-400 max-w-md mb-8 text-sm md:text-base">
                    Todos os jogos da rodada, notícias exclusivas e os melhores canais de esporte em um só lugar.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={() => handleWatch(CHANNELS.find(c => c.slug === 'sportv') || CHANNELS[0])}
                      className="neon-bg text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all active:scale-95"
                    >
                      <MonitorPlay className="w-5 h-5" />
                      Explorar Canais
                    </button>
                    <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-bold backdrop-blur-md transition-all">
                      Ver Calendário
                    </button>
                  </div>
                </div>
              </section>
            )}
          </AnimatePresence>

          {/* Channels Grid */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  {activeCategory === 'all' ? 'Todos os Canais' : activeCategory}
                </h2>
                <p className="text-sm text-slate-500">{filteredChannels.length} transmissões disponíveis agora</p>
              </div>
              
              <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-xl border border-white/5">
                <button className="px-4 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 text-white shadow-lg shadow-cyan-500/20">Grid</button>
                <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-300">Lista</button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
              {filteredChannels.map((channel) => (
                <motion.div
                  key={channel.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -8 }}
                  className="group relative bg-slate-900/40 rounded-3xl border border-white/5 overflow-hidden hover:border-cyan-500/30 transition-all duration-500"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center group-hover:bg-cyan-500/10 transition-all duration-500">
                        <Tv className="w-7 h-7 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button 
                          onClick={(e) => toggleFavorite(channel.id, e)}
                          className={`p-2 rounded-lg transition-all ${favorites.includes(channel.id) ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-600 hover:text-cyan-400 hover:bg-white/5'}`}
                        >
                          <Heart className={`w-5 h-5 ${favorites.includes(channel.id) ? 'fill-current' : ''}`} />
                        </button>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 bg-black/40 px-2 py-1 rounded-md">
                          4K HDR
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors truncate">
                        {channel.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{channel.category}</span>
                        <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                        <span className="text-[10px] font-bold text-cyan-500/70 uppercase">Online</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleWatch(channel)}
                      className="w-full bg-slate-950 hover:neon-bg text-slate-300 hover:text-white py-3.5 rounded-2xl text-xs font-black tracking-widest flex items-center justify-center gap-2 transition-all duration-300 active:scale-95"
                    >
                      <MonitorPlay className="w-4 h-4" />
                      ASSISTIR AGORA
                    </button>
                  </div>
                  
                  {/* Decorative element */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/0 to-transparent group-hover:via-cyan-500/50 transition-all duration-500"></div>
                </motion.div>
              ))}
            </div>

            {filteredChannels.length === 0 && (
              <div className="text-center py-32 glass-panel rounded-[3rem]">
                <div className="w-20 h-20 bg-slate-950 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-slate-800" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Nenhum canal encontrado</h3>
                <p className="text-slate-500 max-w-xs mx-auto">Tente ajustar sua busca ou mudar a categoria selecionada.</p>
                <button 
                  onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                  className="mt-6 text-cyan-400 font-bold text-sm hover:underline"
                >
                  Limpar todos os filtros
                </button>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Mobile Search Overlay (Optional but good for UX) */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button className="w-14 h-14 neon-bg rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-cyan-500/40">
          <Search className="w-6 h-6" />
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-16 px-4 md:px-8 bg-slate-950/50 mt-20">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="neon-bg p-2 rounded-xl">
                  <Tv className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-black tracking-tight text-white">
                  NEXUS<span className="text-cyan-400">TV</span>
                </h1>
              </div>
              <p className="text-slate-500 max-w-sm leading-relaxed mb-8">
                A Nexus TV é a plataforma líder em entretenimento digital, oferecendo acesso instantâneo aos melhores canais do mundo com tecnologia de ponta.
              </p>
              <div className="flex gap-4">
                {['Twitter', 'Instagram', 'Discord', 'Telegram'].map(social => (
                  <a key={social} href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-cyan-500/10 hover:text-cyan-400 transition-all">
                    <span className="sr-only">{social}</span>
                    <div className="w-5 h-5 bg-current opacity-20 rounded-sm"></div>
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6">Navegação</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Início</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Calendário</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Canais Premium</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Minha Lista</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Suporte</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Status do Servidor</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-mono uppercase tracking-widest text-slate-600">
            <p>© 2026 NEXUS TV LIVE • ALL RIGHTS RESERVED</p>
            <p>DESIGNED FOR THE FUTURE OF STREAMING</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
