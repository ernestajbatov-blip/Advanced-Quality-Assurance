import React from "react";
import WellCard from "../WellCard/WellCard";
import styles from "./Grid.module.css";

export default function Grid({
  wells,
  fieldMappings,
  calculateMiddleValue,
  maxThreshold,
  colorMax,
  minThreshold,
  colorMin,
  inBetweenThresholdMin,
  inBetweenColor,
  inBetweenThresholdMax,
  realMiddle,
  onWellClick, // New prop for handling well clicks
  setSelectedWell
}) {
  return (
    <div className={styles.gridContainer}>
      {wells.map((well, index) => {
        // Get values from well object based on field mappings
        const wellValues = {
          leftTop: well[fieldMappings.leftTop],
          rightTop: well[fieldMappings.rightTop],
          middle: well[fieldMappings.middle],
          leftBottom: well[fieldMappings.leftBottom],
          rightBottom: well[fieldMappings.rightBottom]
        };

        // Let the passed function decide how to calculate middle value
        // If no function is provided, use the raw middle value
        const calculatedMiddleValue = typeof calculateMiddleValue === 'function'
          ? calculateMiddleValue(well, wellValues)
          : wellValues.middle;

        // Use raw middle value if realMiddle is true, otherwise use calculated middle value
        const middleValue = realMiddle === true ? wellValues.middle : calculatedMiddleValue;

        return (
        <WellCard
          key={index}
          leftTop={wellValues.leftTop}
          rightTop={wellValues.rightTop}
          middle={calculatedMiddleValue}
          leftBottom={wellValues.leftBottom}
          rightBottom={wellValues.rightBottom}
          wells={wells}
          setSelectedWell={setSelectedWell}
          maxThreshold={maxThreshold}
          colorMax={colorMax}
          minThreshold={minThreshold}
          colorMin={colorMin}
          inBetweenThresholdMin={inBetweenThresholdMin}
          inBetweenColor={inBetweenColor}
          inBetweenThresholdMax={inBetweenThresholdMax}
          realMiddle={middleValue}
          onWellClick={onWellClick}
          working={well.working}
        />

        );
      })}
    </div>
  );
}