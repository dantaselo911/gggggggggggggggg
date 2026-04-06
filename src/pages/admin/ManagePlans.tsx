
import React, { useState } from 'react';
import AdminSidebar from '../../components/admin/Sidebar';
import { useData } from '../../context/DataContext';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Power, 
  CreditCard, 
  CheckCircle2, 
  XCircle,
  DollarSign,
  Clock,
  Tv,
  LayoutGrid,
  ChevronRight,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plan } from '../../types';

const ManagePlans = () => {
  const { plans, categories, addPlan, updatePlan, deletePlan } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const handleOpenModal = (plan?: Plan) => {
    setEditingPlan(plan || null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este plano? Usuários vinculados a ele podem perder acesso.')) {
      deletePlan(id);
    }
  };

  const handleToggleStatus = (plan: Plan) => {
    updatePlan({ ...plan, isActive: !plan.isActive });
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      <AdminSidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white">Gerenciar Planos</h1>
            <p className="text-slate-500 text-sm font-medium">Defina os pacotes de assinatura e preços.</p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-2xl text-sm font-black shadow-xl shadow-red-600/20 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Plus size={20} />
            CRIAR NOVO PLANO
          </button>
        </header>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <motion.div 
              key={plan.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative bg-slate-900/50 backdrop-blur-xl border-2 rounded-[2.5rem] p-8 overflow-hidden group transition-all ${
                plan.isActive ? 'border-slate-800 hover:border-red-500/30' : 'border-red-500/20 opacity-60'
              }`}
            >
              {!plan.isActive && (
                <div className="absolute top-4 right-4 bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest z-10">
                  Inativo
                </div>
              )}
              
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-black text-white tracking-tighter">{plan.name}</h3>
                  <div className="p-3 bg-red-600/10 rounded-2xl text-red-500">
                    <Zap size={24} fill={plan.isActive ? 'currentColor' : 'none'} />
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-slate-500">R$</span>
                  <span className="text-4xl font-black text-white tracking-tight">{plan.price.toFixed(2)}</span>
                  <span className="text-sm font-bold text-slate-500">/ {plan.durationDays} dias</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-sm font-bold text-slate-300">
                  <Tv size={18} className="text-red-500" />
                  Até {plan.maxChannels} Canais
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-slate-300">
                  <LayoutGrid size={18} className="text-red-500" />
                  {plan.categoryIds.length} Categorias Liberadas
                </div>
                <div className="space-y-2 pt-2 border-t border-white/5">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-400">
                      <CheckCircle2 size={14} className="text-green-500" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-6 border-t border-white/5">
                <button 
                  onClick={() => handleToggleStatus(plan)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    plan.isActive ? 'bg-slate-950 text-slate-500 hover:bg-red-500/10 hover:text-red-500' : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                  }`}
                >
                  <Power size={14} />
                  {plan.isActive ? 'DESATIVAR' : 'ATIVAR'}
                </button>
                <button 
                  onClick={() => handleOpenModal(plan)}
                  className="p-3 bg-slate-950 border border-slate-800 text-slate-500 hover:text-white hover:border-slate-700 rounded-2xl transition-all"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(plan.id)}
                  className="p-3 bg-slate-950 border border-slate-800 text-slate-500 hover:text-red-500 hover:border-red-500/30 rounded-2xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Plan Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <PlanModal 
            plan={editingPlan} 
            onClose={() => setIsModalOpen(false)} 
            categories={categories}
            onSave={(planData) => {
              if (editingPlan) {
                updatePlan({ ...editingPlan, ...planData });
              } else {
                addPlan({
                  id: `plan-${Date.now()}`,
                  isActive: true,
                  ...planData
                } as Plan);
              }
              setIsModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Internal Plan Modal Component
const PlanModal = ({ plan, onClose, categories, onSave }: any) => {
  const [formData, setFormData] = useState({
    name: plan?.name || '',
    price: plan?.price || 29.90,
    durationDays: plan?.durationDays || 30,
    maxChannels: plan?.maxChannels || 1000,
    categoryIds: plan?.categoryIds || categories.map((c: any) => c.id),
    features: plan?.features || ['1 Dispositivo', 'Qualidade HD', 'Suporte via Chat'],
    isActive: plan?.isActive ?? true
  });

  const [newFeature, setNewFeature] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleCategoryToggle = (catId: string) => {
    const newCatIds = formData.categoryIds.includes(catId)
      ? formData.categoryIds.filter((id: string) => id !== catId)
      : [...formData.categoryIds, catId];
    setFormData({ ...formData, categoryIds: newCatIds });
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({ ...formData, features: [...formData.features, newFeature.trim()] });
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData({ ...formData, features: formData.features.filter((_: any, i: number) => i !== index) });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-8 sticky top-0 bg-slate-900 z-10 py-2">
            <div>
              <h3 className="text-2xl font-black tracking-tighter text-white">
                {plan ? 'Editar Plano' : 'Novo Plano'}
              </h3>
              <p className="text-slate-500 text-sm font-medium">Configure os benefícios e valores do pacote.</p>
            </div>
            <button onClick={onClose} className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 hover:text-white transition-all">
              <Plus className="rotate-45" size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Nome do Plano</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 focus:outline-none focus:border-red-500/50 transition-all text-sm"
                placeholder="Ex: Plano Master"
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Preço (R$)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="number" 
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-red-500/50 transition-all text-sm"
                />
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Duração (Dias)</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="number" 
                  required
                  value={formData.durationDays}
                  onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-red-500/50 transition-all text-sm"
                />
              </div>
            </div>

            {/* Max Channels */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Qtd. Canais Liberados</label>
              <div className="relative">
                <Tv className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="number" 
                  required
                  value={formData.maxChannels}
                  onChange={(e) => setFormData({ ...formData, maxChannels: parseInt(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-red-500/50 transition-all text-sm"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Categorias Liberadas</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat: any) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryToggle(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all border ${
                      formData.categoryIds.includes(cat.id) 
                        ? 'bg-red-600 border-red-500 text-white' 
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="md:col-span-2 space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Recursos / Vantagens</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 focus:outline-none focus:border-red-500/50 transition-all text-sm"
                  placeholder="Ex: Qualidade 4K"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                />
                <button 
                  type="button"
                  onClick={addFeature}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-6 rounded-2xl font-black text-xs"
                >
                  ADD
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {formData.features.map((f: string, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl">
                    <span className="text-xs font-bold text-slate-300">{f}</span>
                    <button 
                      type="button" 
                      onClick={() => removeFeature(i)}
                      className="text-slate-600 hover:text-red-500 transition-colors"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                ))}
              </div>
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
                {plan ? 'SALVAR ALTERAÇÕES' : 'CRIAR PLANO AGORA'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ManagePlans;
