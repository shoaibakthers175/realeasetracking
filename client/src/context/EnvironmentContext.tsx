import React, { createContext, useContext, useState, useEffect } from 'react';
import { Environment } from '../types';

export type EnvironmentFilter = Environment | 'ALL';

interface EnvironmentContextType {
  environment: EnvironmentFilter;
  setEnvironment: (env: EnvironmentFilter) => void;
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined);

export const EnvironmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [environment, setEnvironmentState] = useState<EnvironmentFilter>(() => {
    return (localStorage.getItem('releasetrack_env') as EnvironmentFilter) || 'PRODUCTION';
  });

  const setEnvironment = (env: EnvironmentFilter) => {
    setEnvironmentState(env);
    localStorage.setItem('releasetrack_env', env);
  };

  return (
    <EnvironmentContext.Provider value={{ environment, setEnvironment }}>
      {children}
    </EnvironmentContext.Provider>
  );
};

export const useEnvironment = (): EnvironmentContextType => {
  const context = useContext(EnvironmentContext);
  if (!context) {
    throw new Error('useEnvironment must be used within an EnvironmentProvider');
  }
  return context;
};
