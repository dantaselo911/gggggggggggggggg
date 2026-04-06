
import React, { useState } from 'react';
import UserLayout from '../../components/user/UserLayout';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { 
  User as UserIcon, 
  ShieldCheck, 
  Calendar, 
  CreditCard, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  History,
  Smartphone
} from 'lucide-react';
import { motion } from 'framer-motion';

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const { plans } = useData();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const userPlan = plans.find(p => p.id === user?.planId);
  const daysRemaining = Math.ceil((new Date(user?.expiresAt || '').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'As novas senhas não coincidem.' });
      return;
    }

    if (newPassword.length < 4) {
      setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 4 caracteres.' });
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      if (user) {
        updateUser({ ...user, password: newPassword });
        setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
      setIsSaving(false);
    }, 1000);
  };

  return (
    <UserLayout>
      <header className="mb-12">
        <h1 className="text-4xl font-black tracking-tighter text-white">Minha Conta</h1>
        <p className="text-slate-500 text-sm font-medium">Gerencie seus dados e acompanhe sua assinatura.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] text-center">
            <div className="relative inline-block mb-6">
              <img 
                src={user?.avatar} 
                alt="Avatar" 
                className="w-32 h-32 rounded-[2rem] border-4 border-slate-950 shadow-2xl"
              />
              {user?.isVip && (
                <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-slate-950 p-2 rounded-xl border-4 border-slate-950 shadow-xl">
                  <ShieldCheck size={20} />
                </div>
              )}
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">{user?.name}</h2>
            <p className="text-slate-500 text-sm font-bold tracking-widest uppercase mt-1">@{user?.username}</p>
            
            <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Status</span>
                <span className="text-green-500 font-black uppercase tracking-widest text-[10px] bg-green-500/10 px-2 py-1 rounded-md">Ativo</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Membro Desde</span>
                <span className="text-white font-bold">{new Date(user?.createdAt || '').toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">ID do Cliente</span>
                <span className="text-white font-mono text-[10px]">{user?.id}</span>
              </div>
            </div>
          </div>

          {/* Subscription Card */}
          <div className="bg-gradient-to-br from-red-600 to-red-800 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-red-600/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/20 rounded-2xl">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-black tracking-tight">Sua Assinatura</h3>
            </div>
            
            <div className="mb-8">
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Plano Atual</p>
              <p className="text-3xl font-black tracking-tighter">{userPlan?.name}</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-sm font-bold">
                <Calendar size={18} className="opacity-60" />
                Vence em {new Date(user?.expiresAt || '').toLocaleDateString()}
              </div>
              <div className="flex items-center gap-3 text-sm font-bold">
                <Smartphone size={18} className="opacity-60" />
                Limite de {user?.maxDevices} Dispositivos
              </div>
            </div>

            <div className="bg-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest">Tempo Restante</span>
                <span className="text-[10px] font-black uppercase tracking-widest">{daysRemaining} Dias</span>
              </div>
              <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full" 
                  style={{ width: `${Math.min(100, (daysRemaining / 30) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Password Change */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem]">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-500">
                <Lock size={24} />
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">Alterar Senha</h3>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Senha Atual</label>
                  <div className="relative">
                    <input 
                      type={showPasswords ? 'text' : 'password'}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 rounded-2xl py-3.5 px-4 focus:outline-none focus:border-red-500/50 transition-all text-sm"
                    />
                  </div>
                </div>
                <div className="hidden md:block"></div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Nova Senha</label>
                  <input 
                    type={showPasswords ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-white/5 rounded-2xl py-3.5 px-4 focus:outline-none focus:border-red-500/50 transition-all text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Confirmar Nova Senha</label>
                  <input 
                    type={showPasswords ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-white/5 rounded-2xl py-3.5 px-4 focus:outline-none focus:border-red-500/50 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button 
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-white transition-colors"
                >
                  {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                  {showPasswords ? 'Ocultar Senhas' : 'Mostrar Senhas'}
                </button>
                
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="bg-white text-slate-950 px-8 py-3.5 rounded-2xl font-black text-sm tracking-tight hover:bg-red-600 hover:text-white transition-all shadow-xl shadow-white/5 active:scale-95"
                >
                  {isSaving ? 'SALVANDO...' : 'ATUALIZAR SENHA'}
                </button>
              </div>

              {message && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold ${
                    message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                  }`}
                >
                  {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  {message.text}
                </motion.div>
              )}
            </form>
          </div>

          {/* Access History */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem]">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-purple-600/10 rounded-2xl text-purple-500">
                <History size={24} />
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">Histórico de Acessos</h3>
            </div>

            <div className="space-y-4">
              {user?.loginHistory && user.loginHistory.length > 0 ? (
                user.loginHistory.map((login, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-950/50 border border-white/5 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-500">
                        <Smartphone size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{login.device}</p>
                        <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">{login.ip}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-400">{new Date(login.date).toLocaleDateString()}</p>
                      <p className="text-[10px] text-slate-600 font-bold">{new Date(login.date).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm font-bold text-slate-600 italic">Nenhum histórico de acesso disponível.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default UserProfile;
