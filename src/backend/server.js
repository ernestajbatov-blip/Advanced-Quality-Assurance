const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const path = require("path");
const fs = require("fs");
const connection = require("./db");
const { error } = require("console");
const port = 3000;
const app = express();

app.use(cors());
app.use(express.json()); // Add this for parsing JSON bodies

// API routes - Define ALL API routes FIRST
app.get("/api/wells", (req, res) => {
  const query = `
    SELECT 
      m.*, 
      d.working
    FROM 
      n_well_matrix m
    LEFT JOIN 
      well_data d ON m.well = d.well
    WHERE 
      m.well LIKE 'BSK%';
  `;

  connection.query(query, (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results || []);
  });
});


app.get("/api/2hours", (req, res) => {
  const query = `
    SELECT current_debit, tech_rezh, debit_last_day,
    current_debit_nak, tech_rezh_nak, debit_last_day_nak,
    n_current_debit, n_tech_rezh, n_debit_last_day,
    n_current_debit_nak, n_tech_rezh_nak,
    n_debit_last_day_nak
    FROM n_2hour
    WHERE oil_field
    LIKE 'BSK%';
  `;
  connection.query(query, (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results || []);
  });
});

app.get("/api/wells/abc", (req, res) => {
  const query = `
    SELECT *
    FROM abc_data;
  `;
  connection.query(query, (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results || []);
  });
});

app.get("/api/well/data", (req, res) => {
  const wellName = req.query.well;
  if (!wellName) {
    return res.status(400).json({
      error: "Well name is required"
    });
  }
  
  const query = `
    SELECT
    well AS 'Скважина',
    c_voltage AS 'Напряжение',
    c_power AS 'Мощность',
    c_freq AS 'Частота',
    c_current AS 'Ток',
    c_speed AS 'Скорость двигателя',
    working AS 'Работа'
    FROM
    well_data
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
  const query = `
    SELECT well AS 'Скважина',
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
      return res.status(500).json({
        error: "Database query failed"
      });
    }
    res.json(results || []);
  });
});

app.get('/api/progress-oil', (req, res) => {
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

const distPath = path.join(__dirname, "../../dist");
app.use(express.static(distPath));

app.get("*", (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  
  const indexPath = path.join(distPath, "index.html");
  
  // Check if file exists before trying to serve it
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
  console.log(`Server running on http://26.110.70.236:${port}`);
  console.log(`Looking for frontend files in: ${distPath}`);
});