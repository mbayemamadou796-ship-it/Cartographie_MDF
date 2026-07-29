import { useState, useEffect } from 'react';
import { AppUser, UserRole } from '../types';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);

  useEffect(() => {
    const savedSession = localStorage.getItem('mbok_de_france_session_user_v1');
    if (savedSession) {
      try {
        setCurrentUser(JSON.parse(savedSession));
      } catch (e) {
        console.error('Failed to parse session', e);
      }
    }
  }, []);

  const login = (user: AppUser) => {
    setCurrentUser(user);
    localStorage.setItem('mbok_de_france_session_user_v1', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('mbok_de_france_session_user_v1');
  };

  return {
    currentUser,
    userRole: (currentUser?.role || 'user') as UserRole,
    login,
    logout
  };
}
