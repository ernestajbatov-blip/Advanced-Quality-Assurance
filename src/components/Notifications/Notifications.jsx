import React, { useState, useEffect, useRef } from "react";
import Modal from "../Modal/Modal";
import { fetchNotifications, updateNotificationStatus } from "../../axios/wellService";
import styles from "./Notifications.module.css";

const Notifications = ({ isOpen, onClose, onNewNotification }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    status: 'open',
    oil_field: 'BSK',
    limit: 50
  });
  const [lastNotificationId, setLastNotificationId] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
      // Auto-refresh every 15 seconds when modal is open
      intervalRef.current = setInterval(loadNotifications, 15000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isOpen, filter]);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchNotifications(filter);
      const newNotifications = response.data;
      
      // Check for new notifications (compare with last known notification ID)
      if (newNotifications.length > 0) {
        const latestId = newNotifications[0].id;
        
        if (lastNotificationId && latestId > lastNotificationId) {
          // New notifications detected
          const newOnes = newNotifications.filter(n => n.id > lastNotificationId);
          console.log('New notifications detected:', newOnes.length);
          
          // Notify parent component about new notifications
          if (onNewNotification) {
            newOnes.forEach(notification => {
              onNewNotification(notification);
            });
          }
        }
        
        setLastNotificationId(latestId);
      }
      
      setNotifications(newNotifications);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError("Ошибка загрузки уведомлений");
    } finally {
      setLoading(false);
    }
  };

  const getCriticalityColor = (criticality) => {
    switch (parseInt(criticality)) {
      case 1:
        return "#198754"; // Green - Info
      case 2:
        return "#ffc107"; // Yellow - Warning
      case 3:
        return "#dc3545"; // Red - Critical
      default:
        return "#6c757d"; // Gray - Default
    }
  };

  const getCriticalityText = (criticality) => {
    switch (parseInt(criticality)) {
      case 1:
        return "Информация";
      case 2:
        return "Предупреждение";
      case 3:
        return "Критический";
      default:
        return "Неизвестно";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("ru-RU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleUpdateStatus = async (notificationId, newStatus) => {
    try {
      await updateNotificationStatus(notificationId, newStatus);
      console.log(`Notification ${notificationId} updated to ${newStatus}`);
      // Refresh notifications after update
      loadNotifications();
    } catch (error) {
      console.error("Failed to update notification status:", error);
      alert("Ошибка при обновлении статуса уведомления");
    }
  };

  const handleFilterChange = (key, value) => {
    setFilter(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose}>
      <div className={styles.notificationsContainer}>
        <h2 className={styles.title}>Уведомления</h2>
        
        {/* Filters */}
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label>Статус:</label>
            <select 
              value={filter.status} 
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="open">Открытые</option>
              <option value="closed">Закрытые</option>
              <option value="">Все</option>
            </select>
          </div>
          
          <div className={styles.filterGroup}>
            <label>Лимит:</label>
            <select 
              value={filter.limit} 
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>
          
          <button 
            onClick={loadNotifications}
            className={styles.refreshButton}
            disabled={loading}
          >
            🔄 Обновить
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {loading && <div className={styles.loading}>Загрузка...</div>}
          
          {error && <div className={styles.error}>{error}</div>}
          
          {!loading && !error && (
            <div className={styles.tableContainer}>
              <table className={styles.notificationsTable}>
                <thead>
                  <tr>
                    <th>Критичность</th>
                    <th>Событие</th>
                    <th>АГЗУ</th>
                    <th>Скважина</th>
                    <th>Открыто</th>
                    <th>Статус</th>
                    <th>Комментарий</th>
                    <th>Действие</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((notification) => (
                    <tr key={notification.id} className={styles.notificationRow}>
                      <td>
                        <span 
                          className={styles.criticalityBadge}
                          style={{ backgroundColor: getCriticalityColor(notification.criticality) }}
                        >
                          {getCriticalityText(notification.criticality)}
                        </span>
                      </td>
                      <td className={styles.eventCell}>
                        {notification.event}
                      </td>
                      <td>{notification.agzu}</td>
                      <td>{notification.well}</td>
                      <td className={styles.dateCell}>{formatDate(notification.opened)}</td>
                      <td>
                        <span 
                          className={`${styles.statusBadge} ${
                            notification.status === 'open' ? styles.statusOpen : styles.statusClosed
                          }`}
                        >
                          {notification.status === 'open' ? 'Открыто' : 'Закрыто'}
                        </span>
                      </td>
                      <td className={styles.commentCell}>
                        {notification.comment && notification.comment !== 'Без комментариев' 
                          ? notification.comment 
                          : "-"}
                      </td>
                      <td className={styles.actionCell}>
                        {notification.status === 'open' ? (
                          <button
                            className={`${styles.actionButton} ${styles.closeButton}`}
                            onClick={() => handleUpdateStatus(notification.id, 'closed')}
                            title="Закрыть уведомление"
                          >
                            ✓ Закрыть
                          </button>
                        ) : (
                          <button
                            className={`${styles.actionButton} ${styles.reopenButton}`}
                            onClick={() => handleUpdateStatus(notification.id, 'open')}
                            title="Открыть уведомление"
                          >
                            ↺ Открыть
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  
                  {notifications.length === 0 && (
                    <tr>
                      <td colSpan="8" className={styles.noData}>
                        Уведомления не найдены
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default Notifications;
