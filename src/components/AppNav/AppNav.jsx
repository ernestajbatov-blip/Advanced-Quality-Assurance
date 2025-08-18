import React, { useState, useEffect, useRef } from "react";
import styles from "./AppNav.module.css";
import DataDisplay from "../DataDisplay/DataDisplay";
// import NotificationBell from "../NotificationBell/NotificationBell";
import { NavLink, useNavigate } from "react-router-dom";
import { useUser } from "../../states/UserContext";

export default function AppNav() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const menuButtonRef = useRef(null);
  const userMenuRef = useRef(null);
  const userMenuButtonRef = useRef(null);
  const navigate = useNavigate();
  const { user, onLogout } = useUser();

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

      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target) &&
        userMenuButtonRef.current &&
        !userMenuButtonRef.current.contains(event.target)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    if (isDropdownOpen || isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, isUserMenuOpen]);

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen((prev) => !prev);
  };

  const handleUserMenuAction = (action) => {
    setIsUserMenuOpen(false);
    if (action === 'admin') {
      navigate("/admin/users");
    } else if (action === 'logout') {
      onLogout();
    }
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

        {/* User Menu Section - Rightmost */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          color: "#fff",
          fontSize: "14px",
          marginLeft: "auto",
          marginRight: "20px"
        }}>
          <span>{user?.name}</span>
          
          {/* Notification Bell */}
          {/* <NotificationBell /> */}
          
          <div style={{ position: "relative" }}>
            <button
              ref={userMenuButtonRef}
              onClick={toggleUserMenu}
              style={{
                width: "32px",
                height: "32px",
                backgroundColor: "transparent",
                border: "1px solid #555",
                borderRadius: "4px",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px"
              }}
              title="Настройки пользователя"
            >
              ⚙️
            </button>
            
            {isUserMenuOpen && (
              <div
                ref={userMenuRef}
                style={{
                  position: "absolute",
                  top: "100%",
                  right: "0",
                  marginTop: "5px",
                  backgroundColor: "#2d2d32",
                  border: "1px solid #555",
                  borderRadius: "4px",
                  minWidth: "160px",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                  zIndex: 1000
                }}
              >
                {!!user?.is_admin && (
                  <button
                    onClick={() => handleUserMenuAction('admin')}
                    style={{
                      width: "100%",
                      padding: "10px 15px",
                      backgroundColor: "transparent",
                      border: "none",
                      color: "#fff",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "14px",
                      borderBottom: "1px solid #555"
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = "#3d3d42"}
                    onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                  >
                    Пользователи
                  </button>
                )}
                <button
                  onClick={() => handleUserMenuAction('logout')}
                  style={{
                    width: "100%",
                    padding: "10px 15px",
                    backgroundColor: "transparent",
                    border: "none",
                    color: "#dc3545",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#3d3d42"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                >
                  Выйти
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}