import React, { useState, useEffect, useMemo } from "react";
import styles from "./SelectFond.module.css";
import { fetchLastUpdate } from "../../axios/wellService";

export default function SelectFond({
  setFond,
  wells = [],
  hideWorkingStatusLegend = false,
  chrpFilter,
  setChrpFilter,
  fond,
  statusFilter,
  setStatusFilter,
  // Add these as optional props if counts are passed from parent
  totalProductionWells,
  totalInjectionWells,
  totalIdleWells,
  totalInactiveWells
}) {
  const [lastUpdate, setLastUpdate] = useState(null);
  
  // Filter wells based on ЧРП filter when applicable
  const filteredWells = useMemo(() => {
    if (chrpFilter && fond === 0) {
      return wells.filter(well => well.type === 1);
    }
    return wells;
  }, [wells, chrpFilter, fond]);
  
  // Count wells by working status using filtered wells
  const statusCounts = filteredWells.reduce(
    (acc, well) => {
      // Only count ЧРП wells for status counters
      if (well.type === 1) {
        if (well.working === 1) acc.working++;
        else if (well.working === 2) acc.noData++;
        else if (well.working === 3) acc.notWorking++;
      }
      return acc;
    },
    { working: 0, noData: 0, notWorking: 0 }
  );
  
  // Count wells by status (В работе, В простое, В бездействий)
  // Use passed props if available, otherwise count from wells array
  const wellStatusCounts = {
    working: totalProductionWells !== undefined ? 
      (totalProductionWells - (totalIdleWells || 0) - (totalInactiveWells || 0)) : 
      wells.filter(well => well.status === "В работе").length,
    idle: totalIdleWells !== undefined ? 
      totalIdleWells : 
      wells.filter(well => well.status === "В простое").length,
    inactive: totalInactiveWells !== undefined ? 
      totalInactiveWells : 
      wells.filter(well => well.status === "В бездействий").length
  };
  
  // Count ЧРП wells
  const chrpCount = wells.filter(well => well.type === 1).length;
  
  // Count injection wells (нагнетательный фонд)
  // Use passed prop if available, otherwise count from wells array
  const injectionCount = totalInjectionWells !== undefined ? 
    totalInjectionWells : 
    wells.filter(well => well.nagn === 1).length;
  
  // Fetch last update timestamp
  useEffect(() => {
    const getLastUpdate = async () => {
      try {
        const response = await fetchLastUpdate();
        if (response.data && response.data.lastUpdate) {
          setLastUpdate(new Date(response.data.lastUpdate).toLocaleString('ru-RU'));
        }
      } catch (error) {
        console.error('Error fetching last update:', error);
      }
    };
    getLastUpdate();
  }, []);
  
  const handleChrpChange = (e) => {
    setChrpFilter(e.target.checked);
  };
  
  const handleSelectionChange = (value) => {
    if (value === "0") {
      // Main production category
      setFond(0);
      if (setStatusFilter) {
        setStatusFilter(null);
      }
    } else if (value === "0-idle") {
      // В простое subcategory
      setFond(0);
      if (setStatusFilter) {
        setStatusFilter("В простое");
      }
    } else if (value === "0-inactive") {
      // В бездействий subcategory
      setFond(0);
      if (setStatusFilter) {
        setStatusFilter("В бездействий");
      }
    } else if (value === "1") {
      // Injection wells
      setFond(1);
      if (setStatusFilter) {
        setStatusFilter(null);
      }
    }
  };
  
  // Determine current selection value
  const getCurrentValue = () => {
    if (fond === 0) {
      if (statusFilter === "В простое") return "0-idle";
      if (statusFilter === "В бездействий") return "0-inactive";
      return "0";
    }
    return "1";
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.selectContainer}>
        <select
          className={styles.selectDropdown}
          onChange={(e) => handleSelectionChange(e.target.value)}
          value={getCurrentValue()}
        >
          <option value="0">
            Добывающий фонд ({wellStatusCounts.working + wellStatusCounts.idle + wellStatusCounts.inactive})
          </option>
          <option value="0-idle" className={styles.subcategoryOption}>
            ⤷ В простое ({wellStatusCounts.idle})
          </option>
          <option value="0-inactive" className={styles.subcategoryOption}>
            ⤷ В бездействий ({wellStatusCounts.inactive})
          </option>
          <option value="1">
            Нагнетательный фонд ({injectionCount})
          </option>
        </select>
      </div>
      
      {/* ЧРП Checkbox - only show for добывающий фонд (nagn = 0) */}
      {fond === 0 && !statusFilter && (
        <div className={styles.chrpCheckbox}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={chrpFilter}
              onChange={handleChrpChange}
              className={styles.checkbox}
            />
            <span className={styles.checkboxText}>
              ЧРП ({chrpCount})
            </span>
          </label>
        </div>
      )}
      
      {/* Only show working status legend if hideWorkingStatusLegend is false */}
      {!hideWorkingStatusLegend && !statusFilter && (
        <div className={styles.legend}>
          {/* Working Status Legend */}
          <LegendRow color="green" label="В сети" count={statusCounts.working} />
          <LegendRow color="yellow" label="Нет данных" count={statusCounts.noData} />
          <LegendRow color="red" label="Не в сети" count={statusCounts.notWorking} />
        </div>
      )}
    </div>
  );
}

function LegendRow({ color, label, count }) {
  return (
    <div className={styles.legendRow}>
      <span className={`${styles.circle} ${styles[color]}`} />
      <span className={styles.label}>{label}</span>
      <span className={styles.count}>{count}</span>
    </div>
  );
}