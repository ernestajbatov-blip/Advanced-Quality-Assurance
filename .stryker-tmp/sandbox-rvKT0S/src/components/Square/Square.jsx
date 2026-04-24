// @ts-nocheck
import React from "react";
import styles from "./Square.module.css";
import Pump from "../../data/pump.png";

export default function Square({isActive, width, height, showLabel = false, label = "", fontSize = 10}) {
    return (
        <div
            className={`${styles.square} ${isActive ? styles.active : ""}`}
            style={{width: width, height: height}}
        >
            {showLabel ? (
                <div className={styles.label} style={{fontSize: `${fontSize}px`}}>
                    {label}
                </div>
            ) : (
                <div className={styles.icon}>
                    <img
                        src={Pump}
                        alt="Pump Icon"
                    />
                </div>
            )}
        </div>
    );
}