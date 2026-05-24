
const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// =====================================================
// DATABASE
// =====================================================

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "appec_college"
});

db.connect((err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("MySQL Connected");
    }
});

// =====================================================
// CREATE TABLE
// =====================================================

const studentTable = `
CREATE TABLE IF NOT EXISTS students(
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(100),
    email VARCHAR(100),
    course VARCHAR(100),
    gender VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`;

db.query(studentTable);

// =====================================================
// HOME PAGE
// =====================================================

app.get("/", (req, res) => {

res.send(`

<!DOCTYPE html>
<html>
<head>
<title>APPEC TSS COLLEGE</title>

<style>

*{
    margin:0;
    padding:0;
    box-sizing:border-box;
    font-family:Arial;
}

body{
    background:#f4f6f9;
}

/* NAVBAR */

.navbar{
    background:#002147;
    color:white;
    padding:15px;
    display:flex;
    justify-content:space-between;
    align-items:center;
}

.navbar h1{
    font-size:24px;
}

.navbar a{
    color:white;
    text-decoration:none;
    margin:10px;
}

/* HERO */

.hero{
    background:linear-gradient(rgba(0,0,0,.6),
    rgba(0,0,0,.6)),
    url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1');
    background-size:cover;
    background-position:center;
    height:350px;
    color:white;
    display:flex;
    justify-content:center;
    align-items:center;
    flex-direction:column;
    text-align:center;
}

.hero h2{
    font-size:45px;
}

.hero p{
    margin-top:10px;
    font-size:18px;
}

/* CONTAINER */

.container{
    width:90%;
    margin:auto;
    margin-top:30px;
}

/* CARD */

.card{
    background:white;
    padding:20px;
    border-radius:10px;
    box-shadow:0 0 10px rgba(0,0,0,.1);
    margin-bottom:30px;
}

/* FORM */

input,select{
    width:100%;
    padding:12px;
    margin-top:10px;
    border:1px solid #ccc;
    border-radius:5px;
}

button{
    margin-top:15px;
    padding:12px 20px;
    border:none;
    background:#002147;
    color:white;
    cursor:pointer;
    border-radius:5px;
}

button:hover{
    background:#004080;
}

/* TABLE */

table{
    width:100%;
    border-collapse:collapse;
    margin-top:20px;
}

table th{
    background:#002147;
    color:white;
    padding:12px;
}

table td{
    padding:12px;
    border:1px solid #ddd;
}

/* FOOTER */

.footer{
    background:#002147;
    color:white;
    text-align:center;
    padding:20px;
    margin-top:40px;
}

</style>
</head>

<body>

<!-- NAVIGATION -->

<div class="navbar">

<h1>APPEC TSS COLLEGE</h1>

<div>
<a href="/">Home</a>
<a href="#register">Register</a>
<a href="#students">Students</a>
</div>

</div>

<!-- HERO -->

<div class="hero">

<h2>WELCOME TO APPEC TSS COLLEGE</h2>

<p>Professional College Management System</p>

</div>

<!-- CONTAINER -->

<div class="container">

<!-- REGISTER FORM -->

<div class="card" id="register">

<h2>Student Registration</h2>

<form action="/register" method="POST">

<input
type="text"
name="fullname"
placeholder="Full Name"
required>

<input
type="email"
name="email"
placeholder="Email"
required>

<select name="course">

<option>Software Development</option>
<option>Networking</option>
<option>Accounting</option>
<option>Multimedia</option>

</select>

<select name="gender">

<option>Male</option>
<option>Female</option>

</select>

<button type="submit">
Register Student
</button>

</form>

</div>

<!-- STUDENT TABLE -->

<div class="card" id="students">

<h2>Registered Students</h2>

<table>

<tr>
<th>ID</th>
<th>Full Name</th>
<th>Email</th>
<th>Course</th>
<th>Gender</th>
<th>Action</th>
</tr>

{{students}}

</table>

</div>

</div>

<!-- FOOTER -->

<div class="footer">

<p>
© 2026 APPEC TSS COLLEGE |
All Rights Reserved
</p>

</div>

</body>
</html>

`.replace(
"{{students}}",
generateStudentsTable()
));

});

// =====================================================
// GENERATE STUDENTS TABLE
// =====================================================

function generateStudentsTable(){

    return global.studentsHTML || "";

}

// =====================================================
// LOAD STUDENTS
// =====================================================

app.get("/load", (req,res)=>{

    const sql = "SELECT * FROM students";

    db.query(sql,(err,result)=>{

        let rows = "";

        result.forEach(student=>{

            rows += `
            <tr>

            <td>${student.id}</td>

            <td>${student.fullname}</td>

            <td>${student.email}</td>

            <td>${student.course}</td>

            <td>${student.gender}</td>

            <td>

            <a href="/delete/${student.id}">
            <button>
            Delete
            </button>
            </a>

            </td>

            </tr>
            `;

        });

        global.studentsHTML = rows;

        res.redirect("/");

    });

});

// =====================================================
// REGISTER STUDENT
// =====================================================

app.post("/register",(req,res)=>{

    const {
        fullname,
        email,
        course,
        gender
    } = req.body;

    const sql = `
    INSERT INTO students(
        fullname,
        email,
        course,
        gender
    )
    VALUES(?,?,?,?)
    `;

    db.query(
        sql,
        [
            fullname,
            email,
            course,
            gender
        ],
        (err,result)=>{

            if(err){
                console.log(err);
            }

            res.redirect("/load");

        }
    );

});

// =====================================================
// DELETE STUDENT
// =====================================================

app.get("/delete/:id",(req,res)=>{

    const sql =
    "DELETE FROM students WHERE id=?";

    db.query(
        sql,
        [req.params.id],
        (err,result)=>{

            if(err){
                console.log(err);
            }

            res.redirect("/load");

        }
    );

});

// =====================================================
// SERVER
// =====================================================

app.listen(3000,()=>{

    console.log(
    "APPEC COLLEGE SYSTEM RUNNING");
    console.log(
    "http://localhost:3000/load");

});
