const mysql = require("mysql2");

let connection;

function handleDisconnect() {
  connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "ada",
    port: 3306,
    timezone: '+05:00',
    charset: "utf8mb4"
  });

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