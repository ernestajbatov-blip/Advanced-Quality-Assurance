import React, { useState, useLayoutEffect, useEffect, useMemo, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Dark from "@amcharts/amcharts5/themes/Dark";
import Slider from "react-slider";
import styles from "./AmChart.module.css";

const AmChart = ({ wellData }) => {
  const chartRef = useRef(null);
  const seriesRef = useRef({});
  const rootRef = useRef(null);
  const labelRef = useRef(null);
  const [currentDate, setCurrentDate] = useState(null);

  const dates = useMemo(() => {
    return Array.from(
      new Set(
        wellData.map((item) => new Date(item.date).toISOString().split("T")[0])
      )
    ).sort((a, b) => new Date(a) - new Date(b));
  }, [wellData]);

  useEffect(() => {
    if (dates.length > 0 && !currentDate) {
      setCurrentDate(dates[0]);
    }
  }, [dates, currentDate]);

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
        
        if (item.tm_oil_prev != null && 
            item.tm_water_prev != null && 
            item.tm_oil_prev !== 0 && 
            item.tm_water_prev !== 0) {
          const x = item.tm_water - item.tm_water_prev;
          const y = item.tm_oil - item.tm_oil_prev;
          
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

  const getWellPositionsForDate = (date) => {
    const positions = {};
    const targetDate = new Date(date);
    
    wells.forEach(well => {
      let position = { ...wellPositionHistory[well].initialPosition };
      
      const wellDates = Object.keys(wellPositionHistory[well].positions)
        .filter(d => new Date(d) <= targetDate)
        .sort((a, b) => new Date(b) - new Date(a));
      
      if (wellDates.length > 0) {
        position = { ...wellPositionHistory[well].positions[wellDates[0]] };
      }
      
      positions[well] = position;
    });
    
    return positions;
  };

  useLayoutEffect(() => {
    if (!wellData || wellData.length === 0 || rootRef.current) return;

    const root = am5.Root.new("yearlyChartDiv");
    rootRef.current = root;
    root._logo.dispose();
    root.setThemes([am5themes_Animated.new(root), am5themes_Dark.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelY: "zoomXY",
        pinchZoomX: true,
        pinchZoomY: true,
        animationDuration: 600,
      })
    );
    chartRef.current = chart;

    chart.gridContainer.toBack();

    const xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        min: -15, 
        max: 15,  
        strictMinMax: true,
        renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 50 }),
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        min: -15, 
        max: 15,  
        strictMinMax: true,
        renderer: am5xy.AxisRendererY.new(root, { visible: true }),
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    const gridStyles = {
      stroke: am5.color(0x444444),
      strokeDasharray: [3, 3],
      strokeOpacity: 0.5,
    };

    xAxis.get("renderer").grid.template.setAll(gridStyles);
    yAxis.get("renderer").grid.template.setAll(gridStyles);

    const areas = [
      { x1: -15, y1: -15, x2: 0, y2: 0, color: 0xf54945 }, 
      { x1: -15, y1: 0, x2: 0, y2: 15, color: 0x339f1b },  
      { x1: 0, y1: -15, x2: 15, y2: 0, color: 0x3959f2 },  
      { x1: 0, y1: 0, x2: 15, y2: 15, color: 0x787878 },   
    ];

    areas.forEach((area) => {
      const bgSeries = chart.series.push(
        am5xy.LineSeries.new(root, {
          xAxis,
          yAxis,
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
    });

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
            tooltipText: "Скважина: {well}\nΔОбводненность: {x}\nΔНефть: {y}",
          })
        })
      );

      seriesRef.current[well] = series;
    });

    chart.set("cursor", am5xy.XYCursor.new(root, { xAxis, yAxis }));

    const labelContainer = root.container.children.push(
      am5.Container.new(root, {
        paddingTop: 10,
        paddingLeft: 10,
        layout: root.horizontalLayout,
        width: am5.percent(100),
        height: am5.percent(100),
        verticalCenter: "top",
        horizontalCenter: "left",
        x: 50,
        y: 0
      })
    );

    const label = labelContainer.children.push(
      am5.Label.new(root, {
        text: currentDate || "",
        fontSize: "1.5em",
        fill: am5.color(0xffffff),
        opacity: 0.7,
        verticalCenter: "top",
        horizontalCenter: "left"
      })
    );
    
    labelRef.current = label;

    return () => {
      root.dispose();
      rootRef.current = null;
      chartRef.current = null;
      labelRef.current = null;
      seriesRef.current = {};
    };
  }, [wellData, wells]);

  useEffect(() => {
    if (!currentDate || !chartRef.current || !rootRef.current || rootRef.current._disposed) return;

    const chart = chartRef.current;
    const positions = getWellPositionsForDate(currentDate);
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

    if (labelRef.current) {
      labelRef.current.set("text", currentDate);
    }
    
  }, [currentDate, wellPositionHistory, wells]);

  return (
    <div>
      <div id="yearlyChartDiv" className={styles.chart}></div>
      {dates.length > 0 && (
        <div className={styles.sliderContainer}>
          <Slider
            min={0}
            max={dates.length - 1}
            step={1}
            value={dates.indexOf(currentDate)}
            onChange={(value) => setCurrentDate(dates[value])}
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