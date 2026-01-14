// AgzuDiagram.jsx:
import React, { useState, useEffect, useCallback, useRef } from "react";
import styles from "./AgzuDiagram.module.css";
import Box from "../Box/Box";
import Modal from "../Modal/Modal";
import ResponsiveTable from "../ResponsiveTable/ResponsiveTable";
import { NavLink } from "react-router-dom";
import { fetchAGZUWellData, fetchAGZUTags } from "../../axios/wellService";

export default function AgzuDiagram({ filteredWells, category, handleWellClick, setCurrentOtvodWell, setCurrentOtvodData }) {
  // Format category display name
  const getDisplayCategory = (cat) => {
    if (!cat) return cat;
    const normalized = cat.toLowerCase().replace(/\s+/g, '');
    if (normalized === "агзу-4" || normalized === "agzu-4") {
      return cat.includes("СКЖ") ? cat : `${cat} (СКЖ)`;
    }
    return cat;
  };
  
  const displayCategory = getDisplayCategory(category);
  const [centerData, setCenterData] = useState({
    density: 0,
    time: "0:00",
    temperature: 0,
    agzu4Oil: null,
    lastUpdate: null,
  });

  const [boxIndex, setBoxIndex] = useState(0);
  const boxIndexRef = useRef(0);
  const [localOtvodData, setLocalOtvodData] = useState(null);
  const [showWellModal, setShowWellModal] = useState(false);
  const [wellModalData, setWellModalData] = useState([]);
  const [wellModalTitle, setWellModalTitle] = useState("Данные скважины");
  const [wellModalLoading, setWellModalLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [prevCategory, setPrevCategory] = useState(category);
  
  // Add fetch guard to prevent concurrent fetches
  const [isFetching, setIsFetching] = useState(false);
  const fetchingRef = useRef(false);

  // Determine number of boxes based on category
  const getBoxCount = () => {
    if (!category) return 14;
    
    // Normalize category for comparison (handle both "АГЗУ-4" and "agzu-4")
    const normalizedCategory = category.toLowerCase().replace(/\s+/g, '');
    
    if (normalizedCategory === "агзу-4" || normalizedCategory === "agzu-4") {
      return 7;
    }
    return 14;
  };

  const boxCount = getBoxCount();
  const boxesPerRow = 7;

  // Fixed date formatting functions
  const formatDateShort = (dateString) => {
    if (!dateString) return "N/A";
    
    // Check for MySQL's zero/null date format
    if (dateString === "0000-00-00 00:00:00" || dateString.startsWith("0000-00-00")) return "N/A";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      
      // Use local time
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear().toString().slice(-2);
      
      return `${day}.${month}.${year}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };

  const formatTimeShort = (dateString) => {
    if (!dateString) return "N/A";
    
    // Check for MySQL's zero/null date format
    if (dateString === "0000-00-00 00:00:00" || dateString.startsWith("0000-00-00")) return "N/A";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      
      // Use local time - the backend should send dates in correct timezone
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${hours}:${minutes}`;
    } catch (error) {
      console.error("Error formatting time:", error);
      return "N/A";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    // Check for MySQL's zero/null date format
    if (dateString === "0000-00-00 00:00:00" || dateString.startsWith("0000-00-00")) return "N/A";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      
      // Use local time - the backend should send dates in correct timezone
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      
      return `${day}.${month}.${year}, ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };

  const apiBaseURL = process.env.NODE_ENV === "production" 
    ? "http://188.0.132.80:3000/api" 
    : "http://localhost:3000/api";

  const fetchCategoryData = useCallback(async () => {
    // Prevent concurrent fetches
    if (fetchingRef.current) {
      console.log("Fetch already in progress, skipping");
      return;
    }
    
    fetchingRef.current = true;
    setIsFetching(true);
    
    try {
      if (!category) return;

      const response = await fetchAGZUTags(category);
      const { tags } = response.data;

      // Check if this is AGZU-4
      const normalizedCategory = category.toLowerCase().replace(/\s+/g, '');
      const isAgzu4 = normalizedCategory === "агзу-4" || normalizedCategory === "agzu-4";

      let currentBoxIndex = 0;

      if (isAgzu4) {
        // For AGZU-4, use agzu_4_skv tag to find the well
        const agzu4SkvTag = Object.keys(tags).find((key) =>
          key.toLowerCase().includes("agzu_4_skv") || key === "agzu_4_skv"
        );
        
        console.log("AGZU-4 detected. Available tags:", Object.keys(tags));
        console.log("Looking for agzu_4_skv tag, found:", agzu4SkvTag);
        
        if (agzu4SkvTag && tags[agzu4SkvTag]) {
          // Get the number from the tag (e.g., 201)
          const wellNumberFromTag = parseInt(tags[agzu4SkvTag]);
          
          // Format it as BSK_XXXX (e.g., BSK_0201)
          const formattedWellName = `BSK_${String(wellNumberFromTag).padStart(4, '0')}`;
          
          console.log("Raw well number from tag:", wellNumberFromTag);
          console.log("Formatted well name:", formattedWellName);
          console.log("Available wells in boxes:", filteredWells.map(w => w.well));
          
          // Find which box/otvod this well is in
          const wellIndex = filteredWells.findIndex(w => w.well === formattedWellName);
          console.log("Looking for well", formattedWellName, "found at index:", wellIndex);
          
          if (wellIndex !== -1) {
            currentBoxIndex = filteredWells[wellIndex].otvod - 1;
            console.log("Setting currentBoxIndex to:", currentBoxIndex, "for otvod:", filteredWells[wellIndex].otvod);
          } else {
            console.warn("Well", formattedWellName, "not found in filtered wells");
          }
        }
      } else {
        // For other AGZUs, use the current_otvod tag as before
        const currentOtvodTag = Object.keys(tags).find((key) =>
          key.includes("_current_otvod")
        );
        const currentOtvodValue = parseInt(tags[currentOtvodTag]) || 0;
        currentBoxIndex = currentOtvodValue > 0 ? currentOtvodValue - 1 : 0;
        console.log("Current otvod tag:", currentOtvodTag, "value:", tags[currentOtvodTag], "calculated index:", currentBoxIndex);
      }

      // CRITICAL FIX: Only update state if the value actually changed
      // This prevents unnecessary re-renders and the "going ham" issue
      if (boxIndexRef.current !== currentBoxIndex) {
        boxIndexRef.current = currentBoxIndex;
        console.log("BoxIndexRef updated to", currentBoxIndex);
        
        // Use functional update to ensure we're working with latest state
        setBoxIndex(prevIndex => {
          if (prevIndex !== currentBoxIndex) {
            return currentBoxIndex;
          }
          return prevIndex;
        });
      }

      const currentLiquidTag = Object.keys(tags).find((key) =>
        key.includes("_current_liquid")
      );
      const currentOilTag = Object.keys(tags).find((key) =>
        key.includes("_current_oil")
      );
      const currentGasTag = Object.keys(tags).find((key) =>
        key.includes("_current_gas")
      );
      const currentWTag = Object.keys(tags).find((key) =>
        key.includes("_current_W")
      );
      
      // Find the well for the current otvod and get its update_date
      const currentWell = filteredWells.find(w => w.otvod === (currentBoxIndex + 1));
      const lastDate = currentWell?.update_date || null;

      const otvodData = {
        liquid: tags[currentLiquidTag] ? parseFloat(tags[currentLiquidTag]) : null,
        oil: tags[currentOilTag] ? parseFloat(tags[currentOilTag]) : null,
        gas: tags[currentGasTag] ? parseFloat(tags[currentGasTag]) : null,
        waterCut: tags[currentWTag] ? parseFloat(tags[currentWTag]) : null,
        lastDate: lastDate,
      };
      
      // Only update if data actually changed
      setLocalOtvodData(prevData => {
        if (JSON.stringify(prevData) !== JSON.stringify(otvodData)) {
          return otvodData;
        }
        return prevData;
      });

      if (currentWell && setCurrentOtvodWell && setCurrentOtvodData) {
        setCurrentOtvodWell(currentWell.well);
        setCurrentOtvodData(otvodData);
      }

      // Find the most recent update date across ALL wells in this category
      // Convert to Date objects first for proper comparison
      const wellsWithDates = filteredWells
        .filter(w => w.update_date != null)
        .map(w => ({
          well: w.well,
          date: new Date(w.update_date),
          rawDate: w.update_date
        }))
        .filter(w => !isNaN(w.date.getTime())); // Filter out invalid dates
      
      console.log("Wells with dates in category:", category);
      wellsWithDates.forEach(w => {
        console.log(`  ${w.well}: ${w.rawDate} (parsed: ${w.date.toISOString()})`);
      });
      
      // Sort by Date object, not string
      wellsWithDates.sort((a, b) => b.date - a.date);
      
      const mostRecentUpdateDate = wellsWithDates.length > 0 ? wellsWithDates[0].rawDate : null;
      
      console.log("Most recent update date:", mostRecentUpdateDate);
      if (mostRecentUpdateDate) {
        console.log("Most recent well:", wellsWithDates[0].well);
        console.log("Formatted:", formatDate(mostRecentUpdateDate));
      }

      // Handle center circle data based on AGZU type
      if (isAgzu4) {
        // For AGZU-4, show only agzu_4_oil in the center
        const agzu4OilTag = Object.keys(tags).find((key) =>
          key.toLowerCase().includes("agzu_4_oil") || key === "agzu_4_oil"
        );
        
        console.log("Looking for agzu_4_oil tag, found:", agzu4OilTag);
        console.log("agzu_4_oil value:", tags[agzu4OilTag]);
        
        const newCenterData = {
          density: null,
          time: null,
          temperature: null,
          agzu4Oil: agzu4OilTag && tags[agzu4OilTag] !== undefined 
            ? parseFloat(tags[agzu4OilTag]).toFixed(2) 
            : "0.00",
          lastUpdate: mostRecentUpdateDate,
        };
        
        // Only update if data changed
        setCenterData(prevData => {
          if (JSON.stringify(prevData) !== JSON.stringify(newCenterData)) {
            return newCenterData;
          }
          return prevData;
        });
      } else {
        // For other AGZUs, show the original three values
        const sepPressureTag = Object.keys(tags).find((key) =>
          key.includes("_sep_pressure")
        );
        const passTimeTag = Object.keys(tags).find((key) =>
          key.includes("_pass_time")
        );
        const liqTempTag = Object.keys(tags).find((key) =>
          key.includes("_liq_temp")
        );

        const formatTime = (timeValue) => {
          if (!timeValue || timeValue === 0) return "0:00";
          const hours = Math.floor(timeValue / 60);
          const minutes = timeValue % 60;
          return `${hours}:${minutes.toString().padStart(2, "0")}`;
        };

        const newCenterData = {
          density: sepPressureTag && tags[sepPressureTag] !== undefined 
            ? parseFloat(tags[sepPressureTag]).toFixed(2) 
            : "0.00",
          time: passTimeTag && tags[passTimeTag] !== undefined 
            ? formatTime(parseFloat(tags[passTimeTag])) 
            : "0:00",
          temperature: liqTempTag && tags[liqTempTag] !== undefined 
            ? Math.floor(parseFloat(tags[liqTempTag])) 
            : 0,
          agzu4Oil: null,
          lastUpdate: mostRecentUpdateDate,
        };
        
        // Only update if data changed
        setCenterData(prevData => {
          if (JSON.stringify(prevData) !== JSON.stringify(newCenterData)) {
            return newCenterData;
          }
          return prevData;
        });
      }

    } catch (error) {
      console.error("Error fetching AGZU data:", error);
      // Only set error state if not already in error state
      setCenterData(prevData => {
        const errorData = {
          density: "0.00",
          time: "0:00",
          temperature: 0,
          agzu4Oil: "0.00",
          lastUpdate: null,
        };
        if (JSON.stringify(prevData) !== JSON.stringify(errorData)) {
          return errorData;
        }
        return prevData;
      });
      setLocalOtvodData(null);
      setBoxIndex(0);
      if (setCurrentOtvodWell && setCurrentOtvodData) {
        setCurrentOtvodWell(null);
        setCurrentOtvodData(null);
      }
    } finally {
      fetchingRef.current = false;
      setIsFetching(false);
    }
  }, [category, filteredWells, setCurrentOtvodWell, setCurrentOtvodData]);

  useEffect(() => {
    // Check if category actually changed
    if (prevCategory !== category) {
      console.log("Category changed from", prevCategory, "to", category);
      setIsInitialLoad(true);
      setPrevCategory(category);
    }
    
    // Fetch immediately on mount or category change
    const initialFetch = async () => {
      await fetchCategoryData();
      if (isInitialLoad) {
        // Small delay before removing initial load flag to prevent flicker
        setTimeout(() => setIsInitialLoad(false), 500);
      }
    };
    
    initialFetch();
    
    // Set up polling interval (increased from 2s to 5s to reduce load and race conditions)
    const intervalId = setInterval(() => {
      fetchCategoryData();
    }, 5000);
    
    // Cleanup: clear interval when component unmounts or category changes
    return () => {
      clearInterval(intervalId);
    };
  }, [category, fetchCategoryData, isInitialLoad, prevCategory]);

  const boxes = Array(boxCount).fill(null);
  filteredWells.forEach((well) => {
    if (well.otvod >= 1 && well.otvod <= boxCount) {
      boxes[well.otvod - 1] = well;
    }
  });

  const getPipeColor = useCallback((index, defaultColor = "#50505a") => {
    // During initial load, don't highlight any pipe to prevent flickering
    if (isInitialLoad) {
      return defaultColor;
    }
    // Use box index for coloring
    if (index === boxIndex) {
      return "#4caf50";
    }
    return defaultColor;
  }, [boxIndex, isInitialLoad]);

  const pipes = Array.from({ length: boxCount }, (_, i) => ({
    x1: 116 + (i % boxesPerRow) * 264,
    y1: i < boxesPerRow ? 200 : 650,
    x2: 116 + (i % boxesPerRow) * 264,
    y2: i < boxesPerRow ? 305 : 563,
  }));

  const formatValue = (value, unit = "", decimals = 2) => {
    if (value === null || value === undefined || value === "") return "";
    if (typeof value === "number") {
      return `${value.toFixed(decimals)} ${unit}`.trim();
    }
    return value;
  };

  const handleLocalWellClick = async (well, index) => {
    if (!well || !well.well) return;

    if (well.isManual) {
      return;
    }

    const wellNumber = well.well;
    const isActiveBox = index === boxIndex;

    // If handleWellClick prop is provided (from AppLayout), use it
    if (handleWellClick) {
      // If this is the active/highlighted well, pass the current otvod data
      if (isActiveBox && localOtvodData) {
        handleWellClick(wellNumber, localOtvodData);
      } else {
        handleWellClick(wellNumber);
      }
      return;
    }

    // Otherwise, use the local modal logic (original behavior)
    try {
      setWellModalLoading(true);
      setWellModalTitle(`Данные скважины ${wellNumber}`);
      setShowWellModal(true);

      // If this is the active/highlighted well, use the current otvod data
      if (isActiveBox && localOtvodData) {
        const transformedData = [
          { Параметр: "Дата замера", Значение: formatDate(localOtvodData.lastDate || well.update_date) },
          { Параметр: "Скважина", Значение: wellNumber },
          { Параметр: "Жидкость", Значение: formatValue(localOtvodData.liquid, "м³/ч") },
          { Параметр: "Нефть", Значение: formatValue(localOtvodData.oil, "т/сут") },
          { Параметр: "Газ", Значение: formatValue(localOtvodData.gas, "м³/сут") },
          { Параметр: "Обводненность", Значение: formatValue(localOtvodData.waterCut, "%") },
        ];
        setWellModalData(transformedData);
        setWellModalLoading(false);
        return;
      }

      // Otherwise, fetch the data from the API as before
      const response = await fetchAGZUWellData(wellNumber);
      const agzuWellData = response.data;
      const wellData = Array.isArray(agzuWellData)
        ? agzuWellData[0]
        : agzuWellData;

      const transformedData = [
        { Параметр: "Дата замера", Значение: formatDate(wellData["Дата и время"] || well.update_date) },
        { Параметр: "Скважина", Значение: wellData["Скважина"] || wellNumber },
        { Параметр: "Жидкость", Значение: formatValue(wellData["Жидкость"], "м³") },
        { Параметр: "Нефть", Значение: formatValue(wellData["Нефть"], "т/сут") },
        { Параметр: "Газ", Значение: formatValue(wellData["Газ"], "м³/сут") },
        {
          Параметр: "Обводненность",
          Значение: formatValue(wellData["Обводненность"], "%"),
        },
      ];

      setWellModalData(transformedData);
    } catch (error) {
      const fallbackData = [
        { Параметр: "Дата замера", Значение: formatDate(well.update_date) },
        { Параметр: "Скважина", Значение: well.well || wellNumber },
        { Параметр: "Жидкость", Значение: "N/A" },
        { Параметр: "Нефть", Значение: formatValue(well.zamer_oil, "т/сут") },
        { Параметр: "Газ", Значение: formatValue(well.gas, "м³/сут") },
        { Параметр: "Обводненность", Значение: formatValue(well.tr_water, "%") },
        {
          Параметр: "Ошибка",
          Значение: "Не удалось загрузить подробные данные. Показаны базовые данные.",
        },
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
      <svg className="svgImage" viewBox="60 -40 1700 900" xmlns="http://www.w3.org/2000/svg">
        {pipes.map((pipe, index) => (
          <line
            key={`v${index}`}
            {...pipe}
            stroke={getPipeColor(index)}
            strokeWidth="3"
          />
        ))}
        {pipes.map((pipe, index) => (
          <line
            key={`d${index}`}
            x1="918"
            y1="438"
            x2={pipe.x2}
            y2={pipe.y2}
            stroke={getPipeColor(index)}
            strokeWidth="2"
          />
        ))}
        <ellipse cx="918" cy="438" rx="120" ry="120" fill="#50505a" />
      </svg>

      <div className={styles.overlay}>
        {boxes.map((well, index) => {
          let boxText2 = "";
          
          if (well?.zamer != null) {
            boxText2 = well.zamer.toFixed(2);
          }

          return (
            <Box
              key={index}
              boxText1={well?.well || ""}
              boxText2={boxText2}
              boxText3={well?.update_date ? formatDateShort(well.update_date) : ""}
              boxText4={well?.update_date ? formatTimeShort(well.update_date) : ""}
              top={index < boxesPerRow ? "7%" : "90%"}
              left={`${10 + (index % boxesPerRow) * 135}px`}
              number={index + 1}
              borderColor={getPipeColor(index, "#FFFFFF")}
              onClick={
                well?.well && !well?.isManual
                  ? () => handleLocalWellClick(well, index)
                  : undefined
              }
              style={{ cursor: well?.well && !well?.isManual ? "pointer" : "default" }}
            />
          );
        })}

        <div
          className={styles.circle}
          style={{
            position: "absolute",
            top: "62.5%",
            left: "75.5%",
            transform: "translate(-50%, -50%)",
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "transparent",
            pointerEvents: "none",
          }}
        >
          {centerData.agzu4Oil !== null && centerData.agzu4Oil !== undefined ? (
            // AGZU-4 display: single value
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <div
                className={styles.circleText}
                style={{
                  fontSize: "20px",
                  color: "white",
                  textAlign: "center",
                  lineHeight: "1.2",
                }}
              >
                {centerData.agzu4Oil} м³
              </div>
              {centerData.lastUpdate && (
                <div
                  style={{
                    fontSize: "9px",
                    color: "rgba(255, 255, 255, 0.7)",
                    textAlign: "center",
                    lineHeight: "1.1",
                    marginTop: "2px",
                  }}
                >
                  {formatDate(centerData.lastUpdate).split(',')[0]}<br/>
                  {formatDate(centerData.lastUpdate).split(',')[1]?.trim()}
                </div>
              )}
            </div>
          ) : (
            // Other AGZUs display: three values
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0px" }}>
              <div
                className={styles.circleText}
                style={{
                  fontSize: "17px",
                  color: "white",
                  textAlign: "center",
                  lineHeight: "1.2",
                  margin: "2px 0",
                }}
              >
                {centerData.density} МПа
              </div>
              <div
                className={styles.circleText}
                style={{
                  fontSize: "17px",
                  color: "white",
                  textAlign: "center",
                  lineHeight: "1.2",
                  margin: "2px 0",
                }}
              >
                {centerData.time}
              </div>
              <div
                className={styles.circleText}
                style={{
                  fontSize: "17px",
                  color: "white",
                  textAlign: "center",
                  lineHeight: "1.2",
                  margin: "2px 0",
                }}
              >
                {centerData.temperature} °C
              </div>
              {centerData.lastUpdate && (
                <div
                  style={{
                    fontSize: "9px",
                    color: "rgba(255, 255, 255, 0.7)",
                    textAlign: "center",
                    lineHeight: "1.1",
                    marginTop: "2px",
                  }}
                >
                  {formatDate(centerData.lastUpdate).split(',')[0]}<br/>
                  {formatDate(centerData.lastUpdate).split(',')[1]?.trim()}
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.line} style={{ top: "63%", left: "86.2%" }}></div>
      </div>

      <div
        style={{
          position: "absolute",
          top: "48%",
          left: "90%",
          zIndex: 1000,
          pointerEvents: "auto",
          backgroundColor: "#50505a",
        }}
      >
        <NavLink
          to="/scheme"
          style={{
            display: "block",
            textDecoration: "none",
            pointerEvents: "auto",
          }}
        >
          <button
            style={{
              padding: "8px 12px",
              backgroundColor: "transparent",
              color: "white",
              border: "1px solid white",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            на УПН
          </button>
        </NavLink>
      </div>

      {showWellModal && (
        <Modal onClose={handleCloseWellModal}>
          <div style={{ padding: "20px" }}>
            <h2
              style={{
                marginTop: 0,
                marginBottom: "20px",
                fontSize: "24px",
                color: "white",
              }}
            >
              {wellModalTitle}
            </h2>
            {wellModalLoading ? (
              <div
                style={{ color: "white", textAlign: "center", padding: "20px" }}
              >
                Загрузка данных скважины...
              </div>
            ) : (
              wellModalData.length > 0 && (
                <div style={{ overflow: "auto", maxHeight: "70vh" }}>
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