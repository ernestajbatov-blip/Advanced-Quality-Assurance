// @ts-nocheck
function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
import React, { useState, useEffect, useMemo } from "react";
import { fetch2Hours, fetch2HoursArchive, getAvailableArchiveDates } from "../../axios/wellService";
import styles from "./Chart.module.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parseISO, isSameDay, format } from "date-fns";
import * as XLSX from "xlsx";

// Custom Tooltip Component
const CustomTooltip = ({
  active,
  payload,
  label,
  chartDate
}) => {
  if (stryMutAct_9fa48("109")) {
    {}
  } else {
    stryCov_9fa48("109");
    if (stryMutAct_9fa48("112") ? active && payload || payload.length : stryMutAct_9fa48("111") ? false : stryMutAct_9fa48("110") ? true : (stryCov_9fa48("110", "111", "112"), (stryMutAct_9fa48("114") ? active || payload : stryMutAct_9fa48("113") ? true : (stryCov_9fa48("113", "114"), active && payload)) && payload.length)) {
      if (stryMutAct_9fa48("115")) {
        {}
      } else {
        stryCov_9fa48("115");
        return <div className={styles.customTooltip}>
        {payload.map(stryMutAct_9fa48("116") ? () => undefined : (stryCov_9fa48("116"), (entry, index) => <div key={stryMutAct_9fa48("117") ? `` : (stryCov_9fa48("117"), `item-${index}`)} className={stryMutAct_9fa48("118") ? `` : (stryCov_9fa48("118"), `${styles.tooltipItem} ${(stryMutAct_9fa48("121") ? entry.name !== "Дебит за предыдущие сутки" : stryMutAct_9fa48("120") ? false : stryMutAct_9fa48("119") ? true : (stryCov_9fa48("119", "120", "121"), entry.name === (stryMutAct_9fa48("122") ? "" : (stryCov_9fa48("122"), "Дебит за предыдущие сутки")))) ? styles.tooltipGray : (stryMutAct_9fa48("125") ? entry.name !== "Дебит по тех.режиму" : stryMutAct_9fa48("124") ? false : stryMutAct_9fa48("123") ? true : (stryCov_9fa48("123", "124", "125"), entry.name === (stryMutAct_9fa48("126") ? "" : (stryCov_9fa48("126"), "Дебит по тех.режиму")))) ? styles.tooltipRed : styles.tooltipGreen}`)}>
            {stryMutAct_9fa48("127") ? `` : (stryCov_9fa48("127"), `${entry.name}: ${entry.value.toLocaleString(stryMutAct_9fa48("128") ? "" : (stryCov_9fa48("128"), "ru-RU"))}`)}
          </div>))}
        <div className={styles.tooltipDate}>
          {label} | {chartDate ? format(parseISO(chartDate), stryMutAct_9fa48("129") ? "" : (stryCov_9fa48("129"), "dd.MM.yyyy")) : stryMutAct_9fa48("130") ? "Stryker was here!" : (stryCov_9fa48("130"), "")}
        </div>
      </div>;
      }
    }
    return null;
  }
};

// Custom Chart Component using pure SVG
const CustomChart = ({
  data,
  width = 800,
  height = 350,
  isNak,
  type,
  chartDate,
  isArchiveMode
}) => {
  if (stryMutAct_9fa48("131")) {
    {}
  } else {
    stryCov_9fa48("131");
    const [tooltip, setTooltip] = useState(stryMutAct_9fa48("132") ? {} : (stryCov_9fa48("132"), {
      visible: stryMutAct_9fa48("133") ? true : (stryCov_9fa48("133"), false),
      x: 0,
      y: 0,
      data: null
    }));
    const margin = stryMutAct_9fa48("134") ? {} : (stryCov_9fa48("134"), {
      top: 20,
      right: 20,
      bottom: 40,
      left: 60
    });
    const chartWidth = stryMutAct_9fa48("135") ? width - margin.left + margin.right : (stryCov_9fa48("135"), (stryMutAct_9fa48("136") ? width + margin.left : (stryCov_9fa48("136"), width - margin.left)) - margin.right);
    const chartHeight = stryMutAct_9fa48("137") ? height - margin.top + margin.bottom : (stryCov_9fa48("137"), (stryMutAct_9fa48("138") ? height + margin.top : (stryCov_9fa48("138"), height - margin.top)) - margin.bottom);

    // Determine unit based on chart type
    const unit = (stryMutAct_9fa48("141") ? type !== "oil" : stryMutAct_9fa48("140") ? false : stryMutAct_9fa48("139") ? true : (stryCov_9fa48("139", "140", "141"), type === (stryMutAct_9fa48("142") ? "" : (stryCov_9fa48("142"), "oil")))) ? stryMutAct_9fa48("143") ? "" : (stryCov_9fa48("143"), " т") : stryMutAct_9fa48("144") ? "" : (stryCov_9fa48("144"), " м³");

    // Get the appropriate data keys based on type and accumulation mode
    const getDataKey = baseKey => {
      if (stryMutAct_9fa48("145")) {
        {}
      } else {
        stryCov_9fa48("145");
        if (stryMutAct_9fa48("147") ? false : stryMutAct_9fa48("146") ? true : (stryCov_9fa48("146", "147"), isNak)) {
          if (stryMutAct_9fa48("148")) {
            {}
          } else {
            stryCov_9fa48("148");
            return stryMutAct_9fa48("149") ? `` : (stryCov_9fa48("149"), `${baseKey}_nak`);
          }
        }
        return baseKey;
      }
    };
    const techRezhKey = getDataKey(stryMutAct_9fa48("150") ? "" : (stryCov_9fa48("150"), "tech_rezh"));
    const debitLastDayKey = getDataKey(stryMutAct_9fa48("151") ? "" : (stryCov_9fa48("151"), "debit_last_day"));
    const currDebitKey = getDataKey(stryMutAct_9fa48("152") ? "" : (stryCov_9fa48("152"), "curr_debit"));

    // Calculate scales
    const allValues = stryMutAct_9fa48("153") ? data.flatMap(d => [d[techRezhKey] || 0, d[debitLastDayKey] || 0, d[currDebitKey] || 0]) : (stryCov_9fa48("153"), data.flatMap(stryMutAct_9fa48("154") ? () => undefined : (stryCov_9fa48("154"), d => stryMutAct_9fa48("155") ? [] : (stryCov_9fa48("155"), [stryMutAct_9fa48("158") ? d[techRezhKey] && 0 : stryMutAct_9fa48("157") ? false : stryMutAct_9fa48("156") ? true : (stryCov_9fa48("156", "157", "158"), d[techRezhKey] || 0), stryMutAct_9fa48("161") ? d[debitLastDayKey] && 0 : stryMutAct_9fa48("160") ? false : stryMutAct_9fa48("159") ? true : (stryCov_9fa48("159", "160", "161"), d[debitLastDayKey] || 0), stryMutAct_9fa48("164") ? d[currDebitKey] && 0 : stryMutAct_9fa48("163") ? false : stryMutAct_9fa48("162") ? true : (stryCov_9fa48("162", "163", "164"), d[currDebitKey] || 0)]))).filter(stryMutAct_9fa48("165") ? () => undefined : (stryCov_9fa48("165"), v => stryMutAct_9fa48("168") ? v !== undefined || v !== null : stryMutAct_9fa48("167") ? false : stryMutAct_9fa48("166") ? true : (stryCov_9fa48("166", "167", "168"), (stryMutAct_9fa48("170") ? v === undefined : stryMutAct_9fa48("169") ? true : (stryCov_9fa48("169", "170"), v !== undefined)) && (stryMutAct_9fa48("172") ? v === null : stryMutAct_9fa48("171") ? true : (stryCov_9fa48("171", "172"), v !== null))))));
    const minValue = stryMutAct_9fa48("173") ? Math.max(...allValues, 0) : (stryCov_9fa48("173"), Math.min(...allValues, 0));
    const maxValue = stryMutAct_9fa48("174") ? Math.min(...allValues, 1) : (stryCov_9fa48("174"), Math.max(...allValues, 1));
    const valueRange = stryMutAct_9fa48("177") ? maxValue - minValue && 1 : stryMutAct_9fa48("176") ? false : stryMutAct_9fa48("175") ? true : (stryCov_9fa48("175", "176", "177"), (stryMutAct_9fa48("178") ? maxValue + minValue : (stryCov_9fa48("178"), maxValue - minValue)) || 1);
    const scaleX = stryMutAct_9fa48("179") ? () => undefined : (stryCov_9fa48("179"), (() => {
      const scaleX = index => stryMutAct_9fa48("180") ? index / Math.max(data.length - 1, 1) / chartWidth : (stryCov_9fa48("180"), (stryMutAct_9fa48("181") ? index * Math.max(data.length - 1, 1) : (stryCov_9fa48("181"), index / (stryMutAct_9fa48("182") ? Math.min(data.length - 1, 1) : (stryCov_9fa48("182"), Math.max(stryMutAct_9fa48("183") ? data.length + 1 : (stryCov_9fa48("183"), data.length - 1), 1))))) * chartWidth);
      return scaleX;
    })());
    const scaleY = stryMutAct_9fa48("184") ? () => undefined : (stryCov_9fa48("184"), (() => {
      const scaleY = value => stryMutAct_9fa48("185") ? chartHeight + (value - minValue) / valueRange * chartHeight : (stryCov_9fa48("185"), chartHeight - (stryMutAct_9fa48("186") ? (value - minValue) / valueRange / chartHeight : (stryCov_9fa48("186"), (stryMutAct_9fa48("187") ? (value - minValue) * valueRange : (stryCov_9fa48("187"), (stryMutAct_9fa48("188") ? value + minValue : (stryCov_9fa48("188"), value - minValue)) / valueRange)) * chartHeight)));
      return scaleY;
    })());

    // Updated generateLineSegments function with line-specific styling
    const generateLineSegments = (dataKey, lineType) => {
      if (stryMutAct_9fa48("189")) {
        {}
      } else {
        stryCov_9fa48("189");
        const segments = stryMutAct_9fa48("190") ? ["Stryker was here"] : (stryCov_9fa48("190"), []);
        for (let i = 0; stryMutAct_9fa48("193") ? i >= data.length - 1 : stryMutAct_9fa48("192") ? i <= data.length - 1 : stryMutAct_9fa48("191") ? false : (stryCov_9fa48("191", "192", "193"), i < (stryMutAct_9fa48("194") ? data.length + 1 : (stryCov_9fa48("194"), data.length - 1))); stryMutAct_9fa48("195") ? i-- : (stryCov_9fa48("195"), i++)) {
          if (stryMutAct_9fa48("196")) {
            {}
          } else {
            stryCov_9fa48("196");
            const current = data[i];
            const next = data[stryMutAct_9fa48("197") ? i - 1 : (stryCov_9fa48("197"), i + 1)];
            const currentValue = current[dataKey];
            const nextValue = next[dataKey];
            if (stryMutAct_9fa48("200") ? currentValue !== undefined || nextValue !== undefined : stryMutAct_9fa48("199") ? false : stryMutAct_9fa48("198") ? true : (stryCov_9fa48("198", "199", "200"), (stryMutAct_9fa48("202") ? currentValue === undefined : stryMutAct_9fa48("201") ? true : (stryCov_9fa48("201", "202"), currentValue !== undefined)) && (stryMutAct_9fa48("204") ? nextValue === undefined : stryMutAct_9fa48("203") ? true : (stryCov_9fa48("203", "204"), nextValue !== undefined)))) {
              if (stryMutAct_9fa48("205")) {
                {}
              } else {
                stryCov_9fa48("205");
                const x1 = scaleX(i);
                const y1 = scaleY(currentValue);
                const x2 = scaleX(stryMutAct_9fa48("206") ? i - 1 : (stryCov_9fa48("206"), i + 1));
                const y2 = scaleY(nextValue);
                let isDashed = stryMutAct_9fa48("207") ? true : (stryCov_9fa48("207"), false);

                // Apply line-specific styling rules
                switch (lineType) {
                  case stryMutAct_9fa48("209") ? "" : (stryCov_9fa48("209"), 'green'):
                    if (stryMutAct_9fa48("208")) {} else {
                      stryCov_9fa48("208");
                      // Current debit - dashed based on tin (only if not archive mode)
                      isDashed = isArchiveMode ? stryMutAct_9fa48("210") ? true : (stryCov_9fa48("210"), false) : stryMutAct_9fa48("213") ? current.tin !== 0 : stryMutAct_9fa48("212") ? false : stryMutAct_9fa48("211") ? true : (stryCov_9fa48("211", "212", "213"), current.tin === 0);
                      break;
                    }
                  case stryMutAct_9fa48("215") ? "" : (stryCov_9fa48("215"), 'red'):
                    if (stryMutAct_9fa48("214")) {} else {
                      stryCov_9fa48("214");
                      // Tech regime - always dashed
                      isDashed = stryMutAct_9fa48("216") ? false : (stryCov_9fa48("216"), true);
                      break;
                    }
                  case stryMutAct_9fa48("218") ? "" : (stryCov_9fa48("218"), 'gray'):
                    if (stryMutAct_9fa48("217")) {} else {
                      stryCov_9fa48("217");
                      // Previous day debit - always solid
                      isDashed = stryMutAct_9fa48("219") ? true : (stryCov_9fa48("219"), false);
                      break;
                    }
                  default:
                    if (stryMutAct_9fa48("220")) {} else {
                      stryCov_9fa48("220");
                      isDashed = stryMutAct_9fa48("221") ? true : (stryCov_9fa48("221"), false);
                    }
                }
                segments.push(stryMutAct_9fa48("222") ? {} : (stryCov_9fa48("222"), {
                  path: stryMutAct_9fa48("223") ? `` : (stryCov_9fa48("223"), `M ${x1} ${y1} L ${x2} ${y2}`),
                  isDashed: isDashed,
                  tin: current.tin
                }));
              }
            }
          }
        }
        return segments;
      }
    };

    // Generate segments for all three lines with specific line types
    const currentDebitSegments = generateLineSegments(currDebitKey, stryMutAct_9fa48("224") ? "" : (stryCov_9fa48("224"), 'green'));
    const techRezhSegments = generateLineSegments(techRezhKey, stryMutAct_9fa48("225") ? "" : (stryCov_9fa48("225"), 'red'));
    const debitLastDaySegments = generateLineSegments(debitLastDayKey, stryMutAct_9fa48("226") ? "" : (stryCov_9fa48("226"), 'gray'));

    // Format Y-axis values
    const formatYAxis = stryMutAct_9fa48("227") ? () => undefined : (stryCov_9fa48("227"), (() => {
      const formatYAxis = value => (stryMutAct_9fa48("231") ? Math.abs(value) < 1000 : stryMutAct_9fa48("230") ? Math.abs(value) > 1000 : stryMutAct_9fa48("229") ? false : stryMutAct_9fa48("228") ? true : (stryCov_9fa48("228", "229", "230", "231"), Math.abs(value) >= 1000)) ? stryMutAct_9fa48("232") ? `` : (stryCov_9fa48("232"), `${(stryMutAct_9fa48("233") ? value * 1000 : (stryCov_9fa48("233"), value / 1000)).toFixed(1)}k`) : value.toFixed(0);
      return formatYAxis;
    })());

    // Generate Y-axis ticks
    const yTicks = Array.from(stryMutAct_9fa48("234") ? {} : (stryCov_9fa48("234"), {
      length: 6
    }), (_, i) => {
      if (stryMutAct_9fa48("235")) {
        {}
      } else {
        stryCov_9fa48("235");
        const value = stryMutAct_9fa48("236") ? minValue - valueRange * (i / 5) : (stryCov_9fa48("236"), minValue + (stryMutAct_9fa48("237") ? valueRange / (i / 5) : (stryCov_9fa48("237"), valueRange * (stryMutAct_9fa48("238") ? i * 5 : (stryCov_9fa48("238"), i / 5)))));
        return stryMutAct_9fa48("239") ? {} : (stryCov_9fa48("239"), {
          value,
          y: scaleY(value)
        });
      }
    });

    // Generate X-axis ticks - show every 2 hours instead of every 4
    const xTicks = stryMutAct_9fa48("240") ? data.map((d, i, arr) => ({
      label: d.name,
      x: scaleX(data.indexOf(d))
    })) : (stryCov_9fa48("240"), data.filter(stryMutAct_9fa48("241") ? () => undefined : (stryCov_9fa48("241"), (_, i) => stryMutAct_9fa48("244") ? i % Math.max(1, Math.floor(data.length / 12)) !== 0 : stryMutAct_9fa48("243") ? false : stryMutAct_9fa48("242") ? true : (stryCov_9fa48("242", "243", "244"), (stryMutAct_9fa48("245") ? i * Math.max(1, Math.floor(data.length / 12)) : (stryCov_9fa48("245"), i % (stryMutAct_9fa48("246") ? Math.min(1, Math.floor(data.length / 12)) : (stryCov_9fa48("246"), Math.max(1, Math.floor(stryMutAct_9fa48("247") ? data.length * 12 : (stryCov_9fa48("247"), data.length / 12))))))) === 0))).map(stryMutAct_9fa48("248") ? () => undefined : (stryCov_9fa48("248"), (d, i, arr) => stryMutAct_9fa48("249") ? {} : (stryCov_9fa48("249"), {
      label: d.name,
      x: scaleX(data.indexOf(d))
    }))));

    // Handle mouse events for tooltip
    const handleMouseMove = (event, point, index) => {
      if (stryMutAct_9fa48("250")) {
        {}
      } else {
        stryCov_9fa48("250");
        const svgRect = event.currentTarget.closest(stryMutAct_9fa48("251") ? "" : (stryCov_9fa48("251"), 'svg')).getBoundingClientRect();
        const tooltipData = stryMutAct_9fa48("252") ? {} : (stryCov_9fa48("252"), {
          label: point.name,
          payload: stryMutAct_9fa48("253") ? [{
            name: "Дебит по тех.режиму",
            value: point[techRezhKey] || 0,
            color: "#B22222"
          }, {
            name: "Дебит за предыдущие сутки",
            value: point[debitLastDayKey] || 0,
            color: "#888888"
          }, {
            name: "Прогнозируемый дебит на конец суток",
            value: point[currDebitKey] || 0,
            color: "#228B22"
          }] : (stryCov_9fa48("253"), (stryMutAct_9fa48("254") ? [] : (stryCov_9fa48("254"), [stryMutAct_9fa48("255") ? {} : (stryCov_9fa48("255"), {
            name: stryMutAct_9fa48("256") ? "" : (stryCov_9fa48("256"), "Дебит по тех.режиму"),
            value: stryMutAct_9fa48("259") ? point[techRezhKey] && 0 : stryMutAct_9fa48("258") ? false : stryMutAct_9fa48("257") ? true : (stryCov_9fa48("257", "258", "259"), point[techRezhKey] || 0),
            color: stryMutAct_9fa48("260") ? "" : (stryCov_9fa48("260"), "#B22222")
          }), stryMutAct_9fa48("261") ? {} : (stryCov_9fa48("261"), {
            name: stryMutAct_9fa48("262") ? "" : (stryCov_9fa48("262"), "Дебит за предыдущие сутки"),
            value: stryMutAct_9fa48("265") ? point[debitLastDayKey] && 0 : stryMutAct_9fa48("264") ? false : stryMutAct_9fa48("263") ? true : (stryCov_9fa48("263", "264", "265"), point[debitLastDayKey] || 0),
            color: stryMutAct_9fa48("266") ? "" : (stryCov_9fa48("266"), "#888888")
          }), stryMutAct_9fa48("267") ? {} : (stryCov_9fa48("267"), {
            name: stryMutAct_9fa48("268") ? "" : (stryCov_9fa48("268"), "Прогнозируемый дебит на конец суток"),
            value: stryMutAct_9fa48("271") ? point[currDebitKey] && 0 : stryMutAct_9fa48("270") ? false : stryMutAct_9fa48("269") ? true : (stryCov_9fa48("269", "270", "271"), point[currDebitKey] || 0),
            color: stryMutAct_9fa48("272") ? "" : (stryCov_9fa48("272"), "#228B22")
          })])).filter(stryMutAct_9fa48("273") ? () => undefined : (stryCov_9fa48("273"), item => stryMutAct_9fa48("276") ? item.value === undefined : stryMutAct_9fa48("275") ? false : stryMutAct_9fa48("274") ? true : (stryCov_9fa48("274", "275", "276"), item.value !== undefined))))
        });
        setTooltip(stryMutAct_9fa48("277") ? {} : (stryCov_9fa48("277"), {
          visible: stryMutAct_9fa48("278") ? false : (stryCov_9fa48("278"), true),
          x: stryMutAct_9fa48("279") ? event.clientX + svgRect.left : (stryCov_9fa48("279"), event.clientX - svgRect.left),
          y: stryMutAct_9fa48("280") ? event.clientY - svgRect.top + 10 : (stryCov_9fa48("280"), (stryMutAct_9fa48("281") ? event.clientY + svgRect.top : (stryCov_9fa48("281"), event.clientY - svgRect.top)) - 10),
          data: tooltipData
        }));
      }
    };
    const handleMouseLeave = () => {
      if (stryMutAct_9fa48("282")) {
        {}
      } else {
        stryCov_9fa48("282");
        setTooltip(stryMutAct_9fa48("283") ? {} : (stryCov_9fa48("283"), {
          visible: stryMutAct_9fa48("284") ? true : (stryCov_9fa48("284"), false),
          x: 0,
          y: 0,
          data: null
        }));
      }
    };
    return <div style={stryMutAct_9fa48("285") ? {} : (stryCov_9fa48("285"), {
      position: stryMutAct_9fa48("286") ? "" : (stryCov_9fa48("286"), 'relative')
    })}>
      <style>
        {stryMutAct_9fa48("287") ? `` : (stryCov_9fa48("287"), `
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
        `)}
      </style>
      
      <svg width={width} height={height} style={stryMutAct_9fa48("288") ? {} : (stryCov_9fa48("288"), {
        border: stryMutAct_9fa48("289") ? "" : (stryCov_9fa48("289"), '1px solid #333'),
        borderRadius: stryMutAct_9fa48("290") ? "" : (stryCov_9fa48("290"), '4px')
      })}>
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#333" strokeWidth="0.5" opacity="0.1" />
          </pattern>
        </defs>

        {/* Grid */}
        <rect x={margin.left} y={margin.top} width={chartWidth} height={chartHeight} fill="url(#grid)" />

        {/* Y-axis */}
        <line x1={margin.left} y1={margin.top} x2={margin.left} y2={stryMutAct_9fa48("291") ? margin.top - chartHeight : (stryCov_9fa48("291"), margin.top + chartHeight)} stroke="#ffffff" strokeWidth="1" />

        {/* X-axis */}
        <line x1={margin.left} y1={stryMutAct_9fa48("292") ? margin.top - chartHeight : (stryCov_9fa48("292"), margin.top + chartHeight)} x2={stryMutAct_9fa48("293") ? margin.left - chartWidth : (stryCov_9fa48("293"), margin.left + chartWidth)} y2={stryMutAct_9fa48("294") ? margin.top - chartHeight : (stryCov_9fa48("294"), margin.top + chartHeight)} stroke="#ffffff" strokeWidth="1" />

        {/* Y-axis ticks and labels */}
        {yTicks.map(stryMutAct_9fa48("295") ? () => undefined : (stryCov_9fa48("295"), (tick, i) => <g key={i}>
            <line x1={stryMutAct_9fa48("296") ? margin.left + 6 : (stryCov_9fa48("296"), margin.left - 6)} y1={stryMutAct_9fa48("297") ? margin.top - tick.y : (stryCov_9fa48("297"), margin.top + tick.y)} x2={margin.left} y2={stryMutAct_9fa48("298") ? margin.top - tick.y : (stryCov_9fa48("298"), margin.top + tick.y)} stroke="#ffffff" strokeWidth="1" />
            <text x={stryMutAct_9fa48("299") ? margin.left + 12 : (stryCov_9fa48("299"), margin.left - 12)} y={stryMutAct_9fa48("300") ? margin.top + tick.y - 4 : (stryCov_9fa48("300"), (stryMutAct_9fa48("301") ? margin.top - tick.y : (stryCov_9fa48("301"), margin.top + tick.y)) + 4)} textAnchor="end" fontSize="12" fill="#ffffff">
              {formatYAxis(tick.value)}
            </text>
          </g>))}

        {/* X-axis ticks and labels */}
        {xTicks.map(stryMutAct_9fa48("302") ? () => undefined : (stryCov_9fa48("302"), (tick, i) => <g key={i}>
            <line x1={stryMutAct_9fa48("303") ? margin.left - tick.x : (stryCov_9fa48("303"), margin.left + tick.x)} y1={stryMutAct_9fa48("304") ? margin.top - chartHeight : (stryCov_9fa48("304"), margin.top + chartHeight)} x2={stryMutAct_9fa48("305") ? margin.left - tick.x : (stryCov_9fa48("305"), margin.left + tick.x)} y2={stryMutAct_9fa48("306") ? margin.top + chartHeight - 6 : (stryCov_9fa48("306"), (stryMutAct_9fa48("307") ? margin.top - chartHeight : (stryCov_9fa48("307"), margin.top + chartHeight)) + 6)} stroke="#ffffff" strokeWidth="1" />
            <text x={stryMutAct_9fa48("308") ? margin.left - tick.x : (stryCov_9fa48("308"), margin.left + tick.x)} y={stryMutAct_9fa48("309") ? margin.top + chartHeight - 20 : (stryCov_9fa48("309"), (stryMutAct_9fa48("310") ? margin.top - chartHeight : (stryCov_9fa48("310"), margin.top + chartHeight)) + 20)} textAnchor="middle" fontSize="12" fill="#ffffff">
              {tick.label}
            </text>
          </g>))}

        {/* Chart content */}
        <g transform={stryMutAct_9fa48("311") ? `` : (stryCov_9fa48("311"), `translate(${margin.left}, ${margin.top})`)}>
          {/* Tech regime line segments - ALWAYS DASHED */}
          {techRezhSegments.map(stryMutAct_9fa48("312") ? () => undefined : (stryCov_9fa48("312"), (segment, i) => <path key={stryMutAct_9fa48("313") ? `` : (stryCov_9fa48("313"), `tech-${i}`)} d={segment.path} fill="none" stroke="#B22222" strokeWidth="2" strokeDasharray="5 5" strokeLinecap="round" strokeLinejoin="round" />))}

          {/* Previous day debit line segments - ALWAYS SOLID */}
          {debitLastDaySegments.map(stryMutAct_9fa48("314") ? () => undefined : (stryCov_9fa48("314"), (segment, i) => <path key={stryMutAct_9fa48("315") ? `` : (stryCov_9fa48("315"), `lastday-${i}`)} d={segment.path} fill="none" stroke="#888888" strokeWidth="2" strokeDasharray="none" strokeLinecap="round" strokeLinejoin="round" />))}

          {/* Current debit line segments - DASHED BASED ON TIN */}
          {currentDebitSegments.map(stryMutAct_9fa48("316") ? () => undefined : (stryCov_9fa48("316"), (segment, i) => <path key={stryMutAct_9fa48("317") ? `` : (stryCov_9fa48("317"), `current-${i}`)} d={segment.path} fill="none" stroke="#228B22" strokeWidth="2" strokeDasharray={segment.isDashed ? stryMutAct_9fa48("318") ? "" : (stryCov_9fa48("318"), "5 5") : stryMutAct_9fa48("319") ? "" : (stryCov_9fa48("319"), "none")} strokeLinecap="round" strokeLinejoin="round" />))}

          {/* Data points with hover areas and animations - KEEP ANIMATIONS ON DOTS */}
          {data.map((point, i) => {
            if (stryMutAct_9fa48("320")) {
              {}
            } else {
              stryCov_9fa48("320");
              const currValue = point[currDebitKey];
              const techValue = point[techRezhKey];
              const lastDayValue = point[debitLastDayKey];
              return <g key={i}>
                {/* Larger invisible hover area for better tooltip interaction */}
                <rect x={stryMutAct_9fa48("321") ? scaleX(i) + 15 : (stryCov_9fa48("321"), scaleX(i) - 15)} y={0} width={30} height={chartHeight} fill="transparent" style={stryMutAct_9fa48("322") ? {} : (stryCov_9fa48("322"), {
                  cursor: stryMutAct_9fa48("323") ? "" : (stryCov_9fa48("323"), 'pointer')
                })} onMouseEnter={stryMutAct_9fa48("324") ? () => undefined : (stryCov_9fa48("324"), e => handleMouseMove(e, point, i))} onMouseLeave={handleMouseLeave} />

                {/* Current debit dots with animation */}
                {stryMutAct_9fa48("327") ? currValue !== undefined || <circle cx={scaleX(i)} cy={scaleY(currValue)} r="3" fill="#228B22" stroke="white" strokeWidth="2" style={{
                  pointerEvents: 'none',
                  transition: 'all 0.2s ease-in-out',
                  animation: 'fadeInDot 0.5s ease-in-out forwards',
                  animationDelay: `${i * 0.05}s`,
                  opacity: 0
                }} /> : stryMutAct_9fa48("326") ? false : stryMutAct_9fa48("325") ? true : (stryCov_9fa48("325", "326", "327"), (stryMutAct_9fa48("329") ? currValue === undefined : stryMutAct_9fa48("328") ? true : (stryCov_9fa48("328", "329"), currValue !== undefined)) && <circle cx={scaleX(i)} cy={scaleY(currValue)} r="3" fill="#228B22" stroke="white" strokeWidth="2" style={stryMutAct_9fa48("330") ? {} : (stryCov_9fa48("330"), {
                  pointerEvents: stryMutAct_9fa48("331") ? "" : (stryCov_9fa48("331"), 'none'),
                  transition: stryMutAct_9fa48("332") ? "" : (stryCov_9fa48("332"), 'all 0.2s ease-in-out'),
                  animation: stryMutAct_9fa48("333") ? "" : (stryCov_9fa48("333"), 'fadeInDot 0.5s ease-in-out forwards'),
                  animationDelay: stryMutAct_9fa48("334") ? `` : (stryCov_9fa48("334"), `${stryMutAct_9fa48("335") ? i / 0.05 : (stryCov_9fa48("335"), i * 0.05)}s`),
                  opacity: 0
                })} />)}
                
                {/* Tech regime dots with animation */}
                {stryMutAct_9fa48("338") ? techValue !== undefined || <circle cx={scaleX(i)} cy={scaleY(techValue)} r="3" fill="#B22222" stroke="white" strokeWidth="2" style={{
                  pointerEvents: 'none',
                  transition: 'all 0.2s ease-in-out',
                  animation: 'fadeInDot 0.5s ease-in-out forwards',
                  animationDelay: `${i * 0.05}s`,
                  opacity: 0
                }} /> : stryMutAct_9fa48("337") ? false : stryMutAct_9fa48("336") ? true : (stryCov_9fa48("336", "337", "338"), (stryMutAct_9fa48("340") ? techValue === undefined : stryMutAct_9fa48("339") ? true : (stryCov_9fa48("339", "340"), techValue !== undefined)) && <circle cx={scaleX(i)} cy={scaleY(techValue)} r="3" fill="#B22222" stroke="white" strokeWidth="2" style={stryMutAct_9fa48("341") ? {} : (stryCov_9fa48("341"), {
                  pointerEvents: stryMutAct_9fa48("342") ? "" : (stryCov_9fa48("342"), 'none'),
                  transition: stryMutAct_9fa48("343") ? "" : (stryCov_9fa48("343"), 'all 0.2s ease-in-out'),
                  animation: stryMutAct_9fa48("344") ? "" : (stryCov_9fa48("344"), 'fadeInDot 0.5s ease-in-out forwards'),
                  animationDelay: stryMutAct_9fa48("345") ? `` : (stryCov_9fa48("345"), `${stryMutAct_9fa48("346") ? i / 0.05 : (stryCov_9fa48("346"), i * 0.05)}s`),
                  opacity: 0
                })} />)}
                
                {/* Last day debit dots with animation */}
                {stryMutAct_9fa48("349") ? lastDayValue !== undefined || <circle cx={scaleX(i)} cy={scaleY(lastDayValue)} r="3" fill="#888888" stroke="white" strokeWidth="2" style={{
                  pointerEvents: 'none',
                  transition: 'all 0.2s ease-in-out',
                  animation: 'fadeInDot 0.5s ease-in-out forwards',
                  animationDelay: `${i * 0.05}s`,
                  opacity: 0
                }} /> : stryMutAct_9fa48("348") ? false : stryMutAct_9fa48("347") ? true : (stryCov_9fa48("347", "348", "349"), (stryMutAct_9fa48("351") ? lastDayValue === undefined : stryMutAct_9fa48("350") ? true : (stryCov_9fa48("350", "351"), lastDayValue !== undefined)) && <circle cx={scaleX(i)} cy={scaleY(lastDayValue)} r="3" fill="#888888" stroke="white" strokeWidth="2" style={stryMutAct_9fa48("352") ? {} : (stryCov_9fa48("352"), {
                  pointerEvents: stryMutAct_9fa48("353") ? "" : (stryCov_9fa48("353"), 'none'),
                  transition: stryMutAct_9fa48("354") ? "" : (stryCov_9fa48("354"), 'all 0.2s ease-in-out'),
                  animation: stryMutAct_9fa48("355") ? "" : (stryCov_9fa48("355"), 'fadeInDot 0.5s ease-in-out forwards'),
                  animationDelay: stryMutAct_9fa48("356") ? `` : (stryCov_9fa48("356"), `${stryMutAct_9fa48("357") ? i / 0.05 : (stryCov_9fa48("357"), i * 0.05)}s`),
                  opacity: 0
                })} />)}
              </g>;
            }
          })}
        </g>
      </svg>

      {/* Enhanced Custom Tooltip*/}
      {stryMutAct_9fa48("360") ? tooltip.visible && tooltip.data || <div style={{
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
      }}>
          <div style={{
          fontSize: '12px',
          color: '#888',
          marginBottom: '8px',
          fontWeight: '500'
        }}>
            {tooltip.data.label} | {chartDate ? format(parseISO(chartDate), "dd.MM.yyyy") : ""}
          </div>
          
          {tooltip.data.payload.map((entry, index) => <div key={`tooltip-${index}`} style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: index < tooltip.data.payload.length - 1 ? '6px' : '0px',
          fontSize: '13px'
        }}>
              <div style={{
            width: '12px',
            height: '12px',
            backgroundColor: entry.color,
            borderRadius: '2px',
            marginRight: '10px',
            flexShrink: 0
          }} />
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
                {entry.value.toLocaleString("ru-RU")}{unit}
              </div>
            </div>)}
        </div> : stryMutAct_9fa48("359") ? false : stryMutAct_9fa48("358") ? true : (stryCov_9fa48("358", "359", "360"), (stryMutAct_9fa48("362") ? tooltip.visible || tooltip.data : stryMutAct_9fa48("361") ? true : (stryCov_9fa48("361", "362"), tooltip.visible && tooltip.data)) && <div style={stryMutAct_9fa48("363") ? {} : (stryCov_9fa48("363"), {
        position: stryMutAct_9fa48("364") ? "" : (stryCov_9fa48("364"), 'absolute'),
        left: stryMutAct_9fa48("365") ? Math.max(tooltip.x + 15, width - 250) : (stryCov_9fa48("365"), Math.min(stryMutAct_9fa48("366") ? tooltip.x - 15 : (stryCov_9fa48("366"), tooltip.x + 15), stryMutAct_9fa48("367") ? width + 250 : (stryCov_9fa48("367"), width - 250))),
        top: stryMutAct_9fa48("368") ? Math.min(tooltip.y - 80, 10) : (stryCov_9fa48("368"), Math.max(stryMutAct_9fa48("369") ? tooltip.y + 80 : (stryCov_9fa48("369"), tooltip.y - 80), 10)),
        backgroundColor: stryMutAct_9fa48("370") ? "" : (stryCov_9fa48("370"), 'rgba(30, 30, 30, 0.95)'),
        color: stryMutAct_9fa48("371") ? "" : (stryCov_9fa48("371"), 'white'),
        padding: stryMutAct_9fa48("372") ? "" : (stryCov_9fa48("372"), '12px 16px'),
        borderRadius: stryMutAct_9fa48("373") ? "" : (stryCov_9fa48("373"), '8px'),
        fontSize: stryMutAct_9fa48("374") ? "" : (stryCov_9fa48("374"), '13px'),
        pointerEvents: stryMutAct_9fa48("375") ? "" : (stryCov_9fa48("375"), 'none'),
        zIndex: 1000,
        minWidth: stryMutAct_9fa48("376") ? "" : (stryCov_9fa48("376"), '220px'),
        boxShadow: stryMutAct_9fa48("377") ? "" : (stryCov_9fa48("377"), '0 4px 12px rgba(0, 0, 0, 0.3)'),
        border: stryMutAct_9fa48("378") ? "" : (stryCov_9fa48("378"), '1px solid rgba(255, 255, 255, 0.1)'),
        backdropFilter: stryMutAct_9fa48("379") ? "" : (stryCov_9fa48("379"), 'blur(10px)'),
        transform: stryMutAct_9fa48("380") ? "" : (stryCov_9fa48("380"), 'translateY(-5px)'),
        transition: stryMutAct_9fa48("381") ? "" : (stryCov_9fa48("381"), 'all 0.2s ease-in-out')
      })}>
          <div style={stryMutAct_9fa48("382") ? {} : (stryCov_9fa48("382"), {
          fontSize: stryMutAct_9fa48("383") ? "" : (stryCov_9fa48("383"), '12px'),
          color: stryMutAct_9fa48("384") ? "" : (stryCov_9fa48("384"), '#888'),
          marginBottom: stryMutAct_9fa48("385") ? "" : (stryCov_9fa48("385"), '8px'),
          fontWeight: stryMutAct_9fa48("386") ? "" : (stryCov_9fa48("386"), '500')
        })}>
            {tooltip.data.label} | {chartDate ? format(parseISO(chartDate), stryMutAct_9fa48("387") ? "" : (stryCov_9fa48("387"), "dd.MM.yyyy")) : stryMutAct_9fa48("388") ? "Stryker was here!" : (stryCov_9fa48("388"), "")}
          </div>
          
          {tooltip.data.payload.map(stryMutAct_9fa48("389") ? () => undefined : (stryCov_9fa48("389"), (entry, index) => <div key={stryMutAct_9fa48("390") ? `` : (stryCov_9fa48("390"), `tooltip-${index}`)} style={stryMutAct_9fa48("391") ? {} : (stryCov_9fa48("391"), {
          display: stryMutAct_9fa48("392") ? "" : (stryCov_9fa48("392"), 'flex'),
          alignItems: stryMutAct_9fa48("393") ? "" : (stryCov_9fa48("393"), 'center'),
          marginBottom: (stryMutAct_9fa48("397") ? index >= tooltip.data.payload.length - 1 : stryMutAct_9fa48("396") ? index <= tooltip.data.payload.length - 1 : stryMutAct_9fa48("395") ? false : stryMutAct_9fa48("394") ? true : (stryCov_9fa48("394", "395", "396", "397"), index < (stryMutAct_9fa48("398") ? tooltip.data.payload.length + 1 : (stryCov_9fa48("398"), tooltip.data.payload.length - 1)))) ? stryMutAct_9fa48("399") ? "" : (stryCov_9fa48("399"), '6px') : stryMutAct_9fa48("400") ? "" : (stryCov_9fa48("400"), '0px'),
          fontSize: stryMutAct_9fa48("401") ? "" : (stryCov_9fa48("401"), '13px')
        })}>
              <div style={stryMutAct_9fa48("402") ? {} : (stryCov_9fa48("402"), {
            width: stryMutAct_9fa48("403") ? "" : (stryCov_9fa48("403"), '12px'),
            height: stryMutAct_9fa48("404") ? "" : (stryCov_9fa48("404"), '12px'),
            backgroundColor: entry.color,
            borderRadius: stryMutAct_9fa48("405") ? "" : (stryCov_9fa48("405"), '2px'),
            marginRight: stryMutAct_9fa48("406") ? "" : (stryCov_9fa48("406"), '10px'),
            flexShrink: 0
          })} />
              <div style={stryMutAct_9fa48("407") ? {} : (stryCov_9fa48("407"), {
            color: stryMutAct_9fa48("408") ? "" : (stryCov_9fa48("408"), '#fff'),
            fontSize: stryMutAct_9fa48("409") ? "" : (stryCov_9fa48("409"), '13px'),
            fontWeight: stryMutAct_9fa48("410") ? "" : (stryCov_9fa48("410"), '400'),
            flex: 1
          })}>
                {entry.name}
              </div>
              <div style={stryMutAct_9fa48("411") ? {} : (stryCov_9fa48("411"), {
            color: entry.color,
            fontWeight: stryMutAct_9fa48("412") ? "" : (stryCov_9fa48("412"), '600'),
            fontSize: stryMutAct_9fa48("413") ? "" : (stryCov_9fa48("413"), '14px'),
            marginLeft: stryMutAct_9fa48("414") ? "" : (stryCov_9fa48("414"), '8px')
          })}>
                {entry.value.toLocaleString(stryMutAct_9fa48("415") ? "" : (stryCov_9fa48("415"), "ru-RU"))}{unit}
              </div>
            </div>))}
        </div>)}
    </div>;
  }
};
export default function Chart({
  type,
  setType
}) {
  if (stryMutAct_9fa48("416")) {
    {}
  } else {
    stryCov_9fa48("416");
    const [isNak, setNak] = useState(stryMutAct_9fa48("417") ? false : (stryCov_9fa48("417"), true));
    const [data, setData] = useState(stryMutAct_9fa48("418") ? {} : (stryCov_9fa48("418"), {
      liquid: stryMutAct_9fa48("419") ? ["Stryker was here"] : (stryCov_9fa48("419"), []),
      oil: stryMutAct_9fa48("420") ? ["Stryker was here"] : (stryCov_9fa48("420"), [])
    }));
    const [isArchiveMode, setIsArchiveMode] = useState(stryMutAct_9fa48("421") ? true : (stryCov_9fa48("421"), false));
    const [selectedDate, setSelectedDate] = useState(null);
    const [availableDates, setAvailableDates] = useState(stryMutAct_9fa48("422") ? ["Stryker was here"] : (stryCov_9fa48("422"), []));
    const [loading, setLoading] = useState(stryMutAct_9fa48("423") ? true : (stryCov_9fa48("423"), false));
    const [chartDate, setChartDate] = useState(null);
    const [exporting, setExporting] = useState(stryMutAct_9fa48("424") ? true : (stryCov_9fa48("424"), false));
    const handleReset = () => {
      if (stryMutAct_9fa48("425")) {
        {}
      } else {
        stryCov_9fa48("425");
        setIsArchiveMode(stryMutAct_9fa48("426") ? true : (stryCov_9fa48("426"), false));
        setSelectedDate(null);
        loadCurrentData();
      }
    };

    // Excel Export Function
    const handleExportToExcel = () => {
      if (stryMutAct_9fa48("427")) {
        {}
      } else {
        stryCov_9fa48("427");
        setExporting(stryMutAct_9fa48("428") ? false : (stryCov_9fa48("428"), true));
        try {
          if (stryMutAct_9fa48("429")) {
            {}
          } else {
            stryCov_9fa48("429");
            // Determine the current data being displayed
            const currentData = selectedData;
            if (stryMutAct_9fa48("432") ? !currentData && currentData.length === 0 : stryMutAct_9fa48("431") ? false : stryMutAct_9fa48("430") ? true : (stryCov_9fa48("430", "431", "432"), (stryMutAct_9fa48("433") ? currentData : (stryCov_9fa48("433"), !currentData)) || (stryMutAct_9fa48("435") ? currentData.length !== 0 : stryMutAct_9fa48("434") ? false : (stryCov_9fa48("434", "435"), currentData.length === 0)))) {
              if (stryMutAct_9fa48("436")) {
                {}
              } else {
                stryCov_9fa48("436");
                alert(stryMutAct_9fa48("437") ? "" : (stryCov_9fa48("437"), "Нет данных для экспорта"));
                setExporting(stryMutAct_9fa48("438") ? true : (stryCov_9fa48("438"), false));
                return;
              }
            }

            // Get the appropriate data keys based on type and accumulation mode
            const getDataKey = baseKey => {
              if (stryMutAct_9fa48("439")) {
                {}
              } else {
                stryCov_9fa48("439");
                if (stryMutAct_9fa48("441") ? false : stryMutAct_9fa48("440") ? true : (stryCov_9fa48("440", "441"), isNak)) {
                  if (stryMutAct_9fa48("442")) {
                    {}
                  } else {
                    stryCov_9fa48("442");
                    return stryMutAct_9fa48("443") ? `` : (stryCov_9fa48("443"), `${baseKey}_nak`);
                  }
                }
                return baseKey;
              }
            };
            const techRezhKey = getDataKey(stryMutAct_9fa48("444") ? "" : (stryCov_9fa48("444"), "tech_rezh"));
            const debitLastDayKey = getDataKey(stryMutAct_9fa48("445") ? "" : (stryCov_9fa48("445"), "debit_last_day"));
            const currDebitKey = getDataKey(stryMutAct_9fa48("446") ? "" : (stryCov_9fa48("446"), "curr_debit"));

            // Prepare data for Excel
            const excelData = currentData.map(stryMutAct_9fa48("447") ? () => undefined : (stryCov_9fa48("447"), item => stryMutAct_9fa48("448") ? {} : (stryCov_9fa48("448"), {
              'Время': item.name,
              'Дебит за предыдущие сутки': stryMutAct_9fa48("451") ? item[debitLastDayKey] && 0 : stryMutAct_9fa48("450") ? false : stryMutAct_9fa48("449") ? true : (stryCov_9fa48("449", "450", "451"), item[debitLastDayKey] || 0),
              'Дебит по тех.режиму': stryMutAct_9fa48("454") ? item[techRezhKey] && 0 : stryMutAct_9fa48("453") ? false : stryMutAct_9fa48("452") ? true : (stryCov_9fa48("452", "453", "454"), item[techRezhKey] || 0),
              'Прогнозируемый дебит на конец суток': stryMutAct_9fa48("457") ? item[currDebitKey] && 0 : stryMutAct_9fa48("456") ? false : stryMutAct_9fa48("455") ? true : (stryCov_9fa48("455", "456", "457"), item[currDebitKey] || 0)
              // 'Статус ТИН': item.tin === 1 ? 'Активен' : 'Неактивен'
            })));

            // Create workbook and worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(excelData);

            // Set column widths for better readability
            const colWidths = stryMutAct_9fa48("458") ? [] : (stryCov_9fa48("458"), [stryMutAct_9fa48("459") ? {} : (stryCov_9fa48("459"), {
              wch: 10
            }), // Время
            stryMutAct_9fa48("460") ? {} : (stryCov_9fa48("460"), {
              wch: 25
            }), // Дебит за предыдущие сутки
            stryMutAct_9fa48("461") ? {} : (stryCov_9fa48("461"), {
              wch: 25
            }), // Дебит по тех.режиму
            stryMutAct_9fa48("462") ? {} : (stryCov_9fa48("462"), {
              wch: 30
            }) // Прогнозируемый дебит на конец суток
            // { wch: 15 }  // Статус ТИН
            ]);
            ws[stryMutAct_9fa48("463") ? "" : (stryCov_9fa48("463"), '!cols')] = colWidths;

            // Add metadata sheet
            const metaData = stryMutAct_9fa48("464") ? [] : (stryCov_9fa48("464"), [stryMutAct_9fa48("465") ? [] : (stryCov_9fa48("465"), [stryMutAct_9fa48("466") ? "" : (stryCov_9fa48("466"), 'Параметр'), stryMutAct_9fa48("467") ? "" : (stryCov_9fa48("467"), 'Значение')]), stryMutAct_9fa48("468") ? [] : (stryCov_9fa48("468"), [stryMutAct_9fa48("469") ? "" : (stryCov_9fa48("469"), 'Дата экспорта'), new Date().toLocaleString(stryMutAct_9fa48("470") ? "" : (stryCov_9fa48("470"), 'ru-RU'))]), stryMutAct_9fa48("471") ? [] : (stryCov_9fa48("471"), [stryMutAct_9fa48("472") ? "" : (stryCov_9fa48("472"), 'Тип данных'), (stryMutAct_9fa48("475") ? type !== 'liquid' : stryMutAct_9fa48("474") ? false : stryMutAct_9fa48("473") ? true : (stryCov_9fa48("473", "474", "475"), type === (stryMutAct_9fa48("476") ? "" : (stryCov_9fa48("476"), 'liquid')))) ? stryMutAct_9fa48("477") ? "" : (stryCov_9fa48("477"), 'Жидкость') : stryMutAct_9fa48("478") ? "" : (stryCov_9fa48("478"), 'Нефть')]), stryMutAct_9fa48("479") ? [] : (stryCov_9fa48("479"), [stryMutAct_9fa48("480") ? "" : (stryCov_9fa48("480"), 'Режим накопления'), isNak ? stryMutAct_9fa48("481") ? "" : (stryCov_9fa48("481"), 'Да') : stryMutAct_9fa48("482") ? "" : (stryCov_9fa48("482"), 'Нет')]), stryMutAct_9fa48("483") ? [] : (stryCov_9fa48("483"), [stryMutAct_9fa48("484") ? "" : (stryCov_9fa48("484"), 'Дата данных'), chartDate ? format(parseISO(chartDate), stryMutAct_9fa48("485") ? "" : (stryCov_9fa48("485"), "dd.MM.yyyy")) : stryMutAct_9fa48("486") ? "" : (stryCov_9fa48("486"), 'Текущая')]), stryMutAct_9fa48("487") ? [] : (stryCov_9fa48("487"), [stryMutAct_9fa48("488") ? "" : (stryCov_9fa48("488"), 'Режим архива'), isArchiveMode ? stryMutAct_9fa48("489") ? "" : (stryCov_9fa48("489"), 'Да') : stryMutAct_9fa48("490") ? "" : (stryCov_9fa48("490"), 'Нет')]), stryMutAct_9fa48("491") ? [] : (stryCov_9fa48("491"), [stryMutAct_9fa48("492") ? "" : (stryCov_9fa48("492"), 'Количество записей'), currentData.length.toString()])]);
            const metaWs = XLSX.utils.aoa_to_sheet(metaData);
            metaWs[stryMutAct_9fa48("493") ? "" : (stryCov_9fa48("493"), '!cols')] = stryMutAct_9fa48("494") ? [] : (stryCov_9fa48("494"), [stryMutAct_9fa48("495") ? {} : (stryCov_9fa48("495"), {
              wch: 20
            }), stryMutAct_9fa48("496") ? {} : (stryCov_9fa48("496"), {
              wch: 25
            })]);

            // Add worksheets to workbook
            XLSX.utils.book_append_sheet(wb, ws, stryMutAct_9fa48("497") ? "" : (stryCov_9fa48("497"), 'Данные графика'));
            XLSX.utils.book_append_sheet(wb, metaWs, stryMutAct_9fa48("498") ? "" : (stryCov_9fa48("498"), 'Информация'));

            // Generate filename with current parameters
            const dateStr = chartDate ? format(parseISO(chartDate), stryMutAct_9fa48("499") ? "" : (stryCov_9fa48("499"), "yyyy-MM-dd")) : format(new Date(), stryMutAct_9fa48("500") ? "" : (stryCov_9fa48("500"), "yyyy-MM-dd"));
            const typeStr = (stryMutAct_9fa48("503") ? type !== 'liquid' : stryMutAct_9fa48("502") ? false : stryMutAct_9fa48("501") ? true : (stryCov_9fa48("501", "502", "503"), type === (stryMutAct_9fa48("504") ? "" : (stryCov_9fa48("504"), 'liquid')))) ? stryMutAct_9fa48("505") ? "" : (stryCov_9fa48("505"), 'Жидкость') : stryMutAct_9fa48("506") ? "" : (stryCov_9fa48("506"), 'Нефть');
            const nakStr = isNak ? stryMutAct_9fa48("507") ? "" : (stryCov_9fa48("507"), '_накопление') : stryMutAct_9fa48("508") ? "Stryker was here!" : (stryCov_9fa48("508"), '');
            const archiveStr = isArchiveMode ? stryMutAct_9fa48("509") ? "" : (stryCov_9fa48("509"), '_архив') : stryMutAct_9fa48("510") ? "Stryker was here!" : (stryCov_9fa48("510"), '');
            const filename = stryMutAct_9fa48("511") ? `` : (stryCov_9fa48("511"), `График_${typeStr}_${dateStr}${nakStr}${archiveStr}.xlsx`);

            // Save the file
            XLSX.writeFile(wb, filename);

            // Show success message
            setTimeout(() => {
              if (stryMutAct_9fa48("512")) {
                {}
              } else {
                stryCov_9fa48("512");
                alert(stryMutAct_9fa48("513") ? `` : (stryCov_9fa48("513"), `Данные успешно экспортированы в файл: ${filename}`));
              }
            }, 100);
          }
        } catch (error) {
          if (stryMutAct_9fa48("514")) {
            {}
          } else {
            stryCov_9fa48("514");
            console.error(stryMutAct_9fa48("515") ? "" : (stryCov_9fa48("515"), 'Ошибка при экспорте в Excel:'), error);
            alert(stryMutAct_9fa48("516") ? "" : (stryCov_9fa48("516"), 'Произошла ошибка при экспорте данных'));
          }
        } finally {
          if (stryMutAct_9fa48("517")) {
            {}
          } else {
            stryCov_9fa48("517");
            setExporting(stryMutAct_9fa48("518") ? true : (stryCov_9fa48("518"), false));
          }
        }
      }
    };
    useEffect(() => {
      if (stryMutAct_9fa48("519")) {
        {}
      } else {
        stryCov_9fa48("519");
        getAvailableArchiveDates().then(response => {
          if (stryMutAct_9fa48("520")) {
            {}
          } else {
            stryCov_9fa48("520");
            setAvailableDates(stryMutAct_9fa48("523") ? response.data && [] : stryMutAct_9fa48("522") ? false : stryMutAct_9fa48("521") ? true : (stryCov_9fa48("521", "522", "523"), response.data || (stryMutAct_9fa48("524") ? ["Stryker was here"] : (stryCov_9fa48("524"), []))));
          }
        }).catch(error => {
          if (stryMutAct_9fa48("525")) {
            {}
          } else {
            stryCov_9fa48("525");
            console.error(stryMutAct_9fa48("526") ? "" : (stryCov_9fa48("526"), "Error fetching available dates:"), error);
          }
        });
      }
    }, stryMutAct_9fa48("527") ? ["Stryker was here"] : (stryCov_9fa48("527"), []));
    const parsedAvailableDates = useMemo(() => {
      if (stryMutAct_9fa48("528")) {
        {}
      } else {
        stryCov_9fa48("528");
        return stryMutAct_9fa48("529") ? availableDates.map(d => {
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
        }) : (stryCov_9fa48("529"), availableDates.map(d => {
          if (stryMutAct_9fa48("530")) {
            {}
          } else {
            stryCov_9fa48("530");
            try {
              if (stryMutAct_9fa48("531")) {
                {}
              } else {
                stryCov_9fa48("531");
                const parsedDate = parseISO(d.date);
                if (stryMutAct_9fa48("533") ? false : stryMutAct_9fa48("532") ? true : (stryCov_9fa48("532", "533"), isNaN(parsedDate.getTime()))) {
                  if (stryMutAct_9fa48("534")) {
                    {}
                  } else {
                    stryCov_9fa48("534");
                    const [year, month, day] = d.date.split(stryMutAct_9fa48("535") ? "" : (stryCov_9fa48("535"), "-"));
                    return new Date(parseInt(year), stryMutAct_9fa48("536") ? parseInt(month) + 1 : (stryCov_9fa48("536"), parseInt(month) - 1), parseInt(day));
                  }
                }
                return parsedDate;
              }
            } catch (error) {
              if (stryMutAct_9fa48("537")) {
                {}
              } else {
                stryCov_9fa48("537");
                console.warn(stryMutAct_9fa48("538") ? "" : (stryCov_9fa48("538"), "Failed to parse date:"), d.date, error);
                return null;
              }
            }
          }
        }).filter(stryMutAct_9fa48("539") ? () => undefined : (stryCov_9fa48("539"), date => stryMutAct_9fa48("542") ? date !== null || !isNaN(date.getTime()) : stryMutAct_9fa48("541") ? false : stryMutAct_9fa48("540") ? true : (stryCov_9fa48("540", "541", "542"), (stryMutAct_9fa48("544") ? date === null : stryMutAct_9fa48("543") ? true : (stryCov_9fa48("543", "544"), date !== null)) && (stryMutAct_9fa48("545") ? isNaN(date.getTime()) : (stryCov_9fa48("545"), !isNaN(date.getTime())))))));
      }
    }, stryMutAct_9fa48("546") ? [] : (stryCov_9fa48("546"), [availableDates]));
    const loadCurrentData = () => {
      if (stryMutAct_9fa48("547")) {
        {}
      } else {
        stryCov_9fa48("547");
        setLoading(stryMutAct_9fa48("548") ? false : (stryCov_9fa48("548"), true));
        fetch2Hours().then(response => {
          if (stryMutAct_9fa48("549")) {
            {}
          } else {
            stryCov_9fa48("549");
            processAndSetData(response.data);
          }
        }).catch(error => {
          if (stryMutAct_9fa48("550")) {
            {}
          } else {
            stryCov_9fa48("550");
            console.error(stryMutAct_9fa48("551") ? "" : (stryCov_9fa48("551"), "Error fetching current data:"), error);
          }
        }).finally(() => {
          if (stryMutAct_9fa48("552")) {
            {}
          } else {
            stryCov_9fa48("552");
            setLoading(stryMutAct_9fa48("553") ? true : (stryCov_9fa48("553"), false));
          }
        });
      }
    };
    const loadArchiveData = date => {
      if (stryMutAct_9fa48("554")) {
        {}
      } else {
        stryCov_9fa48("554");
        setLoading(stryMutAct_9fa48("555") ? false : (stryCov_9fa48("555"), true));
        const dateString = format(date, stryMutAct_9fa48("556") ? "" : (stryCov_9fa48("556"), "yyyy-MM-dd"));
        fetch2HoursArchive(stryMutAct_9fa48("557") ? "" : (stryCov_9fa48("557"), "BSK"), dateString).then(response => {
          if (stryMutAct_9fa48("558")) {
            {}
          } else {
            stryCov_9fa48("558");
            processAndSetData(response.data);
          }
        }).catch(error => {
          if (stryMutAct_9fa48("559")) {
            {}
          } else {
            stryCov_9fa48("559");
            console.error(stryMutAct_9fa48("560") ? "" : (stryCov_9fa48("560"), "Error fetching archive data:"), error);
          }
        }).finally(() => {
          if (stryMutAct_9fa48("561")) {
            {}
          } else {
            stryCov_9fa48("561");
            setLoading(stryMutAct_9fa48("562") ? true : (stryCov_9fa48("562"), false));
          }
        });
      }
    };
    const processAndSetData = fetchedData => {
      if (stryMutAct_9fa48("563")) {
        {}
      } else {
        stryCov_9fa48("563");
        console.log(stryMutAct_9fa48("564") ? "" : (stryCov_9fa48("564"), '=== processAndSetData Debug ==='));
        console.log(stryMutAct_9fa48("565") ? "" : (stryCov_9fa48("565"), 'Raw fetched data:'), fetchedData);
        const timeToMinutes = t => {
          if (stryMutAct_9fa48("566")) {
            {}
          } else {
            stryCov_9fa48("566");
            const [h, m] = stryMutAct_9fa48("567") ? t.split(":").map(Number) : (stryCov_9fa48("567"), t?.split(stryMutAct_9fa48("568") ? "" : (stryCov_9fa48("568"), ":")).map(Number));
            return stryMutAct_9fa48("569") ? h * 60 - m : (stryCov_9fa48("569"), (stryMutAct_9fa48("570") ? h / 60 : (stryCov_9fa48("570"), h * 60)) + m);
          }
        };
        const sortedData = stryMutAct_9fa48("571") ? [...fetchedData] : (stryCov_9fa48("571"), (stryMutAct_9fa48("572") ? [] : (stryCov_9fa48("572"), [...fetchedData])).sort((a, b) => {
          if (stryMutAct_9fa48("573")) {
            {}
          } else {
            stryCov_9fa48("573");
            const offset = t => {
              if (stryMutAct_9fa48("574")) {
                {}
              } else {
                stryCov_9fa48("574");
                const minutes = timeToMinutes(t);
                return stryMutAct_9fa48("575") ? (minutes - 120 + 1440) * 1440 : (stryCov_9fa48("575"), (stryMutAct_9fa48("576") ? minutes - 120 - 1440 : (stryCov_9fa48("576"), (stryMutAct_9fa48("577") ? minutes + 120 : (stryCov_9fa48("577"), minutes - 120)) + 1440)) % 1440);
              }
            };
            return stryMutAct_9fa48("578") ? offset(a.time) + offset(b.time) : (stryCov_9fa48("578"), offset(a.time) - offset(b.time));
          }
        }));
        console.log(stryMutAct_9fa48("579") ? "" : (stryCov_9fa48("579"), 'Sorted data:'), sortedData);
        const chartDate = stryMutAct_9fa48("582") ? sortedData[0]?.date && new Date().toISOString().split("T")[0] : stryMutAct_9fa48("581") ? false : stryMutAct_9fa48("580") ? true : (stryCov_9fa48("580", "581", "582"), (stryMutAct_9fa48("583") ? sortedData[0].date : (stryCov_9fa48("583"), sortedData[0]?.date)) || new Date().toISOString().split(stryMutAct_9fa48("584") ? "" : (stryCov_9fa48("584"), "T"))[0]);
        setChartDate(chartDate);
        const formattedData = sortedData.map((item, index) => {
          if (stryMutAct_9fa48("585")) {
            {}
          } else {
            stryCov_9fa48("585");
            const formatted = stryMutAct_9fa48("586") ? {} : (stryCov_9fa48("586"), {
              name: stryMutAct_9fa48("589") ? item.time?.slice(0, 5) && "" : stryMutAct_9fa48("588") ? false : stryMutAct_9fa48("587") ? true : (stryCov_9fa48("587", "588", "589"), (stryMutAct_9fa48("591") ? item.time.slice(0, 5) : stryMutAct_9fa48("590") ? item.time : (stryCov_9fa48("590", "591"), item.time?.slice(0, 5))) || (stryMutAct_9fa48("592") ? "Stryker was here!" : (stryCov_9fa48("592"), ""))),
              // Add Tin field to the data (note: field name is 'Tin' with capital T)
              tin: (stryMutAct_9fa48("595") ? item.Tin === undefined : stryMutAct_9fa48("594") ? false : stryMutAct_9fa48("593") ? true : (stryCov_9fa48("593", "594", "595"), item.Tin !== undefined)) ? item.Tin : 0,
              debit_last_day: Math.floor(stryMutAct_9fa48("598") ? item?.debit_last_day && 0 : stryMutAct_9fa48("597") ? false : stryMutAct_9fa48("596") ? true : (stryCov_9fa48("596", "597", "598"), (stryMutAct_9fa48("599") ? item.debit_last_day : (stryCov_9fa48("599"), item?.debit_last_day)) || 0)),
              tech_rezh: Math.floor(stryMutAct_9fa48("602") ? item?.tech_rezh && 0 : stryMutAct_9fa48("601") ? false : stryMutAct_9fa48("600") ? true : (stryCov_9fa48("600", "601", "602"), (stryMutAct_9fa48("603") ? item.tech_rezh : (stryCov_9fa48("603"), item?.tech_rezh)) || 0)),
              curr_debit: Math.floor(stryMutAct_9fa48("606") ? item?.current_debit && 0 : stryMutAct_9fa48("605") ? false : stryMutAct_9fa48("604") ? true : (stryCov_9fa48("604", "605", "606"), (stryMutAct_9fa48("607") ? item.current_debit : (stryCov_9fa48("607"), item?.current_debit)) || 0)),
              debit_last_day_nak: Math.floor(stryMutAct_9fa48("610") ? item?.debit_last_day_nak && 0 : stryMutAct_9fa48("609") ? false : stryMutAct_9fa48("608") ? true : (stryCov_9fa48("608", "609", "610"), (stryMutAct_9fa48("611") ? item.debit_last_day_nak : (stryCov_9fa48("611"), item?.debit_last_day_nak)) || 0)),
              tech_rezh_nak: Math.floor(stryMutAct_9fa48("614") ? item?.tech_rezh_nak && 0 : stryMutAct_9fa48("613") ? false : stryMutAct_9fa48("612") ? true : (stryCov_9fa48("612", "613", "614"), (stryMutAct_9fa48("615") ? item.tech_rezh_nak : (stryCov_9fa48("615"), item?.tech_rezh_nak)) || 0)),
              curr_debit_nak: Math.floor(stryMutAct_9fa48("618") ? item?.current_debit_nak && 0 : stryMutAct_9fa48("617") ? false : stryMutAct_9fa48("616") ? true : (stryCov_9fa48("616", "617", "618"), (stryMutAct_9fa48("619") ? item.current_debit_nak : (stryCov_9fa48("619"), item?.current_debit_nak)) || 0)),
              n_debit_last_day: Math.floor(stryMutAct_9fa48("622") ? item?.n_debit_last_day && 0 : stryMutAct_9fa48("621") ? false : stryMutAct_9fa48("620") ? true : (stryCov_9fa48("620", "621", "622"), (stryMutAct_9fa48("623") ? item.n_debit_last_day : (stryCov_9fa48("623"), item?.n_debit_last_day)) || 0)),
              n_tech_rezh: Math.floor(stryMutAct_9fa48("626") ? item?.n_tech_rezh && 0 : stryMutAct_9fa48("625") ? false : stryMutAct_9fa48("624") ? true : (stryCov_9fa48("624", "625", "626"), (stryMutAct_9fa48("627") ? item.n_tech_rezh : (stryCov_9fa48("627"), item?.n_tech_rezh)) || 0)),
              n_curr_debit: Math.floor(stryMutAct_9fa48("630") ? item?.n_current_debit && 0 : stryMutAct_9fa48("629") ? false : stryMutAct_9fa48("628") ? true : (stryCov_9fa48("628", "629", "630"), (stryMutAct_9fa48("631") ? item.n_current_debit : (stryCov_9fa48("631"), item?.n_current_debit)) || 0)),
              n_debit_last_day_nak: Math.floor(stryMutAct_9fa48("634") ? item?.n_debit_last_day_nak && 0 : stryMutAct_9fa48("633") ? false : stryMutAct_9fa48("632") ? true : (stryCov_9fa48("632", "633", "634"), (stryMutAct_9fa48("635") ? item.n_debit_last_day_nak : (stryCov_9fa48("635"), item?.n_debit_last_day_nak)) || 0)),
              n_tech_rezh_nak: Math.floor(stryMutAct_9fa48("638") ? item?.n_tech_rezh_nak && 0 : stryMutAct_9fa48("637") ? false : stryMutAct_9fa48("636") ? true : (stryCov_9fa48("636", "637", "638"), (stryMutAct_9fa48("639") ? item.n_tech_rezh_nak : (stryCov_9fa48("639"), item?.n_tech_rezh_nak)) || 0)),
              n_curr_debit_nak: Math.floor(stryMutAct_9fa48("642") ? item?.n_current_debit_nak && 0 : stryMutAct_9fa48("641") ? false : stryMutAct_9fa48("640") ? true : (stryCov_9fa48("640", "641", "642"), (stryMutAct_9fa48("643") ? item.n_current_debit_nak : (stryCov_9fa48("643"), item?.n_current_debit_nak)) || 0))
            });
            if (stryMutAct_9fa48("647") ? index >= 3 : stryMutAct_9fa48("646") ? index <= 3 : stryMutAct_9fa48("645") ? false : stryMutAct_9fa48("644") ? true : (stryCov_9fa48("644", "645", "646", "647"), index < 3)) {
              if (stryMutAct_9fa48("648")) {
                {}
              } else {
                stryCov_9fa48("648");
                // Log first 3 items
                console.log(stryMutAct_9fa48("649") ? `` : (stryCov_9fa48("649"), `Formatted data item ${index}:`), formatted);
                console.log(stryMutAct_9fa48("650") ? `` : (stryCov_9fa48("650"), `Original item ${index} Tin:`), item.Tin);
              }
            }
            return formatted;
          }
        });
        console.log(stryMutAct_9fa48("651") ? "" : (stryCov_9fa48("651"), 'All formatted data:'), formattedData);
        const liquidData = formattedData.map(stryMutAct_9fa48("652") ? () => undefined : (stryCov_9fa48("652"), item => stryMutAct_9fa48("653") ? {} : (stryCov_9fa48("653"), {
          name: item.name,
          tin: item.tin,
          debit_last_day: item.debit_last_day,
          tech_rezh: item.tech_rezh,
          curr_debit: item.curr_debit,
          debit_last_day_nak: item.debit_last_day_nak,
          tech_rezh_nak: item.tech_rezh_nak,
          curr_debit_nak: item.curr_debit_nak
        })));
        const oilData = formattedData.map(stryMutAct_9fa48("654") ? () => undefined : (stryCov_9fa48("654"), item => stryMutAct_9fa48("655") ? {} : (stryCov_9fa48("655"), {
          name: item.name,
          tin: item.tin,
          debit_last_day: item.n_debit_last_day,
          tech_rezh: item.n_tech_rezh,
          curr_debit: item.n_curr_debit,
          debit_last_day_nak: item.n_debit_last_day_nak,
          tech_rezh_nak: item.n_tech_rezh_nak,
          curr_debit_nak: item.n_curr_debit_nak
        })));
        console.log(stryMutAct_9fa48("656") ? "" : (stryCov_9fa48("656"), 'Liquid data:'), liquidData);
        console.log(stryMutAct_9fa48("657") ? "" : (stryCov_9fa48("657"), 'Oil data:'), oilData);
        setData(stryMutAct_9fa48("658") ? {} : (stryCov_9fa48("658"), {
          liquid: liquidData,
          oil: oilData
        }));
      }
    };
    useEffect(() => {
      if (stryMutAct_9fa48("659")) {
        {}
      } else {
        stryCov_9fa48("659");
        loadCurrentData();
      }
    }, stryMutAct_9fa48("660") ? ["Stryker was here"] : (stryCov_9fa48("660"), []));
    const handleNakChange = stryMutAct_9fa48("661") ? () => undefined : (stryCov_9fa48("661"), (() => {
      const handleNakChange = event => setNak(event.target.checked);
      return handleNakChange;
    })());
    const handleTypeChange = stryMutAct_9fa48("662") ? () => undefined : (stryCov_9fa48("662"), (() => {
      const handleTypeChange = event => setType(event.target.value);
      return handleTypeChange;
    })());
    const handleDateChange = date => {
      if (stryMutAct_9fa48("663")) {
        {}
      } else {
        stryCov_9fa48("663");
        if (stryMutAct_9fa48("665") ? false : stryMutAct_9fa48("664") ? true : (stryCov_9fa48("664", "665"), date)) {
          if (stryMutAct_9fa48("666")) {
            {}
          } else {
            stryCov_9fa48("666");
            setSelectedDate(date);
            setIsArchiveMode(stryMutAct_9fa48("667") ? false : (stryCov_9fa48("667"), true));
            loadArchiveData(date);
          }
        }
      }
    };
    const selectedData = useMemo(() => {
      if (stryMutAct_9fa48("668")) {
        {}
      } else {
        stryCov_9fa48("668");
        const result = isNak ? data[type].map(stryMutAct_9fa48("669") ? () => undefined : (stryCov_9fa48("669"), item => stryMutAct_9fa48("670") ? {} : (stryCov_9fa48("670"), {
          ...item,
          isNak: stryMutAct_9fa48("671") ? false : (stryCov_9fa48("671"), true)
        }))) : data[type];
        console.log(stryMutAct_9fa48("672") ? "" : (stryCov_9fa48("672"), '=== selectedData Debug ==='));
        console.log(stryMutAct_9fa48("673") ? "" : (stryCov_9fa48("673"), 'Type:'), type);
        console.log(stryMutAct_9fa48("674") ? "" : (stryCov_9fa48("674"), 'IsNak:'), isNak);
        console.log(stryMutAct_9fa48("675") ? "" : (stryCov_9fa48("675"), 'Data[type]:'), data[type]);
        console.log(stryMutAct_9fa48("676") ? "" : (stryCov_9fa48("676"), 'Selected data:'), result);
        return result;
      }
    }, stryMutAct_9fa48("677") ? [] : (stryCov_9fa48("677"), [data, type, isNak]));
    return <div>
      <div className={styles.controlsContainer}>
        <div className={styles.leftControls}>
          <div className={styles.controlGroup}>
            <input type="checkbox" checked={isNak} onChange={handleNakChange} />
            <label htmlFor="cumulative">Показать с накоплением</label>
          </div>

          <div className={styles.controlGroup}>
            <input type="radio" id="liquid" name="type" value="liquid" checked={stryMutAct_9fa48("680") ? type !== "liquid" : stryMutAct_9fa48("679") ? false : stryMutAct_9fa48("678") ? true : (stryCov_9fa48("678", "679", "680"), type === (stryMutAct_9fa48("681") ? "" : (stryCov_9fa48("681"), "liquid")))} onChange={handleTypeChange} />
            <label htmlFor="liquid">Жидкость</label>
            <span>/</span>
            <input type="radio" id="oil" name="type" value="oil" checked={stryMutAct_9fa48("684") ? type !== "oil" : stryMutAct_9fa48("683") ? false : stryMutAct_9fa48("682") ? true : (stryCov_9fa48("682", "683", "684"), type === (stryMutAct_9fa48("685") ? "" : (stryCov_9fa48("685"), "oil")))} onChange={handleTypeChange} />
            <label htmlFor="oil">Нефть</label>
          </div>
        </div>

        <div className={styles.rightControls}>
          <DatePicker selected={selectedDate} onChange={handleDateChange} highlightDates={parsedAvailableDates} placeholderText="Выберите дату" className={styles.customDatepicker} />

          {stryMutAct_9fa48("688") ? isArchiveMode || <button onClick={handleReset} className={styles.resetButton}>
              🔄 Текущие данные
            </button> : stryMutAct_9fa48("687") ? false : stryMutAct_9fa48("686") ? true : (stryCov_9fa48("686", "687", "688"), isArchiveMode && <button onClick={handleReset} className={styles.resetButton}>
              🔄 Текущие данные
            </button>)}

          {/* <button 
            onClick={handleExportToExcel}
            disabled={exporting || loading || !selectedData.length}
            className={styles.exportButton}
            title="Экспортировать данные в Excel"
           >
            {exporting ? '⏳ Экспорт...' : '📊 Excel'}
           </button> */}

          {stryMutAct_9fa48("691") ? loading || <span className={styles.loadingText}>⏳ Загрузка...</span> : stryMutAct_9fa48("690") ? false : stryMutAct_9fa48("689") ? true : (stryCov_9fa48("689", "690", "691"), loading && <span className={styles.loadingText}>⏳ Загрузка...</span>)}
        </div>
      </div>

      <CustomChart data={selectedData} width={800} height={350} isNak={isNak} type={type} chartDate={chartDate} isArchiveMode={isArchiveMode} />
    </div>;
  }
}