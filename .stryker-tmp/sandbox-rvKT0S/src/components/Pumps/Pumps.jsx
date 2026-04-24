// @ts-nocheck
import React from "react";
import Square from "../Square/Square";
import styles from "./Pumps.module.css";
/**
 * Pumps Component
 * 
 * @param {number} numberOfSquares - Number of pump squares to display
 * @param {number} width - Width of each square
 * @param {number} height - Height of each square
 * @param {number} activeIndex - (DEPRECATED) Legacy prop for backward compatibility
 * @param {Array<{tag: string, status: number|boolean, label: string}>} pumpStatuses - Array of pump status objects
 * @param {boolean} vertical - If true, arrange pumps vertically instead of horizontally
 * @param {number} gap - Gap between pumps in pixels (default: 0)
 * @param {boolean} showLabels - If true, show text labels instead of pump icons
 * @param {number} fontSize - Font size for labels in pixels (default: 15)
 *   Example: [
 *     { tag: "gnu_1_status", status: 1 },
 *     { tag: "gnu_2_status", status: 0 },
 *     { tag: "gnu_3_status", status: 1 }
 *   ]
 */
export default function Pumps({
  numberOfSquares, 
  activeIndex = -1,
  width, 
  height,
  pumpStatuses = [],
  vertical = false,
  gap = 0,
  showLabels = false,
  fontSize = 15
}) {
  return (
    <div className={styles.container}>
      <div 
        className={vertical ? styles.gridVertical : styles.grid}
        style={{ gap: `${gap}px` }}
      >
        {Array.from({length: numberOfSquares}).map((_, index) => {
          let isActive = false;
          let label = "";
          
          // If pumpStatuses is provided, use it
          if (pumpStatuses.length > 0) {
            const pumpStatus = pumpStatuses[index];
            
            if (pumpStatus) {
              // Handle different status formats
              if (typeof pumpStatus.status === 'number') {
                isActive = pumpStatus.status === 1;
              } else if (typeof pumpStatus.status === 'boolean') {
                isActive = pumpStatus.status;
              } else if (typeof pumpStatus.status === 'string') {
                isActive = pumpStatus.status === '1' || pumpStatus.status.toLowerCase() === 'true';
              }
              
              // Get label if provided
              label = pumpStatus.label || "";
            }
          } else {
            // Fallback to old activeIndex logic for backward compatibility
            isActive = index === activeIndex;
          }
          
          return (
            <Square
              key={index}
              isActive={isActive}
              width={width}
              height={height}
              showLabel={showLabels}
              label={label}
            />
          );
        })}
      </div>
    </div>
  );
}