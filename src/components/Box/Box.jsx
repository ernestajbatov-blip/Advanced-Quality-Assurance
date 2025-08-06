import React from "react";
import styles from "./Box.module.css";

export default function Box({
  boxText1, 
  boxText2, 
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
      </div>
      {number ? (
        <div className={styles.boxNumber} style={{ borderColor }}>
          {number}
        </div>
      ) : null}
    </div>
  );
}