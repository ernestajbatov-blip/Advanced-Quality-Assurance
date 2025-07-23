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
  
  // Map status filter
  const [statusFilter, setStatusFilter] = useState("All");
  
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

  // Helper function to find closest data within the date interval
  const findClosestData = (dataArray, targetDate, startDate, endDate) => {
    if (!dataArray || dataArray.length === 0) return null;
    
    const target = new Date(targetDate);
    const intervalStart = new Date(startDate);
    const intervalEnd = new Date(endDate);
    
    // Filter data to only include dates within the interval
    const filteredData = dataArray.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= intervalStart && itemDate <= intervalEnd;
    });
    
    if (filteredData.length === 0) return null;
    
    let closest = null;
    let smallestDiff = Infinity;
    
    for (const item of filteredData) {
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
      oil: parseFloat(currentData.tm_oil) || 0, // m³
      fluid: parseFloat(currentData.tm_fluid) || 0, // m³
      workTime: parseFloat(currentData.well_work_time) || 0, // hours
      waterCut: parseFloat(currentData.water_lab) || 0 // %
    };
    
    const previous = {
      oil: parseFloat(previousData.tm_oil) || 0, // m³
      fluid: parseFloat(previousData.tm_fluid) || 0, // m³
      workTime: parseFloat(previousData.well_work_time) || 0, // hours
      waterCut: parseFloat(previousData.water_lab) || 0 // %
    };
    
    // Calculate simple changes in each factor
    const oilChange = current.oil - previous.oil;
    const fluidChange = current.fluid - previous.fluid;
    const workTimeChange = current.workTime - previous.workTime;
    const waterCutChange = current.waterCut - previous.waterCut;
    
    return {
      initial: previous.oil, // m³
      final: current.oil, // m³
      fluidChange: fluidChange, // m³
      workTimeChange: workTimeChange, // hours
      waterCutChange: waterCutChange, // %
      currentDate: currentData.date,
      previousDate: previousData.date
    };
  };

  // Process data for chart
  const processedData = useMemo(() => {
    if (!oilLossData || oilLossData.length === 0) {
      return { chartData: [] };
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
      
      // Find data closest to start and end dates within the interval
      const startData = findClosestData(aggregatedData, startDate, startDate, endDate);
      const endData = findClosestData(aggregatedData, endDate, startDate, endDate);
      
      if (startData && endData && startData.date !== endData.date) {
        const changes = calculateProductionChanges(endData, startData);
        
        if (changes) {
          return {
            chartData: [
              { name: "Нач. добыча", value: changes.initial, type: "initial" },
              { name: "Изм. врем. работы", value: changes.workTimeChange, type: "workTime" },
              { name: "Изм. обвод.", value: changes.waterCutChange, type: "waterCut" },
              { name: "Изм. дебита жидк.", value: changes.fluidChange, type: "fluid" },
              { name: "Конеч. добыча", value: changes.final, type: "final" }
            ]
          };
        }
      }
    } else {
      // Filter data for selected well
      const wellData = oilLossData.filter(item => item.well === selectedWell);
      const sortedWellData = wellData.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // Find data closest to start and end dates within the interval
      const startData = findClosestData(sortedWellData, startDate, startDate, endDate);
      const endData = findClosestData(sortedWellData, endDate, startDate, endDate);
      
      if (startData && endData && startData.date !== endData.date) {
        const changes = calculateProductionChanges(endData, startData);
        
        if (changes) {
          return {
            chartData: [
              { name: "Нач. добыча (м³)", value: changes.initial, type: "initial" },
              { name: "Изм. времени работы (ч)", value: changes.workTimeChange, type: "workTime" },
              { name: "Изм. обводненности (%)", value: changes.waterCutChange, type: "waterCut" },
              { name: "Изм. дебита жидк. (м³)", value: changes.fluidChange, type: "fluid" },
              { name: "Конеч. добыча (м³)", value: changes.final, type: "final" }
            ]
          };
        }
      }
    }
    
    return { chartData: [] };
  }, [oilLossData, selectedWell, startDate, endDate]);

  // Process data specifically for individual wells in the map
  const processedWellsData = useMemo(() => {
    if (!oilLossData || oilLossData.length === 0) {
      return {};
    }

    const wellsDataMap = {};
    
    // Group data by well
    const groupedByWell = oilLossData.reduce((acc, item) => {
      const wellName = item.well;
      if (!acc[wellName]) {
        acc[wellName] = [];
      }
      acc[wellName].push(item);
      return acc;
    }, {});

    // Process each well's data
    Object.keys(groupedByWell).forEach(wellName => {
      const wellData = groupedByWell[wellName];
      const sortedWellData = wellData.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // Find data closest to start and end dates within the interval
      const startData = findClosestData(sortedWellData, startDate, startDate, endDate);
      const endData = findClosestData(sortedWellData, endDate, startDate, endDate);
      
      if (startData && endData && startData.date !== endData.date) {
        const changes = calculateProductionChanges(endData, startData);
        
        if (changes) {
          wellsDataMap[wellName] = {
            workTimeChange: Math.abs(changes.workTimeChange),
            waterCutChange: Math.abs(changes.waterCutChange),
            fluidChange: Math.abs(changes.fluidChange),
            totalChange: Math.abs(changes.final - changes.initial)
          };
        }
      }
    });

    return wellsDataMap;
  }, [oilLossData, startDate, endDate]);

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

  // Handle clear all filters
  const handleClearAllFilters = () => {
    setSelectedWell("all");
    setStatusFilter("All");
    setSearchTerm("");
    setIsDropdownOpen(false);
  };

  return (
    <div className={styles.layoutContainer}>
      <AppNav />
      
      {/* Error Display */}
      {error && (
        <div className={styles.errorAlert}>
          {error}
        </div>
      )}
      
      {/* Universal Filters Section */}
      <div className={styles.centralFiltersSection}>
        <div className={styles.filtersContainer}>
          <div className={styles.filterGroup} ref={dropdownRef}>
            <label className={styles.filterLabel}>
              Выбрать скважину:
            </label>
            <div className={styles.dropdownContainer}>
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
              />
              <span
                className={styles.dropdownArrow}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {isDropdownOpen ? "▲" : "▼"}
              </span>
            </div>
            
            {isDropdownOpen && (
              <div className={styles.dropdownMenu}>
                <div
                  className={`${styles.dropdownItem} ${selectedWell === "all" ? styles.selected : ""}`}
                  onClick={() => handleWellSelect("all")}
                >
                  Все
                </div>
                {filteredWells.map(well => (
                  <div
                    key={well}
                    className={`${styles.dropdownItem} ${selectedWell === well ? styles.selected : ""}`}
                    onClick={() => handleWellSelect(well)}
                  >
                    {well}
                  </div>
                ))}
                {filteredWells.length === 0 && searchTerm && (
                  <div className={styles.dropdownNoResults}>
                    Не найдено
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>
              Статус контроллера:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.inputField}
            >
              <option value="All">Все</option>
              <option value="Active">В сети</option>
              <option value="Inactive">Не в сети</option>
              <option value="Maintenance">Нет данных</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>
              Начало:
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={styles.inputField}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>
              Конец:
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={styles.inputField}
            />
          </div>

          <div className={styles.filterGroup}>
            <button
              onClick={handleClearAllFilters}
              className={styles.clearFiltersButton}
            >
              Очистить фильтры
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Chart Section */}
        <div className={styles.chartSection}>
          {/* Chart Header */}
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Анализ изменений добычи нефти</h2>
            {selectedWell !== "all" && (
              <span className={styles.sectionSubtitle}>
                Скважина: {selectedWell}
              </span>
            )}
            {/* <span className={styles.sectionPeriod}>
              Период: {startDate} - {endDate}
            </span> */}
          </div>
          
          <div className={styles.chartContainer}>
            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <span>Загрузка данных...</span>
              </div>
            ) : (
              <OilLossChart 
                chartData={processedData.chartData}
                selectedWell={selectedWell}
                startDate={startDate}
                endDate={endDate}
              />
            )}
          </div>
        </div>
        
        {/* Map Section */}
        <div className={styles.mapSection}>          
          <div className={styles.mapContainer}>
            <OilMap 
              selectedWell={selectedWell}
              statusFilter={statusFilter}
              onWellSelect={handleWellSelect}
              wellsOilData={processedWellsData}
              startDate={startDate}
              endDate={endDate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}