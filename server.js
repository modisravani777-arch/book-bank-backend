const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Book Bank API Running ✅");
});


// -------- LOGIN --------
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email=? AND password=?";
  db.query(sql, [email, password], (err, result) => {
    if (err) return res.status(500).send(err);

    if (result.length > 0) {
      res.send({ status: "success", user: result[0] });
    } else {
      res.send({ status: "error" });
    }
  });
});


// -------- SIGNUP --------
app.post("/signup", (req, res) => {
  const { name, email, password, role } = req.body;

  db.query(
    "INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)",
    [name, email, password, role],
    (err) => {
      if (err) return res.send(err);
      res.send("User Created");
    }
  );
});


// -------- STUDENTS --------
app.get("/users", (req, res) => {
  db.query("SELECT * FROM users WHERE role='student'", (err, result) => {
    if (err) return res.send(err);
    res.send(result);
  });
});

app.post("/add-student", (req, res) => {
  const { name, email, password } = req.body;

  db.query(
    "INSERT INTO users (name,email,password,role) VALUES (?,?,?, 'student')",
    [name, email, password],
    (err) => {
      if (err) return res.send(err);
      res.send("Student Added");
    }
  );
});


// -------- DELETE STUDENT (WITH ID REORDER) --------
app.delete("/delete-student/:id", (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM users WHERE id=?", [id], (err) => {
    if (err) return res.send(err);

    db.query("SET @count = 0");
    db.query("UPDATE users SET id = (@count:=@count+1) ORDER BY id");
    db.query("ALTER TABLE users AUTO_INCREMENT = 1");

    res.send("Student Deleted & IDs Updated");
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

  db.query(
    "INSERT INTO books (title,author,category,quantity,available) VALUES (?,?,?,?,?)",
    [title, author, category, quantity, quantity],
    (err) => {
      if (err) return res.send(err);
      res.send("Book Added");
    }
  );
});


// -------- DELETE BOOK (WITH ID REORDER) --------
app.delete("/delete-book/:id", (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM books WHERE id=?", [id], (err) => {
    if (err) return res.send(err);

    db.query("SET @count = 0");
    db.query("UPDATE books SET id = (@count:=@count+1) ORDER BY id");
    db.query("ALTER TABLE books AUTO_INCREMENT = 1");

    res.send("Book Deleted & IDs Updated");
  });
});


app.put("/update-book/:id", (req, res) => {
  const id = req.params.id;
  const { title, author, category, quantity } = req.body;

  db.query(
    "UPDATE books SET title=?, author=?, category=?, quantity=?, available=? WHERE id=?",
    [title, author, category, quantity, quantity, id],
    (err) => {
      if (err) return res.send(err);
      res.send("Book Updated");
    }
  );
});


// -------- ISSUE BOOK --------
app.post("/issue-book", (req, res) => {
  const { user_id, book_id, due_date } = req.body;

  db.query(
    "INSERT INTO issued_books (user_id, book_id, issue_date, due_date, status) VALUES (?, ?, CURDATE(), ?, 'issued')",
    [user_id, book_id, due_date],
    (err) => {
      if (err) return res.send(err);

      db.query(
        "UPDATE books SET available = available - 1 WHERE id=?",
        [book_id]
      );

      res.send("Book Issued");
    }
  );
});


// -------- RETURN BOOK --------
app.put("/return-book/:id", (req, res) => {
  const id = req.params.id;

  db.query(
    "SELECT book_id FROM issued_books WHERE id=?",
    [id],
    (err, result) => {
      if (err) return res.send(err);

      const bookId = result[0].book_id;

      db.query(
        "UPDATE issued_books SET status='returned', return_date=CURDATE() WHERE id=?",
        [id]
      );

      db.query(
        "UPDATE books SET available = available + 1 WHERE id=?",
        [bookId]
      );

      res.send("Book Returned");
    }
  );
});


// -------- DELETE ISSUED (WITH ID REORDER) --------
app.delete("/delete-issued/:id", (req, res) => {
  const id = req.params.id;

  db.query(
    "SELECT book_id FROM issued_books WHERE id=?",
    [id],
    (err, result) => {
      if (err) return res.send(err);

      const bookId = result[0].book_id;

      db.query(
        "DELETE FROM issued_books WHERE id=?",
        [id],
        (err2) => {
          if (err2) return res.send(err2);

          db.query(
            "UPDATE books SET available = available + 1 WHERE id=?",
            [bookId]
          );

          res.send("Issued Deleted");
        }
      );
    }
  );
});


// -------- GET ISSUED --------
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


// -------- DASHBOARD --------
app.get("/dashboard-stats", (req, res) => {
  const stats = {};

  db.query("SELECT COUNT(*) AS totalBooks FROM books", (err, result) => {
    stats.totalBooks = result[0].totalBooks;

    db.query("SELECT SUM(available) AS availableBooks FROM books", (err, result) => {
      stats.availableBooks = result[0].availableBooks || 0;

      db.query(
        "SELECT COUNT(*) AS issuedBooks FROM issued_books WHERE status='issued'",
        (err, result) => {
          stats.issuedBooks = result[0].issuedBooks;

          db.query(
            "SELECT COUNT(*) AS totalStudents FROM users WHERE role='student'",
            (err, result) => {
              stats.totalStudents = result[0].totalStudents;
              res.send(stats);
            }
          );
        }
      );
    });
  });
});


app.listen(3001, () => console.log("Server running on port 3001 🚀"));