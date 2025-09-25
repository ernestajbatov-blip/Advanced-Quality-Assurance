// states/UniversalActivityTracker.js
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from './UserContext';

const ActivityTrackerContext = createContext();

export const UniversalActivityTracker = ({ children }) => {
  const { user } = useUser();
  const location = useLocation();
  const sessionStartRef = useRef(Date.now());
  const lastActivityRef = useRef(Date.now());
  const activeTimeRef = useRef(0);
  const isActiveRef = useRef(true);
  const pageStartTimeRef = useRef(Date.now());

  const sendLog = async (logData) => {
    try {
      // Store locally
      const logs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
      logs.push(logData);
      if (logs.length > 500) logs.splice(0, logs.length - 500);
      localStorage.setItem('activityLogs', JSON.stringify(logs));

      // Send to backend to write to log file
      await fetch('/api/write-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData)
      });
    } catch (error) {
      console.warn('Activity log failed:', error);
    }
  };

  const createLogEntry = (action, details = {}) => ({
    userId: user?.id || 'anonymous',
    username: user?.username || 'anonymous',
    timestamp: new Date().toISOString(),
    sessionId: sessionStorage.getItem('sessionId') || Math.random().toString(36),
    action,
    details: {
      ...details,
      url: location.pathname,
      sessionDuration: Date.now() - sessionStartRef.current,
      activeTime: activeTimeRef.current,
      userAgent: navigator.userAgent.substring(0, 100)
    }
  });

  // Universal event listeners for all user interactions
  useEffect(() => {
    let idleTimer;
    let trackingTimer;

    const updateActivity = () => {
      const now = Date.now();
      if (isActiveRef.current) {
        activeTimeRef.current += now - lastActivityRef.current;
      }
      lastActivityRef.current = now;
      isActiveRef.current = true;
    };

    const handleUserActivity = (event) => {
      updateActivity();
      
      // Clear idle timer
      clearTimeout(idleTimer);
      
      // Set new idle timer (5 minutes)
      idleTimer = setTimeout(() => {
        if (isActiveRef.current) {
          sendLog(createLogEntry('user_idle'));
          isActiveRef.current = false;
        }
      }, 5 * 60 * 1000);
    };

    // Track all possible user interactions
    const events = [
      'mousedown', 'mouseup', 'mousemove', 'click',
      'keydown', 'keyup', 'keypress',
      'scroll', 'wheel',
      'touchstart', 'touchend', 'touchmove',
      'focus', 'blur',
      'resize'
    ];

    // Add universal event listeners
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true, capture: true });
    });

    // Track periodic activity summary (every 30 seconds)
    trackingTimer = setInterval(() => {
      if (isActiveRef.current) {
        updateActivity();
        sendLog(createLogEntry('activity_heartbeat', {
          activeTimeInPeriod: 30000, // 30 seconds
          totalActiveTime: activeTimeRef.current
        }));
      }
    }, 30000);

    // Initial activity
    handleUserActivity();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, { capture: true });
      });
      clearTimeout(idleTimer);
      clearInterval(trackingTimer);
    };
  }, []);

  // Track page/route changes
  useEffect(() => {
    const pageEndTime = Date.now();
    const timeOnPage = pageEndTime - pageStartTimeRef.current;
    
    // Log previous page time (except for initial load)
    if (pageStartTimeRef.current !== sessionStartRef.current) {
      sendLog(createLogEntry('page_exit', {
        timeOnPage,
        previousUrl: location.pathname
      }));
    }

    // Log new page entry
    sendLog(createLogEntry('page_enter', {
      url: location.pathname,
      referrer: document.referrer
    }));

    pageStartTimeRef.current = Date.now();
  }, [location.pathname]);

  // Track session start
  useEffect(() => {
    // Generate session ID if not exists
    if (!sessionStorage.getItem('sessionId')) {
      sessionStorage.setItem('sessionId', Math.random().toString(36));
    }

    sendLog(createLogEntry('session_start', {
      startTime: new Date(sessionStartRef.current).toISOString()
    }));

    // Track session end on page unload
    const handleBeforeUnload = () => {
      const finalActiveTime = activeTimeRef.current + (isActiveRef.current ? Date.now() - lastActivityRef.current : 0);
      
      // Use sendBeacon for reliable delivery during page unload
      const logData = createLogEntry('session_end', {
        totalDuration: Date.now() - sessionStartRef.current,
        totalActiveTime: finalActiveTime,
        endTime: new Date().toISOString()
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/activity-log', JSON.stringify(logData));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Also track visibility changes (tab switching)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        sendLog(createLogEntry('tab_hidden'));
        isActiveRef.current = false;
      } else {
        sendLog(createLogEntry('tab_visible'));
        lastActivityRef.current = Date.now();
        isActiveRef.current = true;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Provide utility function for manual tracking if needed
  const trackCustomEvent = (action, details = {}) => {
    sendLog(createLogEntry(action, details));
  };

  return (
    <ActivityTrackerContext.Provider value={{ trackCustomEvent }}>
      {children}
    </ActivityTrackerContext.Provider>
  );
};

export const useActivityTracker = () => {
  const context = useContext(ActivityTrackerContext);
  if (!context) {
    throw new Error('useActivityTracker must be used within UniversalActivityTracker');
  }
  return context;
};