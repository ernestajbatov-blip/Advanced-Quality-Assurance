import React, { useState, useMemo } from "react";
import OilLossChart from "../../components/OilLossChart/OilLossChart";
import AppNav from "../../components/AppNav/AppNav";
import OilMap from "../../components/Map/OilMap";
import styles from "./OilLayout.module.css";

export default function OilLayout() {
  const [selectedWell, setSelectedWell] = useState("all");
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2024-12-31");

  // Sample data for multiple wells and dates
  const allTableData = {
    "BSK_0002": {
      "2024-01-15": [
        ["Нач. добыча", "150", "-13", "7", "-11", "133"],
        ["0", "150", "137", "144", "133"],
        ["150", "137", "144", "133", "266"],
        ["Мин", "0", "137", "137", "133", "0"],
        ["Макс", "150", "150", "144", "144", "133"],
      ]
    },
    "BSK_0003": {
      "2024-01-20": [
        ["Нач. добыча", "140", "-15", "8", "-10", "123"],
        ["0", "140", "125", "133", "123"],
        ["140", "125", "133", "123", "246"],
        ["Мин", "0", "125", "125", "123", "0"],
        ["Макс", "140", "140", "133", "133", "123"],
      ]
    },
    "BSK_0004": {
      "2024-02-10": [
        ["Нач. добыча", "160", "-12", "5", "-8", "145"],
        ["0", "160", "148", "153", "145"],
        ["160", "148", "153", "145", "305"],
        ["Мин", "0", "148", "148", "145", "0"],
        ["Макс", "160", "160", "153", "153", "145"],
      ]
    },
  };

  const tableHeaders = [
    "Нач. добыча",
    "За счет вр. работы",
    "За счет обвод-ти",
    "За счет дебита жидк.",
    "Конеч. добыча",
  ];

  // Get unique wells for the dropdown
  const uniqueWells = useMemo(() => {
    return Object.keys(allTableData).sort();
  }, []);

  // Filter table data based on selected filters
  const filteredTableData = useMemo(() => {
    if (selectedWell === "all") {
      // Aggregate all data for all wells
      const aggregated = [
        ["Нач. добыча", "0", "0", "0", "0", "0"],
        ["0", "0", "0", "0", "0"],
        ["0", "0", "0", "0", "0"],
        ["Мин", "0", "0", "0", "0", "0"],
        ["Макс", "0", "0", "0", "0", "0"],
      ];

      Object.keys(allTableData).forEach(well => {
        Object.keys(allTableData[well]).forEach(date => {
          const wellDate = new Date(date);
          const start = new Date(startDate);
          const end = new Date(endDate);
          
          if (wellDate >= start && wellDate <= end) {
            const data = allTableData[well][date];
            data.forEach((row, rowIndex) => {
              if (rowIndex === 0) { // "Нач. добыча" row
                row.forEach((cell, cellIndex) => {
                  if (cellIndex > 0) { // Skip first column (labels)
                    aggregated[rowIndex][cellIndex] = 
                      (parseInt(aggregated[rowIndex][cellIndex]) + parseInt(cell)).toString();
                  }
                });
              }
            });
          }
        });
      });

      return aggregated;
    } else {
      // Find data for selected well within date range
      const wellData = allTableData[selectedWell];
      if (!wellData) return [];

      const validDates = Object.keys(wellData).filter(date => {
        const wellDate = new Date(date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return wellDate >= start && wellDate <= end;
      });

      if (validDates.length === 0) return [];

      // Return the most recent data
      const latestDate = validDates.sort().reverse()[0];
      return wellData[latestDate];
    }
  }, [selectedWell, startDate, endDate, allTableData]);

  return (
    <div style={{ width: "100%" }}>
      <AppNav />
      
      {/* Filters Section */}
      <div style={{ 
        padding: "20px", 
        backgroundColor: "dark grey", 
        borderBottom: "1px solid dark grey",
        display: "flex",
        gap: "20px",
        alignItems: "center",
        flexWrap: "wrap"
      }}>
        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Выбрать скважину:
          </label>
          <select
            value={selectedWell}
            onChange={(e) => setSelectedWell(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "14px"
            }}
          >
            <option value="all">Все</option>
            {uniqueWells.map(well => (
              <option key={well} value={well}>{well}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Начало:
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "14px"
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Конец:
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "14px"
            }}
          />
        </div>
      </div>

      <div className={styles.flexContainer}>
        <div style={{ flex: 1 }}>
          <OilLossChart 
            selectedWell={selectedWell}
            startDate={startDate}
            endDate={endDate}
          />
        </div>
        
        {filteredTableData.length > 0 ? (
          <table className={styles.oilLossTable}>
            <thead>
              <tr>
                {tableHeaders.map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTableData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ 
            flex: 1, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            color: "#666",
            fontSize: "16px"
          }}>
            Нет данных для данного периода
          </div>
        )}
      </div>
      
      <div className={styles.mapSection}>
        <OilMap />
      </div>
    </div>
  );
}