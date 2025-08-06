import React from "react";
import styles from "./Furnace.module.css";
import peth1 from "../../data/peth1.png";
import peth2 from "../../data/peth2.png";

export default function Furnace({isActive, width, height}) {
  return (
    <div
      className={styles.furnace}
      style={{width: width, height: height}}
    >
      <div className={styles.icon}>
        <img
          src={isActive ? peth2 : peth1}
          alt="Furnace Icon"
        />
      </div>
    </div>
  );
}