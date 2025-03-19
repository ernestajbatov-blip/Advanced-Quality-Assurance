import React from "react";
import styles from "./VRPDiagram.module.css";
import SchemeAGZU from "../../data/Diagrams/SchemeAGZU.svg";
import Box from "../Box/Box";
import { NavLink } from "react-router-dom";

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
            top={index < 7 ? "20px" : "350px"} // Adjust top for rows
            left={`${1 + (index % 7) * 15}%`} // Adjust left for columns
            number={index + 1} // Box number (1-based index)
          />
        ))}

        {/* Central circle */}
        <div className={styles.circle} style={{ top: "47%", left: "50%" }}>
          <div className={styles.circleText}>0 М³/СУТ</div>
          <div className={styles.circleSubText}>0 мПа</div>
        </div>

        {/* Line and additional box */}
        <div className={styles.line} style={{ top: "47%", left: "58.5%" }}></div>
        <NavLink to="/scheme">
        <Box boxText1="на ППН" top="43%" left="90%"/>
        </NavLink>
      </div>
    </div>
  );
}
