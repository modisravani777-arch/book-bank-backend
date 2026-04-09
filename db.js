const mysql = require("mysql2");

// Railway environment variables
const db = mysql.createConnection({
  host: process.env.MYSQLHOST,          // e.g., mysql-qayj.railway.internal
  user: process.env.MYSQLUSER,          // usually "root"
  password: process.env.MYSQLPASSWORD,  // your Railway password
  database: process.env.MYSQLDATABASE,  // e.g., "railway"
  port: process.env.MYSQLPORT,          // e.g., 3306 or Railway provided port
});

// Connect to database
db.connect((err) => {
  if (err) {
    console.log("DB Error ❌:", err);
  } else {
    console.log("MySQL Connected ✅");
  }
});

module.exports = db;