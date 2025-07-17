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
  hideWorkingStatus = false // New prop to hide working status circle
}) {
  const location = useLocation();
  const context = location.pathname === "/abc" ? useContext(WellsABCContext) : null;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [well, setWell] = useState(null);

  const handleClick = async () => {
    // If onWellClick prop is provided (from AppLayout), use it
    if (onWellClick) {
      onWellClick(leftTop);
      return;
    }

    // Original ABC page logic
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

  let cardColorClass = styles.grayCard;
  if (middle > maxThreshold) {
    cardColorClass = styles[colorMax];
  } else if (middle <= minThreshold) {
    cardColorClass = styles[colorMin];
  } else if (middle !== 0) {
    const percentageDifference = middle;
    if (percentageDifference > inBetweenThresholdMin &&
        percentageDifference <= inBetweenThresholdMax) {
      cardColorClass = styles[inBetweenColor];
    }
  }

  const cardClasses = `${styles.wellCard} ${cardColorClass}`;

  return (
    <>
      <div className={cardClasses} onClick={handleClick}>
        {/* Status circle in top-right - only show if hideWorkingStatus is false */}
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
              "Авария"
            }
          />
        )}
        <div className={styles.cardRow}>
          <span>{leftTop}</span>
          <span>{rightTop.toFixed(2)}</span>
        </div>
        <h3 className={styles.cardHeader}>{realMiddle.toFixed(2)}</h3>
        <div className={styles.cardRow}>
          <span>{leftBottom.toFixed(1)}</span>
          <span>{rightBottom.toFixed(1)}</span>
        </div>
      </div>
    </>
  );
}