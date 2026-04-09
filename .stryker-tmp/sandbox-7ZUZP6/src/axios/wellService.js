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
import api from "./api";
export const fetch2Hours = (oilField = stryMutAct_9fa48("7") ? "" : (stryCov_9fa48("7"), 'BSK')) => {
  if (stryMutAct_9fa48("8")) {
    {}
  } else {
    stryCov_9fa48("8");
    return api.get(stryMutAct_9fa48("9") ? "" : (stryCov_9fa48("9"), "/2hours"), stryMutAct_9fa48("10") ? {} : (stryCov_9fa48("10"), {
      params: stryMutAct_9fa48("11") ? {} : (stryCov_9fa48("11"), {
        oil_field: oilField
      })
    }));
  }
};
export const fetch2HoursArchive = (oilField = stryMutAct_9fa48("12") ? "" : (stryCov_9fa48("12"), 'BSK'), date) => {
  if (stryMutAct_9fa48("13")) {
    {}
  } else {
    stryCov_9fa48("13");
    return api.get(stryMutAct_9fa48("14") ? "" : (stryCov_9fa48("14"), "/2hours/archive"), stryMutAct_9fa48("15") ? {} : (stryCov_9fa48("15"), {
      params: stryMutAct_9fa48("16") ? {} : (stryCov_9fa48("16"), {
        oil_field: oilField,
        date: date
      })
    }));
  }
};
export const getAvailableArchiveDates = (oilField = stryMutAct_9fa48("17") ? "" : (stryCov_9fa48("17"), 'BSK')) => {
  if (stryMutAct_9fa48("18")) {
    {}
  } else {
    stryCov_9fa48("18");
    return api.get(stryMutAct_9fa48("19") ? "" : (stryCov_9fa48("19"), "/2hours/archive/dates"), stryMutAct_9fa48("20") ? {} : (stryCov_9fa48("20"), {
      params: stryMutAct_9fa48("21") ? {} : (stryCov_9fa48("21"), {
        oil_field: oilField
      })
    }));
  }
};
export const fetchWells = () => {
  if (stryMutAct_9fa48("22")) {
    {}
  } else {
    stryCov_9fa48("22");
    return api.get(stryMutAct_9fa48("23") ? "" : (stryCov_9fa48("23"), "/wells"));
  }
};
export const fetchWellsABC = () => {
  if (stryMutAct_9fa48("24")) {
    {}
  } else {
    stryCov_9fa48("24");
    return api.get(stryMutAct_9fa48("25") ? "" : (stryCov_9fa48("25"), "/wells/abc"));
  }
};
export const fetchABCByWell = () => {
  if (stryMutAct_9fa48("26")) {
    {}
  } else {
    stryCov_9fa48("26");
    return api.get(stryMutAct_9fa48("27") ? "" : (stryCov_9fa48("27"), "/wells/abc/"));
  }
};
export const fetchLast10Wells = () => {
  if (stryMutAct_9fa48("28")) {
    {}
  } else {
    stryCov_9fa48("28");
    return api.get(stryMutAct_9fa48("29") ? "" : (stryCov_9fa48("29"), "/well/last10"));
  }
};
export const fetchWellData = wellName => {
  if (stryMutAct_9fa48("30")) {
    {}
  } else {
    stryCov_9fa48("30");
    return api.get(stryMutAct_9fa48("31") ? "" : (stryCov_9fa48("31"), "/well/data"), stryMutAct_9fa48("32") ? {} : (stryCov_9fa48("32"), {
      params: stryMutAct_9fa48("33") ? {} : (stryCov_9fa48("33"), {
        well: wellName
      })
    }));
  }
};
export const fetchBSKWells = () => {
  if (stryMutAct_9fa48("34")) {
    {}
  } else {
    stryCov_9fa48("34");
    return api.get(stryMutAct_9fa48("35") ? "" : (stryCov_9fa48("35"), "/wells/bsk"));
  }
};
export const fetchProgressOil = () => {
  if (stryMutAct_9fa48("36")) {
    {}
  } else {
    stryCov_9fa48("36");
    return api.get(stryMutAct_9fa48("37") ? "" : (stryCov_9fa48("37"), "/progress-oil"));
  }
};
export const fetchLastUpdate = () => {
  if (stryMutAct_9fa48("38")) {
    {}
  } else {
    stryCov_9fa48("38");
    return api.get(stryMutAct_9fa48("39") ? "" : (stryCov_9fa48("39"), "/wells/last-update"));
  }
};
export const fetchChrpArchiveReport = ({
  startDate,
  endDate,
  well
}) => {
  if (stryMutAct_9fa48("40")) {
    {}
  } else {
    stryCov_9fa48("40");
    return api.get(stryMutAct_9fa48("41") ? "" : (stryCov_9fa48("41"), "/chrp/archive/report"), stryMutAct_9fa48("42") ? {} : (stryCov_9fa48("42"), {
      params: stryMutAct_9fa48("43") ? {} : (stryCov_9fa48("43"), {
        startDate,
        endDate,
        well
      })
    }));
  }
};
export const fetchAgzuArchiveReport = ({
  startDate,
  endDate,
  well
}) => {
  if (stryMutAct_9fa48("44")) {
    {}
  } else {
    stryCov_9fa48("44");
    return api.get(stryMutAct_9fa48("45") ? "" : (stryCov_9fa48("45"), "/agzu/archive/report"), stryMutAct_9fa48("46") ? {} : (stryCov_9fa48("46"), {
      params: stryMutAct_9fa48("47") ? {} : (stryCov_9fa48("47"), {
        startDate,
        endDate,
        well
      })
    }));
  }
};
export const getAvailableVlagomerDates = () => {
  if (stryMutAct_9fa48("48")) {
    {}
  } else {
    stryCov_9fa48("48");
    return api.get(stryMutAct_9fa48("49") ? "" : (stryCov_9fa48("49"), "/vlagomer-history/dates"));
  }
};
export const fetchVlagomerHistory = (date = null) => {
  if (stryMutAct_9fa48("50")) {
    {}
  } else {
    stryCov_9fa48("50");
    const url = date ? stryMutAct_9fa48("51") ? `` : (stryCov_9fa48("51"), `/vlagomer-history/${date}`) : stryMutAct_9fa48("52") ? "" : (stryCov_9fa48("52"), "/vlagomer-history");
    return api.get(url);
  }
};
export const fetchKPIProduction = () => {
  if (stryMutAct_9fa48("53")) {
    {}
  } else {
    stryCov_9fa48("53");
    return api.get(stryMutAct_9fa48("54") ? "" : (stryCov_9fa48("54"), "/kpi/production"));
  }
};
export const fetchKPIInjection = () => {
  if (stryMutAct_9fa48("55")) {
    {}
  } else {
    stryCov_9fa48("55");
    return api.get(stryMutAct_9fa48("56") ? "" : (stryCov_9fa48("56"), "/kpi/injection"));
  }
};
export const fetchOilLossData = (params = {}) => {
  if (stryMutAct_9fa48("57")) {
    {}
  } else {
    stryCov_9fa48("57");
    return api.get(stryMutAct_9fa48("58") ? "" : (stryCov_9fa48("58"), "/oil-loss"), stryMutAct_9fa48("59") ? {} : (stryCov_9fa48("59"), {
      params: stryMutAct_9fa48("60") ? {} : (stryCov_9fa48("60"), {
        well: params.well,
        startDate: params.startDate,
        endDate: params.endDate
      })
    }));
  }
};
export const fetchOilLossWells = () => {
  if (stryMutAct_9fa48("61")) {
    {}
  } else {
    stryCov_9fa48("61");
    return api.get(stryMutAct_9fa48("62") ? "" : (stryCov_9fa48("62"), "/oil-loss/wells"));
  }
};
export const analyzeOilLoss = data => {
  if (stryMutAct_9fa48("63")) {
    {}
  } else {
    stryCov_9fa48("63");
    return api.post(stryMutAct_9fa48("64") ? "" : (stryCov_9fa48("64"), "/oil-loss/analysis"), data);
  }
};
export const login = credentials => {
  if (stryMutAct_9fa48("65")) {
    {}
  } else {
    stryCov_9fa48("65");
    return api.post(stryMutAct_9fa48("66") ? "" : (stryCov_9fa48("66"), "/auth/login"), credentials);
  }
};
export const fetchUsers = () => {
  if (stryMutAct_9fa48("67")) {
    {}
  } else {
    stryCov_9fa48("67");
    return api.get(stryMutAct_9fa48("68") ? "" : (stryCov_9fa48("68"), "/admin/users"));
  }
};
export const createUser = userData => {
  if (stryMutAct_9fa48("69")) {
    {}
  } else {
    stryCov_9fa48("69");
    return api.post(stryMutAct_9fa48("70") ? "" : (stryCov_9fa48("70"), "/admin/users"), userData);
  }
};
export const deleteUser = userId => {
  if (stryMutAct_9fa48("71")) {
    {}
  } else {
    stryCov_9fa48("71");
    return api.delete(stryMutAct_9fa48("72") ? `` : (stryCov_9fa48("72"), `/admin/users/${userId}`));
  }
};
export const updateUser = (userId, userData) => {
  if (stryMutAct_9fa48("73")) {
    {}
  } else {
    stryCov_9fa48("73");
    return api.put(stryMutAct_9fa48("74") ? `` : (stryCov_9fa48("74"), `/admin/users/${userId}`), userData);
  }
};
export const fetchAGZUCategories = () => {
  if (stryMutAct_9fa48("75")) {
    {}
  } else {
    stryCov_9fa48("75");
    return api.get(stryMutAct_9fa48("76") ? "" : (stryCov_9fa48("76"), "/agzu/categories"));
  }
};
export const fetchAGZUTags = category => {
  if (stryMutAct_9fa48("77")) {
    {}
  } else {
    stryCov_9fa48("77");
    return api.get(stryMutAct_9fa48("78") ? `` : (stryCov_9fa48("78"), `/agzu/tags/${encodeURIComponent(category)}`));
  }
};
export const fetchAGZUWellData = wellName => {
  if (stryMutAct_9fa48("79")) {
    {}
  } else {
    stryCov_9fa48("79");
    return api.get(stryMutAct_9fa48("80") ? "" : (stryCov_9fa48("80"), "/well/agzu-data"), stryMutAct_9fa48("81") ? {} : (stryCov_9fa48("81"), {
      params: stryMutAct_9fa48("82") ? {} : (stryCov_9fa48("82"), {
        well: wellName
      })
    }));
  }
};
export const fetchNotifications = (params = {}) => {
  if (stryMutAct_9fa48("83")) {
    {}
  } else {
    stryCov_9fa48("83");
    return api.get(stryMutAct_9fa48("84") ? "" : (stryCov_9fa48("84"), "/notifications"), stryMutAct_9fa48("85") ? {} : (stryCov_9fa48("85"), {
      params: stryMutAct_9fa48("86") ? {} : (stryCov_9fa48("86"), {
        status: stryMutAct_9fa48("89") ? params.status && 'open' : stryMutAct_9fa48("88") ? false : stryMutAct_9fa48("87") ? true : (stryCov_9fa48("87", "88", "89"), params.status || (stryMutAct_9fa48("90") ? "" : (stryCov_9fa48("90"), 'open'))),
        oil_field: params.oil_field,
        limit: stryMutAct_9fa48("93") ? params.limit && 50 : stryMutAct_9fa48("92") ? false : stryMutAct_9fa48("91") ? true : (stryCov_9fa48("91", "92", "93"), params.limit || 50)
      })
    }));
  }
};
export const fetchNotificationCount = (params = {}) => {
  if (stryMutAct_9fa48("94")) {
    {}
  } else {
    stryCov_9fa48("94");
    return api.get(stryMutAct_9fa48("95") ? "" : (stryCov_9fa48("95"), "/notifications/count"), stryMutAct_9fa48("96") ? {} : (stryCov_9fa48("96"), {
      params: stryMutAct_9fa48("97") ? {} : (stryCov_9fa48("97"), {
        status: stryMutAct_9fa48("100") ? params.status && 'open' : stryMutAct_9fa48("99") ? false : stryMutAct_9fa48("98") ? true : (stryCov_9fa48("98", "99", "100"), params.status || (stryMutAct_9fa48("101") ? "" : (stryCov_9fa48("101"), 'open'))),
        oil_field: params.oil_field
      })
    }));
  }
};
export const checkWellStatus = () => {
  if (stryMutAct_9fa48("102")) {
    {}
  } else {
    stryCov_9fa48("102");
    return axiosInstance.get(stryMutAct_9fa48("103") ? "" : (stryCov_9fa48("103"), '/wells/check-status'));
  }
};
export const createNotification = notificationData => {
  if (stryMutAct_9fa48("104")) {
    {}
  } else {
    stryCov_9fa48("104");
    return axiosInstance.post(stryMutAct_9fa48("105") ? "" : (stryCov_9fa48("105"), '/notifications/create'), notificationData);
  }
};
export const updateNotificationStatus = (notificationId, status) => {
  if (stryMutAct_9fa48("106")) {
    {}
  } else {
    stryCov_9fa48("106");
    return api.put(stryMutAct_9fa48("107") ? `` : (stryCov_9fa48("107"), `/notifications/${notificationId}/status`), stryMutAct_9fa48("108") ? {} : (stryCov_9fa48("108"), {
      status
    }));
  }
};