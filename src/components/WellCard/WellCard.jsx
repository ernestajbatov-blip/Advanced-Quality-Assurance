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
  fond
}) {
  const location = useLocation();
  const context = location.pathname === "/abc" ? useContext(WellsABCContext) : null;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [well, setWell] = useState(null);

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
        setWell(data);
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
    // Check for null, undefined, or empty string
    if (value === null || value === undefined || value === '') {
      return "N/A";
    }
    
    // Convert to number
    const numValue = parseFloat(value);
    
    // Check if conversion resulted in NaN or Infinity
    if (isNaN(numValue) || !isFinite(numValue)) {
      return "N/A";
    }
    
    // Return formatted number (including 0.00)
    return numValue.toFixed(decimals);
  };

  // DEBUG: Log the values to see what's happening
  console.log(`Well ${leftTop}:`, {
    fond: fond,
    wellStopped: wellStopped,
    middle: middle,
    minThreshold: minThreshold,
    maxThreshold: maxThreshold,
    rightTop: rightTop,
    leftBottom: leftBottom,
    rightBottom: rightBottom
  });

  let cardColorClass = styles.grayCard;

  // Check if we're on the ABC page for different coloring logic
  if (location.pathname === "/abc") {
    // ABC-specific coloring logic
    if (middle < 0) {
      cardColorClass = styles.greenCard; // Green for values less than 0
    } else if (middle > 20) {
      cardColorClass = styles.redCard; // Red for values greater than 20
    } else if (middle > 10 && middle <= 20) {
      cardColorClass = styles.orangeCard; // Orange for values between 10 and 20
    } else if (middle >= 0 && middle <= 10) {
      cardColorClass = styles.grayCard; // Gray for values between 0 and 10
    }
  } else {
    // Original logic for other pages (AppLayout)
    if (fond === 1) {
      // For injection wells, completely different color logic
      if (middle > maxThreshold) {
        cardColorClass = styles[colorMax]; // Green
      } else if (middle !== 0 && middle > inBetweenThresholdMin && middle <= inBetweenThresholdMax) {
        cardColorClass = styles[inBetweenColor]; // Orange
      } else {
        cardColorClass = styles.grayCard; // Gray
      }
    } else if (fond === 0) {
      // For production wells
      // Only apply blinking red if well is actually stopped AND not just offline
      if (wellStopped && working !== 3) {
        cardColorClass = `${styles[colorMin]} ${styles.blinking}`;
      } else if (middle > maxThreshold) {
        cardColorClass = styles[colorMax]; // Green for good performance
      } else if (middle !== 0) {
        const percentageDifference = middle;
        if (percentageDifference > inBetweenThresholdMin &&
            percentageDifference <= inBetweenThresholdMax) {
          cardColorClass = styles[inBetweenColor]; // Orange
        }
      }
    }
  }

  const cardClasses = `${styles.wellCard} ${cardColorClass}`;

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
          <span>{formatValue(rightTop, 2)}</span>
        </div>

        <h3 className={styles.cardHeader}>
          {formatValue(realMiddle, 2)}
        </h3>

        <div className={styles.cardRow}>
          {fond === 1 ? (
            <>
              <span style={{ visibility: 'hidden' }}>0.0</span>
              <span style={{ visibility: 'hidden' }}>0.0</span>
            </>
          ) : (
            <>
              <span>{formatValue(leftBottom, 1)}</span>
              <span>{formatValue(rightBottom, 1)}</span>
            </>
          )}
        </div>
      </div>
    </>
  );
}