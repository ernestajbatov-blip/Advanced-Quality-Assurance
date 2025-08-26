import React, { useState, useEffect } from "react";
import styles from "./AgzuDiagram.module.css";
import Box from "../Box/Box";
import Modal from "../Modal/Modal";
import ResponsiveTable from "../ResponsiveTable/ResponsiveTable";
import { NavLink } from "react-router-dom";
import { fetchAGZUWellData, fetchAGZUTags } from "../../axios/wellService";

export default function AgzuDiagram({ filteredWells, category }) {
  // Random data for center circle based on category
  const [centerData, setCenterData] = useState({
    pressure: 0,
    time: "0:00",
    temperature: 0
  });

  // Modal state management
  const [showWellModal, setShowWellModal] = useState(false);
  const [wellModalData, setWellModalData] = useState([]);
  const [wellModalTitle, setWellModalTitle] = useState("Данные скважины");
  const [wellModalLoading, setWellModalLoading] = useState(false);
  const [boxIndex, setBoxIndex] = useState(0);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        if (!category) return;
        
        // Fetch real tags from database
        const response = await fetchAGZUTags(category);
        const { tags } = response.data;
        
        // Extract values from tags
        const timeTag = Object.keys(tags).find(key => key.includes('_time'));
        const pressureTag = Object.keys(tags).find(key => key.includes('_pressure'));
        const temperatureTag = Object.keys(tags).find(key => key.includes('_temperature'));
        const otvodTag = Object.keys(tags).find(key => key.includes('_otvod'));
        
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
        
        // Update boxIndex based on otvod tag (convert to 0-based index)
        if (tags[otvodTag] !== undefined) {
          const otvodValue = parseInt(tags[otvodTag]) || 0;
          setBoxIndex(otvodValue > 0 ? otvodValue - 1 : 0);
        }
        
      } catch (error) {
        console.error("Error fetching AGZU tags:", error);
        // Fallback to default values
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
  }, [category]);

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
        {boxes.map((well, index) => (
          <Box
            key={index}
            boxText1={well?.well || ""}
            boxText2={well?.zamer != null ? well.zamer.toFixed(2) : ""}
            top={index < 7 ? "5%" : "100%"}
            left={`${10 + (index % 7) * 135}px`}
            number={index + 1}
            borderColor={getPipeColor(index, "#FFFFFF")}
            onClick={well?.well && !well?.isManual ? () => handleWellClick(well) : undefined}
            style={{ cursor: well?.well && !well?.isManual ? 'pointer' : 'default' }}
          />
        ))}

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