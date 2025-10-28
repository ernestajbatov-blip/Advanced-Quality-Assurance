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
 * @param {Array<{tag: string, status: number|boolean}>} pumpStatuses - Array of pump status objects
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
  pumpStatuses = []
}) {
  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {Array.from({length: numberOfSquares}).map((_, index) => {
          let isActive = false;

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
            />
          );
        })}
      </div>
    </div>
  );
}