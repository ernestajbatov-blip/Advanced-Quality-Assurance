import React from "react";
import OilLossChart from "../../components/OilLossChart/OilLossChart";
import AppNav from "../../components/AppNav/AppNav";
import styles from "./OilLayout.module.css";

export default function OilLayout() {
  const tableData = [
    ["Нач. добыча", "150", "-13", "7", "-11", "133"],
    ["0", "150", "137", "144", "133"],
    ["150", "137", "144", "133", "266"],
    ["Мин", "0", "137", "137", "133", "0"],
    ["Макс", "150", "150", "144", "144", "133"],
  ];

  const tableHeaders = [
    "Нач. добыча",
    "За счет вр. работы",
    "За счет обвод-ти",
    "За счет дебита жидк.",
    "Конеч. добыча",
  ];

  return (
    <div style={{ width: "100%"}}>
      <AppNav />
      <div className={styles.flexContainer}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          gap: "200px",
          alignContent: "start",
        }}
      >
        <OilLossChart />
      </div>

      <table className={styles.oilLossTable}>
        <thead>
          <tr>
            {tableHeaders.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
