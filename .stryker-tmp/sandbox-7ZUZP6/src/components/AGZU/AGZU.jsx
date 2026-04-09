// @ts-nocheck
import React, { useContext, useState, useEffect } from "react";
import styles from "./AGZU.module.css";
import AgzuDiagram from "../AgzuDiagram/AgzuDiagram";
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
        {active || "Выберите категорию"} ▼
      </div>
      {isOpen && (
        <div className={styles.dropdownMenu}>
          {options.map((option) => (
            <div
              key={option.value}
              className={`${styles.dropdownItem} ${
                active === option.display ? styles.active : ""
              }`}
              onClick={() => {
                onSelect(option.value);
                setIsOpen(false);
              }}
            >
              {option.display}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AGZU({ wells, index, handleWellClick, setCurrentOtvodWell, setCurrentOtvodData }) {
  const [categories, setCategories] = useState([]);
  const [activeButton, setActiveButton] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const manualEntries = [
    {
      otvod: 2,
      well: "МФ-4",
      agzu: "МФ №3",
      nagn: 0,
      tr_fluid: null,
      isManual: true
    },
    {
      otvod: 8,
      well: "МФ-2",
      agzu: "АГЗУ-2",
      nagn: 0,
      tr_fluid: null,
      isManual: true
    },
  ];

  // Format category display name
  const formatCategoryDisplay = (category) => {
    if (!category) return category;
    const normalized = category.toLowerCase().replace(/\s+/g, '');
    if (normalized === "агзу-4" || normalized === "agzu-4") {
      return category.includes("СКЖ") ? category : `${category} (СКЖ)`;
    }
    return category;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const categoriesResponse = await fetchAGZUCategories();
        const allCategories = categoriesResponse.data || [];

        const filteredCategories = allCategories.filter(category => 
          category.startsWith("АГЗУ") || category.startsWith("МФ №")
        );

        // Create category objects with both value (original) and display (formatted)
        const formattedCategories = filteredCategories.map(cat => ({
          value: cat,
          display: formatCategoryDisplay(cat)
        }));

        setCategories(formattedCategories);

        if (formattedCategories.length > 0) {
          const firstCategory = formattedCategories[0].value;
          setActiveButton(firstCategory);
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

  const handleButtonClick = async (label) => {
    console.log("Button clicked:", label);
    setActiveButton(label);
  };

  const combinedWells = [
    ...wells.filter((well) => well.agzu === activeButton && well.nagn == 0),
    ...manualEntries.filter((entry) => entry.agzu === activeButton)
  ];

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

  // Get display name for active button
  const activeDisplayName = categories.find(cat => cat.value === activeButton)?.display || activeButton;

  return (
    <div className={styles.upperDiv}>
      <div className={styles.container}>
        {useDropdown ? (
          <Dropdown
            options={categories}
            active={activeDisplayName}
            onSelect={handleButtonClick}
          />
        ) : (
          categories.map((category) => (
            <Button
              key={category.value}
              label={category.display}
              active={activeButton === category.value}
              onClick={() => handleButtonClick(category.value)}
            />
          ))
        )}
      </div>
      <AgzuDiagram 
        filteredWells={combinedWells}
        category={activeButton}
        handleWellClick={handleWellClick}
        setCurrentOtvodWell={setCurrentOtvodWell}
        setCurrentOtvodData={setCurrentOtvodData}
      />
    </div>
  );
}