import React, { useState, useEffect } from "react";
import styles from "./AgzuDiagram.module.css";
import Box from "../Box/Box";
import Modal from "../Modal/Modal";
import ResponsiveTable from "../ResponsiveTable/ResponsiveTable";
import { NavLink } from "react-router-dom";
import { fetchAGZUWellData, fetchAGZUTags } from "../../axios/wellService";

export default function AgzuDiagram({ filteredWells, category }) {
  const [centerData, setCenterData] = useState({
    density: 0,
    time: "0:00",
    temperature: 0,
  });

  const [currentSkv, setCurrentSkv] = useState("");
  const [showCurrentSkv, setShowCurrentSkv] = useState(false);
  const [currentSkvWellName, setCurrentSkvWellName] = useState("");
  const [currentSkvValue, setCurrentSkvValue] = useState("");
  const [categoryWellTags, setCategoryWellTags] = useState({});

  const [boxIndex, setBoxIndex] = useState(0);
  const [showWellModal, setShowWellModal] = useState(false);
  const [wellModalData, setWellModalData] = useState([]);
  const [wellModalTitle, setWellModalTitle] = useState("Данные скважины");
  const [wellModalLoading, setWellModalLoading] = useState(false);

  const getDataSourceCategory = (category, filteredWells, activeOtvodIndex) => {
    if (!category || !filteredWells || filteredWells.length === 0) return category;

    const activeWell = filteredWells.find(
      (well) => well.otvod === activeOtvodIndex + 1
    );

    if (activeWell && activeWell.well) {
      const wellName = activeWell.well.toLowerCase();
      if (wellName.includes("мф")) {
        const match = wellName.match(/мф[-\s]*№?(\d+)/);
        if (match) return `МФ №${match[1]}`;
      }
      if (wellName.includes("врп")) {
        const match = wellName.match(/врп[-\s]*№?(\d+)/);
        if (match) return `ВРП-${match[1]}`;
      }
      if (wellName.includes("агзу")) {
        const match = wellName.match(/агзу[-\s]*№?(\d+)/);
        if (match) return `АГЗУ-${match[1]}`;
      }
    }

    return category;
  };

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        if (!category) return;

        const originalResponse = await fetchAGZUTags(category);
        const { tags: originalTags } = originalResponse.data;

        const otvodTag = Object.keys(originalTags).find((key) =>
          key.includes("_otvod") && !key.includes("_last_otvod")
        );
        const otvodValue = parseInt(originalTags[otvodTag]) || 0;
        const currentBoxIndex = otvodValue > 0 ? otvodValue - 1 : 0;

        const dataSourceCategory = getDataSourceCategory(
          category,
          filteredWells,
          currentBoxIndex
        );

        const isCategoryWithSubcategories =
          category.toLowerCase().includes("агзу") ||
          category.toLowerCase().includes("врп");

        const activeWell = filteredWells.find(
          (well) => well.otvod === currentBoxIndex + 1
        );
        const isCategoryWell =
          activeWell &&
          activeWell.well &&
          (activeWell.well.toLowerCase().includes("мф") ||
            activeWell.well.toLowerCase().includes("врп") ||
            activeWell.well.toLowerCase().includes("агзу"));

        const isDirectCategory =
          category.toLowerCase().includes("мф") ||
          category.toLowerCase().includes("врп") ||
          (category.toLowerCase().includes("агзу") && !isCategoryWithSubcategories);

        let finalBoxIndex = currentBoxIndex;

        if (isDirectCategory) {
          const currentSkvTag = Object.keys(originalTags).find((key) =>
            key.includes("_current_skv")
          );
          const currentSkvValue = parseInt(originalTags[currentSkvTag]) || 0;
          let finalCurrentSkvValue = currentSkvValue;

          const categoryMatch = category.match(/(мф|врп|агзу)[-\s]*№?(\d+)/i);
          if (categoryMatch) {
            const categoryType = categoryMatch[1].toLowerCase();
            const categoryNum = categoryMatch[2];

            for (let i = 1; i <= 4; i++) {
              const agzuName = `АГЗУ-${i}`;
              const agzuResponse = await fetchAGZUTags(agzuName);
              const { tags: agzuTags } = agzuResponse.data;

              const agzuOtvodTag = Object.keys(agzuTags).find((key) =>
                key.includes("_otvod") && !key.includes("_last_otvod")
              );
              const agzuOtvodValue = parseInt(agzuTags[agzuOtvodTag]) || 0;

              if (agzuOtvodValue > 0) {
                let isMatch = false;
                if (agzuName === "АГЗУ-2" && agzuOtvodValue === 8 && category === "МФ №2") {
                  isMatch = true;
                } else if (
                  agzuName === "АГЗУ-1" &&
                  agzuOtvodValue === 8 &&
                  category === "МФ №1"
                ) {
                  isMatch = true;
                }

                if (isMatch) {
                  const agzuCurrentSkvTag = Object.keys(agzuTags).find((key) =>
                    key.includes("_current_skv")
                  );
                  const agzuCurrentSkvValue =
                    parseInt(agzuTags[agzuCurrentSkvTag]) || 0;

                  if (agzuCurrentSkvValue > 0) {
                    finalCurrentSkvValue = agzuCurrentSkvValue;
                    break;
                  }
                }
              }
            }
          }

          if (finalCurrentSkvValue > 0) {
            finalBoxIndex = finalCurrentSkvValue - 1;
          }
        }

        setBoxIndex(finalBoxIndex);

        // Fetch tags for non-well boxes from the parent category
        const newCategoryWellTags = {};
        const response = await fetchAGZUTags(category);
        const { tags } = response.data;

        const volumetricFlowTag = Object.keys(tags).find((key) =>
          key.includes("_last_volumetric_liquid_flow_rate")
        );
        const lastOtvodTag = Object.keys(tags).find((key) =>
          key.includes("_last_otvod")
        );
        const lastSkvTag = Object.keys(tags).find((key) =>
          key.includes("_last_skv")
        );

        const tagData = {
          volumetric_liquid_flow_rate: tags[volumetricFlowTag]
            ? parseFloat(tags[volumetricFlowTag]).toFixed(2)
            : null,
          last_otvod: tags[lastOtvodTag] ? parseInt(tags[lastOtvodTag]) : null,
          last_skv: tags[lastSkvTag] ? parseInt(tags[lastSkvTag]) : null,
        };

        for (const well of filteredWells) {
          const wellName = well.well;
          if (
            wellName &&
            (wellName.toLowerCase().includes("мф") ||
              wellName.toLowerCase().includes("врп") ||
              wellName.toLowerCase().includes("агзу"))
          ) {
            newCategoryWellTags[wellName] = tagData;
          }
        }
        setCategoryWellTags(newCategoryWellTags);

        // Fetch tags for the center circle - if this is an MF and it's connected to an AGZU, use AGZU data
        let centerDataSource = category;

        // Check if this is an MF category and find which AGZU it might be connected to
        const isMF = category.toLowerCase().includes("мф");
        if (isMF) {
          // Check all AGZUs to see if any of them have this MF as their active otvod
          for (let i = 1; i <= 4; i++) {
            try {
              const agzuName = `АГЗУ-${i}`;
              const agzuResponse = await fetchAGZUTags(agzuName);
              const { tags: agzuTags } = agzuResponse.data;

              const agzuOtvodTag = Object.keys(agzuTags).find((key) =>
                key.includes("_otvod") && !key.includes("_last_otvod")
              );
              const agzuOtvodValue = parseInt(agzuTags[agzuOtvodTag]) || 0;

              // Check if this AGZU's otvod points to an MF that matches our category
              if (agzuOtvodValue === 8) { // Assuming otvod 8 means MF connection
                if ((agzuName === "АГЗУ-1" && category === "МФ №1") ||
                    (agzuName === "АГЗУ-2" && category === "МФ №2")) {
                  centerDataSource = agzuName;
                  break;
                }
              }
            } catch (error) {
              // Continue checking other AGZUs if one fails
              continue;
            }
          }
        }

        const centerResponse = await fetchAGZUTags(centerDataSource);
        const { tags: centerTags } = centerResponse.data;

        // Fetch tags for the center circle
        // const centerResponse = await fetchAGZUTags(category);
        // const { tags: centerTags } = centerResponse.data;

        const timeTag = Object.keys(centerTags).find((key) => key.includes("_time"));
        const densityTag = Object.keys(centerTags).find((key) =>
          key.includes("_density")
        );
        const temperatureTag = Object.keys(centerTags).find((key) =>
          key.includes("_temperature")
        );

        const formatTime = (timeValue) => {
          if (timeValue === 0) return "0:00";
          const hours = Math.floor(timeValue / 60);
          const minutes = timeValue % 60;
          return `${hours}:${minutes.toString().padStart(2, "0")}`;
        };

        setCenterData({
          density: (centerTags[densityTag] || 0).toFixed(1),
          time: formatTime(centerTags[timeTag] || 0),
          temperature: Math.floor(centerTags[temperatureTag] || 0),
        });

        const mainCategoryResponse = await fetchAGZUTags(category);
        const { tags: mainCategoryTags } = mainCategoryResponse.data;

        const currentSkvTag = Object.keys(mainCategoryTags).find((key) =>
          key.includes("_current_skv")
        );
        const currentSkvVal = mainCategoryTags[currentSkvTag] || "";
        setCurrentSkvValue(currentSkvVal);

      } catch (error) {
        setCenterData({
          density: "0.0",
          time: "0:00",
          temperature: 0,
        });
        setCategoryWellTags({});
        setBoxIndex(0);
        setCurrentSkvValue("");
      }
    };

    fetchCategoryData();
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
    if (index === boxIndex) {
      return "#4caf50";
    }
    return defaultColor;
  };

  const pipes = Array.from({ length: 14 }, (_, i) => ({
    x1: 116 + (i % 7) * 264,
    y1: i < 7 ? 130 : 720,
    x2: 116 + (i % 7) * 264,
    y2: i < 7 ? 305 : 563,
  }));

  const formatValue = (value, unit = "", decimals = 2) => {
    if (value === null || value === undefined || value === "") return "";
    if (typeof value === "number") {
      return `${value.toFixed(decimals)} ${unit}`.trim();
    }
    return value;
  };

  const handleWellClick = async (well) => {
    if (!well || !well.well) return;

    if (well.isManual) {
      return;
    }

    const wellNumber = well.well;

    try {
      setWellModalLoading(true);
      setWellModalTitle(`Данные скважины ${wellNumber}`);
      setShowWellModal(true);

      const response = await fetchAGZUWellData(wellNumber);
      const agzuWellData = response.data;
      const wellData = Array.isArray(agzuWellData)
        ? agzuWellData[0]
        : agzuWellData;

      const transformedData = [
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
      <svg className="svgImage" viewBox="60 -30 1700 900" xmlns="http://www.w3.org/2000/svg">
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
          const isCategoryWell =
            well?.well &&
            (well.well.toLowerCase().includes("мф") ||
              well.well.toLowerCase().includes("врп") ||
              well.well.toLowerCase().includes("агзу"));
          const isCurrentSkvBox = showCurrentSkv && index === boxIndex;
          const isActiveBox = index === boxIndex;

          let boxText2 = "";
          if (isCategoryWell && categoryWellTags[well.well]) {
            const tags = categoryWellTags[well.well];
            if (!isActiveBox) {
              boxText2 = [
                tags.volumetric_liquid_flow_rate
                  ? `Qж: ${formatValue(tags.volumetric_liquid_flow_rate, "м³/ч")}`
                  : "",
                tags.last_otvod ? `Отвод: ${formatValue(tags.last_otvod, "")}` : "",
                tags.last_skv ? `Скв: ${formatValue(tags.last_skv, "")}` : "",
              ].filter(Boolean).join("\n");
            } else {
              // For active category box, show current_skv value from main category
              boxText2 = currentSkvValue ? `Скв: ${currentSkvValue}` : "";
            }
          } else if (isCurrentSkvBox) {
            boxText2 = currentSkvWellName;
          } else if (well?.zamer != null) {
            boxText2 = well.zamer.toFixed(2);
          }

          return (
            <Box
              key={index}
              boxText1={well?.well || ""}
              boxText2={boxText2}
              top={index < 7 ? "5%" : "100%"}
              left={`${10 + (index % 7) * 135}px`}
              number={index + 1}
              borderColor={getPipeColor(index, "#FFFFFF")}
              onClick={
                well?.well && !well?.isManual
                  ? () => handleWellClick(well)
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

        <div className={styles.line} style={{ top: "62%", left: "86.3%" }}></div>
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