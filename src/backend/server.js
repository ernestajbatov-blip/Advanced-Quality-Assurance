const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const getConnection = require("./db");
const port = 3000;
const app = express();
const crypto = require("crypto");
const axios = require('axios');

app.use(cors());
app.use(express.json());

// ---- API Routes ----

app.get("/api/wells", (req, res) => {
  const connection = getConnection();
  const query = `
    SELECT m.*, d.working, d.type, d.c_current, d.c_current_min, d.c_current_max, d.c_type
    FROM n_well_matrix m
    LEFT JOIN well_data d ON m.well = d.well
    WHERE m.well LIKE 'BSK%';
  `;
  connection.query(query, (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results || []);
  });
});

app.get("/api/wells/bsk", (req, res) => {
  const connection = getConnection();
  const query = `
    SELECT
      well AS 'Скважина',
      coordinates_x AS 'Широта',
      coordinates_y AS 'Долгота',
      c_voltage AS 'Напряжение',
      c_power AS 'Мощность',
      c_freq AS 'Частота',
      c_current AS 'Ток',
      c_speed AS 'Скорость двигателя',
      working AS 'Работа',
      type AS 'Тип'
    FROM well_data
    WHERE well LIKE 'BSK%'
    AND coordinates_x IS NOT NULL 
    AND coordinates_y IS NOT NULL
    AND coordinates_x != ''
    AND coordinates_y != ''
    ORDER BY well;
  `;
  
  connection.query(query, (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database query failed" });
    }
    
    // Filter out wells with invalid coordinates on the server side
    const validWells = results.filter(well => {
      const lat = parseFloat(well['Широта']);
      const lng = parseFloat(well['Долгота']);
      return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
    });
    
    res.json(validWells || []);
  });
});

app.get("/api/2hours", (req, res) => {
  const connection = getConnection();
  const oilField = req.query.oil_field || 'BSK';
  
  const query = `
    SELECT current_debit, tech_rezh, debit_last_day,
          current_debit_nak, tech_rezh_nak, debit_last_day_nak,
          n_current_debit, n_tech_rezh, n_debit_last_day,
          n_current_debit_nak, n_tech_rezh_nak, n_debit_last_day_nak, 
          time, Tin
    FROM n_2hour
    WHERE oil_field LIKE ?
    LIMIT 13;
  `;
  
  connection.query(query, [`${oilField}%`], (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results || []);
  });
});

app.get("/api/2hours/archive", (req, res) => {
  const connection = getConnection();
  const oilField = req.query.oil_field || 'BSK';
  const date = req.query.date;
  
  if (!date) {
    return res.status(400).json({ error: "Date parameter is required" });
  }
  
  const query = `
    SELECT current_debit, tech_rezh, debit_last_day,
           current_debit_nak, tech_rezh_nak, debit_last_day_nak,
           n_current_debit, n_tech_rezh, n_debit_last_day,
           n_current_debit_nak, n_tech_rezh_nak, n_debit_last_day_nak,
           date, time
    FROM n_2hour_arch
    WHERE oil_field LIKE ? AND date = ?
    ORDER BY time;
  `;
  
  connection.query(query, [`${oilField}%`, date], (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results || []);
  });
});

app.get("/api/2hours/archive/dates", (req, res) => {
  const connection = getConnection();
  const oilField = req.query.oil_field || 'BSK';
  
  const query = `
    SELECT DISTINCT date 
    FROM n_2hour_arch 
    WHERE oil_field LIKE ?
    ORDER BY date DESC
    LIMIT 100;
  `;
  
  connection.query(query, [`${oilField}%`], (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results || []);
  });
});

app.get("/api/wells/abc", (req, res) => {
  const connection = getConnection();
  const query = `SELECT * FROM abc_data;`;
  connection.query(query, (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results || []);
  });
});

app.get("/api/well/data", (req, res) => {
  const connection = getConnection();
  const wellName = req.query.well;
  if (!wellName) {
    return res.status(400).json({ error: "Well name is required" });
  }

  const query = `
    SELECT
      well AS 'Скважина',
      coordinates_x AS 'Широта',
      coordinates_y AS 'Долгота',
      c_voltage AS 'Напряжение',
      c_power AS 'Мощность',
      c_freq AS 'Частота',
      c_current AS 'Ток',
      c_speed AS 'Скорость двигателя',
      c_temp AS 'Температура',
      working AS 'Работа',
      type AS 'Тип',
      c_last_update AS 'Последнее обновление',
      c_type AS 'Тип ЧРП'
    FROM well_data
    WHERE well = ?;
  `;
  connection.query(query, [wellName], (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results || []);
  });
});

app.get("/api/chrp/archive/report", (req, res) => {
  const connection = getConnection();
  const { startDate, endDate, well } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: "startDate and endDate are required" });
  }

  const startDateTime = `${startDate} 00:00:00`;
  const endDateTime = `${endDate} 23:59:59`;
  const params = [startDateTime, endDateTime];

  let whereClause = "date_time BETWEEN ? AND ?";
  if (well) {
    whereClause += " AND well_name = ?";
    params.push(well);
  }

  const query = `
    SELECT
      well_name AS 'Скважина',
      DATE_FORMAT(date_time, '%Y-%m-%d %H:%i:%s') AS 'Дата опроса',
      c_voltage AS 'Напряжение',
      c_power AS 'Мощность',
      c_freq AS 'Частота',
      c_current AS 'Ток',
      c_speed AS 'Обороты ротора',
      c_temp AS 'Температура устья'
    FROM chrp_archive
    WHERE ${whereClause}
    ORDER BY date_time DESC, well_name;
  `;

  connection.query(query, params, (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results || []);
  });
});

app.get("/api/agzu/archive/report", (req, res) => {
  const connection = getConnection();
  const { startDate, endDate, well } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: "startDate and endDate are required" });
  }

  const params = [startDate, endDate];
  let whereClause = "date BETWEEN ? AND ?";

  if (well) {
    whereClause += " AND well = ?";
    params.push(well);
  }

  const query = `
    SELECT
      well AS 'Скважина',
      DATE_FORMAT(date, '%Y-%m-%d') AS 'Дата',
      tm_fluid AS 'Жидкость',
      tm_oil AS 'Нефть',
      tm_water AS 'Обводненность'
    FROM abc_data
    WHERE ${whereClause}
    ORDER BY date DESC, well;
  `;

  connection.query(query, params, (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results || []);
  });
});

app.get("/api/wells/last-update", (req, res) => {
  const connection = getConnection();
  const query = `
    SELECT MAX(c_last_update) as lastUpdate
    FROM well_data
    WHERE well LIKE 'BSK%'
    AND c_last_update IS NOT NULL;
  `;
  
  connection.query(query, (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database query failed" });
    }
    
    const lastUpdate = results && results[0] ? results[0].lastUpdate : null;
    res.json({ lastUpdate });
  });
});

app.get("/api/well/last10", (req, res) => {
  const connection = getConnection();
  const query = `
    SELECT
      well AS 'Скважина',
      start_date AS 'Дата начало',
      end_date AS 'Дата конца',
      work AS 'Вид ремонта'
    FROM n_last10
    ORDER BY id DESC
    LIMIT 10;
  `;
  connection.query(query, (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results || []);
  });
});

app.get("/api/progress-oil", (req, res) => {
  const connection = getConnection();
  const query = `
    SELECT description, tag_key, tag_value AS value
    FROM n_wincctags;
  `;
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Failed to fetch progress oil data:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results || []);
  });
});

// Oil Loss API endpoint
app.get("/api/oil-loss", (req, res) => {
  const connection = getConnection();
  let { well, startDate, endDate } = req.query;
  
  let query = `
    SELECT 
      well,
      DATE_FORMAT(date, '%Y-%m-%d') as date,
      tm_oil,
      well_work_time,
      tm_obv,
      tm_fluid,
      water_lab
    FROM oil_loss 
    WHERE oil_field = 'BSK'
  `;
  
  const params = [];
  
  if (well && well !== 'all') {
    query += ` AND well = ?`;
    params.push(well);
  }
  
  if (startDate) {
    query += ` AND date >= ?`;
    params.push(startDate);
  }
  
  if (endDate) {
    query += ` AND date <= ?`;
    params.push(endDate);
  }
  
  query += ` ORDER BY well, date ASC`;
  
  console.log('Oil Loss API Query:', query);
  console.log('Oil Loss API Params:', params);
  
  connection.query(query, params, (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database query failed" });
    }
    
    console.log(`✅ Oil Loss API returned ${results.length} records`);
    if (well && well !== 'all') {
      console.log(`   Well: ${well}, Date range: ${startDate} to ${endDate}`);
      if (results.length > 0) {
        console.log(`   First: ${results[0].date}, Last: ${results[results.length - 1].date}`);
      }
    }
    
    res.json(results || []);
  });
});

// Add this temporary diagnostic endpoint to your server.js
app.get("/api/oil-loss/debug", (req, res) => {
  const connection = getConnection();
  
  // Query 1: Count all BSK_0004 records in the entire date range
  const query1 = `
    SELECT COUNT(*) as total_count FROM oil_loss 
    WHERE well = 'BSK_0004' 
    AND date >= '2025-06-01' 
    AND date <= '2025-07-14';
  `;
  
  // Query 2: Get all distinct dates for BSK_0004
  const query2 = `
    SELECT DISTINCT date FROM oil_loss 
    WHERE well = 'BSK_0004' 
    AND date >= '2025-06-01' 
    AND date <= '2025-07-14'
    ORDER BY date;
  `;
  
  // Query 3: Check if July 14 exists
  const query3 = `
    SELECT * FROM oil_loss 
    WHERE well = 'BSK_0004' 
    AND date = '2025-07-14';
  `;
  
  // Query 4: Count records per date
  const query4 = `
    SELECT date, COUNT(*) as cnt FROM oil_loss 
    WHERE well = 'BSK_0004' 
    AND date >= '2025-06-01' 
    AND date <= '2025-07-14'
    GROUP BY date
    ORDER BY date;
  `;
  
  connection.query(query1, (err1, res1) => {
    connection.query(query2, (err2, res2) => {
      connection.query(query3, (err3, res3) => {
        connection.query(query4, (err4, res4) => {
          res.json({
            total_count: res1 && res1[0] ? res1[0].total_count : 'ERROR',
            distinct_dates: res2 ? res2.map(r => r.date) : [],
            july_14_record: res3 && res3[0] ? res3[0] : 'NOT FOUND',
            counts_by_date: res4 || []
          });
        });
      });
    });
  });
});

// Get available wells from oil_loss table
app.get("/api/oil-loss/wells", (req, res) => {
  const connection = getConnection();
  const query = `
    SELECT DISTINCT well 
    FROM oil_loss 
    WHERE oil_field = 'BSK' 
    ORDER BY well;
  `;
  
  connection.query(query, (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results || []);
  });
});

app.get("/api/vlagomer-history/dates", (req, res) => {
  const connection = getConnection();
  const query = `
    SELECT DISTINCT DATE(vlog_arch) as date 
    FROM vlagomer 
    WHERE oil_field = 'BSK' AND tag_key = 'VlagomerTFS_1'
    ORDER BY date DESC
    LIMIT 100;
  `;
  
  connection.query(query, (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results || []);
  });
});

app.post("/api/oil-loss/analysis", async (req, res) => {
  try {
    const { records, cfg } = req.body;
    
    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: "Invalid input: records array is required" });
    }

    console.log('Received analysis request for', records.length, 'wells');
    
    // Replace with your actual Gunicorn service URL
    const gunicornUrl = process.env.GUNICORN_SERVICE_URL || 'http://localhost:8888/losses_calculation';
    
    const response = await axios.post(gunicornUrl, {
      records,
      cfg: cfg || {}
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    res.json(response.data);
    
  } catch (error) {
    console.error("Error calling analysis service:", error.message);
    
    if (error.response) {
      return res.status(error.response.status).json({
        error: "Analysis service error",
        details: error.response.data
      });
    } else if (error.request) {
      return res.status(503).json({
        error: "Analysis service unavailable",
        details: "Could not connect to analysis service"
      });
    } else {
      return res.status(500).json({
        error: "Internal server error",
        details: error.message
      });
    }
  }
});

app.get("/api/vlagomer-history/:date?", (req, res) => {
  const connection = getConnection();
  const date = req.params.date;

  if (date === 'dates') {
    return res.status(404).json({ error: "Invalid date parameter" });
  }
  
  let query = `
    SELECT tag_key, tag_value, vlog_arch as timestamp
    FROM vlagomer 
    WHERE oil_field = 'BSK' AND tag_key = 'VlagomerTFS_1'
  `;
  
  const params = [];
  
  if (date) {
    // ADD DATE VALIDATION
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD format
    if (!dateRegex.test(date)) {
      return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
    }
    
    query += ` AND DATE(vlog_arch) = ?`;
    params.push(date);
  }
  
  query += `
    ORDER BY vlog_arch DESC
    LIMIT 24;
  `;
  
  connection.query(query, params, (err, results) => {
    if (err) {
      console.error("Failed to fetch vlagomer history:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    const transformedResults = results.map(row => ({
      value: parseFloat(row.tag_value),
      timestamp: row.timestamp
    }));
    
    res.json(transformedResults || []);
  });
});

// KPI data for production wells (nagn = 0)
app.get("/api/kpi/production", (req, res) => {
  const connection = getConnection();
  
  const matrixQuery = `
    SELECT 
      COALESCE(SUM(zamer), 0) as zamernaya_fluid,
      COALESCE(SUM(zamer_oil), 0) as zamernaya_oil,
      COALESCE(SUM(tr_fluid), 0) as tech_rezh_fluid,
      COALESCE(SUM(tr_oil) * 0.866, 0) as tech_rezh_oil
    FROM n_well_matrix 
    WHERE nagn = 0;
  `;
  
  const parkQuery = `
    SELECT 
      COALESCE(debit_last_day_nak, 0) as park_fluid,
      COALESCE(n_debit_last_day_nak, 0) as park_oil
    FROM n_2hour 
    WHERE oil_field LIKE 'BSK%' AND time = '1:59'
    ORDER BY id DESC 
    LIMIT 1;
  `;
  
  connection.query(matrixQuery, (error1, matrixResults) => {
    if (error1) {
      console.error("Database error (matrix):", error1);
      return res.status(500).json({ error: "Database query failed" });
    }
    
    connection.query(parkQuery, (error2, parkResults) => {
      if (error2) {
        console.error("Database error (park):", error2);
        return res.status(500).json({ error: "Database query failed" });
      }
      
      const matrixData = matrixResults[0] || {};
      const parkData = parkResults[0] || {};
      
      const rawCoeff = (parkData.park_oil > 0 && matrixData.zamernaya_oil > 0)
        ? (parkData.park_oil / matrixData.zamernaya_oil)
        : 0;

      const parkCoeff = parseFloat(rawCoeff.toFixed(3));

      const result = {
        zamernaya_fluid: parseFloat(matrixData.zamernaya_fluid || 0).toFixed(2),
        zamernaya_oil: parseFloat(matrixData.zamernaya_oil || 0).toFixed(2),
        park_fluid: parseFloat(parkData.park_fluid || 0).toFixed(2),
        park_oil: parseFloat(parkData.park_oil || 0).toFixed(2),
        tech_rezh_fluid: parseFloat(matrixData.tech_rezh_fluid || 0).toFixed(2),
        tech_rezh_oil: parseFloat(matrixData.tech_rezh_oil || 0).toFixed(2),
        park_coefficient: parkCoeff
      };

      
      res.json(result);
    });
  });
});

// KPI data for injection wells (nagn = 1)
app.get("/api/kpi/injection", (req, res) => {
  const connection = getConnection();
  
  const matrixQuery = `
    SELECT 
      COALESCE(SUM(zamer), 0) as sum_zakachka,
      COALESCE(SUM(tr_fluid), 0) as tech_rezh_vrp
    FROM n_well_matrix 
    WHERE nagn = 1;
  `;
  
  const parkQuery = `
    SELECT 
      COALESCE(SUM(wat_out), 0) as park_dobycha
    FROM n_2hour 
    WHERE oil_field LIKE 'BSK%';
  `;
  
  connection.query(matrixQuery, (error1, matrixResults) => {
    if (error1) {
      console.error("Database error (matrix injection):", error1);
      return res.status(500).json({ error: "Database query failed" });
    }
    
    connection.query(parkQuery, (error2, parkResults) => {
      if (error2) {
        console.error("Database error (park injection):", error2);
        return res.status(500).json({ error: "Database query failed" });
      }
      
      const matrixData = matrixResults[0] || {};
      const parkData = parkResults[0] || {};
      
      const result = {
        sum_zakachka: parseFloat(matrixData.sum_zakachka || 0).toFixed(2),
        park_dobycha: parseFloat(parkData.park_dobycha || 0).toFixed(2),
        tech_rezh_vrp: parseFloat(matrixData.tech_rezh_vrp || 0).toFixed(2)
      };
      
      res.json(result);
    });
  });
});

// Authentication routes
app.post("/api/auth/login", (req, res) => {
  const { login, password } = req.body;
  
  if (!login || !password) {
    return res.status(400).json({ error: "Login and password are required" });
  }

  const connection = getConnection();
  const hashedPassword = crypto.createHash('md5').update(password).digest('hex');
  
  const query = `
    SELECT id, login, name, is_admin, available_ngdu_id 
    FROM n_users 
    WHERE login = ? AND password = ?
  `;
  
  connection.query(query, [login, hashedPassword], (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database query failed" });
    }
    
    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const user = results[0];
    res.json({
      id: user.id,
      login: user.login,
      name: user.name,
      is_admin: user.is_admin,
      available_ngdu_id: user.available_ngdu_id
    });
  });
});

// Admin routes
app.get("/api/admin/users", (req, res) => {
  const connection = getConnection();
  const query = `
    SELECT id, login, name, is_admin, available_ngdu_id 
    FROM n_users 
    ORDER BY id
  `;
  
  connection.query(query, (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results || []);
  });
});

app.post("/api/admin/users", (req, res) => {
  const { login, name, password, is_admin, available_ngdu_id } = req.body;
  
  if (!login || !name || !password) {
    return res.status(400).json({ error: "Login, name and password are required" });
  }

  const connection = getConnection();
  const hashedPassword = crypto.createHash('md5').update(password).digest('hex');
  
  const query = `
    INSERT INTO n_users (login, name, password, is_admin, available_ngdu_id, is_geolog) 
    VALUES (?, ?, ?, ?, ?, 0)
  `;
  
  connection.query(query, [login, name, hashedPassword, is_admin ? 1 : 0, available_ngdu_id || null], (error, results) => {
    if (error) {
      console.error("Database error:", error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: "User with this login already exists" });
      }
      return res.status(500).json({ error: "Database query failed" });
    }
    
    res.json({ 
      id: results.insertId,
      login,
      name,
      is_admin: is_admin ? 1 : 0,
      available_ngdu_id
    });
  });
});

app.delete("/api/admin/users/:id", (req, res) => {
  const userId = req.params.id;
  const connection = getConnection();
  
  const query = `DELETE FROM n_users WHERE id = ?`;
  
  connection.query(query, [userId], (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database query failed" });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({ message: "User deleted successfully" });
  });
});

app.put("/api/admin/users/:id", (req, res) => {
  const userId = req.params.id;
  const { login, name, password, is_admin, available_ngdu_id } = req.body;
  
  if (!login || !name) {
    return res.status(400).json({ error: "Login and name are required" });
  }

  const connection = getConnection();
  
  // Build the update query dynamically
  let query = `UPDATE n_users SET login = ?, name = ?, is_admin = ?, available_ngdu_id = ?`;
  let params = [login, name, is_admin ? 1 : 0, available_ngdu_id || null];
  
  // Only update password if provided
  if (password && password.trim()) {
    const hashedPassword = crypto.createHash('md5').update(password).digest('hex');
    query += `, password = ?`;
    params.push(hashedPassword);
  }
  
  query += ` WHERE id = ?`;
  params.push(userId);
  
  connection.query(query, params, (error, results) => {
    if (error) {
      console.error("Database error:", error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: "User with this login already exists" });
      }
      return res.status(500).json({ error: "Database query failed" });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({ 
      id: parseInt(userId),
      login,
      name,
      is_admin: is_admin ? 1 : 0,
      available_ngdu_id
    });
  });
});

app.get("/api/agzu/categories", (req, res) => {
  const connection = getConnection();
  const query = `
    SELECT DISTINCT agzu
    FROM n_well_matrix
    WHERE agzu IS NOT NULL 
    AND agzu != ''
    AND oil_field = 'BSK'
    ORDER BY agzu;
  `;
  
  connection.query(query, (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database query failed" });
    }
    
    const categories = results.map(row => row.agzu);
    res.json(categories || []);
  });
});

app.get("/api/well-number", (req, res) => {
  const connection = getConnection();
  const query = `
    SELECT tag_value 
    FROM n_wincctags 
    WHERE tag_key = 'well_num'
    LIMIT 1;
  `;
  
  connection.query(query, (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database query failed" });
    }
    
    const wellNumber = results && results[0] ? results[0].tag_value : 5;
    res.json({ wellNumber: parseInt(wellNumber) || 5 });
  });
});

app.get("/api/well/agzu-data", (req, res) => {
  const connection = getConnection();
  const wellName = req.query.well;
  if (!wellName) {
    return res.status(400).json({ error: "Well name is required" });
  }

  const query = `
    SELECT
      well AS 'Скважина',
      zamer_oil AS 'Нефть',
      gas AS 'Газ', 
      water_tm AS 'Обводненность',
      zamer AS 'Жидкость',
      update_date AS 'Дата и время'
    FROM n_well_matrix
    WHERE well = ?;
  `;
  
  connection.query(query, [wellName], (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database query failed" });
    }
    
    const fixedResults = results.map(row => {
      const fixed = { ...row };
      const dateValue = row['Дата и время'];
      
      if (dateValue === '0000-00-00 00:00:00' || 
          dateValue === '0000-00-00' ||
          (dateValue instanceof Date && dateValue.getFullYear() < 1970)) {
        fixed['Дата и время'] = null;
      }
      
      return fixed;
    });
    
    res.json(fixedResults || []);
  });
});

function convertCategoryToTagPrefix(category) {
  if (!category) return null;
  
  let converted = category.toLowerCase()
    .replace(/агзу-(\d+)/g, 'agzu_$1')        // АГЗУ-2 -> agzu_2
    .replace(/мф\s*№?(\d+)/g, 'mf_$1')       // МФ №3 -> mf_3
    .replace(/врп-(\d+)/g, 'vrp_$1');        // ВРП-1 -> vrp_1
  
  return converted;
}

app.get("/api/agzu/tags/:category", (req, res) => {
  const connection = getConnection();
  const category = req.params.category;
  
  if (!category) {
    return res.status(400).json({ error: "Category is required" });
  }
  
  // Convert category to tag prefix (e.g., "АГЗУ-2" -> "agzu_2")
  const tagPrefix = convertCategoryToTagPrefix(category);
  
  if (!tagPrefix) {
    return res.status(400).json({ error: "Invalid category format" });
  }
  
  // Check if this is AGZU-4
  const normalizedCategory = category.toLowerCase().replace(/\s+/g, '');
  const isAgzu4 = normalizedCategory === "агзу-4" || normalizedCategory === "agzu-4";
  
  let query = `
    SELECT tag_key, tag_value 
    FROM n_wincctags 
    WHERE oil_field = 'BSK' 
    AND (
      tag_key LIKE ? OR 
      tag_key LIKE ? OR 
      tag_key LIKE ? OR 
      tag_key LIKE ?
  `;
  
  let params = [
    `${tagPrefix}_current%`,
    `${tagPrefix}_sep_pressure%`,
    `${tagPrefix}_pass_time%`,
    `${tagPrefix}_liq_temp%`,
  ];
  
  // Add AGZU-4 specific tags
  if (isAgzu4) {
    query += ` OR tag_key = ? OR tag_key = ?`;
    params.push('agzu_4_skv', 'agzu_4_oil');
  }
  
  query += `) ORDER BY tag_key;`;
  
  connection.query(query, params, (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database query failed" });
    }
    
    // Convert results to object for easier access
    const tags = {};
    results.forEach(row => {
      tags[row.tag_key] = parseFloat(row.tag_value) || row.tag_value;
    });
        
    res.json({ 
      tags,
      category,
      tagPrefix
    });
  });
});

// Notifications API endpoint
app.get("/api/notifications", (req, res) => {
  const connection = getConnection();
  const { status, oil_field = 'BSK', limit } = req.query;
  
  let query = `
    SELECT 
      id,
      criticality,
      extraction,
      event,
      status,
      oil_field,
      agzu,
      well,
      otvod,
      opened,
      closed,
      user_name,
      user_email,
      delta,
      comment
    FROM n_lenta
    WHERE oil_field = ?
  `;
  
  const params = [oil_field];
  
  if (status) {
    query += ` AND status = ?`;
    params.push(status);
  }
  
  query += ` ORDER BY opened DESC`;
  
  if (limit) {
    query += ` LIMIT ?`;
    params.push(parseInt(limit));
  }
  
  connection.query(query, params, (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results || []);
  });
});

// Get notification count
app.get("/api/notifications/count", (req, res) => {
  const connection = getConnection();
  const { status, oil_field = 'BSK' } = req.query;
  
  let query = `
    SELECT COUNT(*) as count
    FROM n_lenta
    WHERE oil_field = ?
  `;
  
  const params = [oil_field];
  
  if (status) {
    query += ` AND status = ?`;
    params.push(status);
  }
  
  connection.query(query, params, (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database query failed" });
    }
    
    const count = results && results[0] ? results[0].count : 0;
    res.json({ count });
  });
});

// Check for wells with low current (stopped wells)
app.get("/api/wells/check-status", (req, res) => {
  const connection = getConnection();
  const query = `
    SELECT 
      well,
      c_current,
      c_last_update,
      working
    FROM well_data 
    WHERE well LIKE 'BSK%' 
    AND (c_current < 1 OR c_current IS NULL)
    AND working = 1
    ORDER BY c_last_update DESC;
  `;
  
  connection.query(query, (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database query failed" });
    }
    
    const stoppedWells = results || [];
    
    // For each stopped well, check if we already have a recent notification
    if (stoppedWells.length > 0) {
      const wellNames = stoppedWells.map(w => w.well);
      const checkExistingQuery = `
        SELECT well, MAX(opened) as last_notification
        FROM n_lenta 
        WHERE well IN (${wellNames.map(() => '?').join(',')})
        AND event LIKE '%останов%'
        AND opened > DATE_SUB(NOW(), INTERVAL 1 HOUR)
        GROUP BY well;
      `;
      
      connection.query(checkExistingQuery, wellNames, (error2, existingResults) => {
        if (error2) {
          console.error("Database error checking existing notifications:", error2);
          return res.status(500).json({ error: "Database query failed" });
        }
        
        const existingNotifications = new Set(
          (existingResults || []).map(r => r.well)
        );
        
        // Filter out wells that already have recent notifications
        const newStoppedWells = stoppedWells.filter(
          well => !existingNotifications.has(well.well)
        );
        
        // Create notifications for newly stopped wells
        if (newStoppedWells.length > 0) {
          createWellStopNotifications(newStoppedWells, connection);
        }
        
        res.json({ 
          stoppedWells: newStoppedWells,
          total: stoppedWells.length,
          new: newStoppedWells.length
        });
      });
    } else {
      res.json({ stoppedWells: [], total: 0, new: 0 });
    }
  });
});

function createWellStopNotifications(stoppedWells, connection) {
  const insertQuery = `
    INSERT INTO n_lenta 
    (criticality, extraction, event, status, oil_field, agzu, well, opened, user_name, delta, comment)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)
  `;
  
  stoppedWells.forEach(well => {
    // Try to get AGZU from well matrix
    const agzuQuery = `SELECT agzu FROM n_well_matrix WHERE well = ? LIMIT 1`;
    
    connection.query(agzuQuery, [well.well], (error, agzuResults) => {
      const agzu = (agzuResults && agzuResults[0]) ? agzuResults[0].agzu : null;
      
      // Ensure delta is never null - convert to number and default to 0
      const currentValue = parseFloat(well.c_current) || 0;
      
      const values = [
        3, // criticality - Red (Critical)
        'fluid', // extraction - must be 'oil' or 'fluid', using default 'fluid'
        `Останов ${well.well} - ток (${currentValue.toFixed(2)} А)`,
        'open', // status
        'BSK', // oil_field
        agzu, // agzu
        well.well, // well
        'СИСТЕМА', // user_name
        currentValue, // delta (current value) - ensure it's never null
        `Автоматическое уведомление: ток ${currentValue.toFixed(2)} А < 1 А`
      ];
      
      console.log(`📝 Creating notification for well: ${well.well}`);
      
      connection.query(insertQuery, values, (error, results) => {
        if (error) {
          console.error(`❌ Database error creating notification for well ${well.well}:`, error);
        } else {
          console.log(`✅ Successfully created stop notification for well ${well.well} with ID: ${results.insertId}`);
        }
      });
    });
  });
}

app.post("/api/notifications/create", (req, res) => {
  const connection = getConnection();
  const {
    criticality,
    extraction, // Should be 'oil' or 'fluid'
    event,
    status = 'open',
    oil_field = 'BSK',
    agzu,
    well,
    otvod,
    user_name = 'СИСТЕМА',
    user_email,
    delta,
    comment
  } = req.body;

  if (!event || !well) {
    return res.status(400).json({ error: "Event and well are required" });
  }

  console.log(`📝 Creating notification for well: ${well}`);

  // First check if a similar notification already exists in the last 2 hours
  const checkExistingQuery = `
    SELECT id, opened FROM n_lenta 
    WHERE well = ? 
    AND event LIKE '%останов%' 
    AND status = 'open'
    AND opened > DATE_SUB(NOW(), INTERVAL 2 HOUR)
    ORDER BY opened DESC 
    LIMIT 1
  `;

  connection.query(checkExistingQuery, [well], (checkError, existingResults) => {
    if (checkError) {
      console.error("Error checking existing notifications:", checkError);
      return res.status(500).json({ error: "Database error checking existing notifications" });
    }

    if (existingResults && existingResults.length > 0) {
      console.log(`⚠️ Duplicate notification prevented for well ${well} - recent notification exists`);
      return res.status(409).json({ 
        error: "Recent notification already exists",
        existing_id: existingResults[0].id,
        existing_time: existingResults[0].opened
      });
    }

    // Get AGZU from well matrix if not provided
    const getAgzuQuery = `SELECT agzu FROM n_well_matrix WHERE well = ? LIMIT 1`;
    
    connection.query(getAgzuQuery, [well], (agzuError, agzuResults) => {
      if (agzuError) {
        console.error("Error getting AGZU:", agzuError);
      }
      
      const finalAgzu = agzu || (agzuResults && agzuResults[0] ? agzuResults[0].agzu : null);
      
      // Ensure delta is never null - convert to string and default to '0'
      const finalDelta = delta !== null && delta !== undefined ? String(delta) : '0';
      
      const insertQuery = `
        INSERT INTO n_lenta 
        (criticality, extraction, event, status, oil_field, agzu, well, otvod, opened, user_name, user_email, delta, comment)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)
      `;
      
      const values = [
        criticality || 1,
        extraction || 'fluid', // Must be 'oil' or 'fluid', default to 'fluid'
        event,
        status,
        oil_field,
        finalAgzu,
        well,
        otvod || null,
        user_name,
        user_email || null,
        finalDelta, // Ensure it's never null
        comment || null
      ];
      
      connection.query(insertQuery, values, (error, results) => {
        if (error) {
          console.error("❌ Database error creating notification:", error);
          return res.status(500).json({ error: "Failed to create notification" });
        }
        
        console.log(`✅ Successfully created notification with ID: ${results.insertId} for well: ${well}`);
        
        res.json({ 
          id: results.insertId,
          message: "Notification created successfully",
          well: well,
          criticality: criticality
        });
      });
    });
  });
});

// ---- Activity Logger ----

app.post('/api/write-log', (req, res) => {
  try {
    const logEntry = {
      ...req.body,
      ip: req.ip,
      receivedAt: new Date().toISOString()
    };
    
    // Create logs directory if it doesn't exist
    const logsDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    // Create daily log files
    const today = new Date().toISOString().split('T')[0];
    const logFile = path.join(logsDir, `activity-${today}.txt`);
    
    // Format log entry for readability
    const logLine = `[${logEntry.receivedAt}] ${logEntry.username} - ${logEntry.action} - ${logEntry.details.url} - Session: ${Math.round((logEntry.details.sessionDuration || 0) / 1000)}s - Active: ${Math.round((logEntry.details.activeTime || 0) / 1000)}s\n`;
    
    // Append to file
    fs.appendFileSync(logFile, logLine);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Log writing error:', error);
    res.status(200).json({ success: false });
  }
});

// ---- Static Frontend ----

const distPath = path.join(__dirname, "../../dist");
app.use(express.static(distPath));
app.use('/public/tiles', express.static(path.join(__dirname, 'tiles')));

app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }

  const indexPath = path.join(distPath, "index.html");

  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    console.log(`Frontend dist folder not found at: ${distPath}`);
    res.status(404).send(`
      <h1>Frontend Not Found</h1>
      <p>The frontend dist folder was not found at: ${distPath}</p>
      <p>Please build your frontend application first.</p>
    `);
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on http://192.168.1.42:${port}`);
  console.log(`Looking for frontend files in: ${distPath}`);
});