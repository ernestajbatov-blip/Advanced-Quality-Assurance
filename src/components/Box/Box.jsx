import React from "react";
import styles from "./Box.module.css";

export default function Box({boxText1, boxText2, top, left, number, borderColor}) {
    return (
        <div className={styles.boxContainer} style={{top: top, left: left, position: "absolute"}}>
            <div className={styles.box} style={{ borderColor }}>
                <div className={styles.boxText}>{boxText1}</div>
                <div className={styles.boxText}>{boxText2}</div>
            </div>
            {number ? <div className={styles.boxNumber} style={{ borderColor }}>
                {number}</div> : null}
        </div>
    );
}