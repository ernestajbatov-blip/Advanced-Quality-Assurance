import React, { act } from "react";
import Square from "../Square/Square";
import styles from "./Pumps.module.css";

export default function Pumps({numberOfSquares, activeIndex, width, height}) {
    return (
        <div className={styles.container}>
            <div className={styles.grid}>
                {Array.from({length: numberOfSquares}).map((_, index) => (
                    <Square
                        key={index}
                        isActive={index === activeIndex}
                        width={width}
                        height={height}
                    />
                ))}
            </div>
        </div>
    );
}