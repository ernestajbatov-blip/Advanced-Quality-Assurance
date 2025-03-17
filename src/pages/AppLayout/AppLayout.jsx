import React, { useState, useEffect, useContext, useMemo } from "react";
import { fetchWells } from "../../axios/wellService";
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
import { WellsContext } from "../../states/WellsContext";

export default function AppLayout() {
  const { fond, setFond, wells, setWells } = useContext(WellsContext);

  const fieldMappings = {
    leftTop: "well",
    rightTop: "tr_fluid",
    middle: "zamer",
    leftBottom: "tr_oil",
    rightBottom: "tr_water",
  };

  const filteredWells = useMemo(() => {
    if (fond === 0) {
      return wells.filter((well) => well.nagn === 0);
    } else {
      return wells.filter((well) => well.nagn === 1);
    }
  }, [wells, fond]);

  return (
    <div className={styles.app}>
      <AppNav />
      <div className={styles.mainSection}>
        <div className={styles.row}>
          <div className={styles.container}>
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
              {fond == 0 ? (<Legends
                leftTop={"Номер скважины (XXX_xxxx)"}
                rightTop={"Тех. режим по нефти (т/сут)"}
                middle={"Замер по ТМ"}
                leftBottom={"Тех. режим по жидкости (м3/сут)"}
                rightBottom={"Обводненность(%)"}
              />) : 
                (<Legends leftTop={"Номер скважины (XXX_xxxx)"}
                rightTop={"Плановая закачка"}
                middle={"Закачка"}/>
              )}
              <SelectFond setFond={setFond} />
              {fond == 0 ? (<Details
                leftTop={"-30% откл. от ТР"}
                rightTop={"15% прев. над ТР"}
                leftBottom={"более 30%"}
                rightBottom={"в пределах нормы"}
              />) :
              (<Details leftBottom={"-30% откл. от cнижение замерной добычи"}/>
                )}
            </div>
            <Grid wells={filteredWells} fieldMappings={fieldMappings} />
          </div>
          <div className={styles.container}>
            {fond === 0 ? (
              <AGZU wells={filteredWells} />
            ) : (
              <VRP wells={filteredWells} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
