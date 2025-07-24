import React from "react";
import styles from "./AgzuDiagram.module.css";
import Box from "../Box/Box";
import { NavLink } from "react-router-dom";

export default function AgzuDiagram({ filteredWells, boxIndex }) {
  const boxes = Array(14).fill(null);

  filteredWells.forEach((well) => {
    if (well.otvod >= 1 && well.otvod <= 14) {
      boxes[well.otvod - 1] = well;
    }
  });

  const getPipeColor = (index, defaultColor = "#50505a") =>
    index === boxIndex ? "#4caf50" : defaultColor;

  const pipes = Array.from({ length: 14 }, (_, i) => ({
    x1: 116 + i % 7 * 264,
    y1: i < 7 ? 130 : 720,
    x2: 116 + i % 7 * 264,
    y2: i < 7 ? 305 : 563,
  }));

  return (
    <div className={styles.container}>
      <svg className="svgImage" viewBox="60 -40 1700 900" xmlns="http://www.w3.org/2000/svg">
        {/* Vertical Pipes */}
        {pipes.map((pipe, index) => (
          <line key={`v${index}`} {...pipe} stroke={getPipeColor(index)} strokeWidth="3" />
        ))}

        {/* Diagonal Pipes */}
        {pipes.map((pipe, index) => (
          <line key={`d${index}`} x1="918" y1="438" x2={pipe.x2} y2={pipe.y2} stroke={getPipeColor(index)} strokeWidth="2" />
        ))}

        {/* Center Circle */}
        <ellipse cx="918" cy="438" rx="120" ry="120" fill="#50505a" />
      </svg>

      <div className={styles.overlay}>
        {boxes.map((well, index) => (
          <Box
            key={index}
            boxText1={well?.well || ""}
            boxText2={well?.tr_fluid != null ? well.tr_fluid.toFixed(2) : ""}
            top={index < 7 ? "5%" : "100%"}
            left={`${10 + (index % 7) * 135}px`}
            number={index + 1}
            borderColor={getPipeColor(index, "#FFFFFF")}
          />
        ))}

        <div className={styles.circle} style={{ top: "63.5%", left: "75.5%" }}>
          <div className={styles.circleText}>0 М³/СУТ</div>
          <div className={styles.circleSubText}>0 мПа</div>
        </div>
        <div className={styles.line} style={{ top: "62.5%", left: "86.3%" }}></div>
        <NavLink to="/scheme">
          <Box boxText1="на ППН" top="58.3%" left="136%" />
        </NavLink>
      </div>
    </div>
  );
}
