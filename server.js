const express = require('express');
const path = require('path');
const mysql = require('mysql');


// Create a connection object
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'cruddb'
});

// Connect to the database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
        return;
    }
    console.log('Connected to the MySQL database!');
});


const app = express();


// Middleware to parse JSON data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static('public') );



// app.get('/', (req, res) => {
//     res.send('Welcome to the CRUD API!');
// });

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'main.html'));
});

app.get('/users', (req, res) => {
    const query = 'SELECT * FROM data ORDER BY id ASC';

    connection.query(query, (err, result) => {
        if (err) {
            console.error('Error getting data:', err.message);
            res.status(500).json({error:'Error fetching users from the database.'});
            return;
        }
       // console.log('Data fetched successfully:', result);
        res.status(200).json(result);
    });
});

app.get('/users/:id', (req, res) => {
    const { id } = req.params;

    const query = 'SELECT * FROM data WHERE id = ?';
    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).send('Error fetching user');
        }

        if (results.length === 0) {
            return res.status(404).send('User not found');
        }

        res.json(results[0]);
    });
});

// Handle form submission
app.post('/submit-form', (req, res) => {
    const name = req.body.name;
    const number = req.body.number;
    const email = req.body.email;
    const dob = req.body.dob;
    console.log(`Name: ${name}, Number: ${number}, Email: ${email}, DOB: ${dob}`);
    res.json({ message: "Form submitted successfully!" });
});

app.post('/form', (req, res) => {
    const { name, number,email, dob } = req.body;

    console.log('Received data:', name, number , email, dob);

    // Insert data into the database
    const query = 'INSERT INTO data (name, number, email, dob) VALUES (?, ?, ?,?)';
    connection.query(query, [name, number, email, dob], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err.message);
            res.status(500).send('Failed to submit the form.');
            return;
        }
        console.log('Data inserted successfully:', result);
        res.status(200).send('Form submitted successfully!');
    });
});

app.delete('/delete-user/:id', (req, res) => {
    const id = req.params.id;

    let query = `DELETE FROM data WHERE id = ?`;
    connection.query(query, id, (err, result) => {
        if (err) {
            console.error('Error getting data:', err.message);
            res.status(500).send('Error deleting user from the database.');
            return;
        }
        // console.log('Data fetched successfully:', result);
        // res.status(200).json(result);    
    });


    res.status(200).json({ message: 'Item deleted successfully' });
});

app.put('/update-user/:id', (req, res) => {   
    const { id } = req.params; 
    const {name, number,email, dob} = req.body;

    let query = `UPDATE data SET name = ?, number = ?, email = ?, dob = ? WHERE id = ?`

    //console.log("Updating user:", name, number, email, dob, id);

    connection.query(query, [name, number, email, dob, id], (err, result) => {
        if (err) {
            console.error('Error getting data:', err.message);
            res.status(500).send('Error Updating user from the database.');
            return;
        }
        res.status(200).json({ ...result, message: 'Item Updated successfully' });
    });
});

app.listen(4000, () => {
    console.log("Server is running on http://localhost:4000");
});
