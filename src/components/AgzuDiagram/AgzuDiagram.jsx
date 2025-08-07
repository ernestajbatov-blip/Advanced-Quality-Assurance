import React, { useState, useEffect } from "react";
import styles from "./AgzuDiagram.module.css";
import Box from "../Box/Box";
import Modal from "../Modal/Modal";
import ResponsiveTable from "../ResponsiveTable/ResponsiveTable";
import { NavLink } from "react-router-dom";
import { fetchAGZUWellData } from "../../axios/wellService";

export default function AgzuDiagram({ filteredWells, boxIndex }) {
  const [centerData, setCenterData] = useState({
    pressure: 0,
    time: "00:00",
    temperature: 0
  });

  // Modal state management
  const [showWellModal, setShowWellModal] = useState(false);
  const [wellModalData, setWellModalData] = useState([]);
  const [wellModalTitle, setWellModalTitle] = useState("Данные скважины");
  const [wellModalLoading, setWellModalLoading] = useState(false);

  // Generate random data on component mount and update periodically
  useEffect(() => {
    const generateRandomData = () => {
      const now = new Date();
      return {
        pressure: (Math.random() * 10).toFixed(1), // Random pressure 0-10 МПа
        time: now.toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        temperature: Math.floor(Math.random() * 50 + 10) // Random temp 10-60°C
      };
    };

    // Set initial random data
    setCenterData(generateRandomData());

    // Update data every 30 seconds (optional - remove if you don't want periodic updates)
    const interval = setInterval(() => {
      setCenterData(generateRandomData());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const boxes = Array(14).fill(null);
  filteredWells.forEach((well) => {
    if (well.otvod >= 1 && well.otvod <= 14) {
      boxes[well.otvod - 1] = well;
    }
  });

  const getPipeColor = (index, defaultColor = "#50505a") =>
    index === boxIndex ? "#4caf50" : defaultColor;

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

    // Handle regular wells
    const wellNumber = well.well;
    
    try {
      setWellModalLoading(true);
      setWellModalTitle(`Данные скважины ${wellNumber}`);
      setShowWellModal(true);

      // Fetch AGZU specific well data
      const response = await fetchAGZUWellData(wellNumber);
      const agzuWellData = response.data;

      // If API returns array, use first item, otherwise use the data directly
      const wellData = Array.isArray(agzuWellData) ? agzuWellData[0] : agzuWellData;

      const transformedData = [
        { "Параметр": "Скважина", "Значение": wellData["Скважина"] || wellNumber },
        { "Параметр": "Жидкость", "Значение": "N/A" }, // No field available yet
        { "Параметр": "Нефть", "Значение": formatValue(wellData["Нефть"], "т/сут") },
        { "Параметр": "Газ", "Значение": formatValue(wellData["Газ"], "м³/сут") },
        { "Параметр": "Обводненность", "Значение": formatValue(wellData["Обводненность"], "%") }
      ];

      setWellModalData(transformedData);

    } catch (error) {
      console.error("Error fetching AGZU well data:", error);
      
      // Fallback data from filteredWells if API fails
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
        {boxes.map((well, index) => (
          <Box
            key={index}
            boxText1={well?.well || ""}
            boxText2={well?.tr_fluid != null ? well.tr_fluid.toFixed(2) : ""}
            top={index < 7 ? "5%" : "100%"}
            left={`${10 + (index % 7) * 135}px`}
            number={index + 1}
            borderColor={getPipeColor(index, "#FFFFFF")}
            onClick={well?.well && !well?.isManual ? () => handleWellClick(well) : undefined}
            style={{ cursor: well?.well && !well?.isManual ? 'pointer' : 'default' }}
          />
        ))}

        <div className={styles.circle} style={{ top: "63.5%", left: "76%" }}>
          <div className={styles.circleText}>{centerData.pressure} МПа</div>
          <div className={styles.circleText}>{centerData.time}</div>
          <div className={styles.circleText}>{centerData.temperature} °C</div>
        </div>

        <div className={styles.line} style={{ top: "62%", left: "86.3%" }}></div>

        <NavLink to="/scheme">
          <Box boxText1="на УПН" top="57.5%" left="135%" />
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