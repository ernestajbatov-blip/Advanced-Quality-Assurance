import React, { useState, useLayoutEffect, useEffect, useRef, useMemo } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Dark from "@amcharts/amcharts5/themes/Dark";
import Slider from "react-slider";
import styles from "./AmChart.module.css";

const AmChart = ({ wellData }) => {
    const chartRef = useRef(null);
    const chartContainerRef = useRef(null);
    const seriesRef = useRef(null);
    const labelRef = useRef(null);
    const xAxisRef = useRef(null);
    const yAxisRef = useRef(null);

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

    useLayoutEffect(() => {
        if (!wellData || wellData.length === 0 || chartRef.current) return;

        const root = am5.Root.new("yearlyChartDiv");
        chartRef.current = root;
        root._logo.dispose();

        root.setThemes([am5themes_Animated.new(root), am5themes_Dark.new(root)]);

        const chart = root.container.children.push(
            am5xy.XYChart.new(root, {
                panX: true,
                panY: true,
                wheelY: "zoomXY",
                pinchZoomX: true,
                pinchZoomY: true,
            })
        );
        chartContainerRef.current = chart;

        chart.gridContainer.toBack();

        const xAxis = chart.xAxes.push(
            am5xy.ValueAxis.new(root, {
                min: -50,
                max: 50,
                strictMinMax: true,
                renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 50 }),
                tooltip: am5.Tooltip.new(root, {}),
            })
        );

        const yAxis = chart.yAxes.push(
            am5xy.ValueAxis.new(root, {
                min: -50,
                max: 50,
                strictMinMax: true,
                renderer: am5xy.AxisRendererY.new(root, { visible: true }),
                tooltip: am5.Tooltip.new(root, {}),
            })
        );

        xAxis.get("renderer").grid.template.setAll({
            stroke: am5.color(0x444444),
            strokeDasharray: [3, 3],
            strokeOpacity: 0.5,
        });

        yAxis.get("renderer").grid.template.setAll({
            stroke: am5.color(0x444444),
            strokeDasharray: [3, 3],
            strokeOpacity: 0.5,
        });

        const colors = [0xf54945, 0x339f1b, 0x3959f2, 0x787878];
        const areas = [
            { x1: -50, y1: -50, x2: 0, y2: 0, color: colors[0] },
            { x1: -50, y1: 0, x2: 0, y2: 50, color: colors[1] },
            { x1: 0, y1: -50, x2: 50, y2: 0, color: colors[2] },
            { x1: 0, y1: 0, x2: 50, y2: 50, color: colors[3] },
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

        const circleTemplate = am5.Template.new({});
        const series = chart.series.push(
            am5xy.LineSeries.new(root, {
                calculateAggregates: true,
                xAxis,
                yAxis,
                valueXField: "x",
                valueYField: "y",
                valueField: "value",
            })
        );

        series.strokes.template.setAll({ visible: false, strokeOpacity: 0 });

        series.bullets.push((root, series, dataItem) =>
            am5.Bullet.new(root, {
                sprite: am5.Circle.new(root, {
                    radius: 10,
                    fill: am5.color(0x000000),
                    fillOpacity: 0.6,
                    tooltipText: `Скважина: ${dataItem.dataContext.well}\nОбводненность: ${dataItem.get("valueX").toFixed(2)}\nНефть: ${dataItem.get("valueY").toFixed(2)}`,
                }, circleTemplate),
            })
        );

        series.set("heatRules", [
            {
                target: circleTemplate,
                min: 3,
                max: 10,
                dataField: "value",
                key: "radius",
                maxValue: 2000,
            },
        ]);

        chart.set("cursor", am5xy.XYCursor.new(root, { xAxis, yAxis }));

        const label = chart.plotContainer.children.push(
            am5.Label.new(root, {
                text: currentDate || "",
                fontSize: "2em",
                fill: am5.color(0x000000),
                opacity: 0.3,
            })
        );

        xAxisRef.current = xAxis;
        yAxisRef.current = yAxis;
        seriesRef.current = series;
        labelRef.current = label;

        return () => {
            root.dispose();
            chartRef.current = null;
            chartContainerRef.current = null;
            seriesRef.current = null;
            xAxisRef.current = null;
            yAxisRef.current = null;
            labelRef.current = null;
        };
    }, [wellData]);

    const wellHistory = useMemo(() => {
        const history = {};
        wellData.forEach(item => {
            const date = new Date(item.date).toISOString().split("T")[0];
            if (!history[item.well]) {
                history[item.well] = {};
            }
            history[item.well][date] = item;
        });
        return history;
    }, [wellData]);

    const updateSeriesData = () => {
        const chart = chartContainerRef.current;
        const root = chartRef.current;
        
        if (!chart || !root || root._disposed) return;
    
        const toRemove = [];
        chart.series.each((series) => {
            if (series.get("name") && series.get("name") !== "main") {
                toRemove.push(series);
            }
        });
        toRemove.forEach(s => s.dispose());
    
        const cutoffDate = new Date(currentDate);
    
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
    
        Object.entries(wellHistory).forEach(([well, dateMap]) => {
            const data = Object.entries(dateMap)
                .filter(([dateStr]) => new Date(dateStr) <= cutoffDate)
                .map(([, item]) => {
                    if (
                        item.tm_oil_prev != null &&
                        item.tm_water_prev != null &&
                        item.tm_oil_prev !== 0 &&
                        item.tm_water_prev !== 0
                    ) {
                        const x = item.tm_water - item.tm_water_prev;
                        const y = item.tm_oil - item.tm_oil_prev;
    
                        minX = Math.min(minX, x);
                        maxX = Math.max(maxX, x);
                        minY = Math.min(minY, y);
                        maxY = Math.max(maxY, y);
    
                        return {
                            x,
                            y,
                            well,
                        };
                    } else {
                        return null;
                    }
                })
                .filter(Boolean);
    
            if (data.length > 0) {
                const newSeries = chart.series.push(
                    am5xy.LineSeries.new(root, {
                        name: well,
                        xAxis: xAxisRef.current,
                        yAxis: yAxisRef.current,
                        valueXField: "x",
                        valueYField: "y",
                        connect: false,
                    })
                );
    
                newSeries.strokes.template.setAll({
                    strokeWidth: 0,
                    visible: false,
                });
    
                newSeries.bullets.push(() =>
                    am5.Bullet.new(root, {
                        sprite: am5.Circle.new(root, {
                            radius: 4,
                            fill: am5.color(0x000000),
                            tooltipText: `Скважина: ${well}`,
                        }),
                    })
                );
    
                newSeries.data.setAll(data);
            }
        });
    
        xAxisRef.current.set("min", minX - 5);  
        xAxisRef.current.set("max", maxX + 5);  
        yAxisRef.current.set("min", minY - 5);  
        yAxisRef.current.set("max", maxY + 5);  
    };
    
    
    
    
    useEffect(() => {
        if (currentDate && chartRef.current && !chartRef.current._disposed) {
            updateSeriesData();
            if (labelRef.current) {
                labelRef.current.set("text", currentDate);
            }
        }
    }, [currentDate, wellHistory]);    

    return (
        <div>
            <div id="yearlyChartDiv" className={styles.chart}></div>
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
    );
};

export default AmChart;
