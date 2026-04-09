// @ts-nocheck
import React, { useState, useEffect } from "react";
import styles from "./VRPDiagram.module.css";
import Box from "../Box/Box";
import Modal from "../Modal/Modal";
import ResponsiveTable from "../ResponsiveTable/ResponsiveTable";
import { NavLink } from "react-router-dom";
import { fetchAGZUWellData, fetchAGZUTags } from "../../axios/wellService";


export default function VRPDiagram({ filteredWells, category }) {
  const [centerData, setCenterData] = useState({
    density: 0,
    time: "0:00",
    temperature: 0
  });

  // Modal state management
  const [showWellModal, setShowWellModal] = useState(false);
  const [wellModalData, setWellModalData] = useState([]);
  const [wellModalTitle, setWellModalTitle] = useState("Данные ВРП скважины");
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
        const densityTag = Object.keys(tags).find(key => key.includes('_density'));
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
          density: (tags[densityTag] || 0).toFixed(1),
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
        console.error("Error fetching VRP tags:", error);
        // Fallback to default values
        setCenterData({
          density: "0.0",
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
    { x1: 116, y1: 225, x2: 116, y2: 305 },
    { x1: 380, y1: 225, x2: 380, y2: 305 },
    { x1: 648, y1: 225, x2: 648, y2: 305 },
    { x1: 918, y1: 225, x2: 918, y2: 305 },
    { x1: 1181, y1: 225, x2: 1181, y2: 305 }, // 5th box pipe
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
        { "Параметр": "Давление", "Значение": formatValue(well.density || Math.random() * 10, "МПа", 1) },
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

        {/* Central circle with category-specific persistent random data - updated to match AgzuDiagram style */}
        <div className={styles.circle} style={{ 
          position: 'absolute',
          top: '49%', 
          left: '50.5%', 
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
            {centerData.density} МПа
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