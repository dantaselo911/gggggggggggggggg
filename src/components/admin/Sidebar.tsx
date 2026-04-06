
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { 
  LayoutDashboard, 
  Users, 
  Tv, 
  CreditCard, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  History,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminSidebar = () => {
  const { logout, user } = useAuth();
  const { settings } = useData();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(true);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { name: 'Usuários', icon: Users, path: '/admin/users' },
    { name: 'Canais', icon: Tv, path: '/admin/channels' },
    { name: 'Planos', icon: CreditCard, path: '/admin/plans' },
    { name: 'Logs & Acessos', icon: History, path: '/admin/logs' },
    { name: 'Configurações', icon: Settings, path: '/admin/settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-900 
        transition-transform duration-300 lg:translate-x-0 lg:static
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tighter text-white leading-none">NEXUS</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Admin Panel</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group
                  ${isActive 
                    ? 'bg-red-600 text-white shadow-xl shadow-red-600/20' 
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'}
                `}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} className={({ isActive }) => isActive ? 'text-white' : 'text-slate-500 group-hover:text-red-500 transition-colors'} />
                  <span className="text-sm font-bold tracking-tight">{item.name}</span>
                </div>
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </NavLink>
            ))}
          </nav>

          {/* User Profile */}
          <div className="mt-auto pt-6 border-t border-slate-900">
            <div className="flex items-center gap-3 mb-4 px-2">
              <img 
                src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'} 
                alt="Avatar" 
                className="w-10 h-10 rounded-xl border border-slate-800"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Super Admin</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:bg-red-600/10 hover:text-red-500 transition-all group"
            >
              <LogOut size={20} />
              <span className="text-sm font-bold tracking-tight">Sair do Painel</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

// Simple state management for mobile sidebar
const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

export default AdminSidebar;
