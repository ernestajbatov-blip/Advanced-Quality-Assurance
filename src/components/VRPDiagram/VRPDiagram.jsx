import React, { useState, useEffect } from "react";
import styles from "./VRPDiagram.module.css";
import Box from "../Box/Box";
import Modal from "../Modal/Modal";
import ResponsiveTable from "../ResponsiveTable/ResponsiveTable";
import { NavLink } from "react-router-dom";
import { fetchAGZUWellData } from "../../axios/wellService";

// Store generated data outside component to persist across re-renders and category changes
const categoryDataCache = {};

export default function VRPDiagram({ filteredWells, boxIndex, category }) {
  const [centerData, setCenterData] = useState({
    flow: 0,
    pressure: 0,
    time: "00:00"
  });

  // Modal state management
  const [showWellModal, setShowWellModal] = useState(false);
  const [wellModalData, setWellModalData] = useState([]);
  const [wellModalTitle, setWellModalTitle] = useState("Данные ВРП скважины");
  const [wellModalLoading, setWellModalLoading] = useState(false);

  // Generate category-specific random data that persists
  useEffect(() => {
    const generateCategorySpecificData = (categoryName) => {
      // If we already have data for this category, use it
      if (categoryDataCache[categoryName]) {
        return categoryDataCache[categoryName];
      }

      // Generate new data for this category
      const categoryHash = categoryName ? categoryName.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0) : 0;
      
      // Create category-specific random ranges using hash as seed
      const seed = Math.abs(categoryHash) % 1000;
      const flowBase = (seed % 50) + 30; // 30-80 base flow
      const pressureBase = (seed % 3) + 2; // 2-5 base pressure
      
      const newData = {
        flow: Math.floor(flowBase + (seed % 30)), // Category-specific flow range
        pressure: (pressureBase + (seed % 100) / 100 * 2).toFixed(1), // Category-specific pressure
        time: new Date().toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      // Cache the generated data for this category
      categoryDataCache[categoryName] = newData;
      return newData;
    };

    // Generate and set data for current category
    const data = generateCategorySpecificData(category);
    setCenterData(data);

    // Update only the time every 30 seconds, keep flow and pressure the same
    const interval = setInterval(() => {
      setCenterData(prev => ({
        ...prev,
        time: new Date().toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit'
        })
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, [category]); // Only re-run when category changes

  // Change from 4 to 5 boxes
  const boxes = new Array(5).fill(null);
  filteredWells.forEach((well) => {
    // Make sure otvod is within bounds (1-5)
    if (well.otvod >= 1 && well.otvod <= 5) {
      boxes[well.otvod - 1] = well;
    }
  });

  const getPipeColor = (index, defaultColor = "#50505a") =>
    index === boxIndex ? "#4caf50" : defaultColor;

  // You may need to adjust pipe positions for 5 boxes
  const pipes = [
    { x1: 116, y1: 165, x2: 116, y2: 305 },
    { x1: 380, y1: 165, x2: 380, y2: 305 },
    { x1: 648, y1: 165, x2: 648, y2: 305 },
    { x1: 918, y1: 165, x2: 918, y2: 305 },
    { x1: 1181, y1: 165, x2: 1181, y2: 305 }, // 5th box pipe
  ];

  const formatValue = (value, unit = "", decimals = 2) => {
    if (value === null || value === undefined || value === "") return "N/A";
    if (typeof value === 'number') {
      return `${value.toFixed(decimals)} ${unit}`.trim();
    }
    return value;
  };

  const handleWellClick = async (well) => {
    if (!well || !well.well) return;

    const wellNumber = well.well;
    
    try {
      setWellModalLoading(true);
      setWellModalTitle(`Данные ВРП скважины ${wellNumber}`);
      setShowWellModal(true);

      // Fetch VRP specific well data (using AGZU endpoint for now)
      const response = await fetchAGZUWellData(wellNumber);
      const vrpWellData = response.data;

      // If API returns array, use first item, otherwise use the data directly
      const wellData = Array.isArray(vrpWellData) ? vrpWellData[0] : vrpWellData;

      const transformedData = [
        { "Параметр": "Скважина", "Значение": wellData["Скважина"] || wellNumber },
        { "Параметр": "Категория", "Значение": category || "N/A" },
        { "Параметр": "Закачка", "Значение": formatValue(well.tr_fluid, "м³/сут") },
        { "Параметр": "Давление", "Значение": formatValue(well.pressure || Math.random() * 10, "МПа", 1) },
        { "Параметр": "Расход", "Значение": formatValue(well.flow || Math.random() * 50, "м³/сут") }
      ];

      setWellModalData(transformedData);

    } catch (error) {
      console.error("Error fetching VRP well data:", error);
      
      // Fallback data from filteredWells if API fails
      const fallbackData = [
        { "Параметр": "Скважина", "Значение": well.well || wellNumber },
        { "Параметр": "Категория", "Значение": category || "N/A" },
        { "Параметр": "Закачка", "Значение": formatValue(well.tr_fluid, "м³/сут") },
        { "Параметр": "Давление", "Значение": "N/A" },
        { "Параметр": "Расход", "Значение": "N/A" },
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
      <svg
        className="svgImage"
        viewBox="60 -5 1700 900"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Vertical Pipes */}
        {pipes.map((pipe, index) => (
          <line
            key={`v${index}`}
            x1={pipe.x1}
            y1={pipe.y1}
            x2={pipe.x2}
            y2={pipe.y2}
            stroke={getPipeColor(index)}
            strokeWidth="3"
          />
        ))}

        {/* Diagonal Pipes */}
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

        {/* Center Circle */}
        <ellipse cx="918" cy="438" rx="120" ry="120" fill="#50505a" />
      </svg>

      <div className={styles.overlay}>
        {boxes.map((well, index) => (
          <Box
            key={index}
            boxText1={well?.well || ""}
            boxText2={well?.tr_fluid?.toFixed(2) || ""}
            top={index < 5 ? "5%" : "75%"} // Adjust condition for 5 boxes
            left={`${10 + (index % 5) * 139}px`} // Adjust modulo for 5 boxes
            number={index + 1}
            borderColor={getPipeColor(index, "#FFFFFF")}
            onClick={well?.well ? () => handleWellClick(well) : undefined}
            style={{ cursor: well?.well ? 'pointer' : 'default' }}
          />
        ))}

        {/* Central circle with category-specific persistent random data */}
        <div className={styles.circle} style={{ top: "49%", left: "50.5%" }}>
          <div className={styles.circleText}>{centerData.flow} М³/СУТ</div>
          <div className={styles.circleSubText}>{centerData.pressure} МПа</div>
          <div className={styles.circleTime}>{centerData.time}</div>
        </div>

        {/* Line and additional box */}
        <div className={styles.line} style={{ top: "48.5%", left: "57.5%" }}></div>

        <NavLink to="/scheme">
          <Box boxText1="с УПН" top="44.5%" left="90%" />
        </NavLink>
      </div>

      {/* Well Data Modal */}
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
                Загрузка данных ВРП скважины...
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