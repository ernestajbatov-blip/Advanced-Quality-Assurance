import React, { useState, useEffect } from "react";
import styles from "./AgzuDiagram.module.css";
import Box from "../Box/Box";
import { NavLink } from "react-router-dom";

export default function AgzuDiagram({ filteredWells, boxIndex }) {
  const [centerData, setCenterData] = useState({
    pressure: 0,
    time: "00:00",
    temperature: 0
  });

  // Generate random data on component mount and update periodically
  useEffect(() => {
    const generateRandomData = () => {
      const now = new Date();
      return {
        pressure: (Math.random() * 10).toFixed(1), // Random pressure 0-10 МПа
        time: now.toLocaleTimeString('ru-RU', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        temperature: Math.floor(Math.random() * 50 + 10) // Random temp 10-60°C
      };
    };

    // Set initial random data
    setCenterData(generateRandomData());

    // Update data every 30 seconds (optional - remove if you don't want periodic updates)
    const interval = setInterval(() => {
      setCenterData(generateRandomData());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

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
      <svg className="svgImage" viewBox="60 -30 1700 900" xmlns="http://www.w3.org/2000/svg">
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
        <div className={styles.circle} style={{ top: "63.5%", left: "76%" }}>
          <div className={styles.circleText}>{centerData.pressure} МПа</div>
          <div className={styles.circleText}>{centerData.time}</div>
          <div className={styles.circleText}>{centerData.temperature} °C</div>
        </div>
        <div className={styles.line} style={{ top: "62%", left: "86.3%" }}></div>
        <NavLink to="/scheme">
          <Box boxText1="на УПН" top="57.5%" left="135%" />
        </NavLink>
      </div>
    </div>
  );
}