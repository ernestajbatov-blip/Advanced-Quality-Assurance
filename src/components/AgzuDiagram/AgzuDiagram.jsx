import React from "react";
import styles from "./AgzuDiagram.module.css";
import Box from "../Box/Box";
import { NavLink } from "react-router-dom";

export default function AgzuDiagram({ filteredWells }) {
  const boxes = new Array(14).fill(null);

  filteredWells.forEach((well) => {
    boxes[well.otvod - 1] = well;
  });

  const getPipeColor = (index) =>
    boxes[index] && boxes[index].tr_fluid > 0 ? "#4caf50" : "#50505a";  

  const pipes = [
    { x1: 116, y1: 165, x2: 116, y2: 305 },
    { x1: 380, y1: 165, x2: 380, y2: 305 },
    { x1: 648, y1: 165, x2: 648, y2: 305 },
    { x1: 918, y1: 165, x2: 918, y2: 305 },
    { x1: 1181, y1: 165, x2: 1181, y2: 305 },
    { x1: 1445, y1: 165, x2: 1445, y2: 305 },
    { x1: 1713, y1: 165, x2: 1713, y2: 305 },

    { x1: 116, y1: 693, x2: 116, y2: 563 },
    { x1: 380, y1: 693, x2: 380, y2: 563 },
    { x1: 648, y1: 693, x2: 648, y2: 563 },
    { x1: 918, y1: 693, x2: 918, y2: 563 },
    { x1: 1181, y1: 693, x2: 1181, y2: 563 },
    { x1: 1445, y1: 693, x2: 1445, y2: 563 },
    { x1: 1713, y1: 693, x2: 1713, y2: 563 },
  ];

  return (
    <div className={styles.container}>
      <svg
        className="svgImage"
        viewBox="75 10 1700 900"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Vertical Pipes (Colored) */}
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

        {/* Diagonal Pipes (Colored) */}
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
            top={index < 7 ? "20px" : "350px"}
            left={`${10 + (index % 7) * 139}px`}
            number={index + 1}
          />
        ))}

        <div className={styles.circle} style={{ top: "58%", left: "74.5%" }}>
          <div className={styles.circleText}>0 М³/СУТ</div>
          <div className={styles.circleSubText}>0 мПа</div>
        </div>
        <div className={styles.line} style={{ top: "57%", left: "84.8%" }}></div>
        <NavLink to="/scheme">
          <Box boxText1="на ППН" top="51.5%" left="134.5%" />
        </NavLink>
      </div>
    </div>
  );
}
