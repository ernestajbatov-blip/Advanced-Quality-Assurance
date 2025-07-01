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

export default function AppLayout() {
  // Use the original WellsContext
  const { fond, setFond, wells, setWells } = useContext(WellsContext);
  
  // Modal state management
  const [showWellModal, setShowWellModal] = useState(false);
  const [wellModalData, setWellModalData] = useState([]);
  const [wellModalTitle, setWellModalTitle] = useState("Well Data");
  const [wellModalLoading, setWellModalLoading] = useState(false);

  const fieldMappings = {
    leftTop: "well",
    rightTop: "tr_fluid",
    middle: "zamer",
    leftBottom: "tr_oil",
    rightBottom: "tr_water",
  };

  const calculateMiddleValue = (wells, values) => {
    return parseFloat(((values.middle - values.leftBottom) / values.leftBottom * 100).toFixed(2));
  };

  const filteredWells = useMemo(() => {
    if (fond === 0) {
      return wells.filter((well) => well.nagn === 0);
    } else {
      return wells.filter((well) => well.nagn === 1);
    }
  }, [wells, fond]);

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
      { "Параметр": "Напряжение", "Значение": wellData["Напряжение"] || "N/A" },
      { "Параметр": "Мощность", "Значение": wellData["Мощность"] || "N/A" },
      { "Параметр": "Частота", "Значение": wellData["Частота"] || "N/A" },
      { "Параметр": "Ток", "Значение": wellData["Ток"] || "N/A" },
      { "Параметр": "Скорость двигателя", "Значение": wellData["Скорость двигателя"] || "N/A" }
    ];

    setWellModalData(transformedData);

  } catch (error) {
    console.error("Error fetching well data:", error);
    
    const selectedWell = wells.find(well => well.well === wellNumber);
    if (selectedWell) {
      const fallbackData = [
        { "Параметр": "Номер скважины", "Значение": selectedWell.well || "N/A" },
        { "Параметр": "Ошибка", "Значение": "Не удалось загрузить подробные данные. Показаны базовые данные из кэша." },
        { "Параметр": "Тех. режим по жидкости", "Значение": `${selectedWell.tr_fluid?.toFixed(2) || 0} м³/сут` },
        { "Параметр": "Замер", "Значение": `${selectedWell.zamer?.toFixed(2) || 0}` }
      ];
      setWellModalData(fallbackData);
    } else {
      setWellModalData([{ "Параметр": "Ошибка", "Значение": "Не удалось загрузить данные скважины" }]);
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
      <AppNav />
      <div className={styles.mainSection}>
        <div className={styles.row}>
          <div className={styles.chartContainer}>
            <Chart />
          </div>
          <div className={styles.container}>
            <KPI />
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
              <SelectFond setFond={setFond} wells={filteredWells} />
              {fond == 0 ? (
                <Details
                  leftTop={"-15% откл. от ТР"}
                  rightTop={"-30% откл. от ТР"}
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
              onWellClick={handleWellClick}
            />
          </div>
          <div className={styles.container}>
            {fond === 0 ? (
              <AGZU wells={filteredWells} index={2}/>
            ) : (
              <VRP wells={filteredWells} />
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