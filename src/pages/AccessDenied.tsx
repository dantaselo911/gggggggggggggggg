
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center"
      >
        <div className="w-24 h-24 bg-red-600/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-red-600/20">
          <ShieldAlert size={48} className="text-red-600" />
        </div>
        
        <h1 className="text-4xl font-black tracking-tighter text-white mb-4">Acesso Negado</h1>
        <p className="text-slate-500 text-lg font-medium mb-10">
          Você não tem permissão para acessar esta área ou sua sessão expirou.
        </p>
        
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-red-600/20 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={20} />
            VOLTAR PARA LOGIN
          </button>
          <button 
            onClick={() => navigate('/home')}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-2xl border border-slate-800 transition-all flex items-center justify-center gap-2"
          >
            <Home size={20} />
            PÁGINA INICIAL
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AccessDenied;
