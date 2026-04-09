// @ts-nocheck
import React from "react";
import styles from "./DiagramTest.module.css"; // Custom CSS file for styles
import SchemeMain from "../../data/Diagrams/SchemeMain.svg";

export default function DiagramTest() {
  const componentData = [
    { top: "100px", left: "700px", content: "КУУГ" },
    {
      top: "130px",
      left: "220px",
      content: (
        <>
          <div className={styles.indicator}>0.0 м³/ч</div>
          <div className={styles.labelBox}>Расходомер</div>
        </>
      ),
    },
    { top: "200px", left: "150px", content: "ЦППГ" },
    {
      top: "250px",
      left: "300px",
      content: (
        <>
          <div className={styles.labelBox}>Узел отчета</div>
          <div className={styles.table}>Data Table</div>
        </>
      ),
    },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <img src={SchemeMain} alt="Diagram" />

        {/* Overlaying components */}
        <div className={styles.overlay}>
          {componentData.map((item, index) => (
            <div
              key={index}
              className={styles.component}
              style={{ top: item.top, left: item.left }}
            >
              {item.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
