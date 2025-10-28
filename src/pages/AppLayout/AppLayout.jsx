// AppLayout.jsx:
import React, { useState, useEffect, useContext, useMemo } from "react";
import { fetchWells, fetchWellData, fetchAGZUWellData } from "../../axios/wellService";
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
  const { fond, setFond, wells, setWells } = useContext(WellsContext);
  
  // Modal state management
  const [showWellModal, setShowWellModal] = useState(false);
  const [wellModalData, setWellModalData] = useState([]);
  const [agzuModalData, setAgzuModalData] = useState([]);
  const [wellModalTitle, setWellModalTitle] = useState("Well Data");
  const [wellModalLoading, setWellModalLoading] = useState(false);
  const [agzuModalLoading, setAgzuModalLoading] = useState(false);
  const [chartType, setChartType] = useState("liquid");
  
  // Shared state for current otvod well - updated by AGZU component
  const [currentOtvodWell, setCurrentOtvodWell] = useState(null);
  const [currentOtvodData, setCurrentOtvodData] = useState(null);
  
  // ЧРП filter state
  const [chrpFilter, setChrpFilter] = useState(false);
  
  const { user, onLogout } = useUser();

  useEffect(() => {
    if (fond === 1) {
      setChrpFilter(false);
    }
  }, [fond]);

  const fieldMappings = useMemo(() => ({
    leftTop: "well",
    rightTop: fond === 1 ? "tr_fluid" : "tr_oil",  // Use tr_fluid for injection wells
    middle: fond === 1 ? "zamer" : (chartType === "liquid" ? "zamer" : "zamer_oil"),
    leftBottom: "tr_fluid",
    rightBottom: "tr_water",
  }), [chartType, fond]);

  const calculateMiddleValue = (wells, values) => {
    // For injection wells, always use rightTop (which is now tr_fluid)
    // For production wells, use rightTop for oil mode, leftBottom for liquid mode
    const baseValue = fond === 1 
      ? values.rightTop  // tr_fluid for injection
      : (chartType === "oil" ? values.rightTop : values.leftBottom);
    return parseFloat(((values.middle - baseValue) / baseValue * 100).toFixed(2));
  };

  const isWellStopped = (well) => {
    if (fond !== 0) {
      return false;
    }
    
    if (well.c_current === null || 
        well.c_current === undefined || 
        well.c_current === '' || 
        well.c_current === 'NULL') {
      return false;
    }
    
    const current = parseFloat(well.c_current);
    
    if (!isNaN(current) && isFinite(current)) {
      return current < 1;
    }
    
    return false;
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
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return value;
    }
    return numValue.toString();
  };

  const formatValue = (value, unit = "", decimals = 2) => {
    if (value === null || value === undefined || value === "") return "N/A";
    if (typeof value === "number") {
      return `${value.toFixed(decimals)} ${unit}`.trim();
    }
    return value;
  };

  const handleWellClick = async (wellNumber, providedOtvodData = null) => {
    try {
      setWellModalLoading(true);
      setAgzuModalLoading(true);
      setWellModalTitle(`Данные ЧРП на ${wellNumber}`);
      setShowWellModal(true);
      setAgzuModalData([]);

      // Fetch specific well data using fetchWellData
      const response = await fetchWellData(wellNumber);
      const specificWellData = response.data;

      const wellData = Array.isArray(specificWellData) ? specificWellData[0] : specificWellData;

      const transformedData = [
        // { "Параметр": "Скважина", "Значение": wellData["Скважина"] || wellNumber },
        { "Параметр": "Последнее обновление", "Значение": formatLastUpdate(wellData["Последнее обновление"]) },
        { "Параметр": "Напряжение", "Значение": formatModalValue(wellData["Напряжение"]) },
        { "Параметр": "Мощность", "Значение": formatModalValue(wellData["Мощность"]) },
        { "Параметр": "Частота", "Значение": formatModalValue(wellData["Частота"]) },
        { "Параметр": "Ток", "Значение": formatModalValue(wellData["Ток"]) },
        { "Параметр": "Обороты ротора", "Значение": formatModalValue(wellData["Скорость двигателя"]) },
        { "Параметр": "Тип ЧРП", "Значение": formatModalValue(wellData["Тип ЧРП"]) },
        ...(wellData["Тип"] === 1 ? [{ "Параметр": "Температура устья", "Значение": formatModalValue(wellData["Температура"]) }] : [])
      ];
      setWellModalData(transformedData);
      setWellModalLoading(false);

      // Determine which otvod data to use
      let otvodDataToUse = providedOtvodData;
      
      // If not provided directly, check if this well is the current otvod well
      if (!otvodDataToUse && currentOtvodWell === wellNumber && currentOtvodData) {
        otvodDataToUse = currentOtvodData;
      }

      // If we have otvod data, use it
      if (otvodDataToUse) {
        const transformedAgzuData = [
          // { Параметр: "Скважина", Значение: wellNumber },
          { Параметр: "Жидкость", Значение: formatValue(otvodDataToUse.liquid, "м³/ч") },
          { Параметр: "Нефть", Значение: formatValue(otvodDataToUse.oil, "т/сут") },
          { Параметр: "Газ", Значение: formatValue(otvodDataToUse.gas, "м³/сут") },
          { Параметр: "Обводненность", Значение: formatValue(otvodDataToUse.waterCut, "%") },
        ];
        setAgzuModalData(transformedAgzuData);
        setAgzuModalLoading(false);
      } else {
        // Try to fetch AGZU data for this well
        try {
          const agzuResponse = await fetchAGZUWellData(wellNumber);
          const agzuWellData = agzuResponse.data;
          const agzuData = Array.isArray(agzuWellData) ? agzuWellData[0] : agzuWellData;

          const transformedAgzuData = [
            // { Параметр: "Скважина", Значение: agzuData["Скважина"] || wellNumber },
            { Параметр: "Жидкость", Значение: formatValue(agzuData["Жидкость"], "м³") },
            { Параметр: "Нефть", Значение: formatValue(agzuData["Нефть"], "т/сут") },
            { Параметр: "Газ", Значение: formatValue(agzuData["Газ"], "м³/сут") },
            { Параметр: "Обводненность", Значение: formatValue(agzuData["Обводненность"], "%") },
          ];

          setAgzuModalData(transformedAgzuData);
        } catch (agzuError) {
          console.log("No AGZU data available for this well");
          setAgzuModalData([]);
        } finally {
          setAgzuModalLoading(false);
        }
      }

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
      setWellModalLoading(false);
      setAgzuModalLoading(false);
    }
  };

  const handleCloseWellModal = () => {
    setShowWellModal(false);
    setWellModalData([]);
    setAgzuModalData([]);
    setWellModalLoading(false);
    setAgzuModalLoading(false);
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
                <Details 
                leftTop={"-15% откл. от плановой закачки"}
                leftBottom={"+30% откл. от плановой закачки"} />
              )}
            </div>
            <Grid
              wells={filteredWells}
              fieldMappings={fieldMappings}
              calculateMiddleValue={calculateMiddleValue}
              maxThreshold={fond === 0 ? 15 : 30}
              colorMax={'greenCard'}
              minThreshold={-30}
              colorMin={'redCard'}
              inBetweenThresholdMin={-30}
              inBetweenColor={'orangeCard'}
              inBetweenThresholdMax={-15}
              realMiddle={true}
              onWellClick={fond === 0 ? handleWellClick : undefined}
              hideWorkingStatus={fond === 1}
              isWellStopped={isWellStopped}
              fond={fond}
              chrpFilter={chrpFilter}
              chartType={chartType}
            />
          </div>
          <div className={styles.container}>
            {fond === 0 ? (
              <AGZU 
                wells={wellsForComponents} 
                index={2} 
                handleWellClick={handleWellClick}
                setCurrentOtvodWell={setCurrentOtvodWell}
                setCurrentOtvodData={setCurrentOtvodData}
              />
            ) : (
              <VRP wells={wellsForComponents} />
            )}
          </div>
        </div>
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
            
            <div style={{ 
              display: 'flex', 
              gap: '30px',
              flexWrap: 'wrap'
            }}>
              <div style={{ flex: '1', minWidth: '300px' }}>
                <h3 style={{ 
                  color: 'white', 
                  marginTop: 0, 
                  marginBottom: '15px',
                  fontSize: '18px'
                }}>
                  Данные скважины
                </h3>
                {wellModalLoading ? (
                  <div style={{ color: "white", textAlign: "center", padding: "20px" }}>
                    Загрузка данных скважины...
                  </div>
                ) : (
                  wellModalData.length > 0 && (
                    <div style={{ 
                      overflow: "auto",
                      maxHeight: "60vh"
                    }}>
                      <ResponsiveTable data={wellModalData} />
                    </div>
                  )
                )}
              </div>

              <div style={{ flex: '1', minWidth: '300px' }}>
                <h3 style={{ 
                  color: 'white', 
                  marginTop: 0, 
                  marginBottom: '15px',
                  fontSize: '18px'
                }}>
                  Данные АГЗУ
                </h3>
                {agzuModalLoading ? (
                  <div style={{ color: "white", textAlign: "center", padding: "20px" }}>
                    Загрузка данных АГЗУ...
                  </div>
                ) : agzuModalData.length > 0 ? (
                  <div style={{ 
                    overflow: "auto",
                    maxHeight: "60vh"
                  }}>
                    <ResponsiveTable data={agzuModalData} />
                  </div>
                ) : (
                  <div style={{ 
                    color: "#999", 
                    textAlign: "center", 
                    padding: "20px",
                    fontStyle: 'italic'
                  }}>
                    Данные АГЗУ недоступны для этой скважины
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}