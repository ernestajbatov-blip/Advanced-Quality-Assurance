import React, { useState, useEffect } from "react";
import styles from "./AgzuDiagram.module.css";
import Box from "../Box/Box";
import Modal from "../Modal/Modal";
import ResponsiveTable from "../ResponsiveTable/ResponsiveTable";
import { NavLink } from "react-router-dom";
import { fetchAGZUWellData, fetchAGZUTags } from "../../axios/wellService";

export default function AgzuDiagram({ filteredWells, category }) {
  // Data for center circle based on category
  const [centerData, setCenterData] = useState({
    pressure: 0,
    time: "0:00",
    temperature: 0
  });

  // Current well from current_skv tag
  const [currentSkv, setCurrentSkv] = useState("");
  const [showCurrentSkv, setShowCurrentSkv] = useState(false);
  const [currentSkvWellName, setCurrentSkvWellName] = useState("");

  // Modal state management
  const [showWellModal, setShowWellModal] = useState(false);
  const [wellModalData, setWellModalData] = useState([]);
  const [wellModalTitle, setWellModalTitle] = useState("Данные скважины");
  const [wellModalLoading, setWellModalLoading] = useState(false);
  const [boxIndex, setBoxIndex] = useState(0);

  // Function to determine the actual data source category based on active otvod
  const getDataSourceCategory = (category, filteredWells, activeOtvodIndex) => {
    if (!category || !filteredWells || filteredWells.length === 0) return category;

    // Get the well at the active otvod position (convert from 0-based to 1-based)
    const activeWell = filteredWells.find(well => well.otvod === (activeOtvodIndex + 1));
    
    if (activeWell && activeWell.well) {
      const wellName = activeWell.well.toLowerCase();
      
      // Check if the active well has a category name
      if (wellName.includes('мф')) {
        const match = wellName.match(/мф[-\s]*№?(\d+)/);
        if (match) {
          return `МФ №${match[1]}`;
        }
      }
      
      if (wellName.includes('врп')) {
        const match = wellName.match(/врп[-\s]*№?(\d+)/);
        if (match) {
          return `ВРП-${match[1]}`;
        }
      }
      
      if (wellName.includes('агзу')) {
        const match = wellName.match(/агзу[-\s]*№?(\d+)/);
        if (match) {
          return `АГЗУ-${match[1]}`;
        }
      }
    }

    // If active well doesn't have a category name, use the original category
    return category;
  };

useEffect(() => {
  const fetchCategoryData = async () => {
    try {
      if (!category) return;

      // First, fetch the original category data to get the otvod index
      const originalResponse = await fetchAGZUTags(category);
      const { tags: originalTags } = originalResponse.data;

      // Get otvod index first
      const otvodTag = Object.keys(originalTags).find(key => key.includes('_otvod'));
      const otvodValue = parseInt(originalTags[otvodTag]) || 0;
      const currentBoxIndex = otvodValue > 0 ? otvodValue - 1 : 0;

      // Now determine the actual data source category based on the active otvod
      const dataSourceCategory = getDataSourceCategory(category, filteredWells, currentBoxIndex);

      // Check if the current category is itself a category well (МФ, ВРП, or has subcategories)
      const isCategoryWithSubcategories = category.toLowerCase().includes('агзу') || 
                                        category.toLowerCase().includes('врп');

      // Check if the active well at the otvod position is a category well
      const activeWell = filteredWells.find(well => well.otvod === (currentBoxIndex + 1));
      const isCategoryWell = activeWell && activeWell.well && (
        activeWell.well.toLowerCase().includes('мф') ||
        activeWell.well.toLowerCase().includes('врп') ||
        activeWell.well.toLowerCase().includes('агзу')
      );

      // Check if we're viewing a direct category (МФ №2, ВРП-1, etc.) that has current_skv
      const isDirectCategory = category.toLowerCase().includes('мф') || 
                              category.toLowerCase().includes('врп') ||
                              (category.toLowerCase().includes('агзу') && !isCategoryWithSubcategories);

      let finalBoxIndex = currentBoxIndex; // This will be the actual highlighted box

      if (isDirectCategory) {
        // For direct category viewing (e.g., MF-2): check both current_skv and parent current_skv
        const currentSkvTag = Object.keys(originalTags).find(key => key.includes('_current_skv'));
        const currentSkvValue = parseInt(originalTags[currentSkvTag]) || 0;
        let finalCurrentSkvValue = currentSkvValue;

        // Check if any parent AGZU has a current_skv pointing to this category
        const categoryMatch = category.match(/(мф|врп|агзу)[-\s]*№?(\d+)/i);
        if (categoryMatch) {
          const categoryType = categoryMatch[1].toLowerCase();
          const categoryNum = categoryMatch[2];

          console.log(`Checking for parent AGZU current_skv affecting ${category} (type: ${categoryType}, num: ${categoryNum})`);

          try {
            for (let i = 1; i <= 4; i++) {
              const agzuName = `АГЗУ-${i}`;
              console.log(`Checking ${agzuName}...`);

              const agzuResponse = await fetchAGZUTags(agzuName);
              const { tags: agzuTags } = agzuResponse.data;

              const agzuOtvodTag = Object.keys(agzuTags).find(key => key.includes('_otvod'));
              const agzuOtvodValue = parseInt(agzuTags[agzuOtvodTag]) || 0;

              console.log(`${agzuName} otvod: ${agzuOtvodValue}`);

              if (agzuOtvodValue > 0) {
                let isMatch = false;
                if (agzuName === 'АГЗУ-2' && agzuOtvodValue === 8 && category === 'МФ №2') {
                  isMatch = true;
                } else if (agzuName === 'АГЗУ-1' && agzuOtvodValue === 8 && category === 'МФ №1') {
                  isMatch = true;
                } // Add more mappings as needed

                if (isMatch) {
                  const agzuCurrentSkvTag = Object.keys(agzuTags).find(key => key.includes('_current_skv'));
                  const agzuCurrentSkvValue = parseInt(agzuTags[agzuCurrentSkvTag]) || 0;

                  if (agzuCurrentSkvValue > 0) {
                    finalCurrentSkvValue = agzuCurrentSkvValue;
                    console.log(`Found parent ${agzuName} current_skv: ${agzuCurrentSkvValue} affecting ${category}`);
                    break;
                  }
                }
              }
            }
          } catch (error) {
            console.error("Error checking parent AGZU current_skv:", error);
          }
        }

        if (finalCurrentSkvValue > 0) {
          finalBoxIndex = finalCurrentSkvValue - 1;
          console.log(`${category} using current_skv: ${finalCurrentSkvValue}, highlighting box ${finalBoxIndex + 1}`);
        } else {
          // Use the original otvod if no current_skv found
          finalBoxIndex = currentBoxIndex;
          console.log(`${category} using original otvod, box index: ${currentBoxIndex}`);
        }
      } else if (isCategoryWell) {
        // For AGZU viewing subcategory (e.g., MF-2 under AGZU-2)
        finalBoxIndex = currentBoxIndex; // Keep the boxIndex for the subcategory (e.g., MF-2 at position 8)
        console.log(`${category} highlighting box ${currentBoxIndex + 1}, dataSourceCategory: ${dataSourceCategory}`);
      }

      // Update boxIndex to the final calculated value
      setBoxIndex(finalBoxIndex);

      // Fetch tags from the determined data source category
      const response = await fetchAGZUTags(dataSourceCategory);
      const { tags } = response.data;

      // Extract values from tags
      const timeTag = Object.keys(tags).find(key => key.includes('_time'));
      const pressureTag = Object.keys(tags).find(key => key.includes('_pressure'));
      const temperatureTag = Object.keys(tags).find(key => key.includes('_temperature'));

      // Helper function to format time
      const formatTime = (timeValue) => {
        if (timeValue === 0) return "0:00";
        const hours = Math.floor(timeValue / 60);
        const minutes = timeValue % 60;
        return `${hours}:${minutes.toString().padStart(2, '0')}`;
      };

      const newData = {
        pressure: (tags[pressureTag] || 0).toFixed(1),
        time: formatTime(tags[timeTag] || 0),
        temperature: Math.floor(tags[temperatureTag] || 0)
      };

      setCenterData(newData);

    } catch (error) {
      console.error("Error fetching AGZU tags:", error);
      // Set default values when database fetch fails
      setCenterData({
        pressure: "0.0",
        time: "0:00", 
        temperature: 0
      });
      setBoxIndex(0);
    }
  };

  fetchCategoryData();

  // Set up interval to refresh data every 30 seconds
  const interval = setInterval(fetchCategoryData, 30000);

  return () => clearInterval(interval);
}, [category, filteredWells]);

  const boxes = Array(14).fill(null);
  filteredWells.forEach((well) => {
    if (well.otvod >= 1 && well.otvod <= 14) {
      boxes[well.otvod - 1] = well;
    }
  });

  const getPipeColor = (index, defaultColor = "#50505a") => {
    // Highlight the pipe if it's the active otvod (from current_skv or otvod tag)
    if (index === boxIndex) {
      return "#4caf50";
    }
    
    return defaultColor;
  };

  const pipes = Array.from({ length: 14 }, (_, i) => ({
    x1: 116 + i % 7 * 264,
    y1: i < 7 ? 130 : 720,
    x2: 116 + i % 7 * 264,
    y2: i < 7 ? 305 : 563,
  }));

  const formatValue = (value, unit = "", decimals = 2) => {
    if (value === null || value === undefined || value === "") return "N/A";
    if (typeof value === 'number') {
      return `${value.toFixed(decimals)} ${unit}`.trim();
    }
    return value;
  };

  const handleWellClick = async (well) => {
    if (!well || !well.well) return;

    // Don't handle clicks for manual entries - they are just text displays
    if (well.isManual) {
      return;
    }

    // Handle regular wells - use REAL DATABASE DATA for modal
    const wellNumber = well.well;
    
    try {
      setWellModalLoading(true);
      setWellModalTitle(`Данные скважины ${wellNumber}`);
      setShowWellModal(true);

      // Fetch AGZU specific well data from DATABASE
      const response = await fetchAGZUWellData(wellNumber);
      const agzuWellData = response.data;

      // If API returns array, use first item, otherwise use the data directly
      const wellData = Array.isArray(agzuWellData) ? agzuWellData[0] : agzuWellData;

      const transformedData = [
        { "Параметр": "Скважина", "Значение": wellData["Скважина"] || wellNumber },
        { "Параметр": "Жидкость", "Значение": formatValue(wellData["Жидкость"], "м³") },
        { "Параметр": "Нефть", "Значение": formatValue(wellData["Нефть"], "т/сут") },
        { "Параметр": "Газ", "Значение": formatValue(wellData["Газ"], "м³/сут") },
        { "Параметр": "Обводненность", "Значение": formatValue(wellData["Обводненность"], "%") }
      ];

      setWellModalData(transformedData);

    } catch (error) {
      console.error("Error fetching AGZU well data:", error);
      
      // Fallback data from filteredWells if API fails - STILL REAL DATA
      const fallbackData = [
        { "Параметр": "Скважина", "Значение": well.well || wellNumber },
        { "Параметр": "Жидкость", "Значение": "N/A" },
        { "Параметр": "Нефть", "Значение": formatValue(well.zamer_oil, "т/сут") },
        { "Параметр": "Газ", "Значение": formatValue(well.gas, "м³/сут") },
        { "Параметр": "Обводненность", "Значение": formatValue(well.tr_water, "%") },
        { "Параметр": "Ошибка", "Значение": "Не удалось загрузить подробные данные. Показаны базовые данные." }
      ];
      setWellModalData(fallbackData);
    } finally {
      setWellModalLoading(false);
    }
  };

  const handleCloseWellModal = () => {
    setShowWellModal(false);
    setWellModalData([]);
    setWellModalLoading(false);
  };

  return (
    <div className={styles.container}>
      <svg className="svgImage" viewBox="60 -30 1700 900" xmlns="http://www.w3.org/2000/svg">
        {/* Vertical Pipes */}
        {pipes.map((pipe, index) => (
          <line key={`v${index}`} {...pipe} stroke={getPipeColor(index)} strokeWidth="3" />
        ))}

        {/* Diagonal Pipes */}
        {pipes.map((pipe, index) => (
          <line key={`d${index}`} x1="918" y1="438" x2={pipe.x2} y2={pipe.y2} stroke={getPipeColor(index)} strokeWidth="2" />
        ))}

        {/* Center Circle */}
        <ellipse cx="918" cy="438" rx="120" ry="120" fill="#50505a" />
      </svg>

      <div className={styles.overlay}>
        {boxes.map((well, index) => {
          const isCurrentSkvBox = showCurrentSkv && index === boxIndex;

          return (
            <Box
              key={index}
              // Always keep subcategory name (МФ, ВРП, АГЗУ, etc.)
              boxText1={well?.well || ""}
              // Show either zamer value, or currentSkv well name if active
              boxText2={
                isCurrentSkvBox
                  ? currentSkvWellName // show subcategory’s active well below the category name
                  : well?.zamer != null
                    ? well.zamer.toFixed(2)
                    : ""
              }
              top={index < 7 ? "5%" : "100%"}
              left={`${10 + (index % 7) * 135}px`}
              number={index + 1}
              borderColor={getPipeColor(index, "#FFFFFF")}
              onClick={well?.well && !well?.isManual ? () => handleWellClick(well) : undefined}
              style={{ cursor: well?.well && !well?.isManual ? "pointer" : "default" }}
            />
          );
        })}

        <div className={styles.circle} style={{ 
          position: 'absolute',
          top: '62.5%', 
          left: '75.5%', 
          transform: 'translate(-50%, -50%)',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'transparent',
          pointerEvents: 'none'
        }}>
          <div className={styles.circleText} style={{
            fontSize: '17px',
            color: 'white',
            textAlign: 'center',
            lineHeight: '1.2',
            margin: '2px 0'
          }}>
            {centerData.pressure} МПа
          </div>
          <div className={styles.circleText} style={{
            fontSize: '17px',
            color: 'white',
            textAlign: 'center',
            lineHeight: '1.2',
            margin: '2px 0'
          }}>
            {centerData.time}
          </div>
          <div className={styles.circleText} style={{
            fontSize: '17px',
            color: 'white',
            textAlign: 'center',
            lineHeight: '1.2',
            margin: '2px 0'
          }}>
            {centerData.temperature} °C
          </div>
        </div>

        <div className={styles.line} style={{ top: "62%", left: "86.3%" }}></div>
      </div>

        <div style={{
          position: 'absolute',
          top: '48%',
          left: '90%',
          zIndex: 1000,
          pointerEvents: 'auto',
          backgroundColor: '#50505a'
        }}>
          <NavLink 
            to="/scheme" 
            style={{
              display: 'block',
              textDecoration: 'none',
              pointerEvents: 'auto'
            }}
          >
            <button style={{
              padding: '8px 12px',
              backgroundColor: 'transparent',
              color: 'white',
              border: '1px solid white',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}>
              на УПН
            </button>
          </NavLink>
        </div>

      {showWellModal && (
        <Modal onClose={handleCloseWellModal}>
          <div style={{ padding: "20px" }}>
            <h2 style={{ 
              marginTop: 0, 
              marginBottom: "20px",
              fontSize: "24px",
              color: "white"
            }}>
              {wellModalTitle}
            </h2>
            {wellModalLoading ? (
              <div style={{ color: "white", textAlign: "center", padding: "20px" }}>
                Загрузка данных скважины...
              </div>
            ) : (
              wellModalData.length > 0 && (
                <div style={{ 
                  overflow: "auto",
                  maxHeight: "70vh"
                }}>
                  <ResponsiveTable data={wellModalData} />
                </div>
              )
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}