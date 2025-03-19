import React, { useState, useLayoutEffect, useEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Dark from "@amcharts/amcharts5/themes/Dark";
import Slider from "react-slider";
import styles from "./AmChart.module.css";

const AmChart = ({ wellData }) => {
    const chartRef = useRef(null);
    const [currentDate, setCurrentDate] = useState(null);
    const [currentYear, setCurrentYear] = useState(null);
    const seriesRef = useRef(null);
    const labelRef = useRef(null);

    const dates = Array.from(
        new Set(
            wellData.map((item) => new Date(item.date).toISOString().split("T")[0])
        )
    ).sort((a, b) => new Date(a) - new Date(b));

    useEffect(() => {
        if (dates.length > 0 && !currentDate) {
            setCurrentDate(dates[0]);
            setCurrentYear(new Date(dates[0]).getFullYear());
        }
    }, [dates, currentDate]);

    useEffect(() => {
        if (currentDate) {
            const year = new Date(currentDate).getFullYear();
            if (year !== currentYear) {
                setCurrentYear(year);
            }
        }
    }, [currentDate, currentYear]);

    useLayoutEffect(() => {
        if (!wellData || wellData.length === 0 || !currentDate || !currentYear) {
            return;
        }

        if (chartRef.current) {
            chartRef.current.dispose();
        }

        let root = am5.Root.new("yearlyChartDiv");
        chartRef.current = root;

        root._logo.dispose();

        root.setThemes([am5themes_Animated.new(root), am5themes_Dark.new(root)]);

        let chart = root.container.children.push(
            am5xy.XYChart.new(root, {
                panX: true,
                panY: true,
                wheelY: "zoomXY",
                pinchZoomX: true,
                pinchZoomY: true,
            })
        );
        chart.gridContainer.toBack();

        let xAxis = chart.xAxes.push(
            am5xy.ValueAxis.new(root, {
                min: 0,
                max: 100,
                renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 50 }),
                tooltip: am5.Tooltip.new(root, {}),
            })
        );

        xAxis.get("renderer").grid.template.setAll({
            stroke: am5.color(0x000000),
            strokeOpacity: 1,
            strokeDasharray: [3, 3],
        });

        let yAxis = chart.yAxes.push(
            am5xy.ValueAxis.new(root, {
                min: 0,
                max: 100,
                renderer: am5xy.AxisRendererY.new(root, {
                    inside: true,
                    visible: true,
                    zIndex: 1000,
                }),
                tooltip: am5.Tooltip.new(root, {}),
            })
        );

        yAxis.get("renderer").labels.template.setAll({
            zIndex: 200000,
            paddingLeft: 300,
        });

        yAxis.get("renderer").grid.template.setAll({
            strokeOpacity: 1,
            strokeDasharray: [3, 3],
        });

        const colors = [0xe3853c, 0x48b2b7, 0x91d1da, 0xe8c634];
        const areas = [
            { x1: 0, y1: 0, x2: 50, y2: 50, color: colors[0] },
            { x1: 0, y1: 50, x2: 50, y2: 100, color: colors[1] },
            { x1: 50, y1: 0, x2: 100, y2: 50, color: colors[2] },
            { x1: 50, y1: 50, x2: 100, y2: 100, color: colors[3] },
        ];

        areas.forEach((area, index) => {
            let series = chart.series.push(
                am5xy.LineSeries.new(root, {
                    xAxis: xAxis,
                    yAxis: yAxis,
                    valueXField: "ax",
                    valueYField: "ay",
                    fill: am5.color(area.color),
                })
            );

            series.fills.template.setAll({
                fillOpacity: 0.5,
                inside: true,
                visible: true,
            });
            series.strokes.template.set("forceHidden", true);

            series.data.setAll([
                { ax: area.x1, ay: area.y1 },
                { ax: area.x2, ay: area.y1 },
                { ax: area.x2, ay: area.y2 },
                { ax: area.x1, ay: area.y2 },
            ]);
        });

        const series = chart.series.push(
            am5xy.LineSeries.new(root, {
                calculateAggregates: true,
                xAxis: xAxis,
                yAxis: yAxis,
                valueYField: "y",
                valueXField: "x",
                valueField: "value",
                interpolationDuration: 1000,
                interpolationEasing: am5.ease.out(am5.ease.cubic),
            })
        );

        series.strokes.template.set("visible", false);

        let circleTemplate = am5.Template.new({});
        series.bullets.push((root, series, dataItem) =>
            am5.Bullet.new(root, {
                key: `bullet-${dataItem.dataContext.well}-${dataItem.get("valueX")}`,
                sprite: am5.Circle.new(root, {
                    radius: 10,
                    fill: am5.color(0x000000),
                    fillOpacity: 0.6,
                    tooltipText: `Скважина: ${
                        dataItem.dataContext.well
                    } Обводненность: ${dataItem.get("valueX").toFixed(2)} Нефть: ${dataItem
                        .get("valueY")
                        .toFixed(2)}`,
                }),
            })
        );

        series.set("heatRules", [
            {
                target: circleTemplate,
                min: 3,
                max: 35,
                dataField: "value",
                key: "radius",
                maxValue: 2000,
            },
        ]);

        chart.set("cursor", am5xy.XYCursor.new(root, { xAxis, yAxis }));

        let label = chart.plotContainer.children.push(
            am5.Label.new(root, {
                text: currentDate,
                fontSize: "2em",
                fill: am5.color(0x000000),
                opacity: 0.3,
            })
        );
        labelRef.current = label;

        seriesRef.current = series;

        updateSeriesData(wellData);

        return () => {
            if (chartRef.current) {
                chartRef.current.dispose();
            }
        };
    }, [wellData, currentYear]);

    const updateSeriesData = (data) => {
        if (Array.isArray(data)) {
            const filteredData = data.filter(
                (item) => new Date(item.date).toISOString().split("T")[0] === currentDate
            );
            if (seriesRef.current) {
                seriesRef.current.data.setAll(
                    filteredData.map((item) => ({
                        x: item.tm_water,
                        y: item.tm_oil,
                        value: item.tr_fluid,
                        well: item.well,
                    }))
                );
            }
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
