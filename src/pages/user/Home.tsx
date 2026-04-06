
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { 
  Search, 
  User, 
  LogOut, 
  Heart, 
  Clock, 
  Tv, 
  LayoutGrid, 
  Play, 
  ShieldCheck, 
  Bell,
  Menu,
  X,
  ChevronRight,
  Star,
  Zap,
  Calendar,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Channel } from '../../types';

const UserHome = () => {
  const { user, logout } = useAuth();
  const { channels, categories, plans, settings } = useData();
  const navigate = useNavigate();
  
  const [search, setSearch] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isLoadingPlayer, setIsLoadingPlayer] = useState(false);

  // Favorites & Recents (Simulated with localStorage)
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem(`nexus-fav-${user?.id}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [recents, setRecents] = useState<string[]>(() => {
    const saved = localStorage.getItem(`nexus-recent-${user?.id}`);
    return saved ? JSON.parse(saved) : [];
  });

  const toggleFavorite = (id: string) => {
    const newFavs = favorites.includes(id) 
      ? favorites.filter(fid => fid !== id) 
      : [id, ...favorites];
    setFavorites(newFavs);
    localStorage.setItem(`nexus-fav-${user?.id}`, JSON.stringify(newFavs));
  };

  const addToRecents = (id: string) => {
    const newRecents = [id, ...recents.filter(rid => rid !== id)].slice(0, 10);
    setRecents(newRecents);
    localStorage.setItem(`nexus-recent-${user?.id}`, JSON.stringify(newRecents));
  };

  const handleWatch = (channel: Channel) => {
    setIsLoadingPlayer(true);
    setSelectedChannel(channel);
    addToRecents(channel.id);
    setTimeout(() => setIsLoadingPlayer(false), 1500);
  };

  const userPlan = plans.find(p => p.id === user?.planId);
  const featuredChannels = channels.filter(c => c.isFeatured && userPlan?.categoryIds.includes(c.categoryId));
  const favoriteChannels = channels.filter(c => favorites.includes(c.id));
  const recentChannels = channels.filter(c => recents.includes(c.id));

  const daysRemaining = Math.ceil((new Date(user?.expiresAt || '').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-red-500/30">
      {/* User Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/home')}>
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-600/20">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <span className="text-lg font-black tracking-tighter text-white hidden sm:block">{settings.siteName}</span>
            </div>
            
            <div className="hidden lg:flex items-center gap-6">
              <button onClick={() => navigate('/home')} className="text-sm font-bold text-white hover:text-red-500 transition-colors">Início</button>
              <button onClick={() => navigate('/channels')} className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Canais</button>
              <button onClick={() => navigate('/favorites')} className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Favoritos</button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Buscar canal..." 
                className="bg-slate-900 border border-white/5 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-red-500/50 w-64 transition-all"
              />
            </div>
            
            <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-950"></span>
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-white/5">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-white leading-none">{user?.name}</p>
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-1">{userPlan?.name}</p>
              </div>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-10 h-10 rounded-xl border border-white/10 overflow-hidden hover:border-red-500/50 transition-all"
              >
                <img src={user?.avatar} alt="Avatar" className="w-full h-full object-cover" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 md:right-8 z-[60] w-64 bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-2"
          >
            <div className="p-4 border-b border-white/5 mb-2">
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Sua Conta</p>
              <div className="flex items-center gap-2 text-green-500">
                <Zap size={14} />
                <span className="text-xs font-bold">Acesso {user?.status}</span>
              </div>
            </div>
            <button onClick={() => navigate('/profile')} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-300 hover:bg-white/5 transition-all">
              <User size={18} />
              <span className="text-sm font-bold">Meu Perfil</span>
            </button>
            <button onClick={() => navigate('/favorites')} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-300 hover:bg-white/5 transition-all">
              <Heart size={18} />
              <span className="text-sm font-bold">Favoritos</span>
            </button>
            <button onClick={() => logout()} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all mt-2">
              <LogOut size={18} />
              <span className="text-sm font-bold">Sair da Conta</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-8">
        {/* Welcome Banner */}
        <div className="relative rounded-[2.5rem] overflow-hidden mb-12 group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-blue-600/20 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
          <img 
            src="https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&q=80&w=1600" 
            alt="Hero" 
            className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-1000"
          />
          
          <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase shadow-lg shadow-red-600/20">Destaque</span>
              <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase">4K Ultra HD</span>
            </div>
            <h2 className="text-4 text-4xl md:text-6xl font-black tracking-tighter text-white mb-4 leading-none">
              Olá, {user?.name.split(' ')[0]}! 👋
            </h2>
            <p className="text-slate-300 text-lg font-medium mb-8 leading-relaxed">
              {settings.messages.welcome} Sua conta <span className="text-white font-bold">{userPlan?.name}</span> está ativa por mais <span className="text-red-500 font-bold">{daysRemaining} dias</span>.
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={() => navigate('/channels')}
                className="bg-white text-slate-950 px-8 py-4 rounded-2xl font-black text-sm tracking-tight hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 shadow-xl shadow-white/5 active:scale-95"
              >
                <Play size={20} fill="currentColor" />
                ASSISTIR AGORA
              </button>
              <button className="bg-white/10 backdrop-blur-md border border-white/10 text-white px-8 py-4 rounded-2xl font-black text-sm tracking-tight hover:bg-white/20 transition-all flex items-center gap-2 active:scale-95">
                <LayoutGrid size={20} />
                CATEGORIAS
              </button>
            </div>
          </div>
        </div>

        {/* Account Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Validade da Conta</p>
              <p className="text-lg font-black text-white">{new Date(user?.expiresAt || '').toLocaleDateString()}</p>
            </div>
          </div>
          <div className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Seu Plano Atual</p>
              <p className="text-lg font-black text-white">{userPlan?.name}</p>
            </div>
          </div>
          <div className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-yellow-500">
              <Star size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status VIP</p>
              <p className="text-lg font-black text-white">{user?.isVip ? 'Membro VIP' : 'Membro Comum'}</p>
            </div>
          </div>
        </div>

        {/* Featured Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-red-600 rounded-full"></div>
              <h3 className="text-2xl font-black tracking-tighter text-white">Canais em Destaque</h3>
            </div>
            <button onClick={() => navigate('/channels')} className="text-sm font-bold text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1">
              Ver todos <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {featuredChannels.map((channel) => (
              <ChannelCard 
                key={channel.id} 
                channel={channel} 
                isFavorite={favorites.includes(channel.id)}
                onToggleFavorite={() => toggleFavorite(channel.id)}
                onWatch={() => handleWatch(channel)}
              />
            ))}
          </div>
        </section>

        {/* Favorites Section */}
        {favoriteChannels.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-pink-600 rounded-full"></div>
              <h3 className="text-2xl font-black tracking-tighter text-white">Seus Favoritos</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {favoriteChannels.map((channel) => (
                <ChannelCard 
                  key={channel.id} 
                  channel={channel} 
                  isFavorite={true}
                  onToggleFavorite={() => toggleFavorite(channel.id)}
                  onWatch={() => handleWatch(channel)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Recent Section */}
        {recentChannels.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-blue-600 rounded-full"></div>
              <h3 className="text-2xl font-black tracking-tighter text-white">Assistidos Recentemente</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {recentChannels.map((channel) => (
                <ChannelCard 
                  key={channel.id} 
                  channel={channel} 
                  isFavorite={favorites.includes(channel.id)}
                  onToggleFavorite={() => toggleFavorite(channel.id)}
                  onWatch={() => handleWatch(channel)}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Player Modal */}
      <AnimatePresence>
        {selectedChannel && (
          <PlayerModal 
            channel={selectedChannel} 
            isLoading={isLoadingPlayer}
            onClose={() => setSelectedChannel(null)} 
          />
        )}
      </AnimatePresence>

      {/* Expiration Warning */}
      {settings.enableExpirationWarning && daysRemaining <= 5 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4">
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-orange-600 text-white p-4 rounded-3xl shadow-2xl flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest leading-none mb-1">Aviso de Expiração</p>
                <p className="text-sm font-bold opacity-90">Seu acesso vence em {daysRemaining} dias.</p>
              </div>
            </div>
            <button className="bg-white text-orange-600 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform">
              RENOVAR
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Channel Card Component
const ChannelCard = ({ channel, isFavorite, onToggleFavorite, onWatch }: any) => {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden group relative"
    >
      <div className="aspect-video relative overflow-hidden">
        <img 
          src={channel.thumbnail || 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&q=80&w=800'} 
          alt={channel.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {channel.isPremium && (
            <span className="bg-yellow-500 text-slate-950 text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest">Premium</span>
          )}
          <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${
            channel.status === 'online' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {channel.status}
          </span>
        </div>

        {/* Favorite Button */}
        <button 
          onClick={onToggleFavorite}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md border transition-all ${
            isFavorite ? 'bg-red-600 border-red-500 text-white' : 'bg-black/20 border-white/10 text-white/60 hover:text-white'
          }`}
        >
          <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>

        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
          <button 
            onClick={onWatch}
            className="w-14 h-14 bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-red-600/40 scale-75 group-hover:scale-100 transition-transform duration-300"
          >
            <Play size={24} fill="currentColor" className="ml-1" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-white rounded-lg p-1 flex items-center justify-center border border-white/10">
            <img src={channel.logo} alt="Logo" className="max-w-full max-h-full object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-black text-white truncate group-hover:text-red-500 transition-colors">{channel.name}</h4>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">Canais Abertos</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Player Modal Component
const PlayerModal = ({ channel, isLoading, onClose }: any) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-8 bg-black/95 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-6xl aspect-video bg-black rounded-none md:rounded-[2.5rem] overflow-hidden relative shadow-2xl border border-white/5"
      >
        {/* Header */}
        <div className="absolute top-0 left-0 w-full p-6 flex items-center justify-between z-10 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-xl p-2">
              <img src={channel.logo} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white leading-none">{channel.name}</h3>
              <p className="text-xs font-bold text-red-500 uppercase tracking-widest mt-1">Ao Vivo • Full HD</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 bg-white/10 hover:bg-red-600 text-white rounded-2xl flex items-center justify-center transition-all active:scale-90"
          >
            <X size={24} />
          </button>
        </div>

        {/* Player Area */}
        <div className="w-full h-full flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-black text-white uppercase tracking-[0.2em] animate-pulse">Sintonizando Canal...</p>
            </div>
          ) : channel.status === 'offline' ? (
            <div className="flex flex-col items-center gap-4 text-center px-8">
              <div className="w-20 h-20 bg-red-600/10 rounded-full flex items-center justify-center text-red-600 mb-2">
                <ShieldCheck size={40} />
              </div>
              <h4 className="text-2xl font-black text-white tracking-tighter">Canal Temporariamente Fora do Ar</h4>
              <p className="text-slate-400 max-w-md">Este canal está passando por manutenção técnica. Tente novamente em alguns minutos.</p>
              <button onClick={onClose} className="mt-4 bg-white text-slate-950 px-8 py-3 rounded-2xl font-black text-sm">VOLTAR PARA INÍCIO</button>
            </div>
          ) : (
            <iframe 
              src={channel.streamUrl} 
              className="w-full h-full border-none"
              allowFullScreen
              title={channel.name}
            />
          )}
        </div>

        {/* Footer Controls */}
        <div className="absolute bottom-0 left-0 w-full p-6 flex items-center justify-between z-10 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-4">
            <button className="text-white/60 hover:text-white transition-colors"><Star size={20} /></button>
            <button className="text-white/60 hover:text-white transition-colors"><Heart size={20} /></button>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">LIVE</span>
            </div>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">1080p • 60FPS</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserHome;
