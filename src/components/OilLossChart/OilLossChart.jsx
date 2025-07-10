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

export default function OilLossChart({ selectedWell, startDate, endDate }) {
  // Sample data with multiple wells and dates
  const sampleData = [
    {
      well: "Well-A",
      date: "2024-01-15",
      data: [
        { name: "QH0", Δ: 72.4, pv: 0 },
        { name: "ΔQH(t)", Δ: -9.8, pv: 72.4 },
        { name: "ΔQH(N)", Δ: -13.4, pv: 62.6 },
        { name: "ΔQH(qж)", Δ: 3.0, pv: 49.2 },
        { name: "QH1", Δ: 52.2, pv: 0 },
      ]
    },
    {
      well: "Well-B",
      date: "2024-01-20",
      data: [
        { name: "QH0", Δ: 85.6, pv: 0 },
        { name: "ΔQH(t)", Δ: -12.3, pv: 85.6 },
        { name: "ΔQH(N)", Δ: -8.7, pv: 73.3 },
        { name: "ΔQH(qж)", Δ: 1.8, pv: 64.6 },
        { name: "QH1", Δ: 66.4, pv: 0 },
      ]
    },
    {
      well: "Well-C",
      date: "2024-02-10",
      data: [
        { name: "QH0", Δ: 65.2, pv: 0 },
        { name: "ΔQH(t)", Δ: -7.1, pv: 65.2 },
        { name: "ΔQH(N)", Δ: -15.8, pv: 58.1 },
        { name: "ΔQH(qж)", Δ: 4.2, pv: 42.3 },
        { name: "QH1", Δ: 46.5, pv: 0 },
      ]
    },
  ];

  // Default data for when no filters are applied or no data is available
  const defaultData = [
    { name: "QH0", Δ: 72.4, pv: 0 },
    { name: "ΔQH(t)", Δ: -9.8, pv: 72.4 },
    { name: "ΔQH(N)", Δ: -13.4, pv: 62.6 },
    { name: "ΔQH(qж)", Δ: 3.0, pv: 49.2 },
    { name: "QH1", Δ: 52.2, pv: 0 },
  ];

  // Filter and aggregate data based on selected filters
  const filteredData = useMemo(() => {
    // If no filters are provided, use default data
    if (!selectedWell || !startDate || !endDate) {
      return defaultData;
    }

    let filtered = sampleData.filter(item => {
      const itemDate = new Date(item.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const dateInRange = itemDate >= start && itemDate <= end;
      const wellMatches = selectedWell === "all" || item.well === selectedWell;
      
      return dateInRange && wellMatches;
    });

    if (filtered.length === 0) {
      return defaultData;
    }

    // If "all" wells selected, aggregate the data
    if (selectedWell === "all") {
      const aggregated = [
        { name: "QH0", Δ: 0, pv: 0 },
        { name: "ΔQH(t)", Δ: 0, pv: 0 },
        { name: "ΔQH(N)", Δ: 0, pv: 0 },
        { name: "ΔQH(qж)", Δ: 0, pv: 0 },
        { name: "QH1", Δ: 0, pv: 0 },
      ];

      filtered.forEach(item => {
        item.data.forEach((dataPoint, index) => {
          aggregated[index].Δ += dataPoint.Δ;
        });
      });

      // Recalculate pv values for aggregated data
      let cumulative = 0;
      aggregated.forEach((item, index) => {
        if (index === 0) {
          item.pv = 0;
          cumulative = item.Δ;
        } else if (index === aggregated.length - 1) {
          item.pv = 0;
        } else {
          item.pv = cumulative;
          cumulative += item.Δ;
        }
      });

      return aggregated;
    } else {
      // For single well, use the most recent data point
      const latest = filtered[filtered.length - 1];
      return latest ? latest.data : defaultData;
    }
  }, [selectedWell, startDate, endDate]);

  return (
    <BarChart width={600} height={400} data={filteredData}>
      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
      <XAxis dataKey="name" />
      <YAxis />
      <Bar dataKey="pv" stackId="a" fill="transparent" />
      <Bar dataKey="Δ" stackId="a">
        {filteredData.map((item, index) => {
          const isDefaultColor = index === 0 || index === filteredData.length - 1;
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