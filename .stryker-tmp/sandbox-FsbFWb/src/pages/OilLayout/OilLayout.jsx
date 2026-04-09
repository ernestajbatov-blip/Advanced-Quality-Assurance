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
  if (stryMutAct_9fa48("1687")) {
    {}
  } else {
    stryCov_9fa48("1687");
    const {
      user,
      onLogout
    } = useUser();
    const [selectedWell, setSelectedWell] = useState(stryMutAct_9fa48("1688") ? "" : (stryCov_9fa48("1688"), "all"));
    const [searchTerm, setSearchTerm] = useState(stryMutAct_9fa48("1689") ? "Stryker was here!" : (stryCov_9fa48("1689"), ""));
    const [isDropdownOpen, setIsDropdownOpen] = useState(stryMutAct_9fa48("1690") ? true : (stryCov_9fa48("1690"), false));
    const [oilLossData, setOilLossData] = useState(stryMutAct_9fa48("1691") ? ["Stryker was here"] : (stryCov_9fa48("1691"), []));
    const [availableWells, setAvailableWells] = useState(stryMutAct_9fa48("1692") ? ["Stryker was here"] : (stryCov_9fa48("1692"), []));
    const [loading, setLoading] = useState(stryMutAct_9fa48("1693") ? true : (stryCov_9fa48("1693"), false));
    const [error, setError] = useState(null);
    const [initialRange, setInitialRange] = useState(stryMutAct_9fa48("1694") ? [] : (stryCov_9fa48("1694"), [stryMutAct_9fa48("1695") ? {} : (stryCov_9fa48("1695"), {
      startDate: new Date(stryMutAct_9fa48("1696") ? "" : (stryCov_9fa48("1696"), '2025-06-01')),
      endDate: new Date(stryMutAct_9fa48("1697") ? "" : (stryCov_9fa48("1697"), '2025-06-14')),
      key: stryMutAct_9fa48("1698") ? "" : (stryCov_9fa48("1698"), 'initialSelection')
    })]));
    const [finalRange, setFinalRange] = useState(stryMutAct_9fa48("1699") ? [] : (stryCov_9fa48("1699"), [stryMutAct_9fa48("1700") ? {} : (stryCov_9fa48("1700"), {
      startDate: new Date(stryMutAct_9fa48("1701") ? "" : (stryCov_9fa48("1701"), '2025-07-01')),
      endDate: new Date(stryMutAct_9fa48("1702") ? "" : (stryCov_9fa48("1702"), '2025-07-14')),
      key: stryMutAct_9fa48("1703") ? "" : (stryCov_9fa48("1703"), 'finalSelection')
    })]));
    const [showInitialPicker, setShowInitialPicker] = useState(stryMutAct_9fa48("1704") ? true : (stryCov_9fa48("1704"), false));
    const [showFinalPicker, setShowFinalPicker] = useState(stryMutAct_9fa48("1705") ? true : (stryCov_9fa48("1705"), false));
    const [statusFilter, setStatusFilter] = useState(stryMutAct_9fa48("1706") ? "" : (stryCov_9fa48("1706"), "All"));
    const dropdownRef = useRef(null);
    const initialPickerRef = useRef(null);
    const finalPickerRef = useRef(null);
    const formatDateForAPI = date => {
      if (stryMutAct_9fa48("1707")) {
        {}
      } else {
        stryCov_9fa48("1707");
        return date.toISOString().split(stryMutAct_9fa48("1708") ? "" : (stryCov_9fa48("1708"), 'T'))[0];
      }
    };
    const isDateWithData = date => {
      if (stryMutAct_9fa48("1709")) {
        {}
      } else {
        stryCov_9fa48("1709");
        if (stryMutAct_9fa48("1712") ? !oilLossData && oilLossData.length === 0 : stryMutAct_9fa48("1711") ? false : stryMutAct_9fa48("1710") ? true : (stryCov_9fa48("1710", "1711", "1712"), (stryMutAct_9fa48("1713") ? oilLossData : (stryCov_9fa48("1713"), !oilLossData)) || (stryMutAct_9fa48("1715") ? oilLossData.length !== 0 : stryMutAct_9fa48("1714") ? false : (stryCov_9fa48("1714", "1715"), oilLossData.length === 0)))) return stryMutAct_9fa48("1716") ? true : (stryCov_9fa48("1716"), false);
        const dateStr = formatDateForAPI(date);
        return stryMutAct_9fa48("1717") ? oilLossData.every(item => item.date === dateStr) : (stryCov_9fa48("1717"), oilLossData.some(stryMutAct_9fa48("1718") ? () => undefined : (stryCov_9fa48("1718"), item => stryMutAct_9fa48("1721") ? item.date !== dateStr : stryMutAct_9fa48("1720") ? false : stryMutAct_9fa48("1719") ? true : (stryCov_9fa48("1719", "1720", "1721"), item.date === dateStr))));
      }
    };
    const dayContentRenderer = date => {
      if (stryMutAct_9fa48("1722")) {
        {}
      } else {
        stryCov_9fa48("1722");
        const hasData = isDateWithData(date);
        return <div style={stryMutAct_9fa48("1723") ? {} : (stryCov_9fa48("1723"), {
          position: stryMutAct_9fa48("1724") ? "" : (stryCov_9fa48("1724"), "relative")
        })}>
        <span>{date.getDate()}</span>
        {stryMutAct_9fa48("1727") ? hasData || <div style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#4CAF50",
            position: "absolute",
            bottom: 2,
            left: "50%",
            transform: "translateX(-50%)"
          }} /> : stryMutAct_9fa48("1726") ? false : stryMutAct_9fa48("1725") ? true : (stryCov_9fa48("1725", "1726", "1727"), hasData && <div style={stryMutAct_9fa48("1728") ? {} : (stryCov_9fa48("1728"), {
            width: 6,
            height: 6,
            borderRadius: stryMutAct_9fa48("1729") ? "" : (stryCov_9fa48("1729"), "50%"),
            background: stryMutAct_9fa48("1730") ? "" : (stryCov_9fa48("1730"), "#4CAF50"),
            position: stryMutAct_9fa48("1731") ? "" : (stryCov_9fa48("1731"), "absolute"),
            bottom: 2,
            left: stryMutAct_9fa48("1732") ? "" : (stryCov_9fa48("1732"), "50%"),
            transform: stryMutAct_9fa48("1733") ? "" : (stryCov_9fa48("1733"), "translateX(-50%)")
          })} />)}
      </div>;
      }
    };
    useEffect(() => {
      if (stryMutAct_9fa48("1734")) {
        {}
      } else {
        stryCov_9fa48("1734");
        const fetchWells = async () => {
          if (stryMutAct_9fa48("1735")) {
            {}
          } else {
            stryCov_9fa48("1735");
            try {
              if (stryMutAct_9fa48("1736")) {
                {}
              } else {
                stryCov_9fa48("1736");
                setError(null);
                console.log(stryMutAct_9fa48("1737") ? "" : (stryCov_9fa48("1737"), 'Fetching wells...'));
                const response = await fetch(stryMutAct_9fa48("1738") ? "" : (stryCov_9fa48("1738"), "/api/oil-loss/wells"));
                console.log(stryMutAct_9fa48("1739") ? "" : (stryCov_9fa48("1739"), 'Wells response status:'), response.status);
                if (stryMutAct_9fa48("1742") ? false : stryMutAct_9fa48("1741") ? true : stryMutAct_9fa48("1740") ? response.ok : (stryCov_9fa48("1740", "1741", "1742"), !response.ok)) {
                  if (stryMutAct_9fa48("1743")) {
                    {}
                  } else {
                    stryCov_9fa48("1743");
                    throw new Error(stryMutAct_9fa48("1744") ? `` : (stryCov_9fa48("1744"), `HTTP ${response.status}: ${response.statusText}`));
                  }
                }
                const data = await response.json();
                console.log(stryMutAct_9fa48("1745") ? "" : (stryCov_9fa48("1745"), 'Wells data:'), data);
                if (stryMutAct_9fa48("1747") ? false : stryMutAct_9fa48("1746") ? true : (stryCov_9fa48("1746", "1747"), Array.isArray(data))) {
                  if (stryMutAct_9fa48("1748")) {
                    {}
                  } else {
                    stryCov_9fa48("1748");
                    setAvailableWells(data.map(stryMutAct_9fa48("1749") ? () => undefined : (stryCov_9fa48("1749"), item => stryMutAct_9fa48("1752") ? item.well && item : stryMutAct_9fa48("1751") ? false : stryMutAct_9fa48("1750") ? true : (stryCov_9fa48("1750", "1751", "1752"), item.well || item))));
                  }
                } else {
                  if (stryMutAct_9fa48("1753")) {
                    {}
                  } else {
                    stryCov_9fa48("1753");
                    console.error(stryMutAct_9fa48("1754") ? "" : (stryCov_9fa48("1754"), 'Wells data is not an array:'), data);
                    setAvailableWells(stryMutAct_9fa48("1755") ? ["Stryker was here"] : (stryCov_9fa48("1755"), []));
                  }
                }
              }
            } catch (error) {
              if (stryMutAct_9fa48("1756")) {
                {}
              } else {
                stryCov_9fa48("1756");
                console.error(stryMutAct_9fa48("1757") ? "" : (stryCov_9fa48("1757"), "Error fetching wells:"), error);
                setError(stryMutAct_9fa48("1758") ? `` : (stryCov_9fa48("1758"), `Error fetching wells: ${error.message}`));
                setAvailableWells(stryMutAct_9fa48("1759") ? ["Stryker was here"] : (stryCov_9fa48("1759"), []));
              }
            }
          }
        };
        fetchWells();
      }
    }, stryMutAct_9fa48("1760") ? ["Stryker was here"] : (stryCov_9fa48("1760"), []));
    useEffect(() => {
      if (stryMutAct_9fa48("1761")) {
        {}
      } else {
        stryCov_9fa48("1761");
        const fetchOilLossData = async () => {
          if (stryMutAct_9fa48("1762")) {
            {}
          } else {
            stryCov_9fa48("1762");
            setLoading(stryMutAct_9fa48("1763") ? false : (stryCov_9fa48("1763"), true));
            setError(null);
            try {
              if (stryMutAct_9fa48("1764")) {
                {}
              } else {
                stryCov_9fa48("1764");
                const allDates = stryMutAct_9fa48("1765") ? [] : (stryCov_9fa48("1765"), [initialRange[0].startDate, initialRange[0].endDate, finalRange[0].startDate, finalRange[0].endDate]);
                const minDate = new Date(stryMutAct_9fa48("1766") ? Math.max(...allDates) : (stryCov_9fa48("1766"), Math.min(...allDates)));
                const maxDate = new Date(stryMutAct_9fa48("1767") ? Math.min(...allDates) : (stryCov_9fa48("1767"), Math.max(...allDates)));
                const params = new URLSearchParams(stryMutAct_9fa48("1768") ? {} : (stryCov_9fa48("1768"), {
                  startDate: formatDateForAPI(minDate),
                  endDate: formatDateForAPI(maxDate)
                }));
                if (stryMutAct_9fa48("1771") ? selectedWell === "all" : stryMutAct_9fa48("1770") ? false : stryMutAct_9fa48("1769") ? true : (stryCov_9fa48("1769", "1770", "1771"), selectedWell !== (stryMutAct_9fa48("1772") ? "" : (stryCov_9fa48("1772"), "all")))) {
                  if (stryMutAct_9fa48("1773")) {
                    {}
                  } else {
                    stryCov_9fa48("1773");
                    params.append(stryMutAct_9fa48("1774") ? "" : (stryCov_9fa48("1774"), "well"), selectedWell);
                  }
                }
                const url = stryMutAct_9fa48("1775") ? `` : (stryCov_9fa48("1775"), `/api/oil-loss?${params}`);
                const response = await fetch(url);
                if (stryMutAct_9fa48("1778") ? false : stryMutAct_9fa48("1777") ? true : stryMutAct_9fa48("1776") ? response.ok : (stryCov_9fa48("1776", "1777", "1778"), !response.ok)) {
                  if (stryMutAct_9fa48("1779")) {
                    {}
                  } else {
                    stryCov_9fa48("1779");
                    throw new Error(stryMutAct_9fa48("1780") ? `` : (stryCov_9fa48("1780"), `HTTP ${response.status}: ${response.statusText}`));
                  }
                }
                const data = await response.json();
                if (stryMutAct_9fa48("1782") ? false : stryMutAct_9fa48("1781") ? true : (stryCov_9fa48("1781", "1782"), Array.isArray(data))) {
                  if (stryMutAct_9fa48("1783")) {
                    {}
                  } else {
                    stryCov_9fa48("1783");
                    console.log(stryMutAct_9fa48("1784") ? "" : (stryCov_9fa48("1784"), '📊 Raw API Response for'), selectedWell, stryMutAct_9fa48("1785") ? "" : (stryCov_9fa48("1785"), ':'), data.length, stryMutAct_9fa48("1786") ? "" : (stryCov_9fa48("1786"), 'records'));

                    // Check for July 14
                    const july14Records = stryMutAct_9fa48("1787") ? data : (stryCov_9fa48("1787"), data.filter(item => {
                      if (stryMutAct_9fa48("1788")) {
                        {}
                      } else {
                        stryCov_9fa48("1788");
                        const dateStr = item.date instanceof Date ? item.date.toISOString().split(stryMutAct_9fa48("1789") ? "" : (stryCov_9fa48("1789"), 'T'))[0] : item.date.split(stryMutAct_9fa48("1790") ? "" : (stryCov_9fa48("1790"), 'T'))[0];
                        return stryMutAct_9fa48("1793") ? dateStr === '2025-07-14' || item.well === selectedWell : stryMutAct_9fa48("1792") ? false : stryMutAct_9fa48("1791") ? true : (stryCov_9fa48("1791", "1792", "1793"), (stryMutAct_9fa48("1795") ? dateStr !== '2025-07-14' : stryMutAct_9fa48("1794") ? true : (stryCov_9fa48("1794", "1795"), dateStr === (stryMutAct_9fa48("1796") ? "" : (stryCov_9fa48("1796"), '2025-07-14')))) && (stryMutAct_9fa48("1798") ? item.well !== selectedWell : stryMutAct_9fa48("1797") ? true : (stryCov_9fa48("1797", "1798"), item.well === selectedWell)));
                      }
                    }));
                    console.log(stryMutAct_9fa48("1799") ? "" : (stryCov_9fa48("1799"), 'July 14 records in API response:'), july14Records);
                    setOilLossData(data);
                  }
                } else {
                  if (stryMutAct_9fa48("1800")) {
                    {}
                  } else {
                    stryCov_9fa48("1800");
                    console.error(stryMutAct_9fa48("1801") ? "" : (stryCov_9fa48("1801"), 'Oil loss data is not an array:'), data);
                    setOilLossData(stryMutAct_9fa48("1802") ? ["Stryker was here"] : (stryCov_9fa48("1802"), []));
                  }
                }
              }
            } catch (error) {
              if (stryMutAct_9fa48("1803")) {
                {}
              } else {
                stryCov_9fa48("1803");
                console.error(stryMutAct_9fa48("1804") ? "" : (stryCov_9fa48("1804"), "Error fetching oil loss data:"), error);
                setError(stryMutAct_9fa48("1805") ? `` : (stryCov_9fa48("1805"), `Error fetching data: ${error.message}`));
                setOilLossData(stryMutAct_9fa48("1806") ? ["Stryker was here"] : (stryCov_9fa48("1806"), []));
              }
            } finally {
              if (stryMutAct_9fa48("1807")) {
                {}
              } else {
                stryCov_9fa48("1807");
                setLoading(stryMutAct_9fa48("1808") ? true : (stryCov_9fa48("1808"), false));
              }
            }
          }
        };
        fetchOilLossData();
      }
    }, stryMutAct_9fa48("1809") ? [] : (stryCov_9fa48("1809"), [selectedWell, initialRange, finalRange]));

    // Helper to extract date string from ISO format or Date object
    const getDateOnly = dateString => {
      if (stryMutAct_9fa48("1810")) {
        {}
      } else {
        stryCov_9fa48("1810");
        // If it's already a Date object, convert to ISO string first
        if (stryMutAct_9fa48("1812") ? false : stryMutAct_9fa48("1811") ? true : (stryCov_9fa48("1811", "1812"), dateString instanceof Date)) {
          if (stryMutAct_9fa48("1813")) {
            {}
          } else {
            stryCov_9fa48("1813");
            return dateString.toISOString().split(stryMutAct_9fa48("1814") ? "" : (stryCov_9fa48("1814"), 'T'))[0];
          }
        }
        // If it's a string in ISO format
        return dateString.split(stryMutAct_9fa48("1815") ? "" : (stryCov_9fa48("1815"), 'T'))[0];
      }
    };
    const prepareAnalysisInput = wellFilter => {
      if (stryMutAct_9fa48("1816")) {
        {}
      } else {
        stryCov_9fa48("1816");
        if (stryMutAct_9fa48("1819") ? !oilLossData && oilLossData.length === 0 : stryMutAct_9fa48("1818") ? false : stryMutAct_9fa48("1817") ? true : (stryCov_9fa48("1817", "1818", "1819"), (stryMutAct_9fa48("1820") ? oilLossData : (stryCov_9fa48("1820"), !oilLossData)) || (stryMutAct_9fa48("1822") ? oilLossData.length !== 0 : stryMutAct_9fa48("1821") ? false : (stryCov_9fa48("1821", "1822"), oilLossData.length === 0)))) return null;
        const aggregateForRange = (startDate, endDate, wellName) => {
          if (stryMutAct_9fa48("1823")) {
            {}
          } else {
            stryCov_9fa48("1823");
            const startStr = formatDateForAPI(startDate);
            const endStr = formatDateForAPI(endDate);
            console.log(stryMutAct_9fa48("1824") ? `` : (stryCov_9fa48("1824"), `Filtering for ${wellName}: ${startStr} to ${endStr}`));
            console.log(stryMutAct_9fa48("1825") ? `` : (stryCov_9fa48("1825"), `Total oilLossData records: ${oilLossData.length}`));
            const filtered = stryMutAct_9fa48("1826") ? oilLossData : (stryCov_9fa48("1826"), oilLossData.filter(item => {
              if (stryMutAct_9fa48("1827")) {
                {}
              } else {
                stryCov_9fa48("1827");
                const itemDateStr = getDateOnly(item.date);
                const inRange = stryMutAct_9fa48("1830") ? itemDateStr >= startStr || itemDateStr <= endStr : stryMutAct_9fa48("1829") ? false : stryMutAct_9fa48("1828") ? true : (stryCov_9fa48("1828", "1829", "1830"), (stryMutAct_9fa48("1833") ? itemDateStr < startStr : stryMutAct_9fa48("1832") ? itemDateStr > startStr : stryMutAct_9fa48("1831") ? true : (stryCov_9fa48("1831", "1832", "1833"), itemDateStr >= startStr)) && (stryMutAct_9fa48("1836") ? itemDateStr > endStr : stryMutAct_9fa48("1835") ? itemDateStr < endStr : stryMutAct_9fa48("1834") ? true : (stryCov_9fa48("1834", "1835", "1836"), itemDateStr <= endStr)));
                const matchesWell = wellName ? stryMutAct_9fa48("1839") ? item.well !== wellName : stryMutAct_9fa48("1838") ? false : stryMutAct_9fa48("1837") ? true : (stryCov_9fa48("1837", "1838", "1839"), item.well === wellName) : stryMutAct_9fa48("1840") ? false : (stryCov_9fa48("1840"), true);
                if (stryMutAct_9fa48("1843") ? inRange || matchesWell : stryMutAct_9fa48("1842") ? false : stryMutAct_9fa48("1841") ? true : (stryCov_9fa48("1841", "1842", "1843"), inRange && matchesWell)) {
                  if (stryMutAct_9fa48("1844")) {
                    {}
                  } else {
                    stryCov_9fa48("1844");
                    console.log(stryMutAct_9fa48("1845") ? `` : (stryCov_9fa48("1845"), `  ✓ Included: ${itemDateStr} (well: ${item.well})`));
                  }
                }
                return stryMutAct_9fa48("1848") ? inRange || matchesWell : stryMutAct_9fa48("1847") ? false : stryMutAct_9fa48("1846") ? true : (stryCov_9fa48("1846", "1847", "1848"), inRange && matchesWell);
              }
            }));
            if (stryMutAct_9fa48("1851") ? filtered.length !== 0 : stryMutAct_9fa48("1850") ? false : stryMutAct_9fa48("1849") ? true : (stryCov_9fa48("1849", "1850", "1851"), filtered.length === 0)) {
              if (stryMutAct_9fa48("1852")) {
                {}
              } else {
                stryCov_9fa48("1852");
                console.log(stryMutAct_9fa48("1853") ? `` : (stryCov_9fa48("1853"), `No records found for well ${wellName} in range ${startStr} to ${endStr}`));
                return null;
              }
            }
            console.log(stryMutAct_9fa48("1854") ? `` : (stryCov_9fa48("1854"), `\n=== WELL ${wellName} (${startStr} to ${endStr}) ===`));
            console.log(stryMutAct_9fa48("1855") ? `` : (stryCov_9fa48("1855"), `Found ${filtered.length} records`));
            const totals = filtered.reduce(stryMutAct_9fa48("1856") ? () => undefined : (stryCov_9fa48("1856"), (acc, item) => stryMutAct_9fa48("1857") ? {} : (stryCov_9fa48("1857"), {
              oil: stryMutAct_9fa48("1858") ? acc.oil - (parseFloat(item.tm_oil) || 0) : (stryCov_9fa48("1858"), acc.oil + (stryMutAct_9fa48("1861") ? parseFloat(item.tm_oil) && 0 : stryMutAct_9fa48("1860") ? false : stryMutAct_9fa48("1859") ? true : (stryCov_9fa48("1859", "1860", "1861"), parseFloat(item.tm_oil) || 0))),
              fluid: stryMutAct_9fa48("1862") ? acc.fluid - (parseFloat(item.tm_fluid) || 0) : (stryCov_9fa48("1862"), acc.fluid + (stryMutAct_9fa48("1865") ? parseFloat(item.tm_fluid) && 0 : stryMutAct_9fa48("1864") ? false : stryMutAct_9fa48("1863") ? true : (stryCov_9fa48("1863", "1864", "1865"), parseFloat(item.tm_fluid) || 0))),
              workTime: stryMutAct_9fa48("1866") ? acc.workTime - (parseFloat(item.well_work_time) || 0) : (stryCov_9fa48("1866"), acc.workTime + (stryMutAct_9fa48("1869") ? parseFloat(item.well_work_time) && 0 : stryMutAct_9fa48("1868") ? false : stryMutAct_9fa48("1867") ? true : (stryCov_9fa48("1867", "1868", "1869"), parseFloat(item.well_work_time) || 0)))
            })), stryMutAct_9fa48("1870") ? {} : (stryCov_9fa48("1870"), {
              oil: 0,
              fluid: 0,
              workTime: 0
            }));
            console.log(stryMutAct_9fa48("1871") ? `` : (stryCov_9fa48("1871"), `Totals: oil=${totals.oil.toFixed(2)}, fluid=${totals.fluid.toFixed(2)}, workTime=${totals.workTime.toFixed(2)}h`));
            console.log(stryMutAct_9fa48("1872") ? `` : (stryCov_9fa48("1872"), `Days: ${(stryMutAct_9fa48("1873") ? totals.workTime * 24 : (stryCov_9fa48("1873"), totals.workTime / 24)).toFixed(2)}`));
            return stryMutAct_9fa48("1874") ? {} : (stryCov_9fa48("1874"), {
              oil: totals.oil,
              fluid: totals.fluid,
              workDays: stryMutAct_9fa48("1875") ? totals.workTime * 24 : (stryCov_9fa48("1875"), totals.workTime / 24)
            });
          }
        };
        const wells = wellFilter ? stryMutAct_9fa48("1876") ? [] : (stryCov_9fa48("1876"), [wellFilter]) : stryMutAct_9fa48("1877") ? [] : (stryCov_9fa48("1877"), [...new Set(oilLossData.map(stryMutAct_9fa48("1878") ? () => undefined : (stryCov_9fa48("1878"), item => item.well)))]);
        const records = stryMutAct_9fa48("1879") ? ["Stryker was here"] : (stryCov_9fa48("1879"), []);
        wells.forEach(well => {
          if (stryMutAct_9fa48("1880")) {
            {}
          } else {
            stryCov_9fa48("1880");
            // Use the actual selected ranges, not the API range
            const initial = aggregateForRange(initialRange[0].startDate, initialRange[0].endDate, well);
            const final = aggregateForRange(finalRange[0].startDate, finalRange[0].endDate, well);
            if (stryMutAct_9fa48("1883") ? initial || final : stryMutAct_9fa48("1882") ? false : stryMutAct_9fa48("1881") ? true : (stryCov_9fa48("1881", "1882", "1883"), initial && final)) {
              if (stryMutAct_9fa48("1884")) {
                {}
              } else {
                stryCov_9fa48("1884");
                records.push(stryMutAct_9fa48("1885") ? {} : (stryCov_9fa48("1885"), {
                  clm_1: well,
                  clm_2: initial.oil,
                  clm_3: final.oil,
                  clm_4: initial.fluid,
                  clm_5: final.fluid,
                  clm_6: initial.workDays,
                  clm_7: final.workDays
                }));
              }
            }
          }
        });
        return (stryMutAct_9fa48("1889") ? records.length <= 0 : stryMutAct_9fa48("1888") ? records.length >= 0 : stryMutAct_9fa48("1887") ? false : stryMutAct_9fa48("1886") ? true : (stryCov_9fa48("1886", "1887", "1888", "1889"), records.length > 0)) ? stryMutAct_9fa48("1890") ? {} : (stryCov_9fa48("1890"), {
          records,
          cfg: {}
        }) : null;
      }
    };
    const [analysisData, setAnalysisData] = useState(null);
    const [analysisLoading, setAnalysisLoading] = useState(stryMutAct_9fa48("1891") ? true : (stryCov_9fa48("1891"), false));
    useEffect(() => {
      if (stryMutAct_9fa48("1892")) {
        {}
      } else {
        stryCov_9fa48("1892");
        const fetchAnalysis = async () => {
          if (stryMutAct_9fa48("1893")) {
            {}
          } else {
            stryCov_9fa48("1893");
            if (stryMutAct_9fa48("1896") ? !oilLossData && oilLossData.length === 0 : stryMutAct_9fa48("1895") ? false : stryMutAct_9fa48("1894") ? true : (stryCov_9fa48("1894", "1895", "1896"), (stryMutAct_9fa48("1897") ? oilLossData : (stryCov_9fa48("1897"), !oilLossData)) || (stryMutAct_9fa48("1899") ? oilLossData.length !== 0 : stryMutAct_9fa48("1898") ? false : (stryCov_9fa48("1898", "1899"), oilLossData.length === 0)))) {
              if (stryMutAct_9fa48("1900")) {
                {}
              } else {
                stryCov_9fa48("1900");
                setAnalysisData(null);
                return;
              }
            }
            setAnalysisLoading(stryMutAct_9fa48("1901") ? false : (stryCov_9fa48("1901"), true));
            setError(null);
            try {
              if (stryMutAct_9fa48("1902")) {
                {}
              } else {
                stryCov_9fa48("1902");
                const wellFilter = (stryMutAct_9fa48("1905") ? selectedWell !== "all" : stryMutAct_9fa48("1904") ? false : stryMutAct_9fa48("1903") ? true : (stryCov_9fa48("1903", "1904", "1905"), selectedWell === (stryMutAct_9fa48("1906") ? "" : (stryCov_9fa48("1906"), "all")))) ? null : selectedWell;

                // Logging happens HERE, not inside prepareAnalysisInput
                console.log(stryMutAct_9fa48("1907") ? "" : (stryCov_9fa48("1907"), '\n========== ANALYSIS INPUT PREPARATION =========='));
                console.log(stryMutAct_9fa48("1908") ? "" : (stryCov_9fa48("1908"), 'Selected well:'), selectedWell);
                console.log(stryMutAct_9fa48("1909") ? "" : (stryCov_9fa48("1909"), 'Initial range:'), formatDateForAPI(initialRange[0].startDate), stryMutAct_9fa48("1910") ? "" : (stryCov_9fa48("1910"), 'to'), formatDateForAPI(initialRange[0].endDate));
                console.log(stryMutAct_9fa48("1911") ? "" : (stryCov_9fa48("1911"), 'Final range:'), formatDateForAPI(finalRange[0].startDate), stryMutAct_9fa48("1912") ? "" : (stryCov_9fa48("1912"), 'to'), formatDateForAPI(finalRange[0].endDate));
                const inputData = prepareAnalysisInput(wellFilter);
                console.log(stryMutAct_9fa48("1913") ? "" : (stryCov_9fa48("1913"), 'Final input data:'), JSON.stringify(inputData, null, 2));
                console.log(stryMutAct_9fa48("1914") ? "" : (stryCov_9fa48("1914"), '============================================\n'));
                if (stryMutAct_9fa48("1917") ? false : stryMutAct_9fa48("1916") ? true : stryMutAct_9fa48("1915") ? inputData : (stryCov_9fa48("1915", "1916", "1917"), !inputData)) {
                  if (stryMutAct_9fa48("1918")) {
                    {}
                  } else {
                    stryCov_9fa48("1918");
                    setAnalysisData(null);
                    setAnalysisLoading(stryMutAct_9fa48("1919") ? true : (stryCov_9fa48("1919"), false));
                    return;
                  }
                }
                console.log(stryMutAct_9fa48("1920") ? "" : (stryCov_9fa48("1920"), 'Sending analysis request:'), inputData);
                const response = await fetch(stryMutAct_9fa48("1921") ? "" : (stryCov_9fa48("1921"), '/api/oil-loss/analysis'), stryMutAct_9fa48("1922") ? {} : (stryCov_9fa48("1922"), {
                  method: stryMutAct_9fa48("1923") ? "" : (stryCov_9fa48("1923"), 'POST'),
                  headers: stryMutAct_9fa48("1924") ? {} : (stryCov_9fa48("1924"), {
                    'Content-Type': stryMutAct_9fa48("1925") ? "" : (stryCov_9fa48("1925"), 'application/json')
                  }),
                  body: JSON.stringify(inputData)
                }));
                if (stryMutAct_9fa48("1928") ? false : stryMutAct_9fa48("1927") ? true : stryMutAct_9fa48("1926") ? response.ok : (stryCov_9fa48("1926", "1927", "1928"), !response.ok)) {
                  if (stryMutAct_9fa48("1929")) {
                    {}
                  } else {
                    stryCov_9fa48("1929");
                    const errorData = await response.json().catch(stryMutAct_9fa48("1930") ? () => undefined : (stryCov_9fa48("1930"), () => ({})));
                    throw new Error(stryMutAct_9fa48("1933") ? errorData.error && `Analysis failed: ${response.status}` : stryMutAct_9fa48("1932") ? false : stryMutAct_9fa48("1931") ? true : (stryCov_9fa48("1931", "1932", "1933"), errorData.error || (stryMutAct_9fa48("1934") ? `` : (stryCov_9fa48("1934"), `Analysis failed: ${response.status}`))));
                  }
                }
                const data = await response.json();
                console.log(stryMutAct_9fa48("1935") ? "" : (stryCov_9fa48("1935"), 'Analysis response:'), data);
                if (stryMutAct_9fa48("1938") ? data.result || data.result.resOilProd : stryMutAct_9fa48("1937") ? false : stryMutAct_9fa48("1936") ? true : (stryCov_9fa48("1936", "1937", "1938"), data.result && data.result.resOilProd)) {
                  if (stryMutAct_9fa48("1939")) {
                    {}
                  } else {
                    stryCov_9fa48("1939");
                    setAnalysisData(data.result);
                  }
                } else if (stryMutAct_9fa48("1941") ? false : stryMutAct_9fa48("1940") ? true : (stryCov_9fa48("1940", "1941"), data.resOilProd)) {
                  if (stryMutAct_9fa48("1942")) {
                    {}
                  } else {
                    stryCov_9fa48("1942");
                    setAnalysisData(data);
                  }
                } else {
                  if (stryMutAct_9fa48("1943")) {
                    {}
                  } else {
                    stryCov_9fa48("1943");
                    setAnalysisData(null);
                  }
                }
              }
            } catch (error) {
              if (stryMutAct_9fa48("1944")) {
                {}
              } else {
                stryCov_9fa48("1944");
                console.error(stryMutAct_9fa48("1945") ? "" : (stryCov_9fa48("1945"), 'Error fetching analysis:'), error);
                setError(stryMutAct_9fa48("1946") ? `` : (stryCov_9fa48("1946"), `Analysis error: ${error.message}`));
                setAnalysisData(null);
              }
            } finally {
              if (stryMutAct_9fa48("1947")) {
                {}
              } else {
                stryCov_9fa48("1947");
                setAnalysisLoading(stryMutAct_9fa48("1948") ? true : (stryCov_9fa48("1948"), false));
              }
            }
          }
        };
        const timeoutId = setTimeout(fetchAnalysis, 500);
        return stryMutAct_9fa48("1949") ? () => undefined : (stryCov_9fa48("1949"), () => clearTimeout(timeoutId));
      }
    }, stryMutAct_9fa48("1950") ? [] : (stryCov_9fa48("1950"), [oilLossData, selectedWell, initialRange, finalRange]));
    const processedData = useMemo(() => {
      if (stryMutAct_9fa48("1951")) {
        {}
      } else {
        stryCov_9fa48("1951");
        if (stryMutAct_9fa48("1954") ? !analysisData && !analysisData.resOilProd : stryMutAct_9fa48("1953") ? false : stryMutAct_9fa48("1952") ? true : (stryCov_9fa48("1952", "1953", "1954"), (stryMutAct_9fa48("1955") ? analysisData : (stryCov_9fa48("1955"), !analysisData)) || (stryMutAct_9fa48("1956") ? analysisData.resOilProd : (stryCov_9fa48("1956"), !analysisData.resOilProd)))) {
          if (stryMutAct_9fa48("1957")) {
            {}
          } else {
            stryCov_9fa48("1957");
            return stryMutAct_9fa48("1958") ? {} : (stryCov_9fa48("1958"), {
              chartData: stryMutAct_9fa48("1959") ? ["Stryker was here"] : (stryCov_9fa48("1959"), [])
            });
          }
        }
        if (stryMutAct_9fa48("1962") ? selectedWell === "all" : stryMutAct_9fa48("1961") ? false : stryMutAct_9fa48("1960") ? true : (stryCov_9fa48("1960", "1961", "1962"), selectedWell !== (stryMutAct_9fa48("1963") ? "" : (stryCov_9fa48("1963"), "all")))) {
          if (stryMutAct_9fa48("1964")) {
            {}
          } else {
            stryCov_9fa48("1964");
            const wellAnalysis = analysisData.resOilProd.find(stryMutAct_9fa48("1965") ? () => undefined : (stryCov_9fa48("1965"), item => stryMutAct_9fa48("1968") ? String(item.wi) !== String(selectedWell) : stryMutAct_9fa48("1967") ? false : stryMutAct_9fa48("1966") ? true : (stryCov_9fa48("1966", "1967", "1968"), String(item.wi) === String(selectedWell))));
            if (stryMutAct_9fa48("1971") ? false : stryMutAct_9fa48("1970") ? true : stryMutAct_9fa48("1969") ? wellAnalysis : (stryCov_9fa48("1969", "1970", "1971"), !wellAnalysis)) return stryMutAct_9fa48("1972") ? {} : (stryCov_9fa48("1972"), {
              chartData: stryMutAct_9fa48("1973") ? ["Stryker was here"] : (stryCov_9fa48("1973"), [])
            });
            const wellDetailData = stryMutAct_9fa48("1974") ? analysisData.data.find(item => String(item.Well) === String(selectedWell)) : (stryCov_9fa48("1974"), analysisData.data?.find(stryMutAct_9fa48("1975") ? () => undefined : (stryCov_9fa48("1975"), item => stryMutAct_9fa48("1978") ? String(item.Well) !== String(selectedWell) : stryMutAct_9fa48("1977") ? false : stryMutAct_9fa48("1976") ? true : (stryCov_9fa48("1976", "1977", "1978"), String(item.Well) === String(selectedWell)))));
            if (stryMutAct_9fa48("1981") ? false : stryMutAct_9fa48("1980") ? true : stryMutAct_9fa48("1979") ? wellDetailData : (stryCov_9fa48("1979", "1980", "1981"), !wellDetailData)) return stryMutAct_9fa48("1982") ? {} : (stryCov_9fa48("1982"), {
              chartData: stryMutAct_9fa48("1983") ? ["Stryker was here"] : (stryCov_9fa48("1983"), [])
            });
            const initialOil = wellDetailData.OilProd0;
            const finalOil = wellDetailData.OilProd1;
            const waterfallData = stryMutAct_9fa48("1984") ? ["Stryker was here"] : (stryCov_9fa48("1984"), []);
            let runningTotal = initialOil;
            waterfallData.push(stryMutAct_9fa48("1985") ? {} : (stryCov_9fa48("1985"), {
              name: stryMutAct_9fa48("1986") ? "" : (stryCov_9fa48("1986"), "Начальная добыча"),
              value: initialOil,
              cumulative: initialOil,
              base: 0,
              type: stryMutAct_9fa48("1987") ? "" : (stryCov_9fa48("1987"), "initial"),
              displayValue: initialOil,
              isTotal: stryMutAct_9fa48("1988") ? false : (stryCov_9fa48("1988"), true)
            }));
            const workTimeContribution = wellAnalysis.by_t;
            waterfallData.push(stryMutAct_9fa48("1989") ? {} : (stryCov_9fa48("1989"), {
              name: stryMutAct_9fa48("1990") ? "" : (stryCov_9fa48("1990"), "Время работы"),
              fullName: stryMutAct_9fa48("1991") ? "" : (stryCov_9fa48("1991"), "Влияние времени работы"),
              value: Math.abs(workTimeContribution),
              cumulative: stryMutAct_9fa48("1992") ? runningTotal - workTimeContribution : (stryCov_9fa48("1992"), runningTotal + workTimeContribution),
              base: (stryMutAct_9fa48("1996") ? workTimeContribution < 0 : stryMutAct_9fa48("1995") ? workTimeContribution > 0 : stryMutAct_9fa48("1994") ? false : stryMutAct_9fa48("1993") ? true : (stryCov_9fa48("1993", "1994", "1995", "1996"), workTimeContribution >= 0)) ? runningTotal : stryMutAct_9fa48("1997") ? runningTotal - workTimeContribution : (stryCov_9fa48("1997"), runningTotal + workTimeContribution),
              type: stryMutAct_9fa48("1998") ? "" : (stryCov_9fa48("1998"), "change"),
              displayValue: workTimeContribution,
              isTotal: stryMutAct_9fa48("1999") ? true : (stryCov_9fa48("1999"), false)
            }));
            stryMutAct_9fa48("2000") ? runningTotal -= workTimeContribution : (stryCov_9fa48("2000"), runningTotal += workTimeContribution);
            const waterCutContribution = wellAnalysis[stryMutAct_9fa48("2001") ? "" : (stryCov_9fa48("2001"), "by_N%")];
            waterfallData.push(stryMutAct_9fa48("2002") ? {} : (stryCov_9fa48("2002"), {
              name: stryMutAct_9fa48("2003") ? "" : (stryCov_9fa48("2003"), "Обводненность"),
              fullName: stryMutAct_9fa48("2004") ? "" : (stryCov_9fa48("2004"), "Влияние обводненности"),
              value: Math.abs(waterCutContribution),
              cumulative: stryMutAct_9fa48("2005") ? runningTotal - waterCutContribution : (stryCov_9fa48("2005"), runningTotal + waterCutContribution),
              base: (stryMutAct_9fa48("2009") ? waterCutContribution < 0 : stryMutAct_9fa48("2008") ? waterCutContribution > 0 : stryMutAct_9fa48("2007") ? false : stryMutAct_9fa48("2006") ? true : (stryCov_9fa48("2006", "2007", "2008", "2009"), waterCutContribution >= 0)) ? runningTotal : stryMutAct_9fa48("2010") ? runningTotal - waterCutContribution : (stryCov_9fa48("2010"), runningTotal + waterCutContribution),
              type: stryMutAct_9fa48("2011") ? "" : (stryCov_9fa48("2011"), "change"),
              displayValue: waterCutContribution,
              isTotal: stryMutAct_9fa48("2012") ? true : (stryCov_9fa48("2012"), false)
            }));
            stryMutAct_9fa48("2013") ? runningTotal -= waterCutContribution : (stryCov_9fa48("2013"), runningTotal += waterCutContribution);
            const fluidContribution = wellAnalysis.by_LiqRate;
            waterfallData.push(stryMutAct_9fa48("2014") ? {} : (stryCov_9fa48("2014"), {
              name: stryMutAct_9fa48("2015") ? "" : (stryCov_9fa48("2015"), "Дебит жидкости"),
              fullName: stryMutAct_9fa48("2016") ? "" : (stryCov_9fa48("2016"), "Влияние дебита жидкости"),
              value: Math.abs(fluidContribution),
              cumulative: stryMutAct_9fa48("2017") ? runningTotal - fluidContribution : (stryCov_9fa48("2017"), runningTotal + fluidContribution),
              base: (stryMutAct_9fa48("2021") ? fluidContribution < 0 : stryMutAct_9fa48("2020") ? fluidContribution > 0 : stryMutAct_9fa48("2019") ? false : stryMutAct_9fa48("2018") ? true : (stryCov_9fa48("2018", "2019", "2020", "2021"), fluidContribution >= 0)) ? runningTotal : stryMutAct_9fa48("2022") ? runningTotal - fluidContribution : (stryCov_9fa48("2022"), runningTotal + fluidContribution),
              type: stryMutAct_9fa48("2023") ? "" : (stryCov_9fa48("2023"), "change"),
              displayValue: fluidContribution,
              isTotal: stryMutAct_9fa48("2024") ? true : (stryCov_9fa48("2024"), false)
            }));
            stryMutAct_9fa48("2025") ? runningTotal -= fluidContribution : (stryCov_9fa48("2025"), runningTotal += fluidContribution);
            waterfallData.push(stryMutAct_9fa48("2026") ? {} : (stryCov_9fa48("2026"), {
              name: stryMutAct_9fa48("2027") ? "" : (stryCov_9fa48("2027"), "Конечная добыча"),
              value: finalOil,
              cumulative: finalOil,
              base: 0,
              type: stryMutAct_9fa48("2028") ? "" : (stryCov_9fa48("2028"), "final"),
              displayValue: finalOil,
              isTotal: stryMutAct_9fa48("2029") ? false : (stryCov_9fa48("2029"), true)
            }));
            return stryMutAct_9fa48("2030") ? {} : (stryCov_9fa48("2030"), {
              chartData: waterfallData
            });
          }
        }
        const totalImpacts = analysisData.resOilProd.reduce(stryMutAct_9fa48("2031") ? () => undefined : (stryCov_9fa48("2031"), (acc, item) => stryMutAct_9fa48("2032") ? {} : (stryCov_9fa48("2032"), {
          by_t: stryMutAct_9fa48("2033") ? acc.by_t - item.by_t : (stryCov_9fa48("2033"), acc.by_t + item.by_t),
          by_N: stryMutAct_9fa48("2034") ? acc.by_N - item["by_N%"] : (stryCov_9fa48("2034"), acc.by_N + item[stryMutAct_9fa48("2035") ? "" : (stryCov_9fa48("2035"), "by_N%")]),
          by_LiqRate: stryMutAct_9fa48("2036") ? acc.by_LiqRate - item.by_LiqRate : (stryCov_9fa48("2036"), acc.by_LiqRate + item.by_LiqRate),
          deltaOilProd: stryMutAct_9fa48("2037") ? acc.deltaOilProd - item.deltaOilProd : (stryCov_9fa48("2037"), acc.deltaOilProd + item.deltaOilProd)
        })), stryMutAct_9fa48("2038") ? {} : (stryCov_9fa48("2038"), {
          by_t: 0,
          by_N: 0,
          by_LiqRate: 0,
          deltaOilProd: 0
        }));
        const totalInitial = analysisData.data.reduce(stryMutAct_9fa48("2039") ? () => undefined : (stryCov_9fa48("2039"), (sum, item) => stryMutAct_9fa48("2040") ? sum - item.OilProd0 : (stryCov_9fa48("2040"), sum + item.OilProd0)), 0);
        const totalFinal = analysisData.data.reduce(stryMutAct_9fa48("2041") ? () => undefined : (stryCov_9fa48("2041"), (sum, item) => stryMutAct_9fa48("2042") ? sum - item.OilProd1 : (stryCov_9fa48("2042"), sum + item.OilProd1)), 0);
        const waterfallData = stryMutAct_9fa48("2043") ? ["Stryker was here"] : (stryCov_9fa48("2043"), []);
        let runningTotal = totalInitial;
        waterfallData.push(stryMutAct_9fa48("2044") ? {} : (stryCov_9fa48("2044"), {
          name: stryMutAct_9fa48("2045") ? "" : (stryCov_9fa48("2045"), "Начальная добыча"),
          value: totalInitial,
          cumulative: totalInitial,
          base: 0,
          type: stryMutAct_9fa48("2046") ? "" : (stryCov_9fa48("2046"), "initial"),
          displayValue: totalInitial,
          isTotal: stryMutAct_9fa48("2047") ? false : (stryCov_9fa48("2047"), true)
        }));
        const workTimeContribution = totalImpacts.by_t;
        waterfallData.push(stryMutAct_9fa48("2048") ? {} : (stryCov_9fa48("2048"), {
          name: stryMutAct_9fa48("2049") ? "" : (stryCov_9fa48("2049"), "Время работы"),
          fullName: stryMutAct_9fa48("2050") ? "" : (stryCov_9fa48("2050"), "Влияние времени работы"),
          value: Math.abs(workTimeContribution),
          cumulative: stryMutAct_9fa48("2051") ? runningTotal - workTimeContribution : (stryCov_9fa48("2051"), runningTotal + workTimeContribution),
          base: (stryMutAct_9fa48("2055") ? workTimeContribution < 0 : stryMutAct_9fa48("2054") ? workTimeContribution > 0 : stryMutAct_9fa48("2053") ? false : stryMutAct_9fa48("2052") ? true : (stryCov_9fa48("2052", "2053", "2054", "2055"), workTimeContribution >= 0)) ? runningTotal : stryMutAct_9fa48("2056") ? runningTotal - workTimeContribution : (stryCov_9fa48("2056"), runningTotal + workTimeContribution),
          type: stryMutAct_9fa48("2057") ? "" : (stryCov_9fa48("2057"), "change"),
          displayValue: workTimeContribution,
          isTotal: stryMutAct_9fa48("2058") ? true : (stryCov_9fa48("2058"), false)
        }));
        stryMutAct_9fa48("2059") ? runningTotal -= workTimeContribution : (stryCov_9fa48("2059"), runningTotal += workTimeContribution);
        const waterCutContribution = totalImpacts.by_N;
        waterfallData.push(stryMutAct_9fa48("2060") ? {} : (stryCov_9fa48("2060"), {
          name: stryMutAct_9fa48("2061") ? "" : (stryCov_9fa48("2061"), "Обводненность"),
          fullName: stryMutAct_9fa48("2062") ? "" : (stryCov_9fa48("2062"), "Влияние обводненности"),
          value: Math.abs(waterCutContribution),
          cumulative: stryMutAct_9fa48("2063") ? runningTotal - waterCutContribution : (stryCov_9fa48("2063"), runningTotal + waterCutContribution),
          base: (stryMutAct_9fa48("2067") ? waterCutContribution < 0 : stryMutAct_9fa48("2066") ? waterCutContribution > 0 : stryMutAct_9fa48("2065") ? false : stryMutAct_9fa48("2064") ? true : (stryCov_9fa48("2064", "2065", "2066", "2067"), waterCutContribution >= 0)) ? runningTotal : stryMutAct_9fa48("2068") ? runningTotal - waterCutContribution : (stryCov_9fa48("2068"), runningTotal + waterCutContribution),
          type: stryMutAct_9fa48("2069") ? "" : (stryCov_9fa48("2069"), "change"),
          displayValue: waterCutContribution,
          isTotal: stryMutAct_9fa48("2070") ? true : (stryCov_9fa48("2070"), false)
        }));
        stryMutAct_9fa48("2071") ? runningTotal -= waterCutContribution : (stryCov_9fa48("2071"), runningTotal += waterCutContribution);
        const fluidContribution = totalImpacts.by_LiqRate;
        waterfallData.push(stryMutAct_9fa48("2072") ? {} : (stryCov_9fa48("2072"), {
          name: stryMutAct_9fa48("2073") ? "" : (stryCov_9fa48("2073"), "Дебит жидкости"),
          fullName: stryMutAct_9fa48("2074") ? "" : (stryCov_9fa48("2074"), "Влияние дебита жидкости"),
          value: Math.abs(fluidContribution),
          cumulative: stryMutAct_9fa48("2075") ? runningTotal - fluidContribution : (stryCov_9fa48("2075"), runningTotal + fluidContribution),
          base: (stryMutAct_9fa48("2079") ? fluidContribution < 0 : stryMutAct_9fa48("2078") ? fluidContribution > 0 : stryMutAct_9fa48("2077") ? false : stryMutAct_9fa48("2076") ? true : (stryCov_9fa48("2076", "2077", "2078", "2079"), fluidContribution >= 0)) ? runningTotal : stryMutAct_9fa48("2080") ? runningTotal - fluidContribution : (stryCov_9fa48("2080"), runningTotal + fluidContribution),
          type: stryMutAct_9fa48("2081") ? "" : (stryCov_9fa48("2081"), "change"),
          displayValue: fluidContribution,
          isTotal: stryMutAct_9fa48("2082") ? true : (stryCov_9fa48("2082"), false)
        }));
        stryMutAct_9fa48("2083") ? runningTotal -= fluidContribution : (stryCov_9fa48("2083"), runningTotal += fluidContribution);
        waterfallData.push(stryMutAct_9fa48("2084") ? {} : (stryCov_9fa48("2084"), {
          name: stryMutAct_9fa48("2085") ? "" : (stryCov_9fa48("2085"), "Конечная добыча"),
          value: totalFinal,
          cumulative: totalFinal,
          base: 0,
          type: stryMutAct_9fa48("2086") ? "" : (stryCov_9fa48("2086"), "final"),
          displayValue: totalFinal,
          isTotal: stryMutAct_9fa48("2087") ? false : (stryCov_9fa48("2087"), true)
        }));
        return stryMutAct_9fa48("2088") ? {} : (stryCov_9fa48("2088"), {
          chartData: waterfallData
        });
      }
    }, stryMutAct_9fa48("2089") ? [] : (stryCov_9fa48("2089"), [analysisData, selectedWell]));
    const processedWellsData = useMemo(() => {
      if (stryMutAct_9fa48("2090")) {
        {}
      } else {
        stryCov_9fa48("2090");
        if (stryMutAct_9fa48("2093") ? !analysisData && !analysisData.resOilProd : stryMutAct_9fa48("2092") ? false : stryMutAct_9fa48("2091") ? true : (stryCov_9fa48("2091", "2092", "2093"), (stryMutAct_9fa48("2094") ? analysisData : (stryCov_9fa48("2094"), !analysisData)) || (stryMutAct_9fa48("2095") ? analysisData.resOilProd : (stryCov_9fa48("2095"), !analysisData.resOilProd)))) {
          if (stryMutAct_9fa48("2096")) {
            {}
          } else {
            stryCov_9fa48("2096");
            return {};
          }
        }
        const wellsDataMap = {};
        analysisData.resOilProd.forEach(item => {
          if (stryMutAct_9fa48("2097")) {
            {}
          } else {
            stryCov_9fa48("2097");
            wellsDataMap[item.wi] = stryMutAct_9fa48("2098") ? {} : (stryCov_9fa48("2098"), {
              workTimeChange: Math.abs(item.by_t),
              waterCutChange: Math.abs(item[stryMutAct_9fa48("2099") ? "" : (stryCov_9fa48("2099"), "by_N%")]),
              fluidChange: Math.abs(item.by_LiqRate),
              totalChange: Math.abs(item.deltaOilProd)
            });
          }
        });
        return wellsDataMap;
      }
    }, stryMutAct_9fa48("2100") ? [] : (stryCov_9fa48("2100"), [analysisData]));
    const filteredWells = useMemo(() => {
      if (stryMutAct_9fa48("2101")) {
        {}
      } else {
        stryCov_9fa48("2101");
        if (stryMutAct_9fa48("2104") ? false : stryMutAct_9fa48("2103") ? true : stryMutAct_9fa48("2102") ? searchTerm : (stryCov_9fa48("2102", "2103", "2104"), !searchTerm)) return availableWells;
        return stryMutAct_9fa48("2105") ? availableWells : (stryCov_9fa48("2105"), availableWells.filter(stryMutAct_9fa48("2106") ? () => undefined : (stryCov_9fa48("2106"), well => stryMutAct_9fa48("2107") ? well.toUpperCase().includes(searchTerm.toLowerCase()) : (stryCov_9fa48("2107"), well.toLowerCase().includes(stryMutAct_9fa48("2108") ? searchTerm.toUpperCase() : (stryCov_9fa48("2108"), searchTerm.toLowerCase()))))));
      }
    }, stryMutAct_9fa48("2109") ? [] : (stryCov_9fa48("2109"), [availableWells, searchTerm]));
    useEffect(() => {
      if (stryMutAct_9fa48("2110")) {
        {}
      } else {
        stryCov_9fa48("2110");
        const handleClickOutside = event => {
          if (stryMutAct_9fa48("2111")) {
            {}
          } else {
            stryCov_9fa48("2111");
            if (stryMutAct_9fa48("2114") ? dropdownRef.current || !dropdownRef.current.contains(event.target) : stryMutAct_9fa48("2113") ? false : stryMutAct_9fa48("2112") ? true : (stryCov_9fa48("2112", "2113", "2114"), dropdownRef.current && (stryMutAct_9fa48("2115") ? dropdownRef.current.contains(event.target) : (stryCov_9fa48("2115"), !dropdownRef.current.contains(event.target))))) {
              if (stryMutAct_9fa48("2116")) {
                {}
              } else {
                stryCov_9fa48("2116");
                setIsDropdownOpen(stryMutAct_9fa48("2117") ? true : (stryCov_9fa48("2117"), false));
              }
            }
            if (stryMutAct_9fa48("2120") ? initialPickerRef.current || !initialPickerRef.current.contains(event.target) : stryMutAct_9fa48("2119") ? false : stryMutAct_9fa48("2118") ? true : (stryCov_9fa48("2118", "2119", "2120"), initialPickerRef.current && (stryMutAct_9fa48("2121") ? initialPickerRef.current.contains(event.target) : (stryCov_9fa48("2121"), !initialPickerRef.current.contains(event.target))))) {
              if (stryMutAct_9fa48("2122")) {
                {}
              } else {
                stryCov_9fa48("2122");
                setShowInitialPicker(stryMutAct_9fa48("2123") ? true : (stryCov_9fa48("2123"), false));
              }
            }
            if (stryMutAct_9fa48("2126") ? finalPickerRef.current || !finalPickerRef.current.contains(event.target) : stryMutAct_9fa48("2125") ? false : stryMutAct_9fa48("2124") ? true : (stryCov_9fa48("2124", "2125", "2126"), finalPickerRef.current && (stryMutAct_9fa48("2127") ? finalPickerRef.current.contains(event.target) : (stryCov_9fa48("2127"), !finalPickerRef.current.contains(event.target))))) {
              if (stryMutAct_9fa48("2128")) {
                {}
              } else {
                stryCov_9fa48("2128");
                setShowFinalPicker(stryMutAct_9fa48("2129") ? true : (stryCov_9fa48("2129"), false));
              }
            }
          }
        };
        document.addEventListener(stryMutAct_9fa48("2130") ? "" : (stryCov_9fa48("2130"), "mousedown"), handleClickOutside);
        return () => {
          if (stryMutAct_9fa48("2131")) {
            {}
          } else {
            stryCov_9fa48("2131");
            document.removeEventListener(stryMutAct_9fa48("2132") ? "" : (stryCov_9fa48("2132"), "mousedown"), handleClickOutside);
          }
        };
      }
    }, stryMutAct_9fa48("2133") ? ["Stryker was here"] : (stryCov_9fa48("2133"), []));
    const handleWellSelect = well => {
      if (stryMutAct_9fa48("2134")) {
        {}
      } else {
        stryCov_9fa48("2134");
        setSelectedWell(well);
        setSearchTerm(stryMutAct_9fa48("2135") ? "Stryker was here!" : (stryCov_9fa48("2135"), ""));
        setIsDropdownOpen(stryMutAct_9fa48("2136") ? true : (stryCov_9fa48("2136"), false));
      }
    };
    const getDisplayText = () => {
      if (stryMutAct_9fa48("2137")) {
        {}
      } else {
        stryCov_9fa48("2137");
        if (stryMutAct_9fa48("2140") ? selectedWell !== "all" : stryMutAct_9fa48("2139") ? false : stryMutAct_9fa48("2138") ? true : (stryCov_9fa48("2138", "2139", "2140"), selectedWell === (stryMutAct_9fa48("2141") ? "" : (stryCov_9fa48("2141"), "all")))) return stryMutAct_9fa48("2142") ? "" : (stryCov_9fa48("2142"), "Все");
        return selectedWell;
      }
    };
    const handleClearAllFilters = () => {
      if (stryMutAct_9fa48("2143")) {
        {}
      } else {
        stryCov_9fa48("2143");
        setSelectedWell(stryMutAct_9fa48("2144") ? "" : (stryCov_9fa48("2144"), "all"));
        setStatusFilter(stryMutAct_9fa48("2145") ? "" : (stryCov_9fa48("2145"), "All"));
        setSearchTerm(stryMutAct_9fa48("2146") ? "Stryker was here!" : (stryCov_9fa48("2146"), ""));
        setIsDropdownOpen(stryMutAct_9fa48("2147") ? true : (stryCov_9fa48("2147"), false));
        setInitialRange(stryMutAct_9fa48("2148") ? [] : (stryCov_9fa48("2148"), [stryMutAct_9fa48("2149") ? {} : (stryCov_9fa48("2149"), {
          startDate: new Date(stryMutAct_9fa48("2150") ? "" : (stryCov_9fa48("2150"), '2025-06-01')),
          endDate: new Date(stryMutAct_9fa48("2151") ? "" : (stryCov_9fa48("2151"), '2025-06-14')),
          key: stryMutAct_9fa48("2152") ? "" : (stryCov_9fa48("2152"), 'initialSelection')
        })]));
        setFinalRange(stryMutAct_9fa48("2153") ? [] : (stryCov_9fa48("2153"), [stryMutAct_9fa48("2154") ? {} : (stryCov_9fa48("2154"), {
          startDate: new Date(stryMutAct_9fa48("2155") ? "" : (stryCov_9fa48("2155"), '2025-07-01')),
          endDate: new Date(stryMutAct_9fa48("2156") ? "" : (stryCov_9fa48("2156"), '2025-07-14')),
          key: stryMutAct_9fa48("2157") ? "" : (stryCov_9fa48("2157"), 'finalSelection')
        })]));
      }
    };
    const formatDateRange = range => {
      if (stryMutAct_9fa48("2158")) {
        {}
      } else {
        stryCov_9fa48("2158");
        const start = formatDateForAPI(range[0].startDate);
        const end = formatDateForAPI(range[0].endDate);
        return stryMutAct_9fa48("2159") ? `` : (stryCov_9fa48("2159"), `${start} - ${end}`);
      }
    };
    return <div className={styles.layoutContainer}>
      <AppNav />
      
      {stryMutAct_9fa48("2162") ? error || <div className={styles.errorAlert}>
          {error}
        </div> : stryMutAct_9fa48("2161") ? false : stryMutAct_9fa48("2160") ? true : (stryCov_9fa48("2160", "2161", "2162"), error && <div className={styles.errorAlert}>
          {error}
        </div>)}
      
      <div className={styles.centralFiltersSection}>
        <div className={styles.filtersContainer}>
          <div className={styles.filterGroup} ref={dropdownRef}>
            <label className={styles.filterLabel}>
              Выбрать скважину:
            </label>
            <div className={styles.dropdownContainer}>
              <input type="text" value={isDropdownOpen ? searchTerm : getDisplayText()} onChange={e => {
                if (stryMutAct_9fa48("2163")) {
                  {}
                } else {
                  stryCov_9fa48("2163");
                  setSearchTerm(e.target.value);
                  if (stryMutAct_9fa48("2166") ? false : stryMutAct_9fa48("2165") ? true : stryMutAct_9fa48("2164") ? isDropdownOpen : (stryCov_9fa48("2164", "2165", "2166"), !isDropdownOpen)) setIsDropdownOpen(stryMutAct_9fa48("2167") ? false : (stryCov_9fa48("2167"), true));
                }
              }} onFocus={() => {
                if (stryMutAct_9fa48("2168")) {
                  {}
                } else {
                  stryCov_9fa48("2168");
                  setIsDropdownOpen(stryMutAct_9fa48("2169") ? false : (stryCov_9fa48("2169"), true));
                  setSearchTerm(stryMutAct_9fa48("2170") ? "Stryker was here!" : (stryCov_9fa48("2170"), ""));
                }
              }} placeholder="Поиск скважины..." className={styles.inputField} />
              <span className={styles.dropdownArrow} onClick={stryMutAct_9fa48("2171") ? () => undefined : (stryCov_9fa48("2171"), () => setIsDropdownOpen(stryMutAct_9fa48("2172") ? isDropdownOpen : (stryCov_9fa48("2172"), !isDropdownOpen)))}>
                {isDropdownOpen ? stryMutAct_9fa48("2173") ? "" : (stryCov_9fa48("2173"), "▲") : stryMutAct_9fa48("2174") ? "" : (stryCov_9fa48("2174"), "▼")}
              </span>
            </div>
            
            {stryMutAct_9fa48("2177") ? isDropdownOpen || <div className={styles.dropdownMenu}>
                <div className={`${styles.dropdownItem} ${selectedWell === "all" ? styles.selected : ""}`} onClick={() => handleWellSelect("all")}>
                  Все
                </div>
                {filteredWells.map(well => <div key={well} className={`${styles.dropdownItem} ${selectedWell === well ? styles.selected : ""}`} onClick={() => handleWellSelect(well)}>
                    {well}
                  </div>)}
                {filteredWells.length === 0 && searchTerm && <div className={styles.dropdownNoResults}>
                    Не найдено
                  </div>}
              </div> : stryMutAct_9fa48("2176") ? false : stryMutAct_9fa48("2175") ? true : (stryCov_9fa48("2175", "2176", "2177"), isDropdownOpen && <div className={styles.dropdownMenu}>
                <div className={stryMutAct_9fa48("2178") ? `` : (stryCov_9fa48("2178"), `${styles.dropdownItem} ${(stryMutAct_9fa48("2181") ? selectedWell !== "all" : stryMutAct_9fa48("2180") ? false : stryMutAct_9fa48("2179") ? true : (stryCov_9fa48("2179", "2180", "2181"), selectedWell === (stryMutAct_9fa48("2182") ? "" : (stryCov_9fa48("2182"), "all")))) ? styles.selected : stryMutAct_9fa48("2183") ? "Stryker was here!" : (stryCov_9fa48("2183"), "")}`)} onClick={stryMutAct_9fa48("2184") ? () => undefined : (stryCov_9fa48("2184"), () => handleWellSelect(stryMutAct_9fa48("2185") ? "" : (stryCov_9fa48("2185"), "all")))}>
                  Все
                </div>
                {filteredWells.map(stryMutAct_9fa48("2186") ? () => undefined : (stryCov_9fa48("2186"), well => <div key={well} className={stryMutAct_9fa48("2187") ? `` : (stryCov_9fa48("2187"), `${styles.dropdownItem} ${(stryMutAct_9fa48("2190") ? selectedWell !== well : stryMutAct_9fa48("2189") ? false : stryMutAct_9fa48("2188") ? true : (stryCov_9fa48("2188", "2189", "2190"), selectedWell === well)) ? styles.selected : stryMutAct_9fa48("2191") ? "Stryker was here!" : (stryCov_9fa48("2191"), "")}`)} onClick={stryMutAct_9fa48("2192") ? () => undefined : (stryCov_9fa48("2192"), () => handleWellSelect(well))}>
                    {well}
                  </div>))}
                {stryMutAct_9fa48("2195") ? filteredWells.length === 0 && searchTerm || <div className={styles.dropdownNoResults}>
                    Не найдено
                  </div> : stryMutAct_9fa48("2194") ? false : stryMutAct_9fa48("2193") ? true : (stryCov_9fa48("2193", "2194", "2195"), (stryMutAct_9fa48("2197") ? filteredWells.length === 0 || searchTerm : stryMutAct_9fa48("2196") ? true : (stryCov_9fa48("2196", "2197"), (stryMutAct_9fa48("2199") ? filteredWells.length !== 0 : stryMutAct_9fa48("2198") ? true : (stryCov_9fa48("2198", "2199"), filteredWells.length === 0)) && searchTerm)) && <div className={styles.dropdownNoResults}>
                    Не найдено
                  </div>)}
              </div>)}
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>
              Статус контроллера:
            </label>
            <select value={statusFilter} onChange={stryMutAct_9fa48("2200") ? () => undefined : (stryCov_9fa48("2200"), e => setStatusFilter(e.target.value))} className={styles.inputField}>
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
            <div style={stryMutAct_9fa48("2201") ? {} : (stryCov_9fa48("2201"), {
              position: stryMutAct_9fa48("2202") ? "" : (stryCov_9fa48("2202"), "relative")
            })}>
              <input type="text" value={formatDateRange(initialRange)} onClick={stryMutAct_9fa48("2203") ? () => undefined : (stryCov_9fa48("2203"), () => setShowInitialPicker(stryMutAct_9fa48("2204") ? showInitialPicker : (stryCov_9fa48("2204"), !showInitialPicker)))} readOnly className={styles.inputField} style={stryMutAct_9fa48("2205") ? {} : (stryCov_9fa48("2205"), {
                cursor: stryMutAct_9fa48("2206") ? "" : (stryCov_9fa48("2206"), "pointer")
              })} />
              {stryMutAct_9fa48("2209") ? showInitialPicker || <div style={{
                position: "absolute",
                top: "100%",
                left: 0,
                zIndex: 2000,
                backgroundColor: "white",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",
                overflow: "hidden"
              }}>
                  <DateRange ranges={initialRange} onChange={item => setInitialRange([item.initialSelection])} dayContentRenderer={dayContentRenderer} maxDate={new Date()} />
                </div> : stryMutAct_9fa48("2208") ? false : stryMutAct_9fa48("2207") ? true : (stryCov_9fa48("2207", "2208", "2209"), showInitialPicker && <div style={stryMutAct_9fa48("2210") ? {} : (stryCov_9fa48("2210"), {
                position: stryMutAct_9fa48("2211") ? "" : (stryCov_9fa48("2211"), "absolute"),
                top: stryMutAct_9fa48("2212") ? "" : (stryCov_9fa48("2212"), "100%"),
                left: 0,
                zIndex: 2000,
                backgroundColor: stryMutAct_9fa48("2213") ? "" : (stryCov_9fa48("2213"), "white"),
                boxShadow: stryMutAct_9fa48("2214") ? "" : (stryCov_9fa48("2214"), "0 4px 6px rgba(0, 0, 0, 0.1)"),
                borderRadius: stryMutAct_9fa48("2215") ? "" : (stryCov_9fa48("2215"), "8px"),
                overflow: stryMutAct_9fa48("2216") ? "" : (stryCov_9fa48("2216"), "hidden")
              })}>
                  <DateRange ranges={initialRange} onChange={stryMutAct_9fa48("2217") ? () => undefined : (stryCov_9fa48("2217"), item => setInitialRange(stryMutAct_9fa48("2218") ? [] : (stryCov_9fa48("2218"), [item.initialSelection])))} dayContentRenderer={dayContentRenderer} maxDate={new Date()} />
                </div>)}
            </div>
          </div>

          <div className={styles.filterGroup} ref={finalPickerRef}>
            <label className={styles.filterLabel}>
              Конечный период:
            </label>
            <div style={stryMutAct_9fa48("2219") ? {} : (stryCov_9fa48("2219"), {
              position: stryMutAct_9fa48("2220") ? "" : (stryCov_9fa48("2220"), "relative")
            })}>
              <input type="text" value={formatDateRange(finalRange)} onClick={stryMutAct_9fa48("2221") ? () => undefined : (stryCov_9fa48("2221"), () => setShowFinalPicker(stryMutAct_9fa48("2222") ? showFinalPicker : (stryCov_9fa48("2222"), !showFinalPicker)))} readOnly className={styles.inputField} style={stryMutAct_9fa48("2223") ? {} : (stryCov_9fa48("2223"), {
                cursor: stryMutAct_9fa48("2224") ? "" : (stryCov_9fa48("2224"), "pointer")
              })} />
              {stryMutAct_9fa48("2227") ? showFinalPicker || <div style={{
                position: "absolute",
                top: "100%",
                left: 0,
                zIndex: 3000,
                backgroundColor: "white",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",
                overflow: "hidden"
              }}>
                  <DateRange ranges={finalRange} onChange={item => setFinalRange([item.finalSelection])} dayContentRenderer={dayContentRenderer} maxDate={new Date()} />
                </div> : stryMutAct_9fa48("2226") ? false : stryMutAct_9fa48("2225") ? true : (stryCov_9fa48("2225", "2226", "2227"), showFinalPicker && <div style={stryMutAct_9fa48("2228") ? {} : (stryCov_9fa48("2228"), {
                position: stryMutAct_9fa48("2229") ? "" : (stryCov_9fa48("2229"), "absolute"),
                top: stryMutAct_9fa48("2230") ? "" : (stryCov_9fa48("2230"), "100%"),
                left: 0,
                zIndex: 3000,
                backgroundColor: stryMutAct_9fa48("2231") ? "" : (stryCov_9fa48("2231"), "white"),
                boxShadow: stryMutAct_9fa48("2232") ? "" : (stryCov_9fa48("2232"), "0 4px 6px rgba(0, 0, 0, 0.1)"),
                borderRadius: stryMutAct_9fa48("2233") ? "" : (stryCov_9fa48("2233"), "8px"),
                overflow: stryMutAct_9fa48("2234") ? "" : (stryCov_9fa48("2234"), "hidden")
              })}>
                  <DateRange ranges={finalRange} onChange={stryMutAct_9fa48("2235") ? () => undefined : (stryCov_9fa48("2235"), item => setFinalRange(stryMutAct_9fa48("2236") ? [] : (stryCov_9fa48("2236"), [item.finalSelection])))} dayContentRenderer={dayContentRenderer} maxDate={new Date()} />
                </div>)}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <button onClick={handleClearAllFilters} className={styles.clearFiltersButton}>
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
            {(stryMutAct_9fa48("2239") ? loading && analysisLoading : stryMutAct_9fa48("2238") ? false : stryMutAct_9fa48("2237") ? true : (stryCov_9fa48("2237", "2238", "2239"), loading || analysisLoading)) ? <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <span>Загрузка данных...</span>
              </div> : <OilLossChart chartData={processedData.chartData} selectedWell={selectedWell} startDate={formatDateRange(initialRange)} endDate={formatDateRange(finalRange)} />}
          </div>
        </div>
        
        <div className={styles.mapSection}>          
          <div className={styles.mapContainer}>
            <OilMap selectedWell={selectedWell} statusFilter={statusFilter} onWellSelect={handleWellSelect} wellsOilData={processedWellsData} startDate={formatDateRange(initialRange)} endDate={formatDateRange(finalRange)} />
          </div>
        </div>
      </div>
    </div>;
  }
}