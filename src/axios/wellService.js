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

export const fetchLastUpdate = () => {
  return api.get("/wells/last-update");
};

export const fetchChrpArchiveReport = ({ startDate, endDate }) => {
  return api.get("/chrp/archive/report", {
    params: {
      startDate,
      endDate
    }
  });
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

export const fetchKPIProduction = () => {
  return api.get("/kpi/production");
};

export const fetchKPIInjection = () => {
  return api.get("/kpi/injection");
};

export const fetchOilLossData = (params = {}) => {
  return api.get("/oil-loss", {
    params: {
      well: params.well,
      startDate: params.startDate,
      endDate: params.endDate
    }
  });
};

export const fetchOilLossWells = () => {
  return api.get("/oil-loss/wells");
};

export const analyzeOilLoss = (data) => {
  return api.post("/oil-loss/analysis", data);
};

export const login = (credentials) => {
  return api.post("/auth/login", credentials);
};

export const fetchUsers = () => {
  return api.get("/admin/users");
};

export const createUser = (userData) => {
  return api.post("/admin/users", userData);
};

export const deleteUser = (userId) => {
  return api.delete(`/admin/users/${userId}`);
};

export const updateUser = (userId, userData) => {
  return api.put(`/admin/users/${userId}`, userData);
};

export const fetchAGZUCategories = () => {
  return api.get("/agzu/categories");
};

export const fetchAGZUTags = (category) => {
  return api.get(`/agzu/tags/${encodeURIComponent(category)}`);
};

export const fetchAGZUWellData = (wellName) => {
  return api.get("/well/agzu-data", {
    params: {
      well: wellName,
    },
  });
};

export const fetchNotifications = (params = {}) => {
  return api.get("/notifications", {
    params: {
      status: params.status || 'open',
      oil_field: params.oil_field,
      limit: params.limit || 50
    }
  });
};

export const fetchNotificationCount = (params = {}) => {
  return api.get("/notifications/count", {
    params: {
      status: params.status || 'open',
      oil_field: params.oil_field
    }
  });
};

export const checkWellStatus = () => {
  return axiosInstance.get('/wells/check-status');
};

export const createNotification = (notificationData) => {
  return axiosInstance.post('/notifications/create', notificationData);
};