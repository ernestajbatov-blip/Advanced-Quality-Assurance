import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  LabelList,
} from "recharts";

export default function OilLossChart({ chartData, selectedWell, startDate, endDate }) {
  // Default data for when no chart data is available
  const defaultData = [
    { name: "QH0", Δ: 72.4, pv: 0 },
    { name: "ΔQH(t)", Δ: -9.8, pv: 72.4 },
    { name: "ΔQH(N)", Δ: -13.4, pv: 62.6 },
    { name: "ΔQH(qж)", Δ: 3.0, pv: 49.2 },
    { name: "QH1", Δ: 52.2, pv: 0 },
  ];

  // Process chart data from parent component
  const processedData = useMemo(() => {
    // If no chartData is provided, use default data
    if (!chartData || chartData.length === 0) {
      return defaultData;
    }

    // Convert chartData to the format expected by the chart
    // Assuming chartData comes in the format: [{ name, value, well }, ...]
    const chartItems = chartData.map(item => ({
      name: item.name,
      Δ: item.value,
      pv: 0 // Will be calculated below
    }));

    // Calculate cumulative values (pv) for stacked bar chart
    let cumulative = 0;
    chartItems.forEach((item, index) => {
      if (index === 0) {
        item.pv = 0;
        cumulative = item.Δ;
      } else if (index === chartItems.length - 1) {
        item.pv = 0;
      } else {
        item.pv = cumulative;
        cumulative += item.Δ;
      }
    });

    return chartItems;
  }, [chartData]);

  return (
    <BarChart width={600} height={400} data={processedData}>
      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
      <XAxis dataKey="name" />
      <YAxis />
      <Bar dataKey="pv" stackId="a" fill="transparent" />
      <Bar dataKey="Δ" stackId="a">
        {processedData.map((item, index) => {
          const isDefaultColor = index === 0 || index === processedData.length - 1;
          return (
            <Cell
              key={`cell-${index}`}
              fill={
                isDefaultColor ? "#8884d8" : item.Δ < 0 ? "#B22222" : "#228B22"
              }
            />
          );
        })}
        <LabelList
          dataKey="Δ"
          position="top"
          formatter={(value) => value.toFixed(1)}
          fill="#fff"
        />
      </Bar>
    </BarChart>
  );
}