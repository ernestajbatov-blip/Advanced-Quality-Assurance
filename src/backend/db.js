const mysql = require("mysql");

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "ada_db",
    port: 3306,
});

connection.connect((err) => {
    if (err) {
        console.error("Database connection failed", err);
        return;
    }
    console.log("Database connection successfully established!");
});

module.exports = connection;