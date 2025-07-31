import api from "./api";

export const fetch2Hours = (oilField = 'BSK') => {
  return api.get("/2hours", {
    params: { oil_field: oilField }
  });
};

export const fetch2HoursArchive = (oilField = 'BSK', date) => {
  return api.get("/2hours/archive", {
    params: { 
      oil_field: oilField,
      date: date
    }
  });
};

export const getAvailableArchiveDates = (oilField = 'BSK') => {
  return api.get("/2hours/archive/dates", {
    params: { oil_field: oilField }
  });
};

export const fetchWells = () => {
  return api.get("/wells");
};

export const fetchWellsABC = () => {
  return api.get("/wells/abc");
};

export const fetchABCByWell = () => {
  return api.get("/wells/abc/");
};

export const fetchLast10Wells = () => {
  return api.get("/well/last10");
};

export const fetchWellData = (wellName) => {
  return api.get("/well/data", {
    params: {
      well: wellName,
    },
  });
};

export const fetchBSKWells = () => {
  return api.get("/wells/bsk");
};

export const fetchProgressOil = () => {
  return api.get("/progress-oil");
};

export const getAvailableVlagomerDates = () => {
  return api.get("/vlagomer-history/dates");
};

export const fetchVlagomerHistory = (date = null) => {
  const url = date 
    ? `/vlagomer-history/${date}`
    : "/vlagomer-history";
  return api.get(url);
};