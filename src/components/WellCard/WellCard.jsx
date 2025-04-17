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
    realMiddle
}) {
    const location = useLocation();
    const context = location.pathname === "/abc" ? useContext(WellsABCContext) : null;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [well, setWell] = useState(null);

    const handleClick = async () => {
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

    // console.log("DEBUG -- leftBottom:", leftBottom);
    // console.log("DEBUG -- rightTop:", rightTop);
    // console.log("DEBUG -- middle (percentage):", middle);


    return (
        <>
            <div className={cardClasses} onClick={handleClick}>
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
            {isModalOpen && well && (
                <Modal onClose={() => setIsModalOpen(false)}>
                    <WellPassport well={well} />
                </Modal>
            )}
        </>
    );
}