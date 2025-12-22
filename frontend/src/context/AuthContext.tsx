import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  tenantId: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  signup: (email: string, password: string, companyName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Kullanıcı verilerini Firestore'dan çek
  const fetchUserData = async (user: User) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;
        setUserData(data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Yeni kullanıcı kaydı (Tenant oluşturma)
  const signup = async (email: string, password: string, companyName: string) => {
    try {
      // 1. Firebase Auth kullanıcısı oluştur
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Tenant ID oluştur (user ID'yi kullan veya random)
      const tenantId = user.uid;

      // 3. Firestore'a tenant kaydı oluştur
      await setDoc(doc(db, 'tenants', tenantId), {
        companyName,
        createdAt: new Date(),
        subscriptionPlan: 'starter',
        isActive: true,
        ownerId: user.uid
      });

      // 4. Kullanıcı kaydı oluştur
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: companyName,
        tenantId,
        role: 'admin',
        createdAt: new Date()
      });

      // 5. User profile güncelle
      await updateProfile(user, { displayName: companyName });

      // 6. Custom claims set etmek için Cloud Function çağır (opsiyonel)
      // await httpsCallable(functions, 'setCustomClaims')({ tenantId, role: 'admin' });

    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  // Giriş
  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // Çıkış
  const logout = async () => {
    await signOut(auth);
    setUserData(null);
  };

  // Auth state değişikliklerini dinle
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserData(user);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userData,
    loading,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
