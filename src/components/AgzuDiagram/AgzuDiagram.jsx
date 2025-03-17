import React from "react";
import styles from "./AgzuDiagram.module.css";
import SchemeAGZU from "../../data/Diagrams/SchemeAGZU.svg";
import Box from "../Box/Box"; // Import the Box component

export default function AgzuDiagram({ filteredWells }) {
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
            top={index < 7 ? "20px" : "360px"} // Adjust top in percentages
            left={`${10 + (index % 7) * 139}px`} // Use percentage for horizontal positioning
            number={index + 1} // Box number (1-based index)
          />
        ))}

        <div className={styles.circle} style={{ top: "58%", left: "76%" }}>
          <div className={styles.circleText}>0 М³/СУТ</div>
          <div className={styles.circleSubText}>0 мПа</div>
        </div>
        <div
          className={styles.line}
          style={{ top: "225px", left: "539px" }}
        ></div>
        <Box boxText1="на ППН" top="207px" left="800px" />
      </div>
    </div>
  );
}
