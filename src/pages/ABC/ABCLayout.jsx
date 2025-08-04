import React, { useState, useEffect, useContext } from "react";
import AppNav from "../../components/AppNav/AppNav";
import Legends from "../../components/Legends/Legends";
import Details from "../../components/Details/Details";
import Grid from "../../components/Grid/Grid";
import styles from "./ABCLayout.module.css";
import AmChart from "../../components/AmChart/AmChart";
import WellTable from "../../components/WellTable/WellTable";
import AChart from "../../components/AChart/AChart";
import { WellsABCContext } from "../../states/WellsABCContext";
import { useUser } from "../../states/UserContext";

export default function ABCLayout() {
  const { user, onLogout } = useUser();
  const {
    wells,
    setWells,
    selectedWell,
    setSelectedWell,
    wellsGrid,
    setWellsGrid,
    wellsChart,
    setWellsChart,
    resetWellsChart
  } = useContext(WellsABCContext);


  const fieldMappings = {
    leftTop: "well",
    rightTop: "tm_water_prev",
    middle: "tm_fluid",
    leftBottom: "tm_water",
    rightBottom: "tr_water",
  };

  const calculateMiddleValue = (wells, values) => {
    return parseFloat(((values.leftBottom - values.rightTop) / values.rightTop * 100).toFixed(2));
  };  

  return (
    <div className={styles.app}>
      <AppNav />
      <div className={styles.mainSection}>
        <div className={styles.row}>
          <div className={styles.container}>
            <AmChart wellData={wellsChart} onReset={resetWellsChart} />
          </div>
          <div className={styles.containerX}>
            <AChart selectedWell={selectedWell} />
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.container}>
            <div className={styles.legendsAndDetailsContainer}>
              <Legends
                leftTop={"Номер скважины"}
                rightTop={"Предыдущий замер"}
                middle={"Разница обводненности (%)"}
                leftBottom={"Последний замер"}
                rightBottom={"Лаб. обводненность"}
              />
              <Details
                leftTop={"от 10% до 20%"}
                rightTop={"Повышение Обводненности Выше 20%"}
                leftBottom={"Снижение обводненности Ниже 0%"}
                rightBottom={"от 0 до 10%"}
              />
            </div>
            <Grid
              wells={wellsGrid}
              fieldMappings={fieldMappings}
              calculateMiddleValue={calculateMiddleValue}
              setSelectedWell={setSelectedWell}
              maxThreshold={20}
              colorMax={'redCard'}
              minThreshold={0}
              colorMin={'greenCard'}
              inBetweenThresholdMin={10}
              inBetweenColor={'orangeCard'}
              inBetweenThresholdMax={20}
              realMiddle={false}
            />
          </div>
          <div className={`${styles.container} ${styles.wellTableContainer}`}>
            <WellTable wells={wellsGrid} setSelectedWell={setSelectedWell} />
          </div>
        </div>
      </div>
    </div>
  );
}
