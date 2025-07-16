import React, { useState, useMemo, useRef, useEffect } from "react";
import OilLossChart from "../../components/OilLossChart/OilLossChart";
import AppNav from "../../components/AppNav/AppNav";
import OilMap from "../../components/Map/OilMap";
import styles from "./OilLayout.module.css";

export default function OilLayout() {
  const [selectedWell, setSelectedWell] = useState("all");
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2024-12-31");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  // Filter wells based on search term
  const filteredWells = useMemo(() => {
    if (!searchTerm) return uniqueWells;
    return uniqueWells.filter(well => 
      well.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [uniqueWells, searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle well selection
  const handleWellSelect = (well) => {
    setSelectedWell(well);
    setSearchTerm("");
    setIsDropdownOpen(false);
  };

  // Get display text for selected well
  const getDisplayText = () => {
    if (selectedWell === "all") return "Все";
    return selectedWell;
  };

  // Filter table data based on selected filters - MOVED BEFORE chartData
  const filteredTableData = useMemo(() => {
    if (selectedWell === "all") {
      // Aggregate all data for all wells
      const aggregated = [
        ["Нач. добыча", 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        ["Мин", 0, 0, 0, 0, 0],
        ["Макс", 0, 0, 0, 0, 0],
      ];

      Object.keys(allTableData).forEach(well => {
        Object.keys(allTableData[well]).forEach(date => {
          const wellDate = new Date(date);
          const start = new Date(startDate);
          const end = new Date(endDate);
          
          if (wellDate >= start && wellDate <= end) {
            const data = allTableData[well][date];
            data.forEach((row, rowIndex) => {
              row.forEach((cell, cellIndex) => {
                if (cellIndex > 0 && !isNaN(parseInt(cell))) { // Skip first column (labels) and handle only numeric values
                  aggregated[rowIndex][cellIndex] = aggregated[rowIndex][cellIndex] + parseInt(cell);
                }
              });
            });
          }
        });
      });

      // Convert numbers back to strings for display
      return aggregated.map(row => 
        row.map((cell, index) => index === 0 ? cell : cell.toString())
      );
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
  }, [selectedWell, startDate, endDate]);

  // Prepare chart data using the same logic as the table - MOVED AFTER filteredTableData
  const chartData = useMemo(() => {
    if (filteredTableData.length === 0) return [];
    
    // Convert table data to chart format
    // Extract numeric values from the filtered table data
    const chartPoints = [];
    
    if (selectedWell === "all") {
      // For "all" wells, use the aggregated data
      filteredTableData.forEach((row, index) => {
        if (index === 0) { // "Нач. добыча" row
          row.forEach((cell, cellIndex) => {
            if (cellIndex > 0) { // Skip first column (labels)
              chartPoints.push({
                name: tableHeaders[cellIndex - 1],
                value: parseInt(cell) || 0,
                well: "all"
              });
            }
          });
        }
      });
    } else {
      // For individual wells, use the specific well data
      filteredTableData.forEach((row, index) => {
        if (index === 0) { // "Нач. добыча" row
          row.forEach((cell, cellIndex) => {
            if (cellIndex > 0) { // Skip first column (labels)
              chartPoints.push({
                name: tableHeaders[cellIndex - 1],
                value: parseInt(cell) || 0,
                well: selectedWell
              });
            }
          });
        }
      });
    }
    
    return chartPoints;
  }, [filteredTableData, selectedWell, tableHeaders]);

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
        flexWrap: "wrap",
        justifyContent: "center"
      }}>
        <div style={{ position: "relative" }} ref={dropdownRef}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#ccc" }}>
            Выбрать скважину:
          </label>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={isDropdownOpen ? searchTerm : getDisplayText()}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (!isDropdownOpen) setIsDropdownOpen(true);
              }}
              onFocus={() => {
                setIsDropdownOpen(true);
                setSearchTerm("");
              }}
              placeholder="Поиск скважины..."
              className={styles.inputField}
              style={{ 
                paddingRight: "30px",
                cursor: "pointer"
              }}
            />
            <span
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                fontSize: "12px",
                color: "#ccc"
              }}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {isDropdownOpen ? "▲" : "▼"}
            </span>
          </div>
          
          {isDropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                backgroundColor: "#333",
                border: "1px solid #666",
                borderRadius: "4px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                zIndex: 1000,
                maxHeight: "200px",
                overflowY: "auto"
              }}
            >
              <div
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  borderBottom: "1px solid #555",
                  backgroundColor: selectedWell === "all" ? "#555" : "transparent",
                  color: "#ccc"
                }}
                onClick={() => handleWellSelect("all")}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#555"}
                onMouseLeave={(e) => e.target.style.backgroundColor = selectedWell === "all" ? "#555" : "transparent"}
              >
                Все
              </div>
              {filteredWells.map(well => (
                <div
                  key={well}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    borderBottom: "1px solid #555",
                    backgroundColor: selectedWell === well ? "#555" : "transparent",
                    color: "#ccc"
                  }}
                  onClick={() => handleWellSelect(well)}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#555"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = selectedWell === well ? "#555" : "transparent"}
                >
                  {well}
                </div>
              ))}
              {filteredWells.length === 0 && searchTerm && (
                <div style={{ 
                  padding: "8px 12px", 
                  color: "#ccc", 
                  fontStyle: "italic" 
                }}>
                  Не найдено
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#ccc" }}>
            Начало:
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={styles.inputField}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#ccc" }}>
            Конец:
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={styles.inputField}
          />
        </div>
      </div>

      <div className={styles.flexContainer}>
        <div style={{ flex: 1 }}>
          <OilLossChart 
            chartData={chartData}
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