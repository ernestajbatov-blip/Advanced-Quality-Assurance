import React from "react";
import styles from "./Details.module.css";

export default function Details({
    leftTop,
    rightTop,
    leftBottom,
    rightBottom,
}) {
    const isVisible = leftTop || rightTop || leftBottom || rightBottom;

    if (!isVisible) {
        return null;
    }

    return (
        <div className={styles.detailsContainer}>
            {(leftTop || rightTop) && (
                <div className={styles.row}>
                    {leftTop && (
                        <div className={styles.textWithRect}>
                            <div className={styles.rect} style={{backgroundColor: "orange"}}></div>
                            <p className={styles.text}>{leftTop}</p>
                        </div>    
                    )}
                    {rightTop && (
                        <div className={styles.textWithRect}>
                            <div className={styles.rect} style={{backgroundColor: "green"}}></div>
                            <p className={styles.text}>{rightTop}</p>
                        </div>
                    )}
                </div>
            )}
            {(leftBottom || rightBottom) && (
                <div className={styles.row}>
                    {leftBottom && (
                        <div className={styles.textWithRect}>
                            <div className={styles.rect} style={{backgroundColor: "red"}}></div>
                            <p className={styles.text}>{leftBottom}</p>
                        </div>
                    )}
                    {rightBottom && (
                        <div className={styles.textWithRect}>
                            <div className={styles.rect} style={{backgroundColor: "gray"}}></div>
                            <p className={styles.text}>{rightBottom}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}