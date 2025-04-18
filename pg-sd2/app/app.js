// Import express.js
const express = require("express");

// Create express app
var app = express();

// Add static files location
app.use(express.static("static"));

// Get the functions in the db.js file to use
const db = require('./services/db');

// Create a route for root - /
app.get("/", function(req, res) {
    res.send("Hello world!");
});

// Create a route for testing the db
app.get("/db_test", function(req, res) {
    // Assumes a table called test_table exists in your database
    sql = 'select * from test_table';
    db.query(sql).then(results => {
        console.log(results);
        res.send(results);
    });
});

// Create a route for /students
app.get("/students", async function(req, res) {
    try {
        // Query to get all students
        const sql = 'SELECT * FROM Students';
        const results = await db.query(sql);
        
        // Return the results as JSON
        res.json(results);
    } catch (err) {
        console.error("Error fetching students:", err);
        res.status(500).send("Error fetching students");
    }
});

// Create a route for /students-html (HTML formatted output)
app.get("/students-html", async function(req, res) {
    try {
        // Query to get all students
        const sql = 'SELECT * FROM Students';
        const students = await db.query(sql);
        
        // Build HTML for table
        let html = '<html><head><title>Students List</title>';
        html += '<style>table { border-collapse: collapse; width: 100%; }';
        html += 'th, td { text-align: left; padding: 8px; }';
        html += 'tr:nth-child(even) { background-color: #f2f2f2; }';
        html += 'th { background-color: #4CAF50; color: white; }</style></head>';
        html += '<body><h1>Students List</h1>';
        html += '<table><tr><th>ID</th><th>Name</th><th>Details</th></tr>';
        
        // Add each student to the table
        students.forEach(student => {
            html += `<tr><td>${student.id}</td><td>${student.name}</td>`;
            html += `<td><a href="/student/${student.id}">View Details</a></td></tr>`;
        });
        
        html += '</table></body></html>';
        res.send(html);
    } catch (err) {
        console.error("Error fetching students:", err);
        res.status(500).send("Error fetching students");
    }
});

// Create a route for single student
app.get("/student/:id", async function(req, res) {
    try {
        // Get the student ID from the URL parameter
        const studentId = req.params.id;
        
        // Query to get student information
        const studentSql = 'SELECT * FROM Students WHERE id = ?';
        const students = await db.query(studentSql, [studentId]);
        
        if (students.length === 0) {
            return res.status(404).send("Student not found");
        }
        
        const student = students[0];
        
        // Query to get programme information for this student
        const programmeSql = `
            SELECT p.id, p.name 
            FROM Programmes p
            JOIN Student_Programme sp ON p.id = sp.programme
            WHERE sp.id = ?
        `;
        const programmes = await db.query(programmeSql, [studentId]);
        
        // Query to get modules for this student's programme
        let modules = [];
        if (programmes.length > 0) {
            const programmeId = programmes[0].id;
            const modulesSql = `
                SELECT m.code, m.name
                FROM Modules m
                JOIN Programme_Modules pm ON m.code = pm.module
                WHERE pm.programme = ?
            `;
            modules = await db.query(modulesSql, [programmeId]);
        }
        
        // Build HTML response
        let html = '<html><head><title>Student Details</title>';
        html += '<style>body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }';
        html += 'h1, h2 { color: #333; }';
        html += 'table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }';
        html += 'th, td { text-align: left; padding: 8px; border: 1px solid #ddd; }';
        html += 'th { background-color: #f2f2f2; }';
        html += '.back-link { margin-top: 20px; }</style></head>';
        html += '<body>';
        html += `<h1>Student: ${student.name}</h1>`;
        
        // Programme information
        html += '<h2>Programme</h2>';
        if (programmes.length > 0) {
            html += `<p>${programmes[0].name} (${programmes[0].id})</p>`;
        } else {
            html += '<p>No programme assigned</p>';
        }
        
        // Modules information
        html += '<h2>Modules</h2>';
        if (modules.length > 0) {
            html += '<table><tr><th>Code</th><th>Name</th></tr>';
            modules.forEach(module => {
                html += `<tr><td>${module.code}</td><td>${module.name}</td></tr>`;
            });
            html += '</table>';
        } else {
            html += '<p>No modules found</p>';
        }
        
        html += '<div class="back-link"><a href="/students-html">Back to all students</a></div>';
        html += '</body></html>';
        
        res.send(html);
    } catch (err) {
        console.error("Error fetching student details:", err);
        res.status(500).send("Error fetching student details");
    }
});

// Create a route for /programmes (JSON)
app.get("/programmes", async function(req, res) {
    try {
        // Query to get all programmes
        const sql = 'SELECT * FROM Programmes';
        const results = await db.query(sql);
        
        // Return the results as JSON
        res.json(results);
    } catch (err) {
        console.error("Error fetching programmes:", err);
        res.status(500).send("Error fetching programmes");
    }
});

// Create a route for /programmes-html (HTML formatted output)
app.get("/programmes-html", async function(req, res) {
    try {
        // Query to get all programmes
        const sql = 'SELECT * FROM Programmes';
        const programmes = await db.query(sql);
        
        // Build HTML for table
        let html = '<html><head><title>Programmes List</title>';
        html += '<style>table { border-collapse: collapse; width: 100%; }';
        html += 'th, td { text-align: left; padding: 8px; }';
        html += 'tr:nth-child(even) { background-color: #f2f2f2; }';
        html += 'th { background-color: #4CAF50; color: white; }</style></head>';
        html += '<body><h1>Programmes List</h1>';
        html += '<table><tr><th>ID</th><th>Name</th><th>Details</th></tr>';
        
        // Add each programme to the table
        programmes.forEach(programme => {
            html += `<tr><td>${programme.id}</td><td>${programme.name}</td>`;
            html += `<td><a href="/programme/${programme.id}">View Details</a></td></tr>`;
        });
        
        html += '</table></body></html>';
        res.send(html);
    } catch (err) {
        console.error("Error fetching programmes:", err);
        res.status(500).send("Error fetching programmes");
    }
});

// Create a route for single programme
app.get("/programme/:id", async function(req, res) {
    try {
        // Get the programme ID from the URL parameter
        const programmeId = req.params.id;
        
        // Query to get programme information
        const programmeSql = 'SELECT * FROM Programmes WHERE id = ?';
        const programmes = await db.query(programmeSql, [programmeId]);
        
        if (programmes.length === 0) {
            return res.status(404).send("Programme not found");
        }
        
        const programme = programmes[0];
        
        // Query to get modules for this programme
        const modulesSql = `
            SELECT m.code, m.name
            FROM Modules m
            JOIN Programme_Modules pm ON m.code = pm.module
            WHERE pm.programme = ?
        `;
        const modules = await db.query(modulesSql, [programmeId]);
        
        // Build HTML response
        let html = '<html><head><title>Programme Details</title>';
        html += '<style>body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }';
        html += 'h1, h2 { color: #333; }';
        html += 'table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }';
        html += 'th, td { text-align: left; padding: 8px; border: 1px solid #ddd; }';
        html += 'th { background-color: #f2f2f2; }';
        html += '.back-link { margin-top: 20px; }</style></head>';
        html += '<body>';
        html += `<h1>Programme: ${programme.name}</h1>`;
        
        // Modules information
        html += '<h2>Modules</h2>';
        if (modules.length > 0) {
            html += '<table><tr><th>Code</th><th>Name</th></tr>';
            modules.forEach(module => {
                html += `<tr><td>${module.code}</td><td>${module.name}</td></tr>`;
            });
            html += '</table>';
        } else {
            html += '<p>No modules found</p>';
        }
        
        html += '<div class="back-link"><a href="/programmes-html">Back to all programmes</a></div>';
        html += '</body></html>';
        
        res.send(html);
    } catch (err) {
        console.error("Error fetching programme details:", err);
        res.status(500).send("Error fetching programme details");
    }
});

// Create a route for /modules (JSON)
app.get("/modules", async function(req, res) {
    try {
        // Query to get all modules
        const sql = 'SELECT * FROM Modules';
        const results = await db.query(sql);
        
        // Return the results as JSON
        res.json(results);
    } catch (err) {
        console.error("Error fetching modules:", err);
        res.status(500).send("Error fetching modules");
    }
});

// Create a route for /modules-html (HTML formatted output)
app.get("/modules-html", async function(req, res) {
    try {
        // Query to get all modules
        const sql = 'SELECT * FROM Modules';
        const modules = await db.query(sql);
        
        // Build HTML for table
        let html = '<html><head><title>Modules List</title>';
        html += '<style>table { border-collapse: collapse; width: 100%; }';
        html += 'th, td { text-align: left; padding: 8px; }';
        html += 'tr:nth-child(even) { background-color: #f2f2f2; }';
        html += 'th { background-color: #4CAF50; color: white; }</style></head>';
        html += '<body><h1>Modules List</h1>';
        html += '<table><tr><th>Code</th><th>Name</th><th>Details</th></tr>';
        
        // Add each module to the table
        modules.forEach(module => {
            html += `<tr><td>${module.code}</td><td>${module.name}</td>`;
            html += `<td><a href="/module/${module.code}">View Details</a></td></tr>`;
        });
        
        html += '</table></body></html>';
        res.send(html);
    } catch (err) {
        console.error("Error fetching modules:", err);
        res.status(500).send("Error fetching modules");
    }
});

// Create a route for single module
app.get("/module/:code", async function(req, res) {
    try {
        // Get the module code from the URL parameter
        const moduleCode = req.params.code;
        
        // Query to get module information
        const moduleSql = 'SELECT * FROM Modules WHERE code = ?';
        const modules = await db.query(moduleSql, [moduleCode]);
        
        if (modules.length === 0) {
            return res.status(404).send("Module not found");
        }
        
        const module = modules[0];
        
        // Query to get programmes for this module
        const programmesSql = `
            SELECT p.id, p.name
            FROM Programmes p
            JOIN Programme_Modules pm ON p.id = pm.programme
            WHERE pm.module = ?
        `;
        const programmes = await db.query(programmesSql, [moduleCode]);
        
        // Query to get students for this module through their programmes
        const studentsSql = `
            SELECT DISTINCT s.id, s.name
            FROM Students s
            JOIN Student_Programme sp ON s.id = sp.id
            JOIN Programme_Modules pm ON sp.programme = pm.programme
            WHERE pm.module = ?
        `;
        const students = await db.query(studentsSql, [moduleCode]);
        
        // Build HTML response
        let html = '<html><head><title>Module Details</title>';
        html += '<style>body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }';
        html += 'h1, h2 { color: #333; }';
        html += 'table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }';
        html += 'th, td { text-align: left; padding: 8px; border: 1px solid #ddd; }';
        html += 'th { background-color: #f2f2f2; }';
        html += '.back-link { margin-top: 20px; }</style></head>';
        html += '<body>';
        html += `<h1>Module: ${module.name} (${module.code})</h1>`;
        
        // Programmes information
        html += '<h2>Programmes</h2>';
        if (programmes.length > 0) {
            html += '<table><tr><th>ID</th><th>Name</th></tr>';
            programmes.forEach(prog => {
                html += `<tr><td>${prog.id}</td><td>${prog.name}</td></tr>`;
            });
            html += '</table>';
        } else {
            html += '<p>No programmes found</p>';
        }
        
        // Students information
        html += '<h2>Students</h2>';
        if (students.length > 0) {
            html += '<table><tr><th>ID</th><th>Name</th></tr>';
            students.forEach(student => {
                html += `<tr><td>${student.id}</td><td>${student.name}</td></tr>`;
            });
            html += '</table>';
        } else {
            html += '<p>No students found</p>';
        }
        
        html += '<div class="back-link"><a href="/modules-html">Back to all modules</a></div>';
        html += '</body></html>';
        
        res.send(html);
    } catch (err) {
        console.error("Error fetching module details:", err);
        res.status(500).send("Error fetching module details");
    }
});

// Create a home page with navigation
app.get("/home", function(req, res) {
    let html = '<html><head><title>Student Management System</title>';
    html += '<style>body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }';
    html += 'h1 { color: #333; }';
    html += '.nav { display: flex; gap: 20px; margin: 20px 0; }';
    html += '.nav a { padding: 10px 15px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }';
    html += '.nav a:hover { background: #45a049; }';
    html += '</style></head>';
    html += '<body>';
    html += '<h1>Student Management System</h1>';
    html += '<div class="nav">';
    html += '<a href="/students-html">Students</a>';
    html += '<a href="/programmes-html">Programmes</a>';
    html += '<a href="/modules-html">Modules</a>';
    html += '</div>';
    html += '<p>Welcome to the Student Management System. Use the navigation links above to browse students, programmes, and modules.</p>';
    html += '</body></html>';
    
    res.send(html);
});

// Start server on port 3000
app.listen(3000, function() {
    console.log(`Server running at http://127.0.0.1:3000/`);
});