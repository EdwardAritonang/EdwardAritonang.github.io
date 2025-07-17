import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'technician' | 'user';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Mock authentication - replace with actual API call
      if (email === 'admin@company.com' && password === 'admin123') {
        const mockUser: User = {
          id: 1,
          name: 'Admin User',
          email: 'admin@company.com',
          role: 'admin',
          avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=4F46E5&color=fff'
        };
        const mockToken = 'mock_jwt_token_' + Date.now();

        setUser(mockUser);
        setToken(mockToken);
        
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('token', mockToken);
      } else if (email === 'manager@company.com' && password === 'manager123') {
        const mockUser: User = {
          id: 2,
          name: 'IT Manager',
          email: 'manager@company.com',
          role: 'manager',
          avatar: 'https://ui-avatars.com/api/?name=IT+Manager&background=059669&color=fff'
        };
        const mockToken = 'mock_jwt_token_' + Date.now();

        setUser(mockUser);
        setToken(mockToken);
        
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('token', mockToken);
      } else if (email === 'tech@company.com' && password === 'tech123') {
        const mockUser: User = {
          id: 3,
          name: 'Technician',
          email: 'tech@company.com',
          role: 'technician',
          avatar: 'https://ui-avatars.com/api/?name=Technician&background=DC2626&color=fff'
        };
        const mockToken = 'mock_jwt_token_' + Date.now();

        setUser(mockUser);
        setToken(mockToken);
        
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('token', mockToken);
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};