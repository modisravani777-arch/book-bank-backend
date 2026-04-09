const mysql = require("mysql2");

// Create connection using Railway environment variables
const db = mysql.createConnection({
  host: process.env.MYSQLHOST || "localhost",
  user: process.env.MYSQLUSER || "root",
  password: process.env.MYSQLPASSWORD || "",
  database: process.env.MYSQLDATABASE || "railway",
  port: process.env.MYSQLPORT || 3306,
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("DB Error ❌:", err);
  } else {
    console.log("MySQL Connected ✅");
  }
});

module.exports = db;