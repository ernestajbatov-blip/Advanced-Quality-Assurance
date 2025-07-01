import React from "react";
import styles from "./SelectFond.module.css";

export default function SelectFond({ setFond, wells = [] }) {
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

  return (
    <div className={styles.container}>
      <select
        className={styles.selectDropdown}
        onChange={(e) => setFond(Number(e.target.value))}
      >
        <option value="0">Добывающий фонд</option>
        <option value="1">Нагнетательный фонд</option>
      </select>

      <div className={styles.legend}>
        <LegendRow color="green" label="В сети" count={statusCounts.working} />
        <LegendRow color="yellow" label="Нет данных" count={statusCounts.noData} />
        <LegendRow color="red" label="Не в сети" count={statusCounts.notWorking} />
      </div>
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
