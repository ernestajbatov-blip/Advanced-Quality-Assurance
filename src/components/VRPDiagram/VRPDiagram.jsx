import React from "react";
import styles from "./VRPDiagram.module.css";
import Box from "../Box/Box";
import { NavLink } from "react-router-dom";

export default function VRPDiagram({ filteredWells }) {
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
        viewBox="80 5 1700 900"
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

      {boxes.map((well, index) => (
        <Box
          key={index}
          boxText1={well?.well || ""}
          boxText2={well?.tr_fluid?.toFixed(2) || ""}
          top={index < 7 ? "20px" : "350px"}
          left={`${1 + (index % 7) * 15}%`}
          number={index + 1}
        />
      ))}

      {/* Central circle data */}
      <div className={styles.circle} style={{ top: "47%", left: "49.6%" }}>
        <div className={styles.circleText}>0 М³/СУТ</div>
        <div className={styles.circleSubText}>0 мПа</div>
      </div>

      {/* Line and additional box */}
      <div className={styles.line} style={{ top: "47.3%", left: "56.4%" }}></div>
      <NavLink to="/scheme">
        <Box boxText1="на ППН" top="43%" left="89%" />
      </NavLink>
    </div>
  );
}
