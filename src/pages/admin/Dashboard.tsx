
import React from 'react';
import AdminSidebar from '../../components/admin/Sidebar';
import { useData } from '../../context/DataContext';
import { 
  Users, 
  Tv, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  Clock,
  UserPlus,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { users, channels, loginAttempts } = useData();

  const metrics = [
    { 
      label: 'Total de Usuários', 
      value: users.length, 
      icon: Users, 
      color: 'bg-blue-600', 
      trend: '+12%', 
      isPositive: true 
    },
    { 
      label: 'Usuários Ativos', 
      value: users.filter(u => u.status === 'active').length, 
      icon: Activity, 
      color: 'bg-green-600', 
      trend: '+5%', 
      isPositive: true 
    },
    { 
      label: 'Usuários Vencidos', 
      value: users.filter(u => u.status === 'expired').length, 
      icon: Clock, 
      color: 'bg-orange-600', 
      trend: '-2%', 
      isPositive: false 
    },
    { 
      label: 'Canais Ativos', 
      value: channels.filter(c => c.status === 'online').length, 
      icon: Tv, 
      color: 'bg-purple-600', 
      trend: 'Estável', 
      isPositive: true 
    },
    { 
      label: 'Logins Hoje', 
      value: loginAttempts.filter(l => l.success).length, 
      icon: TrendingUp, 
      color: 'bg-red-600', 
      trend: '+24%', 
      isPositive: true 
    },
    { 
      label: 'Acessos Suspeitos', 
      value: loginAttempts.filter(l => !l.success).length, 
      icon: ShieldAlert, 
      color: 'bg-slate-800', 
      trend: '0', 
      isPositive: true 
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      <AdminSidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white">Dashboard</h1>
            <p className="text-slate-500 text-sm font-medium">Bem-vindo ao centro de controle Nexus.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-slate-900 hover:bg-slate-800 border border-slate-800 px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
              <Clock size={18} className="text-slate-500" />
              Ver Logs
            </button>
            <button className="bg-red-600 hover:bg-red-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-xl shadow-red-600/20 transition-all flex items-center gap-2">
              <UserPlus size={18} />
              Novo Usuário
            </button>
          </div>
        </header>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {metrics.map((m, idx) => (
            <motion.div 
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl group hover:border-red-500/30 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${m.color} rounded-2xl flex items-center justify-center shadow-lg shadow-black/20 group-hover:scale-110 transition-transform`}>
                  <m.icon size={24} className="text-white" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold ${m.isPositive ? 'text-green-500' : 'text-red-500'} bg-slate-950 px-2 py-1 rounded-lg`}>
                  {m.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {m.trend}
                </div>
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{m.label}</p>
              <h3 className="text-3xl font-black text-white tracking-tight">{m.value}</h3>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-bold text-white">Usuários Recentes</h4>
              <button className="text-red-500 hover:text-red-400 text-sm font-bold transition-colors">Ver todos</button>
            </div>
            <div className="space-y-4">
              {users.slice(0, 5).map((u) => (
                <div key={u.id} className="flex items-center justify-between p-3 bg-slate-950/50 rounded-2xl border border-slate-800/50 hover:border-slate-700 transition-all">
                  <div className="flex items-center gap-3">
                    <img src={u.avatar} alt={u.username} className="w-10 h-10 rounded-xl border border-slate-800" />
                    <div>
                      <p className="text-sm font-bold text-white">{u.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{u.username}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${
                      u.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {u.status}
                    </span>
                    <p className="text-[10px] text-slate-600 font-bold mt-1">Exp: {new Date(u.expiresAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Logins */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-bold text-white">Logins Recentes</h4>
              <button className="text-red-500 hover:text-red-400 text-sm font-bold transition-colors">Ver todos</button>
            </div>
            <div className="space-y-4">
              {loginAttempts.length > 0 ? (
                loginAttempts.slice(0, 5).map((l) => (
                  <div key={l.id} className="flex items-center justify-between p-3 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${l.success ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {l.success ? <Activity size={20} /> : <AlertTriangle size={20} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{l.username}</p>
                        <p className="text-[10px] text-slate-500 font-bold tracking-widest">{l.ip}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold">{new Date(l.date).toLocaleTimeString()}</p>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${l.success ? 'text-green-500' : 'text-red-500'}`}>
                        {l.success ? 'Sucesso' : 'Falhou'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-slate-600">
                  <Activity size={40} className="mb-2 opacity-20" />
                  <p className="text-sm font-bold">Nenhum login registrado ainda.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
