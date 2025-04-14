import React, { useState, useLayoutEffect, useEffect, useRef, useMemo } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Dark from "@amcharts/amcharts5/themes/Dark";
import Slider from "react-slider";
import styles from "./AmChart.module.css";

const AmChart = ({ wellData }) => {
    const chartRef = useRef(null);
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

        chart.gridContainer.toBack();

        const xAxis = chart.xAxes.push(
            am5xy.ValueAxis.new(root, {
                min: -50,
                max: 50,
                strictMinMax: true,
                renderer: am5xy.AxisRendererX.new(root, {
                    minGridDistance: 50,
                }),
                tooltip: am5.Tooltip.new(root, {}),
            })
        );

        const yAxis = chart.yAxes.push(
            am5xy.ValueAxis.new(root, {
                min: -50,
                max: 50,
                strictMinMax: true,
                renderer: am5xy.AxisRendererY.new(root, {
                    visible: true,
                }),
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

        series.strokes.template.setAll({
            visible: false,
            strokeOpacity: 0,
        });

        series.bullets.push((root, series, dataItem) => {
            return am5.Bullet.new(root, {
                sprite: am5.Circle.new(
                    root,
                    {
                        radius: 10,
                        fill: am5.color(0x000000),
                        fillOpacity: 0.6,
                        tooltipText: `Скважина: ${dataItem.dataContext.well}\nОбводненность: ${dataItem.get("valueX").toFixed(2)}\nНефть: ${dataItem.get("valueY").toFixed(2)}`,
                    },
                    circleTemplate
                ),
            });
        });

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

        seriesRef.current = series;
        labelRef.current = label;
        xAxisRef.current = xAxis;
        yAxisRef.current = yAxis;

        return () => {
            root.dispose();
            chartRef.current = null;
            seriesRef.current = null;
            xAxisRef.current = null;
            yAxisRef.current = null;
            labelRef.current = null;
        };
    }, [wellData]);

    const updateSeriesData = (data) => {
        if (!Array.isArray(data) || !seriesRef.current || !currentDate) return;

        const filteredByDate = data.filter(item => {
            const itemDate = new Date(item.date).toISOString().split("T")[0];
            return itemDate === currentDate;
        });

        const transformed = filteredByDate
            .filter(item => {
                const valid = item.tm_oil_prev != null && item.tm_water_prev != null &&
                    item.tm_oil_prev !== 0 && item.tm_water_prev !== 0;
                return valid;
            })
            .map(item => {
                const deltaWater = item.tm_water - item.tm_water_prev;
                const deltaOil = item.tm_oil - item.tm_oil_prev;

                return {
                    x: deltaWater,
                    y: deltaOil,
                    value: item.tr_fluid,
                    well: item.well,
                };
            });

        console.log("Updating chart for:", currentDate, transformed);

        seriesRef.current.data.setAll(transformed);

        if (xAxisRef.current && yAxisRef.current && transformed.length > 0) {
            const xValues = transformed.map(item => item.x);
            const yValues = transformed.map(item => item.y);

            const xMin = Math.min(...xValues) - 5;
            const xMax = Math.max(...xValues) + 5;
            const yMin = Math.min(...yValues) - 5;
            const yMax = Math.max(...yValues) + 5;

            xAxisRef.current.set("min", xMin);
            xAxisRef.current.set("max", xMax);
            yAxisRef.current.set("min", yMin);
            yAxisRef.current.set("max", yMax);
        }
    };

    useEffect(() => {
        if (wellData && currentDate) {
            updateSeriesData(wellData);
            if (labelRef.current) {
                labelRef.current.set("text", currentDate);
            }
        }
    }, [currentDate, wellData]);

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
