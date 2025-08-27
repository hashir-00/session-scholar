import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { config } from '@/config';

interface SessionContextType {
  sessionId: string;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    // Get existing session ID from localStorage or create a new one
    let storedSessionId = localStorage.getItem(config.app.sessionKey);
    
    if (!storedSessionId) {
      storedSessionId = uuidv4();
      localStorage.setItem(config.app.sessionKey, storedSessionId);
    }
    
    setSessionId(storedSessionId);
  }, []);

  if (!sessionId) {
    return null; // Don't render until session is ready
  }

  return (
    <SessionContext.Provider value={{ sessionId }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};