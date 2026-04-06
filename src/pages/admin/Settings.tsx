
import React, { useState } from 'react';
import AdminSidebar from '../../components/admin/Sidebar';
import { useData } from '../../context/DataContext';
import { 
  Settings as SettingsIcon, 
  Globe, 
  Shield, 
  Palette, 
  MessageSquare, 
  Save, 
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Eye,
  Bell,
  Heart
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminSettings = () => {
  const { settings, updateSettings } = useData();
  const [formData, setFormData] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API delay
    setTimeout(() => {
      updateSettings(formData);
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  const toggleFeature = (key: keyof typeof settings) => {
    setFormData({ ...formData, [key]: !formData[key] });
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      <AdminSidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white">Configurações</h1>
            <p className="text-slate-500 text-sm font-medium">Personalize a identidade e o comportamento do seu sistema.</p>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={isSaving}
            className="bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white px-8 py-3 rounded-2xl text-sm font-black shadow-xl shadow-red-600/20 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            {isSaving ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
            {isSaving ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
          </button>
        </header>

        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl flex items-center gap-3 text-green-500 text-sm font-bold mb-8"
          >
            <CheckCircle2 size={20} />
            Configurações atualizadas com sucesso!
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* General Settings */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-[2.5rem] space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-500">
                <Globe size={24} />
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">Identidade do Site</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Nome do Sistema</label>
                <input 
                  type="text" 
                  value={formData.siteName}
                  onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3.5 px-4 focus:outline-none focus:border-red-500/50 transition-all text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">URL da Logo</label>
                <div className="relative">
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    type="url" 
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-red-500/50 transition-all text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Texto do Rodapé</label>
                <input 
                  type="text" 
                  value={formData.footerText}
                  onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3.5 px-4 focus:outline-none focus:border-red-500/50 transition-all text-sm"
                />
              </div>
            </div>
          </div>

          {/* Security & Features */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-[2.5rem] space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-600/10 rounded-2xl text-red-500">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">Segurança & Recursos</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FeatureToggle 
                label="Proteções Frontend" 
                description="Bloqueia F12, Clique Direito, etc."
                active={formData.enableProtections}
                onClick={() => toggleFeature('enableProtections')}
                icon={Lock}
              />
              <FeatureToggle 
                label="Favoritos" 
                description="Permite usuários favoritarem canais."
                active={formData.enableFavorites}
                onClick={() => toggleFeature('enableFavorites')}
                icon={Heart}
              />
              <FeatureToggle 
                label="Aviso de Expiração" 
                description="Mostra alerta quando a conta vencer."
                active={formData.enableExpirationWarning}
                onClick={() => toggleFeature('enableExpirationWarning')}
                icon={Bell}
              />
              <FeatureToggle 
                label="Modo Manutenção" 
                description="Bloqueia acesso de usuários comuns."
                active={formData.maintenanceMode}
                onClick={() => toggleFeature('maintenanceMode')}
                icon={AlertTriangle}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Tempo de Sessão (Min)</label>
                <input 
                  type="number" 
                  value={formData.sessionTimeout}
                  onChange={(e) => setFormData({ ...formData, sessionTimeout: parseInt(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 focus:outline-none focus:border-red-500/50 transition-all text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Limite Tentativas Login</label>
                <input 
                  type="number" 
                  value={formData.loginAttemptsLimit}
                  onChange={(e) => setFormData({ ...formData, loginAttemptsLimit: parseInt(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 focus:outline-none focus:border-red-500/50 transition-all text-sm"
                />
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-[2.5rem] space-y-6 xl:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-600/10 rounded-2xl text-purple-500">
                <MessageSquare size={24} />
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">Mensagens do Sistema</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Mensagem de Boas-vindas</label>
                <textarea 
                  rows={3}
                  value={formData.messages.welcome}
                  onChange={(e) => setFormData({ ...formData, messages: { ...formData.messages, welcome: e.target.value } })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 focus:outline-none focus:border-red-500/50 transition-all text-sm resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Mensagem de Conta Expirada</label>
                <textarea 
                  rows={3}
                  value={formData.messages.expired}
                  onChange={(e) => setFormData({ ...formData, messages: { ...formData.messages, expired: e.target.value } })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 focus:outline-none focus:border-red-500/50 transition-all text-sm resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Mensagem de Manutenção</label>
                <textarea 
                  rows={3}
                  value={formData.messages.maintenance}
                  onChange={(e) => setFormData({ ...formData, messages: { ...formData.messages, maintenance: e.target.value } })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 focus:outline-none focus:border-red-500/50 transition-all text-sm resize-none"
                />
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

const FeatureToggle = ({ label, description, active, onClick, icon: Icon }: any) => (
  <button 
    type="button"
    onClick={onClick}
    className={`flex items-start gap-4 p-4 rounded-2xl border transition-all text-left group ${
      active ? 'bg-red-600/10 border-red-500/50' : 'bg-slate-950 border-slate-800'
    }`}
  >
    <div className={`p-2 rounded-xl transition-colors ${active ? 'bg-red-600 text-white' : 'bg-slate-900 text-slate-600'}`}>
      <Icon size={18} />
    </div>
    <div>
      <p className={`text-xs font-black uppercase tracking-widest mb-1 ${active ? 'text-white' : 'text-slate-500'}`}>{label}</p>
      <p className="text-[10px] font-medium text-slate-500 leading-tight">{description}</p>
    </div>
  </button>
);

export default AdminSettings;
