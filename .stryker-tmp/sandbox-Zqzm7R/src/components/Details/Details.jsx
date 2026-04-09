// @ts-nocheck
import React from "react";
import styles from "./Details.module.css";

export default function Details({
    leftTop,
    rightTop,
    leftBottom,
    rightBottom,
    showStatusLegend = false,
    showIdleInMain = false,
}) {
    const isVisible = leftTop || rightTop || leftBottom || rightBottom || showStatusLegend || showIdleInMain;
    
    if (!isVisible) {
        return null;
    }
    
    return (
        <div className={styles.detailsContainer}>
            {/* First Row */}
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
                            <div className={styles.rect} style={{backgroundColor: "red"}}></div>
                            <p className={styles.text}>{rightTop}</p>
                        </div>
                    )}
                </div>
            )}
            
            {/* Second Row */}
            {(leftBottom || rightBottom || showStatusLegend) && (
                <div className={styles.row}>
                    {leftBottom && (
                        <div className={styles.textWithRect}>
                            <div className={styles.rect} style={{backgroundColor: "green"}}></div>
                            <p className={styles.text}>{leftBottom}</p>
                        </div>
                    )}
                    {showStatusLegend && (
                        <div className={styles.textWithRect}>
                            <div className={styles.rect} style={{backgroundColor: "#919191"}}></div>
                            <p className={styles.text}>В простое</p>
                        </div>
                    )}
                    {rightBottom && !showStatusLegend && (
                        <div className={styles.textWithRect}>
                            <div className={styles.rect} style={{backgroundColor: "gray"}}></div>
                            <p className={styles.text}>{rightBottom}</p>
                        </div>
                    )}
                </div>
            )}
            
            {/* Third Row - for "В простое" in main category */}
            {showIdleInMain && (
                <div className={styles.row}>
                    <div className={styles.textWithRect}>
                        <div className={styles.rect} style={{backgroundColor: "#919191"}}></div>
                        <p className={styles.text}>В простое</p>
                    </div>
                </div>
            )}
        </div>
    );
}