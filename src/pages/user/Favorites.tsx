
import React, { useState, useMemo } from 'react';
import UserLayout from '../../components/user/UserLayout';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { 
  Heart, 
  Play, 
  Tv, 
  X,
  Star,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Channel } from '../../types';

const UserFavorites = () => {
  const { user, toggleFavorite } = useAuth();
  const { channels, plans } = useData();
  
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isLoadingPlayer, setIsLoadingPlayer] = useState(false);

  const userPlan = plans.find(p => p.id === user?.planId);
  const favoriteChannels = channels.filter(c => 
    user?.favorites?.includes(c.id) && 
    userPlan?.categoryIds.includes(c.categoryId)
  );

  const handleWatch = (channel: Channel) => {
    setIsLoadingPlayer(true);
    setSelectedChannel(channel);
    setTimeout(() => setIsLoadingPlayer(false), 1500);
  };

  return (
    <UserLayout>
      <header className="mb-12">
        <h1 className="text-4xl font-black tracking-tighter text-white">Seus Favoritos</h1>
        <p className="text-slate-500 text-sm font-medium">Acesso rápido aos canais que você mais gosta.</p>
      </header>

      {/* Favorites Grid */}
      {favoriteChannels.length > 0 ? (
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
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-slate-600">
          <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center mb-6 border border-white/5">
            <Heart size={40} className="opacity-20" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">Nenhum favorito ainda</h3>
          <p className="text-sm font-medium max-w-xs text-center">Comece a favoritar seus canais preferidos para vê-los aqui.</p>
          <button 
            onClick={() => window.location.href = '/channels'}
            className="mt-8 bg-white text-slate-950 px-8 py-3 rounded-2xl font-black text-sm tracking-tight hover:bg-red-600 hover:text-white transition-all"
          >
            EXPLORAR CANAIS
          </button>
        </div>
      )}

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
    </UserLayout>
  );
};

// Reusable Components (Same as Home.tsx)
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

        <button 
          onClick={onToggleFavorite}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md border transition-all ${
            isFavorite ? 'bg-red-600 border-red-500 text-white' : 'bg-black/20 border-white/10 text-white/60 hover:text-white'
          }`}
        >
          <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>

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
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">Favorito</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const PlayerModal = ({ channel, isLoading, onClose }: any) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-8 bg-black/95 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-6xl aspect-video bg-black rounded-none md:rounded-[2.5rem] overflow-hidden relative shadow-2xl border border-white/5"
      >
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

        <div className="w-full h-full flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-black text-white uppercase tracking-[0.2em] animate-pulse">Sintonizando Canal...</p>
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
      </motion.div>
    </div>
  );
};

export default UserFavorites;
