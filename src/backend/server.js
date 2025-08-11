const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const getConnection = require("./db");
const port = 3000;
const app = express();
const crypto = require("crypto");

app.use(cors());
app.use(express.json());

// ---- API Routes ----

app.get("/api/wells", (req, res) => {
  const connection = getConnection();
  const query = `
    SELECT m.*, d.working, d.type, d.c_current
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
      c_last_update AS 'Последнее обновление'
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
  const { well, startDate, endDate } = req.query;
  
  let query = `
    SELECT 
      well,
      date,
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
  
  query += ` ORDER BY well, date DESC`;
  
  connection.query(query, params, (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results || []);
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

app.get("/api/vlagomer-history/:date?", (req, res) => {
  const connection = getConnection();
  const date = req.params.date;
  
  let query = `
    SELECT tag_key, tag_value, vlog_arch as timestamp
    FROM vlagomer 
    WHERE oil_field = 'BSK' AND tag_key = 'VlagomerTFS_1'
  `;
  
  const params = [];
  
  if (date) {
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

// KPI data for production wells (nagn = 0)
app.get("/api/kpi/production", (req, res) => {
  const connection = getConnection();
  
  const matrixQuery = `
    SELECT 
      COALESCE(SUM(zamer), 0) as zamernaya_fluid,
      COALESCE(SUM(zamer_oil), 0) as zamernaya_oil,
      COALESCE(SUM(tr_fluid), 0) as tech_rezh_fluid,
      COALESCE(SUM(tr_oil), 0) as tech_rezh_oil
    FROM n_well_matrix 
    WHERE nagn = 0;
  `;
  
  const parkQuery = `
    SELECT 
      COALESCE(n_debit_last_day, 0) as park_fluid,
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
      
      const parkCoeff = parkData.park_oil > 0 ? 
        (matrixData.zamernaya_oil / parkData.park_oil).toFixed(3) : 0;
      
      const result = {
        zamernaya_fluid: parseFloat(matrixData.zamernaya_fluid || 0).toFixed(2),
        zamernaya_oil: parseFloat(matrixData.zamernaya_oil || 0).toFixed(2),
        park_fluid: parseFloat(parkData.park_fluid || 0).toFixed(2),
        park_oil: parseFloat(parkData.park_oil || 0).toFixed(2),
        tech_rezh_fluid: parseFloat(matrixData.tech_rezh_fluid || 0).toFixed(2),
        tech_rezh_oil: parseFloat(matrixData.tech_rezh_oil || 0).toFixed(2),
        park_coefficient: parseFloat(parkCoeff)
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
      tr_water AS 'Обводненность'
    FROM n_well_matrix
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

// Function to convert Russian category names to English tag keys
function convertCategoryToTagKey(category) {
  if (!category) return null;
  
  // console.log("Converting category to tag key:", category);
  
  // Convert to lowercase and replace common Russian terms with English equivalents
  let converted = category.toLowerCase()
    .replace(/агзу/g, 'agzu')          // АГЗУ -> agzu
    .replace(/мф/g, 'mf')              // МФ -> mf  
    .replace(/врп/g, 'vrp')            // ВРП -> vrp
    .replace(/№/g, '')                 // Remove №
    .replace(/\s+/g, '-')              // Replace spaces with hyphens
    .replace(/-+/g, '-')               // Replace multiple hyphens with single
    .replace(/^-|-$/g, '');            // Remove leading/trailing hyphens
  
  const tagKey = `${converted}-num`;
  
  // console.log("Converted tag key:", tagKey);
  
  return tagKey;
}

// Test the function with your categories
// console.log("АГЗУ-1 ->", convertCategoryToTagKey("АГЗУ-1"));     // Should be: agzu-1-num
// console.log("АГЗУ-2 ->", convertCategoryToTagKey("АГЗУ-2"));     // Should be: agzu-2-num  
// console.log("МФ №3 ->", convertCategoryToTagKey("МФ №3"));       // Should be: mf-3-num

app.get("/api/well-number/:category", (req, res) => {
  const connection = getConnection();
  const category = req.params.category;
  
  if (!category) {
    return res.status(400).json({ error: "Category is required" });
  }
  
  // Convert Russian category name to English tag key
  // For example: "АГЗУ-1" -> "agzu-1-num", "МФ №3" -> "mf-3-num"
  const tagKey = convertCategoryToTagKey(category);
  
  if (!tagKey) {
    return res.status(400).json({ error: "Invalid category format" });
  }
  
  const query = `
    SELECT tag_value 
    FROM n_wincctags 
    WHERE tag_key = ?
    LIMIT 1;
  `;
  
  connection.query(query, [tagKey], (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database query failed" });
    }
    
    // If no specific tag found for this category, return null
    const wellNumber = results && results[0] && results[0].tag_value 
      ? parseInt(results[0].tag_value) 
      : null;
      
    res.json({ 
      wellNumber: wellNumber,
      originalCategory: category,
      tagKey: tagKey 
    });
  });
});

// Keep the old endpoint for backward compatibility, but make it more generic
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
    
    const wellNumber = results && results[0] ? results[0].tag_value : null;
    res.json({ wellNumber: wellNumber ? parseInt(wellNumber) : null });
  });
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