import React, { useState, useEffect, useRef } from "react";
import styles from "./AppNav.module.css";
import DataDisplay from "../DataDisplay/DataDisplay";
import { NavLink, useNavigate } from "react-router-dom";

export default function AppNav({ user, onLogout }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const menuButtonRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  return (
    <div className={styles.appBar}>
      <div className={styles.toolbar}>
        {/* Menu Button & Dropdown */}
        <div className={styles.iconContainer}>
          <button
            ref={menuButtonRef}
            className={styles.menuButton}
            onClick={toggleDropdown}
          >
            <span className={styles.menuIcon}>&#9776;</span>
          </button>
          {isDropdownOpen && (
            <div className={styles.dropdownMenu} ref={dropdownRef}>
              <NavLink to="/" onClick={() => setIsDropdownOpen(false)}>
                Основная
              </NavLink>
              <NavLink to="/scheme" onClick={() => setIsDropdownOpen(false)}>
                Схема
              </NavLink>
              <NavLink to="/abc" onClick={() => setIsDropdownOpen(false)}>
                ABC
              </NavLink>
              <NavLink to="/oil" onClick={() => setIsDropdownOpen(false)}>
                Oil Loss
              </NavLink>
            </div>
          )}
        </div>

        {/* Title */}
        <div className={styles.titleContainer}>
          <div className={styles.title}>Мониторинг добычи</div>
          <div className={styles.subtitle}>Месторождение "Башенколь"</div>
        </div>

        <div className={styles.divider} />

        {/* Time and Date */}
        <div className={styles.timeContainer}>
          <div className={styles.date}>{currentTime.toLocaleDateString()}</div>
          <div className={styles.time}>{formattedTime}</div>
        </div>

        <div className={styles.divider} />

        {/* Last 10 Wells */}
        <div className={styles.dataDisplayContainer}>
          <DataDisplay label="10 последних ГТМ/КРС" clickable={true} />
        </div>

        <div className={styles.divider} />

        {/* User Navigation Section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            color: "#fff",
            fontSize: "14px",
          }}
        >
          <span>Добро пожаловать, {user?.name}</span>

          {user?.is_admin && (
            <button
              onClick={() => navigate("/admin/users")}
              style={{
                padding: "8px 16px",
                backgroundColor: "#28a745",
                color: "#ffffff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Пользователи
            </button>
          )}

          <button
            onClick={onLogout}
            style={{
              padding: "8px 16px",
              backgroundColor: "#dc3545",
              color: "#ffffff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
}
