import React, { useState, useEffect, useContext, useMemo } from "react";
import { fetchWells, fetchWellData } from "../../axios/wellService";
import styles from "./AppLayout.module.css";
import Chart from "../../components/Chart/Chart";
import Grid from "../../components/Grid/Grid";
import AppNav from "../../components/AppNav/AppNav";
import Legends from "../../components/Legends/Legends";
import Details from "../../components/Details/Details";
import SelectFond from "../../components/SelectFond/SelectFond";
import AGZU from "../../components/AGZU/AGZU";
import VRP from "../../components/VRP/VRP";
import KPI from "../../components/KPI/KPI";
import Modal from "../../components/Modal/Modal";
import ResponsiveTable from "../../components/ResponsiveTable/ResponsiveTable";
import { WellsContext } from "../../states/WellsContext";
import { useUser } from "../../states/UserContext";

export default function AppLayout() {
  // Use the original WellsContext
  const { fond, setFond, wells, setWells } = useContext(WellsContext);
  
  // Modal state management
  const [showWellModal, setShowWellModal] = useState(false);
  const [wellModalData, setWellModalData] = useState([]);
  const [wellModalTitle, setWellModalTitle] = useState("Well Data");
  const [wellModalLoading, setWellModalLoading] = useState(false);
  const [chartType, setChartType] = useState("liquid"); // 'liquid' or 'oil'
  
  // ЧРП filter state
  const [chrpFilter, setChrpFilter] = useState(false);
  
  const { user, onLogout } = useUser();

  // Reset ЧРП filter when switching to нагнетательный фонд
  useEffect(() => {
    if (fond === 1) {
      setChrpFilter(false);
    }
  }, [fond]);

  const fieldMappings = useMemo(() => ({
    leftTop: "well",
    rightTop: "tr_oil",
    middle: chartType === "liquid" ? "zamer" : "zamer_oil",
    leftBottom: "tr_fluid",
    rightBottom: "tr_water",
  }), [chartType]);

  const calculateMiddleValue = (wells, values) => {
    // Choose the base value based on chart type
    const baseValue = chartType === "oil" ? values.rightTop : values.leftBottom;
    
    // Calculate percentage difference
    return parseFloat(((values.middle - baseValue) / baseValue * 100).toFixed(2));
  };

  const isWellStopped = (well) => {
    // Only check production wells (fond === 0)
    if (fond !== 0) {
      return false;
    }
    
    // Check if c_current exists and has a valid value
    if (well.c_current === null || 
        well.c_current === undefined || 
        well.c_current === '' || 
        well.c_current === 'NULL') {
      return false; // No data available, don't consider it stopped
    }
    
    const current = parseFloat(well.c_current);
    
    // Only consider stopped if it's a valid number and less than 1
    if (!isNaN(current) && isFinite(current)) {
      return current < 1;
    }
    
    return false; // Invalid data, don't consider it stopped
  };

  const filteredWells = useMemo(() => {
    let baseFilteredWells;
    
    if (fond === 0) {
      baseFilteredWells = wells.filter((well) => well.nagn === 0);
    } else {
      baseFilteredWells = wells.filter((well) => well.nagn === 1);
    }
    
    if (chrpFilter && fond === 0) {
      baseFilteredWells = baseFilteredWells.filter((well) => well.type === 1);
    }
    
    return baseFilteredWells;
  }, [wells, fond, chrpFilter]);

  const wellsForComponents = useMemo(() => {
    if (fond === 0) {
      return wells.filter((well) => well.nagn === 0);
    } else {
      return wells.filter((well) => well.nagn === 1);
    }
  }, [wells, fond]);

  const formatLastUpdate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      return "N/A";
    }
  };

  const formatModalValue = (value) => {
    if (value === null || value === undefined || value === '') {
      return "N/A";
    }
    // Convert to number to check if it's a valid number
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return value; // Return original value if it's not a number (like strings)
    }
    return numValue.toString(); // Return the number as string, including "0"
  };

  const handleWellClick = async (wellNumber) => {
    try {
      setWellModalLoading(true);
      setWellModalTitle(`Данные скважины ${wellNumber}`);
      setShowWellModal(true);

      // Fetch specific well data using fetchWellData
      const response = await fetchWellData(wellNumber);
      const specificWellData = response.data;

      // If API returns array, use first item, otherwise use the data directly
      const wellData = Array.isArray(specificWellData) ? specificWellData[0] : specificWellData;

      const transformedData = [
        { "Параметр": "Скважина", "Значение": wellData["Скважина"] || wellNumber },
        { "Параметр": "Последнее обновление", "Значение": formatLastUpdate(wellData["Последнее обновление"]) },
        { "Параметр": "Напряжение", "Значение": formatModalValue(wellData["Напряжение"]) },
        { "Параметр": "Мощность", "Значение": formatModalValue(wellData["Мощность"]) },
        { "Параметр": "Частота", "Значение": formatModalValue(wellData["Частота"]) },
        { "Параметр": "Ток", "Значение": formatModalValue(wellData["Ток"]) },
        { "Параметр": "Скорость двигателя", "Значение": formatModalValue(wellData["Скорость двигателя"]) },
        ...(wellData["Тип"] === 1 ? [{ "Параметр": "Температура", "Значение": formatModalValue(wellData["Температура"]) }] : [])
      ];
      setWellModalData(transformedData);

    } catch (error) {
      console.error("Error fetching well data:", error);
      
      const selectedWell = wells.find(well => well.well === wellNumber);
      if (selectedWell) {
        const fallbackData = [
          { "Параметр": "Номер скважины", "Значение": selectedWell.well || "N/A" },
          { "Параметр": "Последнее обновление", "Значение": "Не удалось загрузить" },
          { "Параметр": "Ошибка", "Значение": "Не удалось загрузить подробные данные. Показаны базовые данные из кэша." },
          { "Параметр": "Тех. режим по жидкости", "Значение": selectedWell.tr_fluid != null ? `${selectedWell.tr_fluid.toFixed(2)} м³/сут` : "N/A" },
          { "Параметр": "Замер", "Значение": selectedWell.zamer != null ? `${selectedWell.zamer.toFixed(2)}` : "N/A" },
          { "Параметр": "Тип", "Значение": selectedWell.type === 1 ? "ЧРП" : "Обычная" }
        ];
        setWellModalData(fallbackData);
      } else {
        setWellModalData([
          { "Параметр": "Ошибка", "Значение": "Не удалось загрузить данные скважины" },
          { "Параметр": "Последнее обновление", "Значение": "N/A" }
        ]);
      }
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
    <div className={styles.app}>
      <AppNav 
        user={user} 
        onLogout={onLogout}
      />
      <div className={styles.mainSection}>
        <div className={styles.row}>
          <div className={styles.chartContainer}>
            <Chart type={chartType} setType={setChartType} />
          </div>
          <div className={styles.container}>
            <KPI chartType={chartType} />
          </div>
        </div>
        <div className={styles.row}>
          <div
            className={`${styles.container} ${styles.gridAndDetailsContainer}`}
          >
            <div className={styles.legendsAndDetailsContainer}>
              {fond == 0 ? (
                <Legends
                  leftTop={"Номер скважины (XXX_xxxx)"}
                  rightTop={"Тех. режим по нефти (т/сут)"}
                  middle={"Замер по ТМ"}
                  leftBottom={"Тех. режим по жидкости (м3/сут)"}
                  rightBottom={"Обводненность(%)"}
                />
              ) : (
                <Legends 
                  leftTop={"Номер скважины (XXX_xxxx)"}
                  rightTop={"Плановая закачка"}
                  middle={"Закачка"}
                />
              )}
              
              <SelectFond 
                setFond={setFond} 
                wells={wells.filter(well => well.nagn === fond)}
                hideWorkingStatusLegend={fond === 1}
                chrpFilter={chrpFilter}
                setChrpFilter={setChrpFilter}
                fond={fond}
              />
              
              {fond == 0 ? (
                <Details
                  leftTop={"-15% откл. от ТР"}
                  rightTop={"Скв. остановлена"}
                  leftBottom={"более 30%"}
                  rightBottom={"в пределах нормы"}
                />
              ) : (
                <Details leftBottom={"-30% откл. от cнижение замерной добычи"} />
              )}
            </div>
            <Grid
              wells={filteredWells}
              fieldMappings={fieldMappings}
              calculateMiddleValue={calculateMiddleValue}
              maxThreshold={15}
              colorMax={'greenCard'}
              minThreshold={-30}
              colorMin={'redCard'}
              inBetweenThresholdMin={-30}
              inBetweenColor={'orangeCard'}
              inBetweenThresholdMax={-15}
              realMiddle={true}
              onWellClick={fond === 0 ? handleWellClick : undefined} // Disable well clicks in VRP mode
              hideWorkingStatus={fond === 1} // Hide working status for injection wells (VRP)
              isWellStopped={isWellStopped} // Pass the function to check if well is stopped
              fond={fond} // Pass fond to Grid
            />
          </div>
          <div className={styles.container}>
            {fond === 0 ? (
              <AGZU wells={wellsForComponents} index={2}/>
            ) : (
              <VRP wells={wellsForComponents} />
            )}
          </div>
        </div>
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