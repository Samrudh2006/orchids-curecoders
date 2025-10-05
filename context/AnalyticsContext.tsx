import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface AnalyticsEvent {
  id: string;
  type: 'query' | 'export' | 'bookmark' | 'voice' | 'chat' | 'navigation' | 'feature_use';
  action: string;
  details?: Record<string, any>;
  timestamp: Date;
  sessionId: string;
  userId?: string;
}

interface SessionData {
  id: string;
  startTime: Date;
  endTime?: Date;
  pageViews: number;
  queriesRun: number;
  exportsGenerated: number;
  featuresUsed: string[];
  duration?: number;
}

interface AnalyticsMetrics {
  totalQueries: number;
  totalExports: number;
  totalBookmarks: number;
  avgSessionDuration: number;
  mostUsedFeatures: { feature: string; count: number }[];
  querySuccessRate: number;
  popularQueryTypes: { type: string; count: number }[];
  userEngagement: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  performanceMetrics: {
    avgQueryTime: number;
    avgExportTime: number;
    errorRate: number;
  };
}

interface AnalyticsContextType {
  events: AnalyticsEvent[];
  currentSession: SessionData;
  metrics: AnalyticsMetrics;
  trackEvent: (type: AnalyticsEvent['type'], action: string, details?: Record<string, any>) => void;
  getMetrics: () => AnalyticsMetrics;
  exportAnalytics: () => void;
  clearAnalytics: () => void;
  getSessionHistory: () => SessionData[];
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

const STORAGE_KEY = 'curecoders_analytics';
const SESSION_KEY = 'curecoders_session';

// Generate session ID
const generateSessionId = () => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [currentSession, setCurrentSession] = useState<SessionData>(() => ({
    id: generateSessionId(),
    startTime: new Date(),
    pageViews: 1,
    queriesRun: 0,
    exportsGenerated: 0,
    featuresUsed: []
  }));

  // Load analytics data from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const processedEvents = parsed.map((event: any) => ({
          ...event,
          timestamp: new Date(event.timestamp)
        }));
        setEvents(processedEvents);
      }

      // Check for existing session
      const sessionStored = sessionStorage.getItem(SESSION_KEY);
      if (sessionStored) {
        const session = JSON.parse(sessionStored);
        setCurrentSession({
          ...session,
          startTime: new Date(session.startTime),
          pageViews: session.pageViews + 1
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  }, []);

  // Save events to localStorage
  useEffect(() => {
    try {
      // Keep only last 1000 events to prevent storage overflow
      const eventsToStore = events.slice(-1000);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(eventsToStore));
    } catch (error) {
      console.error('Error saving analytics:', error);
    }
  }, [events]);

  // Save session to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(currentSession));
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }, [currentSession]);

  // Handle session end
  useEffect(() => {
    const handleBeforeUnload = () => {
      const endTime = new Date();
      const duration = endTime.getTime() - currentSession.startTime.getTime();
      
      const completedSession = {
        ...currentSession,
        endTime,
        duration
      };

      // Save completed session to localStorage
      try {
        const sessions = JSON.parse(localStorage.getItem('curecoders_sessions') || '[]');
        sessions.push(completedSession);
        // Keep only last 50 sessions
        const trimmedSessions = sessions.slice(-50);
        localStorage.setItem('curecoders_sessions', JSON.stringify(trimmedSessions));
      } catch (error) {
        console.error('Error saving session history:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentSession]);

  const trackEvent = useCallback((type: AnalyticsEvent['type'], action: string, details?: Record<string, any>) => {
    const event: AnalyticsEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      action,
      details,
      timestamp: new Date(),
      sessionId: currentSession.id
    };

    setEvents(prev => [...prev, event]);

    // Update session data based on event type
    setCurrentSession(prev => {
      const updates: Partial<SessionData> = {};
      
      if (type === 'query') {
        updates.queriesRun = prev.queriesRun + 1;
      } else if (type === 'export') {
        updates.exportsGenerated = prev.exportsGenerated + 1;
      }

      // Track feature usage
      const feature = `${type}:${action}`;
      if (!prev.featuresUsed.includes(feature)) {
        updates.featuresUsed = [...prev.featuresUsed, feature];
      }

      return { ...prev, ...updates };
    });
  }, [currentSession.id]);

  const getMetrics = useCallback((): AnalyticsMetrics => {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Count events by type
    const queryEvents = events.filter(e => e.type === 'query');
    const exportEvents = events.filter(e => e.type === 'export');
    const bookmarkEvents = events.filter(e => e.type === 'bookmark');

    // Calculate feature usage
    const featureUsage: Record<string, number> = {};
    events.forEach(event => {
      const feature = `${event.type}:${event.action}`;
      featureUsage[feature] = (featureUsage[feature] || 0) + 1;
    });

    const mostUsedFeatures = Object.entries(featureUsage)
      .map(([feature, count]) => ({ feature, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate query types
    const queryTypes: Record<string, number> = {};
    queryEvents.forEach(event => {
      const type = event.details?.category || 'general';
      queryTypes[type] = (queryTypes[type] || 0) + 1;
    });

    const popularQueryTypes = Object.entries(queryTypes)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    // Calculate success rates
    const successfulQueries = queryEvents.filter(e => e.details?.success !== false).length;
    const querySuccessRate = queryEvents.length > 0 ? (successfulQueries / queryEvents.length) * 100 : 100;

    // Get session data for duration calculation
    const sessions = JSON.parse(localStorage.getItem('curecoders_sessions') || '[]');
    const avgSessionDuration = sessions.length > 0 
      ? sessions.reduce((sum: number, session: any) => sum + (session.duration || 0), 0) / sessions.length / 1000 / 60 // in minutes
      : 0;

    // Calculate engagement metrics
    const dailyEvents = events.filter(e => e.timestamp >= dayAgo).length;
    const weeklyEvents = events.filter(e => e.timestamp >= weekAgo).length;
    const monthlyEvents = events.filter(e => e.timestamp >= monthAgo).length;

    // Performance metrics
    const queryTimes = queryEvents
      .filter(e => e.details?.duration)
      .map(e => e.details!.duration as number);
    const avgQueryTime = queryTimes.length > 0 
      ? queryTimes.reduce((sum, time) => sum + time, 0) / queryTimes.length / 1000 // in seconds
      : 0;

    const exportTimes = exportEvents
      .filter(e => e.details?.duration)
      .map(e => e.details!.duration as number);
    const avgExportTime = exportTimes.length > 0
      ? exportTimes.reduce((sum, time) => sum + time, 0) / exportTimes.length / 1000 // in seconds
      : 0;

    const errorEvents = events.filter(e => e.details?.error || e.details?.success === false);
    const errorRate = events.length > 0 ? (errorEvents.length / events.length) * 100 : 0;

    return {
      totalQueries: queryEvents.length,
      totalExports: exportEvents.length,
      totalBookmarks: bookmarkEvents.length,
      avgSessionDuration,
      mostUsedFeatures,
      querySuccessRate,
      popularQueryTypes,
      userEngagement: {
        daily: dailyEvents,
        weekly: weeklyEvents,
        monthly: monthlyEvents
      },
      performanceMetrics: {
        avgQueryTime,
        avgExportTime,
        errorRate
      }
    };
  }, [events]);

  const exportAnalytics = useCallback(() => {
    try {
      const metrics = getMetrics();
      const sessions = JSON.parse(localStorage.getItem('curecoders_sessions') || '[]');
      
      const analyticsData = {
        metrics,
        events: events.slice(-500), // Last 500 events
        sessions: sessions.slice(-20), // Last 20 sessions
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      };

      const dataStr = JSON.stringify(analyticsData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `curecoders-analytics-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting analytics:', error);
    }
  }, [events, getMetrics]);

  const clearAnalytics = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all analytics data? This action cannot be undone.')) {
      setEvents([]);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('curecoders_sessions');
      sessionStorage.removeItem(SESSION_KEY);
      
      // Reset current session
      setCurrentSession({
        id: generateSessionId(),
        startTime: new Date(),
        pageViews: 1,
        queriesRun: 0,
        exportsGenerated: 0,
        featuresUsed: []
      });
    }
  }, []);

  const getSessionHistory = useCallback((): SessionData[] => {
    try {
      const sessions = JSON.parse(localStorage.getItem('curecoders_sessions') || '[]');
      return sessions.map((session: any) => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: session.endTime ? new Date(session.endTime) : undefined
      }));
    } catch (error) {
      console.error('Error loading session history:', error);
      return [];
    }
  }, []);

  const metrics = getMetrics();

  const value: AnalyticsContextType = {
    events,
    currentSession,
    metrics,
    trackEvent,
    getMetrics,
    exportAnalytics,
    clearAnalytics,
    getSessionHistory
  };

  // Track initial page load
  useEffect(() => {
    trackEvent('navigation', 'page_load', { 
      path: window.location.pathname,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
  }, [trackEvent]);

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};