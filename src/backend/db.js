// db.js
const mysql = require("mysql");

let connection;

function handleDisconnect() {
  connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "ada",
    port: 3306,
    charset: "utf8mb4"
  });

  connection.connect((err) => {
    if (err) {
      console.error("Database connection failed:", err);
      setTimeout(handleDisconnect, 2000); // Try again after 2 seconds
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

// Export a function that returns the current connection
module.exports = () => connection;
