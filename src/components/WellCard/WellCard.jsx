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
            } catch (err) {
                console.error("Error getting the 'well' data!", err);
            }
        } else {
            return;
        }
    };

    let cardColorClass = styles.grayCard;

    if (middle < 0) {
        cardColorClass = styles.redCard;
    } else if (middle !== 0) {
        const percentageDifference = ((middle - rightTop) / middle) * 100;
        if (percentageDifference > 15 && percentageDifference <= 30) {
            cardColorClass = styles.orangeCard;
        }
    }

    const cardClasses = `${styles.wellCard} ${cardColorClass}`;

    return (
        <>
            <div className={cardClasses} onClick={handleClick}>
                <div className={styles.cardRow}>
                    <span>{leftTop}</span>
                    <span>{rightTop.toFixed(2)}</span>
                </div>
                <h3 className={styles.cardHeader}>{middle.toFixed(1)}</h3>
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