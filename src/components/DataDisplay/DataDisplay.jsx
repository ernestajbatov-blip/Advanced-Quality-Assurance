import React, { useState } from "react";
import { fetchLast10Wells } from "../../axios/wellService";
import styles from "./DataDisplay.module.css";
import PumpIcon from "../../assets/pump_icon.png";
import Modal from "../../components/Modal/Modal";
import ResponsiveTable from "../../components/ResponsiveTable/ResponsiveTable";

export default function DataDisplay({ label, value, clickable = false }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [data, setData] = useState([]);

    const handleClick = async () => {
        if (!clickable) return;
        try {
            const response = await fetchLast10Wells();
            setData(response.data);
            setIsModalOpen(true);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    return (
        <>
            <div
                className={styles.container}
                onClick={handleClick}
                style={{ cursor: clickable ? "pointer" : "default" }}
            >
                <div className={styles.iconContainer}>
                    <img src={PumpIcon} alt="Pump Icon" className={styles.icon} />
                </div>
                <div className={styles.textContainer}>
                    <div className={styles.label}>{label}</div>
                    <div className={styles.value}>{value}</div>
                </div>
            </div>

            {isModalOpen && (
                <Modal onClose={() => setIsModalOpen(false)}>
                    <ResponsiveTable data={data} />
                </Modal>
            )}
        </>
    );
}
