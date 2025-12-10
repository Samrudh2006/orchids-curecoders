import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface QueryLimitContextType {
  queriesUsed: number;
  queryLimit: number;
  isPremium: boolean;
  planType: 'free' | 'pro' | 'enterprise';
  canQuery: boolean;
  incrementQuery: () => boolean;
  resetQueries: () => void;
  setPlan: (plan: 'free' | 'pro' | 'enterprise') => void;
  getRemainingQueries: () => number;
  getResetTime: () => string;
}

const QueryLimitContext = createContext<QueryLimitContextType | undefined>(undefined);

const PLAN_LIMITS = {
  free: 5,
  pro: 50,
  enterprise: 500
};

export function QueryLimitProvider({ children }: { children: ReactNode }) {
  const [queriesUsed, setQueriesUsed] = useState(0);
  const [planType, setPlanType] = useState<'free' | 'pro' | 'enterprise'>('free');
  const [lastResetDate, setLastResetDate] = useState<string>('');

  useEffect(() => {
    const savedData = localStorage.getItem('curecoders_query_data');
    if (savedData) {
      const { queries, plan, resetDate } = JSON.parse(savedData);
      const today = new Date().toDateString();
      
      if (resetDate !== today) {
        setQueriesUsed(0);
        setLastResetDate(today);
      } else {
        setQueriesUsed(queries);
        setLastResetDate(resetDate);
      }
      setPlanType(plan || 'free');
    } else {
      setLastResetDate(new Date().toDateString());
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('curecoders_query_data', JSON.stringify({
      queries: queriesUsed,
      plan: planType,
      resetDate: lastResetDate
    }));
  }, [queriesUsed, planType, lastResetDate]);

  const queryLimit = PLAN_LIMITS[planType];
  const isPremium = planType !== 'free';
  const canQuery = queriesUsed < queryLimit;

  const incrementQuery = () => {
    if (canQuery) {
      setQueriesUsed(prev => prev + 1);
      return true;
    }
    return false;
  };

  const resetQueries = () => {
    setQueriesUsed(0);
    setLastResetDate(new Date().toDateString());
  };

  const setPlan = (plan: 'free' | 'pro' | 'enterprise') => {
    setPlanType(plan);
  };

  const getRemainingQueries = () => queryLimit - queriesUsed;

  const getResetTime = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <QueryLimitContext.Provider value={{
      queriesUsed,
      queryLimit,
      isPremium,
      planType,
      canQuery,
      incrementQuery,
      resetQueries,
      setPlan,
      getRemainingQueries,
      getResetTime
    }}>
      {children}
    </QueryLimitContext.Provider>
  );
}

export function useQueryLimit() {
  const context = useContext(QueryLimitContext);
  if (!context) {
    throw new Error('useQueryLimit must be used within QueryLimitProvider');
  }
  return context;
}
