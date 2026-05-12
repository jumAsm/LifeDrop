const express = require("express");
const app = express();
const mysql = require("mysql2");
const { check, validationResult } = require("express-validator");

app.use("/", express.static("./website"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = mysql.createPool({
    host: "127.0.0.1",
    user: "root",
    password: "root",
    database: "lifedrop_db",
    port: "3306",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

console.log("Database is ready and waiting for requests!");

//Route to handle Sign Up form submissions
app.post("/register", [
    check("firstName").trim().notEmpty().withMessage("First name is required").escape(),
    check("lastName").trim().notEmpty().withMessage("Last name is required").escape(),
    check("email").isEmail().withMessage("Invalid email format").normalizeEmail().escape(),
    check("password").isLength({ min: 8 }).withMessage("Password must be 8+ characters").escape(),
    check("mobile").isLength({ min: 10, max: 10 }).isNumeric().withMessage("Mobile must be 10 digits").escape(),
    check("bloodType").notEmpty().withMessage("Blood type is required").escape()
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

    const checkEmailSql = "SELECT * FROM donors WHERE LOWER(email) = LOWER(?)";
    db.query(checkEmailSql, [email], (err, results) => {
        if (err) {
            console.error("Database Check Error:", err);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }

        if (results.length > 0) {
            return res.json({
                success: false,
                message: "This email is already registered. Please Sign In instead."
            });
        }

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
                console.error("Error saving to database:", err);
                return res.status(500).json({ success: false, message: "Database insertion failed" });
            }

            res.json({
                success: true,
                message: "New hero registered successfully!",
                firstName: firstName
            });
        });
    });
});

//Route to handle Log In form submissions
app.post("/login", [
    check("email").isEmail().withMessage("Invalid email format").normalizeEmail().escape(),
    check("password").notEmpty().withMessage("Password is required").escape()
], (req, res) => {
    const { email, password } = req.body;
    const checkEmailSql = "SELECT * FROM donors WHERE LOWER(email) = LOWER(?)";

    db.query(checkEmailSql, [email], (err, results) => {
        if (err) {
            console.error("Database Login Error:", err);
            return res.status(500).json({ success: false, message: "Internal Database Error" });
        }

        if (results.length === 0) {
            return res.json({
                success: false,
                message: "This email is not registered. Please create an account first."
            });
        }
        const user = results[0];
        if (user.password === password) {
            res.json({ success: true, firstName: user.first_name });
        } else {
            res.json({ success: false, message: "Incorrect password. Please try again." });
        }
    });
});

//Route to handle Accounts 
app.post("/check-email", (req, res) => {
    const { email } = req.body;
    const sql = "SELECT * FROM donors WHERE LOWER(email) = LOWER(?)";
    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Internal error" });
        }
        res.json({ exists: results.length > 0 });
    });
});


//Route to handle Contact Us form submissions
app.post("/contact", [
    check("email").isEmail().normalizeEmail().escape(),
    check("firstName").trim().notEmpty().escape(),
    check("lastName").trim().notEmpty().escape(),
    check("mobile").isLength({ min: 10, max: 10 }).escape(),
    check("message").trim().isLength({ min: 10 }).escape()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { firstName, lastName, mobile, email, language, message } = req.body;
    const sql = `INSERT INTO messages (first_name, last_name, mobile, email, language, message) VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [firstName, lastName, mobile, email, language, message];

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
    const bloodType = req.query.bloodType?.trim();
    const city = req.query.city?.trim();

    let sql = `
        SELECT first_name, last_name, email, mobile, blood_type, city
        FROM donors
        WHERE 1=1
    `;

    let params = [];

    if (bloodType) {
        sql += " AND blood_type = ?";
        params.push(bloodType);
    }

    if (city) {
        sql += " AND city = ?";
        params.push(city);
    }

    console.log("SQL:", sql);
    console.log("PARAMS:", params);

    db.query(sql, params, (err, results) => {

        if (err) {
            console.error(err);
            return res.status(500).json({
                error: "Database search failed"
            });
        }

        console.log("RESULTS:", results);

        res.json(results);
    });
});


const PORT = 4000;
app.listen(PORT, () => {
    console.log(`server on: http://localhost:${PORT}`);
});