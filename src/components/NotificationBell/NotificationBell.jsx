import React, { useState, useEffect } from "react";
import Notifications from "../Notifications/Notifications";
import { fetchNotificationCount } from "../../axios/wellService";
import styles from "./NotificationBell.module.css";

const NotificationBell = () => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotificationCount();
    
    // Poll for notification count every 30 seconds
    const interval = setInterval(loadNotificationCount, 30000);
    
    return () => clearInterval(interval);
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

  const handleBellClick = () => {
    setIsNotificationsOpen(true);
  };

  const handleCloseNotifications = () => {
    setIsNotificationsOpen(false);
    // Refresh count when modal closes
    loadNotificationCount();
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
      />
    </>
  );
};

export default NotificationBell;