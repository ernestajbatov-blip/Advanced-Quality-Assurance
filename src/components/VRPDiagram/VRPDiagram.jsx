import React from "react";
import styles from "./VRPDiagram.module.css";
import Box from "../Box/Box";
import { NavLink } from "react-router-dom";

export default function VRPDiagram({ filteredWells, boxIndex }) {
  // Change from 4 to 5 boxes
  const boxes = new Array(5).fill(null);
  
  filteredWells.forEach((well) => {
    // Make sure otvod is within bounds (1-5)
    if (well.otvod >= 1 && well.otvod <= 5) {
      boxes[well.otvod - 1] = well;
    }
  });

  const getPipeColor = (index, defaultColor = "#50505a") =>
    index === boxIndex ? "#4caf50" : defaultColor;

  // You may need to adjust pipe positions for 5 boxes
  const pipes = [
    { x1: 116, y1: 165, x2: 116, y2: 305 },
    { x1: 380, y1: 165, x2: 380, y2: 305 },
    { x1: 648, y1: 165, x2: 648, y2: 305 },
    { x1: 918, y1: 165, x2: 918, y2: 305 },
    { x1: 1181, y1: 165, x2: 1181, y2: 305 }, // 5th box pipe
    // { x1: 1445, y1: 165, x2: 1445, y2: 305 },
    // { x1: 1713, y1: 165, x2: 1713, y2: 305 },
    // { x1: 116, y1: 693, x2: 116, y2: 563 },
    // { x1: 380, y1: 693, x2: 380, y2: 563 },
    // { x1: 648, y1: 693, x2: 648, y2: 563 },
    // { x1: 918, y1: 693, x2: 918, y2: 563 },
    // { x1: 1181, y1: 693, x2: 1181, y2: 563 },
    // { x1: 1445, y1: 693, x2: 1445, y2: 563 },
    // { x1: 1713, y1: 693, x2: 1713, y2: 563 },
  ];

  return (
    <div className={styles.container}>
      <svg
        className="svgImage"
        viewBox="60 -5 1700 900"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Vertical Pipes */}
        {pipes.map((pipe, index) => (
          <line
            key={`v${index}`}
            x1={pipe.x1}
            y1={pipe.y1}
            x2={pipe.x2}
            y2={pipe.y2}
            stroke={getPipeColor(index)}
            strokeWidth="3"
          />
        ))}
        {/* Diagonal Pipes */}
        {pipes.map((pipe, index) => (
          <line
            key={`d${index}`}
            x1="918"
            y1="438"
            x2={pipe.x2}
            y2={pipe.y2}
            stroke={getPipeColor(index)}
            strokeWidth="2"
          />
        ))}
        {/* Center Circle */}
        <ellipse cx="918" cy="438" rx="120" ry="120" fill="#50505a" />
      </svg>
      <div className={styles.overlay}>
        {boxes.map((well, index) => (
          <Box
            key={index}
            boxText1={well?.well || ""}
            boxText2={well?.tr_fluid?.toFixed(2) || ""}
            top={index < 5 ? "5%" : "75%"} // Adjust condition for 5 boxes
            left={`${10 + (index % 5) * 139}px`} // Adjust modulo for 5 boxes
            number={index + 1}
            borderColor={getPipeColor(index, "#FFFFFF")}
          />
        ))}
        {/* Central circle data */}
        <div className={styles.circle} style={{ top: "49%", left: "50.5%" }}>
          <div className={styles.circleText}>0 М³/СУТ</div>
          <div className={styles.circleSubText}>0 мПа</div>
        </div>
        {/* Line and additional box */}
        <div className={styles.line} style={{ top: "48.5%", left: "57.5%" }}></div>
        <NavLink to="/scheme">
          <Box boxText1="на ППН" top="44.5%" left="90%" />
        </NavLink>
      </div>
    </div>
  );
}