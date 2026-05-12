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

function printErrors(errors) {
    let msg = "<ul>";
    errors.forEach((err) => {
        msg += "<li>" + err.msg + "</li>";
    });
    msg += "</ul>";
    return msg;
}

//Route to handle Sign Up form submissions
app.post("/register", [
    check("firstName").trim().notEmpty().withMessage("First name is required").escape(),
    check("lastName").trim().notEmpty().withMessage("Last name is required").escape(),
    check("email").isEmail().withMessage("Invalid email format").normalizeEmail().escape(),
    check("password").isLength({ min: 8 }).withMessage("Password must be 8+ characters").escape(),
    check("mobile").matches(/^05[0-9]{8}$/).withMessage("Mobile number must start with 05 and contain 10 digits").escape(),
    check("gender").notEmpty().withMessage("Gender is required").escape(),
    check("dob").notEmpty().withMessage("Date of birth is required").isDate().withMessage("Invalid date format").escape(),
    check("city").notEmpty().withMessage("City is required").escape(),
    check("nationality").notEmpty().withMessage("Nationality is required").escape(),
    check("bloodType").notEmpty().withMessage("Blood type is required").escape(),
    check("donationCount").notEmpty().withMessage("Donation count info is required").escape(),
    check("availability").notEmpty().withMessage("Availability status is required").escape()
], (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorHtml = 
            "<h1>Sorry, we found validation errors with your submission</h1>" + 
            printErrors(errors.array()) + 
            "<p><a href='register.html'>Click here to return to form</a></p>";
        return res.send(errorHtml); 
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
            return res.send("<h1>Server Error</h1><p>Internal database error. Please try again later.</p><a href='register.html'>Back</a>");
        }

        if (results.length > 0) {
            return res.send("<h1>Registration Error</h1><p>This email is already registered. Please <a href='register.html'>Sign In</a> instead.</p>");
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
                return res.send("<h1>Registration Failed</h1><p>Database insertion failed. Please check your data.</p><a href='register.html'>Back</a>");
            }

            res.send("<h1>Registration Successful!</h1><p>Thank you for joining LifeDrop, " + firstName + "!</p><a href='index.html'>Go to Home Page</a>");
        });
    });
});

//Route to handle Log In form submissions
app.post("/login", [
    check("email").isEmail().withMessage("Invalid email format").normalizeEmail().escape(),
    check("password").notEmpty().withMessage("Password is required").escape()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorHtml = 
            "<h1>Login Failed</h1>" + 
            printErrors(errors.array()) + 
            "<p><a href='register.html'>Try again</a></p>";
        return res.send(errorHtml);
    }
    
    const { email, password } = req.body;
    const checkEmailSql = "SELECT * FROM donors WHERE LOWER(email) = LOWER(?)";

    db.query(checkEmailSql, [email], (err, results) => {
        if (err) {
            console.error("Database Login Error:", err);
            return res.send("<h1>Internal Error</h1><p>Database connection failed.</p><a href='register.html'>Back</a>");
        }

        if (results.length === 0) {
            return res.send("<h1>Login Error</h1><p>This email is not registered. Please <a href='register.html'>create an account</a> first.</p>");
        }
        const user = results[0];
        if (user.password === password) {
            res.send("<h1>Welcome Back, " + user.first_name + "!</h1><p>Login successful.</p><a href='index.html'>Continue to Home Page</a>");
        } else {
            res.send("<h1>Login Error</h1><p>Incorrect password. Please try again.</p><a href='register.html'>Back to Login</a>");
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
    check("email").isEmail().withMessage("Invalid email format").normalizeEmail().escape(),
    check("firstName").trim().notEmpty().withMessage("First name is required").escape(),
    check("lastName").trim().notEmpty().withMessage("Last name is required").escape(),
    check("mobile").matches(/^05[0-9]{8}$/).withMessage("Mobile number must start with 05 and contain 10 digits").escape(),
    check("language").notEmpty().withMessage("Preferred language is required").escape(), 
    check("message").trim().isLength({ min: 10 }).withMessage("Message must be at least 10 characters long").escape()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorHtml = 
            "<h1>Submission Errors</h1>" + 
            printErrors(errors.array()) + 
            "<p><a href='contact.html'>Go back</a></p>";
        return res.send(errorHtml);
    }
    
    const { firstName, lastName, mobile, email, language, message } = req.body;
    const sql = `INSERT INTO messages (first_name, last_name, mobile, email, language, message) VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [firstName, lastName, mobile, email, language, message];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error saving message: ", err);
            return res.send("<h1>Database Error</h1><p>Sorry, we encountered a server error.</p><a href='contact.html'>Try again</a>");
        }
        res.send("<h1>Success!</h1><p>Your message has been sent successfully.</p><a href='index.html'>Return Home</a>");
    });
});



//Route to handle Search submissions
app.get("/search-donors", [
    check("bloodType").notEmpty().withMessage("Please select a blood type to search").escape(),
    check("city").notEmpty().withMessage("Please select a city to search").escape()
], (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorHtml = 
            "<h1>Search Validation Errors</h1>" + 
            printErrors(errors.array()) + 
            "<p><a href='search.html'>Back to Search</a></p>";
        return res.send(errorHtml); 
    }

    const bloodType = req.query.bloodType;
    const city = req.query.city;
    let sql = `SELECT first_name, last_name, email, mobile, blood_type, city FROM donors WHERE 1=1`;
    let params = [];
    if (bloodType) { sql += " AND blood_type = ?"; params.push(bloodType); }
    if (city) { sql += " AND city = ?"; params.push(city); }

    db.query(sql, params, (err, results) => {
        if (err) {
            return res.send("<h1>Database Error</h1><p>Could not perform search.</p><a href='search.html'>Back</a>");
        }
        res.json(results); 
    });
});


const PORT = 4000;
app.listen(PORT, () => {
    console.log(`server on: http://localhost:${PORT}`);
});

