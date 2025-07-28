import React, { useState, useEffect, useMemo } from "react";
import {
  fetch2Hours,
  fetch2HoursArchive,
  getAvailableArchiveDates,
} from "../../axios/wellService";
import styles from "./Chart.module.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parseISO, isSameDay, format } from "date-fns";

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label, chartDate }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        {payload.map((entry, index) => (
          <div
            key={`item-${index}`}
            className={`${styles.tooltipItem} ${
              entry.name === "Дебит за предыдущие сутки"
                ? styles.tooltipGray
                : entry.name === "Дебит по тех.режиму"
                ? styles.tooltipRed
                : styles.tooltipGreen
            }`}
          >
            {`${entry.name}: ${entry.value.toLocaleString("ru-RU")}`}
          </div>
        ))}
        <div className={styles.tooltipDate}>
          {label} | {chartDate ? format(parseISO(chartDate), "dd.MM.yyyy") : ""}
        </div>
      </div>
    );
  }
  return null;
};

// Custom Chart Component using pure SVG
const CustomChart = ({ data, width = 800, height = 350, isNak, type, chartDate, isArchiveMode }) => {
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, data: null });
  const margin = { top: 20, right: 20, bottom: 40, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Get the appropriate data keys based on type and accumulation mode
  const getDataKey = (baseKey) => {
    if (isNak) {
      return `${baseKey}_nak`;
    }
    return baseKey;
  };

  const techRezhKey = getDataKey("tech_rezh");
  const debitLastDayKey = getDataKey("debit_last_day");
  const currDebitKey = getDataKey("curr_debit");

  // Calculate scales
  const allValues = data.flatMap(d => [
    d[techRezhKey] || 0,
    d[debitLastDayKey] || 0,
    d[currDebitKey] || 0
  ]).filter(v => v !== undefined && v !== null);

  const minValue = Math.min(...allValues, 0);
  const maxValue = Math.max(...allValues, 1);
  const valueRange = maxValue - minValue || 1;

  const scaleX = (index) => (index / Math.max(data.length - 1, 1)) * chartWidth;
  const scaleY = (value) => chartHeight - ((value - minValue) / valueRange) * chartHeight;

  // Generate line segments with dynamic styling based on Tin for current data, solid for archive
  const generateLineSegments = (dataKey) => {
    const segments = [];
    
    for (let i = 0; i < data.length - 1; i++) {
      const current = data[i];
      const next = data[i + 1];
      
      const currentValue = current[dataKey];
      const nextValue = next[dataKey];
      
      if (currentValue !== undefined && nextValue !== undefined) {
        const x1 = scaleX(i);
        const y1 = scaleY(currentValue);
        const x2 = scaleX(i + 1);
        const y2 = scaleY(nextValue);

        segments.push({
          path: `M ${x1} ${y1} L ${x2} ${y2}`,
          isDashed: isArchiveMode ? false : current.tin === 0, // Solid for archive, dynamic for current
          tin: current.tin
        });
      }
    }

    return segments;
  };

  // Generate segments for all three lines
  const currentDebitSegments = generateLineSegments(currDebitKey);
  const techRezhSegments = generateLineSegments(techRezhKey);
  const debitLastDaySegments = generateLineSegments(debitLastDayKey);

  // Format Y-axis values
  const formatYAxis = (value) => 
    Math.abs(value) >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toFixed(0);

  // Generate Y-axis ticks
  const yTicks = Array.from({ length: 6 }, (_, i) => {
    const value = minValue + (valueRange * (i / 5));
    return {
      value,
      y: scaleY(value)
    };
  });

  // Generate X-axis ticks - show every 2 hours instead of every 4
  const xTicks = data.filter((_, i) => i % Math.max(1, Math.floor(data.length / 12)) === 0)
    .map((d, i, arr) => ({
      label: d.name,
      x: scaleX(data.indexOf(d))
    }));

  // Handle mouse events for tooltip
  const handleMouseMove = (event, point, index) => {
    const svgRect = event.currentTarget.closest('svg').getBoundingClientRect();
    
    const tooltipData = {
      label: point.name,
      payload: [
        {
          name: "Дебит по тех.режиму",
          value: point[techRezhKey] || 0,
          color: "#B22222"
        },
        {
          name: "Дебит за предыдущие сутки", 
          value: point[debitLastDayKey] || 0,
          color: "#888888"
        },
        {
          name: "Прогнозируемый дебит на конец суток",
          value: point[currDebitKey] || 0,
          color: "#228B22"
        }
      ].filter(item => item.value !== undefined)
    };

    setTooltip({
      visible: true,
      x: event.clientX - svgRect.left,
      y: event.clientY - svgRect.top - 10,
      data: tooltipData
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ visible: false, x: 0, y: 0, data: null });
  };

  return (
    <div style={{ position: 'relative' }}>
      <style>
        {`
          @keyframes drawLine {
            0% {
              stroke-dasharray: 1000;
              stroke-dashoffset: 1000;
            }
            100% {
              stroke-dasharray: 1000;
              stroke-dashoffset: 0;
            }
          }
          
          @keyframes fadeInDot {
            0% {
              opacity: 0;
              transform: scale(0);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>
      
      <svg width={width} height={height} style={{ border: '1px solid #333', borderRadius: '4px' }}>
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#333" strokeWidth="0.5" opacity="0.1"/>
          </pattern>
        </defs>

        {/* Grid */}
        <rect 
          x={margin.left} 
          y={margin.top} 
          width={chartWidth} 
          height={chartHeight} 
          fill="url(#grid)" 
        />

        {/* Y-axis */}
        <line 
          x1={margin.left} 
          y1={margin.top} 
          x2={margin.left} 
          y2={margin.top + chartHeight} 
          stroke="#ffffff" 
          strokeWidth="1"
        />

        {/* X-axis */}
        <line 
          x1={margin.left} 
          y1={margin.top + chartHeight} 
          x2={margin.left + chartWidth} 
          y2={margin.top + chartHeight} 
          stroke="#ffffff" 
          strokeWidth="1"
        />

        {/* Y-axis ticks and labels */}
        {yTicks.map((tick, i) => (
          <g key={i}>
            <line
              x1={margin.left - 6}
              y1={margin.top + tick.y}
              x2={margin.left}
              y2={margin.top + tick.y}
              stroke="#ffffff"
              strokeWidth="1"
            />
            <text
              x={margin.left - 12}
              y={margin.top + tick.y + 4}
              textAnchor="end"
              fontSize="12"
              fill="#ffffff"
            >
              {formatYAxis(tick.value)}
            </text>
          </g>
        ))}

        {/* X-axis ticks and labels */}
        {xTicks.map((tick, i) => (
          <g key={i}>
            <line
              x1={margin.left + tick.x}
              y1={margin.top + chartHeight}
              x2={margin.left + tick.x}
              y2={margin.top + chartHeight + 6}
              stroke="#ffffff"
              strokeWidth="1"
            />
            <text
              x={margin.left + tick.x}
              y={margin.top + chartHeight + 20}
              textAnchor="middle"
              fontSize="12"
              fill="#ffffff"
            >
              {tick.label}
            </text>
          </g>
        ))}

        {/* Chart content */}
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Tech regime line segments with dynamic styling - NO ANIMATIONS ON PATHS */}
          {techRezhSegments.map((segment, i) => (
            <path
              key={`tech-${i}`}
              d={segment.path}
              fill="none"
              stroke="#B22222"
              strokeWidth="2"
              strokeDasharray={segment.isDashed ? "5 5" : "none"}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Previous day debit line segments with dynamic styling - NO ANIMATIONS ON PATHS */}
          {debitLastDaySegments.map((segment, i) => (
            <path
              key={`lastday-${i}`}
              d={segment.path}
              fill="none"
              stroke="#888888"
              strokeWidth="2"
              strokeDasharray={segment.isDashed ? "5 5" : "none"}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Current debit line segments with dynamic styling - NO ANIMATIONS ON PATHS */}
          {currentDebitSegments.map((segment, i) => (
            <path
              key={`current-${i}`}
              d={segment.path}
              fill="none"
              stroke="#228B22"
              strokeWidth="2"
              strokeDasharray={segment.isDashed ? "5 5" : "none"}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Data points with hover areas and animations - KEEP ANIMATIONS ON DOTS */}
          {data.map((point, i) => {
            const currValue = point[currDebitKey];
            const techValue = point[techRezhKey];
            const lastDayValue = point[debitLastDayKey];

            return (
              <g key={i}>
                {/* Larger invisible hover area for better tooltip interaction */}
                <rect
                  x={scaleX(i) - 15}
                  y={0}
                  width={30}
                  height={chartHeight}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => handleMouseMove(e, point, i)}
                  onMouseLeave={handleMouseLeave}
                />

                {/* Current debit dots with animation */}
                {currValue !== undefined && (
                  <circle
                    cx={scaleX(i)}
                    cy={scaleY(currValue)}
                    r="3"
                    fill="#228B22"
                    stroke="white"
                    strokeWidth="2"
                    style={{ 
                      pointerEvents: 'none',
                      transition: 'all 0.2s ease-in-out',
                      animation: 'fadeInDot 0.5s ease-in-out forwards',
                      animationDelay: `${i * 0.05}s`,
                      opacity: 0
                    }}
                  />
                )}
                
                {/* Tech regime dots with animation */}
                {techValue !== undefined && (
                  <circle
                    cx={scaleX(i)}
                    cy={scaleY(techValue)}
                    r="3"
                    fill="#B22222"
                    stroke="white"
                    strokeWidth="2"
                    style={{ 
                      pointerEvents: 'none',
                      transition: 'all 0.2s ease-in-out',
                      animation: 'fadeInDot 0.5s ease-in-out forwards',
                      animationDelay: `${i * 0.05}s`,
                      opacity: 0
                    }}
                  />
                )}
                
                {/* Last day debit dots with animation */}
                {lastDayValue !== undefined && (
                  <circle
                    cx={scaleX(i)}
                    cy={scaleY(lastDayValue)}
                    r="3"
                    fill="#888888"
                    stroke="white"
                    strokeWidth="2"
                    style={{ 
                      pointerEvents: 'none',
                      transition: 'all 0.2s ease-in-out',
                      animation: 'fadeInDot 0.5s ease-in-out forwards',
                      animationDelay: `${i * 0.05}s`,
                      opacity: 0
                    }}
                  />
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Enhanced Custom Tooltip - KEEP IMPROVED STYLING */}
      {tooltip.visible && tooltip.data && (
        <div
          style={{
            position: 'absolute',
            left: Math.min(tooltip.x + 15, width - 250),
            top: Math.max(tooltip.y - 80, 10),
            backgroundColor: 'rgba(30, 30, 30, 0.95)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            pointerEvents: 'none',
            zIndex: 1000,
            minWidth: '220px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            transform: 'translateY(-5px)',
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <div style={{ 
            fontSize: '12px', 
            color: '#888', 
            marginBottom: '8px',
            fontWeight: '500'
          }}>
            {tooltip.data.label} | {chartDate ? format(parseISO(chartDate), "dd.MM.yyyy") : ""}
          </div>
          
          {tooltip.data.payload.map((entry, index) => (
            <div
              key={`tooltip-${index}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: index < tooltip.data.payload.length - 1 ? '6px' : '0px',
                fontSize: '13px'
              }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: entry.color,
                  borderRadius: '2px',
                  marginRight: '10px',
                  flexShrink: 0
                }}
              />
              <div style={{ 
                color: '#fff',
                fontSize: '13px',
                fontWeight: '400',
                flex: 1
              }}>
                {entry.name}
              </div>
              <div style={{ 
                color: entry.color,
                fontWeight: '600',
                fontSize: '14px',
                marginLeft: '8px'
              }}>
                {entry.value.toLocaleString("ru-RU")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Chart({ type, setType }) {
  const [isNak, setNak] = useState(true);
  const [data, setData] = useState({ liquid: [], oil: [] });
  const [isArchiveMode, setIsArchiveMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chartDate, setChartDate] = useState(null);

  const handleReset = () => {
    setIsArchiveMode(false);
    setSelectedDate(null);
    loadCurrentData();
  };

  useEffect(() => {
    getAvailableArchiveDates()
      .then((response) => {
        setAvailableDates(response.data || []);
      })
      .catch((error) => {
        console.error("Error fetching available dates:", error);
      });
  }, []);

  const parsedAvailableDates = useMemo(() => {
    return availableDates
      .map((d) => {
        try {
          const parsedDate = parseISO(d.date);
          if (isNaN(parsedDate.getTime())) {
            const [year, month, day] = d.date.split("-");
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          }
          return parsedDate;
        } catch (error) {
          console.warn("Failed to parse date:", d.date, error);
          return null;
        }
      })
      .filter((date) => date !== null && !isNaN(date.getTime()));
  }, [availableDates]);

  const loadCurrentData = () => {
    setLoading(true);
    fetch2Hours()
      .then((response) => {
        processAndSetData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching current data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const loadArchiveData = (date) => {
    setLoading(true);
    const dateString = format(date, "yyyy-MM-dd");
    fetch2HoursArchive("ABK", dateString)
      .then((response) => {
        processAndSetData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching archive data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const processAndSetData = (fetchedData) => {
    console.log('=== processAndSetData Debug ===');
    console.log('Raw fetched data:', fetchedData);
    
    const timeToMinutes = (t) => {
      const [h, m] = t?.split(":").map(Number);
      return h * 60 + m;
    };

    const sortedData = [...fetchedData].sort((a, b) => {
      const offset = (t) => {
        const minutes = timeToMinutes(t);
        return (minutes - 120 + 1440) % 1440;
      };
      return offset(a.time) - offset(b.time);
    });

    console.log('Sorted data:', sortedData);

    const chartDate = sortedData[0]?.date || new Date().toISOString().split("T")[0];
    setChartDate(chartDate);

    const formattedData = sortedData.map((item, index) => {
      const formatted = {
        name: item.time?.slice(0, 5) || "",
        
        // Add Tin field to the data (note: field name is 'Tin' with capital T)
        tin: item.Tin !== undefined ? item.Tin : 0,

        debit_last_day: Math.floor(item?.debit_last_day || 0),
        tech_rezh: Math.floor(item?.tech_rezh || 0),
        curr_debit: Math.floor(item?.current_debit || 0),

        debit_last_day_nak: Math.floor(item?.debit_last_day_nak || 0),
        tech_rezh_nak: Math.floor(item?.tech_rezh_nak || 0),
        curr_debit_nak: Math.floor(item?.current_debit_nak || 0),

        n_debit_last_day: Math.floor(item?.n_debit_last_day || 0),
        n_tech_rezh: Math.floor(item?.n_tech_rezh || 0),
        n_curr_debit: Math.floor(item?.n_current_debit || 0),

        n_debit_last_day_nak: Math.floor(item?.n_debit_last_day_nak || 0),
        n_tech_rezh_nak: Math.floor(item?.n_tech_rezh_nak || 0),
        n_curr_debit_nak: Math.floor(item?.n_current_debit_nak || 0),
      };
      
      if (index < 3) { // Log first 3 items
        console.log(`Formatted data item ${index}:`, formatted);
        console.log(`Original item ${index} Tin:`, item.Tin);
      }
      
      return formatted;
    });

    console.log('All formatted data:', formattedData);

    const liquidData = formattedData.map((item) => ({
      name: item.name,
      tin: item.tin, // ✅ CRITICAL: Include tin field
      debit_last_day: item.debit_last_day,
      tech_rezh: item.tech_rezh,
      curr_debit: item.curr_debit,
      debit_last_day_nak: item.debit_last_day_nak,
      tech_rezh_nak: item.tech_rezh_nak,
      curr_debit_nak: item.curr_debit_nak,
    }));

    const oilData = formattedData.map((item) => ({
      name: item.name,
      tin: item.tin, // ✅ CRITICAL: Include tin field - this was missing before!
      debit_last_day: item.n_debit_last_day,
      tech_rezh: item.n_tech_rezh,
      curr_debit: item.n_curr_debit,
      debit_last_day_nak: item.n_debit_last_day_nak,
      tech_rezh_nak: item.n_tech_rezh_nak,
      curr_debit_nak: item.n_curr_debit_nak,
    }));

    console.log('Liquid data:', liquidData);
    console.log('Oil data:', oilData);

    setData({ liquid: liquidData, oil: oilData });
  };

  useEffect(() => {
    loadCurrentData();
  }, []);

  const handleNakChange = (event) => setNak(event.target.checked);
  const handleTypeChange = (event) => setType(event.target.value);
  const handleDateChange = (date) => {
    if (date) {
      setSelectedDate(date);
      setIsArchiveMode(true);
      loadArchiveData(date);
    }
  };

  const selectedData = useMemo(() => {
    const result = isNak
      ? data[type].map((item) => ({ ...item, isNak: true }))
      : data[type];
    
    console.log('=== selectedData Debug ===');
    console.log('Type:', type);
    console.log('IsNak:', isNak);
    console.log('Data[type]:', data[type]);
    console.log('Selected data:', result);
    
    return result;
  }, [data, type, isNak]);

  return (
    <div>
      <div className={styles.controlsContainer}>
        <div className={styles.leftControls}>
          <div className={styles.controlGroup}>
            <input type="checkbox" checked={isNak} onChange={handleNakChange} />
            <label htmlFor="cumulative">Показать с накоплением</label>
          </div>

          <div className={styles.controlGroup}>
            <input
              type="radio"
              id="liquid"
              name="type"
              value="liquid"
              checked={type === "liquid"}
              onChange={handleTypeChange}
            />
            <label htmlFor="liquid">Жидкость</label>
            <span>/</span>
            <input
              type="radio"
              id="oil"
              name="type"
              value="oil"
              checked={type === "oil"}
              onChange={handleTypeChange}
            />
            <label htmlFor="oil">Нефть</label>
          </div>
        </div>

        <div className={styles.rightControls}>
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            highlightDates={parsedAvailableDates}
            placeholderText="Выберите дату"
            className={styles.customDatepicker}
          />

          {isArchiveMode && (
            <button onClick={handleReset} className={styles.resetButton}>
              🔄 Текущие данные
            </button>
          )}

          {loading && <span className={styles.loadingText}>⏳ Загрузка...</span>}
        </div>
      </div>

      <CustomChart 
        data={selectedData}
        width={800}
        height={350}
        isNak={isNak}
        type={type}
        chartDate={chartDate}
        isArchiveMode={isArchiveMode}
      />
    </div>
  );
}