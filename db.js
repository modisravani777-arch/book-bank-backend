const mysql = require("mysql2");

const db = mysql.createConnection({
host: "localhost",
user: "root",
password: "Sravani@123",
database: "smart_book_bank"
});

db.connect((err) => {
if(err){
console.log("DB Error", err);
}else{
console.log("MySQL Connected ✅");
}
});

module.exports = db;