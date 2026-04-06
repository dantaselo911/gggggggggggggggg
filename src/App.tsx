import React, { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  onSnapshot, 
  query, 
  where,
  getDocs,
  Timestamp,
  addDoc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { 
  Tv, 
  Users, 
  Settings, 
  LogOut, 
  LayoutDashboard, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  Filter,
  MonitorPlay,
  Headset,
  CreditCard,
  History,
  Lock,
  UserPlus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Menu,
  X,
  ShieldAlert,
  ChevronRight,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utilities ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'user';
  displayName: string;
  status: 'active' | 'expired' | 'suspended' | 'pending';
  expirationDate?: string;
  createdAt: string;
}

interface Channel {
  id: string;
  name: string;
  category: string;
  url: string;
  logo?: string;
  isPremium: boolean;
}

// --- Components ---

const LoadingScreen = () => (
  <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
    <motion.div 
      animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="text-blue-500"
    >
      <Tv size={64} />
    </motion.div>
  </div>
);

const Login = ({ user, profile }: { user: FirebaseUser | null, profile: UserProfile | null }) => {
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogout = () => signOut(auth);

  const isUnauthorized = user && !profile;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-8 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
            <Tv size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Nexus TV Live</h1>
          <p className="text-zinc-400 mt-2 text-center">Acesse o melhor do entretenimento premium em um só lugar.</p>
        </div>

        {isUnauthorized ? (
          <div className="space-y-6 text-center">
            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl">
              <ShieldAlert className="text-red-500 mx-auto mb-3" size={32} />
              <h2 className="text-lg font-bold text-white mb-2">Acesso Não Autorizado</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Seu e-mail (<span className="text-white font-medium">{user.email}</span>) não possui um acesso ativo no sistema.
              </p>
            </div>
            
            <div className="space-y-3">
              <a 
                href="https://wa.me/5511999999999" 
                target="_blank" 
                rel="noreferrer"
                className="w-full bg-blue-600 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
              >
                <Headset size={20} />
                Adquirir Acesso no PV
              </a>
              
              <button
                onClick={handleLogout}
                className="w-full bg-zinc-800 text-zinc-300 font-semibold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-zinc-700 transition-all active:scale-95"
              >
                <LogOut size={20} />
                Sair da Conta
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="w-full bg-white text-black font-semibold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all active:scale-95"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Entrar com Google
          </button>
        )}

        <div className="mt-8 pt-8 border-t border-zinc-800 text-center">
          <p className="text-zinc-500 text-sm">
            {isUnauthorized ? (
              "Se você já adquiriu, aguarde a ativação pelo administrador."
            ) : (
              <>
                Não tem uma conta? <br />
                <span className="text-blue-400 font-medium cursor-pointer hover:underline">Entre em contato com o suporte no PV</span>
              </>
            )}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const AdminDashboard = ({ profile }: { profile: UserProfile }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'channels' | 'stats'>('users');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState<UserProfile | null>(null);
  const [isAddingChannel, setIsAddingChannel] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newChannel, setNewChannel] = useState({ name: '', category: 'Aberto', url: '', logo: '', isPremium: false });
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const usersUnsub = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(doc => ({ ...doc.data() } as UserProfile)));
    });
    const channelsUnsub = onSnapshot(collection(db, 'channels'), (snap) => {
      setChannels(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Channel)));
    });
    return () => {
      usersUnsub();
      channelsUnsub();
    };
  }, []);

  const handleAddUser = async () => {
    if (!newUserEmail || !newUserName) return;
    try {
      const userDoc = doc(db, 'users', newUserEmail.replace(/[@.]/g, '_')); 
      await setDoc(userDoc, {
        uid: newUserEmail.replace(/[@.]/g, '_'),
        email: newUserEmail,
        role: 'user',
        displayName: newUserName,
        status: 'active',
        createdAt: new Date().toISOString(),
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
      setNewUserEmail('');
      setNewUserName('');
      setIsAddingUser(false);
      showToast("Usuário criado com sucesso!");
    } catch (e) {
      showToast("Erro ao criar usuário", "error");
    }
  };

  const handleAddChannel = async () => {
    if (!newChannel.name || !newChannel.url) return;
    try {
      await addDoc(collection(db, 'channels'), newChannel);
      setNewChannel({ name: '', category: 'Aberto', url: '', logo: '', isPremium: false });
      setIsAddingChannel(false);
      showToast("Canal adicionado com sucesso!");
    } catch (e) {
      showToast("Erro ao adicionar canal", "error");
    }
  };

  const handleDeleteChannel = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'channels', id));
      showToast("Canal removido");
    } catch (e) {
      showToast("Erro ao remover canal", "error");
    }
  };

  const seedChannels = async () => {
    const sampleChannels = [
      // Aberto
      { name: 'Globo SP', category: 'Aberto', url: 'globo-sp', logo: 'https://logodownload.org/wp-content/uploads/2014/02/globo-logo.png', isPremium: false },
      { name: 'Globo RJ', category: 'Aberto', url: 'globo-rj', logo: 'https://logodownload.org/wp-content/uploads/2014/02/globo-logo.png', isPremium: false },
      { name: 'Globo MG', category: 'Aberto', url: 'globo-mg', logo: 'https://logodownload.org/wp-content/uploads/2014/02/globo-logo.png', isPremium: false },
      { name: 'SBT', category: 'Aberto', url: 'sbt', logo: 'https://logodownload.org/wp-content/uploads/2014/04/sbt-logo.png', isPremium: false },
      { name: 'Record TV', category: 'Aberto', url: 'record-tv', logo: 'https://logodownload.org/wp-content/uploads/2014/05/record-tv-logo.png', isPremium: false },
      { name: 'Band', category: 'Aberto', url: 'band', logo: 'https://logodownload.org/wp-content/uploads/2014/05/band-logo.png', isPremium: false },
      { name: 'Rede TV', category: 'Aberto', url: 'rede-tv', logo: 'https://logodownload.org/wp-content/uploads/2014/05/redetv-logo.png', isPremium: false },
      { name: 'Cultura', category: 'Aberto', url: 'cultura', logo: 'https://logodownload.org/wp-content/uploads/2014/05/tv-cultura-logo.png', isPremium: false },
      
      // Esportes
      { name: 'SporTV', category: 'Esportes', url: 'sportv', logo: 'https://logodownload.org/wp-content/uploads/2014/05/sportv-logo.png', isPremium: true },
      { name: 'SporTV 2', category: 'Esportes', url: 'sportv-2', logo: 'https://logodownload.org/wp-content/uploads/2014/05/sportv-logo.png', isPremium: true },
      { name: 'SporTV 3', category: 'Esportes', url: 'sportv-3', logo: 'https://logodownload.org/wp-content/uploads/2014/05/sportv-logo.png', isPremium: true },
      { name: 'ESPN', category: 'Esportes', url: 'espn', logo: 'https://logodownload.org/wp-content/uploads/2014/05/espn-logo.png', isPremium: true },
      { name: 'ESPN 2', category: 'Esportes', url: 'espn-2', logo: 'https://logodownload.org/wp-content/uploads/2014/05/espn-logo.png', isPremium: true },
      { name: 'ESPN 3', category: 'Esportes', url: 'espn-3', logo: 'https://logodownload.org/wp-content/uploads/2014/05/espn-logo.png', isPremium: true },
      { name: 'ESPN 4', category: 'Esportes', url: 'espn-4', logo: 'https://logodownload.org/wp-content/uploads/2014/05/espn-logo.png', isPremium: true },
      { name: 'Fox Sports', category: 'Esportes', url: 'fox-sports', logo: 'https://logodownload.org/wp-content/uploads/2014/10/fox-sports-logo.png', isPremium: true },
      { name: 'Fox Sports 2', category: 'Esportes', url: 'fox-sports-2', logo: 'https://logodownload.org/wp-content/uploads/2014/10/fox-sports-logo.png', isPremium: true },
      { name: 'Premiere', category: 'Esportes', url: 'premiere', logo: 'https://logodownload.org/wp-content/uploads/2014/10/premiere-logo.png', isPremium: true },
      { name: 'Premiere 2', category: 'Esportes', url: 'premiere-2', logo: 'https://logodownload.org/wp-content/uploads/2014/10/premiere-logo.png', isPremium: true },
      { name: 'Premiere 3', category: 'Esportes', url: 'premiere-3', logo: 'https://logodownload.org/wp-content/uploads/2014/10/premiere-logo.png', isPremium: true },
      { name: 'Premiere 4', category: 'Esportes', url: 'premiere-4', logo: 'https://logodownload.org/wp-content/uploads/2014/10/premiere-logo.png', isPremium: true },
      { name: 'Premiere 5', category: 'Esportes', url: 'premiere-5', logo: 'https://logodownload.org/wp-content/uploads/2014/10/premiere-logo.png', isPremium: true },
      { name: 'Premiere 6', category: 'Esportes', url: 'premiere-6', logo: 'https://logodownload.org/wp-content/uploads/2014/10/premiere-logo.png', isPremium: true },
      { name: 'Premiere 7', category: 'Esportes', url: 'premiere-7', logo: 'https://logodownload.org/wp-content/uploads/2014/10/premiere-logo.png', isPremium: true },
      { name: 'Band Sports', category: 'Esportes', url: 'band-sports', logo: 'https://logodownload.org/wp-content/uploads/2014/05/bandsports-logo.png', isPremium: true },
      { name: 'Combate', category: 'Esportes', url: 'combate', logo: 'https://logodownload.org/wp-content/uploads/2014/10/combate-logo.png', isPremium: true },
      { name: 'EI Plus', category: 'Esportes', url: 'ei-plus', logo: 'https://logodownload.org/wp-content/uploads/2014/10/esporte-interativo-logo.png', isPremium: true },
      { name: 'UFC Fight Pass', category: 'Esportes', url: 'ufc-fight-pass', logo: 'https://logodownload.org/wp-content/uploads/2014/10/ufc-logo.png', isPremium: true },
      { name: 'Caze TV 1', category: 'Esportes', url: 'caze-tv-1', logo: 'https://yt3.googleusercontent.com/ytc/AIdro_n_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y=s900-c-k-c0x00ffffff-no-rj', isPremium: false },
      { name: 'Caze TV 2', category: 'Esportes', url: 'caze-tv-2', logo: 'https://yt3.googleusercontent.com/ytc/AIdro_n_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y_Y=s900-c-k-c0x00ffffff-no-rj', isPremium: false },
      { name: 'XSports', category: 'Esportes', url: 'xsports', logo: 'https://logodownload.org/wp-content/uploads/2014/05/sportv-logo.png', isPremium: true },

      // Notícias
      { name: 'CNN Brasil', category: 'Notícias', url: 'cnn-brasil', logo: 'https://logodownload.org/wp-content/uploads/2020/03/cnn-brasil-logo.png', isPremium: false },
      { name: 'Globo News', category: 'Notícias', url: 'globo-news', logo: 'https://logodownload.org/wp-content/uploads/2014/05/globonews-logo.png', isPremium: true },
      { name: 'Band News', category: 'Notícias', url: 'band-news', logo: 'https://logodownload.org/wp-content/uploads/2014/05/bandnews-logo.png', isPremium: true },
      { name: 'Record News', category: 'Notícias', url: 'record-news', logo: 'https://logodownload.org/wp-content/uploads/2014/05/record-news-logo.png', isPremium: false },
      { name: 'SBT News', category: 'Notícias', url: 'sbt-news', logo: 'https://logodownload.org/wp-content/uploads/2014/04/sbt-logo.png', isPremium: false },

      // Infantil
      { name: 'Cartoon Network', category: 'Infantil', url: 'cartoon-network', logo: 'https://logodownload.org/wp-content/uploads/2014/05/cartoon-network-logo.png', isPremium: false },
      { name: 'Disney Channel', category: 'Infantil', url: 'disney-channel', logo: 'https://logodownload.org/wp-content/uploads/2014/04/disney-channel-logo.png', isPremium: false },
      { name: 'Disney Junior', category: 'Infantil', url: 'disney-junior', logo: 'https://logodownload.org/wp-content/uploads/2014/04/disney-junior-logo.png', isPremium: false },
      { name: 'Nickelodeon', category: 'Infantil', url: 'nickelodeon', logo: 'https://logodownload.org/wp-content/uploads/2014/05/nickelodeon-logo.png', isPremium: false },
      { name: 'Nick Jr', category: 'Infantil', url: 'nick-jr', logo: 'https://logodownload.org/wp-content/uploads/2014/05/nick-jr-logo.png', isPremium: false },
      { name: 'Discovery Kids', category: 'Infantil', url: 'discovery-kids', logo: 'https://logodownload.org/wp-content/uploads/2014/05/discovery-kids-logo.png', isPremium: false },

      // Documentários
      { name: 'Discovery Channel', category: 'Documentários', url: 'discovery-channel', logo: 'https://logodownload.org/wp-content/uploads/2014/05/discovery-channel-logo.png', isPremium: false },
      { name: 'Animal Planet', category: 'Documentários', url: 'animal-planet', logo: 'https://logodownload.org/wp-content/uploads/2014/05/animal-planet-logo.png', isPremium: false },
      { name: 'History Channel', category: 'Documentários', url: 'history-channel', logo: 'https://logodownload.org/wp-content/uploads/2014/05/history-channel-logo.png', isPremium: false },
      { name: 'National Geographic', category: 'Documentários', url: 'national-geographic', logo: 'https://logodownload.org/wp-content/uploads/2014/05/national-geographic-logo.png', isPremium: false },
      { name: 'Fish TV', category: 'Documentários', url: 'fish-tv', logo: 'https://logodownload.org/wp-content/uploads/2014/05/discovery-channel-logo.png', isPremium: false },

      // Filmes
      { name: 'Telecine Action', category: 'Filmes', url: 'telecine-action', logo: 'https://logodownload.org/wp-content/uploads/2014/10/telecine-logo.png', isPremium: true },
      { name: 'Telecine Premium', category: 'Filmes', url: 'telecine-premium', logo: 'https://logodownload.org/wp-content/uploads/2014/10/telecine-logo.png', isPremium: true },
      { name: 'Telecine Pipoca', category: 'Filmes', url: 'telecine-pipoca', logo: 'https://logodownload.org/wp-content/uploads/2014/10/telecine-logo.png', isPremium: true },
      { name: 'Telecine Fun', category: 'Filmes', url: 'telecine-fun', logo: 'https://logodownload.org/wp-content/uploads/2014/10/telecine-logo.png', isPremium: true },
      { name: 'Telecine Touch', category: 'Filmes', url: 'telecine-touch', logo: 'https://logodownload.org/wp-content/uploads/2014/10/telecine-logo.png', isPremium: true },
      { name: 'Telecine Cult', category: 'Filmes', url: 'telecine-cult', logo: 'https://logodownload.org/wp-content/uploads/2014/10/telecine-logo.png', isPremium: true },
      { name: 'HBO', category: 'Filmes', url: 'hbo', logo: 'https://logodownload.org/wp-content/uploads/2014/07/hbo-logo.png', isPremium: true },
      { name: 'HBO 2', category: 'Filmes', url: 'hbo-2', logo: 'https://logodownload.org/wp-content/uploads/2014/07/hbo-logo.png', isPremium: true },
      { name: 'HBO Plus', category: 'Filmes', url: 'hbo-plus', logo: 'https://logodownload.org/wp-content/uploads/2014/07/hbo-logo.png', isPremium: true },
      { name: 'HBO Family', category: 'Filmes', url: 'hbo-family', logo: 'https://logodownload.org/wp-content/uploads/2014/07/hbo-logo.png', isPremium: true },
      { name: 'Max Prime', category: 'Filmes', url: 'max-prime', logo: 'https://logodownload.org/wp-content/uploads/2014/07/hbo-logo.png', isPremium: true },
      { name: 'Max Up', category: 'Filmes', url: 'max-up', logo: 'https://logodownload.org/wp-content/uploads/2014/07/hbo-logo.png', isPremium: true },
      { name: 'Cinemax', category: 'Filmes', url: 'cinemax', logo: 'https://logodownload.org/wp-content/uploads/2014/07/cinemax-logo.png', isPremium: true },
      { name: 'Megapix', category: 'Filmes', url: 'megapix', logo: 'https://logodownload.org/wp-content/uploads/2014/10/megapix-logo.png', isPremium: true },
      { name: 'FX', category: 'Filmes', url: 'fx', logo: 'https://logodownload.org/wp-content/uploads/2014/10/fx-logo.png', isPremium: true },
      { name: 'Fox', category: 'Filmes', url: 'fox', logo: 'https://logodownload.org/wp-content/uploads/2014/10/fox-logo.png', isPremium: true },
      { name: 'Sony Channel', category: 'Filmes', url: 'sony-channel', logo: 'https://logodownload.org/wp-content/uploads/2014/10/sony-channel-logo.png', isPremium: true },
      { name: 'Warner Channel', category: 'Filmes', url: 'warner-channel', logo: 'https://logodownload.org/wp-content/uploads/2014/10/warner-channel-logo.png', isPremium: true },
      { name: 'Universal Channel', category: 'Filmes', url: 'universal-channel', logo: 'https://logodownload.org/wp-content/uploads/2014/10/universal-channel-logo.png', isPremium: true },
      { name: 'AXN', category: 'Filmes', url: 'axn', logo: 'https://logodownload.org/wp-content/uploads/2014/10/axn-logo.png', isPremium: true },
      { name: 'TNT', category: 'Filmes', url: 'tnt', logo: 'https://logodownload.org/wp-content/uploads/2014/10/tnt-logo.png', isPremium: true },
      { name: 'Space', category: 'Filmes', url: 'space', logo: 'https://logodownload.org/wp-content/uploads/2014/10/space-logo.png', isPremium: true },
      { name: 'Paramount Network', category: 'Filmes', url: 'paramount-network', logo: 'https://logodownload.org/wp-content/uploads/2014/10/paramount-network-logo.png', isPremium: true },
      { name: 'Prime Video 1', category: 'Filmes', url: 'prime-video-1', logo: 'https://logodownload.org/wp-content/uploads/2014/10/amazon-prime-video-logo.png', isPremium: true },
      { name: 'Prime Video 2', category: 'Filmes', url: 'prime-video-2', logo: 'https://logodownload.org/wp-content/uploads/2014/10/amazon-prime-video-logo.png', isPremium: true },
      { name: 'Prime Video 3', category: 'Filmes', url: 'prime-video-3', logo: 'https://logodownload.org/wp-content/uploads/2014/10/amazon-prime-video-logo.png', isPremium: true },

      // Variedades
      { name: 'MTV', category: 'Variedades', url: 'mtv', logo: 'https://logodownload.org/wp-content/uploads/2014/10/mtv-logo.png', isPremium: false },
      { name: 'Multishow', category: 'Variedades', url: 'multishow', logo: 'https://logodownload.org/wp-content/uploads/2014/10/multishow-logo.png', isPremium: true },
      { name: 'Comedy Central', category: 'Variedades', url: 'comedy-central', logo: 'https://logodownload.org/wp-content/uploads/2014/10/comedy-central-logo.png', isPremium: true },
      { name: 'E! Entertainment', category: 'Variedades', url: 'e-entertainment', logo: 'https://logodownload.org/wp-content/uploads/2014/10/e-entertainment-logo.png', isPremium: true },
      { name: 'Lifetime', category: 'Variedades', url: 'lifetime', logo: 'https://logodownload.org/wp-content/uploads/2014/10/lifetime-logo.png', isPremium: true },
      { name: 'TLC', category: 'Variedades', url: 'tlc', logo: 'https://logodownload.org/wp-content/uploads/2014/10/tlc-logo.png', isPremium: true },
      { name: 'Food Network', category: 'Variedades', url: 'food-network', logo: 'https://logodownload.org/wp-content/uploads/2014/10/food-network-logo.png', isPremium: true },
      { name: 'HGTV', category: 'Variedades', url: 'hgtv', logo: 'https://logodownload.org/wp-content/uploads/2014/10/hgtv-logo.png', isPremium: true },
      { name: 'Investigation Discovery', category: 'Variedades', url: 'investigation-discovery', logo: 'https://logodownload.org/wp-content/uploads/2014/10/id-logo.png', isPremium: true },
      { name: 'Travel Channel', category: 'Variedades', url: 'travel-channel', logo: 'https://logodownload.org/wp-content/uploads/2014/10/travel-channel-logo.png', isPremium: true },

      // Reality
      { name: 'BBB 1', category: 'Reality', url: 'bbb1', logo: 'https://logodownload.org/wp-content/uploads/2014/02/globo-logo.png', isPremium: true },
      { name: 'BBB 2', category: 'Reality', url: 'bbb2', logo: 'https://logodownload.org/wp-content/uploads/2014/02/globo-logo.png', isPremium: true },
      { name: 'BBB 3', category: 'Reality', url: 'bbb3', logo: 'https://logodownload.org/wp-content/uploads/2014/02/globo-logo.png', isPremium: true },
      { name: 'BBB 4', category: 'Reality', url: 'bbb4', logo: 'https://logodownload.org/wp-content/uploads/2014/02/globo-logo.png', isPremium: true },
      { name: 'BBB 5', category: 'Reality', url: 'bbb5', logo: 'https://logodownload.org/wp-content/uploads/2014/02/globo-logo.png', isPremium: true },
      { name: 'BBB 6', category: 'Reality', url: 'bbb6', logo: 'https://logodownload.org/wp-content/uploads/2014/02/globo-logo.png', isPremium: true },
    ];
    try {
      for (const ch of sampleChannels) {
        await addDoc(collection(db, 'channels'), ch);
      }
      showToast("Canais gerados com sucesso!");
    } catch (e) {
      showToast("Erro ao gerar canais", "error");
    }
  };

  const toggleUserStatus = async (user: UserProfile) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        status: user.status === 'active' ? 'suspended' : 'active'
      });
      showToast(`Usuário ${user.status === 'active' ? 'suspenso' : 'ativado'}`);
    } catch (e) {
      showToast("Erro ao alterar status", "error");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Painel de Administração</h2>
          <p className="text-zinc-400">Gerencie usuários, canais e assinaturas.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={seedChannels}
            className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
          >
            <History size={18} />
            Gerar Canais
          </button>
          <button 
            onClick={() => setIsAddingUser(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
          >
            <UserPlus size={18} />
            Novo Usuário
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total Usuários', value: users.length, icon: Users, color: 'text-blue-400' },
          { label: 'Canais Ativos', value: channels.length, icon: MonitorPlay, color: 'text-purple-400' },
          { label: 'Pendentes', value: users.filter(u => u.status === 'pending').length, icon: AlertTriangle, color: 'text-yellow-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-400 text-sm font-medium">{stat.label}</span>
              <stat.icon size={20} className={stat.color} />
            </div>
            <span className="text-3xl font-bold text-white">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-zinc-800">
        {['users', 'channels'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={cn(
              "pb-4 px-2 text-sm font-medium transition-all relative",
              activeTab === tab ? "text-blue-400" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            {tab === 'users' ? 'Usuários' : 'Canais'}
            {activeTab === tab && (
              <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'users' ? (
          <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900/50 border-b border-zinc-800">
                  <th className="p-4 text-zinc-400 font-medium text-sm">Usuário</th>
                  <th className="p-4 text-zinc-400 font-medium text-sm">Status</th>
                  <th className="p-4 text-zinc-400 font-medium text-sm">Expiração</th>
                  <th className="p-4 text-zinc-400 font-medium text-sm text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.uid} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-all">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                          {user.displayName?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.displayName}</p>
                          <p className="text-zinc-500 text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        user.status === 'active' ? "bg-green-500/10 text-green-500" : 
                        user.status === 'suspended' ? "bg-red-500/10 text-red-500" :
                        "bg-yellow-500/10 text-yellow-500"
                      )}>
                        {user.status === 'active' ? 'Ativo' : 
                         user.status === 'suspended' ? 'Suspenso' : 'Pendente'}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-400 text-sm">
                      {user.expirationDate ? new Date(user.expirationDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => toggleUserStatus(user)}
                          className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all"
                          title={user.status === 'active' ? 'Suspender' : 'Ativar'}
                        >
                          {user.status === 'active' ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                        </button>
                        <button 
                          onClick={() => setIsEditingUser(user)}
                          className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={async () => {
                            if(confirm("Tem certeza que deseja excluir este usuário?")) {
                              await deleteDoc(doc(db, 'users', user.uid));
                              showToast("Usuário excluído");
                            }
                          }}
                          className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-500 transition-all"
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {channels.map((channel) => (
              <div key={channel.id} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl group relative overflow-hidden">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center overflow-hidden">
                    {channel.logo ? <img src={channel.logo} alt={channel.name} className="w-full h-full object-cover" /> : <Tv size={24} className="text-zinc-600" />}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{channel.name}</h4>
                    <p className="text-zinc-500 text-xs">{channel.category}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className={cn(
                    "px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                    channel.isPremium ? "bg-yellow-500/10 text-yellow-500" : "bg-blue-500/10 text-blue-500"
                  )}>
                    {channel.isPremium ? 'Premium' : 'Básico'}
                  </span>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-all"><Edit size={16} /></button>
                    <button className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
            <button 
              onClick={() => setIsAddingChannel(true)}
              className="border-2 border-dashed border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center text-zinc-500 hover:border-blue-500/50 hover:text-blue-400 transition-all"
            >
              <Plus size={32} className="mb-2" />
              <span className="font-medium">Adicionar Canal</span>
            </button>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className={cn(
              "fixed bottom-8 right-8 px-6 py-3 rounded-2xl shadow-2xl z-[100] flex items-center gap-3 font-medium",
              toast.type === 'success' ? "bg-blue-600 text-white" : "bg-red-600 text-white"
            )}
          >
            {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Channel Modal */}
      <AnimatePresence>
        {isAddingChannel && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl w-full max-w-md"
            >
              <h3 className="text-xl font-bold text-white mb-6">Adicionar Novo Canal</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Nome</label>
                  <input 
                    type="text" 
                    value={newChannel.name}
                    onChange={(e) => setNewChannel({...newChannel, name: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Categoria</label>
                  <select 
                    value={newChannel.category}
                    onChange={(e) => setNewChannel({...newChannel, category: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                  >
                    {['Aberto', 'Filmes', 'Esportes', 'Documentários', 'Infantil', 'Notícias', 'Variedades'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">URL do Stream (M3U8/MP4)</label>
                  <input 
                    type="text" 
                    value={newChannel.url}
                    onChange={(e) => setNewChannel({...newChannel, url: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">URL da Logo</label>
                  <input 
                    type="text" 
                    value={newChannel.logo}
                    onChange={(e) => setNewChannel({...newChannel, logo: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="flex items-center gap-3 py-2">
                  <input 
                    type="checkbox" 
                    id="premium"
                    checked={newChannel.isPremium}
                    onChange={(e) => setNewChannel({...newChannel, isPremium: e.target.checked})}
                    className="w-5 h-5 rounded border-zinc-800 bg-zinc-950 text-blue-600"
                  />
                  <label htmlFor="premium" className="text-sm text-zinc-300">Canal Premium</label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setIsAddingChannel(false)} className="flex-1 bg-zinc-800 py-3 rounded-xl">Cancelar</button>
                  <button onClick={handleAddChannel} className="flex-1 bg-blue-600 py-3 rounded-xl font-bold">Salvar</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {isEditingUser && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl w-full max-w-md"
            >
              <h3 className="text-xl font-bold text-white mb-6">Editar Usuário</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Nome</label>
                  <input 
                    type="text" 
                    value={isEditingUser.displayName}
                    onChange={(e) => setIsEditingUser({...isEditingUser, displayName: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Data de Expiração</label>
                  <input 
                    type="date" 
                    value={isEditingUser.expirationDate ? isEditingUser.expirationDate.split('T')[0] : ''}
                    onChange={(e) => setIsEditingUser({...isEditingUser, expirationDate: new Date(e.target.value).toISOString()})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Cargo</label>
                  <select 
                    value={isEditingUser.role}
                    onChange={(e) => setIsEditingUser({...isEditingUser, role: e.target.value as any})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                  >
                    <option value="user">Usuário</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setIsEditingUser(null)} className="flex-1 bg-zinc-800 py-3 rounded-xl">Cancelar</button>
                  <button 
                    onClick={async () => {
                      await updateDoc(doc(db, 'users', isEditingUser.uid), {
                        displayName: isEditingUser.displayName,
                        expirationDate: isEditingUser.expirationDate,
                        role: isEditingUser.role
                      });
                      setIsEditingUser(null);
                      showToast("Usuário atualizado");
                    }} 
                    className="flex-1 bg-blue-600 py-3 rounded-xl font-bold"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add User Modal */}
      <AnimatePresence>
        {isAddingUser && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl w-full max-w-md"
            >
              <h3 className="text-xl font-bold text-white mb-2">Novo Usuário</h3>
              <p className="text-zinc-400 text-sm mb-6">Insira o e-mail do usuário para autorizar o acesso.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Nome do Usuário</label>
                  <input 
                    type="text" 
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="João Silva"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">E-mail do Usuário</label>
                  <input 
                    type="email" 
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="exemplo@gmail.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setIsAddingUser(false)}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleAddUser}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all"
                  >
                    Criar Conta
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const UserDashboard = ({ profile }: { profile: UserProfile }) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingChannel, setPlayingChannel] = useState<Channel | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'channels'));
    const unsub = onSnapshot(q, (snap) => {
      setChannels(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Channel)));
    });
    return () => unsub();
  }, []);

  const categories = ['Todos', ...Array.from(new Set(channels.map(c => c.category)))];
  
  const filteredChannels = channels.filter(c => {
    const matchesCategory = selectedCategory === 'Todos' || c.category === selectedCategory;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const isExpired = profile.expirationDate && new Date(profile.expirationDate) < new Date();

  if (profile.status !== 'active' || isExpired) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle size={40} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {isExpired ? "Assinatura Expirada" : "Acesso Restrito"}
        </h2>
        <p className="text-zinc-400 max-w-md">
          {isExpired 
            ? "Sua assinatura chegou ao fim. Entre em contato com o suporte para renovar seu acesso premium."
            : profile.status === 'pending' 
              ? "Sua conta está aguardando ativação pelo administrador. Entre em contato para liberar seu acesso."
              : "Sua conta foi suspensa. Entre em contato com o suporte para mais informações."}
        </p>
        <button 
          onClick={() => window.open('https://wa.me/5511999999999', '_blank')}
          className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-semibold transition-all flex items-center gap-2"
        >
          <Headset size={20} />
          Falar com Suporte no WhatsApp
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Bem-vindo, {profile.displayName}</h2>
          <p className="text-zinc-400">Assista aos seus canais favoritos em alta definição.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar canais..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-4 py-3 text-white w-full md:w-64 focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>
      </header>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
              selectedCategory === cat 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Channels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredChannels.length > 0 ? filteredChannels.map((channel) => (
          <motion.div 
            layout
            key={channel.id} 
            onClick={() => setPlayingChannel(channel)}
            className="group bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden hover:border-blue-500/50 transition-all cursor-pointer"
          >
            <div className="aspect-video bg-zinc-800 relative overflow-hidden">
              {channel.logo ? (
                <img src={channel.logo} alt={channel.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-700">
                  <Tv size={48} />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl">
                  <Play size={24} fill="currentColor" />
                </div>
              </div>
              {channel.isPremium && (
                <div className="absolute top-3 right-3 bg-yellow-500 text-black text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                  Premium
                </div>
              )}
            </div>
            <div className="p-5">
              <h4 className="text-white font-bold text-lg mb-1">{channel.name}</h4>
              <p className="text-zinc-500 text-sm">{channel.category}</p>
            </div>
          </motion.div>
        )) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-zinc-500">
            <Search size={48} className="mb-4 opacity-20" />
            <p className="text-lg font-medium">Nenhum canal encontrado</p>
            <p className="text-sm">Tente buscar por outro nome ou categoria.</p>
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      <AnimatePresence>
        {playingChannel && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[100] p-4 md:p-8">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-6xl aspect-video bg-black rounded-3xl overflow-hidden relative shadow-2xl border border-zinc-800"
            >
              <button 
                onClick={() => setPlayingChannel(null)}
                className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white z-10 transition-all"
              >
                <X size={24} />
              </button>

              <div className="absolute top-6 left-6 flex items-center gap-4 z-10">
                <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center overflow-hidden border border-zinc-800">
                  {playingChannel.logo ? <img src={playingChannel.logo} className="w-full h-full object-cover" /> : <Tv size={24} />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{playingChannel.name}</h3>
                  <p className="text-zinc-400 text-sm">{playingChannel.category}</p>
                </div>
              </div>

              {/* Video Player */}
              <div className="w-full h-full bg-black relative">
                <iframe 
                  src={playingChannel.url.startsWith('http') 
                    ? playingChannel.url 
                    : `https://embedflix.click/tv/player.php?canal=${playingChannel.url}`}
                  className="w-full h-full border-0"
                  allowFullScreen
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black to-transparent pointer-events-none">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-white font-bold text-sm">AO VIVO</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-zinc-400 text-sm">Qualidade: <span className="text-white font-bold">AUTO HD</span></span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<'dashboard' | 'profile' | 'support' | 'admin'>('dashboard');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        // First check by UID
        const docRef = doc(db, 'users', u.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
          setUser(u);
        } else {
          // Check if email was pre-authorized by admin
          const q = query(collection(db, 'users'), where('email', '==', u.email));
          const querySnap = await getDocs(q);
          
          if (!querySnap.empty) {
            // Found pre-authorized email, update with UID
            const preAuthDoc = querySnap.docs[0];
            const profileData = preAuthDoc.data() as UserProfile;
            
            // If the document ID is not the UID, we should migrate it or just use it
            // For simplicity, we'll update the existing document with the UID
            await updateDoc(preAuthDoc.ref, { uid: u.uid });
            setProfile({ ...profileData, uid: u.uid });
            setUser(u);
          } else if (u.email === 'dantaselo911@gmail.com') {
            // Auto-create admin if it's the owner
            const adminProfile: UserProfile = {
              uid: u.uid,
              email: u.email,
              role: 'admin',
              displayName: u.displayName || 'Admin',
              status: 'active',
              createdAt: new Date().toISOString()
            };
            await setDoc(docRef, adminProfile);
            setProfile(adminProfile);
            setUser(u);
          } else {
            // Not authorized
            setUser(u);
            setProfile(null); // This will trigger the Login screen to show "Not Authorized"
          }
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <LoadingScreen />;
  if (!user || !profile) return <Login user={user} profile={profile} />;

  const menuItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'profile', label: 'Minha Conta', icon: Settings },
    { id: 'support', label: 'Suporte', icon: Headset },
  ];

  if (profile.role === 'admin') {
    menuItems.push({ id: 'admin', label: 'Admin', icon: ShieldCheck });
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="bg-zinc-950 border-r border-zinc-900 flex flex-col z-40"
      >
        <div className="p-6 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Tv size={24} className="text-white" />
          </div>
          {sidebarOpen && <span className="font-bold text-xl tracking-tight">Nexus TV</span>}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as any)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group",
                activeView === item.id 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                  : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
              )}
            >
              <item.icon size={22} />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-900">
          <button 
            onClick={() => signOut(auth)}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={22} />
            {sidebarOpen && <span className="font-medium">Sair</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-900/5 rounded-full blur-[120px] -z-10" />
        
        <header className="h-20 border-b border-zinc-900 flex items-center justify-between px-8 bg-black/50 backdrop-blur-md sticky top-0 z-30">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-zinc-900 rounded-xl text-zinc-400 transition-all"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-white">{profile.displayName}</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{profile.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full border border-zinc-800 overflow-hidden">
              <img src={user.photoURL || `https://ui-avatars.com/api/?name=${profile.displayName}`} alt="Profile" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeView === 'dashboard' && <UserDashboard profile={profile} />}
              {activeView === 'admin' && <AdminDashboard profile={profile} />}
              {activeView === 'profile' && (
                <div className="max-w-2xl mx-auto space-y-8">
                  <h2 className="text-3xl font-bold text-white">Minha Conta</h2>
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 space-y-6">
                    <div className="flex items-center gap-6">
                      <img src={user.photoURL || ''} className="w-20 h-20 rounded-2xl border border-zinc-800" />
                      <div>
                        <h3 className="text-xl font-bold text-white">{profile.displayName}</h3>
                        <p className="text-zinc-500">{profile.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-900">
                        <p className="text-zinc-500 text-xs font-bold uppercase mb-1">Status</p>
                        <p className="text-blue-400 font-bold">{profile.status.toUpperCase()}</p>
                      </div>
                      <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-900">
                        <p className="text-zinc-500 text-xs font-bold uppercase mb-1">Assinatura</p>
                        <p className="text-white font-bold">{profile.expirationDate ? new Date(profile.expirationDate).toLocaleDateString() : 'Vitalícia'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Lock size={20} className="text-blue-400" />
                      Segurança
                    </h3>
                    <p className="text-zinc-400 text-sm mb-6">Sua conta está protegida pela autenticação segura do Google.</p>
                    <button className="text-blue-400 font-semibold hover:underline">Alterar configurações de privacidade</button>
                  </div>
                </div>
              )}
              {activeView === 'support' && (
                <div className="max-w-4xl mx-auto text-center py-12">
                  <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Headset size={40} className="text-blue-500" />
                  </div>
                  <h2 className="text-4xl font-bold text-white mb-4">Como podemos ajudar?</h2>
                  <p className="text-zinc-400 text-lg mb-12 max-w-xl mx-auto">Nossa equipe está pronta para resolver qualquer problema com sua assinatura ou acesso.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { title: 'Chat no PV', desc: 'Fale diretamente com o dono', icon: MonitorPlay, action: 'Abrir WhatsApp', link: 'https://wa.me/5511999999999' },
                      { title: 'Financeiro', desc: 'Dúvidas sobre pagamentos', icon: CreditCard, action: 'Ver Faturas', link: '#' },
                      { title: 'Tutorial', desc: 'Como configurar seu app', icon: History, action: 'Ver Guia', link: '#' },
                    ].map((item, i) => (
                      <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl hover:border-blue-500/30 transition-all group">
                        <item.icon size={32} className="text-blue-500 mb-4 mx-auto group-hover:scale-110 transition-transform" />
                        <h4 className="text-white font-bold mb-2">{item.title}</h4>
                        <p className="text-zinc-500 text-sm mb-6">{item.desc}</p>
                        <button 
                          onClick={() => item.link !== '#' && window.open(item.link, '_blank')}
                          className="text-blue-400 font-bold text-sm hover:underline"
                        >
                          {item.action}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
