const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",        // your local MySQL host
  user: "root",             // local MySQL user
  password: "Sravani@123",             // local MySQL password
  database: "smart_book_bank", // your database name
  port: 3306,               // default MySQL port
});

db.connect((err) => {
  if (err) {
    console.log("DB Error ❌:", err);
  } else {
    console.log("MySQL Connected ✅");
  }
});

module.exports = db;