// @ts-nocheck
// Grid.jsx:
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
  fond,
  chrpFilter,
  chartType,
  statusFilter
}) {
  return (
    <div className={styles.gridContainer}>
      {wells.map((well, index) => {
        const wellValues = {
          leftTop: well[fieldMappings.leftTop],
          rightTop: fond === 0 
            ? well[fieldMappings.rightTop] * 0.87 
            : well[fieldMappings.rightTop],
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
        
        // Only show working status for ЧРП wells (type === 1)
        const shouldShowWorkingStatus = !hideWorkingStatus && well.type === 1;
        
        return (
          <WellCard
            key={index}
            leftTop={wellValues.leftTop}
            rightTop={wellValues.rightTop}
            middle={calculatedMiddleValue}
            leftBottom={wellValues.leftBottom}
            rightBottom={wellValues.rightBottom}
            wells={wells}
            well={well}
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
            hideWorkingStatus={!shouldShowWorkingStatus}
            wellStopped={wellStopped}
            fond={fond}
            chartType={chartType}
            statusFilter={statusFilter}
          />
        );
      })}
    </div>
  );
}