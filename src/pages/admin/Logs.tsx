
import React, { useState, useMemo } from 'react';
import AdminSidebar from '../../components/admin/Sidebar';
import { useData } from '../../context/DataContext';
import { 
  History, 
  Search, 
  Filter, 
  Activity, 
  AlertTriangle, 
  ShieldAlert, 
  Clock,
  ChevronLeft,
  ChevronRight,
  Download,
  Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminLogs = () => {
  const { loginAttempts } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return loginAttempts.filter(l => {
      const matchesSearch = l.username.toLowerCase().includes(search.toLowerCase()) || 
                           l.ip.includes(search);
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'success' ? l.success : !l.success);
      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [loginAttempts, search, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      <AdminSidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white">Logs & Acessos</h1>
            <p className="text-slate-500 text-sm font-medium">Monitore todas as tentativas de entrada no sistema.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-slate-900 hover:bg-slate-800 border border-slate-800 px-6 py-3 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2">
              <Download size={18} />
              EXPORTAR LOGS
            </button>
            <button className="bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 px-6 py-3 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2">
              <Trash2 size={18} />
              LIMPAR LOGS
            </button>
          </div>
        </header>

        {/* Filters */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl mb-8 flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por usuário ou IP..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-red-500/50 transition-all text-sm"
            />
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full lg:w-48">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-10 pr-4 focus:outline-none focus:border-red-500/50 transition-all text-sm appearance-none"
              >
                <option value="all">Todos Status</option>
                <option value="success">Sucesso</option>
                <option value="failed">Falhas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 border-b border-slate-800">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Data & Hora</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Usuário</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">IP de Acesso</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Motivo / Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {paginatedLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <Clock size={14} className="text-slate-600" />
                        {new Date(l.date).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-white">{l.username}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                        {l.ip}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        l.success ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {l.success ? <Activity size={12} /> : <ShieldAlert size={12} />}
                        {l.success ? 'Sucesso' : 'Falhou'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-medium text-slate-500">
                        {l.reason || (l.success ? 'Login realizado com sucesso' : 'Senha incorreta')}
                      </p>
                    </td>
                  </tr>
                ))}
                {paginatedLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <History size={40} className="mx-auto mb-4 opacity-10" />
                      <p className="text-sm font-bold text-slate-600">Nenhum log encontrado para os filtros atuais.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-slate-950/50 px-6 py-4 flex items-center justify-between border-t border-slate-800">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Página <span className="text-white">{currentPage}</span> de <span className="text-white">{totalPages || 1}</span>
            </p>
            <div className="flex items-center gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 disabled:opacity-30 hover:text-white transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 disabled:opacity-30 hover:text-white transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLogs;
