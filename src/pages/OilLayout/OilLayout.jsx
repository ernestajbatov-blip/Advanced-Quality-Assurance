import React, { useState, useMemo, useRef, useEffect } from "react";
import { DateRange } from "react-date-range";
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import OilLossChart from "../../components/OilLossChart/OilLossChart";
import AppNav from "../../components/AppNav/AppNav";
import OilMap from "../../components/Map/OilMap";
import styles from "./OilLayout.module.css";
import { useUser } from "../../states/UserContext";

export default function OilLayout() {
  const { user, onLogout } = useUser();
  const [selectedWell, setSelectedWell] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [oilLossData, setOilLossData] = useState([]);
  const [availableWells, setAvailableWells] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Date range states for two intervals
  const [initialRange, setInitialRange] = useState([{
    startDate: new Date(2025, 5, 1), // June 1, 2025
    endDate: new Date(2025, 5, 15),  // June 15, 2025
    key: 'initialSelection'
  }]);
  
  const [finalRange, setFinalRange] = useState([{
    startDate: new Date(2025, 6, 1), // July 1, 2025
    endDate: new Date(2025, 6, 31),  // July 31, 2025
    key: 'finalSelection'
  }]);
  
  const [showInitialPicker, setShowInitialPicker] = useState(false);
  const [showFinalPicker, setShowFinalPicker] = useState(false);
  
  // Map status filter
  const [statusFilter, setStatusFilter] = useState("All");
  
  const dropdownRef = useRef(null);
  const initialPickerRef = useRef(null);
  const finalPickerRef = useRef(null);

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

  // Helper function to format date for API
  const formatDateForAPI = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Get dates that have data for highlighting
  const datesWithData = useMemo(() => {
    if (!oilLossData || oilLossData.length === 0) return [];
    return [...new Set(oilLossData.map(item => item.date))];
  }, [oilLossData]);

  // Check if a date has data
  const isDateWithData = (date) => {
    const dateStr = formatDateForAPI(date);
    return datesWithData.includes(dateStr);
  };

  // Custom day content renderer for highlighting dates with data
  const dayContentRenderer = (date) => {
    const hasData = isDateWithData(date);
    return (
      <div style={{ position: "relative" }}>
        <span>{date.getDate()}</span>
        {hasData && (
          <div style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#4CAF50",
            position: "absolute",
            bottom: 2,
            left: "50%",
            transform: "translateX(-50%)"
          }} />
        )}
      </div>
    );
  };

  // Helper function to find average data within a date range
  const getAverageDataForRange = (dataArray, startDate, endDate, wellFilter = null) => {
    if (!dataArray || dataArray.length === 0) return null;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Filter data by date range and well if specified
    const filteredData = dataArray.filter(item => {
      const itemDate = new Date(item.date);
      const inDateRange = itemDate >= start && itemDate <= end;
      const matchesWell = wellFilter ? item.well === wellFilter : true;
      return inDateRange && matchesWell;
    });
    
    if (filteredData.length === 0) return null;
    
    if (wellFilter) {
      // For individual well, calculate averages
      const totals = filteredData.reduce((acc, item) => ({
        oil: acc.oil + (parseFloat(item.tm_oil) || 0),
        fluid: acc.fluid + (parseFloat(item.tm_fluid) || 0),
        workTime: acc.workTime + (parseFloat(item.well_work_time) || 0),
        waterCut: acc.waterCut + (parseFloat(item.water_lab) || 0)
      }), { oil: 0, fluid: 0, workTime: 0, waterCut: 0 });
      
      const count = filteredData.length;
      return {
        oil: totals.oil / count,
        fluid: totals.fluid / count,
        workTime: totals.workTime / count,
        waterCut: totals.waterCut / count
      };
    } else {
      // For all wells, group by date first, then aggregate
      const groupedByDate = filteredData.reduce((acc, item) => {
        const date = item.date;
        if (!acc[date]) {
          acc[date] = {
            oil: 0, fluid: 0, workTime: 0, waterCut: 0, count: 0
          };
        }
        acc[date].oil += parseFloat(item.tm_oil) || 0;
        acc[date].fluid += parseFloat(item.tm_fluid) || 0;
        acc[date].workTime += parseFloat(item.well_work_time) || 0;
        acc[date].waterCut += parseFloat(item.water_lab) || 0;
        acc[date].count++;
        return acc;
      }, {});
      
      // Calculate daily averages, then overall average
      const dailyAverages = Object.values(groupedByDate).map(day => ({
        oil: day.oil,
        fluid: day.fluid,
        workTime: day.workTime,
        waterCut: day.waterCut / day.count // Water cut is averaged per day
      }));
      
      const totals = dailyAverages.reduce((acc, day) => ({
        oil: acc.oil + day.oil,
        fluid: acc.fluid + day.fluid,
        workTime: acc.workTime + day.workTime,
        waterCut: acc.waterCut + day.waterCut
      }), { oil: 0, fluid: 0, workTime: 0, waterCut: 0 });
      
      const days = dailyAverages.length;
      return {
        oil: totals.oil / days,
        fluid: totals.fluid / days,
        workTime: totals.workTime / days,
        waterCut: totals.waterCut / days
      };
    }
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

  // Fetch oil loss data when date ranges change
  useEffect(() => {
    const fetchOilLossData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get the full date range that encompasses both intervals
        const allDates = [
          initialRange[0].startDate,
          initialRange[0].endDate,
          finalRange[0].startDate,
          finalRange[0].endDate
        ];
        
        const minDate = new Date(Math.min(...allDates));
        const maxDate = new Date(Math.max(...allDates));
        
        console.log('Fetching oil loss data with params:', { 
          selectedWell, 
          startDate: formatDateForAPI(minDate), 
          endDate: formatDateForAPI(maxDate) 
        });
        
        const params = new URLSearchParams({
          startDate: formatDateForAPI(minDate),
          endDate: formatDateForAPI(maxDate)
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
  }, [selectedWell, initialRange, finalRange]);

  // Calculate production changes for chart (comparing two intervals)
  const calculateIntervalComparison = (initialData, finalData) => {
    if (!initialData || !finalData) return null;
    
    // Oil production values (in tonnes)
    const initialOil = initialData.oil;
    const finalOil = finalData.oil;
    const totalOilChange = finalOil - initialOil;
    
    // Calculate the impact of each factor on oil production
    // These should represent how much oil production changed due to each factor
    
    // 1. Work Time Impact
    // If work time increased/decreased, how much did that contribute to oil change?
    const workTimeChange = finalData.workTime - initialData.workTime;
    const workTimeImpactOnOil = workTimeChange * (initialData.oil / initialData.workTime); // Proportional impact
    
    // 2. Water Cut Impact
    // Higher water cut typically means less oil (negative impact)
    const waterCutChange = finalData.waterCut - initialData.waterCut;
    const waterCutImpactOnOil = -waterCutChange * (initialData.fluid * 0.01); // Convert % to impact
    
    // 3. Fluid Rate Impact
    // Higher fluid rate with same water cut should mean more oil (positive impact)
    const fluidChange = finalData.fluid - initialData.fluid;
    const currentOilFraction = 1 - (initialData.waterCut / 100); // Oil fraction of fluid
    const fluidImpactOnOil = fluidChange * currentOilFraction;
    
    return {
      initial: initialOil,
      final: finalOil,
      workTimeOilImpact: workTimeImpactOnOil,
      waterCutOilImpact: waterCutImpactOnOil,
      fluidOilImpact: fluidImpactOnOil,
      totalChange: totalOilChange
    };
  };
  
  // Process data for chart
  const processedData = useMemo(() => {
    if (!oilLossData || oilLossData.length === 0) {
      return { chartData: [] };
    }

    const wellFilter = selectedWell === "all" ? null : selectedWell;
    
    // Get average data for both intervals
    const initialData = getAverageDataForRange(
      oilLossData, 
      initialRange[0].startDate, 
      initialRange[0].endDate,
      wellFilter
    );
    
    const finalData = getAverageDataForRange(
      oilLossData, 
      finalRange[0].startDate, 
      finalRange[0].endDate,
      wellFilter
    );
    
    if (initialData && finalData) {
      const changes = calculateIntervalComparison(initialData, finalData);
      
      if (changes) {
        return {
          chartData: [
            { name: "Начальная добыча", value: changes.initial, type: "initial" },
            { name: "Влияние времени работы", value: changes.workTimeOilImpact, type: "workTime" },
            { name: "Влияние обводненности", value: changes.waterCutOilImpact, type: "waterCut" },
            { name: "Влияние дебита жидкости", value: changes.fluidOilImpact, type: "fluid" },
            { name: "Конечная добыча", value: changes.final, type: "final" }
          ]
        };
      }
    }
    
    return { chartData: [] };
  }, [oilLossData, selectedWell, initialRange, finalRange]);

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
      const initialData = getAverageDataForRange(
        oilLossData, 
        initialRange[0].startDate, 
        initialRange[0].endDate,
        wellName
      );
      
      const finalData = getAverageDataForRange(
        oilLossData, 
        finalRange[0].startDate, 
        finalRange[0].endDate,
        wellName
      );
      
      if (initialData && finalData) {
        const changes = calculateIntervalComparison(initialData, finalData);
        
        if (changes) {
          wellsDataMap[wellName] = {
            workTimeChange: Math.abs(changes.workTimeOilImpact),
            waterCutChange: Math.abs(changes.waterCutOilImpact),
            fluidChange: Math.abs(changes.fluidOilImpact),
            totalChange: Math.abs(changes.final - changes.initial)
          };
        }
      }
    });

    return wellsDataMap;
  }, [oilLossData, initialRange, finalRange]);

  // Filter wells based on search term
  const filteredWells = useMemo(() => {
    if (!searchTerm) return availableWells;
    return availableWells.filter(well => 
      well.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableWells, searchTerm]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (initialPickerRef.current && !initialPickerRef.current.contains(event.target)) {
        setShowInitialPicker(false);
      }
      if (finalPickerRef.current && !finalPickerRef.current.contains(event.target)) {
        setShowFinalPicker(false);
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
    // Reset to default date ranges
    setInitialRange([{
      startDate: new Date(2025, 5, 1),
      endDate: new Date(2025, 5, 15),
      key: 'initialSelection'
    }]);
    setFinalRange([{
      startDate: new Date(2025, 6, 1),
      endDate: new Date(2025, 6, 31),
      key: 'finalSelection'
    }]);
  };

  // Format date range for display
  const formatDateRange = (range) => {
    const start = formatDateForAPI(range[0].startDate);
    const end = formatDateForAPI(range[0].endDate);
    return `${start} - ${end}`;
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

          {/* Initial Date Range Picker */}
          <div className={styles.filterGroup} ref={initialPickerRef}>
            <label className={styles.filterLabel}>
              Начальный период:
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={formatDateRange(initialRange)}
                onClick={() => setShowInitialPicker(!showInitialPicker)}
                readOnly
                className={styles.inputField}
                style={{ cursor: "pointer" }}
              />
              {showInitialPicker && (
                <div style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  zIndex: 2000,
                  backgroundColor: "white",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  borderRadius: "8px",
                  overflow: "hidden"
                }}>
                  <DateRange
                    ranges={initialRange}
                    onChange={item => setInitialRange([item.initialSelection])}
                    dayContentRenderer={dayContentRenderer}
                    maxDate={new Date()}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Final Date Range Picker */}
          <div className={styles.filterGroup} ref={finalPickerRef}>
            <label className={styles.filterLabel}>
              Конечный период:
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={formatDateRange(finalRange)}
                onClick={() => setShowFinalPicker(!showFinalPicker)}
                readOnly
                className={styles.inputField}
                style={{ cursor: "pointer" }}
              />
              {showFinalPicker && (
                <div style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  zIndex: 3000,
                  backgroundColor: "white",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  borderRadius: "8px",
                  overflow: "hidden"
                }}>
                  <DateRange
                    ranges={finalRange}
                    onChange={item => setFinalRange([item.finalSelection])}
                    dayContentRenderer={dayContentRenderer}
                    maxDate={new Date()}
                  />
                </div>
              )}
            </div>
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
            <h2 className={styles.sectionTitle}>Анализ потерь нефти</h2>
            {/* {selectedWell !== "all" && (
              <span className={styles.sectionSubtitle}>
                Скважина: {selectedWell}
              </span>
            )} */}
            {/* <div className={styles.sectionPeriod}>
              <div>Начальный: {formatDateRange(initialRange)}</div>
              <div>Конечный: {formatDateRange(finalRange)}</div>
            </div> */}
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
                startDate={formatDateRange(initialRange)}
                endDate={formatDateRange(finalRange)}
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
              startDate={formatDateRange(initialRange)}
              endDate={formatDateRange(finalRange)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}