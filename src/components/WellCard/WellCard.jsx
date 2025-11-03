// WellCard.jsx:
import React, {useState, useContext} from "react";
import styles from "./WellCard.module.css";
import { fetchWellData } from "../../axios/wellService";
import WellPassport from "../WellPassport/WellPassport";
import { useLocation } from "react-router-dom";
import Modal from "../Modal/Modal";
import { WellsABCContext } from "../../states/WellsABCContext";

export default function WellCard({
  leftTop,
  rightTop,
  middle, 
  leftBottom,
  rightBottom,
  setSelectedWell,
  maxThreshold,
  colorMax,
  minThreshold,
  colorMin,
  inBetweenThresholdMin,
  inBetweenColor,
  inBetweenThresholdMax,
  realMiddle,
  onWellClick,
  working,
  hideWorkingStatus = false,
  wellStopped = false,
  fond,
  well,
  chartType,
  statusFilter
}) {
  const location = useLocation();
  const context = location.pathname === "/abc" ? useContext(WellsABCContext) : null;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wellData, setWellData] = useState(null);

  const handleClick = async () => {
    if (onWellClick) {
      onWellClick(leftTop);
      return;
    }

    if (location.pathname === "/abc") {
      try {
        const { wells, setWellsChart } = context;
        const response = await fetchWellData(leftTop);
        const data = response.data;
        const selected = wells.filter((well) => well.well === leftTop);
        console.log(selected);
        setWellsChart(selected);
        setWellData(data);
        setSelectedWell(selected);
        setIsModalOpen(true);
      } catch (err) {
        console.error("Error getting the 'well' data!", err);
      }
    } else {
      return;
    }
  };

  // Helper function to format numeric values
  const formatValue = (value, decimals = 2) => {
    if (value === null || value === undefined || value === '') {
      return "N/A";
    }
    
    const numValue = parseFloat(value);
    
    if (isNaN(numValue) || !isFinite(numValue)) {
      return "N/A";
    }
    
    return numValue.toFixed(decimals);
  };

  let cardColorClass = styles.grayCard;
  
  // Get well status
  const wellStatus = well?.status;

  // Check if we're on the ABC page
  if (location.pathname === "/abc") {
    // ABC-specific coloring logic using the percentage (middle)
    if (middle < 0) {
      cardColorClass = styles.greenCard;
    } else if (middle > 20) {
      cardColorClass = styles.redCard;
    } else if (middle > 10 && middle <= 20) {
      cardColorClass = styles.orangeCard;
    } else if (middle >= 0 && middle <= 10) {
      cardColorClass = styles.grayCard;
    }
  } else {
    // AppLayout logic
    if (fond === 1) {
      // For injection wells, original logic with different thresholds
      if (middle > maxThreshold) {
        cardColorClass = styles[colorMax]; // Green
      } else if (middle !== 0 && middle > inBetweenThresholdMin && middle <= inBetweenThresholdMax) {
        cardColorClass = styles[inBetweenColor]; // Orange
      } else {
        cardColorClass = styles.grayCard; // Gray
      }
    } else if (fond === 0) {
      // Production wells
      
      // PRIORITY 1: Handle "В бездействий" status - always show as gray with zeros
      if (wellStatus === "В бездействий") {
        cardColorClass = styles.grayCard;
      }
      // PRIORITY 2: Handle "В простое" status - show as light gray
      else if (wellStatus === "В простое") {
        cardColorClass = styles.lightGrayCard;
      }
      // PRIORITY 3: Normal well coloring logic
      else {
        const isChrpWell = well?.type === 1;
        const isChrpOffline = working === 3;
        const percentageDiff = parseFloat(middle); // The percentage difference

        // Only apply current-based logic for CHRP wells that are online
        if (isChrpWell && !isChrpOffline) {
          const current = parseFloat(well?.c_current) || 0;
          const currentMin = parseFloat(well?.c_current_min) || 0;
          const currentMax = parseFloat(well?.c_current_max) || Infinity;

          // Priority 1: Red conditions (using 'current')
          if (current < 1) {
            cardColorClass = styles.redCardStatic; // Static red for current < 1
          } else if (current < currentMin || current > currentMax) {
            cardColorClass = styles.redCard; // Blinking red for current out of range
          } else if (wellStopped) {
            cardColorClass = styles.redCard; // Blinking red for stopped
          } else {
            // If not red, check for orange: percentage < -15%
            const orangeThreshold = -15;

            if (!isNaN(percentageDiff) && percentageDiff < orangeThreshold) {
              cardColorClass = styles.orangeCard; // Orange if 15% below target
            } else if (percentageDiff > maxThreshold) {
              cardColorClass = styles[colorMax]; // Green for good performance
            } else {
              cardColorClass = styles.grayCard; // Default gray
            }
          }
        } else {
          // For non-CHRP wells or offline CHRP wells, use only percentage-based coloring
          const orangeThreshold = -15;

          if (!isNaN(percentageDiff) && percentageDiff < orangeThreshold) {
            cardColorClass = styles.orangeCard; // Orange if 15% below target
          } else if (percentageDiff > maxThreshold) {
            cardColorClass = styles[colorMax]; // Green for good performance
          } else {
            cardColorClass = styles.grayCard; // Default gray
          }
        }
      }
    }
  }

  const cardClasses = `${styles.wellCard} ${cardColorClass}`;
  
  // Determine display values based on status
  let displayRightTop = rightTop;
  let displayRealMiddle = realMiddle;
  let displayLeftBottom = leftBottom;
  let displayRightBottom = rightBottom;
  
  // For "В бездействий" wells, show all zeros
  if (wellStatus === "В бездействий") {
    displayRightTop = 0;
    displayRealMiddle = 0;
    displayLeftBottom = 0;
    displayRightBottom = 0;
  }

  return (
    <>
      <div className={cardClasses} onClick={handleClick}>
        {!hideWorkingStatus && [1, 2, 3].includes(working) && (
          <div
            className={`${styles.statusCircle} ${
              working === 1 ? styles.green :
              working === 2 ? styles.yellow :
              styles.red
            }`}
            title={
              working === 1 ? "Работает" :
              working === 2 ? "Предупреждение" :
              "Не в сети"
            }
          />
        )}

        <div className={styles.cardRow}>
          <span>{leftTop}</span>
          <span>{formatValue(displayRightTop, 2)}</span>
        </div>

        <h3 className={styles.cardHeader}>
          {formatValue(displayRealMiddle, 2)}
        </h3>

        <div className={styles.cardRow}>
          {fond === 1 ? (
            <>
              <span style={{ visibility: 'hidden' }}>0.0</span>
              <span style={{ visibility: 'hidden' }}>0.0</span>
            </>
          ) : (
            <>
              <span>{formatValue(displayLeftBottom, 1)}</span>
              <span>{formatValue(displayRightBottom, 1)}</span>
            </>
          )}
        </div>
      </div>
    </>
  );
}