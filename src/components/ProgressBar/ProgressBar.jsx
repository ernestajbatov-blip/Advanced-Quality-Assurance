import React from "react";
import styles from "./ProgressBar.module.css";

export default function ProgressBar({ 
  value, 
  primaryValue, 
  secondaryValue, 
  maxValue, 
  color, 
  width, 
  height 
}) {
  // Use primaryValue if provided, otherwise fall back to value
  const displayPrimary = primaryValue !== undefined ? primaryValue : value;
  const displaySecondary = secondaryValue !== undefined ? secondaryValue : null;
  
  const percentage = (displayPrimary / maxValue) * 100;
  
  return (
    <div className={styles.container}>
      <div
        className={styles.barContainer}
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <div
          className={styles.progress}
          style={{ height: `${percentage}%`, backgroundColor: color }}
        ></div>
      </div>
      <div
        className={styles.label}
        style={{ bottom: `calc(${percentage}% - 8px)`, left: `${width + 5}px` }}
      >
        <span>{displayPrimary} см</span>
        {displaySecondary !== null && (
          <>
            <span>{displaySecondary} м³</span>
          </>
        )}
      </div>
    </div>
  );
}