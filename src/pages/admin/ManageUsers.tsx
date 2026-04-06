
import React, { useState, useMemo } from 'react';
import AdminSidebar from '../../components/admin/Sidebar';
import { useData } from '../../context/DataContext';
import { db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Power, 
  RefreshCw, 
  UserCheck, 
  UserX,
  Copy,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Calendar,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, UserStatus } from '../../types';

const ManageUsers = () => {
  const { users, plans, addUser, updateUser, deleteUser } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [planFilter, setPlanFilter] = useState<string | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                           u.username.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
      const matchesPlan = planFilter === 'all' || u.planId === planFilter;
      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [users, search, statusFilter, planFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenModal = (user?: User) => {
    setEditingUser(user || null);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (userData: any) => {
    setIsSaving(true);
    try {
      if (editingUser) {
        // Update existing user in Firestore
        const userDocRef = doc(db, 'users', editingUser.id);
        await updateDoc(userDocRef, { ...userData });
      } else {
        // Create new user via Backend API
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
        
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
      }
      setIsModalOpen(false);
    } catch (error: any) {
      alert('Erro ao salvar usuário: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (uid: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
      try {
        const response = await fetch(`/api/admin/users/${uid}`, {
          method: 'DELETE'
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
      } catch (error: any) {
        alert('Erro ao excluir usuário: ' + error.message);
      }
    }
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = !user.isActive;
    const userDocRef = doc(db, 'users', user.id);
    await updateDoc(userDocRef, { isActive: newStatus });
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      <AdminSidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white">Gerenciar Usuários</h1>
            <p className="text-slate-500 text-sm font-medium">Controle total sobre as contas dos seus clientes.</p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-2xl text-sm font-black shadow-xl shadow-red-600/20 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Plus size={20} />
            CRIAR NOVO USUÁRIO
          </button>
        </header>

        {/* Filters & Search */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl mb-8 flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou login..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-red-500/50 transition-all text-sm"
            />
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full lg:w-40">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-10 pr-4 focus:outline-none focus:border-red-500/50 transition-all text-sm appearance-none"
              >
                <option value="all">Todos Status</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
                <option value="expired">Expirados</option>
                <option value="blocked">Bloqueados</option>
              </select>
            </div>
            <div className="relative w-full lg:w-48">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <select 
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-10 pr-4 focus:outline-none focus:border-red-500/50 transition-all text-sm appearance-none"
              >
                <option value="all">Todos Planos</option>
                {plans.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 border-b border-slate-800">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Usuário</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Plano</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Expiração</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Dispositivos</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {paginatedUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img src={u.avatar} alt={u.username} className="w-10 h-10 rounded-xl border border-slate-800" />
                          {u.isVip && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                              <ShieldCheck size={8} className="text-slate-900" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-red-500 transition-colors">{u.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        u.status === 'active' ? 'bg-green-500/10 text-green-500' : 
                        u.status === 'expired' ? 'bg-orange-500/10 text-orange-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {u.status === 'active' ? <CheckCircle2 size={12} /> : 
                         u.status === 'expired' ? <AlertCircle size={12} /> : <XCircle size={12} />}
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-300 bg-slate-800 px-2 py-1 rounded-md">
                        {plans.find(p => p.id === u.planId)?.name || 'Sem Plano'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <Calendar size={14} className="text-slate-600" />
                        {new Date(u.expiresAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-slate-400">
                        <span className="text-white">{u.activeSessions}</span> / {u.maxDevices}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleToggleStatus(u)}
                          title={u.status === 'active' ? 'Desativar' : 'Ativar'}
                          className={`p-2 rounded-lg transition-all ${u.status === 'active' ? 'text-slate-500 hover:bg-red-500/10 hover:text-red-500' : 'text-slate-500 hover:bg-green-500/10 hover:text-green-500'}`}
                        >
                          <Power size={18} />
                        </button>
                        <button 
                          onClick={() => handleOpenModal(u)}
                          title="Editar"
                          className="p-2 text-slate-500 hover:bg-blue-500/10 hover:text-blue-500 rounded-lg transition-all"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(u.id)}
                          title="Excluir"
                          className="p-2 text-slate-500 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-slate-950/50 px-6 py-4 flex items-center justify-between border-t border-slate-800">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Mostrando <span className="text-white">{paginatedUsers.length}</span> de <span className="text-white">{filteredUsers.length}</span> usuários
            </p>
            <div className="flex items-center gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 disabled:opacity-30 hover:text-white transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-xs font-black text-white px-3">Página {currentPage} de {totalPages || 1}</span>
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

      {/* User Modal (Create/Edit) */}
      <AnimatePresence>
        {isModalOpen && (
          <UserModal 
            user={editingUser} 
            onClose={() => setIsModalOpen(false)} 
            plans={plans}
            isSaving={isSaving}
            onSave={handleSaveUser}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Internal User Modal Component
const UserModal = ({ user, onClose, plans, onSave, isSaving }: any) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    password: user?.password || '',
    status: user?.status || 'active',
    planId: user?.planId || plans[0]?.id || '',
    expiresAt: user?.expiresAt ? user.expiresAt.split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    maxDevices: user?.maxDevices || 1,
    isVip: user?.isVip || false,
    notes: user?.notes || '',
    role: user?.role || 'user'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      expiresAt: new Date(formData.expiresAt).toISOString()
    });
  };

  const generateRandomPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let pass = '';
    for (let i = 0; i < 10; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
    setFormData({ ...formData, password: pass });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-black tracking-tighter text-white">
                {user ? 'Editar Usuário' : 'Novo Usuário'}
              </h3>
              <p className="text-slate-500 text-sm font-medium">Preencha os dados para configurar o acesso.</p>
            </div>
            <button onClick={onClose} className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 hover:text-white transition-all">
              <Plus className="rotate-45" size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Nome Completo</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 focus:outline-none focus:border-red-500/50 transition-all text-sm"
              />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Username / Login</label>
              <input 
                type="text" 
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 focus:outline-none focus:border-red-500/50 transition-all text-sm"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Senha</label>
                <button 
                  type="button" 
                  onClick={generateRandomPassword}
                  className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400"
                >
                  Gerar Automática
                </button>
              </div>
              <input 
                type="text" 
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 focus:outline-none focus:border-red-500/50 transition-all text-sm"
              />
            </div>

            {/* Plan */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Plano de Acesso</label>
              <select 
                value={formData.planId}
                onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 focus:outline-none focus:border-red-500/50 transition-all text-sm appearance-none"
              >
                {plans.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name} - R$ {p.price.toFixed(2)}</option>
                ))}
              </select>
            </div>

            {/* Expiration */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Data de Expiração</label>
              <input 
                type="date" 
                required
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 focus:outline-none focus:border-red-500/50 transition-all text-sm"
              />
            </div>

            {/* Max Devices */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Limite de Dispositivos</label>
              <input 
                type="number" 
                min="1"
                max="10"
                value={formData.maxDevices}
                onChange={(e) => setFormData({ ...formData, maxDevices: parseInt(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 focus:outline-none focus:border-red-500/50 transition-all text-sm"
              />
            </div>

            {/* Status & VIP */}
            <div className="flex items-center gap-6">
              <div className="space-y-2 flex-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Status</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 focus:outline-none focus:border-red-500/50 transition-all text-sm appearance-none"
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="blocked">Bloqueado</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">VIP</label>
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, isVip: !formData.isVip })}
                  className={`w-full h-[46px] px-6 rounded-2xl border transition-all flex items-center justify-center gap-2 font-black text-[10px] tracking-widest ${
                    formData.isVip ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500' : 'bg-slate-950 border-slate-800 text-slate-600'
                  }`}
                >
                  <ShieldCheck size={16} />
                  {formData.isVip ? 'VIP ATIVO' : 'MARCAR VIP'}
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Observações Internas</label>
              <textarea 
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 focus:outline-none focus:border-red-500/50 transition-all text-sm resize-none"
                placeholder="Apenas o administrador vê isso..."
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-4 mt-4">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 bg-slate-950 border border-slate-800 text-slate-400 font-black py-4 rounded-2xl hover:text-white transition-all"
              >
                CANCELAR
              </button>
              <button 
                type="submit"
                disabled={isSaving}
                className="flex-[2] bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-red-600/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSaving ? 'PROCESSANDO...' : (user ? 'SALVAR ALTERAÇÕES' : 'CRIAR ACESSO AGORA')}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ManageUsers;
