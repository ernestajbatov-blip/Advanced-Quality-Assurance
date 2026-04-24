// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import Notifications from "../Notifications/Notifications";
import { fetchNotificationCount } from "../../axios/wellService";
import styles from "./NotificationBell.module.css";

const NotificationBell = () => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);
  const shownNotificationsRef = useRef(new Set());

  const loadNotificationCount = async () => {
    try {
      setLoading(true);
      const response = await fetchNotificationCount({
        status: 'open',
        oil_field: 'BSK'
      });
      setNotificationCount(response.data.count);
    } catch (error) {
      console.error("[Notification] Failed to fetch count:", error);
    } finally {
      setLoading(false);
    }
  };

  const showWellStopPopup = (well) => {
    const popup = document.createElement('div');
    popup.className = 'well-stop-popup';
    popup.innerHTML = `
      <div class="well-stop-popup-content">
        <div class="well-stop-popup-header">
          <span class="well-stop-criticality">ОСТАНОВКА СКВАЖИНЫ</span>
          <button class="well-stop-popup-close">&times;</button>
        </div>
        <div class="well-stop-popup-body">
          <div class="well-stop-title">Скважина остановлена</div>
          <div class="well-stop-details">
            <span><strong>Скважина:</strong> ${well.well}</span>
            <span><strong>Текущий ток:</strong> ${well.c_current.toFixed(2)} А</span>
            <span><strong>Время:</strong> ${new Date().toLocaleString('ru-RU')}</span>
          </div>
        </div>
      </div>
    `;

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
    setTimeout(closePopup, 8000);
    document.body.appendChild(popup);

    console.log('[Notification] Popup shown for well:', well.well);
  };

  const checkRecentWellStops = async () => {
    try {
      const response = await fetch('/api/notifications/recent-well-stops?oil_field=BSK');
      if (!response.ok) {
        console.error('[Notification] Failed to fetch, status:', response.status);
        return;
      }

      const notifications = await response.json();
      console.log('[Notification] Polled, found', notifications.length, 'recent well stops');
      
      notifications.forEach(notification => {
        if (!shownNotificationsRef.current.has(notification.id)) {
          console.log('[Notification] New well stop:', notification.well, 'delta:', notification.delta);
          shownNotificationsRef.current.add(notification.id);
          
          showWellStopPopup({
            well: notification.well,
            c_current: parseFloat(notification.delta || 0)
          });
          
          loadNotificationCount();
        }
      });
      
      if (shownNotificationsRef.current.size > 100) {
        shownNotificationsRef.current = new Set(
          Array.from(shownNotificationsRef.current).slice(-50)
        );
      }
    } catch (error) {
      console.error('[Notification] Error checking well stops:', error);
    }
  };

  useEffect(() => {
    console.log('[Notification] Component mounted');
    loadNotificationCount();
    
    intervalRef.current = setInterval(() => {
      checkRecentWellStops();
      loadNotificationCount();
    }, 2000);
    
    return () => {
      console.log('[Notification] Component unmounting');
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleBellClick = () => {
    setIsNotificationsOpen(true);
  };

  const handleCloseNotifications = () => {
    setIsNotificationsOpen(false);
    setTimeout(loadNotificationCount, 500);
  };

  return (
    <>
      <button
        onClick={handleBellClick}
        className={styles.bellButton}
        title="Notifications"
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
      />
    </>
  );
};

export default NotificationBell;
