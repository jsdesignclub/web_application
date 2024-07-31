const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Create a connection to the MySQL database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'test'
});

// Connect to the database
db.connect(err => {
  if (err) {
    throw err;
  }
  console.log('MySQL connected...');
});

/* Define a route to handle form submissions
app.post('/api/orders', (req, res) => {
  const order = req.body;

  const sql = 'INSERT INTO orders SET ?';
  db.query(sql, order, (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.send('Order added...');
  });
});
*/
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
