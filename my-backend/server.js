const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');





const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'test'
});

db.connect(err => {
  if (err) {
    throw err;
  }
  console.log('MySQL connected...');
});



//Add data to user table 
// Endpoint to handle form submission
app.post('/api/users', (req, res) => {
  const { name, age } = req.body;

  // Insert data into the user table
  const sql = 'INSERT INTO user (Name, Age) VALUES (?, ?)';
  db.query(sql, [name, age], (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).send('Server error');
    }
    res.send('User added...');
  });
});


// Add new order endpoint
app.post('/api/orders', (req, res) => {
  const { CustomerId, ProductId, Quantity,OrderDate, DeliveryDate } = req.body;
  const sql = 'INSERT INTO `Order` (CustomerId, ProductId,Quantity, OrderDate, DeliveryDate) VALUES (?, ?, ?, ?,?)';
  db.query(sql, [CustomerId, ProductId, Quantity,OrderDate, DeliveryDate], (err, result) => {
    if (err) {
      console.error('Error adding order:', err);
      res.status(500).json({ message: 'Error adding order. Please try again.' });
    } else {
      res.status(201).json({ message: 'Order added successfully!' });
    }
  });
});

// Endpoint to get all customers for order table
app.get('/api/customers', (req, res) => {
  const sql = 'SELECT CustomerId, CustomerName FROM Customer';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching customers:', err);
      res.status(500).send('Failed to fetch customers');
      return;
    }
    res.json(results);
  });
});

// Endpoint to get all products for order table
app.get('/api/products', (req, res) => {
  const sql = 'SELECT ProductId, ProductName FROM Product';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching products:', err);
      res.status(500).send('Failed to fetch products');
      return;
    }
    res.json(results);
  });
});



// Fetch details for a specific premade product
app.get('/api/premade_products/:productId', (req, res) => {
  const productId = parseInt(req.params.productId);
  const sql = 'SELECT * FROM premadeproduct WHERE ProductId = ?';

  db.query(sql, [productId], (err, results) => {
    if (err) {
      console.error('Error fetching premade product details:', err);
      res.status(500).json({ message: 'Error fetching premade product details' });
    } else {
      res.json(results);
    }
  });
});

app.get('/api/orders', (req, res) => {
  const query = 'SELECT * FROM `order`'; // Use backticks to avoid conflict with reserved keywords
  db.query(query, (error, results) => {
    if (error) {
      console.error('There was an error fetching the orders!', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    } else {
      res.json(results);
    }
  });
});

app.get('/api/premade_products', (req, res) => {
  const query = 'SELECT * FROM `premadeproduct`'; // Use backticks to avoid conflict with reserved keywords
  db.query(query, (error, results) => {
    if (error) {
      console.error('There was an error fetching the orders!', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    } else {
      res.json(results);
    }
  });
});




// Route to add a new customer
app.post('/api/customers', (req, res) => {
  const { CustomerName, CustomerAddress, CustomerPhoneNumber, CustomerEmail, CustomerWebsite } = req.body;
  const query = `
    INSERT INTO Customer (CustomerName, CustomerAddress, CustomerPhoneNumber, CustomerEmail, CustomerWebsite)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(query, [CustomerName, CustomerAddress, CustomerPhoneNumber, CustomerEmail, CustomerWebsite], (err, results) => {
    if (err) {
      console.error('Error inserting customer data:', err);
      res.status(500).send('Error inserting customer data');
      return;
    }
    res.status(200).json({ message: 'Customer added successfully!', customerId: results.insertId });
  });
});

// Route to add a new product category
app.post('/api/product-categories', (req, res) => {
  const { CategoryName } = req.body;
  const query = `
    INSERT INTO ProductCategory (CategoryName)
    VALUES (?)
  `;

  db.query(query, [CategoryName], (err, results) => {
    if (err) {
      console.error('Error inserting product category data:', err);
      res.status(500).send('Error inserting product category data');
      return;
    }
    res.status(200).json({ message: 'Product category added successfully!', productCategoryId: results.insertId });
  });
});

// Endpoint to get product categories
app.get('/api/product-categories', (req, res) => {
  db.query('SELECT * FROM ProductCategory', (err, results) => {
      if (err) {
          console.error('Error fetching product categories:', err);
          res.status(500).json({ message: 'Error fetching product categories' });
      } else {
          res.json(results);
      }
  });
});

// Add new product endpoint
app.post('/api/product', (req, res) => {
  const { ProductName, ProductCategoryId } = req.body;
  const sql = 'INSERT INTO Product (ProductName, ProductCategoryId) VALUES (?, ?)';
  db.query(sql, [ProductName, ProductCategoryId], (err, result) => {
      if (err) {
          console.error('Error adding product:', err);
          res.status(500).json({ message: 'Error adding product. Please try again.' });
      } else {
          res.status(201).json({ message: 'Product added successfully!' });
      }
  });
});

// Fetch details for a specific premade product
app.get('/api/premade_product_details/:id', (req, res) => {
  const premadeProductId = parseInt(req.params.id);
  const sql = 'SELECT * FROM PremadeProductDetails WHERE PremadeProductId = ?';

  db.query(sql, [premadeProductId], (err, results) => {
    if (err) {
      console.error('Error fetching premade product details:', err);
      res.status(500).json({ message: 'Error fetching premade product details' });
    } else {
      res.json(results);
    }
  });
});

app.get('/api/premadeproductdetails/:premadeProductId', (req, res) => {
  const premadeProductId = parseInt(req.params.premadeProductId);
  console.log('Received premadeProductId:', premadeProductId); // Log the received parameter

  const sql = 'SELECT * FROM premadeproductdetails WHERE PremadeProductId = ?';
  console.log('Executing query:', sql, [premadeProductId]); // Log the full query
  db.query(sql, [premadeProductId], (err, results) => {
    if (err) {
      console.error('Error fetching product details:', err);
      res.status(500).json({ message: 'Error fetching product details' });
    } else {
      console.log('Fetched Product Details:', results); // Log the fetched details
      res.json(results);
    }
  });
});



// API endpoint to get all materials
app.get('/api/materials', (req, res) => {
  const sql = 'SELECT * FROM Material';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching materials:', err);
      res.status(500).json({ message: 'Error fetching materials' });
    } else {
      //console.log('Fetched Materials:', results); // Add this line to log the fetched materials
      res.json(results);
    }
  });
});


// API endpoint to update an existing order with a selected PremadeProductId
app.put('/api/orders/:orderId', (req, res) => {
  const { orderId } = req.params;
  const { premadeProductId } = req.body;

  if (!orderId || !premadeProductId) {
    return res.status(400).json({ message: 'orderId and PremadeProductId are required' });
  }

  const sql = 'UPDATE `order` SET PremadeProductId = ?, Action = "Stock Department" WHERE OrderId = ?';
  db.query(sql, [premadeProductId, orderId], (err, results) => {
    if (err) {
      console.error('Error updating order:', err);
      return res.status(500).json({ message: 'Error updating order' });
    } else {
      return res.status(200).json({ message: 'Order updated successfully' });
    }
  });
});


// Add PremadeProduct
app.post('/api/premadeproduct', (req, res) => {
  const { name,productId } = req.body;
  
  const query = 'INSERT INTO premadeproduct (Name,ProductId) VALUES (?,?)';
  db.query(query, [name,productId], (err, results) => {
    if (err) {
      console.error('Error adding premade product:', err);
      res.status(500).send('Server error');
    } else {
      res.json({ id: results.insertId });
    }
  });
});

// Add PremadeProductDetails
app.post('/api/premadeproductdetails', (req, res) => {
  const { materialId, quantity, unitPrice, totalPrice, premadeProductId } = req.body;
  const query = 'INSERT INTO premadeproductdetails (MaterialId, Quantity, UnitPrice, TotalPrice, PremadeProductId) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [materialId, quantity, unitPrice, totalPrice, premadeProductId], (err, results) => {
    if (err) {
      console.error('Error adding premade product details:', err);
      res.status(500).send('Server error');
    } else {
      res.json({ id: results.insertId });
    }
  });
});




// Fetch details for a specific order
app.get('/api/order/:orderId', (req, res) => {
  const orderId = parseInt(req.params.orderId, 10);

  if (isNaN(orderId)) {
    return res.status(400).json({ message: 'Invalid Order ID' });
  }

  // Use backticks around `order`
  const sql = `
    SELECT 
      o.OrderId,
      c.CustomerName,
      p.ProductName,
      o.Quantity,
      o.OrderDate,
      o.DeliveryDate
    FROM 
      \`order\` o
    INNER JOIN 
      Customer c ON o.CustomerId = c.CustomerId
    INNER JOIN 
      Product p ON o.ProductId = p.ProductId
    WHERE 
      o.OrderId = ?
  `;

  db.query(sql, [orderId], (err, results) => {
    if (err) {
      console.error('Error fetching order details:', err);
      res.status(500).json({ message: 'Error fetching order details' });
    } else {
      res.json(results);
    }
  });
});

app.get('/api/order_materials/:orderId', (req, res) => {
  const orderId = parseInt(req.params.orderId);
  const sql = 'SELECT * FROM material WHERE OrderId = ?';

  db.query(sql, [orderId], (err, results) => {
    if (err) {
      console.error('Error fetching premade product details:', err);
      res.status(500).json({ message: 'Error fetching premade product details' });
    } else {
      res.json(results);
    }
  });
});

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage: storage });


//Image upload
app.post('/api/upload', upload.single('image'), (req, res) => {
  const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  const premadeProductId = parseInt(req.body.premadeProductId, 10);

  if (isNaN(premadeProductId)) {
    return res.status(400).json({ message: 'Invalid Premade Product ID' });
  }

  const query = 'INSERT INTO images (ImageUrl, PremadeProductId) VALUES (?, ?)';
  db.query(query, [imageUrl, premadeProductId], (err, results) => {
    if (err) {
      console.error('Error saving image:', err);
      res.status(500).send('Server error');
    } else {
      res.json({ imageUrl });
    }
  });
});
//remove image

app.post('/api/remove-image', (req, res) => {
  const { imageUrl } = req.body;
  const imagePath = path.join(__dirname, 'uploads', path.basename(imageUrl));

  fs.unlink(imagePath, (err) => {
    if (err) {
      console.error('Error removing image:', err);
      res.status(500).send('Server error');
    } else {
      // Optionally, remove the image record from the database
      const query = 'DELETE FROM images WHERE ImageUrl = ?';
      db.query(query, [imageUrl], (err, results) => {
        if (err) {
          console.error('Error deleting image record:', err);
          res.status(500).send('Server error');
        } else {
          res.json({ message: 'Image removed successfully' });
        }
      });
    }
  });
});

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/order-details/:premadeProductId', (req, res) => {
  const orderId = parseInt(req.params.orderId, 10);

  // Validate that premadeProductId is a valid number
  if (isNaN(orderId)) {
    return res.status(400).json({ message: 'Invalid PremadeProductId' });
  }

  const sql = `SELECT * FROM order WHERE orderId = ?`;

  db.query(sql, [orderId], (err, results) => {
    if (err) {
      console.error('Error fetching order details:', err);
      res.status(500).json({ message: 'Error fetching order details' });
    } else {
      res.json(results);
    }
  });
});


app.get('/api/images/:premadeProductId', (req, res) => {
  const { premadeProductId } = req.params;
  const query = 'SELECT * FROM images WHERE PremadeProductId = ?';
  db.query(query, [premadeProductId], (err, results) => {
    if (err) {
      console.error('Error fetching images:', err);
      return res.status(500).send('Server error');
    } else {
      return res.json(results);
    }
  });
})
// Delete material requirement
app.delete('/api/premadeproductdetails/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM premadeproductdetails WHERE ProductSpecificationId = ?';
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error deleting material requirement:', err);
      return res.status(500).json({ message: 'Error deleting material requirement' });
    } else {
      return res.status(200).json({ message: 'Material requirement deleted successfully' });
    }
  });
})

// Fetch orders where action is 'Stock Department'
app.get('/api/orders/stock-department', (req, res) => {
  const sql = 'SELECT * FROM `order` WHERE Action = "Stock Department"';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching orders:', err);
      res.status(500).json({ message: 'Error fetching orders' });
    } else {
      res.json(results);
    }
  });
});

// Backend endpoint to fetch material details for a specific order
app.get('/api/material_details/:orderId', (req, res) => {
  const { orderId } = req.params;
  console.log(orderId);
  const sql = `
    SELECT m.MaterialName, pd.MaterialId,pd.Quantity, pd.UnitPrice, (pd.Quantity * pd.UnitPrice) AS TotalPrice
    FROM PremadeProductDetails pd
    JOIN Material m ON pd.MaterialId = m.MaterialId
    WHERE pd.PremadeProductId = ?;
  `;

  db.query(sql, [orderId], (err, results) => {
    if (err) {
      console.error('Error fetching material details:', err);
      res.status(500).json({ message: 'Error fetching material details' });
    } else {
      res.json(results);
      console.log(results);
    }
  });
});

// API endpoint to update the action field of an order
app.put('/api/orders/:PremadeProductId/action', (req, res) => {
  const { PremadeProductId } = req.params;
  const { action } = req.body;
console.log(PremadeProductId);
console.log(action);
  if (!PremadeProductId || !action) {
      return res.status(400).json({ message: 'Order ID and action are required' });
  }

  const sql = 'UPDATE `order` SET Action = ? WHERE OrderId = ?';
  db.query(sql, ['cutting department', PremadeProductId], (err, results) => {
      if (err) {
          console.error('Error updating order action:', err);
          return res.status(500).json({ message: 'Error updating order action' });
      } else {
          return res.status(200).json({ message: 'Order action updated successfully' });
      }
  });
});

// API endpoint to update stock levels
app.put('/api/stock/:MaterialId', (req, res) => {
  const materialId = req.params.MaterialId; // Change to match the case used in the route
  const { issuedQuantity } = req.body;

  console.log('Issued Quantity:', issuedQuantity);
  console.log('MaterialId:', materialId);

  const sql = 'UPDATE stock SET AvailableQuantity = AvailableQuantity - ?, LastUpdated = NOW() WHERE MaterialId = ?';
  db.query(sql, [issuedQuantity, materialId], (err, results) => { // Also update here
    if (err) {
      console.error('Error updating stock:', err);
      return res.status(500).json({ message: 'Error updating stock' });
    }
    res.status(200).json({ message: 'Stock updated successfully' });
  });
});



// API endpoint to update material records
app.put('/api/material/:materialId', (req, res) => {
  const materialId = req.params.materialId;
  const { issuedQuantity } = req.body;

  const sql = 'UPDATE material SET Quantity = Quantity - ? WHERE MaterialId = ?';
  db.query(sql, [issuedQuantity, materialId], (err, results) => {
    if (err) {
      console.error('Error updating material:', err);
      return res.status(500).json({ message: 'Error updating material' });
    }
    res.status(200).json({ message: 'Material updated successfully' });
  });
});

// API endpoint to get all stock details
app.get('/api/stock', (req, res) => {
  const sql = 'SELECT * FROM stock';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching stock details:', err);
      res.status(500).json({ message: 'Error fetching stock details' });
    } else {
      res.json(results);
    }
  });
});





// Start server...

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});