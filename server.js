const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db"); // your db.js

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Book Bank API Running ✅");
});

// -------- LOGIN --------
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt:", { email, password });

  const sql = "SELECT * FROM users WHERE email=? AND password=?";
  db.query(sql, [email, password], (err, result) => {
    if (err) {
      console.log("DB Error:", err);
      return res.status(500).send({ status: "error", message: "Database error" });
    }

    console.log("DB Result:", result);

    if (result.length > 0) {
      res.send({ status: "success", user: result[0] });
    } else {
      res.send({ status: "error", message: "Invalid email or password" });
    }
  });
});

// -------- GET ALL STUDENTS --------
app.get("/users", (req, res) => {
  const sql = "SELECT * FROM users WHERE role='student'";
  db.query(sql, (err, result) => {
    if (err) return res.send(err);
    res.send(result);
  });
});

// -------- ADD STUDENT --------
app.post("/add-student", (req, res) => {
  const { name, email, password } = req.body;
  const sql = "INSERT INTO users (name,email,password,role) VALUES (?,?,?, 'student')";
  db.query(sql, [name, email, password], (err, result) => {
    if (err) return res.send(err);
    res.send("Student Added ✅");
  });
});

// -------- DELETE STUDENT --------
app.delete("/delete-student/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM users WHERE id=?", [id], (err, result) => {
    if (err) return res.send(err);
    res.send("Student Deleted ✅");
  });
});

// -------- BOOKS --------
app.get("/books", (req, res) => {
  db.query("SELECT * FROM books", (err, result) => {
    if (err) return res.send(err);
    res.send(result);
  });
});

app.post("/add-book", (req, res) => {
  const { title, author, category, quantity } = req.body;
  const sql = "INSERT INTO books (title,author,category,quantity,available) VALUES (?,?,?,?,?)";
  db.query(sql, [title, author, category, quantity, quantity], (err, result) => {
    if (err) return res.send(err);
    res.send("Book Added ✅");
  });
});

app.delete("/delete-book/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM books WHERE id=?", [id], (err, result) => {
    if (err) return res.send(err);
    res.send("Book Deleted ✅");
  });
});

app.put("/update-book/:id", (req, res) => {
  const id = req.params.id;
  const { title, author, category, quantity } = req.body;
  const sql = "UPDATE books SET title=?, author=?, category=?, quantity=?, available=? WHERE id=?";
  db.query(sql, [title, author, category, quantity, quantity, id], (err, result) => {
    if (err) return res.send(err);
    res.send("Book Updated ✅");
  });
});

// -------- ISSUE / RETURN BOOK --------
app.post("/issue-book", (req, res) => {
  const { user_id, book_id, due_date } = req.body;
  const sql = "INSERT INTO issued_books (user_id, book_id, issue_date, due_date, status) VALUES (?, ?, CURDATE(), ?, 'issued')";
  db.query(sql, [user_id, book_id, due_date], (err, result) => {
    if (err) return res.send(err);
    db.query("UPDATE books SET available = available - 1 WHERE id=?", [book_id]);
    res.send("Book Issued ✅");
  });
});

app.put("/return-book/:id", (req, res) => {
  const id = req.params.id;
  db.query("SELECT book_id FROM issued_books WHERE id=?", [id], (err, result) => {
    if (err) return res.send(err);
    const bookId = result[0].book_id;
    db.query("UPDATE issued_books SET status='returned', return_date=CURDATE() WHERE id=?", [id]);
    db.query("UPDATE books SET available = available + 1 WHERE id=?", [bookId]);
    res.send("Book Returned ✅");
  });
});

app.get("/issued-books", (req, res) => {
  const sql = `
    SELECT issued_books.*, users.name, books.title
    FROM issued_books
    JOIN users ON users.id = issued_books.user_id
    JOIN books ON books.id = issued_books.book_id
  `;
  db.query(sql, (err, result) => {
    if (err) return res.send(err);
    res.send(result);
  });
});

// -------- DASHBOARD STATS --------
app.get("/dashboard-stats", (req, res) => {
  const stats = {};

  // Total Books
  db.query("SELECT COUNT(*) AS totalBooks FROM books", (err, result) => {
    if (err) return res.send(err);
    stats.totalBooks = result[0].totalBooks;

    // Available Books
    db.query("SELECT SUM(available) AS availableBooks FROM books", (err, result) => {
      if (err) return res.send(err);
      stats.availableBooks = result[0].availableBooks || 0;

      // Issued Books
      db.query("SELECT COUNT(*) AS issuedBooks FROM issued_books WHERE status='issued'", (err, result) => {
        if (err) return res.send(err);
        stats.issuedBooks = result[0].issuedBooks;

        // Total Students
        db.query("SELECT COUNT(*) AS totalStudents FROM users WHERE role='student'", (err, result) => {
          if (err) return res.send(err);
          stats.totalStudents = result[0].totalStudents;

          res.send(stats);
        });
      });
    });
  });
});

app.listen(3001, () => console.log("Server running on port 3001 🚀"));