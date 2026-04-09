// @ts-nocheck
import React from "react";
import styles from "./Box.module.css";

export default function Box({
  boxText1, 
  boxText2, 
  boxText3,
  boxText4,
  top, 
  left, 
  number, 
  borderColor,
  onClick,
  style = {}
}) {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
  };

  const containerStyle = {
    top: top, 
    left: left, 
    position: "absolute",
    ...style
  };

  return (
    <div 
      className={styles.boxContainer} 
      style={containerStyle}
      onClick={handleClick}
    >
      <div className={styles.box} style={{ borderColor }}>
        <div className={styles.boxText}>{boxText1}</div>
        <div className={styles.boxText}>{boxText2}</div>
        {boxText3 && <div className={styles.boxText} style={{ fontSize: "8px", opacity: 0.8 }}>{boxText3}</div>}
        {boxText4 && <div className={styles.boxText} style={{ fontSize: "8px", opacity: 0.8 }}>{boxText4}</div>}
      </div>
      {number ? (
        <div className={styles.boxNumber} style={{ borderColor }}>
          {number}
        </div>
      ) : null}
    </div>
  );
}