import React, { useState, useMemo, useRef, useEffect } from "react";
import OilLossChart from "../../components/OilLossChart/OilLossChart";
import AppNav from "../../components/AppNav/AppNav";
import OilMap from "../../components/Map/OilMap";
import styles from "./OilLayout.module.css";

export default function OilLayout() {
  const [selectedWell, setSelectedWell] = useState("all");
  const [startDate, setStartDate] = useState("2025-06-01");
  const [endDate, setEndDate] = useState("2025-07-31");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [oilLossData, setOilLossData] = useState([]);
  const [availableWells, setAvailableWells] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState("chart"); // New state for toggle
  const dropdownRef = useRef(null);

  // Helper function to safely parse JSON response
  const safeJsonParse = async (response) => {
    const text = await response.text();
    if (!text || text.trim() === '') {
      throw new Error('Empty response from server');
    }
    try {
      return JSON.parse(text);
    } catch (error) {
      console.error('Invalid JSON response:', text);
      throw new Error(`Invalid JSON response: ${error.message}`);
    }
  };

  // Helper function to find closest data to target date
  const findClosestData = (dataArray, targetDate) => {
    if (!dataArray || dataArray.length === 0) return null;
    
    const target = new Date(targetDate);
    let closest = null;
    let smallestDiff = Infinity;
    
    for (const item of dataArray) {
      const itemDate = new Date(item.date);
      const diff = Math.abs(itemDate - target);
      
      if (diff < smallestDiff) {
        smallestDiff = diff;
        closest = item;
      }
    }
    
    return closest;
  };

  // Fetch available wells from oil_loss table
  useEffect(() => {
    const fetchWells = async () => {
      try {
        setError(null);
        console.log('Fetching wells...');
        
        const response = await fetch("/api/oil-loss/wells");
        console.log('Wells response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await safeJsonParse(response);
        console.log('Wells data:', data);
        
        if (Array.isArray(data)) {
          setAvailableWells(data.map(item => item.well || item));
        } else {
          console.error('Wells data is not an array:', data);
          setAvailableWells([]);
        }
      } catch (error) {
        console.error("Error fetching wells:", error);
        setError(`Error fetching wells: ${error.message}`);
        setAvailableWells([]);
      }
    };
    fetchWells();
  }, []);

  // Fetch oil loss data when filters change
  useEffect(() => {
    const fetchOilLossData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching oil loss data with params:', { selectedWell, startDate, endDate });
        
        const params = new URLSearchParams({
          startDate,
          endDate
        });
        
        if (selectedWell !== "all") {
          params.append("well", selectedWell);
        }
        
        const url = `/api/oil-loss?${params}`;
        console.log('Request URL:', url);
        
        const response = await fetch(url);
        console.log('Oil loss response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await safeJsonParse(response);
        console.log('Oil loss data:', data);
        
        if (Array.isArray(data)) {
          setOilLossData(data);
        } else {
          console.error('Oil loss data is not an array:', data);
          setOilLossData([]);
        }
      } catch (error) {
        console.error("Error fetching oil loss data:", error);
        setError(`Error fetching data: ${error.message}`);
        setOilLossData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOilLossData();
  }, [selectedWell, startDate, endDate]);

  // Calculate production changes for chart
  const calculateProductionChanges = (currentData, previousData) => {
    if (!currentData || !previousData) return null;
    
    const current = {
      oil: parseFloat(currentData.tm_oil) || 0,
      fluid: parseFloat(currentData.tm_fluid) || 0,
      workTime: parseFloat(currentData.well_work_time) || 0,
      waterCut: parseFloat(currentData.water_lab) || 0
    };
    
    const previous = {
      oil: parseFloat(previousData.tm_oil) || 0,
      fluid: parseFloat(previousData.tm_fluid) || 0,
      workTime: parseFloat(previousData.well_work_time) || 0,
      waterCut: parseFloat(previousData.water_lab) || 0
    };
    
    // Calculate changes
    const oilChange = current.oil - previous.oil;
    const workTimeChange = current.workTime - previous.workTime;
    const waterCutChange = current.waterCut - previous.waterCut;
    const fluidChange = current.fluid - previous.fluid;
    
    return {
      initial: previous.oil,
      workTimeEffect: workTimeChange * (previous.oil / (previous.workTime || 1)),
      waterCutEffect: -(waterCutChange * current.fluid / 100),
      fluidEffect: fluidChange * (1 - current.waterCut / 100),
      final: current.oil,
      currentDate: currentData.date,
      previousDate: previousData.date
    };
  };

  // Process data for chart and table
  const processedData = useMemo(() => {
    if (!oilLossData || oilLossData.length === 0) {
      return { chartData: [], tableData: [] };
    }

    if (selectedWell === "all") {
      // Group by date and aggregate all wells
      const groupedByDate = oilLossData.reduce((acc, item) => {
        const date = item.date;
        if (!acc[date]) {
          acc[date] = {
            date,
            tm_oil: 0,
            tm_fluid: 0,
            well_work_time: 0,
            water_lab: 0,
            count: 0
          };
        }
        acc[date].tm_oil += parseFloat(item.tm_oil) || 0;
        acc[date].tm_fluid += parseFloat(item.tm_fluid) || 0;
        acc[date].well_work_time += parseFloat(item.well_work_time) || 0;
        acc[date].water_lab += parseFloat(item.water_lab) || 0;
        acc[date].count++;
        return acc;
      }, {});
      
      // Calculate averages for water_lab
      Object.keys(groupedByDate).forEach(date => {
        groupedByDate[date].water_lab = groupedByDate[date].water_lab / groupedByDate[date].count;
      });
      
      const sortedDates = Object.keys(groupedByDate).sort();
      const aggregatedData = sortedDates.map(date => groupedByDate[date]);
      
      // Find data closest to start and end dates
      const startData = findClosestData(aggregatedData, startDate);
      const endData = findClosestData(aggregatedData, endDate);
      
      if (startData && endData && startData.date !== endData.date) {
        const changes = calculateProductionChanges(endData, startData);
        
        if (changes) {
          return {
            chartData: [
              { name: "Нач. добыча", value: changes.initial, type: "initial" },
              { name: "За счет вр. работы", value: changes.workTimeEffect, type: "workTime" },
              { name: "За счет обвод-ти", value: changes.waterCutEffect, type: "waterCut" },
              { name: "За счет дебита жидк.", value: changes.fluidEffect, type: "fluid" },
              { name: "Конеч. добыча", value: changes.final, type: "final" }
            ],
            tableData: [
              ["Нач. добыча", changes.initial.toFixed(2), changes.workTimeEffect.toFixed(2), changes.waterCutEffect.toFixed(2), changes.fluidEffect.toFixed(2), changes.final.toFixed(2)],
              ["Дата начальная", changes.previousDate, "", "", "", ""],
              ["Дата конечная", changes.currentDate, "", "", "", ""],
              ["Изменение", "", changes.workTimeEffect.toFixed(2), changes.waterCutEffect.toFixed(2), changes.fluidEffect.toFixed(2), (changes.final - changes.initial).toFixed(2)]
            ]
          };
        }
      }
    } else {
      // Filter data for selected well
      const wellData = oilLossData.filter(item => item.well === selectedWell);
      const sortedWellData = wellData.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // Find data closest to start and end dates
      const startData = findClosestData(sortedWellData, startDate);
      const endData = findClosestData(sortedWellData, endDate);
      
      if (startData && endData && startData.date !== endData.date) {
        const changes = calculateProductionChanges(endData, startData);
        
        if (changes) {
          return {
            chartData: [
              { name: "Нач. добыча", value: changes.initial, type: "initial" },
              { name: "За счет вр. работы", value: changes.workTimeEffect, type: "workTime" },
              { name: "За счет обвод-ти", value: changes.waterCutEffect, type: "waterCut" },
              { name: "За счет дебита жидк.", value: changes.fluidEffect, type: "fluid" },
              { name: "Конеч. добыча", value: changes.final, type: "final" }
            ],
            tableData: [
              ["Нач. добыча", changes.initial.toFixed(2), changes.workTimeEffect.toFixed(2), changes.waterCutEffect.toFixed(2), changes.fluidEffect.toFixed(2), changes.final.toFixed(2)],
              ["Дата начальная", changes.previousDate, "", "", "", ""],
              ["Дата конечная", changes.currentDate, "", "", "", ""],
              ["Изменение", "", changes.workTimeEffect.toFixed(2), changes.waterCutEffect.toFixed(2), changes.fluidEffect.toFixed(2), (changes.final - changes.initial).toFixed(2)]
            ]
          };
        }
      }
    }
    
    return { chartData: [], tableData: [] };
  }, [oilLossData, selectedWell, startDate, endDate]);

  const tableHeaders = [
    "Показатель",
    "Нач. добыча",
    "За счет вр. работы",
    "За счет обвод-ти",
    "За счет дебита жидк.",
    "Конеч. добыча",
  ];

  // Filter wells based on search term
  const filteredWells = useMemo(() => {
    if (!searchTerm) return availableWells;
    return availableWells.filter(well => 
      well.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableWells, searchTerm]);

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

  return (
    <div style={{ width: "100%" }}>
      <AppNav />
      
      {/* Error Display */}
      {error && (
        <div style={{
          padding: "10px",
          backgroundColor: "#ff4444",
          color: "white",
          margin: "10px 20px",
          borderRadius: "4px"
        }}>
          {error}
        </div>
      )}
      
      {/* Debug Info */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div style={{
          padding: "10px",
          backgroundColor: "#333",
          color: "#ccc",
          margin: "10px 20px",
          borderRadius: "4px",
          fontSize: "12px"
        }}>
          Debug: Wells: {availableWells.length}, Data: {oilLossData.length}, Selected: {selectedWell}
        </div>
      )} */}
      
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

      {/* Toggle Buttons */}
      <div style={{
        padding: "20px",
        backgroundColor: "dark grey",
        borderBottom: "1px solid dark grey",
        display: "flex",
        justifyContent: "center",
        gap: "10px"
      }}>
        <button
          onClick={() => setActiveView("chart")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeView === "chart" ? "#4a90e2" : "#444",
            color: "#ccc",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            transition: "background-color 0.3s"
          }}
          onMouseEnter={(e) => {
            if (activeView !== "chart") {
              e.target.style.backgroundColor = "#555";
            }
          }}
          onMouseLeave={(e) => {
            if (activeView !== "chart") {
              e.target.style.backgroundColor = "#444";
            }
          }}
        >
          График
        </button>
        <button
          onClick={() => setActiveView("table")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeView === "table" ? "#4a90e2" : "#444",
            color: "#ccc",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            transition: "background-color 0.3s"
          }}
          onMouseEnter={(e) => {
            if (activeView !== "table") {
              e.target.style.backgroundColor = "#555";
            }
          }}
          onMouseLeave={(e) => {
            if (activeView !== "table") {
              e.target.style.backgroundColor = "#444";
            }
          }}
        >
          Таблица
        </button>
      </div>

      {/* Chart/Table Container */}
      <div style={{ padding: "50px", marginRight: "20px" }}>
        {loading ? (
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            height: "500px",
            color: "#ccc"
          }}>
            Загрузка данных...
          </div>
        ) : (
          <>
            {activeView === "chart" && (
              <OilLossChart 
                chartData={processedData.chartData}
                selectedWell={selectedWell}
                startDate={startDate}
                endDate={endDate}
              />
            )}
            
            {activeView === "table" && (
              <div style={{ 
                display: "flex", 
                justifyContent: "center",
                width: "100%"
              }}>
                {processedData.tableData.length > 0 ? (
                  <table className={styles.oilLossTable}>
                    <thead>
                      <tr>
                        {tableHeaders.map((header, index) => (
                          <th key={index}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {processedData.tableData.map((row, rowIndex) => (
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
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    height: "400px",
                    color: "#666",
                    fontSize: "16px"
                  }}>
                    {error ? "Ошибка загрузки данных" : "Нет данных для анализа (нужно минимум 2 даты)"}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      
      <div className={styles.mapSection}>
        <OilMap />
      </div>
    </div>
  );
}