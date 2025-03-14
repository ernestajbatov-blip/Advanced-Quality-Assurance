import React from "react";
import styles from "./Square.module.css";
import Pump from "../../data/pump.png";

export default function Square({isActive, width, height}) {
    return (
        <div
            className={`${styles.square} ${isActive ? styles.active : ""}`}
            style={{width: width, height: height}}
        >
            <div className={styles.icon}>
                <img
                    src={Pump}
                    alt="Pump Icon"
                />
            </div>
        </div>
    );
}