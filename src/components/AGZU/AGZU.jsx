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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define manual entries for specific otvod positions
  const manualEntries = [
    {
      otvod: 13,
      well: "МФ-4",
      agzu: "АГЗУ-1", // Match this to your category filter
      nagn: 0,
      tr_fluid: null, // No second line text
      isManual: true // Flag to identify manual entries
    },
    {
      otvod: 14,
      well: "МФ-1",
      agzu: "АГЗУ-1", // Match this to your category filter
      nagn: 0,
      tr_fluid: null, // No second line text
      isManual: true // Flag to identify manual entries
    },
    {
      otvod: 8,
      well: "МФ-2",
      agzu: "АГЗУ-2", // Match this to your category filter
      nagn: 0,
      tr_fluid: null, // No second line text
      isManual: true // Flag to identify manual entries
    },
    {
      otvod: 14,
      well: "МФ-1",
      agzu: "АГЗУ-1", // Match this to your category filter
      nagn: 0,
      tr_fluid: null, // No second line text
      isManual: true // Flag to identify manual entries
    },
    {
      otvod: 2,
      well: "МФ-4",
      agzu: "МФ №3", // Match this to your category filter
      nagn: 0,
      tr_fluid: null, // No second line text
      isManual: true // Flag to identify manual entries
    },
    {
      otvod: 14,
      well: "МФ-1",
      agzu: "АГЗУ-1", // Match this to your category filter
      nagn: 0,
      tr_fluid: null, // No second line text
      isManual: true // Flag to identify manual entries
    },
  ];



  useEffect(() => {
    const loadData = async () => {
      try {
        // Load categories first
        const categoriesResponse = await fetchAGZUCategories();
        const allCategories = categoriesResponse.data || [];

        // Filter categories to only show those starting with "АГЗУ" or "МФ"
        const filteredCategories = allCategories.filter(category => 
          category.startsWith("АГЗУ") || category.startsWith("МФ №")
        );

        setCategories(filteredCategories);

        // Set the first category as active by default
        if (filteredCategories.length > 0) {
          const firstCategory = filteredCategories[0];
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

  // Combine real wells with manual entries
  const combinedWells = [
    ...wells.filter((well) => well.agzu === activeButton && well.nagn == 0),
    ...manualEntries.filter((entry) => entry.agzu === activeButton)
  ];

  console.log("Combined Wells:", combinedWells);
  console.log("Active Button:", activeButton);
  console.log("Categories:", categories);

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
      <AgzuDiagram 
        filteredWells={combinedWells}
        category={activeButton}
      />
    </div>
  );
}