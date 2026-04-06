
import React, { useState, useMemo } from 'react';
import AdminSidebar from '../../components/admin/Sidebar';
import { useData } from '../../context/DataContext';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  Power, 
  Tv, 
  LayoutGrid, 
  Play, 
  Star,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Link as LinkIcon,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MoreVertical,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Channel } from '../../types';

const ManageChannels = () => {
  const { channels, categories, plans, addChannel, updateChannel, deleteChannel } = useData();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtered Channels
  const filteredChannels = useMemo(() => {
    return channels.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || c.categoryId === categoryFilter;
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [channels, search, categoryFilter, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredChannels.length / itemsPerPage);
  const paginatedChannels = filteredChannels.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenModal = (channel?: Channel) => {
    setEditingChannel(channel || null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este canal?')) {
      deleteChannel(id);
    }
  };

  const handleToggleStatus = (channel: Channel) => {
    const newStatus: any = channel.status === 'online' ? 'offline' : 'online';
    updateChannel({ ...channel, status: newStatus });
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      <AdminSidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white">Gerenciar Canais</h1>
            <p className="text-slate-500 text-sm font-medium">Organize sua grade de programação premium.</p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-2xl text-sm font-black shadow-xl shadow-red-600/20 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Plus size={20} />
            ADICIONAR CANAL
          </button>
        </header>

        {/* Filters & Search */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl mb-8 flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar canal pelo nome..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-red-500/50 transition-all text-sm"
            />
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full lg:w-48">
              <LayoutGrid className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-10 pr-4 focus:outline-none focus:border-red-500/50 transition-all text-sm appearance-none"
              >
                <option value="all">Todas Categorias</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="relative w-full lg:w-40">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-10 pr-4 focus:outline-none focus:border-red-500/50 transition-all text-sm appearance-none"
              >
                <option value="all">Todos Status</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="maintenance">Manutenção</option>
              </select>
            </div>
          </div>
        </div>

        {/* Channels Table */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 border-b border-slate-800">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Canal</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Categoria</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Destaque</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Premium</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {paginatedChannels.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl p-1.5 border border-slate-800 flex items-center justify-center">
                          <img src={c.logo} alt={c.name} className="max-w-full max-h-full object-contain" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-red-500 transition-colors">{c.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase truncate max-w-[150px]">{c.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-300 bg-slate-800 px-2 py-1 rounded-md">
                        {categories.find(cat => cat.id === c.categoryId)?.name || 'Sem Categoria'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        c.status === 'online' ? 'bg-green-500/10 text-green-500' : 
                        c.status === 'maintenance' ? 'bg-orange-500/10 text-orange-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {c.status === 'online' ? <CheckCircle2 size={12} /> : 
                         c.status === 'maintenance' ? <AlertCircle size={12} /> : <XCircle size={12} />}
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${c.isFeatured ? 'text-yellow-500' : 'text-slate-700'}`}>
                        <Star size={16} fill={c.isFeatured ? 'currentColor' : 'none'} />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${c.isPremium ? 'text-purple-500' : 'text-slate-700'}`}>
                        <ShieldCheck size={16} fill={c.isPremium ? 'currentColor' : 'none'} />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleToggleStatus(c)}
                          className={`p-2 rounded-lg transition-all ${c.status === 'online' ? 'text-slate-500 hover:bg-red-500/10 hover:text-red-500' : 'text-slate-500 hover:bg-green-500/10 hover:text-green-500'}`}
                        >
                          <Power size={18} />
                        </button>
                        <button 
                          onClick={() => handleOpenModal(c)}
                          className="p-2 text-slate-500 hover:bg-blue-500/10 hover:text-blue-500 rounded-lg transition-all"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(c.id)}
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
              Mostrando <span className="text-white">{paginatedChannels.length}</span> de <span className="text-white">{filteredChannels.length}</span> canais
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

      {/* Channel Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <ChannelModal 
            channel={editingChannel} 
            onClose={() => setIsModalOpen(false)} 
            categories={categories}
            plans={plans}
            onSave={(channelData) => {
              if (editingChannel) {
                updateChannel({ ...editingChannel, ...channelData });
              } else {
                addChannel({
                  id: `ch-${Date.now()}`,
                  order: channels.length + 1,
                  ...channelData
                } as Channel);
              }
              setIsModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Internal Channel Modal Component
const ChannelModal = ({ channel, onClose, categories, plans, onSave }: any) => {
  const [formData, setFormData] = useState({
    name: channel?.name || '',
    slug: channel?.slug || '',
    categoryId: channel?.categoryId || categories[0]?.id || '',
    logo: channel?.logo || '',
    thumbnail: channel?.thumbnail || '',
    streamUrl: channel?.streamUrl || '',
    status: channel?.status || 'online',
    isFeatured: channel?.isFeatured || false,
    isPremium: channel?.isPremium || false,
    planIds: channel?.planIds || plans.map((p: any) => p.id),
    description: channel?.description || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handlePlanToggle = (planId: string) => {
    const newPlanIds = formData.planIds.includes(planId)
      ? formData.planIds.filter((id: string) => id !== planId)
      : [...formData.planIds, planId];
    setFormData({ ...formData, planIds: newPlanIds });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-8 sticky top-0 bg-slate-900 z-10 py-2">
            <div>
              <h3 className="text-2xl font-black tracking-tighter text-white">
                {channel ? 'Editar Canal' : 'Novo Canal'}
              </h3>
              <p className="text-slate-500 text-sm font-medium">Configure os detalhes técnicos do streaming.</p>
            </div>
            <button onClick={onClose} className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 hover:text-white transition-all">
              <Plus className="rotate-45" size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Nome do Canal</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 focus:outline-none focus:border-red-500/50 transition-all text-sm"
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Slug / Identificador</label>
              <input 
                type="text" 
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 focus:outline-none focus:border-red-500/50 transition-all text-sm"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Categoria</label>
              <select 
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 focus:outline-none focus:border-red-500/50 transition-all text-sm appearance-none"
              >
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Status Inicial</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 focus:outline-none focus:border-red-500/50 transition-all text-sm appearance-none"
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="maintenance">Manutenção</option>
              </select>
            </div>

            {/* Logo URL */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">URL da Logo Oficial</label>
              <div className="relative">
                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="url" 
                  required
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-red-500/50 transition-all text-sm"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Thumbnail URL */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">URL da Capa / Thumbnail</label>
              <div className="relative">
                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="url" 
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-red-500/50 transition-all text-sm"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Stream URL */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Link do Player / Embed / M3U8</label>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text" 
                  required
                  value={formData.streamUrl}
                  onChange={(e) => setFormData({ ...formData, streamUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-red-500/50 transition-all text-sm"
                  placeholder="https://embedflix.click/..."
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-4">
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}
                className={`flex-1 h-[46px] rounded-2xl border transition-all flex items-center justify-center gap-2 font-black text-[10px] tracking-widest ${
                  formData.isFeatured ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500' : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
              >
                <Star size={16} fill={formData.isFeatured ? 'currentColor' : 'none'} />
                {formData.isFeatured ? 'EM DESTAQUE' : 'MARCAR DESTAQUE'}
              </button>
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, isPremium: !formData.isPremium })}
                className={`flex-1 h-[46px] rounded-2xl border transition-all flex items-center justify-center gap-2 font-black text-[10px] tracking-widest ${
                  formData.isPremium ? 'bg-purple-500/10 border-purple-500/50 text-purple-500' : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
              >
                <ShieldCheck size={16} />
                {formData.isPremium ? 'CANAL PREMIUM' : 'MARCAR PREMIUM'}
              </button>
            </div>

            {/* Plan Access */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Liberado para Planos</label>
              <div className="flex flex-wrap gap-2">
                {plans.map((p: any) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handlePlanToggle(p.id)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all border ${
                      formData.planIds.includes(p.id) 
                        ? 'bg-red-600 border-red-500 text-white' 
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Descrição do Canal</label>
              <textarea 
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 focus:outline-none focus:border-red-500/50 transition-all text-sm resize-none"
                placeholder="Breve descrição sobre a programação..."
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
                className="flex-[2] bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-red-600/20 transition-all active:scale-95"
              >
                {channel ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR CANAL AGORA'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ManageChannels;
