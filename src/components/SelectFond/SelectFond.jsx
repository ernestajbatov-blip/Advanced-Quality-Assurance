import React, { useState, useEffect } from "react";
import styles from "./SelectFond.module.css";
import { fetchLastUpdate } from "../../axios/wellService";

export default function SelectFond({ 
  setFond, 
  wells = [], 
  hideWorkingStatusLegend = false,
  chrpFilter,
  setChrpFilter,
  fond
}) {
  const [lastUpdate, setLastUpdate] = useState(null);

  // Count wells by working status
  const statusCounts = wells.reduce(
    (acc, well) => {
      if (well.working === 1) acc.working++;
      else if (well.working === 2) acc.noData++;
      else if (well.working === 3) acc.notWorking++;
      return acc;
    },
    { working: 0, noData: 0, notWorking: 0 }
  );

  // Count ЧРП wells
  const chrpCount = wells.filter(well => well.type === 1).length;

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

  return (
    <div className={styles.container}>
      <select
        className={styles.selectDropdown}
        onChange={(e) => setFond(Number(e.target.value))}
      >
        <option value="0">Добывающий фонд</option>
        <option value="1">Нагнетательный фонд</option>
      </select>

      {/* ЧРП Checkbox - only show for добывающий фонд (nagn = 0) */}
      {fond === 0 && (
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
      {!hideWorkingStatusLegend && (
        <div className={styles.legend}>
          {/* Last Update Display */}
          {/* <div className={styles.lastUpdate}>
            <span className={styles.lastUpdateLabel}>Последнее обновление:</span>
            <span className={styles.lastUpdateValue}>
              {lastUpdate || 'Загрузка...'}
            </span>
          </div> */}

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