import React from "react";
import styles from "./Legends.module.css";

export default function Legends({
    leftTop,
    rightTop,
    middle,
    leftBottom,
    rightBottom,
}) {
    return (
        <div className={styles.legendsContainer}>
            <div className={styles.legendsSection}>
                <p className={styles.legendsText}>{leftTop}</p>
                <p className={styles.legendsText}>{leftBottom}</p>
            </div>
            <div className={styles.legendsDivider}></div>
            <div className={styles.legendsSection}>
                <p className={styles.legendsText}>{middle}</p>
            </div>
            <div className={styles.legendsDivider}></div>
            <div className={styles.legendsSection}>
                <p className={styles.legendsText}>{rightTop}</p>
                <p className={styles.legendsText}>{rightBottom}</p>
            </div>
        </div>
    );
}