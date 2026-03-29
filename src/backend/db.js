const mysql = require("mysql2");

let connection;

const DB_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "1234",
  database: process.env.DB_NAME || "ada",
  port: Number(process.env.DB_PORT || 3306),
  timezone: process.env.DB_TIMEZONE || "+05:00",
  charset: process.env.DB_CHARSET || "utf8mb4",
};

function handleDisconnect() {
  connection = mysql.createConnection(DB_CONFIG);

  connection.connect((err) => {
    if (err) {
      console.error("Database connection failed:", err);
      setTimeout(handleDisconnect, 2000);
    } else {
      console.log("Database connection successfully established!");
    }
  });

  connection.on("error", (err) => {
    console.error("MySQL error:", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.warn("MySQL connection lost. Reconnecting...");
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

handleDisconnect();

module.exports = () => connection;