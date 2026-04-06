
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Channel, Category, Plan, SystemSettings as Settings, LoginAttempt } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: any[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface DataContextType {
  channels: Channel[];
  categories: Category[];
  plans: Plan[];
  settings: Settings;
  loginAttempts: LoginAttempt[];
  addChannel: (channel: Channel) => Promise<void>;
  updateChannel: (channel: Channel) => Promise<void>;
  deleteChannel: (id: string) => Promise<void>;
  addCategory: (category: Category) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addPlan: (plan: Plan) => Promise<void>;
  updatePlan: (plan: Plan) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  updateSettings: (settings: Settings) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [settings, setSettings] = useState<Settings>({
    siteName: 'NEXUS IPTV',
    logo: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&q=80&w=200',
    footerText: '© 2024 Nexus IPTV. Todos os direitos reservados.',
    enableProtections: true,
    enableFavorites: true,
    enableExpirationWarning: true,
    maintenanceMode: false,
    sessionTimeout: 60,
    loginAttemptsLimit: 5,
    messages: {
      welcome: 'Bem-vindo ao Nexus IPTV!',
      expired: 'Sua assinatura expirou. Renove agora para continuar assistindo.',
      maintenance: 'Estamos em manutenção. Voltaremos em breve.'
    }
  });

  useEffect(() => {
    // Real-time listeners for all collections
    const unsubChannels = onSnapshot(collection(db, 'channels'), (snapshot) => {
      setChannels(snapshot.docs.map(doc => doc.data() as Channel));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'channels'));

    const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      setCategories(snapshot.docs.map(doc => doc.data() as Category));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'categories'));

    const unsubPlans = onSnapshot(collection(db, 'plans'), (snapshot) => {
      setPlans(snapshot.docs.map(doc => doc.data() as Plan));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'plans'));

    const unsubLogs = onSnapshot(query(collection(db, 'logs'), orderBy('date', 'desc'), limit(100)), (snapshot) => {
      setLoginAttempts(snapshot.docs.map(doc => doc.data() as LoginAttempt));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'logs'));

    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as Settings);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'settings/global'));

    return () => {
      unsubChannels();
      unsubCategories();
      unsubPlans();
      unsubLogs();
      unsubSettings();
    };
  }, []);

  // Channel Actions
  const addChannel = async (channel: Channel) => {
    try {
      await setDoc(doc(db, 'channels', channel.id), channel);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'channels');
    }
  };

  const updateChannel = async (channel: Channel) => {
    try {
      await updateDoc(doc(db, 'channels', channel.id), { ...channel });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'channels');
    }
  };

  const deleteChannel = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'channels', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'channels');
    }
  };

  // Category Actions
  const addCategory = async (category: Category) => {
    try {
      await setDoc(doc(db, 'categories', category.id), category);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'categories');
    }
  };

  const updateCategory = async (category: Category) => {
    try {
      await updateDoc(doc(db, 'categories', category.id), { ...category });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'categories');
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'categories');
    }
  };

  // Plan Actions
  const addPlan = async (plan: Plan) => {
    try {
      await setDoc(doc(db, 'plans', plan.id), plan);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'plans');
    }
  };

  const updatePlan = async (plan: Plan) => {
    try {
      await updateDoc(doc(db, 'plans', plan.id), { ...plan });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'plans');
    }
  };

  const deletePlan = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'plans', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'plans');
    }
  };

  // Settings Actions
  const updateSettings = async (newSettings: Settings) => {
    try {
      await setDoc(doc(db, 'settings', 'global'), newSettings);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/global');
    }
  };

  const value = {
    channels,
    categories,
    plans,
    settings,
    loginAttempts,
    addChannel,
    updateChannel,
    deleteChannel,
    addCategory,
    updateCategory,
    deleteCategory,
    addPlan,
    updatePlan,
    deletePlan,
    updateSettings
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
