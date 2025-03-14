import React from "react";
import styles from "./AgzuDiagram.module.css";
import SchemeAGZU from "../../data/Diagrams/SchemeAGZU.svg";
import Box from "../Box/Box";

export default function AgzuDiagram({filteredWells}) {
    const boxes = new Array(14).fill(null);

    filteredWells.forEach((well) => {
        boxes[well.otvod - 1] = well;
    });

    return (
        <div className={styles.container}>
            <img src={SchemeAGZU} alt="Diagram" className={styles.svgImage} />
            <div className={styles.overlay}>
                {boxes.map((well, index) => (
                    <Box
                        key={index}
                        boxText1={well?.well || ""}
                        boxText2={well?.tr_fluid?.toFixed(2) || ""}
                        top={index < 8 ? "80px" : "290px"}
                        left={`${10 + (index % 7) * 102}px`}
                        number={index + 1}
                    />
                ))}

                <div className={styles.circle} style={{top: "58%", left: "58%"}}>
                    <div className={styles.circleText}>
                        0 М³/СУТ
                    </div>
                    <div className={styles.circleSubText}>
                        0 мПа
                    </div>
                </div>
                <div
                    className={styles.line}
                    style={{top: "220px", left: "410px"}}
                ></div>
                <Box boxText1="на ППН" top="200px" left="600px" />
            </div>
        </div>
    );
}