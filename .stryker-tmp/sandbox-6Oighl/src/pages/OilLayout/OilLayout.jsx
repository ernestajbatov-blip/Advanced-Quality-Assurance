// @ts-nocheck
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
  
  const [initialRange, setInitialRange] = useState([{
    startDate: new Date('2025-06-01'),
    endDate: new Date('2025-06-14'),
    key: 'initialSelection'
  }]);
  
  const [finalRange, setFinalRange] = useState([{
    startDate: new Date('2025-07-01'),
    endDate: new Date('2025-07-14'),
    key: 'finalSelection'
  }]);
  
  const [showInitialPicker, setShowInitialPicker] = useState(false);
  const [showFinalPicker, setShowFinalPicker] = useState(false);
  
  const [statusFilter, setStatusFilter] = useState("All");
  
  const dropdownRef = useRef(null);
  const initialPickerRef = useRef(null);
  const finalPickerRef = useRef(null);

  const formatDateForAPI = (date) => {
    return date.toISOString().split('T')[0];
  };

  const isDateWithData = (date) => {
    if (!oilLossData || oilLossData.length === 0) return false;
    const dateStr = formatDateForAPI(date);
    return oilLossData.some(item => item.date === dateStr);
  };

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
        
        const data = await response.json();
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

  useEffect(() => {
    const fetchOilLossData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const allDates = [
          initialRange[0].startDate,
          initialRange[0].endDate,
          finalRange[0].startDate,
          finalRange[0].endDate
        ];
        
        const minDate = new Date(Math.min(...allDates));
        const maxDate = new Date(Math.max(...allDates));
        
        const params = new URLSearchParams({
          startDate: formatDateForAPI(minDate),
          endDate: formatDateForAPI(maxDate)
        });
        
        if (selectedWell !== "all") {
          params.append("well", selectedWell);
        }
        
        const url = `/api/oil-loss?${params}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
          console.log('📊 Raw API Response for', selectedWell, ':', data.length, 'records');
          
          // Check for July 14
          const july14Records = data.filter(item => {
            const dateStr = item.date instanceof Date ? 
              item.date.toISOString().split('T')[0] : 
              item.date.split('T')[0];
            return dateStr === '2025-07-14' && item.well === selectedWell;
          });
          
          console.log('July 14 records in API response:', july14Records);
          
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

  // Helper to extract date string from ISO format or Date object
  const getDateOnly = (dateString) => {
    // If it's already a Date object, convert to ISO string first
    if (dateString instanceof Date) {
      return dateString.toISOString().split('T')[0];
    }
    // If it's a string in ISO format
    return dateString.split('T')[0];
  };

  const prepareAnalysisInput = (wellFilter) => {
    if (!oilLossData || oilLossData.length === 0) return null;

    const aggregateForRange = (startDate, endDate, wellName) => {
      const startStr = formatDateForAPI(startDate);
      const endStr = formatDateForAPI(endDate);
      
      console.log(`Filtering for ${wellName}: ${startStr} to ${endStr}`);
      console.log(`Total oilLossData records: ${oilLossData.length}`);
      
      const filtered = oilLossData.filter(item => {
        const itemDateStr = getDateOnly(item.date);
        const inRange = itemDateStr >= startStr && itemDateStr <= endStr;
        const matchesWell = wellName ? item.well === wellName : true;
        
        if (inRange && matchesWell) {
          console.log(`  ✓ Included: ${itemDateStr} (well: ${item.well})`);
        }
        
        return inRange && matchesWell;
      });

      if (filtered.length === 0) {
        console.log(`No records found for well ${wellName} in range ${startStr} to ${endStr}`);
        return null;
      }

      console.log(`\n=== WELL ${wellName} (${startStr} to ${endStr}) ===`);
      console.log(`Found ${filtered.length} records`);
      
      const totals = filtered.reduce((acc, item) => ({
        oil: acc.oil + (parseFloat(item.tm_oil) || 0),
        fluid: acc.fluid + (parseFloat(item.tm_fluid) || 0),
        workTime: acc.workTime + (parseFloat(item.well_work_time) || 0)
      }), { oil: 0, fluid: 0, workTime: 0 });

      console.log(`Totals: oil=${totals.oil.toFixed(2)}, fluid=${totals.fluid.toFixed(2)}, workTime=${totals.workTime.toFixed(2)}h`);
      console.log(`Days: ${(totals.workTime / 24).toFixed(2)}`);

      return {
        oil: totals.oil,
        fluid: totals.fluid,
        workDays: totals.workTime / 24
      };
    };

    const wells = wellFilter ? [wellFilter] : [...new Set(oilLossData.map(item => item.well))];
    const records = [];

    wells.forEach(well => {
      // Use the actual selected ranges, not the API range
      const initial = aggregateForRange(initialRange[0].startDate, initialRange[0].endDate, well);
      const final = aggregateForRange(finalRange[0].startDate, finalRange[0].endDate, well);

      if (initial && final) {
        records.push({
          clm_1: well,
          clm_2: initial.oil,
          clm_3: final.oil,
          clm_4: initial.fluid,
          clm_5: final.fluid,
          clm_6: initial.workDays,
          clm_7: final.workDays
        });
      }
    });

    return records.length > 0 ? { records, cfg: {} } : null;
  };

  const [analysisData, setAnalysisData] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  
  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!oilLossData || oilLossData.length === 0) {
        setAnalysisData(null);
        return;
      }

      setAnalysisLoading(true);
      setError(null);

      try {
        const wellFilter = selectedWell === "all" ? null : selectedWell;
        
        // Logging happens HERE, not inside prepareAnalysisInput
        console.log('\n========== ANALYSIS INPUT PREPARATION ==========');
        console.log('Selected well:', selectedWell);
        console.log('Initial range:', formatDateForAPI(initialRange[0].startDate), 'to', formatDateForAPI(initialRange[0].endDate));
        console.log('Final range:', formatDateForAPI(finalRange[0].startDate), 'to', formatDateForAPI(finalRange[0].endDate));

        const inputData = prepareAnalysisInput(wellFilter);
        
        console.log('Final input data:', JSON.stringify(inputData, null, 2));
        console.log('============================================\n');

        if (!inputData) {
          setAnalysisData(null);
          setAnalysisLoading(false);
          return;
        }

        console.log('Sending analysis request:', inputData);

        const response = await fetch('/api/oil-loss/analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(inputData)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Analysis failed: ${response.status}`);
        }

        const data = await response.json();
        console.log('Analysis response:', data);

        if (data.result && data.result.resOilProd) {
          setAnalysisData(data.result);
        } else if (data.resOilProd) {
          setAnalysisData(data);
        } else {
          setAnalysisData(null);
        }
      } catch (error) {
        console.error('Error fetching analysis:', error);
        setError(`Analysis error: ${error.message}`);
        setAnalysisData(null);
      } finally {
        setAnalysisLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchAnalysis, 500);
    return () => clearTimeout(timeoutId);
  }, [oilLossData, selectedWell, initialRange, finalRange]);

  const processedData = useMemo(() => {
    if (!analysisData || !analysisData.resOilProd) {
      return { chartData: [] };
    }

    if (selectedWell !== "all") {
      const wellAnalysis = analysisData.resOilProd.find(
        item => String(item.wi) === String(selectedWell)
      );

      if (!wellAnalysis) return { chartData: [] };

      const wellDetailData = analysisData.data?.find(
        item => String(item.Well) === String(selectedWell)
      );

      if (!wellDetailData) return { chartData: [] };

      const initialOil = wellDetailData.OilProd0;
      const finalOil = wellDetailData.OilProd1;
      
      const waterfallData = [];
      let runningTotal = initialOil;
      
      waterfallData.push({
        name: "Начальная добыча",
        value: initialOil,
        cumulative: initialOil,
        base: 0,
        type: "initial",
        displayValue: initialOil,
        isTotal: true
      });

      const workTimeContribution = wellAnalysis.by_t;
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

      const waterCutContribution = wellAnalysis["by_N%"];
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

      const fluidContribution = wellAnalysis.by_LiqRate;
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

      waterfallData.push({
        name: "Конечная добыча",
        value: finalOil,
        cumulative: finalOil,
        base: 0,
        type: "final",
        displayValue: finalOil,
        isTotal: true
      });

      return { chartData: waterfallData };
    }

    const totalImpacts = analysisData.resOilProd.reduce((acc, item) => ({
      by_t: acc.by_t + item.by_t,
      by_N: acc.by_N + item["by_N%"],
      by_LiqRate: acc.by_LiqRate + item.by_LiqRate,
      deltaOilProd: acc.deltaOilProd + item.deltaOilProd
    }), { by_t: 0, by_N: 0, by_LiqRate: 0, deltaOilProd: 0 });

    const totalInitial = analysisData.data.reduce((sum, item) => sum + item.OilProd0, 0);
    const totalFinal = analysisData.data.reduce((sum, item) => sum + item.OilProd1, 0);

    const waterfallData = [];
    let runningTotal = totalInitial;
    
    waterfallData.push({
      name: "Начальная добыча",
      value: totalInitial,
      cumulative: totalInitial,
      base: 0,
      type: "initial",
      displayValue: totalInitial,
      isTotal: true
    });

    const workTimeContribution = totalImpacts.by_t;
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

    const waterCutContribution = totalImpacts.by_N;
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

    const fluidContribution = totalImpacts.by_LiqRate;
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

    waterfallData.push({
      name: "Конечная добыча",
      value: totalFinal,
      cumulative: totalFinal,
      base: 0,
      type: "final",
      displayValue: totalFinal,
      isTotal: true
    });

    return { chartData: waterfallData };
  }, [analysisData, selectedWell]);

  const processedWellsData = useMemo(() => {
    if (!analysisData || !analysisData.resOilProd) {
      return {};
    }

    const wellsDataMap = {};

    analysisData.resOilProd.forEach(item => {
      wellsDataMap[item.wi] = {
        workTimeChange: Math.abs(item.by_t),
        waterCutChange: Math.abs(item["by_N%"]),
        fluidChange: Math.abs(item.by_LiqRate),
        totalChange: Math.abs(item.deltaOilProd)
      };
    });

    return wellsDataMap;
  }, [analysisData]);

  const filteredWells = useMemo(() => {
    if (!searchTerm) return availableWells;
    return availableWells.filter(well => 
      well.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableWells, searchTerm]);

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

  const handleWellSelect = (well) => {
    setSelectedWell(well);
    setSearchTerm("");
    setIsDropdownOpen(false);
  };

  const getDisplayText = () => {
    if (selectedWell === "all") return "Все";
    return selectedWell;
  };

  const handleClearAllFilters = () => {
    setSelectedWell("all");
    setStatusFilter("All");
    setSearchTerm("");
    setIsDropdownOpen(false);
    setInitialRange([{
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-06-14'),
      key: 'initialSelection'
    }]);
    setFinalRange([{
      startDate: new Date('2025-07-01'),
      endDate: new Date('2025-07-14'),
      key: 'finalSelection'
    }]);
  };

  const formatDateRange = (range) => {
    const start = formatDateForAPI(range[0].startDate);
    const end = formatDateForAPI(range[0].endDate);
    return `${start} - ${end}`;
  };

  return (
    <div className={styles.layoutContainer}>
      <AppNav />
      
      {error && (
        <div className={styles.errorAlert}>
          {error}
        </div>
      )}
      
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
      
      <div className={styles.mainContent}>
        <div className={styles.chartSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Анализ потерь нефти</h2>
          </div>
          
          <div className={styles.chartContainer}>
            {loading || analysisLoading ? (
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