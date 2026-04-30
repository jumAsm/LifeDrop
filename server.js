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
    check("mobile").isLength({ min: 10, max: 10 }).withMessage("Mobile must be 10 digits").isNumeric().escape()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, mobile, bloodType } = req.body;
    const sql = "INSERT INTO donors (first_name, last_name, email, mobile, blood_type) VALUES (?, ?, ?, ?, ?)";

    db.query(sql, [firstName, lastName, email, mobile, bloodType], (err, result) => {
        if (err) {
            console.error("Error saving data: ", err);
            return res.send("<h1>Sorry, an error occurred during registration.</h1>");
        }
        console.log("New donor added successfully!");
        res.send("<h1>Thank you! You have been successfully registered as a donor.</h1>");
    });
});

//Route to handle Contact Us form submissions
app.post("/contact", [
    check("email").isEmail().normalizeEmail().escape(),
    check("firstName").trim().notEmpty().escape(),
    check("message").trim().isLength({ min: 10 }).escape()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, gender, mobile, dob, email, language, message } = req.body;

    const sql = `INSERT INTO messages 
        (first_name, last_name, gender, mobile, dob, email, language, message) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [firstName, lastName, gender, mobile, dob, email, language, message];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error saving message: ", err);
            return res.status(500).send("<h1>An error occurred while sending your message.</h1>");
        }
        console.log("Contact message saved!");
        res.send("<h1>Thank you! Your message has been sent successfully.</h1>");
    });
});

//Route to handle Search form submissions
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