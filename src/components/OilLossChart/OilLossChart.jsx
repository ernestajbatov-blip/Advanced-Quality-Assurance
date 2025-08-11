import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip
} from "recharts";

export default function OilLossChart({ chartData, selectedWell, startDate, endDate }) {
  // Process chart data from parent component into waterfall format
  const processedData = useMemo(() => {
    // If no chartData is provided, return empty array
    if (!chartData || chartData.length === 0) {
      return [];
    }

    // Find initial and final oil production values
    const initialItem = chartData.find(item => item.type === "initial");
    const finalItem = chartData.find(item => item.type === "final");
    const workTimeItem = chartData.find(item => item.type === "workTime");
    const waterCutItem = chartData.find(item => item.type === "waterCut");
    const fluidItem = chartData.find(item => item.type === "fluid");

    if (!initialItem || !finalItem) {
      return [];
    }

    const initialOil = initialItem.value;
    const finalOil = finalItem.value;
    const totalChange = finalOil - initialOil;
    
    // Get the raw contribution values (these should represent the actual oil tonnage impact)
    const workTimeContribution = workTimeItem ? workTimeItem.value : 0;
    const waterCutContribution = waterCutItem ? waterCutItem.value : 0;
    const fluidContribution = fluidItem ? fluidItem.value : 0;
    
    // Calculate the residual/unexplained change
    const explainedChange = workTimeContribution + waterCutContribution + fluidContribution;
    const residualChange = totalChange - explainedChange;

    // Create waterfall chart data
    const waterfallData = [];
    let runningTotal = initialOil;
    
    // 1. Initial production (starting point)
    waterfallData.push({
      name: "Начальная добыча",
      value: initialOil,
      cumulative: initialOil,
      base: 0,
      type: "initial",
      displayValue: initialOil,
      isTotal: true
    });

    // 2. Work time impact
    waterfallData.push({
      name: "Время работы",
      fullName: "Влияние времени работы",
      value: Math.abs(workTimeContribution),
      cumulative: runningTotal + workTimeContribution,
      base: workTimeContribution >= 0 ? runningTotal : runningTotal + workTimeContribution,
      type: "change",
      displayValue: workTimeContribution,
      isTotal: false
    });
    runningTotal += workTimeContribution;

    // 3. Water cut impact  
    waterfallData.push({
      name: "Обводненность",
      fullName: "Влияние обводненности",
      value: Math.abs(waterCutContribution),
      cumulative: runningTotal + waterCutContribution,
      base: waterCutContribution >= 0 ? runningTotal : runningTotal + waterCutContribution,
      type: "change",
      displayValue: waterCutContribution,
      isTotal: false
    });
    runningTotal += waterCutContribution;

    // 4. Fluid rate impact
    waterfallData.push({
      name: "Дебит жидкости",
      fullName: "Влияние дебита жидкости",
      value: Math.abs(fluidContribution),
      cumulative: runningTotal + fluidContribution,
      base: fluidContribution >= 0 ? runningTotal : runningTotal + fluidContribution,
      type: "change",
      displayValue: fluidContribution,
      isTotal: false
    });
    runningTotal += fluidContribution;

    // 5. Add residual if significant (> 1% of total change or > 0.1 tonnes)
    if (Math.abs(residualChange) > Math.max(Math.abs(totalChange) * 0.01, 0.1)) {
      waterfallData.push({
        name: "Прочие факторы",
        fullName: "Прочие факторы",
        value: Math.abs(residualChange),
        cumulative: runningTotal + residualChange,
        base: residualChange >= 0 ? runningTotal : runningTotal + residualChange,
        type: "change",
        displayValue: residualChange,
        isTotal: false
      });
      runningTotal += residualChange;
    }

    // 6. Final production
    waterfallData.push({
      name: "Конечная добыча",
      value: finalOil,
      cumulative: finalOil,
      base: 0,
      type: "final",
      displayValue: finalOil,
      isTotal: true
    });

    return waterfallData;
  }, [chartData]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      
      return (
        <div style={{
          backgroundColor: "#333",
          border: "1px solid #666",
          borderRadius: "4px",
          padding: "10px",
          color: "#ccc"
        }}>
          <p style={{ margin: 0, fontWeight: "bold" }}>{data.fullName || label}</p>
          <p style={{ margin: "5px 0 0 0" }}>
            {data.isTotal 
              ? `${data.displayValue.toFixed(2)} т`
              : `${data.displayValue.toFixed(2)} т`
            }
          </p>
        </div>
      );
    }
    return null;
  };

  // Get color based on item type and value
  const getBarColor = (item) => {
    if (item.isTotal) {
      return "#8884d8"; // Blue for initial and final values
    }
    return item.displayValue < 0 ? "#B22222" : "#228B22"; // Red for negative, green for positive
  };

  return (
    <div 
      style={{ 
        width: "700px", 
        height: "500px",
        position: "relative"
      }}
    >
      {processedData.length > 0 ? (
        <div style={{ height: "calc(100% - 60px)" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#ccc', fontSize: 11 }}
                axisLine={{ stroke: '#666' }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fill: '#ccc', fontSize: 12 }}
                axisLine={{ stroke: '#666' }}
                label={{ 
                  value: 'Добыча нефти (т)', 
                  angle: -90, 
                  position: 'insideLeft', 
                  style: { textAnchor: 'middle', fill: '#ccc' } 
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Base bars for positioning floating bars */}
              <Bar 
                dataKey="base" 
                stackId="stack" 
                fill="transparent" 
                isAnimationActive={false}
              />
              
              {/* Actual visible bars */}
              <Bar dataKey="value" stackId="stack">
                {processedData.map((item, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getBarColor(item)}
                  />
                ))}
                <LabelList
                  dataKey="displayValue"
                  position="top"
                  formatter={(value, entry, index) => {
                    // Safe check for entry and entry.payload
                    if (!entry || !entry.payload) {
                      return `${value.toFixed(1)}т`;
                    }
                    
                    if (entry.payload.isTotal) {
                      return `${value.toFixed(1)}т`;
                    } else {
                      return `${value >= 0 ? '+' : ''}${value.toFixed(1)}т`;
                    }
                  }}
                  fill="#fff"
                  fontSize={11}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "calc(100% - 60px)",
          color: "#888",
          fontSize: "18px",
          textAlign: "center"
        }}>
          Нет данных для выбранного периода времени
        </div>
      )}
      
      {/* Legend */}
      <div style={{
        position: "absolute",
        bottom: "10px",
        right: "10px",
        display: "flex",
        gap: "15px",
        fontSize: "11px",
        color: "#ccc"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div style={{ width: "12px", height: "12px", backgroundColor: "#8884d8" }}></div>
          <span>Добыча (т)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div style={{ width: "12px", height: "12px", backgroundColor: "#228B22" }}></div>
          <span>Положит. влияние</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div style={{ width: "12px", height: "12px", backgroundColor: "#B22222" }}></div>
          <span>Отрицат. влияние</span>
        </div>
      </div>
    </div>
  );
}