// @ts-nocheck
function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
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
  if (stryMutAct_9fa48("858")) {
    {}
  } else {
    stryCov_9fa48("858");
    const {
      user,
      onLogout
    } = useUser();
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
    const fieldMappings = stryMutAct_9fa48("859") ? {} : (stryCov_9fa48("859"), {
      leftTop: stryMutAct_9fa48("860") ? "" : (stryCov_9fa48("860"), "well"),
      rightTop: stryMutAct_9fa48("861") ? "" : (stryCov_9fa48("861"), "tm_water_prev"),
      middle: stryMutAct_9fa48("862") ? "" : (stryCov_9fa48("862"), "tm_fluid"),
      leftBottom: stryMutAct_9fa48("863") ? "" : (stryCov_9fa48("863"), "tm_water"),
      rightBottom: stryMutAct_9fa48("864") ? "" : (stryCov_9fa48("864"), "tr_water")
    });
    const calculateMiddleValue = (wells, values) => {
      if (stryMutAct_9fa48("865")) {
        {}
      } else {
        stryCov_9fa48("865");
        return parseFloat((stryMutAct_9fa48("866") ? (values.leftBottom - values.rightTop) / values.rightTop / 100 : (stryCov_9fa48("866"), (stryMutAct_9fa48("867") ? (values.leftBottom - values.rightTop) * values.rightTop : (stryCov_9fa48("867"), (stryMutAct_9fa48("868") ? values.leftBottom + values.rightTop : (stryCov_9fa48("868"), values.leftBottom - values.rightTop)) / values.rightTop)) * 100)).toFixed(2));
      }
    };
    return <div className={styles.app}>
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
              <Legends leftTop={stryMutAct_9fa48("869") ? "" : (stryCov_9fa48("869"), "Номер скважины")} rightTop={stryMutAct_9fa48("870") ? "" : (stryCov_9fa48("870"), "Предыдущий замер")} middle={stryMutAct_9fa48("871") ? "" : (stryCov_9fa48("871"), "Разница обводненности (%)")} leftBottom={stryMutAct_9fa48("872") ? "" : (stryCov_9fa48("872"), "Последний замер")} rightBottom={stryMutAct_9fa48("873") ? "" : (stryCov_9fa48("873"), "Лаб. обводненность")} />
              <Details leftTop={stryMutAct_9fa48("874") ? "" : (stryCov_9fa48("874"), "от 10% до 20%")} rightTop={stryMutAct_9fa48("875") ? "" : (stryCov_9fa48("875"), "Повышение Обводненности Выше 20%")} leftBottom={stryMutAct_9fa48("876") ? "" : (stryCov_9fa48("876"), "Снижение обводненности Ниже 0%")} rightBottom={stryMutAct_9fa48("877") ? "" : (stryCov_9fa48("877"), "от 0 до 10%")} />
            </div>
            <Grid wells={wellsGrid} fieldMappings={fieldMappings} calculateMiddleValue={calculateMiddleValue} setSelectedWell={setSelectedWell} maxThreshold={20} colorMax={stryMutAct_9fa48("878") ? "" : (stryCov_9fa48("878"), 'redCard')} minThreshold={0} colorMin={stryMutAct_9fa48("879") ? "" : (stryCov_9fa48("879"), 'greenCard')} inBetweenThresholdMin={10} inBetweenColor={stryMutAct_9fa48("880") ? "" : (stryCov_9fa48("880"), 'orangeCard')} inBetweenThresholdMax={20} realMiddle={stryMutAct_9fa48("881") ? true : (stryCov_9fa48("881"), false)} />
          </div>
          <div className={stryMutAct_9fa48("882") ? `` : (stryCov_9fa48("882"), `${styles.container} ${styles.wellTableContainer}`)}>
            <WellTable wells={wellsGrid} setSelectedWell={setSelectedWell} />
          </div>
        </div>
      </div>
    </div>;
  }
}