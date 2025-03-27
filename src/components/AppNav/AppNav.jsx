import React, { useState, useEffect, useRef } from "react";
import styles from "./AppNav.module.css";
import DataDisplay from "../DataDisplay/DataDisplay";
import { NavLink } from "react-router-dom";
import { fetchLast10Wells } from "../../axios/wellService";

export default function AppNav() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const menuButtonRef = useRef(null);

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
        !menuButtonRef.current.contains(event.target) // Ignore clicks on menu button
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
                Нефть
              </NavLink>
            </div>
          )}
        </div>
        <div className={styles.titleContainer}>
          <div className={styles.title}>Мониторинг добычи</div>
          <div className={styles.subtitle}>Месторождение "Башенколь"</div>
        </div>
        <div className={styles.divider} />
        <div className={styles.timeContainer}>
          <div className={styles.date}>{currentTime.toLocaleDateString()}</div>
          <div className={styles.time}>{formattedTime}</div>
        </div>
        <div className={styles.divider} />
        <div className={styles.dataDisplayContainer}>
          <DataDisplay label="10 последних ГТМ/КРС" clickable={true} />
        </div>
      </div>
    </div>
  );
}
