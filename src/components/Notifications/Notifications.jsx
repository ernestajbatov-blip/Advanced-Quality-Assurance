import React, { useState, useEffect } from "react";
import Modal from "../Modal/Modal";
import { fetchNotifications } from "../../axios/wellService";
import styles from "./Notifications.module.css";

const Notifications = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    status: 'open',
    oil_field: 'BSK',
    limit: 50
  });

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, filter]);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchNotifications(filter);
      setNotifications(response.data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError("Ошибка загрузки уведомлений");
    } finally {
      setLoading(false);
    }
  };

  const getCriticalityColor = (criticality) => {
    switch (criticality) {
      case 1:
        return "#dc3545"; // Red - Critical
      case 2:
        return "#fd7e14"; // Orange - Warning
      case 3:
        return "#ffc107"; // Yellow - Info
      default:
        return "#6c757d"; // Gray - Default
    }
  };

  const getCriticalityText = (criticality) => {
    switch (criticality) {
      case 1:
        return "Критический";
      case 2:
        return "Предупреждение";
      case 3:
        return "Информация";
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
                    <th>Дельта</th>
                    <th>Открыто</th>
                    <th>Статус</th>
                    <th>Комментарий</th>
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
                      <td className={styles.deltaCell}>
                        {notification.delta ? `${parseFloat(notification.delta).toFixed(2)}` : "-"}
                      </td>
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