import React, { useState, useEffect, useRef } from "react";
import Notifications from "../Notifications/Notifications";
import { fetchNotificationCount } from "../../axios/wellService";
import styles from "./NotificationBell.module.css";

const NotificationBell = () => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);
  const wellCheckRef = useRef(null);

  useEffect(() => {
    loadNotificationCount();
    
    // Delay the first well check to avoid immediate spam on login
    const initialDelay = setTimeout(() => {
      checkForWellStops();
    }, 5000); // Wait 5 seconds after component mounts
    
    // Poll for notification count and well stops every 60 seconds (reduced frequency)
    intervalRef.current = setInterval(() => {
      loadNotificationCount();
      checkForWellStops();
    }, 60000); // Changed from 30 seconds to 60 seconds
    
    return () => {
      clearTimeout(initialDelay);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (wellCheckRef.current) clearInterval(wellCheckRef.current);
    };
  }, []);

  const loadNotificationCount = async () => {
    try {
      setLoading(true);
      const response = await fetchNotificationCount({
        status: 'open',
        oil_field: 'BSK'
      });
      setNotificationCount(response.data.count);
    } catch (error) {
      console.error("Failed to fetch notification count:", error);
    } finally {
      setLoading(false);
    }
  };

  // Track wells that we've already notified about to prevent spam
  const [notifiedWells, setNotifiedWells] = useState(new Set());

  const checkForWellStops = async () => {
    try {
      // Fetch wells with low current
      const response = await fetch('/api/wells/bsk');
      const wells = await response.json();
      
      const stoppedWells = wells.filter(well => {
        const current = parseFloat(well['Ток'] || 0);
        const working = well['Работа'];
        return current < 1 && working === 1; // Working but low current
      });
      
      console.log('Total wells with low current:', stoppedWells.length);
      
      if (stoppedWells.length > 0) {
        // Check each well individually
        for (const well of stoppedWells) {
          const wellName = well['Скважина'];
          const current = parseFloat(well['Ток'] || 0);
          
          // Skip if we already notified about this well in this session
          if (notifiedWells.has(wellName)) {
            continue;
          }
          
          // Check for recent notifications in database (last 2 hours)
          const hasRecent = await checkRecentNotification(wellName);
          
          if (!hasRecent) {
            console.log(`Creating notification for newly stopped well: ${wellName}`);
            
            // Create notification for this well
            const created = await createWellStopNotification(wellName, current);
            
            if (created) {
              // Add to our tracking set
              setNotifiedWells(prev => new Set([...prev, wellName]));
              
              // Show popup only for this newly detected well
              showWellStopPopup({
                well: wellName,
                c_current: current
              });
              
              // Refresh notification count after a short delay
              setTimeout(loadNotificationCount, 1000);
            }
          } else {
            // Add to tracking set even if recent notification exists to prevent future spam
            setNotifiedWells(prev => new Set([...prev, wellName]));
          }
        }
      }
      
      // Clean up tracking for wells that are now working (current >= 1)
      const workingWells = wells.filter(well => {
        const current = parseFloat(well['Ток'] || 0);
        return current >= 1;
      }).map(well => well['Скважина']);
      
      setNotifiedWells(prev => {
        const updated = new Set(prev);
        workingWells.forEach(wellName => updated.delete(wellName));
        return updated;
      });
      
    } catch (error) {
      console.error("Failed to check well status:", error);
    }
  };

  const checkRecentNotification = async (wellName) => {
    try {
      const response = await fetch(`/api/notifications?oil_field=BSK&status=open&limit=200`);
      if (!response.ok) {
        console.error('Failed to fetch notifications for recent check');
        return false;
      }
      
      const notifications = await response.json();
      
      // Check for notifications in the last 2 hours
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      
      const recentStopNotification = notifications.find(notif => 
        notif.well === wellName && 
        notif.event && (
          notif.event.includes('останов') || 
          notif.event.includes('Останов') ||
          notif.event.toLowerCase().includes('низкий ток')
        ) &&
        new Date(notif.opened) > twoHoursAgo
      );
      
      if (recentStopNotification) {
        console.log(`Recent stop notification exists for ${wellName}, skipping...`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking recent notifications:', error);
      return false; // If error, assume no recent notification to be safe
    }
  };

  const createWellStopNotification = async (wellName, current) => {
    try {
      // Ensure current is never null - convert to number and default to 0
      const currentValue = parseFloat(current) || 0;
      
      const notificationData = {
        criticality: 3, // Red - Critical
        extraction: 'fluid', // Changed from 0 to 'fluid' to match server expectations
        event: `Останов ${wellName} - ток (${currentValue.toFixed(2)} А)`,
        status: 'open',
        oil_field: 'BSK',
        well: wellName,
        delta: currentValue, // Ensure it's never null
        comment: `Автоматическое уведомление: ток ${currentValue.toFixed(2)} А < 1 А`,
        user_name: 'СИСТЕМА'
      };

      console.log('Creating notification:', notificationData);

      const response = await fetch('/api/notifications/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Successfully created notification for well ${wellName}, ID: ${result.id}`);
        return true;
      } else {
        const error = await response.text();
        console.error(`❌ Failed to create notification for well ${wellName}:`, error);
        return false;
      }
    } catch (error) {
      console.error('❌ Error creating well stop notification:', error);
      return false;
    }
  };

  const showWellStopPopup = (well) => {
    // Create popup element
    const popup = document.createElement('div');
    popup.className = 'well-stop-popup';
    popup.innerHTML = `
      <div class="well-stop-popup-content">
        <div class="well-stop-popup-header">
          <span class="well-stop-criticality">ОСТАНОВ СКВАЖИНЫ</span>
          <button class="well-stop-popup-close">&times;</button>
        </div>
        <div class="well-stop-popup-body">
          <div class="well-stop-title">⚠️ Скважина остановлена</div>
          <div class="well-stop-details">
            <span><strong>Скважина:</strong> ${well.well}</span>
            <span><strong>Текущий ток:</strong> ${well.c_current.toFixed(2)} А</span>
            <span><strong>Время:</strong> ${new Date().toLocaleString('ru-RU')}</span>
          </div>
        </div>
      </div>
    `;

    // Add styles if not already added
    if (!document.getElementById('well-stop-styles')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'well-stop-styles';
      styleSheet.textContent = `
        .well-stop-popup {
          position: fixed !important;
          bottom: 20px !important;
          right: 20px !important;
          width: 350px !important;
          background: #dc3545 !important;
          color: #fff !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 20px rgba(220, 53, 69, 0.4) !important;
          z-index: 10000 !important;
          animation: slideInRight 0.3s ease-out, pulse 1s infinite alternate !important;
          border: 1px solid #b02a37 !important;
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        @keyframes pulse {
          0% { box-shadow: 0 4px 20px rgba(220, 53, 69, 0.4); }
          100% { box-shadow: 0 4px 25px rgba(220, 53, 69, 0.8); }
        }
        .well-stop-popup-content {
          padding: 0;
        }
        .well-stop-popup-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 15px;
          background: rgba(0, 0, 0, 0.2);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }
        .well-stop-criticality {
          font-size: 12px;
          font-weight: 700;
          color: #fff;
        }
        .well-stop-popup-close {
          background: none;
          border: none;
          color: #fff;
          font-size: 20px;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }
        .well-stop-popup-close:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        .well-stop-popup-body {
          padding: 15px;
        }
        .well-stop-title {
          font-weight: 700;
          margin-bottom: 10px;
          font-size: 16px;
        }
        .well-stop-details {
          display: flex;
          flex-direction: column;
          gap: 5px;
          font-size: 13px;
        }
      `;
      document.head.appendChild(styleSheet);
    }

    // Add event listeners
    const closeBtn = popup.querySelector('.well-stop-popup-close');
    const closePopup = () => {
      popup.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => {
        if (popup.parentNode) {
          popup.parentNode.removeChild(popup);
        }
      }, 300);
    };

    closeBtn.addEventListener('click', closePopup);

    // Auto-remove after 8 seconds
    setTimeout(closePopup, 8000);

    document.body.appendChild(popup);
    
    console.log('Well stop popup shown for:', well.well);
  };

  const showNotificationPopup = (notification) => {
    // Create popup element
    const popup = document.createElement('div');
    popup.className = 'notification-popup';
    
    const getCriticalityColor = (criticality) => {
      switch (parseInt(criticality)) {
        case 1: return "#198754"; // Green
        case 2: return "#ffc107"; // Yellow
        case 3: return "#dc3545"; // Red
        default: return "#6c757d";
      }
    };

    const getCriticalityText = (criticality) => {
      switch (parseInt(criticality)) {
        case 1: return "Информация";
        case 2: return "Предупреждение";
        case 3: return "Критический";
        default: return "Неизвестно";
      }
    };

    popup.innerHTML = `
      <div class="notification-popup-content">
        <div class="notification-popup-header">
          <span class="notification-criticality" style="background-color: ${getCriticalityColor(notification.criticality)}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">
            ${getCriticalityText(notification.criticality)}
          </span>
          <button class="notification-popup-close">&times;</button>
        </div>
        <div class="notification-popup-body">
          <div class="notification-event">${notification.event}</div>
          <div class="notification-details">
            <span><strong>АГЗУ:</strong> ${notification.agzu || '-'}</span>
            <span><strong>Скважина:</strong> ${notification.well || '-'}</span>
            ${notification.delta ? `<span><strong>Дельта:</strong> ${parseFloat(notification.delta).toFixed(2)}</span>` : ''}
          </div>
          <div class="notification-time">${new Date(notification.opened).toLocaleString('ru-RU')}</div>
        </div>
      </div>
    `;

    // Add styles if not already added
    if (!document.getElementById('notification-popup-styles')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'notification-popup-styles';
      styleSheet.textContent = `
        .notification-popup {
          position: fixed !important;
          bottom: 20px !important;
          right: 20px !important;
          width: 350px !important;
          background: #2d2d32 !important;
          color: #fff !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
          z-index: 10000 !important;
          animation: slideInRight 0.3s ease-out !important;
          border: 1px solid #555 !important;
        }
        .notification-popup-content {
          padding: 0;
        }
        .notification-popup-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 15px;
          background: #1e1e23;
          border-bottom: 1px solid #555;
        }
        .notification-popup-close {
          background: none;
          border: none;
          color: #adb5bd;
          font-size: 20px;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }
        .notification-popup-close:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.1);
        }
        .notification-popup-body {
          padding: 15px;
        }
        .notification-event {
          font-weight: 600;
          margin-bottom: 10px;
          line-height: 1.4;
        }
        .notification-details {
          display: flex;
          flex-direction: column;
          gap: 5px;
          margin-bottom: 10px;
          font-size: 13px;
          color: #adb5bd;
        }
        .notification-time {
          font-size: 12px;
          color: #6c757d;
        }
      `;
      document.head.appendChild(styleSheet);
    }

    // Add event listeners
    const closeBtn = popup.querySelector('.notification-popup-close');
    const closePopup = () => {
      popup.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => {
        if (popup.parentNode) {
          popup.parentNode.removeChild(popup);
        }
      }, 300);
    };

    closeBtn.addEventListener('click', closePopup);

    // Auto-remove after 5 seconds
    setTimeout(closePopup, 5000);

    document.body.appendChild(popup);
  };

  const handleNewNotification = (notification) => {
    console.log('New notification received:', notification);
    showNotificationPopup(notification);
  };

  const handleBellClick = () => {
    setIsNotificationsOpen(true);
  };

  const handleCloseNotifications = () => {
    setIsNotificationsOpen(false);
    // Refresh count when modal closes
    setTimeout(loadNotificationCount, 500);
  };

  return (
    <>
      <button
        onClick={handleBellClick}
        className={styles.bellButton}
        title="Уведомления"
        disabled={loading}
      >
        <span className={styles.bellIcon}>🔔</span>
        {notificationCount > 0 && (
          <span className={styles.badge}>
            {notificationCount > 99 ? '99+' : notificationCount}
          </span>
        )}
      </button>
      <Notifications
        isOpen={isNotificationsOpen}
        onClose={handleCloseNotifications}
        onNewNotification={handleNewNotification}
      />
    </>
  );
};

export default NotificationBell;