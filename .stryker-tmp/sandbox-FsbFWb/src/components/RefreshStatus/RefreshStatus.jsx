// @ts-nocheck
import React from 'react';
import styles from './RefreshStatus.module.css';

export const RefreshStatus = ({ isRefreshing, lastRefresh }) => {
    const formatTime = (date) => {
        if (!date) return 'Never';
        return date.toLocaleTimeString();
    };

    return (
        <div className={styles.status}>
            {isRefreshing ? (
                <span className={styles.refreshing}>Обновление данных...</span>
            ) : (
                <span>Обновлено: {formatTime(lastRefresh)}</span>
            )}
        </div>
    );
};