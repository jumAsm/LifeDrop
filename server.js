const express = require("express");
const app = express();
const mysql = require("mysql2");
const { check, validationResult } = require("express-validator");

app.use("/", express.static("./website"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "root",
    database: "lifedrop_db",
    port: "3306"
});

db.connect(function (err) {
    if (err) {
        console.error("Cannot connect to database", err);
    } else {
        console.log("Connected to database!");
    }
});


//Route to handle Register form submissions
app.post("/register", [
    check("firstName").trim().notEmpty().withMessage("First name is required").escape(),
    check("lastName").trim().notEmpty().withMessage("Last name is required").escape(),
    check("email").isEmail().withMessage("Invalid email format").normalizeEmail().escape(),
    check("password").isLength({ min: 8 }).withMessage("Password must be 8+ chars").escape(),
    check("mobile").isLength({ min: 10, max: 10 }).isNumeric().escape()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
        email, password, firstName, lastName, gender,
        dob, mobile, city, nationality, bloodType,
        lastDonation, donationCount, availability
    } = req.body;

    const sql = `INSERT INTO donors 
        (email, password, first_name, last_name, gender, dob, mobile, city, nationality, blood_type, last_donation, donation_count, availability) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
        email, password, firstName, lastName, gender,
        dob, mobile, city, nationality, bloodType,
        lastDonation || null, donationCount, availability
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error saving data: ", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }
        res.json({ success: true, message: "New donor added successfully!" });
    });
});

//Route to handle Register form submissions
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    console.log("Login attempt for:", email);
    const sql = "SELECT * FROM donors WHERE email = ? AND password = ?";

    db.query(sql, [email, password], (err, results) => {
        if (err) {
            console.error("Database Login Error:", err);
            return res.status(500).json({ success: false, message: "Internal Database Error" });
        }

        if (results.length > 0) {
            console.log("User found:", results[0].first_name);
            res.json({ success: true, firstName: results[0].first_name });
        } else {
            res.json({ success: false, message: "Invalid email or password" });
        }
    });
});

//Route to handle Contact Us form submissions
app.post("/contact", [
    check("email").isEmail().withMessage("Invalid email").normalizeEmail().escape(),
    check("firstName").trim().notEmpty().withMessage("First name required").escape(),
    check("message").trim().isLength({ min: 10 }).withMessage("Message too short").escape()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { firstName, lastName, gender, mobile, dob, email, language, message } = req.body;

    const sql = `INSERT INTO messages 
        (first_name, last_name, gender, mobile, dob, email, language, message) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [firstName, lastName, gender, mobile, dob, email, language, message];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error saving message: ", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }
        res.json({ success: true, message: "Your message has been sent successfully." });
    });
});

//Route to handle Search submissions
app.get("/search-donors", (req, res) => {
    const { bloodType, city } = req.query;
    let sql = "SELECT first_name, last_name, email, mobile, blood_type, city FROM donors WHERE 1=1";
    let params = [];

    if (bloodType && bloodType !== "") {
        sql += " AND blood_type = ?";
        params.push(bloodType);
    }

    if (city && city !== "") {
        sql += " AND city = ?";
        params.push(city);
    }

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error("Search error: ", err);
            return res.status(500).json({ error: "Database search failed" });
        }
        res.json(results);
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`server on: http://localhost:${PORT}`);
});