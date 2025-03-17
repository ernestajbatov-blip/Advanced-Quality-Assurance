import React from "react";
import styles from "./VRPDiagram.module.css";
import SchemeAGZU from "../../data/Diagrams/SchemeAGZU.svg";
import Box from "../Box/Box";

export default function VRPDiagram({ filteredWells }) {
  // Create an array to hold box data, like in AgzuDiagram
  const boxes = new Array(14).fill(null);

  // Populate the boxes array based on the filteredWells data
  filteredWells.forEach((well) => {
    boxes[well.otvod - 1] = well; // Use well's otvod to position the box
  });

  return (
    <div className={styles.container}>
      <img src={SchemeAGZU} alt="Diagram" className={styles.svgImage} />
      <div className={styles.overlay}>
        {/* Dynamically render boxes based on filteredWells */}
        {boxes.map((well, index) => (
          <Box
            key={index}
            boxText1={well?.well || ""}
            boxText2={well?.tr_fluid?.toFixed(2) || ""}
            top={index < 7 ? "20%" : "75%"} // Adjust top for rows
            left={`${1 + (index % 7) * 15}%`} // Adjust left for columns
            number={index + 1} // Box number (1-based index)
          />
        ))}

        {/* Central circle */}
        <div className={styles.circle} style={{ top: "58%", left: "50%" }}>
          <div className={styles.circleText}>0 М³/СУТ</div>
          <div className={styles.circleSubText}>0 мПа</div>
        </div>

        {/* Line and additional box */}
        <div className={styles.line} style={{ top: "56%", left: "59%" }}></div>
        <Box boxText1="на ППН" top="50%" left="85%" />
      </div>
    </div>
  );
}
