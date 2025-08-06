import React, { useContext, useState, useEffect } from "react";
import styles from "./AGZU.module.css";
import AgzuDiagram from "../AgzuDiagram/AgzuDiagram";
import { fetchAGZUCategories, fetchWellNumber } from "../../axios/wellService";

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
        {active || "Выберите категорию"} ▼
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

export default function AGZU({ wells, index }) {
  const [categories, setCategories] = useState([]);
  const [activeButton, setActiveButton] = useState("");
  const [wellNumber, setWellNumber] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load both categories and well number in parallel
        const [categoriesResponse, wellNumberResponse] = await Promise.all([
          fetchAGZUCategories(),
          fetchWellNumber()
        ]);

        const allCategories = categoriesResponse.data || [];
        const fetchedWellNumber = wellNumberResponse.data?.wellNumber || 5;

        // Filter categories to only show those starting with "АГЗУ" or "МФ"
        const filteredCategories = allCategories.filter(category => 
          category.startsWith("АГЗУ") || category.startsWith("МФ №")
        );

        setCategories(filteredCategories);
        setWellNumber(fetchedWellNumber);

        // Set the first category as active by default
        if (filteredCategories.length > 0) {
          setActiveButton(filteredCategories[0]);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading AGZU data:", err);
        setError("Failed to load data");
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleButtonClick = (label) => {
    setActiveButton(label);
  };

  const filteredWells = wells.filter(
    (well) => well.agzu === activeButton && well.nagn == 0
  );

  console.log("Filtered Wells:", filteredWells);
  console.log("Active Button:", activeButton);
  console.log("Categories:", categories);
  console.log("Well Number:", wellNumber);

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
      <AgzuDiagram filteredWells={filteredWells} boxIndex={wellNumber-1} />
    </div>
  );
}