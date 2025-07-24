const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const getConnection = require("./db");
const port = 3000;
const app = express();

app.use(cors());
app.use(express.json());

// ---- API Routes ----

app.get("/api/wells", (req, res) => {
  const connection = getConnection();
  const query = `
    SELECT m.*, d.working
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
      working AS 'Работа'
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
      working AS 'Работа'
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