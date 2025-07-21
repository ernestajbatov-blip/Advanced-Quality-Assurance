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
  // Process chart data from parent component
  const processedData = useMemo(() => {
    // If no chartData is provided, return empty array
    if (!chartData || chartData.length === 0) {
      return [];
    }

    // Convert chartData to the format expected by the chart
    const chartItems = chartData.map(item => ({
      name: item.name,
      Δ: item.value,
      pv: 0, // Will be calculated below
      type: item.type
    }));

    // Calculate cumulative values (pv) for stacked bar chart
    let cumulative = 0;
    chartItems.forEach((item, index) => {
      if (index === 0) {
        // First item (initial production)
        item.pv = 0;
        cumulative = item.Δ;
      } else if (index === chartItems.length - 1) {
        // Last item (final production)
        item.pv = 0;
      } else {
        // Middle items (changes)
        item.pv = cumulative;
        cumulative += item.Δ;
      }
    });

    return chartItems;
  }, [chartData]);

  // Get unit for tooltip based on item type
  const getUnit = (type) => {
    switch (type) {
      case "initial":
      case "final":
        return "м³";
      case "workTime":
        return "ч";
      case "waterCut":
        return "%";
      case "fluid":
        return "м³";
      default:
        return "";
    }
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const unit = getUnit(data.type);
      
      return (
        <div style={{
          backgroundColor: "#333",
          border: "1px solid #666",
          borderRadius: "4px",
          padding: "10px",
          color: "#ccc"
        }}>
          <p style={{ margin: 0, fontWeight: "bold" }}>{label}</p>
          <p style={{ margin: "5px 0 0 0" }}>
            Значение: {data.Δ.toFixed(2)} {unit}
          </p>
          {data.type === "workTime" && (
            <p style={{ margin: "5px 0 0 0", fontSize: "12px" }}>
              Изменение времени работы
            </p>
          )}
          {data.type === "waterCut" && (
            <p style={{ margin: "5px 0 0 0", fontSize: "12px" }}>
              Изменение обводненности
            </p>
          )}
          {data.type === "fluid" && (
            <p style={{ margin: "5px 0 0 0", fontSize: "12px" }}>
              Изменение дебита жидкости
            </p>
          )}
          {data.type === "initial" && (
            <p style={{ margin: "5px 0 0 0", fontSize: "12px" }}>
              Начальная добыча нефти
            </p>
          )}
          {data.type === "final" && (
            <p style={{ margin: "5px 0 0 0", fontSize: "12px" }}>
              Конечная добыча нефти
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Get color based on item type and value
  const getBarColor = (item, index) => {
    if (item.type === "initial" || item.type === "final") {
      return "#8884d8"; // Blue for initial and final values
    }
    return item.Δ < 0 ? "#B22222" : "#228B22"; // Red for negative, green for positive
  };

  // Get Y-axis label based on data types
  const getYAxisLabel = () => {
    // Since we have mixed units, we'll use a general label
    return "Значения";
  };

  return (
    <div style={{ 
      width: "100%", 
      height: "450px",
      backgroundColor: "#1a1a1a",
      padding: "40px",
      borderRadius: "12px",
      border: "1px solid #333",
      position: "relative",
      margin: "0 auto",
      maxWidth: "1200px"
    }}
    >
      <h3 style={{ 
        color: "#ccc", 
        textAlign: "center", 
        marginBottom: "30px",
        fontSize: "18px",
        margin: "0 0 30px 0"
      }}>
        Анализ изменений добычи нефти
        {selectedWell !== "all" && (
          <span style={{ fontSize: "14px", color: "#888", display: "block" }}>
            Скважина: {selectedWell}
          </span>
        )}
        <span style={{ fontSize: "12px", color: "#999", display: "block", marginTop: "5px" }}>
          Период: {startDate} - {endDate}
        </span>
      </h3>
      
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
                  value: getYAxisLabel(), 
                  angle: -90, 
                  position: 'insideLeft', 
                  style: { textAnchor: 'middle', fill: '#ccc' } 
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Invisible bar for stacking */}
              <Bar dataKey="pv" stackId="a" fill="transparent" />
              
              {/* Main data bar */}
              <Bar dataKey="Δ" stackId="a">
                {processedData.map((item, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getBarColor(item, index)}
                  />
                ))}
                <LabelList
                  dataKey="Δ"
                  position="top"
                  formatter={(value, entry, index) => {
                    // Check if entry exists and has the required properties
                    if (!entry || !entry.payload || !entry.payload.type) {
                      return `${value ? value.toFixed(1) : '0'}`;
                    }
                    const unit = getUnit(entry.payload.type);
                    return `${value.toFixed(1)}${unit}`;
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
          <span>Добыча (м³)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div style={{ width: "12px", height: "12px", backgroundColor: "#228B22" }}></div>
          <span>Положит. изменение</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div style={{ width: "12px", height: "12px", backgroundColor: "#B22222" }}></div>
          <span>Отрицат. изменение</span>
        </div>
      </div>
    </div>
  );
}