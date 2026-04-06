
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { 
  Search, 
  User, 
  LogOut, 
  Heart, 
  Tv, 
  ShieldCheck, 
  Bell,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UserLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { plans, settings } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const userPlan = plans.find(p => p.id === user?.planId);

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
              <button 
                onClick={() => navigate('/home')} 
                className={`text-sm font-bold transition-colors ${location.pathname === '/home' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Início
              </button>
              <button 
                onClick={() => navigate('/channels')} 
                className={`text-sm font-bold transition-colors ${location.pathname === '/channels' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Canais
              </button>
              <button 
                onClick={() => navigate('/favorites')} 
                className={`text-sm font-bold transition-colors ${location.pathname === '/favorites' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Favoritos
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
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
        {children}
      </main>
    </div>
  );
};

export default UserLayout;
