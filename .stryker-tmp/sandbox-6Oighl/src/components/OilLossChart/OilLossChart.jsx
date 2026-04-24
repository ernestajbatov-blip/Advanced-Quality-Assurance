// @ts-nocheck
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
  // Simply pass through the chart data from parent - all calculations done there
  const processedData = useMemo(() => {
    return chartData || [];
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