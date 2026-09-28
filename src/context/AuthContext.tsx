import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { UserProfile, UserRole } from '../types';
import { DEMO_USERS } from '../data/thaiAdministrativeData';

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  login: (user: UserProfile) => void;
  loginWithCredentials: (email: string, role?: UserRole) => Promise<boolean>;
  logout: (reason?: string) => void;
  switchUser: (userId: string) => void;
  secondsRemaining: number;
  extendSession: () => void;
  showInactivityWarning: boolean;
  dismissWarning: () => void;
  lastActiveTime: Date;
}

const INACTIVITY_TIMEOUT_SECONDS = 30 * 60; // 30 minutes (1800 seconds)
const WARNING_THRESHOLD_SECONDS = 120; // Show warning when 2 minutes left

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_AUTH_USER = 'emeeting_gov_current_user';
const STORAGE_KEY_LAST_ACTIVITY = 'emeeting_gov_last_activity';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUTH_USER);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load user', e);
    }
    // Default to Tambon Clerk for instant practical demonstration
    return DEMO_USERS[0];
  });

  const [secondsRemaining, setSecondsRemaining] = useState<number>(INACTIVITY_TIMEOUT_SECONDS);
  const [showInactivityWarning, setShowInactivityWarning] = useState<boolean>(false);
  const [lastActiveTime, setLastActiveTime] = useState<Date>(new Date());
  const timerRef = useRef<any>(null);

  const resetInactivityTimer = useCallback(() => {
    const now = Date.now();
    localStorage.setItem(STORAGE_KEY_LAST_ACTIVITY, now.toString());
    setSecondsRemaining(INACTIVITY_TIMEOUT_SECONDS);
    setShowInactivityWarning(false);
    setLastActiveTime(new Date(now));
  }, []);

  const logout = useCallback((reason?: string) => {
    localStorage.removeItem(STORAGE_KEY_AUTH_USER);
    localStorage.removeItem(STORAGE_KEY_LAST_ACTIVITY);
    setCurrentUser(null);
    setShowInactivityWarning(false);
    if (reason) {
      // Store notification message for the login page
      sessionStorage.setItem('emeeting_logout_notice', reason);
    }
  }, []);

  const login = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user));
    resetInactivityTimer();
  };

  const loginWithCredentials = async (email: string, role?: UserRole): Promise<boolean> => {
    const user = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase()) 
      || (role ? DEMO_USERS.find(u => u.role === role) : DEMO_USERS[0]);
    if (user) {
      login(user);
      return true;
    }
    return false;
  };

  const switchUser = (userId: string) => {
    const target = DEMO_USERS.find(u => u.id === userId);
    if (target) {
      login(target);
    }
  };

  const extendSession = () => {
    resetInactivityTimer();
  };

  const dismissWarning = () => {
    resetInactivityTimer();
  };

  // Activity listeners to detect user interaction
  useEffect(() => {
    if (!currentUser) return;

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    // Throttle activity recording to once every 10 seconds to avoid performance overhead
    let lastThrottled = Date.now();
    const handleUserActivity = () => {
      const now = Date.now();
      if (now - lastThrottled > 10000) {
        lastThrottled = now;
        localStorage.setItem(STORAGE_KEY_LAST_ACTIVITY, now.toString());
      }
    };

    activityEvents.forEach(evt => window.addEventListener(evt, handleUserActivity, { passive: true }));

    return () => {
      activityEvents.forEach(evt => window.removeEventListener(evt, handleUserActivity));
    };
  }, [currentUser]);

  // Main countdown ticker (runs every second)
  useEffect(() => {
    if (!currentUser) return;

    timerRef.current = setInterval(() => {
      const last = localStorage.getItem(STORAGE_KEY_LAST_ACTIVITY);
      const lastTime = last ? parseInt(last, 10) : Date.now();
      const elapsedSeconds = Math.floor((Date.now() - lastTime) / 1000);
      const remaining = Math.max(0, INACTIVITY_TIMEOUT_SECONDS - elapsedSeconds);

      setSecondsRemaining(remaining);

      // Warning when 2 minutes remain
      if (remaining <= WARNING_THRESHOLD_SECONDS && remaining > 0) {
        setShowInactivityWarning(true);
      }

      // 30-minute auto logout triggered
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        logout('Sistem telah melakukan log keluar secara automatik kerana tiada sebarang aktiviti melebihi 30 minit mengikut piawaian keselamatan sistem maklumat rasmi.');
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentUser, logout]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        loginWithCredentials,
        logout,
        switchUser,
        secondsRemaining,
        extendSession,
        showInactivityWarning,
        dismissWarning,
        lastActiveTime
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
