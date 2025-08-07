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
  onWellClick,
  setSelectedWell,
  hideWorkingStatus = false,
  isWellStopped,
  fond
}) {
  return (
    <div className={styles.gridContainer}>
      {wells.map((well, index) => {
        const wellValues = {
          leftTop: well[fieldMappings.leftTop],
          rightTop: well[fieldMappings.rightTop],
          middle: well[fieldMappings.middle],
          leftBottom: well[fieldMappings.leftBottom],
          rightBottom: well[fieldMappings.rightBottom]
        };

        const calculatedMiddleValue = typeof calculateMiddleValue === 'function'
          ? calculateMiddleValue(well, wellValues)
          : wellValues.middle;

        const middleValue = realMiddle === true ? wellValues.middle : calculatedMiddleValue;

        let wellStopped = false;
        if (fond === 0 && isWellStopped) {
          wellStopped = isWellStopped(well);
        }

        console.log(`Grid - Well ${wellValues.leftTop}:`, {
          fond: fond,
          nagn: well.nagn,
          wellStopped: wellStopped,
          c_current: well.c_current
        });

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
            hideWorkingStatus={hideWorkingStatus}
            wellStopped={wellStopped}
            fond={fond}
          />
        );
      })}
    </div>
  );
}