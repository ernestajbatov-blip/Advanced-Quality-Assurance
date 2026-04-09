// @ts-nocheck
// AppLayout.jsx
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
import React, { useState, useEffect, useContext, useMemo, useCallback, useRef } from "react";
import { fetchWells, fetchWellData, fetchAGZUWellData, fetchChrpArchiveReport, fetchAgzuArchiveReport } from "../../axios/wellService";
import styles from "./AppLayout.module.css";
import Chart from "../../components/Chart/Chart";
import Grid from "../../components/Grid/Grid";
import AppNav from "../../components/AppNav/AppNav";
import Legends from "../../components/Legends/Legends";
import Details from "../../components/Details/Details";
import SelectFond from "../../components/SelectFond/SelectFond";
import AGZU from "../../components/AGZU/AGZU";
import VRP from "../../components/VRP/VRP";
import KPI from "../../components/KPI/KPI";
import Modal from "../../components/Modal/Modal";
import ResponsiveTable from "../../components/ResponsiveTable/ResponsiveTable";
import { WellsContext } from "../../states/WellsContext";
import { useUser } from "../../states/UserContext";
import * as XLSX from "xlsx";
export default function AppLayout() {
  if (stryMutAct_9fa48("883")) {
    {}
  } else {
    stryCov_9fa48("883");
    const {
      fond,
      setFond,
      wells,
      setWells
    } = useContext(WellsContext);
    const formatDateInput = date => {
      if (stryMutAct_9fa48("884")) {
        {}
      } else {
        stryCov_9fa48("884");
        const year = date.getFullYear();
        const month = String(stryMutAct_9fa48("885") ? date.getMonth() - 1 : (stryCov_9fa48("885"), date.getMonth() + 1)).padStart(2, stryMutAct_9fa48("886") ? "" : (stryCov_9fa48("886"), "0"));
        const day = String(date.getDate()).padStart(2, stryMutAct_9fa48("887") ? "" : (stryCov_9fa48("887"), "0"));
        return stryMutAct_9fa48("888") ? `` : (stryCov_9fa48("888"), `${year}-${month}-${day}`);
      }
    };
    const getLastWeekRange = () => {
      if (stryMutAct_9fa48("889")) {
        {}
      } else {
        stryCov_9fa48("889");
        const end = new Date();
        const start = new Date();
        stryMutAct_9fa48("890") ? start.setTime(end.getDate() - 7) : (stryCov_9fa48("890"), start.setDate(stryMutAct_9fa48("891") ? end.getDate() + 7 : (stryCov_9fa48("891"), end.getDate() - 7)));
        return stryMutAct_9fa48("892") ? {} : (stryCov_9fa48("892"), {
          start: formatDateInput(start),
          end: formatDateInput(end)
        });
      }
    };

    // Modal state management
    const [showWellModal, setShowWellModal] = useState(stryMutAct_9fa48("893") ? true : (stryCov_9fa48("893"), false));
    const [wellModalData, setWellModalData] = useState(stryMutAct_9fa48("894") ? ["Stryker was here"] : (stryCov_9fa48("894"), []));
    const [agzuModalData, setAgzuModalData] = useState(stryMutAct_9fa48("895") ? ["Stryker was here"] : (stryCov_9fa48("895"), []));
    const [wellModalTitle, setWellModalTitle] = useState(stryMutAct_9fa48("896") ? "" : (stryCov_9fa48("896"), "Well Data"));
    const [wellModalLoading, setWellModalLoading] = useState(stryMutAct_9fa48("897") ? true : (stryCov_9fa48("897"), false));
    const [agzuModalLoading, setAgzuModalLoading] = useState(stryMutAct_9fa48("898") ? true : (stryCov_9fa48("898"), false));
    const [chartType, setChartType] = useState(stryMutAct_9fa48("899") ? "" : (stryCov_9fa48("899"), "liquid"));
    const [showChrpReportModal, setShowChrpReportModal] = useState(stryMutAct_9fa48("900") ? true : (stryCov_9fa48("900"), false));
    const [chrpReportStartDate, setChrpReportStartDate] = useState(stryMutAct_9fa48("901") ? "Stryker was here!" : (stryCov_9fa48("901"), ""));
    const [chrpReportEndDate, setChrpReportEndDate] = useState(stryMutAct_9fa48("902") ? "Stryker was here!" : (stryCov_9fa48("902"), ""));
    const [chrpReportLoading, setChrpReportLoading] = useState(stryMutAct_9fa48("903") ? true : (stryCov_9fa48("903"), false));
    const [chrpReportError, setChrpReportError] = useState(null);
    const [chrpReportWell, setChrpReportWell] = useState(stryMutAct_9fa48("904") ? "Stryker was here!" : (stryCov_9fa48("904"), ""));
    const [showAgzuReportModal, setShowAgzuReportModal] = useState(stryMutAct_9fa48("905") ? true : (stryCov_9fa48("905"), false));
    const [agzuReportStartDate, setAgzuReportStartDate] = useState(stryMutAct_9fa48("906") ? "Stryker was here!" : (stryCov_9fa48("906"), ""));
    const [agzuReportEndDate, setAgzuReportEndDate] = useState(stryMutAct_9fa48("907") ? "Stryker was here!" : (stryCov_9fa48("907"), ""));
    const [agzuReportLoading, setAgzuReportLoading] = useState(stryMutAct_9fa48("908") ? true : (stryCov_9fa48("908"), false));
    const [agzuReportError, setAgzuReportError] = useState(null);
    const [agzuReportWell, setAgzuReportWell] = useState(stryMutAct_9fa48("909") ? "Stryker was here!" : (stryCov_9fa48("909"), ""));

    // Shared state for current otvod well - updated by AGZU component
    const [currentOtvodWell, setCurrentOtvodWell] = useState(null);
    const [currentOtvodData, setCurrentOtvodData] = useState(null);
    const [currentWellNumber, setCurrentWellNumber] = useState(null);

    // Use ref instead of state to avoid triggering useEffect
    const currentProvidedOtvodDataRef = useRef(null);

    // ЧРП filter state
    const [chrpFilter, setChrpFilter] = useState(stryMutAct_9fa48("910") ? true : (stryCov_9fa48("910"), false));
    const [statusFilter, setStatusFilter] = useState(null);
    const {
      user,
      onLogout
    } = useUser();
    useEffect(() => {
      if (stryMutAct_9fa48("911")) {
        {}
      } else {
        stryCov_9fa48("911");
        if (stryMutAct_9fa48("914") ? fond !== 1 : stryMutAct_9fa48("913") ? false : stryMutAct_9fa48("912") ? true : (stryCov_9fa48("912", "913", "914"), fond === 1)) {
          if (stryMutAct_9fa48("915")) {
            {}
          } else {
            stryCov_9fa48("915");
            setChrpFilter(stryMutAct_9fa48("916") ? true : (stryCov_9fa48("916"), false));
          }
        }
      }
    }, stryMutAct_9fa48("917") ? [] : (stryCov_9fa48("917"), [fond]));

    // Auto-refresh all wells data every 2 seconds
    useEffect(() => {
      if (stryMutAct_9fa48("918")) {
        {}
      } else {
        stryCov_9fa48("918");
        const fetchAllWellsData = async () => {
          if (stryMutAct_9fa48("919")) {
            {}
          } else {
            stryCov_9fa48("919");
            try {
              if (stryMutAct_9fa48("920")) {
                {}
              } else {
                stryCov_9fa48("920");
                const response = await fetchWells();
                setWells(response.data);
              }
            } catch (error) {
              if (stryMutAct_9fa48("921")) {
                {}
              } else {
                stryCov_9fa48("921");
                console.error(stryMutAct_9fa48("922") ? "" : (stryCov_9fa48("922"), "Error refreshing wells data:"), error);
              }
            }
          }
        };

        // Set up interval for auto-refresh
        const intervalId = setInterval(fetchAllWellsData, 2000);

        // Cleanup interval on unmount
        return stryMutAct_9fa48("923") ? () => undefined : (stryCov_9fa48("923"), () => clearInterval(intervalId));
      }
    }, stryMutAct_9fa48("924") ? [] : (stryCov_9fa48("924"), [setWells]));
    const fieldMappings = useMemo(stryMutAct_9fa48("925") ? () => undefined : (stryCov_9fa48("925"), () => stryMutAct_9fa48("926") ? {} : (stryCov_9fa48("926"), {
      leftTop: stryMutAct_9fa48("927") ? "" : (stryCov_9fa48("927"), "well"),
      rightTop: (stryMutAct_9fa48("930") ? fond !== 1 : stryMutAct_9fa48("929") ? false : stryMutAct_9fa48("928") ? true : (stryCov_9fa48("928", "929", "930"), fond === 1)) ? stryMutAct_9fa48("931") ? "" : (stryCov_9fa48("931"), "tr_fluid") : stryMutAct_9fa48("932") ? "" : (stryCov_9fa48("932"), "tr_oil"),
      middle: (stryMutAct_9fa48("935") ? fond !== 1 : stryMutAct_9fa48("934") ? false : stryMutAct_9fa48("933") ? true : (stryCov_9fa48("933", "934", "935"), fond === 1)) ? stryMutAct_9fa48("936") ? "" : (stryCov_9fa48("936"), "zamer") : (stryMutAct_9fa48("939") ? chartType !== "liquid" : stryMutAct_9fa48("938") ? false : stryMutAct_9fa48("937") ? true : (stryCov_9fa48("937", "938", "939"), chartType === (stryMutAct_9fa48("940") ? "" : (stryCov_9fa48("940"), "liquid")))) ? stryMutAct_9fa48("941") ? "" : (stryCov_9fa48("941"), "zamer") : stryMutAct_9fa48("942") ? "" : (stryCov_9fa48("942"), "zamer_oil"),
      leftBottom: stryMutAct_9fa48("943") ? "" : (stryCov_9fa48("943"), "tr_fluid"),
      rightBottom: stryMutAct_9fa48("944") ? "" : (stryCov_9fa48("944"), "tr_water")
    })), stryMutAct_9fa48("945") ? [] : (stryCov_9fa48("945"), [chartType, fond]));
    const calculateMiddleValue = (wells, values) => {
      if (stryMutAct_9fa48("946")) {
        {}
      } else {
        stryCov_9fa48("946");
        const baseValue = (stryMutAct_9fa48("949") ? fond !== 1 : stryMutAct_9fa48("948") ? false : stryMutAct_9fa48("947") ? true : (stryCov_9fa48("947", "948", "949"), fond === 1)) ? values.rightTop : (stryMutAct_9fa48("952") ? chartType !== "oil" : stryMutAct_9fa48("951") ? false : stryMutAct_9fa48("950") ? true : (stryCov_9fa48("950", "951", "952"), chartType === (stryMutAct_9fa48("953") ? "" : (stryCov_9fa48("953"), "oil")))) ? values.rightTop : values.leftBottom;
        return parseFloat((stryMutAct_9fa48("954") ? (values.middle - baseValue) / baseValue / 100 : (stryCov_9fa48("954"), (stryMutAct_9fa48("955") ? (values.middle - baseValue) * baseValue : (stryCov_9fa48("955"), (stryMutAct_9fa48("956") ? values.middle + baseValue : (stryCov_9fa48("956"), values.middle - baseValue)) / baseValue)) * 100)).toFixed(2));
      }
    };
    const isWellStopped = well => {
      if (stryMutAct_9fa48("957")) {
        {}
      } else {
        stryCov_9fa48("957");
        if (stryMutAct_9fa48("960") ? fond === 0 : stryMutAct_9fa48("959") ? false : stryMutAct_9fa48("958") ? true : (stryCov_9fa48("958", "959", "960"), fond !== 0)) {
          if (stryMutAct_9fa48("961")) {
            {}
          } else {
            stryCov_9fa48("961");
            return stryMutAct_9fa48("962") ? true : (stryCov_9fa48("962"), false);
          }
        }
        if (stryMutAct_9fa48("965") ? (well.c_current === null || well.c_current === undefined || well.c_current === '') && well.c_current === 'NULL' : stryMutAct_9fa48("964") ? false : stryMutAct_9fa48("963") ? true : (stryCov_9fa48("963", "964", "965"), (stryMutAct_9fa48("967") ? (well.c_current === null || well.c_current === undefined) && well.c_current === '' : stryMutAct_9fa48("966") ? false : (stryCov_9fa48("966", "967"), (stryMutAct_9fa48("969") ? well.c_current === null && well.c_current === undefined : stryMutAct_9fa48("968") ? false : (stryCov_9fa48("968", "969"), (stryMutAct_9fa48("971") ? well.c_current !== null : stryMutAct_9fa48("970") ? false : (stryCov_9fa48("970", "971"), well.c_current === null)) || (stryMutAct_9fa48("973") ? well.c_current !== undefined : stryMutAct_9fa48("972") ? false : (stryCov_9fa48("972", "973"), well.c_current === undefined)))) || (stryMutAct_9fa48("975") ? well.c_current !== '' : stryMutAct_9fa48("974") ? false : (stryCov_9fa48("974", "975"), well.c_current === (stryMutAct_9fa48("976") ? "Stryker was here!" : (stryCov_9fa48("976"), '')))))) || (stryMutAct_9fa48("978") ? well.c_current !== 'NULL' : stryMutAct_9fa48("977") ? false : (stryCov_9fa48("977", "978"), well.c_current === (stryMutAct_9fa48("979") ? "" : (stryCov_9fa48("979"), 'NULL')))))) {
          if (stryMutAct_9fa48("980")) {
            {}
          } else {
            stryCov_9fa48("980");
            return stryMutAct_9fa48("981") ? true : (stryCov_9fa48("981"), false);
          }
        }
        const current = parseFloat(well.c_current);
        if (stryMutAct_9fa48("984") ? !isNaN(current) || isFinite(current) : stryMutAct_9fa48("983") ? false : stryMutAct_9fa48("982") ? true : (stryCov_9fa48("982", "983", "984"), (stryMutAct_9fa48("985") ? isNaN(current) : (stryCov_9fa48("985"), !isNaN(current))) && isFinite(current))) {
          if (stryMutAct_9fa48("986")) {
            {}
          } else {
            stryCov_9fa48("986");
            return stryMutAct_9fa48("990") ? current >= 1 : stryMutAct_9fa48("989") ? current <= 1 : stryMutAct_9fa48("988") ? false : stryMutAct_9fa48("987") ? true : (stryCov_9fa48("987", "988", "989", "990"), current < 1);
          }
        }
        return stryMutAct_9fa48("991") ? true : (stryCov_9fa48("991"), false);
      }
    };
    const filteredWells = useMemo(() => {
      if (stryMutAct_9fa48("992")) {
        {}
      } else {
        stryCov_9fa48("992");
        let baseFilteredWells;
        if (stryMutAct_9fa48("995") ? fond !== 0 : stryMutAct_9fa48("994") ? false : stryMutAct_9fa48("993") ? true : (stryCov_9fa48("993", "994", "995"), fond === 0)) {
          if (stryMutAct_9fa48("996")) {
            {}
          } else {
            stryCov_9fa48("996");
            baseFilteredWells = stryMutAct_9fa48("997") ? wells : (stryCov_9fa48("997"), wells.filter(stryMutAct_9fa48("998") ? () => undefined : (stryCov_9fa48("998"), well => stryMutAct_9fa48("1001") ? well.nagn !== 0 : stryMutAct_9fa48("1000") ? false : stryMutAct_9fa48("999") ? true : (stryCov_9fa48("999", "1000", "1001"), well.nagn === 0))));
            if (stryMutAct_9fa48("1004") ? statusFilter !== "В простое" : stryMutAct_9fa48("1003") ? false : stryMutAct_9fa48("1002") ? true : (stryCov_9fa48("1002", "1003", "1004"), statusFilter === (stryMutAct_9fa48("1005") ? "" : (stryCov_9fa48("1005"), "В простое")))) {
              if (stryMutAct_9fa48("1006")) {
                {}
              } else {
                stryCov_9fa48("1006");
                baseFilteredWells = stryMutAct_9fa48("1007") ? baseFilteredWells : (stryCov_9fa48("1007"), baseFilteredWells.filter(stryMutAct_9fa48("1008") ? () => undefined : (stryCov_9fa48("1008"), well => stryMutAct_9fa48("1011") ? well.status !== "В простое" : stryMutAct_9fa48("1010") ? false : stryMutAct_9fa48("1009") ? true : (stryCov_9fa48("1009", "1010", "1011"), well.status === (stryMutAct_9fa48("1012") ? "" : (stryCov_9fa48("1012"), "В простое"))))));
              }
            } else if (stryMutAct_9fa48("1015") ? statusFilter !== "В бездействий" : stryMutAct_9fa48("1014") ? false : stryMutAct_9fa48("1013") ? true : (stryCov_9fa48("1013", "1014", "1015"), statusFilter === (stryMutAct_9fa48("1016") ? "" : (stryCov_9fa48("1016"), "В бездействий")))) {
              if (stryMutAct_9fa48("1017")) {
                {}
              } else {
                stryCov_9fa48("1017");
                baseFilteredWells = stryMutAct_9fa48("1018") ? baseFilteredWells : (stryCov_9fa48("1018"), baseFilteredWells.filter(stryMutAct_9fa48("1019") ? () => undefined : (stryCov_9fa48("1019"), well => stryMutAct_9fa48("1022") ? well.status !== "В бездействий" : stryMutAct_9fa48("1021") ? false : stryMutAct_9fa48("1020") ? true : (stryCov_9fa48("1020", "1021", "1022"), well.status === (stryMutAct_9fa48("1023") ? "" : (stryCov_9fa48("1023"), "В бездействий"))))));
              }
            } else {
              if (stryMutAct_9fa48("1024")) {
                {}
              } else {
                stryCov_9fa48("1024");
                // Default: exclude "В бездействий" wells
                baseFilteredWells = stryMutAct_9fa48("1025") ? baseFilteredWells : (stryCov_9fa48("1025"), baseFilteredWells.filter(stryMutAct_9fa48("1026") ? () => undefined : (stryCov_9fa48("1026"), well => stryMutAct_9fa48("1029") ? well.status === "В бездействий" : stryMutAct_9fa48("1028") ? false : stryMutAct_9fa48("1027") ? true : (stryCov_9fa48("1027", "1028", "1029"), well.status !== (stryMutAct_9fa48("1030") ? "" : (stryCov_9fa48("1030"), "В бездействий"))))));
              }
            }
          }
        } else {
          if (stryMutAct_9fa48("1031")) {
            {}
          } else {
            stryCov_9fa48("1031");
            baseFilteredWells = stryMutAct_9fa48("1032") ? wells : (stryCov_9fa48("1032"), wells.filter(stryMutAct_9fa48("1033") ? () => undefined : (stryCov_9fa48("1033"), well => stryMutAct_9fa48("1036") ? well.nagn !== 1 : stryMutAct_9fa48("1035") ? false : stryMutAct_9fa48("1034") ? true : (stryCov_9fa48("1034", "1035", "1036"), well.nagn === 1))));
          }
        }
        if (stryMutAct_9fa48("1039") ? chrpFilter && fond === 0 || !statusFilter : stryMutAct_9fa48("1038") ? false : stryMutAct_9fa48("1037") ? true : (stryCov_9fa48("1037", "1038", "1039"), (stryMutAct_9fa48("1041") ? chrpFilter || fond === 0 : stryMutAct_9fa48("1040") ? true : (stryCov_9fa48("1040", "1041"), chrpFilter && (stryMutAct_9fa48("1043") ? fond !== 0 : stryMutAct_9fa48("1042") ? true : (stryCov_9fa48("1042", "1043"), fond === 0)))) && (stryMutAct_9fa48("1044") ? statusFilter : (stryCov_9fa48("1044"), !statusFilter)))) {
          if (stryMutAct_9fa48("1045")) {
            {}
          } else {
            stryCov_9fa48("1045");
            baseFilteredWells = stryMutAct_9fa48("1046") ? baseFilteredWells : (stryCov_9fa48("1046"), baseFilteredWells.filter(stryMutAct_9fa48("1047") ? () => undefined : (stryCov_9fa48("1047"), well => stryMutAct_9fa48("1050") ? well.type !== 1 : stryMutAct_9fa48("1049") ? false : stryMutAct_9fa48("1048") ? true : (stryCov_9fa48("1048", "1049", "1050"), well.type === 1))));
          }
        }
        return baseFilteredWells;
      }
    }, stryMutAct_9fa48("1051") ? [] : (stryCov_9fa48("1051"), [wells, fond, chrpFilter, statusFilter]));
    const wellsForComponents = useMemo(() => {
      if (stryMutAct_9fa48("1052")) {
        {}
      } else {
        stryCov_9fa48("1052");
        if (stryMutAct_9fa48("1055") ? fond !== 0 : stryMutAct_9fa48("1054") ? false : stryMutAct_9fa48("1053") ? true : (stryCov_9fa48("1053", "1054", "1055"), fond === 0)) {
          if (stryMutAct_9fa48("1056")) {
            {}
          } else {
            stryCov_9fa48("1056");
            return stryMutAct_9fa48("1057") ? wells : (stryCov_9fa48("1057"), wells.filter(stryMutAct_9fa48("1058") ? () => undefined : (stryCov_9fa48("1058"), well => stryMutAct_9fa48("1061") ? well.nagn !== 0 : stryMutAct_9fa48("1060") ? false : stryMutAct_9fa48("1059") ? true : (stryCov_9fa48("1059", "1060", "1061"), well.nagn === 0))));
          }
        } else {
          if (stryMutAct_9fa48("1062")) {
            {}
          } else {
            stryCov_9fa48("1062");
            return stryMutAct_9fa48("1063") ? wells : (stryCov_9fa48("1063"), wells.filter(stryMutAct_9fa48("1064") ? () => undefined : (stryCov_9fa48("1064"), well => stryMutAct_9fa48("1067") ? well.nagn !== 1 : stryMutAct_9fa48("1066") ? false : stryMutAct_9fa48("1065") ? true : (stryCov_9fa48("1065", "1066", "1067"), well.nagn === 1))));
          }
        }
      }
    }, stryMutAct_9fa48("1068") ? [] : (stryCov_9fa48("1068"), [wells, fond]));

    // Memoize format functions
    const formatLastUpdate = useCallback(dateString => {
      if (stryMutAct_9fa48("1069")) {
        {}
      } else {
        stryCov_9fa48("1069");
        if (stryMutAct_9fa48("1072") ? false : stryMutAct_9fa48("1071") ? true : stryMutAct_9fa48("1070") ? dateString : (stryCov_9fa48("1070", "1071", "1072"), !dateString)) return stryMutAct_9fa48("1073") ? "" : (stryCov_9fa48("1073"), "N/A");
        try {
          if (stryMutAct_9fa48("1074")) {
            {}
          } else {
            stryCov_9fa48("1074");
            const date = new Date(dateString);
            return date.toLocaleString(stryMutAct_9fa48("1075") ? "" : (stryCov_9fa48("1075"), 'ru-RU'), stryMutAct_9fa48("1076") ? {} : (stryCov_9fa48("1076"), {
              year: stryMutAct_9fa48("1077") ? "" : (stryCov_9fa48("1077"), 'numeric'),
              month: stryMutAct_9fa48("1078") ? "" : (stryCov_9fa48("1078"), '2-digit'),
              day: stryMutAct_9fa48("1079") ? "" : (stryCov_9fa48("1079"), '2-digit'),
              hour: stryMutAct_9fa48("1080") ? "" : (stryCov_9fa48("1080"), '2-digit'),
              minute: stryMutAct_9fa48("1081") ? "" : (stryCov_9fa48("1081"), '2-digit'),
              second: stryMutAct_9fa48("1082") ? "" : (stryCov_9fa48("1082"), '2-digit')
            }));
          }
        } catch (error) {
          if (stryMutAct_9fa48("1083")) {
            {}
          } else {
            stryCov_9fa48("1083");
            return stryMutAct_9fa48("1084") ? "" : (stryCov_9fa48("1084"), "N/A");
          }
        }
      }
    }, stryMutAct_9fa48("1085") ? ["Stryker was here"] : (stryCov_9fa48("1085"), []));
    const formatDate = useCallback(dateString => {
      if (stryMutAct_9fa48("1086")) {
        {}
      } else {
        stryCov_9fa48("1086");
        if (stryMutAct_9fa48("1089") ? false : stryMutAct_9fa48("1088") ? true : stryMutAct_9fa48("1087") ? dateString : (stryCov_9fa48("1087", "1088", "1089"), !dateString)) return stryMutAct_9fa48("1090") ? "" : (stryCov_9fa48("1090"), "N/A");
        try {
          if (stryMutAct_9fa48("1091")) {
            {}
          } else {
            stryCov_9fa48("1091");
            const date = new Date(dateString);
            // Check if the date is valid (getTime() returns NaN for invalid dates)
            if (stryMutAct_9fa48("1093") ? false : stryMutAct_9fa48("1092") ? true : (stryCov_9fa48("1092", "1093"), isNaN(date.getTime()))) {
              if (stryMutAct_9fa48("1094")) {
                {}
              } else {
                stryCov_9fa48("1094");
                return stryMutAct_9fa48("1095") ? "" : (stryCov_9fa48("1095"), "N/A");
              }
            }
            const day = date.getDate().toString().padStart(2, stryMutAct_9fa48("1096") ? "" : (stryCov_9fa48("1096"), '0'));
            const month = (stryMutAct_9fa48("1097") ? date.getMonth() - 1 : (stryCov_9fa48("1097"), date.getMonth() + 1)).toString().padStart(2, stryMutAct_9fa48("1098") ? "" : (stryCov_9fa48("1098"), '0'));
            const year = date.getFullYear();
            const hours = date.getHours().toString().padStart(2, stryMutAct_9fa48("1099") ? "" : (stryCov_9fa48("1099"), '0'));
            const minutes = date.getMinutes().toString().padStart(2, stryMutAct_9fa48("1100") ? "" : (stryCov_9fa48("1100"), '0'));
            const seconds = date.getSeconds().toString().padStart(2, stryMutAct_9fa48("1101") ? "" : (stryCov_9fa48("1101"), '0'));
            return stryMutAct_9fa48("1102") ? `` : (stryCov_9fa48("1102"), `${day}.${month}.${year}, ${hours}:${minutes}:${seconds}`);
          }
        } catch (error) {
          if (stryMutAct_9fa48("1103")) {
            {}
          } else {
            stryCov_9fa48("1103");
            // This catch block handles errors from new Date() if dateString is a malformed string
            // or any other unexpected error during parsing/formatting.
            // The isNaN check above should catch most cases, but this adds extra safety.
            return stryMutAct_9fa48("1104") ? "" : (stryCov_9fa48("1104"), "N/A");
          }
        }
      }
    }, stryMutAct_9fa48("1105") ? ["Stryker was here"] : (stryCov_9fa48("1105"), []));
    const formatModalValue = useCallback(value => {
      if (stryMutAct_9fa48("1106")) {
        {}
      } else {
        stryCov_9fa48("1106");
        if (stryMutAct_9fa48("1109") ? (value === null || value === undefined) && value === '' : stryMutAct_9fa48("1108") ? false : stryMutAct_9fa48("1107") ? true : (stryCov_9fa48("1107", "1108", "1109"), (stryMutAct_9fa48("1111") ? value === null && value === undefined : stryMutAct_9fa48("1110") ? false : (stryCov_9fa48("1110", "1111"), (stryMutAct_9fa48("1113") ? value !== null : stryMutAct_9fa48("1112") ? false : (stryCov_9fa48("1112", "1113"), value === null)) || (stryMutAct_9fa48("1115") ? value !== undefined : stryMutAct_9fa48("1114") ? false : (stryCov_9fa48("1114", "1115"), value === undefined)))) || (stryMutAct_9fa48("1117") ? value !== '' : stryMutAct_9fa48("1116") ? false : (stryCov_9fa48("1116", "1117"), value === (stryMutAct_9fa48("1118") ? "Stryker was here!" : (stryCov_9fa48("1118"), '')))))) {
          if (stryMutAct_9fa48("1119")) {
            {}
          } else {
            stryCov_9fa48("1119");
            return stryMutAct_9fa48("1120") ? "" : (stryCov_9fa48("1120"), "N/A");
          }
        }
        const numValue = parseFloat(value);
        if (stryMutAct_9fa48("1122") ? false : stryMutAct_9fa48("1121") ? true : (stryCov_9fa48("1121", "1122"), isNaN(numValue))) {
          if (stryMutAct_9fa48("1123")) {
            {}
          } else {
            stryCov_9fa48("1123");
            return value;
          }
        }
        return numValue.toString();
      }
    }, stryMutAct_9fa48("1124") ? ["Stryker was here"] : (stryCov_9fa48("1124"), []));
    const formatValue = useCallback((value, unit = stryMutAct_9fa48("1125") ? "Stryker was here!" : (stryCov_9fa48("1125"), ""), decimals = 2) => {
      if (stryMutAct_9fa48("1126")) {
        {}
      } else {
        stryCov_9fa48("1126");
        if (stryMutAct_9fa48("1129") ? (value === null || value === undefined) && value === "" : stryMutAct_9fa48("1128") ? false : stryMutAct_9fa48("1127") ? true : (stryCov_9fa48("1127", "1128", "1129"), (stryMutAct_9fa48("1131") ? value === null && value === undefined : stryMutAct_9fa48("1130") ? false : (stryCov_9fa48("1130", "1131"), (stryMutAct_9fa48("1133") ? value !== null : stryMutAct_9fa48("1132") ? false : (stryCov_9fa48("1132", "1133"), value === null)) || (stryMutAct_9fa48("1135") ? value !== undefined : stryMutAct_9fa48("1134") ? false : (stryCov_9fa48("1134", "1135"), value === undefined)))) || (stryMutAct_9fa48("1137") ? value !== "" : stryMutAct_9fa48("1136") ? false : (stryCov_9fa48("1136", "1137"), value === (stryMutAct_9fa48("1138") ? "Stryker was here!" : (stryCov_9fa48("1138"), "")))))) return stryMutAct_9fa48("1139") ? "" : (stryCov_9fa48("1139"), "N/A");
        if (stryMutAct_9fa48("1142") ? typeof value !== "number" : stryMutAct_9fa48("1141") ? false : stryMutAct_9fa48("1140") ? true : (stryCov_9fa48("1140", "1141", "1142"), typeof value === (stryMutAct_9fa48("1143") ? "" : (stryCov_9fa48("1143"), "number")))) {
          if (stryMutAct_9fa48("1144")) {
            {}
          } else {
            stryCov_9fa48("1144");
            return stryMutAct_9fa48("1145") ? `${value.toFixed(decimals)} ${unit}` : (stryCov_9fa48("1145"), (stryMutAct_9fa48("1146") ? `` : (stryCov_9fa48("1146"), `${value.toFixed(decimals)} ${unit}`)).trim());
          }
        }
        return value;
      }
    }, stryMutAct_9fa48("1147") ? ["Stryker was here"] : (stryCov_9fa48("1147"), []));
    const handleWellClick = useCallback(async (wellNumber, providedOtvodData = null, silent = stryMutAct_9fa48("1148") ? true : (stryCov_9fa48("1148"), false)) => {
      if (stryMutAct_9fa48("1149")) {
        {}
      } else {
        stryCov_9fa48("1149");
        setCurrentWellNumber(wellNumber);
        currentProvidedOtvodDataRef.current = providedOtvodData;
        const selectedWell = wells.find(stryMutAct_9fa48("1150") ? () => undefined : (stryCov_9fa48("1150"), well => stryMutAct_9fa48("1153") ? well.well !== wellNumber : stryMutAct_9fa48("1152") ? false : stryMutAct_9fa48("1151") ? true : (stryCov_9fa48("1151", "1152", "1153"), well.well === wellNumber)));
        const isChrpWell = stryMutAct_9fa48("1156") ? selectedWell?.type !== 1 : stryMutAct_9fa48("1155") ? false : stryMutAct_9fa48("1154") ? true : (stryCov_9fa48("1154", "1155", "1156"), (stryMutAct_9fa48("1157") ? selectedWell.type : (stryCov_9fa48("1157"), selectedWell?.type)) === 1);
        try {
          if (stryMutAct_9fa48("1158")) {
            {}
          } else {
            stryCov_9fa48("1158");
            if (stryMutAct_9fa48("1161") ? false : stryMutAct_9fa48("1160") ? true : stryMutAct_9fa48("1159") ? silent : (stryCov_9fa48("1159", "1160", "1161"), !silent)) {
              if (stryMutAct_9fa48("1162")) {
                {}
              } else {
                stryCov_9fa48("1162");
                if (stryMutAct_9fa48("1164") ? false : stryMutAct_9fa48("1163") ? true : (stryCov_9fa48("1163", "1164"), isChrpWell)) {
                  if (stryMutAct_9fa48("1165")) {
                    {}
                  } else {
                    stryCov_9fa48("1165");
                    setWellModalLoading(stryMutAct_9fa48("1166") ? false : (stryCov_9fa48("1166"), true));
                  }
                }
                setAgzuModalLoading(stryMutAct_9fa48("1167") ? false : (stryCov_9fa48("1167"), true));
                setWellModalTitle(stryMutAct_9fa48("1168") ? `` : (stryCov_9fa48("1168"), `Скважина ${wellNumber}`));
                setShowWellModal(stryMutAct_9fa48("1169") ? false : (stryCov_9fa48("1169"), true));
                if (stryMutAct_9fa48("1172") ? false : stryMutAct_9fa48("1171") ? true : stryMutAct_9fa48("1170") ? isChrpWell : (stryCov_9fa48("1170", "1171", "1172"), !isChrpWell)) {
                  if (stryMutAct_9fa48("1173")) {
                    {}
                  } else {
                    stryCov_9fa48("1173");
                    setWellModalData(stryMutAct_9fa48("1174") ? ["Stryker was here"] : (stryCov_9fa48("1174"), []));
                  }
                }
              }
            }
            if (stryMutAct_9fa48("1176") ? false : stryMutAct_9fa48("1175") ? true : (stryCov_9fa48("1175", "1176"), isChrpWell)) {
              if (stryMutAct_9fa48("1177")) {
                {}
              } else {
                stryCov_9fa48("1177");
                const response = await fetchWellData(wellNumber);
                const specificWellData = response.data;
                const wellData = Array.isArray(specificWellData) ? specificWellData[0] : specificWellData;

                // Determine status text based on working value
                let statusText = stryMutAct_9fa48("1178") ? "" : (stryCov_9fa48("1178"), "Неизвестно");
                if (stryMutAct_9fa48("1181") ? wellData["Работа"] !== 1 : stryMutAct_9fa48("1180") ? false : stryMutAct_9fa48("1179") ? true : (stryCov_9fa48("1179", "1180", "1181"), wellData[stryMutAct_9fa48("1182") ? "" : (stryCov_9fa48("1182"), "Работа")] === 1)) {
                  if (stryMutAct_9fa48("1183")) {
                    {}
                  } else {
                    stryCov_9fa48("1183");
                    statusText = stryMutAct_9fa48("1184") ? "" : (stryCov_9fa48("1184"), "В сети");
                  }
                } else if (stryMutAct_9fa48("1187") ? wellData["Работа"] !== 2 : stryMutAct_9fa48("1186") ? false : stryMutAct_9fa48("1185") ? true : (stryCov_9fa48("1185", "1186", "1187"), wellData[stryMutAct_9fa48("1188") ? "" : (stryCov_9fa48("1188"), "Работа")] === 2)) {
                  if (stryMutAct_9fa48("1189")) {
                    {}
                  } else {
                    stryCov_9fa48("1189");
                    statusText = stryMutAct_9fa48("1190") ? "" : (stryCov_9fa48("1190"), "Нет данных");
                  }
                } else if (stryMutAct_9fa48("1193") ? wellData["Работа"] !== 3 : stryMutAct_9fa48("1192") ? false : stryMutAct_9fa48("1191") ? true : (stryCov_9fa48("1191", "1192", "1193"), wellData[stryMutAct_9fa48("1194") ? "" : (stryCov_9fa48("1194"), "Работа")] === 3)) {
                  if (stryMutAct_9fa48("1195")) {
                    {}
                  } else {
                    stryCov_9fa48("1195");
                    statusText = stryMutAct_9fa48("1196") ? "" : (stryCov_9fa48("1196"), "Нет связи с ЧРП");
                  }
                }

                // Determine power unit based on ЧРП type
                const chrpType = wellData[stryMutAct_9fa48("1197") ? "" : (stryCov_9fa48("1197"), "Тип ЧРП")];
                const isShneider = stryMutAct_9fa48("1200") ? chrpType || chrpType.toString().startsWith("Шнайдер") : stryMutAct_9fa48("1199") ? false : stryMutAct_9fa48("1198") ? true : (stryCov_9fa48("1198", "1199", "1200"), chrpType && (stryMutAct_9fa48("1201") ? chrpType.toString().endsWith("Шнайдер") : (stryCov_9fa48("1201"), chrpType.toString().startsWith(stryMutAct_9fa48("1202") ? "" : (stryCov_9fa48("1202"), "Шнайдер")))));
                const powerUnit = isShneider ? stryMutAct_9fa48("1203") ? "" : (stryCov_9fa48("1203"), "%") : stryMutAct_9fa48("1204") ? "" : (stryCov_9fa48("1204"), "кВт/ч");

                // Always show all data, but add status as second row
                const transformedData = stryMutAct_9fa48("1205") ? [] : (stryCov_9fa48("1205"), [stryMutAct_9fa48("1206") ? {} : (stryCov_9fa48("1206"), {
                  "Параметр": stryMutAct_9fa48("1207") ? "" : (stryCov_9fa48("1207"), "Дата опроса"),
                  "Значение": formatLastUpdate(wellData[stryMutAct_9fa48("1208") ? "" : (stryCov_9fa48("1208"), "Последнее обновление")])
                }), stryMutAct_9fa48("1209") ? {} : (stryCov_9fa48("1209"), {
                  "Параметр": stryMutAct_9fa48("1210") ? "" : (stryCov_9fa48("1210"), "Статус"),
                  "Значение": statusText
                }), stryMutAct_9fa48("1211") ? {} : (stryCov_9fa48("1211"), {
                  "Параметр": stryMutAct_9fa48("1212") ? "" : (stryCov_9fa48("1212"), "Напряжение"),
                  "Значение": formatValue(wellData[stryMutAct_9fa48("1213") ? "" : (stryCov_9fa48("1213"), "Напряжение")], stryMutAct_9fa48("1214") ? "" : (stryCov_9fa48("1214"), "В"), 2)
                }), stryMutAct_9fa48("1215") ? {} : (stryCov_9fa48("1215"), {
                  "Параметр": stryMutAct_9fa48("1216") ? "" : (stryCov_9fa48("1216"), "Мощность"),
                  "Значение": formatValue(wellData[stryMutAct_9fa48("1217") ? "" : (stryCov_9fa48("1217"), "Мощность")], powerUnit, 2)
                }), stryMutAct_9fa48("1218") ? {} : (stryCov_9fa48("1218"), {
                  "Параметр": stryMutAct_9fa48("1219") ? "" : (stryCov_9fa48("1219"), "Частота"),
                  "Значение": formatValue(wellData[stryMutAct_9fa48("1220") ? "" : (stryCov_9fa48("1220"), "Частота")], stryMutAct_9fa48("1221") ? "" : (stryCov_9fa48("1221"), "Гц"), 2)
                }), stryMutAct_9fa48("1222") ? {} : (stryCov_9fa48("1222"), {
                  "Параметр": stryMutAct_9fa48("1223") ? "" : (stryCov_9fa48("1223"), "Ток"),
                  "Значение": formatValue(wellData[stryMutAct_9fa48("1224") ? "" : (stryCov_9fa48("1224"), "Ток")], stryMutAct_9fa48("1225") ? "" : (stryCov_9fa48("1225"), "А"), 2)
                }), stryMutAct_9fa48("1226") ? {} : (stryCov_9fa48("1226"), {
                  "Параметр": stryMutAct_9fa48("1227") ? "" : (stryCov_9fa48("1227"), "Обороты ротора"),
                  "Значение": formatValue(wellData[stryMutAct_9fa48("1228") ? "" : (stryCov_9fa48("1228"), "Скорость двигателя")], stryMutAct_9fa48("1229") ? "" : (stryCov_9fa48("1229"), "об/мин"), 0)
                }), stryMutAct_9fa48("1230") ? {} : (stryCov_9fa48("1230"), {
                  "Параметр": stryMutAct_9fa48("1231") ? "" : (stryCov_9fa48("1231"), "Тип ЧРП"),
                  "Значение": formatModalValue(wellData[stryMutAct_9fa48("1232") ? "" : (stryCov_9fa48("1232"), "Тип ЧРП")])
                }), ...((stryMutAct_9fa48("1235") ? wellData["Тип"] !== 1 : stryMutAct_9fa48("1234") ? false : stryMutAct_9fa48("1233") ? true : (stryCov_9fa48("1233", "1234", "1235"), wellData[stryMutAct_9fa48("1236") ? "" : (stryCov_9fa48("1236"), "Тип")] === 1)) ? stryMutAct_9fa48("1237") ? [] : (stryCov_9fa48("1237"), [stryMutAct_9fa48("1238") ? {} : (stryCov_9fa48("1238"), {
                  "Параметр": stryMutAct_9fa48("1239") ? "" : (stryCov_9fa48("1239"), "Температура устья"),
                  "Значение": formatValue(wellData[stryMutAct_9fa48("1240") ? "" : (stryCov_9fa48("1240"), "Температура")], stryMutAct_9fa48("1241") ? "" : (stryCov_9fa48("1241"), "°C"), 1)
                })]) : stryMutAct_9fa48("1242") ? ["Stryker was here"] : (stryCov_9fa48("1242"), []))]);
                setWellModalData(transformedData);
                if (stryMutAct_9fa48("1245") ? false : stryMutAct_9fa48("1244") ? true : stryMutAct_9fa48("1243") ? silent : (stryCov_9fa48("1243", "1244", "1245"), !silent)) setWellModalLoading(stryMutAct_9fa48("1246") ? true : (stryCov_9fa48("1246"), false));
              }
            }

            // Rest of the AGZU data fetching code remains the same
            let otvodDataToUse = providedOtvodData;
            if (stryMutAct_9fa48("1249") ? !otvodDataToUse && currentOtvodWell === wellNumber || currentOtvodData : stryMutAct_9fa48("1248") ? false : stryMutAct_9fa48("1247") ? true : (stryCov_9fa48("1247", "1248", "1249"), (stryMutAct_9fa48("1251") ? !otvodDataToUse || currentOtvodWell === wellNumber : stryMutAct_9fa48("1250") ? true : (stryCov_9fa48("1250", "1251"), (stryMutAct_9fa48("1252") ? otvodDataToUse : (stryCov_9fa48("1252"), !otvodDataToUse)) && (stryMutAct_9fa48("1254") ? currentOtvodWell !== wellNumber : stryMutAct_9fa48("1253") ? true : (stryCov_9fa48("1253", "1254"), currentOtvodWell === wellNumber)))) && currentOtvodData)) {
              if (stryMutAct_9fa48("1255")) {
                {}
              } else {
                stryCov_9fa48("1255");
                otvodDataToUse = currentOtvodData;
              }
            }
            if (stryMutAct_9fa48("1257") ? false : stryMutAct_9fa48("1256") ? true : (stryCov_9fa48("1256", "1257"), otvodDataToUse)) {
              if (stryMutAct_9fa48("1258")) {
                {}
              } else {
                stryCov_9fa48("1258");
                const transformedAgzuData = stryMutAct_9fa48("1259") ? [] : (stryCov_9fa48("1259"), [stryMutAct_9fa48("1260") ? {} : (stryCov_9fa48("1260"), {
                  Параметр: stryMutAct_9fa48("1261") ? "" : (stryCov_9fa48("1261"), "Дата замера"),
                  Значение: formatDate(stryMutAct_9fa48("1264") ? otvodDataToUse.lastDate && selectedWell?.update_date : stryMutAct_9fa48("1263") ? false : stryMutAct_9fa48("1262") ? true : (stryCov_9fa48("1262", "1263", "1264"), otvodDataToUse.lastDate || (stryMutAct_9fa48("1265") ? selectedWell.update_date : (stryCov_9fa48("1265"), selectedWell?.update_date))))
                }), stryMutAct_9fa48("1266") ? {} : (stryCov_9fa48("1266"), {
                  Параметр: stryMutAct_9fa48("1267") ? "" : (stryCov_9fa48("1267"), "Жидкость"),
                  Значение: formatValue(otvodDataToUse.liquid, stryMutAct_9fa48("1268") ? "" : (stryCov_9fa48("1268"), "м³/ч"))
                }), stryMutAct_9fa48("1269") ? {} : (stryCov_9fa48("1269"), {
                  Параметр: stryMutAct_9fa48("1270") ? "" : (stryCov_9fa48("1270"), "Нефть"),
                  Значение: formatValue(otvodDataToUse.oil, stryMutAct_9fa48("1271") ? "" : (stryCov_9fa48("1271"), "т/сут"))
                }), stryMutAct_9fa48("1272") ? {} : (stryCov_9fa48("1272"), {
                  Параметр: stryMutAct_9fa48("1273") ? "" : (stryCov_9fa48("1273"), "Газ"),
                  Значение: formatValue(otvodDataToUse.gas, stryMutAct_9fa48("1274") ? "" : (stryCov_9fa48("1274"), "м³/сут"))
                }), stryMutAct_9fa48("1275") ? {} : (stryCov_9fa48("1275"), {
                  Параметр: stryMutAct_9fa48("1276") ? "" : (stryCov_9fa48("1276"), "Обводненность АГЗУ"),
                  Значение: formatValue(otvodDataToUse.waterCut, stryMutAct_9fa48("1277") ? "" : (stryCov_9fa48("1277"), "%"))
                }), stryMutAct_9fa48("1278") ? {} : (stryCov_9fa48("1278"), {
                  Параметр: stryMutAct_9fa48("1279") ? "" : (stryCov_9fa48("1279"), "Обводненность влагомера"),
                  Значение: stryMutAct_9fa48("1280") ? "" : (stryCov_9fa48("1280"), "N/A")
                })]);
                setAgzuModalData(transformedAgzuData);
                if (stryMutAct_9fa48("1283") ? false : stryMutAct_9fa48("1282") ? true : stryMutAct_9fa48("1281") ? silent : (stryCov_9fa48("1281", "1282", "1283"), !silent)) setAgzuModalLoading(stryMutAct_9fa48("1284") ? true : (stryCov_9fa48("1284"), false));
              }
            } else {
              if (stryMutAct_9fa48("1285")) {
                {}
              } else {
                stryCov_9fa48("1285");
                try {
                  if (stryMutAct_9fa48("1286")) {
                    {}
                  } else {
                    stryCov_9fa48("1286");
                    const agzuResponse = await fetchAGZUWellData(wellNumber);
                    const agzuWellData = agzuResponse.data;
                    const agzuData = Array.isArray(agzuWellData) ? agzuWellData[0] : agzuWellData;
                    const transformedAgzuData = stryMutAct_9fa48("1287") ? [] : (stryCov_9fa48("1287"), [stryMutAct_9fa48("1288") ? {} : (stryCov_9fa48("1288"), {
                      Параметр: stryMutAct_9fa48("1289") ? "" : (stryCov_9fa48("1289"), "Дата замера"),
                      Значение: formatDate(stryMutAct_9fa48("1292") ? agzuData["Дата и время"] && selectedWell?.update_date : stryMutAct_9fa48("1291") ? false : stryMutAct_9fa48("1290") ? true : (stryCov_9fa48("1290", "1291", "1292"), agzuData[stryMutAct_9fa48("1293") ? "" : (stryCov_9fa48("1293"), "Дата и время")] || (stryMutAct_9fa48("1294") ? selectedWell.update_date : (stryCov_9fa48("1294"), selectedWell?.update_date))))
                    }), stryMutAct_9fa48("1295") ? {} : (stryCov_9fa48("1295"), {
                      Параметр: stryMutAct_9fa48("1296") ? "" : (stryCov_9fa48("1296"), "Жидкость"),
                      Значение: formatValue(agzuData[stryMutAct_9fa48("1297") ? "" : (stryCov_9fa48("1297"), "Жидкость")], stryMutAct_9fa48("1298") ? "" : (stryCov_9fa48("1298"), "м³"))
                    }), stryMutAct_9fa48("1299") ? {} : (stryCov_9fa48("1299"), {
                      Параметр: stryMutAct_9fa48("1300") ? "" : (stryCov_9fa48("1300"), "Нефть"),
                      Значение: formatValue(agzuData[stryMutAct_9fa48("1301") ? "" : (stryCov_9fa48("1301"), "Нефть")], stryMutAct_9fa48("1302") ? "" : (stryCov_9fa48("1302"), "т/сут"))
                    }), stryMutAct_9fa48("1303") ? {} : (stryCov_9fa48("1303"), {
                      Параметр: stryMutAct_9fa48("1304") ? "" : (stryCov_9fa48("1304"), "Газ"),
                      Значение: formatValue(agzuData[stryMutAct_9fa48("1305") ? "" : (stryCov_9fa48("1305"), "Газ")], stryMutAct_9fa48("1306") ? "" : (stryCov_9fa48("1306"), "м³/сут"))
                    }), stryMutAct_9fa48("1307") ? {} : (stryCov_9fa48("1307"), {
                      Параметр: stryMutAct_9fa48("1308") ? "" : (stryCov_9fa48("1308"), "Обводненность АГЗУ"),
                      Значение: formatValue(agzuData[stryMutAct_9fa48("1309") ? "" : (stryCov_9fa48("1309"), "Обводненность")], stryMutAct_9fa48("1310") ? "" : (stryCov_9fa48("1310"), "%"))
                    }), stryMutAct_9fa48("1311") ? {} : (stryCov_9fa48("1311"), {
                      Параметр: stryMutAct_9fa48("1312") ? "" : (stryCov_9fa48("1312"), "Обводненность влагомера"),
                      Значение: stryMutAct_9fa48("1313") ? "" : (stryCov_9fa48("1313"), "N/A")
                    })]);
                    setAgzuModalData(transformedAgzuData);
                  }
                } catch (agzuError) {
                  if (stryMutAct_9fa48("1314")) {
                    {}
                  } else {
                    stryCov_9fa48("1314");
                    console.log(stryMutAct_9fa48("1315") ? "" : (stryCov_9fa48("1315"), "No AGZU data available for this well"));
                    setAgzuModalData(stryMutAct_9fa48("1316") ? ["Stryker was here"] : (stryCov_9fa48("1316"), []));
                  }
                } finally {
                  if (stryMutAct_9fa48("1317")) {
                    {}
                  } else {
                    stryCov_9fa48("1317");
                    if (stryMutAct_9fa48("1320") ? false : stryMutAct_9fa48("1319") ? true : stryMutAct_9fa48("1318") ? silent : (stryCov_9fa48("1318", "1319", "1320"), !silent)) setAgzuModalLoading(stryMutAct_9fa48("1321") ? true : (stryCov_9fa48("1321"), false));
                  }
                }
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("1322")) {
            {}
          } else {
            stryCov_9fa48("1322");
            console.error(stryMutAct_9fa48("1323") ? "" : (stryCov_9fa48("1323"), "Error fetching well data:"), error);
            if (stryMutAct_9fa48("1325") ? false : stryMutAct_9fa48("1324") ? true : (stryCov_9fa48("1324", "1325"), isChrpWell)) {
              if (stryMutAct_9fa48("1326")) {
                {}
              } else {
                stryCov_9fa48("1326");
                const fallbackData = stryMutAct_9fa48("1327") ? [] : (stryCov_9fa48("1327"), [stryMutAct_9fa48("1328") ? {} : (stryCov_9fa48("1328"), {
                  "Параметр": stryMutAct_9fa48("1329") ? "" : (stryCov_9fa48("1329"), "Номер скважины"),
                  "Значение": stryMutAct_9fa48("1332") ? selectedWell?.well && "N/A" : stryMutAct_9fa48("1331") ? false : stryMutAct_9fa48("1330") ? true : (stryCov_9fa48("1330", "1331", "1332"), (stryMutAct_9fa48("1333") ? selectedWell.well : (stryCov_9fa48("1333"), selectedWell?.well)) || (stryMutAct_9fa48("1334") ? "" : (stryCov_9fa48("1334"), "N/A")))
                }), stryMutAct_9fa48("1335") ? {} : (stryCov_9fa48("1335"), {
                  "Параметр": stryMutAct_9fa48("1336") ? "" : (stryCov_9fa48("1336"), "Последнее обновление"),
                  "Значение": stryMutAct_9fa48("1337") ? "" : (stryCov_9fa48("1337"), "Не удалось загрузить")
                }), stryMutAct_9fa48("1338") ? {} : (stryCov_9fa48("1338"), {
                  "Параметр": stryMutAct_9fa48("1339") ? "" : (stryCov_9fa48("1339"), "Ошибка"),
                  "Значение": stryMutAct_9fa48("1340") ? "" : (stryCov_9fa48("1340"), "Не удалось загрузить подробные данные. Показаны базовые данные из кэша.")
                }), stryMutAct_9fa48("1341") ? {} : (stryCov_9fa48("1341"), {
                  "Параметр": stryMutAct_9fa48("1342") ? "" : (stryCov_9fa48("1342"), "Тех. режим по жидкости"),
                  "Значение": (stryMutAct_9fa48("1345") ? selectedWell?.tr_fluid == null : stryMutAct_9fa48("1344") ? false : stryMutAct_9fa48("1343") ? true : (stryCov_9fa48("1343", "1344", "1345"), (stryMutAct_9fa48("1346") ? selectedWell.tr_fluid : (stryCov_9fa48("1346"), selectedWell?.tr_fluid)) != null)) ? stryMutAct_9fa48("1347") ? `` : (stryCov_9fa48("1347"), `${selectedWell.tr_fluid.toFixed(2)} м³/сут`) : stryMutAct_9fa48("1348") ? "" : (stryCov_9fa48("1348"), "N/A")
                }), stryMutAct_9fa48("1349") ? {} : (stryCov_9fa48("1349"), {
                  "Параметр": stryMutAct_9fa48("1350") ? "" : (stryCov_9fa48("1350"), "Замер"),
                  "Значение": (stryMutAct_9fa48("1353") ? selectedWell?.zamer == null : stryMutAct_9fa48("1352") ? false : stryMutAct_9fa48("1351") ? true : (stryCov_9fa48("1351", "1352", "1353"), (stryMutAct_9fa48("1354") ? selectedWell.zamer : (stryCov_9fa48("1354"), selectedWell?.zamer)) != null)) ? stryMutAct_9fa48("1355") ? `` : (stryCov_9fa48("1355"), `${selectedWell.zamer.toFixed(2)}`) : stryMutAct_9fa48("1356") ? "" : (stryCov_9fa48("1356"), "N/A")
                }), stryMutAct_9fa48("1357") ? {} : (stryCov_9fa48("1357"), {
                  "Параметр": stryMutAct_9fa48("1358") ? "" : (stryCov_9fa48("1358"), "Тип"),
                  "Значение": (stryMutAct_9fa48("1361") ? selectedWell?.type !== 1 : stryMutAct_9fa48("1360") ? false : stryMutAct_9fa48("1359") ? true : (stryCov_9fa48("1359", "1360", "1361"), (stryMutAct_9fa48("1362") ? selectedWell.type : (stryCov_9fa48("1362"), selectedWell?.type)) === 1)) ? stryMutAct_9fa48("1363") ? "" : (stryCov_9fa48("1363"), "ЧРП") : stryMutAct_9fa48("1364") ? "" : (stryCov_9fa48("1364"), "Обычная")
                })]);
                setWellModalData(fallbackData);
              }
            }
            if (stryMutAct_9fa48("1367") ? false : stryMutAct_9fa48("1366") ? true : stryMutAct_9fa48("1365") ? silent : (stryCov_9fa48("1365", "1366", "1367"), !silent)) {
              if (stryMutAct_9fa48("1368")) {
                {}
              } else {
                stryCov_9fa48("1368");
                if (stryMutAct_9fa48("1370") ? false : stryMutAct_9fa48("1369") ? true : (stryCov_9fa48("1369", "1370"), isChrpWell)) setWellModalLoading(stryMutAct_9fa48("1371") ? true : (stryCov_9fa48("1371"), false));
                setAgzuModalLoading(stryMutAct_9fa48("1372") ? true : (stryCov_9fa48("1372"), false));
              }
            }
          }
        }
      }
    }, stryMutAct_9fa48("1373") ? [] : (stryCov_9fa48("1373"), [wells, currentOtvodWell, currentOtvodData, formatLastUpdate, formatModalValue, formatValue, formatDate]));
    const handleCloseWellModal = () => {
      if (stryMutAct_9fa48("1374")) {
        {}
      } else {
        stryCov_9fa48("1374");
        setShowWellModal(stryMutAct_9fa48("1375") ? true : (stryCov_9fa48("1375"), false));
        setWellModalData(stryMutAct_9fa48("1376") ? ["Stryker was here"] : (stryCov_9fa48("1376"), []));
        setAgzuModalData(stryMutAct_9fa48("1377") ? ["Stryker was here"] : (stryCov_9fa48("1377"), []));
        setWellModalLoading(stryMutAct_9fa48("1378") ? true : (stryCov_9fa48("1378"), false));
        setAgzuModalLoading(stryMutAct_9fa48("1379") ? true : (stryCov_9fa48("1379"), false));
        setCurrentWellNumber(null);
        currentProvidedOtvodDataRef.current = null;
      }
    };
    const handleOpenChrpReportModal = () => {
      if (stryMutAct_9fa48("1380")) {
        {}
      } else {
        stryCov_9fa48("1380");
        if (stryMutAct_9fa48("1383") ? false : stryMutAct_9fa48("1382") ? true : stryMutAct_9fa48("1381") ? currentWellNumber : (stryCov_9fa48("1381", "1382", "1383"), !currentWellNumber)) return;
        const range = getLastWeekRange();
        setChrpReportStartDate(range.start);
        setChrpReportEndDate(range.end);
        setChrpReportWell(currentWellNumber);
        setChrpReportError(null);
        setShowChrpReportModal(stryMutAct_9fa48("1384") ? false : (stryCov_9fa48("1384"), true));
      }
    };
    const handleCloseChrpReportModal = () => {
      if (stryMutAct_9fa48("1385")) {
        {}
      } else {
        stryCov_9fa48("1385");
        setShowChrpReportModal(stryMutAct_9fa48("1386") ? true : (stryCov_9fa48("1386"), false));
      }
    };
    const handleOpenAgzuReportModal = () => {
      if (stryMutAct_9fa48("1387")) {
        {}
      } else {
        stryCov_9fa48("1387");
        if (stryMutAct_9fa48("1390") ? false : stryMutAct_9fa48("1389") ? true : stryMutAct_9fa48("1388") ? currentWellNumber : (stryCov_9fa48("1388", "1389", "1390"), !currentWellNumber)) return;
        const range = getLastWeekRange();
        setAgzuReportStartDate(range.start);
        setAgzuReportEndDate(range.end);
        setAgzuReportWell(currentWellNumber);
        setAgzuReportError(null);
        setShowAgzuReportModal(stryMutAct_9fa48("1391") ? false : (stryCov_9fa48("1391"), true));
      }
    };
    const handleCloseAgzuReportModal = () => {
      if (stryMutAct_9fa48("1392")) {
        {}
      } else {
        stryCov_9fa48("1392");
        setShowAgzuReportModal(stryMutAct_9fa48("1393") ? true : (stryCov_9fa48("1393"), false));
      }
    };
    const handleDownloadChrpReport = async () => {
      if (stryMutAct_9fa48("1394")) {
        {}
      } else {
        stryCov_9fa48("1394");
        if (stryMutAct_9fa48("1397") ? !chrpReportStartDate && !chrpReportEndDate : stryMutAct_9fa48("1396") ? false : stryMutAct_9fa48("1395") ? true : (stryCov_9fa48("1395", "1396", "1397"), (stryMutAct_9fa48("1398") ? chrpReportStartDate : (stryCov_9fa48("1398"), !chrpReportStartDate)) || (stryMutAct_9fa48("1399") ? chrpReportEndDate : (stryCov_9fa48("1399"), !chrpReportEndDate)))) {
          if (stryMutAct_9fa48("1400")) {
            {}
          } else {
            stryCov_9fa48("1400");
            setChrpReportError(stryMutAct_9fa48("1401") ? "" : (stryCov_9fa48("1401"), "Выберите период отчета"));
            return;
          }
        }
        if (stryMutAct_9fa48("1404") ? false : stryMutAct_9fa48("1403") ? true : stryMutAct_9fa48("1402") ? chrpReportWell : (stryCov_9fa48("1402", "1403", "1404"), !chrpReportWell)) {
          if (stryMutAct_9fa48("1405")) {
            {}
          } else {
            stryCov_9fa48("1405");
            setChrpReportError(stryMutAct_9fa48("1406") ? "" : (stryCov_9fa48("1406"), "Не выбрана скважина"));
            return;
          }
        }
        setChrpReportError(null);
        setChrpReportLoading(stryMutAct_9fa48("1407") ? false : (stryCov_9fa48("1407"), true));
        try {
          if (stryMutAct_9fa48("1408")) {
            {}
          } else {
            stryCov_9fa48("1408");
            const response = await fetchChrpArchiveReport(stryMutAct_9fa48("1409") ? {} : (stryCov_9fa48("1409"), {
              startDate: chrpReportStartDate,
              endDate: chrpReportEndDate,
              well: chrpReportWell
            }));
            const rows = Array.isArray(response.data) ? response.data : stryMutAct_9fa48("1410") ? ["Stryker was here"] : (stryCov_9fa48("1410"), []);
            if (stryMutAct_9fa48("1413") ? false : stryMutAct_9fa48("1412") ? true : stryMutAct_9fa48("1411") ? rows.length : (stryCov_9fa48("1411", "1412", "1413"), !rows.length)) {
              if (stryMutAct_9fa48("1414")) {
                {}
              } else {
                stryCov_9fa48("1414");
                setChrpReportError(stryMutAct_9fa48("1415") ? "" : (stryCov_9fa48("1415"), "Нет данных за выбранный период"));
                return;
              }
            }
            const headers = stryMutAct_9fa48("1416") ? [] : (stryCov_9fa48("1416"), [stryMutAct_9fa48("1417") ? "" : (stryCov_9fa48("1417"), "Скважина"), stryMutAct_9fa48("1418") ? "" : (stryCov_9fa48("1418"), "Дата опроса"), stryMutAct_9fa48("1419") ? "" : (stryCov_9fa48("1419"), "Напряжение"), stryMutAct_9fa48("1420") ? "" : (stryCov_9fa48("1420"), "Мощность"), stryMutAct_9fa48("1421") ? "" : (stryCov_9fa48("1421"), "Частота"), stryMutAct_9fa48("1422") ? "" : (stryCov_9fa48("1422"), "Ток"), stryMutAct_9fa48("1423") ? "" : (stryCov_9fa48("1423"), "Обороты ротора"), stryMutAct_9fa48("1424") ? "" : (stryCov_9fa48("1424"), "Температура устья")]);
            const worksheet = XLSX.utils.json_to_sheet(rows, stryMutAct_9fa48("1425") ? {} : (stryCov_9fa48("1425"), {
              header: headers
            }));
            worksheet[stryMutAct_9fa48("1426") ? "" : (stryCov_9fa48("1426"), "!cols")] = stryMutAct_9fa48("1427") ? [] : (stryCov_9fa48("1427"), [stryMutAct_9fa48("1428") ? {} : (stryCov_9fa48("1428"), {
              wch: 12
            }), stryMutAct_9fa48("1429") ? {} : (stryCov_9fa48("1429"), {
              wch: 12
            }), stryMutAct_9fa48("1430") ? {} : (stryCov_9fa48("1430"), {
              wch: 14
            }), stryMutAct_9fa48("1431") ? {} : (stryCov_9fa48("1431"), {
              wch: 14
            }), stryMutAct_9fa48("1432") ? {} : (stryCov_9fa48("1432"), {
              wch: 12
            }), stryMutAct_9fa48("1433") ? {} : (stryCov_9fa48("1433"), {
              wch: 10
            }), stryMutAct_9fa48("1434") ? {} : (stryCov_9fa48("1434"), {
              wch: 18
            }), stryMutAct_9fa48("1435") ? {} : (stryCov_9fa48("1435"), {
              wch: 18
            })]);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, stryMutAct_9fa48("1436") ? "" : (stryCov_9fa48("1436"), "Отчет ЧРП"));
            const fileName = stryMutAct_9fa48("1437") ? `` : (stryCov_9fa48("1437"), `chrp_report_${chrpReportWell}_${chrpReportStartDate}_${chrpReportEndDate}.xlsx`);
            XLSX.writeFile(workbook, fileName);
          }
        } catch (error) {
          if (stryMutAct_9fa48("1438")) {
            {}
          } else {
            stryCov_9fa48("1438");
            console.error(stryMutAct_9fa48("1439") ? "" : (stryCov_9fa48("1439"), "Error downloading CHRP report:"), error);
            setChrpReportError(stryMutAct_9fa48("1440") ? "" : (stryCov_9fa48("1440"), "Не удалось скачать отчет"));
          }
        } finally {
          if (stryMutAct_9fa48("1441")) {
            {}
          } else {
            stryCov_9fa48("1441");
            setChrpReportLoading(stryMutAct_9fa48("1442") ? true : (stryCov_9fa48("1442"), false));
          }
        }
      }
    };
    const handleDownloadAgzuReport = async () => {
      if (stryMutAct_9fa48("1443")) {
        {}
      } else {
        stryCov_9fa48("1443");
        if (stryMutAct_9fa48("1446") ? !agzuReportStartDate && !agzuReportEndDate : stryMutAct_9fa48("1445") ? false : stryMutAct_9fa48("1444") ? true : (stryCov_9fa48("1444", "1445", "1446"), (stryMutAct_9fa48("1447") ? agzuReportStartDate : (stryCov_9fa48("1447"), !agzuReportStartDate)) || (stryMutAct_9fa48("1448") ? agzuReportEndDate : (stryCov_9fa48("1448"), !agzuReportEndDate)))) {
          if (stryMutAct_9fa48("1449")) {
            {}
          } else {
            stryCov_9fa48("1449");
            setAgzuReportError(stryMutAct_9fa48("1450") ? "" : (stryCov_9fa48("1450"), "Выберите период отчета"));
            return;
          }
        }
        if (stryMutAct_9fa48("1453") ? false : stryMutAct_9fa48("1452") ? true : stryMutAct_9fa48("1451") ? agzuReportWell : (stryCov_9fa48("1451", "1452", "1453"), !agzuReportWell)) {
          if (stryMutAct_9fa48("1454")) {
            {}
          } else {
            stryCov_9fa48("1454");
            setAgzuReportError(stryMutAct_9fa48("1455") ? "" : (stryCov_9fa48("1455"), "Не выбрана скважина"));
            return;
          }
        }
        setAgzuReportError(null);
        setAgzuReportLoading(stryMutAct_9fa48("1456") ? false : (stryCov_9fa48("1456"), true));
        try {
          if (stryMutAct_9fa48("1457")) {
            {}
          } else {
            stryCov_9fa48("1457");
            const response = await fetchAgzuArchiveReport(stryMutAct_9fa48("1458") ? {} : (stryCov_9fa48("1458"), {
              startDate: agzuReportStartDate,
              endDate: agzuReportEndDate,
              well: agzuReportWell
            }));
            const rows = Array.isArray(response.data) ? response.data : stryMutAct_9fa48("1459") ? ["Stryker was here"] : (stryCov_9fa48("1459"), []);
            if (stryMutAct_9fa48("1462") ? false : stryMutAct_9fa48("1461") ? true : stryMutAct_9fa48("1460") ? rows.length : (stryCov_9fa48("1460", "1461", "1462"), !rows.length)) {
              if (stryMutAct_9fa48("1463")) {
                {}
              } else {
                stryCov_9fa48("1463");
                setAgzuReportError(stryMutAct_9fa48("1464") ? "" : (stryCov_9fa48("1464"), "Нет данных за выбранный период"));
                return;
              }
            }
            const headers = stryMutAct_9fa48("1465") ? [] : (stryCov_9fa48("1465"), [stryMutAct_9fa48("1466") ? "" : (stryCov_9fa48("1466"), "Скважина"), stryMutAct_9fa48("1467") ? "" : (stryCov_9fa48("1467"), "Дата"), stryMutAct_9fa48("1468") ? "" : (stryCov_9fa48("1468"), "Жидкость"), stryMutAct_9fa48("1469") ? "" : (stryCov_9fa48("1469"), "Нефть"), stryMutAct_9fa48("1470") ? "" : (stryCov_9fa48("1470"), "Обводненность")]);
            const worksheet = XLSX.utils.json_to_sheet(rows, stryMutAct_9fa48("1471") ? {} : (stryCov_9fa48("1471"), {
              header: headers
            }));
            worksheet[stryMutAct_9fa48("1472") ? "" : (stryCov_9fa48("1472"), "!cols")] = stryMutAct_9fa48("1473") ? [] : (stryCov_9fa48("1473"), [stryMutAct_9fa48("1474") ? {} : (stryCov_9fa48("1474"), {
              wch: 12
            }), stryMutAct_9fa48("1475") ? {} : (stryCov_9fa48("1475"), {
              wch: 12
            }), stryMutAct_9fa48("1476") ? {} : (stryCov_9fa48("1476"), {
              wch: 14
            }), stryMutAct_9fa48("1477") ? {} : (stryCov_9fa48("1477"), {
              wch: 14
            }), stryMutAct_9fa48("1478") ? {} : (stryCov_9fa48("1478"), {
              wch: 18
            })]);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, stryMutAct_9fa48("1479") ? "" : (stryCov_9fa48("1479"), "Отчет АГЗУ"));
            const fileName = stryMutAct_9fa48("1480") ? `` : (stryCov_9fa48("1480"), `agzu_report_${agzuReportWell}_${agzuReportStartDate}_${agzuReportEndDate}.xlsx`);
            XLSX.writeFile(workbook, fileName);
          }
        } catch (error) {
          if (stryMutAct_9fa48("1481")) {
            {}
          } else {
            stryCov_9fa48("1481");
            console.error(stryMutAct_9fa48("1482") ? "" : (stryCov_9fa48("1482"), "Error downloading AGZU report:"), error);
            setAgzuReportError(stryMutAct_9fa48("1483") ? "" : (stryCov_9fa48("1483"), "Не удалось скачать отчет"));
          }
        } finally {
          if (stryMutAct_9fa48("1484")) {
            {}
          } else {
            stryCov_9fa48("1484");
            setAgzuReportLoading(stryMutAct_9fa48("1485") ? true : (stryCov_9fa48("1485"), false));
          }
        }
      }
    };
    useEffect(() => {
      if (stryMutAct_9fa48("1486")) {
        {}
      } else {
        stryCov_9fa48("1486");
        if (stryMutAct_9fa48("1489") ? !showWellModal && !currentWellNumber : stryMutAct_9fa48("1488") ? false : stryMutAct_9fa48("1487") ? true : (stryCov_9fa48("1487", "1488", "1489"), (stryMutAct_9fa48("1490") ? showWellModal : (stryCov_9fa48("1490"), !showWellModal)) || (stryMutAct_9fa48("1491") ? currentWellNumber : (stryCov_9fa48("1491"), !currentWellNumber)))) return;
        const intervalId = setInterval(() => {
          if (stryMutAct_9fa48("1492")) {
            {}
          } else {
            stryCov_9fa48("1492");
            handleWellClick(currentWellNumber, currentProvidedOtvodDataRef.current, stryMutAct_9fa48("1493") ? false : (stryCov_9fa48("1493"), true));
          }
        }, 2000);
        return stryMutAct_9fa48("1494") ? () => undefined : (stryCov_9fa48("1494"), () => clearInterval(intervalId));
      }
    }, stryMutAct_9fa48("1495") ? [] : (stryCov_9fa48("1495"), [showWellModal, currentWellNumber]));
    return <div className={styles.app}>
      <AppNav user={user} onLogout={onLogout} />
      <div className={styles.mainSection}>
        <div className={styles.row}>
          <div className={styles.chartContainer}>
            <Chart type={chartType} setType={setChartType} />
          </div>
          <div className={styles.container}>
            <KPI chartType={chartType} />
          </div>
        </div>
        <div className={styles.row}>
          <div className={stryMutAct_9fa48("1496") ? `` : (stryCov_9fa48("1496"), `${styles.container} ${styles.gridAndDetailsContainer}`)}>
            <div className={styles.legendsAndDetailsContainer}>
              {(stryMutAct_9fa48("1499") ? fond != 0 : stryMutAct_9fa48("1498") ? false : stryMutAct_9fa48("1497") ? true : (stryCov_9fa48("1497", "1498", "1499"), fond == 0)) ? (stryMutAct_9fa48("1502") ? statusFilter !== "В простое" : stryMutAct_9fa48("1501") ? false : stryMutAct_9fa48("1500") ? true : (stryCov_9fa48("1500", "1501", "1502"), statusFilter === (stryMutAct_9fa48("1503") ? "" : (stryCov_9fa48("1503"), "В простое")))) ? <Legends leftTop={stryMutAct_9fa48("1504") ? "" : (stryCov_9fa48("1504"), "Номер скважины (XXX_xxxx)")} rightTop={stryMutAct_9fa48("1505") ? "" : (stryCov_9fa48("1505"), "Тех. режим по нефти (т/сут)")} middle={stryMutAct_9fa48("1506") ? "" : (stryCov_9fa48("1506"), "В простое")} leftBottom={stryMutAct_9fa48("1507") ? "" : (stryCov_9fa48("1507"), "Тех. режим по жидкости (м3/сут)")} rightBottom={stryMutAct_9fa48("1508") ? "" : (stryCov_9fa48("1508"), "Обводненность(%)")} /> : (stryMutAct_9fa48("1511") ? statusFilter !== "В бездействий" : stryMutAct_9fa48("1510") ? false : stryMutAct_9fa48("1509") ? true : (stryCov_9fa48("1509", "1510", "1511"), statusFilter === (stryMutAct_9fa48("1512") ? "" : (stryCov_9fa48("1512"), "В бездействий")))) ? <Legends leftTop={stryMutAct_9fa48("1513") ? "" : (stryCov_9fa48("1513"), "Номер скважины (XXX_xxxx)")} rightTop={stryMutAct_9fa48("1514") ? "" : (stryCov_9fa48("1514"), "Тех. режим по нефти (т/сут)")} middle={stryMutAct_9fa48("1515") ? "" : (stryCov_9fa48("1515"), "В бездействий")} leftBottom={stryMutAct_9fa48("1516") ? "" : (stryCov_9fa48("1516"), "Тех. режим по жидкости (м3/сут)")} rightBottom={stryMutAct_9fa48("1517") ? "" : (stryCov_9fa48("1517"), "Обводненность(%)")} /> : <Legends leftTop={stryMutAct_9fa48("1518") ? "" : (stryCov_9fa48("1518"), "Номер скважины (XXX_xxxx)")} rightTop={stryMutAct_9fa48("1519") ? "" : (stryCov_9fa48("1519"), "Тех. режим по нефти (т/сут)")} middle={stryMutAct_9fa48("1520") ? "" : (stryCov_9fa48("1520"), "Замер по ТМ")} leftBottom={stryMutAct_9fa48("1521") ? "" : (stryCov_9fa48("1521"), "Тех. режим по жидкости (м3/сут)")} rightBottom={stryMutAct_9fa48("1522") ? "" : (stryCov_9fa48("1522"), "Обводненность(%)")} /> : <Legends leftTop={stryMutAct_9fa48("1523") ? "" : (stryCov_9fa48("1523"), "Номер скважины (XXX_xxxx)")} rightTop={stryMutAct_9fa48("1524") ? "" : (stryCov_9fa48("1524"), "Плановая закачка")} middle={stryMutAct_9fa48("1525") ? "" : (stryCov_9fa48("1525"), "Закачка")} />}
              
              <SelectFond setFond={setFond}
              // wells={wells.filter(well => well.nagn === fond)}
              wells={wells} hideWorkingStatusLegend={stryMutAct_9fa48("1528") ? fond !== 1 : stryMutAct_9fa48("1527") ? false : stryMutAct_9fa48("1526") ? true : (stryCov_9fa48("1526", "1527", "1528"), fond === 1)} chrpFilter={chrpFilter} setChrpFilter={setChrpFilter} fond={fond} statusFilter={statusFilter} setStatusFilter={setStatusFilter} />
              
              {(stryMutAct_9fa48("1531") ? fond != 0 : stryMutAct_9fa48("1530") ? false : stryMutAct_9fa48("1529") ? true : (stryCov_9fa48("1529", "1530", "1531"), fond == 0)) ? (stryMutAct_9fa48("1534") ? statusFilter !== "В простое" : stryMutAct_9fa48("1533") ? false : stryMutAct_9fa48("1532") ? true : (stryCov_9fa48("1532", "1533", "1534"), statusFilter === (stryMutAct_9fa48("1535") ? "" : (stryCov_9fa48("1535"), "В простое")))) ? <Details leftTop={stryMutAct_9fa48("1536") ? "Stryker was here!" : (stryCov_9fa48("1536"), "")} rightTop={stryMutAct_9fa48("1537") ? "Stryker was here!" : (stryCov_9fa48("1537"), "")} leftBottom={stryMutAct_9fa48("1538") ? "Stryker was here!" : (stryCov_9fa48("1538"), "")} rightBottom={stryMutAct_9fa48("1539") ? "Stryker was here!" : (stryCov_9fa48("1539"), "")} showStatusLegend={stryMutAct_9fa48("1540") ? false : (stryCov_9fa48("1540"), true)} showIdleInMain={stryMutAct_9fa48("1541") ? true : (stryCov_9fa48("1541"), false)} /> : (stryMutAct_9fa48("1544") ? statusFilter !== "В бездействий" : stryMutAct_9fa48("1543") ? false : stryMutAct_9fa48("1542") ? true : (stryCov_9fa48("1542", "1543", "1544"), statusFilter === (stryMutAct_9fa48("1545") ? "" : (stryCov_9fa48("1545"), "В бездействий")))) ? <Details leftTop={stryMutAct_9fa48("1546") ? "Stryker was here!" : (stryCov_9fa48("1546"), "")} rightTop={stryMutAct_9fa48("1547") ? "Stryker was here!" : (stryCov_9fa48("1547"), "")} leftBottom={stryMutAct_9fa48("1548") ? "Stryker was here!" : (stryCov_9fa48("1548"), "")} rightBottom={stryMutAct_9fa48("1549") ? "Stryker was here!" : (stryCov_9fa48("1549"), "")} showStatusLegend={stryMutAct_9fa48("1550") ? true : (stryCov_9fa48("1550"), false)} showIdleInMain={stryMutAct_9fa48("1551") ? true : (stryCov_9fa48("1551"), false)} /> : <Details leftTop={stryMutAct_9fa48("1552") ? "" : (stryCov_9fa48("1552"), "-15% откл. от ТР")} rightTop={stryMutAct_9fa48("1553") ? "" : (stryCov_9fa48("1553"), "Скв. остановлена")} leftBottom={stryMutAct_9fa48("1554") ? "" : (stryCov_9fa48("1554"), "более 30%")} rightBottom={stryMutAct_9fa48("1555") ? "" : (stryCov_9fa48("1555"), "в пределах нормы")} showStatusLegend={stryMutAct_9fa48("1556") ? true : (stryCov_9fa48("1556"), false)} showIdleInMain={stryMutAct_9fa48("1557") ? false : (stryCov_9fa48("1557"), true)} /> : <Details leftTop={stryMutAct_9fa48("1558") ? "" : (stryCov_9fa48("1558"), "-15% откл.")} leftBottom={stryMutAct_9fa48("1559") ? "" : (stryCov_9fa48("1559"), "более 30% откл.")} showStatusLegend={stryMutAct_9fa48("1560") ? true : (stryCov_9fa48("1560"), false)} showIdleInMain={stryMutAct_9fa48("1561") ? true : (stryCov_9fa48("1561"), false)} />}
            </div>
            <Grid wells={filteredWells} fieldMappings={fieldMappings} calculateMiddleValue={calculateMiddleValue} maxThreshold={(stryMutAct_9fa48("1564") ? fond !== 0 : stryMutAct_9fa48("1563") ? false : stryMutAct_9fa48("1562") ? true : (stryCov_9fa48("1562", "1563", "1564"), fond === 0)) ? 15 : 30} colorMax={stryMutAct_9fa48("1565") ? "" : (stryCov_9fa48("1565"), 'greenCard')} minThreshold={stryMutAct_9fa48("1566") ? +30 : (stryCov_9fa48("1566"), -30)} colorMin={stryMutAct_9fa48("1567") ? "" : (stryCov_9fa48("1567"), 'redCard')} inBetweenThresholdMin={stryMutAct_9fa48("1568") ? +30 : (stryCov_9fa48("1568"), -30)} inBetweenColor={stryMutAct_9fa48("1569") ? "" : (stryCov_9fa48("1569"), 'orangeCard')} inBetweenThresholdMax={stryMutAct_9fa48("1570") ? +15 : (stryCov_9fa48("1570"), -15)} realMiddle={stryMutAct_9fa48("1571") ? false : (stryCov_9fa48("1571"), true)} onWellClick={(stryMutAct_9fa48("1574") ? fond !== 0 : stryMutAct_9fa48("1573") ? false : stryMutAct_9fa48("1572") ? true : (stryCov_9fa48("1572", "1573", "1574"), fond === 0)) ? handleWellClick : undefined} hideWorkingStatus={stryMutAct_9fa48("1577") ? fond !== 1 : stryMutAct_9fa48("1576") ? false : stryMutAct_9fa48("1575") ? true : (stryCov_9fa48("1575", "1576", "1577"), fond === 1)} isWellStopped={isWellStopped} fond={fond} chrpFilter={chrpFilter} chartType={chartType} statusFilter={statusFilter} />
          </div>
          <div className={styles.container}>
            {(stryMutAct_9fa48("1580") ? fond !== 0 : stryMutAct_9fa48("1579") ? false : stryMutAct_9fa48("1578") ? true : (stryCov_9fa48("1578", "1579", "1580"), fond === 0)) ? <AGZU wells={wellsForComponents} index={2} handleWellClick={handleWellClick} setCurrentOtvodWell={setCurrentOtvodWell} setCurrentOtvodData={setCurrentOtvodData} /> : <VRP wells={wellsForComponents} />}
          </div>
        </div>
      </div>

      {stryMutAct_9fa48("1583") ? showWellModal || <Modal onClose={handleCloseWellModal}>
          <div style={{
          padding: "20px"
        }}>
            <h2 style={{
            marginTop: 0,
            marginBottom: "20px",
            fontSize: "24px",
            color: "white"
          }}>
              {wellModalTitle}
            </h2>
            
            <div style={{
            display: 'flex',
            gap: '30px',
            flexWrap: 'wrap'
          }}>
              {(() => {
              const selectedWell = wells.find(well => well.well === currentWellNumber);
              const isChrpWell = selectedWell?.type === 1;
              return isChrpWell;
            })() && <div style={{
              flex: '1',
              minWidth: '300px'
            }}>
                  <div className={styles.chrpHeaderRow}>
                    <h3 style={{
                  color: 'white',
                  marginTop: 0,
                  marginBottom: 0,
                  fontSize: '18px'
                }}>
                      Данные ЧРП
                    </h3>
                    <button type="button" className={styles.iconButton} onClick={handleOpenChrpReportModal} aria-label="Скачать отчет ЧРП" title="Скачать отчет ЧРП">
                      ⬇
                    </button>
                  </div>
                  {wellModalLoading ? <div style={{
                color: "white",
                textAlign: "center",
                padding: "20px"
              }}>
                      Загрузка данных скважины...
                    </div> : wellModalData.length > 0 && <div style={{
                overflow: "auto",
                maxHeight: "60vh"
              }}>
                        <ResponsiveTable data={wellModalData} />
                      </div>}
                </div>}

              <div style={{
              flex: '1',
              minWidth: '300px'
            }}>
                <div className={styles.chrpHeaderRow}>
                  <h3 style={{
                  color: 'white',
                  marginTop: 0,
                  marginBottom: 0,
                  fontSize: '18px'
                }}>
                    Данные АГЗУ
                  </h3>
                  <button type="button" className={styles.iconButton} onClick={handleOpenAgzuReportModal} aria-label="Скачать отчет АГЗУ" title="Скачать отчет АГЗУ">
                    ⬇
                  </button>
                </div>
                {agzuModalLoading ? <div style={{
                color: "white",
                textAlign: "center",
                padding: "20px"
              }}>
                    Загрузка данных АГЗУ...
                  </div> : agzuModalData.length > 0 ? <div style={{
                overflow: "auto",
                maxHeight: "60vh"
              }}>
                    <ResponsiveTable data={agzuModalData} />
                  </div> : <div style={{
                color: "#999",
                textAlign: "center",
                padding: "20px",
                fontStyle: 'italic'
              }}>
                    Данные АГЗУ недоступны для этой скважины
                  </div>}
              </div>
            </div>
          </div>
        </Modal> : stryMutAct_9fa48("1582") ? false : stryMutAct_9fa48("1581") ? true : (stryCov_9fa48("1581", "1582", "1583"), showWellModal && <Modal onClose={handleCloseWellModal}>
          <div style={stryMutAct_9fa48("1584") ? {} : (stryCov_9fa48("1584"), {
          padding: stryMutAct_9fa48("1585") ? "" : (stryCov_9fa48("1585"), "20px")
        })}>
            <h2 style={stryMutAct_9fa48("1586") ? {} : (stryCov_9fa48("1586"), {
            marginTop: 0,
            marginBottom: stryMutAct_9fa48("1587") ? "" : (stryCov_9fa48("1587"), "20px"),
            fontSize: stryMutAct_9fa48("1588") ? "" : (stryCov_9fa48("1588"), "24px"),
            color: stryMutAct_9fa48("1589") ? "" : (stryCov_9fa48("1589"), "white")
          })}>
              {wellModalTitle}
            </h2>
            
            <div style={stryMutAct_9fa48("1590") ? {} : (stryCov_9fa48("1590"), {
            display: stryMutAct_9fa48("1591") ? "" : (stryCov_9fa48("1591"), 'flex'),
            gap: stryMutAct_9fa48("1592") ? "" : (stryCov_9fa48("1592"), '30px'),
            flexWrap: stryMutAct_9fa48("1593") ? "" : (stryCov_9fa48("1593"), 'wrap')
          })}>
              {stryMutAct_9fa48("1596") ? (() => {
              const selectedWell = wells.find(well => well.well === currentWellNumber);
              const isChrpWell = selectedWell?.type === 1;
              return isChrpWell;
            })() || <div style={{
              flex: '1',
              minWidth: '300px'
            }}>
                  <div className={styles.chrpHeaderRow}>
                    <h3 style={{
                  color: 'white',
                  marginTop: 0,
                  marginBottom: 0,
                  fontSize: '18px'
                }}>
                      Данные ЧРП
                    </h3>
                    <button type="button" className={styles.iconButton} onClick={handleOpenChrpReportModal} aria-label="Скачать отчет ЧРП" title="Скачать отчет ЧРП">
                      ⬇
                    </button>
                  </div>
                  {wellModalLoading ? <div style={{
                color: "white",
                textAlign: "center",
                padding: "20px"
              }}>
                      Загрузка данных скважины...
                    </div> : wellModalData.length > 0 && <div style={{
                overflow: "auto",
                maxHeight: "60vh"
              }}>
                        <ResponsiveTable data={wellModalData} />
                      </div>}
                </div> : stryMutAct_9fa48("1595") ? false : stryMutAct_9fa48("1594") ? true : (stryCov_9fa48("1594", "1595", "1596"), (() => {
              if (stryMutAct_9fa48("1597")) {
                {}
              } else {
                stryCov_9fa48("1597");
                const selectedWell = wells.find(stryMutAct_9fa48("1598") ? () => undefined : (stryCov_9fa48("1598"), well => stryMutAct_9fa48("1601") ? well.well !== currentWellNumber : stryMutAct_9fa48("1600") ? false : stryMutAct_9fa48("1599") ? true : (stryCov_9fa48("1599", "1600", "1601"), well.well === currentWellNumber)));
                const isChrpWell = stryMutAct_9fa48("1604") ? selectedWell?.type !== 1 : stryMutAct_9fa48("1603") ? false : stryMutAct_9fa48("1602") ? true : (stryCov_9fa48("1602", "1603", "1604"), (stryMutAct_9fa48("1605") ? selectedWell.type : (stryCov_9fa48("1605"), selectedWell?.type)) === 1);
                return isChrpWell;
              }
            })() && <div style={stryMutAct_9fa48("1606") ? {} : (stryCov_9fa48("1606"), {
              flex: stryMutAct_9fa48("1607") ? "" : (stryCov_9fa48("1607"), '1'),
              minWidth: stryMutAct_9fa48("1608") ? "" : (stryCov_9fa48("1608"), '300px')
            })}>
                  <div className={styles.chrpHeaderRow}>
                    <h3 style={stryMutAct_9fa48("1609") ? {} : (stryCov_9fa48("1609"), {
                  color: stryMutAct_9fa48("1610") ? "" : (stryCov_9fa48("1610"), 'white'),
                  marginTop: 0,
                  marginBottom: 0,
                  fontSize: stryMutAct_9fa48("1611") ? "" : (stryCov_9fa48("1611"), '18px')
                })}>
                      Данные ЧРП
                    </h3>
                    <button type="button" className={styles.iconButton} onClick={handleOpenChrpReportModal} aria-label="Скачать отчет ЧРП" title="Скачать отчет ЧРП">
                      ⬇
                    </button>
                  </div>
                  {wellModalLoading ? <div style={stryMutAct_9fa48("1612") ? {} : (stryCov_9fa48("1612"), {
                color: stryMutAct_9fa48("1613") ? "" : (stryCov_9fa48("1613"), "white"),
                textAlign: stryMutAct_9fa48("1614") ? "" : (stryCov_9fa48("1614"), "center"),
                padding: stryMutAct_9fa48("1615") ? "" : (stryCov_9fa48("1615"), "20px")
              })}>
                      Загрузка данных скважины...
                    </div> : stryMutAct_9fa48("1618") ? wellModalData.length > 0 || <div style={{
                overflow: "auto",
                maxHeight: "60vh"
              }}>
                        <ResponsiveTable data={wellModalData} />
                      </div> : stryMutAct_9fa48("1617") ? false : stryMutAct_9fa48("1616") ? true : (stryCov_9fa48("1616", "1617", "1618"), (stryMutAct_9fa48("1621") ? wellModalData.length <= 0 : stryMutAct_9fa48("1620") ? wellModalData.length >= 0 : stryMutAct_9fa48("1619") ? true : (stryCov_9fa48("1619", "1620", "1621"), wellModalData.length > 0)) && <div style={stryMutAct_9fa48("1622") ? {} : (stryCov_9fa48("1622"), {
                overflow: stryMutAct_9fa48("1623") ? "" : (stryCov_9fa48("1623"), "auto"),
                maxHeight: stryMutAct_9fa48("1624") ? "" : (stryCov_9fa48("1624"), "60vh")
              })}>
                        <ResponsiveTable data={wellModalData} />
                      </div>)}
                </div>)}

              <div style={stryMutAct_9fa48("1625") ? {} : (stryCov_9fa48("1625"), {
              flex: stryMutAct_9fa48("1626") ? "" : (stryCov_9fa48("1626"), '1'),
              minWidth: stryMutAct_9fa48("1627") ? "" : (stryCov_9fa48("1627"), '300px')
            })}>
                <div className={styles.chrpHeaderRow}>
                  <h3 style={stryMutAct_9fa48("1628") ? {} : (stryCov_9fa48("1628"), {
                  color: stryMutAct_9fa48("1629") ? "" : (stryCov_9fa48("1629"), 'white'),
                  marginTop: 0,
                  marginBottom: 0,
                  fontSize: stryMutAct_9fa48("1630") ? "" : (stryCov_9fa48("1630"), '18px')
                })}>
                    Данные АГЗУ
                  </h3>
                  <button type="button" className={styles.iconButton} onClick={handleOpenAgzuReportModal} aria-label="Скачать отчет АГЗУ" title="Скачать отчет АГЗУ">
                    ⬇
                  </button>
                </div>
                {agzuModalLoading ? <div style={stryMutAct_9fa48("1631") ? {} : (stryCov_9fa48("1631"), {
                color: stryMutAct_9fa48("1632") ? "" : (stryCov_9fa48("1632"), "white"),
                textAlign: stryMutAct_9fa48("1633") ? "" : (stryCov_9fa48("1633"), "center"),
                padding: stryMutAct_9fa48("1634") ? "" : (stryCov_9fa48("1634"), "20px")
              })}>
                    Загрузка данных АГЗУ...
                  </div> : (stryMutAct_9fa48("1638") ? agzuModalData.length <= 0 : stryMutAct_9fa48("1637") ? agzuModalData.length >= 0 : stryMutAct_9fa48("1636") ? false : stryMutAct_9fa48("1635") ? true : (stryCov_9fa48("1635", "1636", "1637", "1638"), agzuModalData.length > 0)) ? <div style={stryMutAct_9fa48("1639") ? {} : (stryCov_9fa48("1639"), {
                overflow: stryMutAct_9fa48("1640") ? "" : (stryCov_9fa48("1640"), "auto"),
                maxHeight: stryMutAct_9fa48("1641") ? "" : (stryCov_9fa48("1641"), "60vh")
              })}>
                    <ResponsiveTable data={agzuModalData} />
                  </div> : <div style={stryMutAct_9fa48("1642") ? {} : (stryCov_9fa48("1642"), {
                color: stryMutAct_9fa48("1643") ? "" : (stryCov_9fa48("1643"), "#999"),
                textAlign: stryMutAct_9fa48("1644") ? "" : (stryCov_9fa48("1644"), "center"),
                padding: stryMutAct_9fa48("1645") ? "" : (stryCov_9fa48("1645"), "20px"),
                fontStyle: stryMutAct_9fa48("1646") ? "" : (stryCov_9fa48("1646"), 'italic')
              })}>
                    Данные АГЗУ недоступны для этой скважины
                  </div>}
              </div>
            </div>
          </div>
        </Modal>)}

      {stryMutAct_9fa48("1649") ? showChrpReportModal || <Modal onClose={handleCloseChrpReportModal}>
          <div className={styles.reportModalContent}>
            <h3 className={styles.reportModalTitle}>Отчет ЧРП</h3>
            <div className={styles.reportWellInfo}>
              Скважина: <strong>{chrpReportWell}</strong>
            </div>
            <div className={styles.reportControls}>
              <label className={styles.reportLabel}>
                Дата начала
                <input type="date" value={chrpReportStartDate} onChange={e => {
                setChrpReportStartDate(e.target.value);
                setChrpReportError(null);
              }} className={styles.dateInput} />
              </label>
              <label className={styles.reportLabel}>
                Дата окончания
                <input type="date" value={chrpReportEndDate} min={chrpReportStartDate || undefined} onChange={e => {
                setChrpReportEndDate(e.target.value);
                setChrpReportError(null);
              }} className={styles.dateInput} />
              </label>
            </div>
            {chrpReportError && <div className={styles.reportError}>{chrpReportError}</div>}
            <div className={styles.reportActions}>
              <button type="button" className={styles.secondaryButton} onClick={handleCloseChrpReportModal}>
                Закрыть
              </button>
              <button type="button" className={styles.downloadButton} onClick={handleDownloadChrpReport} disabled={chrpReportLoading || !chrpReportStartDate || !chrpReportEndDate}>
                {chrpReportLoading ? "Экспорт..." : "Скачать отчет"}
              </button>
            </div>
          </div>
        </Modal> : stryMutAct_9fa48("1648") ? false : stryMutAct_9fa48("1647") ? true : (stryCov_9fa48("1647", "1648", "1649"), showChrpReportModal && <Modal onClose={handleCloseChrpReportModal}>
          <div className={styles.reportModalContent}>
            <h3 className={styles.reportModalTitle}>Отчет ЧРП</h3>
            <div className={styles.reportWellInfo}>
              Скважина: <strong>{chrpReportWell}</strong>
            </div>
            <div className={styles.reportControls}>
              <label className={styles.reportLabel}>
                Дата начала
                <input type="date" value={chrpReportStartDate} onChange={e => {
                if (stryMutAct_9fa48("1650")) {
                  {}
                } else {
                  stryCov_9fa48("1650");
                  setChrpReportStartDate(e.target.value);
                  setChrpReportError(null);
                }
              }} className={styles.dateInput} />
              </label>
              <label className={styles.reportLabel}>
                Дата окончания
                <input type="date" value={chrpReportEndDate} min={stryMutAct_9fa48("1653") ? chrpReportStartDate && undefined : stryMutAct_9fa48("1652") ? false : stryMutAct_9fa48("1651") ? true : (stryCov_9fa48("1651", "1652", "1653"), chrpReportStartDate || undefined)} onChange={e => {
                if (stryMutAct_9fa48("1654")) {
                  {}
                } else {
                  stryCov_9fa48("1654");
                  setChrpReportEndDate(e.target.value);
                  setChrpReportError(null);
                }
              }} className={styles.dateInput} />
              </label>
            </div>
            {stryMutAct_9fa48("1657") ? chrpReportError || <div className={styles.reportError}>{chrpReportError}</div> : stryMutAct_9fa48("1656") ? false : stryMutAct_9fa48("1655") ? true : (stryCov_9fa48("1655", "1656", "1657"), chrpReportError && <div className={styles.reportError}>{chrpReportError}</div>)}
            <div className={styles.reportActions}>
              <button type="button" className={styles.secondaryButton} onClick={handleCloseChrpReportModal}>
                Закрыть
              </button>
              <button type="button" className={styles.downloadButton} onClick={handleDownloadChrpReport} disabled={stryMutAct_9fa48("1660") ? (chrpReportLoading || !chrpReportStartDate) && !chrpReportEndDate : stryMutAct_9fa48("1659") ? false : stryMutAct_9fa48("1658") ? true : (stryCov_9fa48("1658", "1659", "1660"), (stryMutAct_9fa48("1662") ? chrpReportLoading && !chrpReportStartDate : stryMutAct_9fa48("1661") ? false : (stryCov_9fa48("1661", "1662"), chrpReportLoading || (stryMutAct_9fa48("1663") ? chrpReportStartDate : (stryCov_9fa48("1663"), !chrpReportStartDate)))) || (stryMutAct_9fa48("1664") ? chrpReportEndDate : (stryCov_9fa48("1664"), !chrpReportEndDate)))}>
                {chrpReportLoading ? stryMutAct_9fa48("1665") ? "" : (stryCov_9fa48("1665"), "Экспорт...") : stryMutAct_9fa48("1666") ? "" : (stryCov_9fa48("1666"), "Скачать отчет")}
              </button>
            </div>
          </div>
        </Modal>)}

      {stryMutAct_9fa48("1669") ? showAgzuReportModal || <Modal onClose={handleCloseAgzuReportModal}>
          <div className={styles.reportModalContent}>
            <h3 className={styles.reportModalTitle}>Отчет АГЗУ</h3>
            <div className={styles.reportWellInfo}>
              Скважина: <strong>{agzuReportWell}</strong>
            </div>
            <div className={styles.reportControls}>
              <label className={styles.reportLabel}>
                Дата начала
                <input type="date" value={agzuReportStartDate} onChange={e => {
                setAgzuReportStartDate(e.target.value);
                setAgzuReportError(null);
              }} className={styles.dateInput} />
              </label>
              <label className={styles.reportLabel}>
                Дата окончания
                <input type="date" value={agzuReportEndDate} min={agzuReportStartDate || undefined} onChange={e => {
                setAgzuReportEndDate(e.target.value);
                setAgzuReportError(null);
              }} className={styles.dateInput} />
              </label>
            </div>
            {agzuReportError && <div className={styles.reportError}>{agzuReportError}</div>}
            <div className={styles.reportActions}>
              <button type="button" className={styles.secondaryButton} onClick={handleCloseAgzuReportModal}>
                Закрыть
              </button>
              <button type="button" className={styles.downloadButton} onClick={handleDownloadAgzuReport} disabled={agzuReportLoading || !agzuReportStartDate || !agzuReportEndDate}>
                {agzuReportLoading ? "Экспорт..." : "Скачать отчет"}
              </button>
            </div>
          </div>
        </Modal> : stryMutAct_9fa48("1668") ? false : stryMutAct_9fa48("1667") ? true : (stryCov_9fa48("1667", "1668", "1669"), showAgzuReportModal && <Modal onClose={handleCloseAgzuReportModal}>
          <div className={styles.reportModalContent}>
            <h3 className={styles.reportModalTitle}>Отчет АГЗУ</h3>
            <div className={styles.reportWellInfo}>
              Скважина: <strong>{agzuReportWell}</strong>
            </div>
            <div className={styles.reportControls}>
              <label className={styles.reportLabel}>
                Дата начала
                <input type="date" value={agzuReportStartDate} onChange={e => {
                if (stryMutAct_9fa48("1670")) {
                  {}
                } else {
                  stryCov_9fa48("1670");
                  setAgzuReportStartDate(e.target.value);
                  setAgzuReportError(null);
                }
              }} className={styles.dateInput} />
              </label>
              <label className={styles.reportLabel}>
                Дата окончания
                <input type="date" value={agzuReportEndDate} min={stryMutAct_9fa48("1673") ? agzuReportStartDate && undefined : stryMutAct_9fa48("1672") ? false : stryMutAct_9fa48("1671") ? true : (stryCov_9fa48("1671", "1672", "1673"), agzuReportStartDate || undefined)} onChange={e => {
                if (stryMutAct_9fa48("1674")) {
                  {}
                } else {
                  stryCov_9fa48("1674");
                  setAgzuReportEndDate(e.target.value);
                  setAgzuReportError(null);
                }
              }} className={styles.dateInput} />
              </label>
            </div>
            {stryMutAct_9fa48("1677") ? agzuReportError || <div className={styles.reportError}>{agzuReportError}</div> : stryMutAct_9fa48("1676") ? false : stryMutAct_9fa48("1675") ? true : (stryCov_9fa48("1675", "1676", "1677"), agzuReportError && <div className={styles.reportError}>{agzuReportError}</div>)}
            <div className={styles.reportActions}>
              <button type="button" className={styles.secondaryButton} onClick={handleCloseAgzuReportModal}>
                Закрыть
              </button>
              <button type="button" className={styles.downloadButton} onClick={handleDownloadAgzuReport} disabled={stryMutAct_9fa48("1680") ? (agzuReportLoading || !agzuReportStartDate) && !agzuReportEndDate : stryMutAct_9fa48("1679") ? false : stryMutAct_9fa48("1678") ? true : (stryCov_9fa48("1678", "1679", "1680"), (stryMutAct_9fa48("1682") ? agzuReportLoading && !agzuReportStartDate : stryMutAct_9fa48("1681") ? false : (stryCov_9fa48("1681", "1682"), agzuReportLoading || (stryMutAct_9fa48("1683") ? agzuReportStartDate : (stryCov_9fa48("1683"), !agzuReportStartDate)))) || (stryMutAct_9fa48("1684") ? agzuReportEndDate : (stryCov_9fa48("1684"), !agzuReportEndDate)))}>
                {agzuReportLoading ? stryMutAct_9fa48("1685") ? "" : (stryCov_9fa48("1685"), "Экспорт...") : stryMutAct_9fa48("1686") ? "" : (stryCov_9fa48("1686"), "Скачать отчет")}
              </button>
            </div>
          </div>
        </Modal>)}
    </div>;
  }
}