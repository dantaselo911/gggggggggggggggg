
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { User, LoginAttempt } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isUser: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: User) => Promise<void>;
  toggleFavorite: (channelId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, fetch profile from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        // Use onSnapshot for real-time profile updates
        const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUser(docSnap.data() as User);
          } else {
            console.error("Perfil de usuário não encontrado no Firestore.");
            setUser(null);
          }
          setIsLoading(false);
        }, (error) => {
          console.error("Erro ao carregar perfil:", error);
          setIsLoading(false);
        });

        return () => unsubscribeProfile();
      } else {
        // User is signed out
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      // Firebase Auth requires email. We use username@nexus.com as a convention.
      const email = `${username.toLowerCase()}@nexus.com`;
      await signInWithEmailAndPassword(auth, email, password);
      
      // Log successful attempt
      const logId = `log-${Date.now()}`;
      await setDoc(doc(db, 'logs', logId), {
        id: logId,
        username,
        ip: '0.0.0.0', // In a real server this would be the actual IP
        date: new Date().toISOString(),
        success: true,
        reason: 'Login realizado com sucesso'
      });

    } catch (error: any) {
      // Log failed attempt
      const logId = `log-${Date.now()}`;
      await setDoc(doc(db, 'logs', logId), {
        id: logId,
        username,
        ip: '0.0.0.0',
        date: new Date().toISOString(),
        success: false,
        reason: error.message || 'Falha na autenticação'
      });
      
      throw new Error('Usuário ou senha incorretos.');
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUser = async (userData: User) => {
    if (!auth.currentUser) return;
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    await updateDoc(userDocRef, { ...userData });
  };

  const toggleFavorite = async (channelId: string) => {
    if (!user || !auth.currentUser) return;
    
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    const currentFavs = user.favorites || [];
    
    const newFavs = currentFavs.includes(channelId)
      ? currentFavs.filter(id => id !== channelId)
      : [...currentFavs, channelId];
      
    await updateDoc(userDocRef, { favorites: newFavs });
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user',
    login,
    logout,
    updateUser,
    toggleFavorite
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
