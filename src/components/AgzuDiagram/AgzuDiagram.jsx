// AgzuDiagram.jsx:
import React, { useState, useEffect, useCallback } from "react";
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
  });

  const [boxIndex, setBoxIndex] = useState(0);
  const [localOtvodData, setLocalOtvodData] = useState(null);
  const [showWellModal, setShowWellModal] = useState(false);
  const [wellModalData, setWellModalData] = useState([]);
  const [wellModalTitle, setWellModalTitle] = useState("Данные скважины");
  const [wellModalLoading, setWellModalLoading] = useState(false);

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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      
      return `${day}.${month}.${year}, ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      return "N/A";
    }
  };

  const fetchCategoryData = useCallback(async () => {
    try {
      if (!category) return;

      const response = await fetchAGZUTags(category);
      const { tags } = response.data;

      const currentOtvodTag = Object.keys(tags).find((key) =>
        key.includes("_current_otvod")
      );
      const currentOtvodValue = parseInt(tags[currentOtvodTag]) || 0;
      const currentBoxIndex = currentOtvodValue > 0 ? currentOtvodValue - 1 : 0;

      setBoxIndex(currentBoxIndex);

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
      const currentWell = filteredWells.find(w => w.otvod === currentOtvodValue);
      const lastDate = currentWell?.update_date || null;

      const otvodData = {
        liquid: tags[currentLiquidTag] ? parseFloat(tags[currentLiquidTag]) : null,
        oil: tags[currentOilTag] ? parseFloat(tags[currentOilTag]) : null,
        gas: tags[currentGasTag] ? parseFloat(tags[currentGasTag]) : null,
        waterCut: tags[currentWTag] ? parseFloat(tags[currentWTag]) : null,
        lastDate: lastDate,
      };
      
      setLocalOtvodData(otvodData);

      if (currentWell && setCurrentOtvodWell && setCurrentOtvodData) {
        setCurrentOtvodWell(currentWell.well);
        setCurrentOtvodData(otvodData);
      }

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

      setCenterData({
        density: sepPressureTag && tags[sepPressureTag] !== undefined 
          ? parseFloat(tags[sepPressureTag]).toFixed(2) 
          : "0.00",
        time: passTimeTag && tags[passTimeTag] !== undefined 
          ? formatTime(parseFloat(tags[passTimeTag])) 
          : "0:00",
        temperature: liqTempTag && tags[liqTempTag] !== undefined 
          ? Math.floor(parseFloat(tags[liqTempTag])) 
          : 0,
      });

    } catch (error) {
      console.error("Error fetching AGZU data:", error);
      setCenterData({
        density: "0.00",
        time: "0:00",
        temperature: 0,
      });
      setLocalOtvodData(null);
      setBoxIndex(0);
      if (setCurrentOtvodWell && setCurrentOtvodData) {
        setCurrentOtvodWell(null);
        setCurrentOtvodData(null);
      }
    }
  }, [category, filteredWells, setCurrentOtvodWell, setCurrentOtvodData]);

  useEffect(() => {
    fetchCategoryData();
    const intervalId = setInterval(() => {
      fetchCategoryData();
    }, 30000);
    return () => {
      clearInterval(intervalId);
    };
  }, [fetchCategoryData]);

  const boxes = Array(boxCount).fill(null);
  filteredWells.forEach((well) => {
    if (well.otvod >= 1 && well.otvod <= boxCount) {
      boxes[well.otvod - 1] = well;
    }
  });

  const getPipeColor = (index, defaultColor = "#50505a") => {
    if (index === boxIndex) {
      return "#4caf50";
    }
    return defaultColor;
  };

  const pipes = Array.from({ length: boxCount }, (_, i) => ({
    x1: 116 + (i % boxesPerRow) * 264,
    y1: i < boxesPerRow ? 130 : 720,
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
        { Параметр: "Последнее обновление", Значение: formatDate(well.update_date) }, // First row
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
      { Параметр: "Последнее обновление", Значение: formatDate(wellData["Дата и время"] || well.update_date) }, // First row
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
        { Параметр: "Последнее обновление", Значение: formatDate(well.update_date) },
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
      <svg className="svgImage" viewBox="65 -40 1700 900" xmlns="http://www.w3.org/2000/svg">
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
              top={index < boxesPerRow ? "5%" : "100%"}
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
        </div>

        <div className={styles.line} style={{ top: "62%", left: "85.7%" }}></div>
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