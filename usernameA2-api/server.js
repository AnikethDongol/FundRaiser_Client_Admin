const express = require('express');
const bodyParser = require('body-parser');
const connection = require('./db_conn'); 
const cors = require('cors');


const app = express(); 
const port = 3000;

app.use(cors()); 
app.use(bodyParser.json());

// 1. Fix for missing closing bracket
app.get('/', (req, res) => {
  console.log("Hello");
  res.send('Welcome to the Fundraiser API');
});

// 1. GET all active fundraisers WORKING
app.get('/api/fundraisers', (req, res) => {
  const query = `
    SELECT f.*, c.NAME as CATEGORY_NAME 
    FROM FUNDRAISER f 
    JOIN CATEGORY c ON f.CATEGORY_ID = c.CATEGORY_ID 
    WHERE f.ACTIVE = TRUE
  `;
  connection.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// 2. GET all categories WORKING
app.get('/api/categories', (req, res) => {
  const query = 'SELECT * FROM CATEGORY';
  connection.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// API route for searching fundraisers
app.get('/api/search', async (req, res) => {
  const { organizer, city, category } = req.query;

  let query = 'SELECT * FROM fundraisers WHERE 1=1';
  const queryParams = [];

  if (organizer) {
    query += ' AND ORGANIZER LIKE ?';
    queryParams.push(`%${organizer}%`);
  }

  if (city) {
    query += ' AND CITY LIKE ?';
    queryParams.push(`%${city}%`);
  }

  if (category) {
    query += ' AND CATEGORY_ID = ?';
    queryParams.push(category);
  }

  try {
    const [results] = await db.query(query, queryParams);
    if (results.length > 0) {
      res.json(results);
    } else {
      res.json({ message: 'No fundraisers found.' });
    }
  } catch (error) {
    console.error('Error fetching search results:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// GET fundraiser details by ID along with associated donations WORKING
app.get('/api/fundraisers/:id', (req, res) => { 
  const fundraiserId = req.params.id;
  
  const query = `
      SELECT 
          F.FUNDRAISER_ID, 
          F.ORGANIZER, 
          F.CAPTION, 
          F.TARGET_FUNDING, 
          F.CURRENT_FUNDING, 
          F.CITY, 
          F.ACTIVE, 
          C.NAME as CATEGORY_NAME,  -- Corrected to C.NAME
          D.AMOUNT, 
          D.GIVER, 
          D.DATE
      FROM 
          FUNDRAISER F
      LEFT JOIN 
          CATEGORY C ON F.CATEGORY_ID = C.CATEGORY_ID
      LEFT JOIN 
          DONATION D ON F.FUNDRAISER_ID = D.FUNDRAISER_ID
      WHERE 
          F.FUNDRAISER_ID = ?
  `;

  connection.query(query, [fundraiserId], (err, results) => {
      if (err) {
          res.status(500).json({ error: err.message });
          return;
      }

      if (results.length === 0) {
          res.status(404).json({ message: 'Fundraiser not found' });
          return;
      }

      const fundraiserDetails = {
          FUNDRAISER_ID: results[0].FUNDRAISER_ID,
          ORGANIZER: results[0].ORGANIZER,
          CAPTION: results[0].CAPTION,
          TARGET_FUNDING: results[0].TARGET_FUNDING,
          CURRENT_FUNDING: results[0].CURRENT_FUNDING,
          CITY: results[0].CITY,
          ACTIVE: results[0].ACTIVE,
          CATEGORY_NAME: results[0].CATEGORY_NAME,
      };

      const donations = results.map(row => ({
          AMOUNT: row.AMOUNT,
          GIVER: row.GIVER,
          DATE: row.DATE,
      })).filter(donation => donation.AMOUNT !== null); 

      // Return fundraiser details and donations
      res.status(200).json({
          fundraiser: fundraiserDetails,
          donations: donations,
      });
  });
});


// Display donation table 
app.get('/api/donations', (req, res) => {
  const query = 'SELECT * FROM donation';
  
  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    res.json(results);
  });
});


// POST donation for a specific fundraiser
app.post('/api/donations', (req, res) => {
  console.log('Received donation data:', req.body); 

  const { giver, amount, fundraiser_id } = req.body;

  if (!giver || !amount || !fundraiser_id) {
      return res.status(400).json({ message: 'All fields are required.' });
  }

  const query = `
      INSERT INTO DONATION (AMOUNT, GIVER, FUNDRAISER_ID) 
      VALUES (?, ?, ?)
  `;

  connection.query(query, [amount, giver, fundraiser_id], (err, result) => {
      if (err) {
          console.error('Error inserting donation:', err);
          return res.status(500).json({ message: 'Database error' });
      }
      res.status(201).json({ message: 'Donation submitted successfully' });
  });
});


// POST request to add a new fundraiser
app.post('/api/fundraisers', (req, res) => {
  console.log('Received POST request:', req.body); 
  const { organizer, caption, goal, city, category_id } = req.body;

  if (!organizer || !caption || !goal || !city || !category_id) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const query = `
      INSERT INTO FUNDRAISER (ORGANIZER, CAPTION, TARGET_FUNDING, CITY, CATEGORY_ID, ACTIVE) 
      VALUES (?, ?, ?, ?, ?, TRUE)
  `;

  connection.query(query, [organizer, caption, goal, city, category_id], (err, result) => {
    if (err) {
      console.error('Error inserting fundraiser:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    res.status(201).json({ message: 'Fundraiser added successfully', fundraiser_id: result.insertId });
  });
});

// UPDATE the fundraisers
app.put('/api/fundraisers/:id', (req, res) => {
  const id = parseInt(req.params.id);  
  const { caption, target_funding, city, category_id } = req.body;  


  if (caption && target_funding !== undefined && city && category_id) {
      const query = `
          UPDATE FUNDRAISER
          SET CAPTION = ?, TARGET_FUNDING = ?, CITY = ?, CATEGORY_ID = ?
          WHERE FUNDRAISER_ID = ?
      `;
      const values = [caption, target_funding, city, category_id, id];

      console.log('Executing query:', query, 'with values:', values); 

      connection.query(query, values, (error, results) => {
          if (error) {
              return res.status(500).json({ message: 'Database error', error: error.message });
          }

          if (results.affectedRows > 0) {
              return res.json({ message: 'Fundraiser updated successfully' });
          } else {
              return res.status(404).json({ message: 'Fundraiser not found' });
          }
      });
  } else {
      return res.status(400).json({ message: 'Missing required fields' });
  }
});


app.delete('/api/fundraisers/:id', (req, res) => {
  const fundraiserId = req.params.id;

  const deleteQuery = 'DELETE FROM FUNDRAISER WHERE FUNDRAISER_ID = ?'; 
  
  connection.query(deleteQuery, [fundraiserId], (err, result) => { 
      if (err) {
          console.error('Error deleting fundraiser:', err);
          return res.status(500).json({ error: 'Internal server error' });
      }

      if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Fundraiser not found' });
      }

      res.status(200).json({ message: 'Fundraiser deleted successfully' });
  });
});


app.listen(3000, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
