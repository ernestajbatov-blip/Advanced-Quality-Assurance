// @ts-nocheck
import React, { useState, useEffect } from "react";
import styles from "./VRP.module.css";
import VRPDiagram from "../VRPDiagram/VRPDiagram";
import { fetchAGZUCategories } from "../../axios/wellService";

function Button({ label, active, onClick }) {
  return (
    <div
      className={`${styles.button} ${active ? styles.active : ""}`}
      onClick={onClick}
    >
      {label}
    </div>
  );
}

function Dropdown({ options, active, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.dropdown}>
      <div
        className={`${styles.button} ${styles.dropdownButton}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {active || "Выберите ВРП"} ▼
      </div>
      {isOpen && (
        <div className={styles.dropdownMenu}>
          {options.map((option) => (
            <div
              key={option}
              className={`${styles.dropdownItem} ${
                active === option ? styles.active : ""
              }`}
              onClick={() => {
                onSelect(option);
                setIsOpen(false);
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function VRP({ wells }) {
  const [categories, setCategories] = useState([]);
  const [activeButton, setActiveButton] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load categories first
        const categoriesResponse = await fetchAGZUCategories();
        const allCategories = categoriesResponse.data || [];

        // Filter categories to only show those starting with "ВРП"
        const filteredCategories = allCategories.filter(category =>
          category.startsWith("ВРП")
        );

        setCategories(filteredCategories);

        // Set the first category as active by default
        if (filteredCategories.length > 0) {
          const firstCategory = filteredCategories[0];
          setActiveButton(firstCategory);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading VRP data:", err);
        setError("Failed to load VRP data");
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleButtonClick = async (label) => {
    console.log("VRP Button clicked:", label);
    setActiveButton(label);
  };

  const filteredWells = wells.filter(
    (well) => well.agzu === activeButton && well.nagn == 1
  );

  console.log("VRP Filtered Wells:", filteredWells);
  console.log("VRP Active Button:", activeButton);
  console.log("VRP Categories:", categories);

  if (loading) {
    return (
      <div className={styles.upperDiv}>
        <div className={styles.container}>
          <div className={styles.loading}>Загрузка данных...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.upperDiv}>
        <div className={styles.container}>
          <div className={styles.error}>{error}</div>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className={styles.upperDiv}>
        <div className={styles.container}>
          <div className={styles.noData}>Нет доступных ВРП категорий</div>
        </div>
      </div>
    );
  }

  const useDropdown = categories.length > 8;

  return (
    <div className={styles.upperDiv}>
      <div className={styles.container}>
        {useDropdown ? (
          <Dropdown
            options={categories}
            active={activeButton}
            onSelect={handleButtonClick}
          />
        ) : (
          categories.map((category) => (
            <Button
              key={category}
              label={category}
              active={activeButton === category}
              onClick={() => handleButtonClick(category)}
            />
          ))
        )}
      </div>
      <VRPDiagram 
        filteredWells={filteredWells}
        category={activeButton}
      />
    </div>
  );
}