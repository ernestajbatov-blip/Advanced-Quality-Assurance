import React, { useState, useLayoutEffect, useEffect, useMemo, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Dark from "@amcharts/amcharts5/themes/Dark";
import Slider from "react-slider";
import styles from "./AmChart.module.css";

const AmChart = ({ wellData, onReset }) => {
  const chartRef = useRef(null);
  const seriesRef = useRef({});
  const rootRef = useRef(null);
  const labelRef = useRef(null);
  const bgSeriesRef = useRef([]);
  const updateTimeoutRef = useRef(null);
  const [currentTimePoint, setCurrentTimePoint] = useState(null);
  const [viewMode, setViewMode] = useState("daily");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const monthNamesRU = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];

  // Process dates based on the view mode
  const timePoints = useMemo(() => {
    // Helper function to get week number
    const getWeekNumber = (d) => {
      const date = new Date(d);
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
      const week1 = new Date(date.getFullYear(), 0, 4);
      return 1 + Math.round(((date - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    };

    // Helper function to get the first day of a week
    const getFirstDayOfWeek = (dateStr) => {
      const date = new Date(dateStr);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const firstDay = new Date(date.setDate(diff));
      return firstDay.toISOString().split("T")[0];
    };

    // Helper function to get month key
    const getMonthKey = (dateStr) => {
      const date = new Date(dateStr);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    };

    // Get all unique dates from well data
    const allDates = Array.from(
      new Set(
        wellData.map((item) => new Date(item.date).toISOString().split("T")[0])
      )
    ).sort((a, b) => new Date(a) - new Date(b));

    if (viewMode === "daily") {
      return allDates;
    } else if (viewMode === "weekly") {
      // Group by week
      const weekMap = {};
      allDates.forEach(date => {
        const weekKey = `${new Date(date).getFullYear()}-W${getWeekNumber(date)}`;
        const firstDayOfWeek = getFirstDayOfWeek(date);
        weekMap[weekKey] = firstDayOfWeek;
      });
      return Object.values(weekMap).sort((a, b) => new Date(a) - new Date(b));
    } else if (viewMode === "monthly") {
      // Group by month
      const monthMap = {};
      allDates.forEach(date => {
        const monthKey = getMonthKey(date);
        const firstDayOfMonth = `${monthKey}-01`;
        monthMap[monthKey] = firstDayOfMonth;
      });
      return Object.values(monthMap).sort((a, b) => new Date(a) - new Date(b));
    }
    
    return allDates;
  }, [wellData, viewMode]);

  useEffect(() => {
    if (timePoints.length > 0) {
      setCurrentTimePoint(timePoints[timePoints.length - 1]);
    }
  }, [timePoints]);  

  const wells = useMemo(() => {
    return Array.from(new Set(wellData.map(item => item.well)));
  }, [wellData]);

  const wellPositionHistory = useMemo(() => {
    const history = {};
    
    wells.forEach(well => {
      history[well] = {
        initialPosition: { x: 0, y: 0, well },
        positions: {}
      };
    });
    
    wellData
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .forEach(item => {
        const date = new Date(item.date).toISOString().split("T")[0];
        const { well } = item;
        
        if (item.tm_fluid_prev != null && 
            item.tm_water_prev != null && 
            item.tm_fluid_prev !== 0 && 
            item.tm_water_prev !== 0) {
          const x = item.tm_water - item.tm_water_prev;
          const y = item.tm_fluid - item.tm_fluid_prev;
          
          history[well].positions[date] = { 
            x, 
            y, 
            well,
            date 
          };
        }
      });
    
    return history;
  }, [wellData, wells]);

  const getWellPositionsForTimePoint = (timePoint) => {
    const positions = {};
    const targetDate = new Date(timePoint);
    
    let endDate = new Date(targetDate);
    if (viewMode === "weekly") {
      endDate.setDate(endDate.getDate() + 6); // Last day of the week
    } else if (viewMode === "monthly") {
      endDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0); // Last day of the month
    }
    
    wells.forEach(well => {
      let position = { ...wellPositionHistory[well].initialPosition };
      
      let relevantDates;
      
      if (viewMode === "daily") {
        relevantDates = Object.keys(wellPositionHistory[well].positions)
          .filter(d => new Date(d) <= targetDate)
          .sort((a, b) => new Date(b) - new Date(a));
      } else {
        relevantDates = Object.keys(wellPositionHistory[well].positions)
          .filter(d => {
            const date = new Date(d);
            return date >= targetDate && date <= endDate;
          })
          .sort((a, b) => new Date(a) - new Date(b));
        
        if (relevantDates.length === 0) {
          relevantDates = Object.keys(wellPositionHistory[well].positions)
            .filter(d => new Date(d) < targetDate)
            .sort((a, b) => new Date(b) - new Date(a));
        }
      }

      if (relevantDates.length > 0) {
        if (viewMode === "daily") {
          position = { ...wellPositionHistory[well].positions[relevantDates[0]] };
        } else {
          let sumX = 0;
          let sumY = 0;
          
          relevantDates.forEach(date => {
            const pos = wellPositionHistory[well].positions[date];
            sumX += pos.x;
            sumY += pos.y;
          });
          
          position = { 
            x: sumX, 
            y: sumY, 
            well,
            date: timePoint
          };
        }
      }
      
      positions[well] = position;
    });
    
    return positions;
  };

  const debouncedUpdateColorZones = () => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      updateColorZones();
      updateTimeoutRef.current = null;
    }, 100);
  };

  const updateColorZones = () => {
    if (!rootRef.current || rootRef.current._disposed) return;
    
    const chart = chartRef.current;
    if (!chart) return;
    
    const xAxis = chart.xAxes.getIndex(0);
    const yAxis = chart.yAxes.getIndex(0);
    
    if (!xAxis || !yAxis) return;
    
    const xMin = xAxis.getPrivate("min", xAxis.get("min"));
    const xMax = xAxis.getPrivate("max", xAxis.get("max"));
    const yMin = yAxis.getPrivate("min", yAxis.get("min"));
    const yMax = yAxis.getPrivate("max", yAxis.get("max"));
    
    if (!isFinite(xMin) || !isFinite(xMax) || !isFinite(yMin) || !isFinite(yMax)) {
      return;
    }
    
    const areas = [
      { x1: xMin, y1: yMin, x2: 0, y2: 0, color: 0xf54945 }, // Bottom-left quadrant
      { x1: xMin, y1: 0, x2: 0, y2: yMax, color: 0x339f1b }, // Top-left quadrant
      { x1: 0, y1: yMin, x2: xMax, y2: 0, color: 0x3959f2 }, // Bottom-right quadrant
      { x1: 0, y1: 0, x2: xMax, y2: yMax, color: 0x787878 }, // Top-right quadrant
    ];
    
    if (bgSeriesRef.current.length === 0) {
      areas.forEach((area, index) => {
        const bgSeries = chart.series.push(
          am5xy.LineSeries.new(rootRef.current, {
            xAxis: xAxis,
            yAxis: yAxis,
            valueXField: "ax",
            valueYField: "ay",
            fill: am5.color(area.color),
          })
        );
  
        bgSeries.fills.template.setAll({
          fillOpacity: 0.5,
          inside: true,
          visible: true,
        });
        bgSeries.strokes.template.set("forceHidden", true);
  
        bgSeries.data.setAll([
          { ax: area.x1, ay: area.y1 },
          { ax: area.x2, ay: area.y1 },
          { ax: area.x2, ay: area.y2 },
          { ax: area.x1, ay: area.y2 },
        ]);
        
        bgSeriesRef.current[index] = bgSeries;
      });
    } else {
      areas.forEach((area, index) => {
        if (bgSeriesRef.current[index]) {
          bgSeriesRef.current[index].data.setAll([
            { ax: area.x1, ay: area.y1 },
            { ax: area.x2, ay: area.y1 },
            { ax: area.x2, ay: area.y2 },
            { ax: area.x1, ay: area.y2 },
          ]);
        }
      });
    }
  };

  useLayoutEffect(() => {
    if (!wellData || wellData.length === 0 || rootRef.current) return;
  
    const root = am5.Root.new("yearlyChartDiv");
    rootRef.current = root;
    root._logo.dispose();
    root.setThemes([am5themes_Animated.new(root), am5themes_Dark.new(root)]);

    root.container.set("paddingBottom", 0);
    root.container.set("paddingTop", 0);
    root.container.set("paddingLeft", 0);
    root.container.set("paddingRight", 0);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelY: "zoomXY",
        pinchZoomX: true,
        pinchZoomY: true,
        animationDuration: 600,
        paddingBottom: 10,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 10,
        layout: root.verticalLayout,
        maxHeight: am5.percent(100)
      })
    );
    chartRef.current = chart;

    chart.gridContainer.toBack();

    const xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        min: -15, 
        max: 15,  
        strictMinMax: false,
        renderer: am5xy.AxisRendererX.new(root, { 
          minGridDistance: 50,
          centerY: am5.p50,
          centerX: am5.p50
        }),
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    xAxis.set("title", am5.Label.new(root, {
      text: "ΔОбводненность",
      fontSize: "1em",
      fill: am5.color(0xffffff),
      opacity: 0.8
    }));
  
    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        min: -15, 
        max: 15,  
        strictMinMax: false,
        renderer: am5xy.AxisRendererY.new(root, { 
          visible: true,
          centerY: am5.p50,
          centerX: am5.p50
        }),
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    yAxis.set("title", am5.Label.new(root, {
      text: "ΔЖидкость", 
      fontSize: "1em",
      fill: am5.color(0xffffff),
      opacity: 0.8
    }));
  
    xAxis.events.on("rangechanged", debouncedUpdateColorZones);
    yAxis.events.on("rangechanged", debouncedUpdateColorZones);

    const gridStyles = {
      stroke: am5.color(0x444444),
      strokeDasharray: [3, 3],
      strokeOpacity: 0.5,
    };

    xAxis.get("renderer").grid.template.setAll(gridStyles);
    yAxis.get("renderer").grid.template.setAll(gridStyles);

    bgSeriesRef.current = [];

    wells.forEach(well => {
      const series = chart.series.push(
        am5xy.LineSeries.new(root, {
          name: well,
          xAxis,
          yAxis,
          valueXField: "x",
          valueYField: "y",
          connect: false,
        })
      );

      series.strokes.template.setAll({
        strokeWidth: 0,
        visible: false,
      });

      series.bullets.push((root) =>
        am5.Bullet.new(root, {
          sprite: am5.Circle.new(root, {
            radius: 5,
            fill: am5.color(0x000000),
            fillOpacity: 0.6,
            tooltipText: "Скважина: {well}\nΔОбводненность: {x}\nΔЖидкость: {y}",
          })
        })
      );

      seriesRef.current[well] = series;
    });

    const cursor = am5xy.XYCursor.new(root, { xAxis, yAxis });
    chart.set("cursor", cursor);

    root.events.on("frameended", () => {
      updateColorZones();
    });

    const labelContainer = root.container.children.push(
      am5.Container.new(root, {
        paddingTop: 5,
        paddingLeft: 10,
        layout: root.horizontalLayout,
        width: am5.percent(100),
        height: 30,
        verticalCenter: "top",
        horizontalCenter: "left",
        x: 70,
        y: 0
      })
    );

    const label = labelContainer.children.push(
      am5.Label.new(root, {
        text: currentTimePoint || "",
        fontSize: "1.2em",
        fill: am5.color(0xffffff),
        opacity: 0.7,
        verticalCenter: "middle",
        horizontalCenter: "left"
      })
    );
    
    labelRef.current = label;

    const resizeObserver = new ResizeObserver(() => {
      if (rootRef.current && !rootRef.current._disposed) {
        rootRef.current.resize();
        debouncedUpdateColorZones();
      }
    });
    
    const chartDiv = document.getElementById("yearlyChartDiv");
    if (chartDiv) {
      resizeObserver.observe(chartDiv);
    }

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      resizeObserver.disconnect();
      root.dispose();
      rootRef.current = null;
      chartRef.current = null;
      labelRef.current = null;
      seriesRef.current = {};
      bgSeriesRef.current = [];
    };
  }, [wellData, wells]);

  useEffect(() => {
    if (!currentTimePoint || !chartRef.current || !rootRef.current || rootRef.current._disposed) return;
  
    const chart = chartRef.current;
    const positions = getWellPositionsForTimePoint(currentTimePoint);
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
  
    wells.forEach(well => {
      const series = seriesRef.current[well];
      if (series) {
        const position = positions[well];
        series.data.setAll([position]);
        series.show();
        
        if (position) {
          minX = Math.min(minX, position.x);
          maxX = Math.max(maxX, position.x);
          minY = Math.min(minY, position.y);
          maxY = Math.max(maxY, position.y);
        }
      }
    });
  
    if (isFinite(minX) && isFinite(maxX) && isFinite(minY) && isFinite(maxY)) {
      const padding = 3;
      const xAxis = chart.xAxes.getIndex(0);
      const yAxis = chart.yAxes.getIndex(0);
  
      xAxis.set("min", Math.min(-15, minX - padding));
      xAxis.set("max", Math.max(15, maxX + padding));
      yAxis.set("min", Math.min(-15, minY - padding));
      yAxis.set("max", Math.max(15, maxY + padding));
    }
  
    let formattedLabel = currentTimePoint;
    if (viewMode === "weekly") {
      const startDate = new Date(currentTimePoint);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      formattedLabel = `${currentTimePoint} - ${endDate.toISOString().split("T")[0]}`;
    } else if (viewMode === "monthly") {
      const date = new Date(currentTimePoint);
      formattedLabel = `${monthNamesRU[date.getMonth()]} ${date.getFullYear()}`;
    }
    
    if (labelRef.current) {
      labelRef.current.set("text", formattedLabel);
    }
    
  }, [currentTimePoint, viewMode, wellPositionHistory, wells, monthNamesRU]);

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (timePoints.length > 0) {
      setCurrentTimePoint(timePoints[timePoints.length - 1]);
    }
  };

  const formatDateForDisplay = (dateStr) => {
    const date = new Date(dateStr);
    if (viewMode === "weekly") {
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 6);
      return `${dateStr} - ${endDate.toISOString().split("T")[0]}`;
    } else if (viewMode === "monthly") {
      return `${monthNamesRU[date.getMonth()]} ${date.getFullYear()}`;
    }
    return dateStr;
  };

  return (
    <div className={styles.chartWrapper}>
      <div className={styles.chartHeader}>
        <div className={styles.viewControls}>
          <button 
            className={`${styles.viewButton} ${viewMode === "daily" ? styles.activeView : ""}`}
            onClick={() => handleViewModeChange("daily")}
          >
            Ежедневно
          </button>
          <button 
            className={`${styles.viewButton} ${viewMode === "weekly" ? styles.activeView : ""}`}
            onClick={() => handleViewModeChange("weekly")}
          >
            Еженедельно
          </button>
          <button 
            className={`${styles.viewButton} ${viewMode === "monthly" ? styles.activeView : ""}`}
            onClick={() => handleViewModeChange("monthly")}
          >
            Ежемесячно
          </button>
          <button 
            className={styles.datePickerButton}
            onClick={() => setShowDatePicker(!showDatePicker)}
          >
            Выбрать дату
          </button>
          {onReset && (
            <button onClick={onReset} className={styles.resetButton}>
              ↻
            </button>
          )}
        </div>
        {showDatePicker && (
          <div className={styles.datePickerDropdown}>
            <div className={styles.datePickerHeader}>
              <span>Выберите дату:</span>
              <button onClick={() => setShowDatePicker(false)}>×</button>
            </div>
            <div className={styles.datePickerList}>
              {timePoints.map((date, index) => (
                <button
                  key={index}
                  className={`${styles.datePickerItem} ${date === currentTimePoint ? styles.selectedDate : ""}`}
                  onClick={() => {
                    setCurrentTimePoint(date);
                    setShowDatePicker(false);
                  }}
                >
                  {formatDateForDisplay(date)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div id="yearlyChartDiv" className={styles.chart}></div>
      {timePoints.length > 0 && (
        <div className={styles.sliderContainer}>
          <Slider
            min={0}
            max={timePoints.length - 1}
            step={1}
            value={timePoints.indexOf(currentTimePoint)}
            onChange={(value) => setCurrentTimePoint(timePoints[value])}
            className={styles.slider}
            thumbClassName={styles.sliderThumb}
            trackClassName={styles.sliderTrack}
          />
        </div>
      )}
    </div>
  );
};

export default AmChart;