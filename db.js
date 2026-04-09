const mysql = require("mysql2");

// Use environment variables for cloud deployment
const db = mysql.createConnection({
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "Sravani@123",
  database: process.env.MYSQL_DATABASE || "smart_book_bank",
});

db.connect((err) => {
  if (err) {
    console.log("DB Error", err);
  } else {
    console.log("MySQL Connected ✅");
  }
});

module.exports = db;